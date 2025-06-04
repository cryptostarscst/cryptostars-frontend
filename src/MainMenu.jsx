import React, { useEffect, useState } from "react";
 import "./styles/DashboardFuturista.css"; 
 import { doc, getDoc, collection, getDocs, updateDoc, increment, arrayUnion } from "firebase/firestore";
  import { db } from "./firebaseConfig"; 
  import skinDefault from "./assets/skins/usuario_inicial.png"; 
  import skinImages from "./utils/skinImages"; 
  import bg1 from "./assets/images/bg-1.jpg"; 
  import bg2 from "./assets/images/bg-2.jpg";
   import bg3 from "./assets/images/bg-3.jpg";
    import bonusImg from "./assets/images/bonus100k.png"; 
    import progressSound from "./assets/sounds/progress.mp3"; 
    import bonusSound from "./assets/sounds/bonus.mp3";
    import resultadosImg from "./assets/images/resultados.png";
import stakingImg from "./assets/images/staking.png";
import afiliadosImg from "./assets/images/afiliados.png";
import lojaImg from "./assets/images/store.png";
import rankingImg from "./assets/images/ranking.png";
import cstImg from "./assets/images/cst.png";
import { useNavigate } from "react-router-dom";


import ai_strike from "./assets/skins/ai_strike.png";
import circuit_phantom from "./assets/skins/circuit_phantom.png";
import crimson_bot from "./assets/skins/crimson_bot.png";
import cyber_guard from "./assets/skins/cyber_guard.png";
import dark_reaper from "./assets/skins/dark_reaper.png";
import digital_beast from "./assets/skins/digital_beast.png";
import galactic_samurai from "./assets/skins/galactic_samurai.png";
import nano_ninja from "./assets/skins/nano_ninja.png";
import neon_blade from "./assets/skins/neon_blade.png";
import quantum_ghost from "./assets/skins/quantum_ghost.png";
import shadow_knight from "./assets/skins/shadow_knight.png";
import tech_rider from "./assets/skins/tech_rider.png";

// Emojis
import bomb from "./assets/emojis/bomb.png";
import clap from "./assets/emojis/clap.png";
import donkey from "./assets/emojis/donkey.png";
import evil from "./assets/emojis/evil.png";
import fire from "./assets/emojis/fire.png";
import heart from "./assets/emojis/heart.png";
import kiss from "./assets/emojis/kiss.png";
import laugh from "./assets/emojis/laugh.png";
import money from "./assets/emojis/money.png";
import poop from "./assets/emojis/poop.png";
import rocket from "./assets/emojis/rocket.png";
import thumbs from "./assets/emojis/thumbs.png";

import spy_drone from "./assets/weapons/spy_drone.png";
import super_leverage from "./assets/weapons/super_leverage.png";
import iconWithdraw from "./assets/images/withdraw.png";
import iconDeposit from "./assets/images/deposit.png";
import iconTournaments from "./assets/images/tournament.png";
import iconLogout from "./assets/images/logout.png";


