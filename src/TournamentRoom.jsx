// src/TournamentRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./styles/tournamentRoom.css";

// 🔹 imagem de fundo (troque se quiser)
import bgArena from "./assets/images/bg-tournaments.jpg";

function msToClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function TournamentRoom() {
  const { id } = useParams();
  const userId = useMemo(() => localStorage.getItem("userId"), []);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [now, setNow] = useState(Date.now());

  // 🔹 modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userBalance, setUserBalance] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "tournaments", id), async (snap) => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() };
      setTournament(data);

      const p = data.players ? Object.values(data.players) : [];
      p.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
      setPlayers(p);

      // se ainda não está registrado → buscar saldo
      if (userId && !data.players?.[userId]) {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) {
          setUserBalance(userSnap.data());
          setShowRegisterModal(true);
        }
      }
    });

    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [id, userId]);

  if (!tournament) return <div>Carregando torneio...</div>;

  const status = tournament.status || "waiting";
  const endMs = tournament.endTime?.toMillis?.() ?? null;
  const timeLeft = endMs ? endMs - now : null;

  const me = userId && tournament.players ? tournament.players[userId] : null;

  const entryFee = Number(tournament.entryFee || 0);
  const requiredCST =
    tournament.type === "freeroll" || entryFee === 0 ? 0 : 1000;

  // ⚠️ botão de teste (depois você remove)
  async function addTestScore() {
    if (!me || status !== "open") return;
    await updateDoc(doc(db, "tournaments", id), {
      [`players.${userId}.score`]: Number(me.score || 0) + 10,
      [`players.${userId}.lastActionAt`]: Timestamp.now(),
    });
  }

  return (
    <div
      className="tournament-room"
      style={{ backgroundImage: `url(${bgArena})` }}
    >
      <div className="tournament-panel">
        <h2>{tournament.name}</h2>

        <p>Status: {status}</p>
        <p>Entry Fee: {entryFee} USDC</p>
        <p>Prize Pool: {tournament.prizePool || 0} USDC</p>
        <p>
          Players: {players.length}/{tournament.maxPlayers}
        </p>
        {endMs && <p>Tempo restante: {msToClock(timeLeft)}</p>}
      </div>

      {me && (
        <div className="player-box">
          <p>Você: {me.username}</p>
          <p>Seu score: {me.score || 0}</p>
          <button onClick={addTestScore}>+10 score (teste)</button>
        </div>
      )}

      <h3>Leaderboard</h3>
      {players.map((p, idx) => (
        <div key={p.userId} className="leaderboard-row">
          <span>
            #{idx + 1} {p.username}
          </span>
          <span>{p.score || 0}</span>
        </div>
      ))}

      {/* 🔹 MODAL DE REGISTRO */}
      {showRegisterModal && userBalance && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Confirmar Registro</h2>

            <p><strong>Torneio:</strong> {tournament.name}</p>
            <p><strong>Entry Fee:</strong> {entryFee} USDC</p>
            <p><strong>CST necessário:</strong> {requiredCST}</p>

            <hr />

            <p><strong>Seu saldo:</strong></p>
            <p>USDC: {Number(userBalance.balanceUSDT || 0).toFixed(2)}</p>
            <p>CST: {Number(userBalance.balanceCST || 0).toLocaleString()}</p>

            <div className="modal-actions">
              <button
                className="btn-confirm"
                onClick={() => setShowRegisterModal(false)}
              >
                Confirmar
              </button>

              <button
                className="btn-cancel"
                onClick={() => window.history.back()}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
