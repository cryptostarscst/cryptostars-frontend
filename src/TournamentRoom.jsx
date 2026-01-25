// src/TournamentRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

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

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "tournaments", id), (snap) => {
      if (!snap.exists()) {
        setTournament(null);
        setPlayers([]);
        return;
      }

      const data = { id: snap.id, ...snap.data() };
      setTournament(data);

      const raw = data.players ? Object.entries(data.players) : [];
      const list = raw.map(([uid, p]) => ({
        uid,
        ...p,
        // fallback pra não ficar "undefined"
        username: p?.username || `Player_${String(uid).substring(0, 5)}`,
      }));

      list.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
      setPlayers(list);
    });

    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [id]);

  if (!tournament) {
    return <div style={{ padding: 16, color: "white" }}>Carregando torneio...</div>;
  }

  const status = tournament.status || "waiting";
  const endMs = tournament.endTime?.toMillis?.() ?? null;
  const timeLeft = endMs ? endMs - now : null;

  const me = userId && tournament.players ? tournament.players[userId] : null;
  const myName =
    me?.username || (userId ? `Player_${String(userId).substring(0, 5)}` : "Player");

  // ⚠️ botão de teste (serve só pra validar a sala / ranking ao vivo)
  async function addTestScore() {
    if (!userId) return alert("Usuário não identificado.");
    if (!me) return alert("Você não está registrado nesse torneio.");
    if (status !== "open") return alert("Torneio não está em andamento.");

    const myScore = Number(me.score || 0);
    const newScore = myScore + 10;

    await updateDoc(doc(db, "tournaments", id), {
      [`players.${userId}.score`]: newScore,
      [`players.${userId}.lastActionAt`]: Timestamp.now(),
      // opcional: salvar username no player doc para aparecer bonito
      [`players.${userId}.username`]: myName,
    });
  }

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2 style={{ marginBottom: 8 }}>{tournament.name || "Tournament"}</h2>

      <div style={{ opacity: 0.85, marginBottom: 12 }}>
        <div><b>Status:</b> {status}</div>
        <div><b>EntryFee:</b> {tournament.entryFee ?? 0} USDC</div>
        <div><b>PrizePool:</b> {tournament.prizePool ?? 0} USDC</div>
        <div><b>Players:</b> {players.length}/{tournament.maxPlayers ?? "-"}</div>
        {endMs && <div><b>Tempo restante:</b> {msToClock(timeLeft)}</div>}
      </div>

      {!me ? (
        <div style={{ padding: 12, border: "1px solid #333", borderRadius: 10 }}>
          Você ainda não entrou nesse torneio.
        </div>
      ) : (
        <div style={{ padding: 12, border: "1px solid #333", borderRadius: 10, marginBottom: 16 }}>
          <div><b>Você:</b> {myName}</div>
          <div><b>Seu score:</b> {me.score || 0}</div>

          <button onClick={addTestScore} style={{ marginTop: 10 }}>
            +10 score (teste)
          </button>
        </div>
      )}

      <h3>Leaderboard</h3>
      <div style={{ marginTop: 10 }}>
        {players.map((p, idx) => (
          <div
            key={p.uid || `${idx}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderBottom: "1px solid #222",
            }}
          >
            <div>#{idx + 1} {p.username}</div>
            <div>{p.score || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