import CountUp from "react-countup";
    import {
      LineChart,
      Line,
      XAxis,
      YAxis,
      Tooltip,
      ResponsiveContainer,
      CartesianGrid,
      Legend,
    } from "recharts";
    import axios from "axios";
    import SkinsModal from "./SkinsModal"; // ajuste o caminho conforme necessário
    import { format } from "date-fns";
    

    
    
    

    export default function MainMenu({ playerId, onLogout, onOpenTournamentTypes }) {
   const [userData, setUserData] = useState(null);
    const [playersOnline, setPlayersOnline] = useState(0);
     const [downloads, setDownloads] = useState(0);
      const [totalStakingCST, setTotalStakingCST] = useState(0); 
      const [animationTriggered, setAnimationTriggered] = useState(false);
       const [progress, setProgress] = useState(0); 
       const [showBonusImage, setShowBonusImage] = useState(false);
       const [showChartOverlay, setShowChartOverlay] = useState(false);
const [chartData, setChartData] = useState([]);
const [userStakingTotal, setUserStakingTotal] = useState(0);
const [openTournamentsCount, setOpenTournamentsCount] = useState(0);
const [showOpenTournaments, setShowOpenTournaments] = useState(false);
const [openTournamentsList, setOpenTournamentsList] = useState([]);
const [showPlayersOverlay, setShowPlayersOverlay] = useState(false);
const [displayedPlayers, setDisplayedPlayers] = useState(0);
const [showPerformanceChart, setShowPerformanceChart] = useState(false);
const [performanceChartData, setPerformanceChartData] = useState([]);



const [cryptoPrices, setCryptoPrices] = useState([]);
const [liquidityAmount, setLiquidityAmount] = useState(0);
const [displayedLiquidity, setDisplayedLiquidity] = useState(0);
const [showLiquidityOverlay, setShowLiquidityOverlay] = useState(false);
const [displayedWins, setDisplayedWins] = useState(0);
const [skinWins, setSkinWins] = useState(0);
const [showModal, setShowModal] = useState(false);
const [referralHistory, setReferralHistory] = useState([]);
const [referralBonus, setReferralBonus] = useState(0);
const [showReferralOverlay, setShowReferralOverlay] = useState(false);
const [displayedReferralBonus, setDisplayedReferralBonus] = useState(0);
const [displayedReferralUsers, setDisplayedReferralUsers] = useState(0);
const [referralsCount, setReferralsCount] = useState(0);
const [userStaking, setUserStaking] = useState(0);
const [userStakingReceived, setUserStakingReceived] = useState(0);
const [stakingMilestone, setStakingMilestone] = useState(0);
const [stakingEstimate, setStakingEstimate] = useState(0);
const [showStakingOverlay, setShowStakingOverlay] = useState(false);
const [nextPayoutCountdown, setNextPayoutCountdown] = useState("");
const [showStakingManageModal, setShowStakingManageModal] = useState(false);
const [stakeAmount, setStakeAmount] = useState(0);
const [showBuyOverlay, setShowBuyOverlay] = useState(false);
const [showBuyCSTModal, setShowBuyCSTModal] = useState(false);
const [usdcAmountToBuy, setUsdcAmountToBuy] = useState("");
const [showResultsModal, setShowResultsModal] = useState(false);
const [resultData, setResultData] = useState([]);
const [filter, setFilter] = useState("total");
const [selectedChart, setSelectedChart] = useState("USDT"); // ou "CST"
const [rankingData, setRankingData] = useState([]);
const [showRankingModal, setShowRankingModal] = useState(false);
const [animatedPrizes, setAnimatedPrizes] = useState([]);
const [showCSTMarketModal, setShowCSTMarketModal] = useState(false);
const [showStoreModal, setShowStoreModal] = useState(false);
const [showDepositModal, setShowDepositModal] = useState(false);
const [showWithdrawModal, setShowWithdrawModal] = useState(false);

const [platformWallet] = useState("ExyBm7NjzgmqzD29tvvgrNFZf7MDxdNWiogxWYXeorUE");
const [userWallet, setUserWallet] = useState("");
const [withdrawAmount, setWithdrawAmount] = useState("");
const [withdrawWallet, setWithdrawWallet] = useState("");
const [balance, setBalance] = useState(0);
const [pendingWithdraws, setPendingWithdraws] = useState([]);
const [displayedReferralBonusCount, setDisplayedReferralBonusCount] = useState(0);




const navigate = useNavigate();








const copyWallet = () => {
  navigator.clipboard.writeText(platformWallet);
  alert("Wallet address copied.");
};

const saveWallet = async () => {
  if (!userWallet) return alert("Paste your wallet address first!");
  const userRef = doc(db, "users", playerId);
  await updateDoc(userRef, { walletAddress: userWallet });
  alert("Wallet saved successfully.");
};

const submitWithdraw = async () => {
  const amount = parseFloat(withdrawAmount);
  if (isNaN(amount) || amount < 20) return alert("Minimum is 20 USDC");
  if (amount > balance) return alert("Insufficient balance");
  if (!withdrawWallet.trim()) return alert("Enter wallet address");

  await addDoc(collection(db, "withdrawRequests"), {
    playerId,
    amount,
    walletAddress: withdrawWallet,
    tokenType: "USDC",
    status: "Pending",
    timestamp: new Date(),
  });

  const userRef = doc(db, "users", playerId);
  await updateDoc(userRef, { balanceUSDT: balance - amount });
  alert("Withdrawal requested!");
};









const getSkinLevelInfo = (wins) => {
  if (wins <= 10) return { min: 0, max: 10, reward: 100 };
  if (wins <= 30) return { min: 11, max: 30, reward: 250 };
  if (wins <= 100) return { min: 31, max: 100, reward: 500 };
  if (wins <= 500) return { min: 101, max: 500, reward: 1000 };
  if (wins <= 1000) return { min: 501, max: 1000, reward: 2500 };
  return { min: 1001, max: 2000, reward: 5000 };
};


const skinLevel = getSkinLevelInfo(skinWins);
const skinProgress = Math.min(
  100,
  Math.floor(((skinWins - skinLevel.min) / (skinLevel.max - skinLevel.min)) * 100)
);




useEffect(() => {
  const loadUserWallet = async () => {
    try {
      const userRef = doc(db, "users", playerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.walletAddress) {
          setUserWallet(data.walletAddress);
        }
        if (data.balanceUSDT) {
          setBalance(parseFloat(data.balanceUSDT));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar carteira do usuário:", error);
    }
  };

  loadUserWallet();
}, [playerId]);


useEffect(() => {
  const fetchCryptoPrices = async () => {
    try {
      const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
        params: {
          vs_currency: "usd",
          ids: "bitcoin,ethereum,binancecoin,solana,cardano,dogecoin,avalanche-2,polygon,xrp,litecoin,chainlink,polkadot,shiba-inu,arbitrum,optimism",
          price_change_percentage: "24h",
        },
        headers: {
          "x-cg-api-key": "CG-T9LmnqpATGxMmGQwDmdMPD1i",
        },
      });

      console.log("Resposta da API:", res.data); // DEBUG

      const coinsMap = {
        BTC: "bitcoin",
        ETH: "ethereum",
        BNB: "binancecoin",
        SOL: "solana",
        ADA: "cardano",
        DOGE: "dogecoin",
        AVAX: "avalanche-2",
        MATIC: "polygon",
        XRP: "xrp",
        LTC: "litecoin",
        LINK: "chainlink",
        DOT: "polkadot",
        SHIB: "shiba-inu",
        ARB: "arbitrum",
        OP: "optimism",
      };
      
      const formatted = res.data.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h, // variação de 24h
      }));
      setCryptoPrices(formatted);
    } catch (error) {
      console.error("Erro ao buscar preços:", error); // DEBUG
    }
  };

  fetchCryptoPrices();
  const interval = setInterval(fetchCryptoPrices, 75000);

  return () => clearInterval(interval);
}, []);
 


