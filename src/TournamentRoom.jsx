// src/TournamentRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, Timestamp, runTransaction } from "firebase/firestore";
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

  // ✅ Ouvindo torneio
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

  // ✅ Ouvindo usuário (saldo)
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

  // ✅ Fundo SEMPRE aparece, mesmo carregando
  if (!tournament) {
    return (
      <div
        className="tournament-room"
        style={{ backgroundImage: `url(${bgArena})` }}
      >
        <div className="tournament-panel">
          <h2>Carregando torneio...</h2>
          <p>Buscando dados no servidor...</p>
          <button className="btn-cancel" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const status = String(tournament.status || "waiting").toLowerCase();
  const endMs = tournament.endTime?.toMillis?.() ?? null;
  const timeLeft = endMs ? endMs - now : null;

  const entryFee = Number(tournament.entryFee || 0);

  const me = userId && tournament.players ? tournament.players[userId] : null;

  const myName =
    me?.username || (userId ? `Player_${String(userId).substring(0, 5)}` : "Player");

  const balanceUSDT = Number(userDoc?.balanceUSDT ?? 0);
  const balanceCST = Number(userDoc?.balanceCST ?? 0);

  // ✅ Cancelar registro (só WAITING) com reembolso + rollback prizePool
  const cancelRegistration = async () => {
    if (!userId) return alert("Usuário não identificado.");
    if (!me) return alert("Você não está registrado nesse torneio.");

    if (status !== "waiting") {
      return alert("Você só pode cancelar enquanto o torneio estiver em WAITING.");
    }

    if (!confirm("Cancelar registro e receber reembolso?")) return;

    setBusy(true);
    try {
      const tournamentRef = doc(db, "tournaments", id);
      const userRef = doc(db, "users", userId);

      await runTransaction(db, async (tx) => {
        const [tSnap, uSnap] = await Promise.all([
          tx.get(tournamentRef),
          tx.get(userRef),
        ]);

        if (!tSnap.exists()) throw new Error("Torneio não existe.");
        if (!uSnap.exists()) throw new Error("Usuário não existe.");

        const t = tSnap.data();
        const u = uSnap.data();

        const curStatus = String(t.status || "waiting").toLowerCase();
        if (curStatus !== "waiting") {
          throw new Error("Só é possível cancelar enquanto o torneio estiver WAITING.");
        }

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

      alert("Registro cancelado e saldo reembolsado!");
      navigate(-1);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erro ao cancelar registro.");
    } finally {
      setBusy(false);
    }
  };

  // ⚠️ teste de score
  async function addTestScore() {
    if (!userId) return;
    if (!me) return alert("Você não está registrado.");
    if (status !== "open") return alert("Torneio não está em andamento.");

    await updateDoc(doc(db, "tournaments", id), {
      [`players.${userId}.score`]: Number(me.score || 0) + 10,
      [`players.${userId}.lastActionAt`]: Timestamp.now(),
      [`players.${userId}.username`]: myName,
    });
  }

  return (
    <div className="tournament-room" style={{ backgroundImage: `url(${bgArena})` }}>
      <div className="tournament-panel">
        <h2>{tournament.name || "Tournament"}</h2>

        <div className="info-grid">
          <div><b>Status:</b> {status}</div>
          <div><b>EntryFee:</b> {entryFee} USDC</div>
          <div><b>PrizePool:</b> {Number(tournament.prizePool || 0).toFixed(2)} USDC</div>
          <div><b>Players:</b> {players.length}/{tournament.maxPlayers ?? "-"}</div>
          {endMs && <div><b>Tempo restante:</b> {msToClock(timeLeft)}</div>}
        </div>

        <div className="balance-box">
          <div className="balance-title">Seu saldo</div>
          <div className="balance-row"><span>USDT</span><span>{balanceUSDT.toFixed(2)}</span></div>
          <div className="balance-row"><span>CST</span><span>{balanceCST.toLocaleString()}</span></div>
        </div>

        {/* ✅ LOBBY DE ESPERA (não fica preto) */}
        {status === "waiting" && (
          <div className="waiting-box">
            <h3>Aguardando iniciar...</h3>
            <p>O servidor ainda não colocou o torneio como <b>open</b>.</p>
            <p>Quando mudar para <b>open</b>, essa tela já vira a sala automaticamente.</p>
            <button className="btn-cancel" onClick={() => navigate(-1)}>Voltar</button>
          </div>
        )}
      </div>

      {me && (
        <div className="player-box">
          <p><b>Você:</b> {myName}</p>
          <p><b>Seu score:</b> {me.score || 0}</p>

          <div className="actions-row">
            <button onClick={addTestScore} disabled={busy || status !== "open"}>
              +10 score (teste)
            </button>

            <button onClick={cancelRegistration} disabled={busy || status !== "waiting"}>
              Cancelar registro
            </button>
          </div>
        </div>
      )}

      <h3 className="leaderboard-title">Leaderboard</h3>
      <div className="leaderboard">
        {players.map((p, idx) => (
          <div key={p.uid || `${idx}`} className="leaderboard-row">
            <span>#{idx + 1} {p.username}</span>
            <span>{p.score || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
