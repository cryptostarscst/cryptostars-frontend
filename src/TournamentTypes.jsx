// src/TournamentTypes.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./styles/tournamentTypes.css";
import bgImage from "./assets/images/bg-tournaments.jpg";
import { useNavigate } from "react-router-dom";

// Imagens dos tipos
import icon3p from "./assets/images/3p.png";
import icon9p from "./assets/images/9p.png";
import icon27p from "./assets/images/27p.png";
import icon81p from "./assets/images/81p.png";
import iconMassive from "./assets/images/massive.png";
import iconFifty from "./assets/images/fifty.png";
import iconBigTrader from "./assets/images/bigtrader.png";
import iconFreeroll from "./assets/images/freeroll.png";

const typeIcons = {
  "3p": icon3p,
  "9p": icon9p,
  "27p": icon27p,
  "81p": icon81p,
  "massive": iconMassive,
  "fifty": iconFifty,
  "bigtrader": iconBigTrader,
  "freeroll": iconFreeroll,
};

export default function TournamentTypes({ onClose }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [userId, setUserId] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setUserId(uid);
  }, []);

  const types = [
    { name: "3P", image: icon3p, type: "3p" },
    { name: "9P", image: icon9p, type: "9p" },
    { name: "27P", image: icon27p, type: "27p" },
    { name: "81P", image: icon81p, type: "81p" },
    { name: "Massive", image: iconMassive, type: "massive" },
    { name: "Fifty", image: iconFifty, type: "fifty" },
    { name: "Big Trader", image: iconBigTrader, type: "bigtrader" },
    { name: "Freeroll", image: iconFreeroll, type: "freeroll" },
  ];

  const getEndTimeMillis = (type) => {
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
    return durations[String(type || "").toLowerCase()] || 30 * 60 * 1000;
  };

  const openModal = async (type) => {
    setSelectedType(type);
    setModalOpen(true);

    const snapshot = await getDocs(collection(db, "tournaments"));
    const tournaments = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((t) => (t.type || "").toLowerCase() === type.toLowerCase());

    const sorted = [...tournaments].sort((a, b) => {
      const order = { waiting: 0, open: 1, closed: 2, finished: 3 };
      const sa = (a.status || "waiting").toLowerCase();
      const sb = (b.status || "waiting").toLowerCase();

      if ((order[sa] ?? 99) !== (order[sb] ?? 99)) {
        return (order[sa] ?? 99) - (order[sb] ?? 99);
      }
      return Number(a.entryFee || 0) - Number(b.entryFee || 0);
    });

    setFilteredTournaments(sorted);
  };

  /**
   * Join seguro via transaction.
   * - debita balanceUSDT / balanceCST
   * - soma 90% do entryFee no prizePool
   * - salva no player entryFeeUSDT/entryFeeCST/prizeContribution
   */
  const joinTournamentSafe = async (tournamentId) => {
    if (!userId) return alert("Usuário não identificado.");
    setLoadingJoin(true);
    const tournamentRef = doc(db, "tournaments", tournamentId);
    const userRef = doc(db, "users", userId);

    try {
      await runTransaction(db, async (tx) => {
        const [tSnap, uSnap] = await Promise.all([tx.get(tournamentRef), tx.get(userRef)]);
        if (!tSnap.exists()) throw new Error("Torneio não existe.");
        if (!uSnap.exists()) throw new Error("Usuário não existe.");

        const t = tSnap.data();
        const u = uSnap.data();

        const status = String(t.status || "waiting").toLowerCase();
        if (status !== "waiting" && status !== "open") throw new Error("Torneio não está disponível.");

        const players = t.players || {};
        if (players[userId]) return; // já entrou

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

        // adiciona player e soma prizePool
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

        // se completar, inicia
        const newCount = count + 1;
        if (maxPlayers > 0 && newCount === maxPlayers) {
          const now = Timestamp.now();
          const end = Timestamp.fromDate(new Date(Date.now() + getEndTimeMillis(t.type)));
          tx.update(tournamentRef, { status: "open", startTime: now, endTime: end });
        }
      });

      // abre a sala depois do join
      navigate(`/tournament/${tournamentId}`);
    } catch (e) {
      console.error("Erro join:", e);
      alert(e?.message || "Erro ao entrar no torneio.");
    } finally {
      setLoadingJoin(false);
      if (selectedType) openModal(selectedType);
    }
  };

  return (
    <div className="tournament-screen" style={{ backgroundImage: `url(${bgImage})` }}>
      <h2 className="tournament-title emissive-lupin-text">type of tournament</h2>

      <div className="tournament-grid">
        {types.map((type, index) => (
          <div key={index} className="tournament-card" onClick={() => openModal(type.type)}>
            <img src={type.image} alt={type.name} />
            <div className="tournament-card-label">{type.name}</div>
          </div>
        ))}
      </div>

      <button className="close-tournament-button" onClick={onClose}>close</button>

      {modalOpen && (
        <div className="chart-overlay">
          <div className="chart-card">
            <h2 className="emissive-lupin-text">Torneios - {selectedType.toUpperCase()}</h2>

            {filteredTournaments.length === 0 && <p>Nenhum torneio disponível para esse tipo.</p>}

            {filteredTournaments.map((t) => {
              const joined = userId && t.players && Object.prototype.hasOwnProperty.call(t.players, userId);
              const currentCount = t.players ? Object.keys(t.players).length : 0;

              return (
                <div key={t.id} className={`store-item ${(t.status || "").toLowerCase()} ${joined ? "joined" : ""}`}>
                  <img src={typeIcons[selectedType]} alt="" style={{ width: 64, height: 64 }} />
                  <div style={{ flex: 1, marginLeft: 12 }}>
                    <p><strong>{t.name}</strong></p>
                    <p>Status: {t.status}</p>
                    <p>EntryFee: {t.entryFee} USDT</p>
                    <p>Players: {currentCount} / {t.maxPlayers}</p>
                    <p>PrizePool: {Number(t.prizePool || 0).toFixed(2)} USDT</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {joined ? (
                      <button className="btn-cancel" onClick={() => navigate(`/tournament/${t.id}`)}>Ir para sala</button>
                    ) : (
                      <button className="btn-confirm" disabled={loadingJoin} onClick={() => joinTournamentSafe(t.id)}>
                        {loadingJoin ? "Entrando..." : "Registrar"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button className="close-chart-button" onClick={() => setModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