useEffect(() => {
  const fetchData = async () => {
    try {
      if (!playerId) return;

      const userDoc = await getDoc(doc(db, "users", playerId));
      if (userDoc.exists()) {
        const user = userDoc.data();
        setUserData(user);

        const currentSkin = user.skin || "usuario_inicial";
        const wins = user[`skinsVitorias.${currentSkin}`] ?? 0;
        setSkinWins(wins);
        setReferralBonus(user.referralBonus || 0);
        setReferralHistory(user.referralHistory || []);
        setReferralsCount(user.referredUsers?.length || 0);

        const userStaking = parseFloat(user.stakingCST || 0);
        const userStakingReceived = parseFloat(user.totalReceivedStaking || 0);
        const userStakingLevel = parseInt(user.stakingMilestoneReached || 0);

        setUserStaking(userStaking);
        setUserStakingTotal(userStakingReceived);
        setStakingMilestone(userStakingLevel);

        // Agora que temos o staking do usuário, fazemos o cálculo
        const stakingPoolDoc = await getDoc(doc(db, "staking_pool", "main"));
        const totalPrizeDoc = await getDoc(doc(db, "statistics", "totalPrize"));

        if (stakingPoolDoc.exists() && totalPrizeDoc.exists()) {
          const totalPool = parseFloat(stakingPoolDoc.data().totalPool || 0);
          const totalStakingCST = parseFloat(totalPrizeDoc.data().totalStakingCST || 1); // evita divisão por 0

          const estimated = (userStaking * totalPool) / totalStakingCST;
          setStakingEstimate(estimated);
        }
      }

      const onlineSnapshot = await getDocs(collection(db, "playersOnline"));
      setPlayersOnline(onlineSnapshot.size);

      const liquidityDoc = await getDoc(doc(db, "liquidity_pool", "cstPool"));
      if (liquidityDoc.exists()) {
        const data = liquidityDoc.data();
        setLiquidityAmount(parseFloat(data.totalUSDT || 0));
      }

      // 🔹 Carrega histórico de distribuição do staking
      const distribRef = collection(db, "staking_distribuicoes");
      const distribSnapshot = await getDocs(distribRef);

      const distribData = distribSnapshot.docs
        .map(doc => doc.data())
        .filter(d => d.date && d.valorDistribuido)
        .sort((a, b) => a.date.seconds - b.date.seconds)
        .slice(-7)
        .map(d => ({
          date: new Date(d.date.seconds * 1000).toLocaleDateString("pt-BR"),
          valorDistribuido: parseFloat(d.valorDistribuido),
        }));

      setChartData(distribData);

      const snapshot = await getDocs(collection(db, "tournaments"));
      const open = snapshot.docs
        .filter(doc => doc.data().status === "open")
        .map(doc => ({
          id: doc.id,
          name: doc.data().name || "Sem nome",
          prizePool: doc.data().prizePool || 0,
        }));

      setOpenTournamentsList(open);
      setOpenTournamentsCount(open.length);

      const usersSnapshot = await getDocs(collection(db, "users"));
      setDownloads(usersSnapshot.size);

      const statsDoc = await getDoc(doc(db, "statistics", "totalPrize"));
      if (statsDoc.exists()) {
        const stats = statsDoc.data();
        setTotalStakingCST(parseFloat(stats.totalStakingCST || 0));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  fetchData();
}, [playerId]);

useEffect(() => {
  if (!userData) return;

  const nextMilestone = parseInt(userData.nextMilestone || 1, 10);
const milestoneValue = nextMilestone * 1000000;
const currentStaking = parseInt(userData.stakingCST || 0, 10);
const calculatedPercent = Math.min(100, Math.floor((currentStaking / milestoneValue) * 100));
const finalPercent = userData.animationPending ? 100 : calculatedPercent;

  let current = 0;
  setProgress(0);

  const soundBar = new Audio(progressSound);
  soundBar.play();

  const interval = setInterval(() => {
    current += 2;
    setProgress(Math.min(current, finalPercent));

    if (current >= finalPercent) {
      clearInterval(interval);

      if (userData.animationPending && !animationTriggered) {
        setAnimationTriggered(true);

        setTimeout(() => {
          const soundBonus = new Audio(bonusSound);
          soundBonus.play();
          setShowBonusImage(true);

          const userRef = doc(db, "users", playerId);
          updateDoc(userRef, { animationPending: false });
        }, 800);
      }
    }
  }, 30);
}, [userData]);


useEffect(() => {
  if (!skinWins) return;
  let start = 0;
  const target = skinWins;
  const increment = Math.ceil(target / 30);
  const interval = setInterval(() => {
    start += increment;
    if (start >= target) {
      clearInterval(interval);
      setDisplayedWins(target);
    } else {
      setDisplayedWins(start);
    }
  }, 30);
  return () => clearInterval(interval);
  


  
}, [skinWins]);



useEffect(() => {
  if (showPlayersOverlay) {
    let current = 0;
    const increment = Math.ceil(playersOnline / 40);
    const interval = setInterval(() => {
      current += increment;
      if (current >= playersOnline) {
        clearInterval(interval);
        setDisplayedPlayers(playersOnline);
      } else {
        setDisplayedPlayers(current);
      }
    }, 30);
  }
}, [showPlayersOverlay, playersOnline]);


useEffect(() => {
  let current = 0;
  const increment = Math.max(1, referralBonus / 40);
  const interval = setInterval(() => {
    current += increment;
    if (current >= referralBonus) {
      clearInterval(interval);
      setDisplayedReferralBonus(referralBonus);
    } else {
      setDisplayedReferralBonus(current);
    }
  }, 30);

  return () => clearInterval(interval);
}, [referralBonus]);

// Exibe quantidade de bônus recebidos (baseado no referralHistory)
useEffect(() => {
  let current = 0;
  const target = referralHistory.length;
  const increment = Math.ceil(target / 20);

  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      clearInterval(interval);
      setDisplayedReferralBonusCount(target);
    } else {
      setDisplayedReferralBonusCount(current);
    }
  }, 30);

  return () => clearInterval(interval);
}, [referralHistory]);

// Exibe quantidade de usuários indicados (baseado no referralUsers)
useEffect(() => {
  let current = 0;
  const target = referralsCount; // Correto aqui
  const increment = Math.ceil(target / 30);

  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      clearInterval(interval);
      setDisplayedReferralUsers(target);
    } else {
      setDisplayedReferralUsers(current);
    }
  }, 30);

  return () => clearInterval(interval);
}, [referralsCount]);

useEffect(() => {
  const updateCountdown = () => {
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1, // próximo dia
      0, 0, 0
    ));

    const diffMs = nextMidnight - now;
    const hours = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');

    setNextPayoutCountdown(`${hours}:${minutes}:${seconds}`);
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (showLiquidityOverlay) {
    let current = 0;
    const increment = Math.ceil(liquidityAmount / 40);
    const interval = setInterval(() => {
      current += increment;
      if (current >= liquidityAmount) {
        clearInterval(interval);
        setDisplayedLiquidity(liquidityAmount);
      } else {
        setDisplayedLiquidity(current);
      }
    }, 30);
  }
}, [showLiquidityOverlay, liquidityAmount]);

if (!userData) { return ( <div className="dashboard-container">
   <h2>Loading player data...</h2> </div> ); }


const { balanceUSDT = 0, balanceCST = 0, skin = "usuario_inicial" } = userData;



let stakingPercent = 0;
let remainingCST = 1000000;

if (userData) {
  const currentStaking = parseInt(userData.stakingCST || 0, 10);
  const nextMilestone = parseInt(userData.nextMilestone || 1, 10);
  const nextMilestoneValue = nextMilestone * 1000000;

  const stakingToNext = currentStaking;
  const relativeProgress = Math.max(0, Math.min(stakingToNext, nextMilestoneValue));
  
  stakingPercent = Math.floor((relativeProgress / nextMilestoneValue) * 100);
  remainingCST = Math.max(0, nextMilestoneValue - currentStaking);
}

const getStakingColor = (value) => { if (value < 33) return "#ff3333"; if (value < 66) return "#ffff33"; return "#33ff66"; };

const cleanSkin = skin.replace("skin_", ""); const avatarSrc = skinImages[cleanSkin] || skinDefault;

const getLevelName = (wins) => {
  if (wins >= 500) return "Super Legendary";
  if (wins >= 200) return "Legendary";
  if (wins >= 100) return "Epic";
  if (wins >= 30) return "Advanced";
  if (wins >= 10) return "Intermediate";
  return "Standard";
};

const getLevelColor = (wins) => {
  if (wins >= 500) return "#FFD700"; // dourado forte
  if (wins >= 200) return "#FF6B00"; // laranja queimado
  if (wins >= 100) return "#B03EFF"; // roxo épico
  if (wins >= 30) return "#0099FF";  // azul claro
  if (wins >= 10) return "#00FF66";  // verde
  return "#BBBBBB";                  // cinza
};


