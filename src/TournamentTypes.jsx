import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./styles/tournamentTypes.css";
import bgImage from "./assets/images/bg-tournaments.jpg";

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
    return durations[type.toLowerCase()] || 30 * 60 * 1000;
  };

  const openModal = async (type) => {
    setSelectedType(type);
    setModalOpen(true);

    const snapshot = await getDocs(collection(db, "tournaments"));
    const tournaments = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((t) => t.type?.toLowerCase() === type.toLowerCase());

    const sorted = [...tournaments].sort((a, b) => {
      const order = { waiting: 0, open: 1, closed: 2 };
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      return (a.entryFee || 0) - (b.entryFee || 0);
    });

    setFilteredTournaments(sorted);
  };

  const handleTournamentClick = async (t) => {
    if (!userId) return alert("Usuário não identificado.");

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (!userData) return alert("Usuário não encontrado.");

    const joined = t.players && t.players[userId];
    if (joined) return alert("Você já está nesse torneio.");

    const usdcbalance = userData.usdcbalance || 0;
    const cstbalance = userData.cstbalance || 0;

    if (usdcbalance < t.entryFee || cstbalance < 1000) {
      return alert("Saldo insuficiente para entrar no torneio.");
    }

    // Atualizar saldos
    await updateDoc(userRef, {
      usdcbalance: usdcbalance - t.entryFee,
      cstbalance: cstbalance - 1000,
    });

    // Atualizar jogadores
    const players = { ...(t.players || {}) };
    players[userId] = {
      registeredAt: Timestamp.now(),
      score: 0,
      result: null,
    };

    const isLast = Object.keys(players).length === t.maxPlayers;
    const updateData = { players };

    if (isLast) {
      updateData.startTime = Timestamp.now();
      updateData.endTime = Timestamp.fromDate(
        new Date(Date.now() + getEndTimeMillis(t.type))
      );
    }

    const tournamentRef = doc(db, "tournaments", t.id);
    await updateDoc(tournamentRef, updateData);

    alert("Registro confirmado!");
    openModal(selectedType); // Recarrega lista atualizada
  };

  return (
    <div
      className="tournament-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h2 className="tournament-title emissive-lupin-text">
      Tournament types
      </h2>

      <div className="tournament-grid">
        {types.map((type, index) => (
          <div
            key={index}
            className="tournament-card"
            onClick={() => openModal(type.type)}
          >
            <img src={type.image} alt={type.name} />
            <p>{type.name}</p>
          </div>
        ))}
      </div>

      <button className="close-tournament-button" onClick={onClose}>
      back
      </button>

      {modalOpen && (
        <div className="chart-overlay">
          <div className="chart-card">
            <h2 className="emissive-lupin-text">
              Torneios - {selectedType.toUpperCase()}
            </h2>

            {filteredTournaments.map((t, i) => {
              const joined =
                userId &&
                t.players &&
                Object.prototype.hasOwnProperty.call(t.players, userId);
              const currentCount = t.players
                ? Object.keys(t.players).length
                : 0;

                return (
                  <div
                    key={i}
                    className={`store-item ${t.status} ${joined ? "joined" : ""}`}
                    style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    onClick={async () => {
                      try {
                        const tournamentRef = doc(db, "tournaments", t.id);
                        const userRef = doc(db, "users", userId);
                        const userSnap = await getDoc(userRef);
                        const tournamentSnap = await getDoc(tournamentRef);
                
                        if (!userSnap.exists() || !tournamentSnap.exists()) {
                          alert("Erro ao carregar dados.");
                          return;
                        }
                
                        const userData = userSnap.data();
                        const tournamentData = tournamentSnap.data();
                
                        const entryFee = Number(tournamentData.entryFee || 0);
                        const requiredCST = tournamentData.type === "freeroll" ? 0 : 1000;
                        const userUSDC = Number(userData.balanceUSDT || 0);
                        const userCST = Number(userData.balanceCST || 0);
                
                        if (userUSDC < entryFee) {
                          alert("Saldo USDC insuficiente para entrar no torneio.");
                          return;
                        }
                
                        if (tournamentData.type !== "freeroll" && userCST < requiredCST) {
                          alert("Você precisa de pelo menos 1000 CST para entrar neste torneio.");
                          return;
                        }
                
                        const players = tournamentData.players || {};
                        const updatedPlayers = {
                          ...players,
                          [userId]: {
                            userId,
                            username: userData.username || `Player_${userId.substring(0, 5)}`,
                            score: 0,
                            rank: 0,
                            chips: 1000,
                            entryFeeUSDT: entryFee,
                            entryFeeCST: requiredCST,
                            registeredAt: Timestamp.now(),
                            ...(userData.skin && { skinEquipada: userData.skin }),
                          },
                        };
                
                        const playerCount = Object.keys(updatedPlayers).length;
                        const prizePoolIncrement = entryFee * 0.9;
                
                        const durations = {
                          "3p": 10,
                          "9p": 20,
                          "27p": 30,
                          "81p": 60,
                          "scheduled": 120,
                          "fifty": 15,
                        };
                
                        const updateData = {
                          players: updatedPlayers,
                          prizePool: increment(prizePoolIncrement),
                        };
                
                        if (playerCount === tournamentData.maxPlayers) {
                          const now = new Date();
                          const duration = durations[tournamentData.type] || 10;
                          const endTime = new Date(now.getTime() + duration * 60000);
                
                          updateData.status = "open";
                          updateData.startTime = Timestamp.fromDate(now);
                          updateData.endTime = Timestamp.fromDate(endTime);
                        }
                
                        await updateDoc(userRef, {
                          balanceUSDT: userUSDC - entryFee,
                          ...(tournamentData.type !== "freeroll" && {
                            balanceCST: userCST - requiredCST,
                          }),
                        });
                
                        await updateDoc(tournamentRef, updateData);
                       
                        openModal(selectedType); // recarrega a lista atualizada
                
                      } catch (error) {
                        console.error("Erro ao registrar:", error);
                        
                      }
                    }}
                  >
                    <img src={typeIcons[selectedType]} alt="" style={{ width: 64, height: 64, marginRight: 12 }} />
                    <div style={{ textAlign: "left" }}>
                      <p><strong>NAME:</strong> {t.name}</p>
                      <p><strong>STATUS:</strong> {t.status}</p>
                      <p><strong>PRIZE:</strong> {t.entryFee} USDC</p>
                      <p><strong>PLAYERS:</strong> {currentCount} / {t.maxPlayers}</p>
                      <p><strong>GAIN:</strong> {t.prizePool} USDC</p>
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