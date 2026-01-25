// src/utils/tournamentJoin.js
import { db } from "../firebaseConfig";
import {
  doc,
  runTransaction,
  Timestamp,
  increment,
} from "firebase/firestore";

/**
 * JOIN seguro: evita race condition e não sobrescreve players.
 * Mantém seu modelo atual: tournaments/{id}.players = { [uid]: {...} }
 */
export async function joinTournamentSafe(tournamentId, userId) {
  if (!userId) throw new Error("Usuário não identificado (userId vazio).");

  const tournamentRef = doc(db, "tournaments", tournamentId);
  const userRef = doc(db, "users", userId);

  await runTransaction(db, async (tx) => {
    const [tSnap, uSnap] = await Promise.all([
      tx.get(tournamentRef),
      tx.get(userRef),
    ]);

    if (!tSnap.exists()) throw new Error("Torneio não existe.");
    if (!uSnap.exists()) throw new Error("Usuário não existe em users/{uid}.");

    const t = tSnap.data();
    const u = uSnap.data();

    const status = String(t.status || "waiting");
    if (status !== "waiting" && status !== "open") {
      throw new Error("Torneio não está disponível para entrar.");
    }

    const players = t.players || {};
    if (players[userId]) {
      // já está dentro
      return;
    }

    const maxPlayers = Number(t.maxPlayers || 0);
    const playerCount = Object.keys(players).length;
    if (maxPlayers > 0 && playerCount >= maxPlayers) {
      throw new Error("Torneio lotado.");
    }

    const entryFee = Number(t.entryFee || 0);
    const requiredCST = String(t.type || "").toLowerCase() === "freeroll" ? 0 : 1000;

    // ✅ PADRÃO usado aqui:
    const userUSDC = Number(u.balanceUSDT ?? 0);
    const userCST = Number(u.balanceCST ?? 0);

    if (userUSDC < entryFee) throw new Error("Saldo USDC insuficiente.");
    if (requiredCST > 0 && userCST < requiredCST) {
      throw new Error("Você precisa de 1000 CST para entrar.");
    }

    // 1) debita usuário
    tx.update(userRef, {
      balanceUSDT: userUSDC - entryFee,
      ...(requiredCST > 0 ? { balanceCST: userCST - requiredCST } : {}),
    });

    // 2) adiciona player SEM sobrescrever o map inteiro
    const username = u.username || `Player_${userId.substring(0, 5)}`;
    const newPlayer = {
      userId,
      username,
      score: 0,
      rank: 0,
      chips: 1000,
      entryFeeUSDT: entryFee,
      entryFeeCST: requiredCST,
      registeredAt: Timestamp.now(),
      ...(u.skin ? { skinEquipada: u.skin } : {}),
    };

    // 3) atualiza prizePool com increment
    tx.update(tournamentRef, {
      [`players.${userId}`]: newPlayer,
      prizePool: increment(entryFee * 0.9),
    });

    // 4) se completou, inicia
    const newCount = playerCount + 1;
    if (maxPlayers > 0 && newCount === maxPlayers) {
      const durations = {
        "3p": 10,
        "9p": 20,
        "27p": 30,
        "81p": 60,
        "scheduled": 120,
        "fifty": 15,
        "massive": 120,
        "bigtrader": 120,
        "freeroll": 20,
      };

      const now = new Date();
      const durationMin = durations[String(t.type || "").toLowerCase()] || 10;
      const end = new Date(now.getTime() + durationMin * 60000);

      tx.update(tournamentRef, {
        status: "open",
        startTime: Timestamp.fromDate(now),
        endTime: Timestamp.fromDate(end),
      });
    }
  });
}