const formatNumber = (num) =>
  Number(num).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });


  const handleBuyCST = async () => {
    const CST_PER_USDC = 10000; // 1 USDC = 10.000 CST
    const usdcAmount = parseFloat(prompt("Digite o valor em USDC que deseja converter:"));
  
    if (isNaN(usdcAmount) || usdcAmount <= 0) {
      alert("Valor inválido.");
      return;
    }
  
    const userRef = doc(db, "users", playerId);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) {
      alert("Usuário não encontrado.");
      return;
    }
  
    const userData = userSnap.data();
    const currentUSDC = parseFloat(userData.balanceUSDT || 0);
  
    if (currentUSDC < usdcAmount) {
      alert("Saldo USDC insuficiente.");
      return;
    }
  
    const cstToAdd = usdcAmount * CST_PER_USDC;
  
    await updateDoc(userRef, {
      balanceUSDT: currentUSDC - usdcAmount,
      balanceCST: (userData.balanceCST || 0) + cstToAdd,
    });
  
    alert(`Purchase completed successfully! You have received ${cstToAdd.toLocaleString()} CST.`);
  };


  async function loadPrizeHistory(playerId, filter) {
    const colRef = collection(db, "users", playerId, "prizeHistory");
    const snapshot = await getDocs(colRef);
    const raw = [];
  
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.date) {
        raw.push({
          date: data.date.toDate(),
          label: data.date.toDate().toLocaleDateString("pt-BR"),
          netUSDT: (data.prize || 0) - (data.entryFeeUSDT || 0),
          netCST: (data.prizeCST || 0) - (data.entryFeeCST || 0),
        });
      }
    });
  
    // Filtro por período
    const now = new Date();
    const fromDate = new Date();
  
    if (filter === "daily") fromDate.setHours(0, 0, 0, 0);
    else if (filter === "weekly") fromDate.setDate(now.getDate() - 7);
    else if (filter === "monthly") fromDate.setDate(now.getDate() - 30);
  
    const filtered = filter === "total"
      ? raw
      : raw.filter(({ date }) => date >= fromDate);
  
    // Ordena por data e acumula
    let acumuladoUSDT = 0;
    let acumuladoCST = 0;
    const acumulado = filtered
      .sort((a, b) => a.date - b.date)
      .map(({ label, netUSDT, netCST }) => {
        acumuladoUSDT += netUSDT;
        acumuladoCST += netCST;
        return {
          label,
          acumuladoUSDT: parseFloat(acumuladoUSDT.toFixed(2)),
          acumuladoCST: parseFloat(acumuladoCST.toFixed(2)),
        };
      });
  
    setResultData(acumulado);
  }


  const fetchWeeklyRanking = async () => {
    try {
      const [rankingSnapshot, poolDoc] = await Promise.all([
        getDocs(collection(db, "weekly_ranking")),
        getDoc(doc(db, "weekly_pool", "main")),
      ]);
  
      const totalPool = parseFloat(poolDoc.data()?.totalPool || 0);
  
      const players = rankingSnapshot.docs.map((doc) => ({
        id: doc.id,
        totalChips: parseFloat(doc.data().totalChips || 0),
      }));
  
      const sorted = players.sort((a, b) => b.totalChips - a.totalChips);
  
      const distribution = {
        0: totalPool * 0.5, // 1º lugar
        1: totalPool * 0.3, // 2º lugar
        2: totalPool * 0.2, // 3º lugar
      };
  
      const ranked = sorted.map((player, index) => ({
        ...player,
        prize: distribution[index] || 0,
        rank: index + 1,
      }));
  
      setRankingData(ranked);
      startPrizeAnimations(ranked);
      setShowRankingModal(true);
    } catch (error) {
      console.error("Erro ao buscar ranking ou pool:", error);
    }
  };



  const startPrizeAnimations = (data) => {
    const steps = 50;
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff3300", "#33ccff"];
  
    const updated = data.map((player, index) => ({
      ...player,
      animatedPrize: 0,
      colorIndex: 0,
      color: colors[0],
    }));
  
    setAnimatedPrizes(updated);
  
    const interval = setInterval(() => {
      setAnimatedPrizes((prev) =>
        prev.map((p, i) => {
          const target = data[i].prize;
          const newValue = Math.min(p.animatedPrize + target / steps, target);
          const newColorIndex = (p.colorIndex + 1) % colors.length;
          return {
            ...p,
            animatedPrize: newValue,
            colorIndex: newColorIndex,
            color: colors[newColorIndex],
          };
        })
      );
    }, 60);
  
    setTimeout(() => clearInterval(interval), steps * 60);
  };


  const emojiItems = [
    { name: "Bomb", price: 25, img: bomb },
    { name: "Clap", price: 24, img: clap },
    { name: "Donkey", price: 22, img: donkey },
    { name: "Evil", price: 25, img: evil },
    { name: "Fire", price: 20, img: fire },
    { name: "Heart", price: 28, img: heart },
    { name: "Kiss", price: 30, img: kiss },
    { name: "Laugh", price: 26, img: laugh },
    { name: "Money", price: 35, img: money },
    { name: "Poop", price: 18, img: poop },
    { name: "Rocket", price: 25, img: rocket },
    { name: "Thumbs", price: 19, img: thumbs },
  ];
  
  const skinItems = [
    { name: "AI Strike", price: 20000, img: ai_strike },
    { name: "Circuit Phantom", price: 45000, img: circuit_phantom },
    { name: "Crimson Bot", price: 45000, img: crimson_bot },
    { name: "Cyber Guard", price: 35000, img: cyber_guard },
    { name: "Dark Reaper", price: 50000, img: dark_reaper },
    { name: "Digital Beast", price: 30000, img: digital_beast },
    { name: "Galactic Samurai", price: 35000, img: galactic_samurai },
    { name: "Nano Ninja", price: 100000, img: nano_ninja },
    { name: "Neon Blade", price: 50000, img: neon_blade },
    { name: "Quantum Ghost", price: 40000, img: quantum_ghost },
    { name: "Shadow Knight", price: 40000, img: shadow_knight },
    { name: "Tech Rider", price: 50000, img: tech_rider },
  ];
  
  const weaponItems = [
    { name: "Spy Drone", price: 500, img: spy_drone },
    { name: "Super Leverage", price: 20000, img: super_leverage },
  ];

 
