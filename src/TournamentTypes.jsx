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
   * ✅ JOIN SEGURO (Transaction)
   * - usa campos reais do seu Firestore: balanceUSDT / balanceCST
   * - não sobrescreve players inteiro, escreve só players.{uid}
   * - se completar maxPlayers, seta start/end e status open
   * - depois navega pra sala do torneio
   */
  const joinTournamentSafe = async (tournamentId) => {
    if (!userId) throw new Error("Usuário não identificado.");

    const tournamentRef = doc(db, "tournaments", tournamentId);
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

      const status = String(t.status || "waiting").toLowerCase();
      if (status !== "waiting" && status !== "open") {
        throw new Error("Torneio não está disponível.");
      }

      const players = t.players || {};
      if (players[userId]) {
        // já entrou
        return;
      }

      const maxPlayers = Number(t.maxPlayers || 0);
      const count = Object.keys(players).length;
      if (maxPlayers > 0 && count >= maxPlayers) {
        throw new Error("Torneio lotado.");
      }

      const entryFee = Number(t.entryFee || 0);

      // ✅ regra CST: só não pede CST se for freeroll
      const requiredCST =
        String(t.type || "").toLowerCase() === "freeroll" ? 0 : 1000;

      // ✅ campos reais do usuário (print mostrou balanceUSDT / balanceCST)
      const usdt = Number(u.balanceUSDT ?? 0);
      const cst = Number(u.balanceCST ?? 0);

      if (usdt < entryFee) throw new Error("Saldo USDC insuficiente.");
      if (requiredCST > 0 && cst < requiredCST) {
        throw new Error("Você precisa de 1000 CST.");
      }

      // 1) debita usuário
      tx.update(userRef, {
        balanceUSDT: usdt - entryFee,
        ...(requiredCST > 0 ? { balanceCST: cst - requiredCST } : {}),
      });

      // 2) adiciona player (com username pra leaderboard)
      const username =
        u.username || `Player_${String(userId).substring(0, 5)}`;

      tx.update(tournamentRef, {
        [`players.${userId}`]: {
          userId,
          username,
          registeredAt: Timestamp.now(),
          score: 0,
          result: null,
        },
        // opcional (se você quiser somar prêmio automaticamente):
        // prizePool: Number(t.prizePool || 0) + entryFee * 0.9,
      });

      // 3) se completou, inicia
      const newCount = count + 1;
      if (maxPlayers > 0 && newCount === maxPlayers) {
        const now = Timestamp.now();
        const end = Timestamp.fromDate(
          new Date(Date.now() + getEndTimeMillis(t.type))
        );

        tx.update(tournamentRef, {
          status: "open",
          startTime: now,
          endTime: end,
        });
      }
    });

    // depois da transaction, abre a sala
    navigate(`/tournament/${tournamentId}`);
  };

  const handleTournamentClick = async (t) => {
    try {
      await joinTournamentSafe(t.id);
    } catch (e) {
      console.error("Erro ao entrar:", e);
      alert(e?.message || "Erro ao entrar no torneio.");
    } finally {
      // recarrega lista
      if (selectedType) openModal(selectedType);
    }
  };

  return (
    <div
      className="tournament-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h2 className="tournament-title emissive-lupin-text">
        type of tournament
      </h2>

      <div className="tournament-grid">
        {types.map((type, index) => (
          <div
            key={index}
            className="tournament-card"
            onClick={() => openModal(type.type)}
          >
            <img src={type.image} alt={type.name} />
          </div>
        ))}
      </div>

      <button className="close-tournament-button" onClick={onClose}>
        close
      </button>

      {modalOpen && (
        <div className="chart-overlay">
          <div className="chart-card">
            <h2 className="emissive-lupin-text">
              Torneios - {selectedType.toUpperCase()}
            </h2>

            {filteredTournaments.map((t) => {
              const joined =
                userId &&
                t.players &&
                Object.prototype.hasOwnProperty.call(t.players, userId);

              const currentCount = t.players ? Object.keys(t.players).length : 0;

              return (
                <div
                  key={t.id}
                  className={`store-item ${(t.status || "").toLowerCase()} ${
                    joined ? "joined" : ""
                  }`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleTournamentClick(t)}
                >
                  <img
                    src={typeIcons[selectedType]}
                    alt=""
                    style={{ width: 64, height: 64, marginRight: 12 }}
                  />

                  <div style={{ textAlign: "left" }}>
                    <p>
                      <strong>NAME:</strong> {t.name}
                    </p>
                    <p>
                      <strong>STATUS:</strong> {t.status}
                    </p>
                    <p>
                      <strong>PRIZE:</strong> {t.entryFee} USDC
                    </p>
                    <p>
                      <strong>PLAYERS:</strong> {currentCount} / {t.maxPlayers}
                    </p>
                    <p>
                      <strong>GAIN:</strong> {t.prizePool || 0} USDC
                    </p>
                  </div>
                </div>
              );
            })}

            <button
              className="close-chart-button"
              onClick={() => setModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
