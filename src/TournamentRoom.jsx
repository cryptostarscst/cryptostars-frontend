// src/TournamentRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  runTransaction,
  Timestamp,
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
  const [playersList, setPlayersList] = useState([]);
  const [now, setNow] = useState(Date.now());

  // ✅ usuário ao vivo (saldo etc)
  const [userDoc, setUserDoc] = useState(null);

  // ✅ modal de registro
  const [showJoinModal, setShowJoinModal] = useState(false);

  // busy lock
  const [busy, setBusy] = useState(false);

  // 🔹 ouve torneio
  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "tournaments", id), (snap) => {
      if (!snap.exists()) {
        setTournament(null);
        return;
      }

      const data = { id: snap.id, ...snap.data() };
      setTournament(data);

      const raw = data.players ? Object.entries(data.players) : [];
      const list = raw.map(([uid, p]) => ({
        uid,
        ...p,
        username: p?.username || `Player_${String(uid).substring(0, 5)}`,
      }));
      list.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
      setPlayersList(list);
    });

    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [id]);

  // 🔹 ouve usuário (saldo)
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
        </div>
      </div>
    );
  }

  const status = String(tournament.status || "waiting").toLowerCase();
  const endMs = tournament.endTime?.toMillis?.() ?? null;
  const timeLeft = endMs ? endMs - now : null;

  const entryFee = Number(tournament.entryFee || 0);
  const isFree = String(tournament.type || "").toLowerCase() === "freeroll" || entryFee === 0;
  const requiredCST = isFree ? 0 : 1000;

  const me = userId && tournament.players ? tournament.players[userId] : null;
  const myName =
    me?.username ||
    userDoc?.username ||
    (userId ? `Player_${String(userId).substring(0, 5)}` : "Player");

  // ✅ saldos reais conforme seus prints
  const balanceUSDT = Number(userDoc?.balanceUSDT ?? 0);
  const balanceCST = Number(userDoc?.balanceCST ?? 0);

  const prizePool = Number(tournament.prizePool || 0);
  const maxPlayers = Number(tournament.maxPlayers || 0);
  const currentCount = tournament.players ? Object.keys(tournament.players).length : 0;

  // ✅ auto-abrir tela do jogo quando ficar OPEN e o user estiver registrado
  useEffect(() => {
    const joined = !!me;
    if (status === "open" && joined) {
      navigate(`/tournament/${id}/play`, { replace: true });
    }
  }, [status, me, navigate, id]);

  // ✅ JOIN com prizePool + salvar valores para cancelar certinho
  const joinTournament = async () => {
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

        const curStatus = String(t.status || "waiting").toLowerCase();
        if (curStatus !== "waiting" && curStatus !== "open") {
          throw new Error("Torneio não está disponível.");
        }

        const players = t.players || {};
        if (players[userId]) return; // já está dentro

        const maxP = Number(t.maxPlayers || 0);
        const count = Object.keys(players).length;
        if (maxP > 0 && count >= maxP) throw new Error("Torneio lotado.");

        const fee = Number(t.entryFee || 0);
        const free = String(t.type || "").toLowerCase() === "freeroll" || fee === 0;
        const needCST = free ? 0 : 1000;

        const usdt = Number(u.balanceUSDT ?? 0);
        const cst = Number(u.balanceCST ?? 0);

        if (usdt < fee) throw new Error("Saldo USDC insuficiente.");
        if (needCST > 0 && cst < needCST) throw new Error("Você precisa de 1000 CST.");

        const contribution = fee * 0.9;
        const curPrize = Number(t.prizePool || 0);

        // 1) debita usuário
        tx.update(userRef, {
          balanceUSDT: usdt - fee,
          ...(needCST > 0 ? { balanceCST: cst - needCST } : {}),
        });

        // 2) add player + soma prizePool
        const username = u.username || myName;

        tx.update(tournamentRef, {
          [`players.${userId}`]: {
            userId,
            username,
            registeredAt: Timestamp.now(),
            score: 0,
            rank: 0,
            chips: 1000,
            skinEquipada: u.skin || u.skinEquipada || "usuario_inicial",

            // ✅ salva para cancelar perfeito
            entryFeeUSDT: fee,
            entryFeeCST: needCST,
            prizeContribution: contribution,
          },
          prizePool: curPrize + contribution,
        });

        // 3) se completou, inicia
        const newCount = count + 1;
        if (maxP > 0 && newCount === maxP) {
          const nowTs = Timestamp.now();

          // durations em ms (ajuste se quiser)
          const durations = {
            "3p": 15 * 60 * 1000,
            "9p": 30 * 60 * 1000,
            "27p": 45 * 60 * 1000,
            "81p": 60 * 60 * 1000,
            "massive": 2 * 60 * 60 * 1000,
            "fifty": 90 * 60 * 1000,
            "bigtrader": 120 * 60 * 1000,
            "freeroll": 20 * 60 * 1000,
          };
          const typeKey = String(t.type || "").toLowerCase();
          const dur = durations[typeKey] ?? 30 * 60 * 1000;

          tx.update(tournamentRef, {
            status: "open",
            startTime: nowTs,
            endTime: Timestamp.fromDate(new Date(Date.now() + dur)),
          });
        }
      });

      setShowJoinModal(false);
      // se status virar open, o useEffect vai redirecionar pro /play automaticamente
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erro ao registrar.");
    } finally {
      setBusy(false);
    }
  };

  // ✅ CANCELAR: refund 100% + rollback 90% do prizePool
  const cancelRegistration = async () => {
    if (!userId) return alert("Usuário não identificado.");
    if (!me) return alert("Você não está registrado nesse torneio.");

    if (status !== "waiting") {
      return alert("Você só pode cancelar enquanto o torneio estiver em WAITING.");
    }

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

        const curStatus = String(t.status || "waiting").toLowerCase();
        if (curStatus !== "waiting") {
          throw new Error("Só é possível cancelar enquanto WAITING.");
        }

        const players = t.players || {};
        if (!players[userId]) return;

        const p = players[userId];

        const refundUSDT = Number(p.entryFeeUSDT ?? t.entryFee ?? 0);
        const refundCST = Number(p.entryFeeCST ?? (isFree ? 0 : 1000));
        const contribution = Number(p.prizeContribution ?? refundUSDT * 0.9);

        const curUSDT = Number(u.balanceUSDT ?? 0);
        const curCST = Number(u.balanceCST ?? 0);

        // 1) reembolsa
        tx.update(userRef, {
          balanceUSDT: curUSDT + refundUSDT,
          ...(refundCST > 0 ? { balanceCST: curCST + refundCST } : {}),
        });

        // 2) remove player
        const updatedPlayers = { ...players };
        delete updatedPlayers[userId];

        // 3) rollback prizePool
        const curPrize = Number(t.prizePool || 0);
        const newPrize = Math.max(0, curPrize - contribution);

        tx.update(tournamentRef, {
          players: updatedPlayers,
          prizePool: newPrize,
        });
      });

      // volta pra lista de torneios (ou mantém aqui se preferir)
      // navigate(-1);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erro ao cancelar registro.");
    } finally {
      setBusy(false);
    }
  };

  // ✅ abre modal (só se não estiver inscrito)
  const openJoinModal = () => {
    if (!userId) return alert("Usuário não identificado.");
    if (me) return; // já inscrito
    setShowJoinModal(true);
  };

  const canJoin = status === "waiting" || status === "open";
  const needUSDTOk = balanceUSDT >= entryFee;
  const needCSTOk = requiredCST === 0 || balanceCST >= requiredCST;

  return (
    <div className="tournament-room" style={{ backgroundImage: `url(${bgArena})` }}>
      <div className="tournament-panel">
        <h2>{tournament.name || "Tournament"}</h2>

        <div style={{ opacity: 0.9 }}>
          <div><b>Status:</b> {status}</div>
          <div><b>EntryFee:</b> {entryFee} USDC</div>
          <div><b>CST requerido:</b> {requiredCST}</div>
          <div><b>PrizePool:</b> {prizePool.toFixed(2)} USDC</div>
          <div><b>Players:</b> {currentCount}/{maxPlayers || "-"}</div>
          {endMs && <div><b>Tempo restante:</b> {msToClock(timeLeft)}</div>}
        </div>

        {/* ✅ saldo */}
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #222" }}>
          <div><b>Seu saldo:</b></div>
          <div>USDT: {balanceUSDT.toFixed(2)}</div>
          <div>CST: {balanceCST.toLocaleString()}</div>
        </div>

        {/* ✅ ação principal */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!me ? (
            <button
              className="btn-confirm"
              onClick={openJoinModal}
              disabled={busy || !canJoin}
              title={!canJoin ? "Torneio não disponível" : ""}
            >
              Registrar
            </button>
          ) : (
            <button
              className="btn-cancel"
              onClick={cancelRegistration}
              disabled={busy || status !== "waiting"}
              title={status !== "waiting" ? "Só pode cancelar em WAITING" : ""}
            >
              Cancelar registro
            </button>
          )}

          <button className="btn-cancel" onClick={() => navigate(-1)} disabled={busy}>
            Voltar
          </button>
        </div>
      </div>

      {/* ✅ caixa do jogador */}
      {me && (
        <div className="player-box">
          <p><b>Você:</b> {myName}</p>
          <p><b>Score:</b> {Number(me.score || 0)}</p>
          <p><b>Chips:</b> {Number(me.chips || 0)}</p>
          <p><b>Rank:</b> {Number(me.rank || 0)}</p>
        </div>
      )}

      {/* leaderboard */}
      <div className="tournament-panel">
        <h3>Leaderboard</h3>
        {playersList.map((p, idx) => (
          <div key={p.uid} className="leaderboard-row">
            <span>#{idx + 1} {p.username}</span>
            <span>{Number(p.score || 0)}</span>
          </div>
        ))}
      </div>

      {/* ✅ MODAL REGISTER */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ marginTop: 0, color: "#00ffc3" }}>Confirmar registro?</h3>

            <div style={{ textAlign: "left", marginTop: 14, lineHeight: 1.6 }}>
              <div><b>Torneio:</b> {tournament.name}</div>
              <div><b>EntryFee:</b> {entryFee} USDC</div>
              <div><b>CST requerido:</b> {requiredCST}</div>
              <div><b>Vai para prizePool (90%):</b> {(entryFee * 0.9).toFixed(2)} USDC</div>
              <hr style={{ borderColor: "#222", margin: "12px 0" }} />
              <div><b>Seu saldo:</b></div>
              <div>USDT: {balanceUSDT.toFixed(2)} {needUSDTOk ? "✅" : "❌"}</div>
              <div>CST: {balanceCST.toLocaleString()} {needCSTOk ? "✅" : "❌"}</div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowJoinModal(false)}
                disabled={busy}
              >
                Cancelar
              </button>

              <button
                className="btn-confirm"
                onClick={joinTournament}
                disabled={busy || !needUSDTOk || !needCSTOk}
                title={!needUSDTOk || !needCSTOk ? "Saldo insuficiente" : ""}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