// Cores neon emissivas variando
const neonColors = [
  "#00ffff", // ciano
  "#ff00ff", // magenta
  "#00ff00", // verde neon
  "#ffcc00", // dourado
  "#ff3300", // laranja neon
  "#66ffff", // azul claro
];

// Função que retorna uma cor diferente para cada índice
const getColorCycle = (i) => {
  return neonColors[i % neonColors.length];
};


const handlePurchase = async (item) => {
  if (!userData) return;

  const confirmed = window.confirm(`Buy "${item.name}" for ${item.price} CST?`);
  if (!confirmed) return;

  if (userData.balanceCST < item.price) {
    alert("Insufficient CST balance.");
    return;
  }

  try {
    const userRef = doc(db, "users", playerId);
    const updates = {
      balanceCST: userData.balanceCST - item.price,
    };

    const emojiNames = [
      "Bomb", "Clap", "Donkey", "Evil", "Fire", "Heart",
      "Kiss", "Laugh", "Money", "Poop", "Rocket", "Thumbs"
    ];

    const skinNames = [
      "AI Strike", "Circuit Phantom", "Crimson Bot", "Cyber Guard",
      "Dark Reaper", "Digital Beast", "Galactic Samurai", "Nano Ninja",
      "Neon Blade", "Quantum Ghost", "Shadow Knight", "Tech Rider"
    ];

    // ✅ EMOJIS
    if (emojiNames.includes(item.name)) {
      const emojiKey = `animations.emoji_${item.name.toLowerCase()}`;
      updates[emojiKey] = increment(1);

      await updateDoc(userRef, updates);
      setUserData((prev) => ({
        ...prev,
        balanceCST: prev.balanceCST - item.price,
        animations: {
          ...prev.animations,
          [`emoji_${item.name.toLowerCase()}`]: (prev.animations?.[`emoji_${item.name.toLowerCase()}`] || 0) + 1,
        },
      }));

      alert(`Successfully purchased ${item.name}!`);
      return;
    }

    // ✅ SKINS
    if (skinNames.includes(item.name)) {
      const skinKey = `skin_${item.name.toLowerCase().replace(/ /g, "_")}`;
      const ownedSkins = (userData.skins || []).map(s => s.toLowerCase());

      if (ownedSkins.includes(skinKey)) {
        alert("You already own this skin.");
        return;
      }

      await updateDoc(userRef, {
        ...updates,
        skins: arrayUnion(skinKey),
      });

      setUserData((prev) => ({
        ...prev,
        balanceCST: prev.balanceCST - item.price,
        skins: [...(prev.skins || []), skinKey],
      }));

      alert(`Skin "${item.name}" purchased successfully!`);
      return;
    }

    // ✅ ARMAS (armazenadas dentro de specialWeapons)
    const specialWeaponsUpdates = {};
    const special = userData.specialWeapons || {};

    if (item.name === "Spy Drone") {
      specialWeaponsUpdates["specialWeapons.open_positions_scan"] = increment(1);
    }

    if (item.name === "Super Leverage") {
      specialWeaponsUpdates["specialWeapons.hyper_leverage"] = increment(1);
    }

    await updateDoc(userRef, {
      ...updates,
      ...specialWeaponsUpdates,
    });

    // Atualiza localmente o objeto specialWeapons
    setUserData((prev) => ({
      ...prev,
      balanceCST: prev.balanceCST - item.price,
      specialWeapons: {
        ...prev.specialWeapons,
        hyper_leverage: item.name === "Super Leverage"
          ? (prev.specialWeapons?.hyper_leverage || 0) + 1
          : prev.specialWeapons?.hyper_leverage || 0,
        open_positions_scan: item.name === "Spy Drone"
          ? (prev.specialWeapons?.open_positions_scan || 0) + 1
          : prev.specialWeapons?.open_positions_scan || 0,
      }
    }));

    alert(`Weapon "${item.name}" purchased successfully!`);

  } catch (error) {
    console.error("Erro na compra:", error);
    alert("Erro ao realizar a compra.");
  }
};


return ( <div className="dashboard-sections"> 

<div className="crypto-ticker-bar">
  <div className="crypto-ticker-track">
    {[...cryptoPrices, ...cryptoPrices].map((coin, index) => (
      <div key={index} className="crypto-ticker-item">
        <span>{coin.symbol}:</span>
        <span>${coin.price.toLocaleString()}</span>
        <span
          style={{
            color: coin.change24h > 0 ? "#00ff00" : "#ff3333",
            fontWeight: "bold",
            marginLeft: 6,
          }}
        >
          {coin.change24h > 0 ? "+" : ""}
          {coin.change24h.toFixed(2)}%
        </span>
      </div>
    ))}
  </div>
</div>

<section className="dashboard-section" 
style={{ backgroundImage:` url(${bg1})` }}> <div className="dashboard-box">
   <div className="dashboard-header">

   <div className="skin-progress-container">
  <div className="skin-progress-bar">
    <div
      className="skin-progress-fill"
      style={{ width: `${skinProgress}%` }}
    />
  </div>
  <div className="skin-progress-labels">
    <span>{skinLevel.min} wins</span>
    <span>{skinLevel.max} wins</span>
  </div>
</div>
<div style={{ marginTop: 6 }}>
  <span
    style={{
      color: getLevelColor(skinWins),
      fontWeight: "bold",
      fontSize: "16px",
      textShadow: `
        0 0 8px ${getLevelColor(skinWins)},
        0 0 15px ${getLevelColor(skinWins)},
        0 0 25px ${getLevelColor(skinWins)}
      `,
      animation: "glowPulse 1.8s ease-in-out infinite",
    }}
  >
    {getLevelName(skinWins)} — {displayedWins} WINS
  </span>
</div>


   <img
  src={skinImages[skin.replace("skin_", "")] || skinDefault}
  alt="Skin Atual"
  onClick={() => setShowModal(true)}
  className="dashboard-avatar"
  style={{ cursor: "pointer" }}
/>


{showModal && (
  <SkinsModal
    activeSkin={{ name: skin }}
    skins={userData.skins || []}
    userData={userData}
    onClose={() => setShowModal(false)}
  />
)}

      <div> <h2>ID: {playerId.slice(0, 8)}...</h2> 
      <p style={{ fontSize: 14 }}>CryptoStars User</p> 
      </div> 
      <div className="dashboard-balance"> <p>${balanceUSDT.toFixed(3)}</p>
       <p>{balanceCST.toLocaleString()} CST</p> </div>
        </div>
         </div>

        

<div className="dashboard-grid">
      <div className="dashboard-item">
        <h2>DOWNLOADS</h2>
        <p>{downloads}</p>
      </div>
      <div
  className="dashboard-item"
  onClick={() => setShowOpenTournaments(true)}
  style={{ cursor: "pointer" }}
>
  <h2>ONGOING TOURNAMENTS</h2>
  <p>{openTournamentsCount}</p>
</div>

{showOpenTournaments && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3>Open Tournaments List</h3>
      <ul className="tournament-list">
        {openTournamentsList.map((t) => (
          <li key={t.id}>
            <strong>{t.name}</strong> — Prize Pool: {t.prizePool.toLocaleString()} USDC
          </li>
        ))}
      </ul>
      <button className="close-chart-button" onClick={() => setShowOpenTournaments(false)}>
      to close
      </button>
    </div>
  </div>
)}



