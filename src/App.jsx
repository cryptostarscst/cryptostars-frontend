import React, { useState } from "react";
import "./styles/custom.css";
import background from "./assets/images/background.jpg";
import stars from "./assets/images/stars-bg.jpg"; // segundo fundo
import thirdBg from "./assets/images/your-third-bg.jpg"; // terceiro fundo
import coin from "./assets/images/coin.png";
import WardsCard from "./WardsCard";
import TournamentsCard from "./TournamentsCard";
import StakingCard from "./StakingCard";
import Login from "./Login";
import MainMenu from "./MainMenu";
import logoRoadmap from "./assets/images/logo-roadmap.png";

import appPrint1 from "./assets/images/app-print1.png";
import appPrint2 from "./assets/images/app-print2.png";
import appPrint3 from "./assets/images/app-print3.png";
import androidBtn from "./assets/images/android-download.png";

import twitterIcon from "./assets/images/twitter.png";
import instagramIcon from "./assets/images/instagram.png";
import youtubeIcon from "./assets/images/youtube.png"; 
import telegramIcon from "./assets/images/telegram.png"; 
import iosBtn from "./assets/images/ios-download.png"; // botão iOS


import { Routes, Route } from "react-router-dom";
import TournamentTypes from "./TournamentTypes";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showRankingInfo, setShowRankingInfo] = useState(false);
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const [showCSTModal, setShowCSTModal] = useState(false);
  const [showTournamentTypes, setShowTournamentTypes] = useState(false);
  

  const handleLoginSuccess = (id) => {
    setPlayerId(id);
    setShowLogin(false);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPlayerId(null);
  };

  return (
    <div className="hero-container">
      {isAuthenticated && playerId ? (
        showTournamentTypes ? (
          <TournamentTypes onClose={() => setShowTournamentTypes(false)} />
        ) : (
          <MainMenu
            playerId={playerId}
            onLogout={handleLogout}
            onOpenTournamentTypes={() => setShowTournamentTypes(true)}
          />
        )
      ) : (
        <>
   

        
        {/* Seção 1 */}
<section
  className="page-section"
  style={{
    backgroundImage: `url(${background})`,
    position: "relative", // necessário para os coins serem posicionados corretamente
  }}
>
  {/* COINS apenas aqui */}
  <div className="coin-bg" style={{
    position: "absolute", top: "57%", left: "50%",
    transform: "translate(-50%, -30%)", zIndex: 1, opacity: 5,
    width: "300px", height: "300px",
    backgroundImage: `url(${coin})`, backgroundSize: "contain",
    backgroundRepeat: "no-repeat", backgroundPosition: "center", pointerEvents: "none"
  }}></div>

  <div className="coin-bg" style={{
    position: "absolute", top: "57%", left: "29%",
    transform: "translate(-50%, -30%)", zIndex: 1, opacity: 5,
    width: "299px", height: "300px",
    backgroundImage: `url(${coin})`, backgroundSize: "contain",
    backgroundRepeat: "no-repeat", backgroundPosition: "center", pointerEvents: "none"
  }}></div>

  <div className="coin-bg" style={{
    position: "absolute", top: "57%", left: "71%",
    transform: "translate(-50%, -30%)", zIndex: 1, opacity: 5,
    width: "300px", height: "299px",
    backgroundImage: `url(${coin})`, backgroundSize: "contain",
    backgroundRepeat: "no-repeat", backgroundPosition: "center", pointerEvents: "none"
  }}></div>

  {/* Conteúdo da seção 1 */}
  <h1 className="title">CRYPTOSTARS THE FUTURE</h1>
  <p className="subtitle">THE FIRST TRADERS TOURNAMENT PLATFORM.</p>

  <div className="button-group">
    <button className="btn" onClick={() => setShowLogin(true)}>Login</button>
    <button className="btn" onClick={() => setShowLogin(true)}>Sign Up</button>
  </div>

  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
    <TournamentsCard />
    <StakingCard />
    <WardsCard />
  </div>

  {showLogin && (
    <Login
      onClose={() => setShowLogin(false)}
      onLoginSuccess={handleLoginSuccess}
    />
  )}
</section>

          {/* Seção 2 */}
          <section className="page-section" style={{ backgroundImage: `url(${stars}) `}}>
          
  <div
    className="roadmap-container"
    onMouseEnter={() => document.querySelector(".roadmap-buttons").classList.add("show")}
    onMouseLeave={() => document.querySelector(".roadmap-buttons").classList.remove("show")}
  >
    <div className="logo-core">
      <img src={logoRoadmap} alt="CryptoStars Logo" className="center-logo" />
    </div>

    <div className="roadmap-buttons">
    <button className="roadmap-btn" onClick={() => setShowBetaModal(true)}>Beta Launch</button>
   

    <button className="roadmap-btn" onClick={() => setShowStakingModal(true)}>Staking</button>


    <button className="roadmap-btn" onClick={() => setShowRankingInfo(true)}>Ranking</button>


    <button className="roadmap-btn" onClick={() => setShowReferralInfo(true)}>Affiliates</button>

    <button className="roadmap-btn" onClick={() => setShowCSTModal(true)}>CST Token</button>

    </div>
  </div>
</section>


{showBetaModal && (
  <div className="chart-overlay">
    <div className="chart-card store-modal-card">
      <h2>Welcome to CryptoStars – The New Era of Trading Tournaments</h2>
      <p>
        CryptoStars is the <strong>first competitive trading tournament platform</strong> in the world,
        focused on real performance, instant rewards, and intelligent gamification.
      </p>

      <h3>What makes CryptoStars different?</h3>
      <ul>
        <li><strong>Hyper Turbo & Regular Tournaments:</strong> 10-minute sessions where traders compete in real time using live charts and markets, allowing them to multiply their registration value countless times over without relying on major market movements — only skill and strategy matter.</li>
        <li><strong>Rewards in USDC and CST Token:</strong> Earn <strong>CST</strong> and <strong>USDC</strong> based on your performance. Use it to participate, grow or withdraw.</li>
        <li><strong>Smart Referral System:</strong> Invite friends and earn bonuses in <strong>USDC</strong> and <strong>CST</strong>. Just one invite gives you resources to play and grow your profile.</li>
        <li><strong>Exclusive Bonuses:</strong> The first 1,000 players receive <strong>1 USDC + 10,000 CST</strong> at registration to play without investing a cent.</li>
        <li><strong>Ranking by Merit, not Luck:</strong> No raffles or pay-to-win. Pure skill-based competition.</li>
        <li><strong>Blockchain Transparency:</strong> All actions and rewards are recorded and traceable — real merit, real recognition.</li>
      </ul>

      <p><strong>CryptoStars is more than a game — it’s a competitive battlefield for real traders.</strong></p>
      <p><strong>Get ready. Compete. Earn.</strong></p>

      <button className="close-chart-button" onClick={() => setShowBetaModal(false)}>Close</button>
    </div>
  </div>
)}

{showStakingModal && (
  <div className="chart-overlay">
    <div className="chart-card store-modal-card">
      <h2>CryptoStars Staking – Earn Daily Through Real Platform Profits</h2>
      <p>
        Unlike traditional staking systems that only mint and distribute tokens,
        <strong>CryptoStars staking is a profit-sharing mechanism</strong>.
      </p>

      <h3>How it works:</h3>
      <ul>
        <li><strong>Real Profit Sharing:</strong> 1.5% of all tournament entry fees are collected daily and added to the staking pool.</li>
        <li><strong>Daily Payouts:</strong> Every 24 hours, the platform distributes 100% of the staking pool proportionally to all CST holders with tokens in staking.</li>
        <li><strong>Based on Amount Staked:</strong> The more CST tokens you stake, the bigger your share of daily profits.</li>
        <li><strong>No Lock-in Period:</strong> You can add or remove your tokens anytime with full flexibility.</li>
      </ul>

      <p>
        <strong>CryptoStars staking rewards you for believing in the ecosystem.</strong><br />
        As the number of users and tournaments grows, so do your daily earnings — because the profit is real.
      </p>

      <p><strong>Stake CST. Share the success. Earn passively.</strong></p>

      <button className="close-chart-button" onClick={() => setShowStakingModal(false)}>Close</button>
    </div>
  </div>
)}

{showRankingInfo && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h2 className="chart-title">CryptoStars Ranking</h2>

      <p>
        The CryptoStars platform rewards the <strong>top 10% of ranked players</strong> every week with real USDC.
      </p>

      <h3>How it works:</h3>
      <ul style={{ paddingLeft: 20 }}>
        <li>1% of all tournament entry fees go into the Weekly Ranking Pool.</li>
        <li>The pool is distributed <strong>every Sunday</strong> to the top 10% ranked users.</li>
        <li>Each tournament you play adds CSTs to your ranking based on your position.</li>
        <li>The more you play, the higher you rank—and the bigger your reward.</li>
      </ul>

      <p style={{ marginTop: 10 }}>
        <strong>Compete. Rank up. Earn every week.</strong>
      </p>

      <button className="close-chart-button" onClick={() => setShowRankingInfo(false)}>
        Close
      </button>
    </div>
  </div>
)}

{showReferralInfo && (
  <div className="chart-overlay">
    <div className="chart-card">
      <h2 className="chart-title">CryptoStars Referral System</h2>

      <p>
        Invite your friends to join CryptoStars and <strong>earn passively</strong> forever.
      </p>

      <h3>How it works:</h3>
      <ul style={{ paddingLeft: 20 }}>
        <li>Every invited friend receives <strong>1 USDC + 10,000 CST</strong> as a welcome bonus.</li>
        <li>You earn <strong>5% of all future deposits</strong> made by your referrals.</li>
        <li><strong>No time limit</strong>, <strong>no earning cap</strong>, and unlimited invites.</li>
        <li>Create a powerful affiliate network and profit as they play and stake.</li>
      </ul>

      <p style={{ marginTop: 10 }}>
        <strong>Grow your community. Grow your rewards. Automatically.</strong>
      </p>

      <button className="close-chart-button" onClick={() => setShowReferralInfo(false)}>
        Close
      </button>
    </div>
  </div>
)}

{showCSTModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2 className="modal-title">CST Token Economics</h2>
      <p><strong>Total Supply:</strong> 18,446,744,072 CST</p>
      <p>2.5% of all tournament entry fees go into the CST Launch Pool.</p>
      <p>
        The token will launch backed by a <strong>1,800,000 USDC</strong> liquidity pool.
        After the launch, 2.5% will continue being collected to buy back CST
        from the market and increase the internal CST pool.
      </p>
      <p>
        This system creates continuous demand and long-term appreciation for the token,
        directly linked to platform activity.
      </p>
      <button className="modal-close" onClick={() => setShowCSTModal(false)}>
  Close
</button>
    </div>
  </div>
)}


          {/* Seção 3 */}
          <section className="page-section" style={{ backgroundImage: `url(${thirdBg})` }}>
  <h2 className="section-title">Get a head start: 1 USDC + 10,000 CST free on registration!</h2>

  <div className="app-gallery">
    <img src={appPrint1} alt="App Print 1" />
    <img src={appPrint2} alt="App Print 2" />
    <img src={appPrint3} alt="App Print 3" />
  </div>

  <div className="app-links">
  <a href="https://github.com/cryptostarscst/CryptoStars-tournaments/releases/tag/v1.0.0" target="_blank" rel="noopener noreferrer">
  <img src={androidBtn} alt="Download for Android" className="social-icon" />
</a>

<a href="https://apps.apple.com/app/id123456789" target="_blank" rel="noopener noreferrer">
  <img src={iosBtn} alt="Download on the App Store" className="social-icon" />
</a>

    
    <a href="https://x.com/CryptostarCst" target="_blank" rel="noopener noreferrer">
      <img src={twitterIcon} alt="Twitter" className="social-icon" />
    </a>
    <a href="https://www.instagram.com/cryptostars.cst" target="_blank" rel="noopener noreferrer">
      <img src={instagramIcon} alt="Instagram" className="social-icon" />
    </a>
    <a href="https://t.me/+e85sS6PiAMY1NmFh" target="_blank" rel="noopener noreferrer">
  <img src={telegramIcon} alt="Telegram" className="social-icon" />
</a>
    <a href="https://youtube.com/@cryptostars-cst?si=_uAobGpUsTFZgnco" target="_blank" rel="noopener noreferrer">
  <img src={youtubeIcon} alt="YouTube" className="social-icon" />
</a>
  </div>

  <p className="final-message">
    The revolution of trading has just begun. Be among the first to dominate the arena and turn skill into rewards!
  </p>
</section>
        </>
      )}
    </div>
  );
}

export default App;