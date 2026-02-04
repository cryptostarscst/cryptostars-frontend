// src/TournamentRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./styles/tournamentRoom.css";
import bgArena from "./assets/images/bg-tournaments.jpg";

function msToClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function TournamentRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = useMemo(() => localStorage.getItem("userId"), []);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [userDoc, setUserDoc] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "tournaments", id), (snap) => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() };
      setTournament(data);

      const raw = data.players ? Object.entries(data.players) : [];
      const list = raw.map(([uid, p]) => ({
        uid,
        ...p,
        username: p?.username || `Player_${String(uid).substring(0, 5)}`,
      }));
      list.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
      setPlayers(list);
    });

    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [id]);

  useEffect(() => {
    if (!userId) return;
    const unsubUser = onSnapshot(doc(db, "users", userId), (snap) => {
      if (!snap.exists()) {
        setUserDoc(null);
        return;
      }
      setUserDoc({ id: snap.id, ...snap.data() });
    });
    return () => unsubUser();
  }, [userId]);

  if (!tournament) {
    return (
      <div className="tournament-room" style={{ backgroundImage: `url(${bgArena})` }}>
        <div className="tournament-panel">
          <h2>Carregando torneio...</h2>
          <button className="btn-cancel" onClick={() => navigate(-1)}>Voltar</button>
        </div>
      </div>
    );
  }

  const status = String(tournament.status || "waiting").toLowerCase();
  const endMs = tournament.endTime?.toMillis?.() ?? null;
  const timeLeft = endMs ? Math.max(0, endMs - now) : null;

  const entryFee = Number(tournament.entryFee || 0);
  const prizePool = Number(tournament.prizePool || 0);

  const me = userId && tournament.players ? tournament.players[userId] : null;
  const myName = me?.username || (userId ? `Player_${String(userId).substring(0, 5)}` : "Player");

  const balanceUSDT = Number(userDoc?.balanceUSDT ?? 0);
  const balanceCST = Number(userDoc?.balanceCST ?? 0);

  // Registrar (mesma lógica: transaction + soma prizePool 90%)
  const register = async () => {
    if (!userId) return alert("Usuário não identificado.");
    setBusy(true);
    try {
      const tournamentRef = doc(db, "tournaments", id);
      const userRef = doc(db, "users", userId);

      await runTransaction(db, async (tx) => {
        const [tSnap, uSnap] = await Promise.all([tx.get(tournamentRef), tx.get(userRef)]);
        if (!tSnap.exists()) throw new Error("Torneio não existe.");
        if (!uSnap.exists()) throw new Error("Usuário não existe.");

        const t = tSnap.data();
        const u = uSnap.data();

        const players = t.players || {};
        if (players[userId]) throw new Error("Você já está registrado.");

        const maxPlayers = Number(t.maxPlayers || 0);
        const count = Object.keys(players).length;
        if (maxPlayers > 0 && count >= maxPlayers) throw new Error("Torneio lotado.");

        const entryFee = Number(t.entryFee || 0);
        const isFree = String(t.type || "").toLowerCase() === "freeroll" || entryFee === 0;
        const requiredCST = isFree ? 0 : 1000;

        const usdt = Number(u.balanceUSDT ?? 0);
        const cst = Number(u.balanceCST ?? 0);
        if (usdt < entryFee) throw new Error("Saldo USDT insuficiente.");
        if (requiredCST > 0 && cst < requiredCST) throw new Error("Você precisa de 1000 CST.");

        const prizeContribution = entryFee * 0.9;
        const currentPrizePool = Number(t.prizePool || 0);

        // debita usuário
        tx.update(userRef, {
          balanceUSDT: usdt - entryFee,
          ...(requiredCST > 0 ? { balanceCST: cst - requiredCST } : {}),
        });

        const username = u.username || `Player_${String(userId).substring(0, 5)}`;

        tx.update(tournamentRef, {
          [`players.${userId}`]: {
            userId,
            username,
            registeredAt: Timestamp.now(),
            score: 0,
            result: null,
            entryFeeUSDT: entryFee,
            entryFeeCST: requiredCST,
            prizeContribution,
            chips: 1000,
          },
          prizePool: currentPrizePool + prizeContribution,
        });
      });

      // stay on room (onSnapshot irá atualizar)
    } catch (e) {
      console.error("Erro registrar:", e);
      alert(e?.message || "Erro ao registrar.");
    } finally {
      setBusy(false);
    }
  };

  // Cancelar (rollback prizePool e reembolso)
  const cancelRegistration = async () => {
    if (!userId) return alert("Usuário não identificado.");
    if (!me) return alert("Você não está registrado.");
    if (status !== "waiting") return alert("Só pode cancelar enquanto WAITING.");

    if (!confirm("Cancelar registro e receber reembolso?")) return;

    setBusy(true);
    try {
      const tournamentRef = doc(db, "tournaments", id);
      const userRef = doc(db, "users", userId);

      await runTransaction(db, async (tx) => {
        const [tSnap, uSnap] = await Promise.all([tx.get(tournamentRef), tx.get(userRef)]);
        if (!tSnap.exists()) throw new Error("Torneio não existe.");
        if (!uSnap.exists()) throw new Error("Usuário não existe.");

        const t = tSnap.data();
        const u = uSnap.data();

        const curPlayers = t.players || {};
        if (!curPlayers[userId]) return;

        const playerData = curPlayers[userId];

        const refundUSDT = Number(playerData.entryFeeUSDT ?? t.entryFee ?? 0);
        const refundCST = Number(playerData.entryFeeCST ?? 0);
        const contribution = Number(playerData.prizeContribution ?? refundUSDT * 0.9);

        const curUSDT = Number(u.balanceUSDT ?? 0);
        const curCST = Number(u.balanceCST ?? 0);

        tx.update(userRef, {
          balanceUSDT: curUSDT + refundUSDT,
          ...(refundCST > 0 ? { balanceCST: curCST + refundCST } : {}),
        });

        const updatedPlayers = { ...curPlayers };
        delete updatedPlayers[userId];

        const currentPrizePool = Number(t.prizePool || 0);
        const newPrizePool = Math.max(0, currentPrizePool - contribution);

        tx.update(tournamentRef, {
          players: updatedPlayers,
          prizePool: newPrizePool,
        });
      });

      // navega para trás (opcional)
      navigate(-1);
    } catch (e) {
      console.error("Erro cancelar:", e);
      alert(e?.message || "Erro ao cancelar registro.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tournament-room full-screen" style={{ backgroundImage: `url(${bgArena})` }}>
      {/* área principal com gráfico + painel à esquerda */}
      <div className="room-grid">
        <div className="chart-area">
          {/* Placeholder do gráfico — aqui vamos integrar a API da Binance depois */}
          <div className="chart-placeholder">
            <div className="chart-header">
              <div className="pair-label">{tournament.instrument || "BTC/USDT"}</div>
              <div className="timer">{timeLeft ? msToClock(timeLeft) : "--:--"}</div>
            </div>

            <div className="chart-canvas">
              {/* Aqui entraremos com o gráfico real (ex: TradingView, lightweight chart, etc.) */}
              <div className="chart-fake">GRÁFICO AQUI (POC)</div>
            </div>

            <div className="chart-controls">
              <div className="side-odds">
                <div className="up-btn">ACIMA</div>
                <div className="down-btn">ABAIXO</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="side-panel">
          <div className="panel-card">
            <h3>{tournament.name}</h3>
            <p>Status: <strong>{status}</strong></p>
            <p>Entry Fee: <strong>{entryFee} USDT</strong></p>
            <p>Prize Pool: <strong>{prizePool.toFixed(2)} USDT</strong></p>
            <p>Players: <strong>{players.length}/{tournament.maxPlayers}</strong></p>

            <div className="balance-block">
              <div>Seu saldo</div>
              <div>USDT: {balanceUSDT.toFixed(2)}</div>
              <div>CST: {balanceCST.toLocaleString()}</div>
            </div>

            <div className="action-buttons">
              {!me ? (
                <button className="btn-confirm" disabled={busy || status === "open" /* allow join in waiting/open as you prefer */} onClick={register}>
                  {busy ? "Processando..." : "Registrar"}
                </button>
              ) : (
                <div>
                  <div>Você está registrado</div>
                  <div>chips: {me.chips ?? 1000}</div>
                  <button className="btn-cancel" disabled={busy || status !== "waiting"} onClick={cancelRegistration}>
                    Cancelar registro
                  </button>
                </div>
              )}

              <button className="btn-secondary" onClick={() => navigate(-1)}>Voltar</button>
            </div>
          </div>
        </aside>
      </div>

      {/* leaderboard embaixo (mobile-first) */}
      <div className="leaderboard-bottom">
        <h4>Leaderboard</h4>
        <div className="leaderboard-list">
          {players.map((p, idx) => (
            <div key={p.uid || idx} className="leaderboard-row">
              <div>#{idx + 1} {p.username}</div>
              <div>{p.score || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