<div
  className="dashboard-item"
  onClick={() => setShowPlayersOverlay(true)}
  style={{ cursor: "pointer" }}
>
  <h2>PLAYERS ONLINE</h2>
  <p>{playersOnline}</p>
</div>

{showPlayersOverlay && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3>Online Player</h3>
      <div className="players-animated-number">
        {displayedPlayers
          .toString()
          .split("")
          .map((digit, index) => (
            <span key={index} className="digit" style={{ animationDelay: `${index * 0.2}s `}}>
              {digit}
            </span>
          ))}
      </div>
      <button onClick={() => setShowPlayersOverlay(false)} className="close-chart-button">
      to close
      </button>
    </div>
  </div>
)}


<div
  className="dashboard-item"
  onClick={() => setShowLiquidityOverlay(true)}
  style={{ cursor: "pointer" }}
>
  <h2>POOL CST</h2>
  <p>{liquidityAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</p>
</div>

{showLiquidityOverlay && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3>CST launch pool target 1,800,000.00</h3>
      <div className="players-animated-number">
        {displayedLiquidity
          .toFixed(2)
          .toString()
          .split("")
          .map((digit, index) => (
            <span key={index} className="digit" style={{ animationDelay: `${index * 0.2}s `}}>
              {digit}
            </span>
          ))}
      </div>
      <button onClick={() => setShowLiquidityOverlay(false)} className="close-chart-button">
      to close
      </button>
    </div>
  </div>
)}

      <div className="dashboard-item" onClick={() => setShowChartOverlay(true)} style={{ cursor: "pointer" }}>
  <h2>STAKING</h2>
  <div className="dashboard-bar">
    <div
      className="staking-fill"
      style={{
        width: `${progress}%`,
        background: getStakingColor(progress),
        "--glow-color": getStakingColor(progress),
      }}
    ></div>
  </div>
  <p>
    {stakingPercent.toFixed(2)}% — Missing {remainingCST.toLocaleString()} CST
  </p>
</div>
    </div>

    {showBonusImage && (
  <div className="bonus-animation-container">
    <img src={bonusImg} alt="100k CST" className="bonus-image-center" />
  </div>
)}

{showChartOverlay && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3>USDC Distribution (last 7 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="valorDistribuido" stroke="#00ffff" strokeWidth={2} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
  formatter={(value) => [`${parseFloat(value).toFixed(2)} CST, "Distribuído"`]}
  contentStyle={{
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    border: "1px solid #00ffff",
    borderRadius: "10px",
    color: "#00ffff",
    fontWeight: "bold",
    backdropFilter: "blur(4px)",
  }}
  itemStyle={{
    color: "#00ffff",
  }}
  labelStyle={{
    color: "#00ffff",
  }}
/>


        </LineChart>

        <p style={{
  color: "#00ffff",
  textAlign: "center",
  marginBottom: "10px",
  fontWeight: "bold",
  fontSize: "14px",
}}>
  Total received in staking: {userStakingTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC
</p>
      </ResponsiveContainer>
      <button className="close-chart-button" onClick={() => setShowChartOverlay(false)}>
        to close
      </button>
    </div>
  </div>
)}
     







     
    
  </section>

  <section className="dashboard-section" style={{ backgroundImage: `url(${bg2})` }}>
  <div className="button-grid">
    <div className="button-row">
      
    <div className="button-frame" onClick={() => {
  setShowResultsModal(true);
  loadPrizeHistory(playerId, filter);
}}>
  <img src={resultadosImg} alt="Results" className="button-img" />
</div>

    
      <div className="button-frame" onClick={() => setShowStakingOverlay(true)}>
  <img src={stakingImg} alt="Staking" className="button-img" />
</div>

{showStakingOverlay && (
  <div className="chart-overlay">
    <div className="chart-card staking-overlay-card">
      <h2 className="staking-title">Staking Overview</h2>

      <div className="staking-cards-grid">
        <div className="staking-card">
          <label>Staked</label>
          <span>{formatNumber(userStaking)} CST</span>
        </div>

        <div className="staking-card">
          <label>Total Received</label>
          <span>{userStakingTotal.toFixed(2)} USDC</span>
        </div>

        <div className="staking-card">
          <label>Current Level</label>
          <span>{userData.stakingMilestoneReached || 0}</span>
        </div>

        <div className="staking-card">
          <label>Estimated Daily Reward</label>
          <span>{stakingEstimate.toFixed(5)} USDC</span>
        </div>

        <div className="staking-card">
          <label>Next payout</label>
          <span>{nextPayoutCountdown} (UTC)</span>
        </div>
      </div>

      <button className="staking-button" onClick={() => setShowStakingManageModal(true)}>
  Add / Remove CST
</button>

<button className="staking-button" onClick={() => setShowBuyCSTModal(true)}>
  Buy CST with USDC
</button>
</div>


      <button className="close-chart-button" onClick={() => setShowStakingOverlay(false)}>
        to close
      </button>
    </div>
  
)}

{showStakingManageModal && (
  <div className="chart-overlay">
    <div className="chart-card staking-overlay-card">
      <h3 className="staking-title">Manage Your Stake</h3>

      <div className="staking-manage-inputs">
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(Number(e.target.value))}
          placeholder="Enter amount"
        />

        <div className="staking-manage-buttons">
          <button
            className="staking-button"
            onClick={async () => {
              if (stakeAmount <= 0 || stakeAmount > userData.balanceCST) return alert("Invalid amount");
              const userRef = doc(db, "users", playerId);
              await updateDoc(userRef, {
                balanceCST: userData.balanceCST - stakeAmount,
                stakingCST: (userData.stakingCST || 0) + stakeAmount,
              });
              alert("CST added to staking!");
              setShowStakingManageModal(false);
            }}
          >
            Add CST
          </button>

          <button
            className="staking-button"
            onClick={async () => {
              if (stakeAmount <= 0 || stakeAmount > (userData.stakingCST || 0)) return alert("Invalid amount");
              const userRef = doc(db, "users", playerId);
              await updateDoc(userRef, {
                balanceCST: userData.balanceCST + stakeAmount,
                stakingCST: userData.stakingCST - stakeAmount,
              });
              alert("CST removed from staking!");
              setShowStakingManageModal(false);
            }}
          >
            Remove CST
          </button>
        </div>
      </div>

      <button className="close-chart-button" onClick={() => setShowStakingManageModal(false)}>
        to close
      </button>
    </div>
  </div>
)}

{showBuyCSTModal && (
  <div className="chart-overlay">
    <div className="chart-card staking-overlay-card">
      <h3 className="staking-title">Buy CST with USDC</h3>

      <div className="staking-manage-inputs">
        <input
          type="number"
          value={usdcAmountToBuy}
          onChange={(e) => setUsdcAmountToBuy(e.target.value)}
          placeholder="Enter amount in USDC"
        />

        <div className="staking-manage-buttons">
          <button
            className="staking-button"
            onClick={async () => {
              const usdc = parseFloat(usdcAmountToBuy);
              const cstToBuy = usdc * 10000;

              if (isNaN(usdc) || usdc <= 0 || usdc > userData.balanceUSDT) {
                return alert("Invalid amount");
              }

              const userRef = doc(db, "users", playerId);
              await updateDoc(userRef, {
                balanceUSDT: userData.balanceUSDT - usdc,
                balanceCST: userData.balanceCST + cstToBuy,
              });

              alert(`Purchased ${cstToBuy} CST for ${usdc} USDC`);
              setShowBuyCSTModal(false);
              setUsdcAmountToBuy("");
            }}
          >
            Confirm Purchase
          </button>
        </div>
      </div>

      <button className="close-chart-button" onClick={() => setShowBuyCSTModal(false)}>
        to close
      </button>
    </div>
  </div>
)}




      <div className="button-frame" onClick={() => setShowReferralOverlay(true)}>
  <img src={afiliadosImg} alt="Affiliates" className="button-img" />
</div>
{showReferralOverlay && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#00ffff",
          textShadow: `
            0 0 8px #00ffff,
            0 0 16px #00ffff,
            0 0 32px #00ffff
          `,
          animation: "glowPulse 1.5s ease-in-out infinite",
        }}
      >
        Referral Bonus: {displayedReferralBonus.toFixed(2)} USDC
      </h3>

      {referralHistory.length > 0 ? (
        <>
          <ul>
            {referralHistory.map((entry, index) => (
              <li key={index}>
                <strong>+{entry.bonusAmount.toFixed(2)} USDC</strong> from user:
                <br />
                <code>{entry.referredUserId}</code>
                <br />
                <small>{new Date(entry.date.seconds * 1000).toLocaleString("pt-BR")}</small>
              </li>
            ))}
          </ul>

          {/* Total de afiliados exibido de forma animada */}
          <p
            style={{
              marginTop: "15px",
              color: "#00ffff",
              fontWeight: "bold",
              fontSize: "16px",
              textShadow: `
                0 0 6px #00ffff,
                0 0 12px #00ffff,
                0 0 18px #00ffff
              `,
              animation: "glowPulse 2s ease-in-out infinite",
            }}
          >
            Total of referred users: {displayedReferralUsers}
          </p>
        </>
      ) : (
        <p style={{ color: "#00ffff" }}>No referrals yet.</p>
      )}

      <button onClick={() => setShowReferralOverlay(false)} className="close-chart-button">
        to close
      </button>
    </div>
  </div>
)}


{showResultsModal && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3 className="chart-title">Tournament Results</h3>

      {/* Filtros de tempo */}
      <div className="filter-buttons">
        {["daily", "weekly", "monthly", "total"].map((f) => (
          <button
            key={f}
            className={`staking-button ${filter === f ? "active" : ""}`}
            onClick={() => {
              setFilter(f);
              loadPrizeHistory(playerId, f);
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Botões de seleção de gráfico */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 }}>
        <button
          className={`staking-button ${selectedChart === "USDT" ? "active" : ""}`}
          onClick={() => setSelectedChart("USDT")}
        >
          ⇋ Accumulated USDC
        </button>
        <button
          className={`staking-button ${selectedChart === "CST" ? "active" : ""}`}
          onClick={() => setSelectedChart("CST")}
        >
          ⇋ Accumulated CST
        </button>
      </div>

      {/* Gráfico de linha */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={resultData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedChart === "USDT" && (
            <Line type="monotone" dataKey="acumuladoUSDT" stroke="#00ffcc" name="Acumulado USDT" />
          )}
          {selectedChart === "CST" && (
            <Line type="monotone" dataKey="acumuladoCST" stroke="#ff00cc" name="Acumulado CST" />
          )}
        </LineChart>
      </ResponsiveContainer>

      <button className="close-chart-button" onClick={() => setShowResultsModal(false)}>
        close
      </button>
    </div>
  </div>
)}





<div className="button-frame" onClick={() => setShowStoreModal(true)}>
  <img src={lojaImg} alt="Store" className="button-img" />
</div>

{showStoreModal && (
  <div className="chart-overlay">
    <div className="chart-card store-modal-card">
      <h2 className="store-title">🛒 Animation Store</h2>

      {/* Emojis */}
      <h3>🎭 Emojis</h3>
      <div className="store-scroll">
        {emojiItems.map((item, i) => (
          <div key={i} className="store-item">
            <img src={item.img} alt={item.name} className="store-icon" />
            <p>{item.name}</p>
            <p
  className="animated-price"
  style={{
    color: getColorCycle(i), // função de cor animada por índice
    transition: "color 0.5s",
  }}
>
  <CountUp end={item.price} duration={1.5} decimals={0} /> CST
</p>
            <button
              className="store-button"
              onClick={() => handlePurchase(item)}
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      {/* Skins */}
      <h3>🧍‍♂️ Skins</h3>
      <div className="store-scroll">
        {skinItems.map((item, i) => (
          <div key={i} className="store-item">
            <img src={item.img} alt={item.name} className="store-icon" />
            <p>{item.name}</p>
            <p
  className="animated-price"
  style={{
    color: getColorCycle(i), // função de cor animada por índice
    transition: "color 0.5s",
  }}
>
  <CountUp end={item.price} duration={1.5} decimals={0} /> CST
</p>
            <button
              className="store-button"
              onClick={() => handlePurchase(item)}
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      {/* Armas */}
      <h3>🔫 Weapons</h3>
      <div className="store-scroll">
        {weaponItems.map((item, i) => (
          <div key={i} className="store-item">
            <img src={item.img} alt={item.name} className="store-icon" />
            <p>{item.name}</p>
            <p
  className="animated-price"
  style={{
    color: getColorCycle(i), // função de cor animada por índice
    transition: "color 0.5s",
  }}
>
  <CountUp end={item.price} duration={1.5} decimals={0} /> CST
</p>
            <button
              className="store-button"
              onClick={() => handlePurchase(item)}
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      <button className="close-chart-button" onClick={() => setShowStoreModal(false)}>
        Close
      </button>
    </div>
  </div>
)}












    





      <div className="button-frame" onClick={fetchWeeklyRanking}>
  <img src={rankingImg} alt="Ranking" className="button-img" />
</div>

{showRankingModal && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3 className="chart-title">🏆 Weekly Ranking</h3>
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Player ID</th>
            <th>Total Chips</th>
            <th>Prize</th>
          </tr>
        </thead>
        <tbody>
        {rankingData.map((player, i) => (
  <tr key={player.id}>
    <td>{player.rank}</td>
    <td>{player.id.slice(0, 8)}...</td>
    <td>{player.totalChips.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
    <td>
      <span
        className="ranking-prize"
        style={{ color: animatedPrizes[i]?.color || "#ffffff" }}
      >
        {animatedPrizes[i]
          ? animatedPrizes[i].animatedPrize.toFixed(2) + " USDC"
          : "-"}
      </span>
    </td>
  </tr>
))}
        </tbody>
      </table>

      <button
        className="close-chart-button"
        onClick={() => setShowRankingModal(false)}
      >
        Close
      </button>
    </div>
  </div>
)}




<div className="button-frame" onClick={() => setShowCSTMarketModal(true)}>
  <img src={cstImg} alt="CST Market" className="button-img" />
</div>
  </div>
  </div>

  {showCSTMarketModal && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h3 className="chart-title">💱 CST Market</h3>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <p style={{ fontSize: "18px", marginBottom: "10px" }}>
        Current value of CST stage 1:
        </p>
        <div className="emissive-lupin-text">0,0001 USDC</div>
      </div>

      <button
        className="close-chart-button"
        onClick={() => setShowCSTMarketModal(false)}
        style={{ marginTop: "20px" }}
      >
        Fechar
      </button>
    </div>
  </div>
)}

</section>



<section className="dashboard-section" style={{ backgroundImage: `url(${bg3}) ` }}>
<div className="dashboard-buttons">
    <button className="dashboard-btn" onClick={() => setShowWithdrawModal(true)}>
      <img src={iconWithdraw} alt="Withdraw" className="btn-icon-top" />
      <span>Withdraw</span>
    </button>

    <button className="dashboard-btn" onClick={() => setShowDepositModal(true)}>
      <img src={iconDeposit} alt="Deposit" className="btn-icon-top" />
      <span>Deposit</span>
    </button>

    <button
  className="dashboard-btn"
  onClick={() => {
    console.log("Botão de torneios clicado!");
    onOpenTournamentTypes();
  }}
>
  <img src={iconTournaments} alt="Tournaments" className="btn-icon-top" />
  <span>Tournaments</span>
</button>

    <button className="dashboard-btn" onClick={onLogout}>
      <img src={iconLogout} alt="Logout" className="btn-icon-top" />
      <span>Logout</span>
    </button>
  </div>

  {/* Modal de Depósito */}
  {showDepositModal && (
  <div className="modal">
    <div className="modal-card">
      <h3 className="modal-title">USDC Deposit (Solana)</h3>

      <p className="modal-label">Platform Wallet:</p>
      <code>{platformWallet}</code>

      <button className="modal-btn" onClick={() => {
        navigator.clipboard.writeText(platformWallet);
        alert("Platform wallet address copied!");
      }}>
        Copy Wallet
      </button>

      <p className="modal-label">Your Wallet:</p>
      {userData.walletAddress && (
        <div className="wallet-saved-info">
          <input
            type="text"
            value={userData.walletAddress}
            disabled
          />
          <button
            className="modal-btn danger"
            onClick={async () => {
              if (window.confirm("Remove saved wallet address?")) {
                const userRef = doc(db, "users", playerId);
                await updateDoc(userRef, { walletAddress: "" });
                alert("Wallet address removed!");
                setUserData((prev) => ({ ...prev, walletAddress: "" }));
              }
            }}
          >
            Remove
          </button>
        </div>
      )}

      {!userData.walletAddress && (
        <>
          <input
            type="text"
            placeholder="Paste your wallet address"
            value={userWallet}
            onChange={(e) => setUserWallet(e.target.value)}
          />
          <button
            className="modal-btn"
            onClick={async () => {
              if (!userWallet) return alert("Please paste your wallet first.");
              const userRef = doc(db, "users", playerId);
              await updateDoc(userRef, { walletAddress: userWallet });
              alert("Wallet saved successfully!");
              setUserData((prev) => ({ ...prev, walletAddress: userWallet }));
            }}
          >
            Save Address
          </button>
        </>
      )}

 <p className="modal-min">
  Minimum deposit: 5 USDC  
  <br />
  <strong>Important:</strong> We only accept deposits from the wallet you registered in your profile.
  <br />
  <span className="text-red">Do not send from exchanges such as Binance, Gate.io or KuCoin.</span>
  <br />
  <span className="text-green">Accepted wallets: Trust Wallet, MetaMask, Phantom, Coinbase Wallet, SafePal, Rabby and other decentralized wallets.</span>
</p>

      <button className="close-btn" onClick={() => setShowDepositModal(false)}>Close</button>
    </div>
  </div>
  )}

  {/* Modal de Saque */}
  {showWithdrawModal && (
    <div className="modal">
      <div className="modal-card">
        <h3 className="modal-title">Withdraw USDC</h3>
        <p className="modal-balance">Your Balance: ${balance?.toFixed(2)}</p>
        <input
          type="number"
          placeholder="Enter amount (min 20)"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Wallet address"
          value={withdrawWallet}
          onChange={(e) => setWithdrawWallet(e.target.value)}
        />
        <button className="modal-btn" onClick={submitWithdraw}>Request Withdrawal</button>
        <h4 className="modal-subtitle">Pending Requests:</h4>
        {pendingWithdraws.map((w) => (
          <div key={w.id}>
            <p>${w.amount} - {w.walletAddress}</p>
          </div>
        ))}
        <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>Close</button>
      </div>
    </div>
  )}
</section>
</div>

); }