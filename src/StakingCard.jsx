import React, { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./styles/StakingCard.css";

export default function StakingCard() {
  const [value, setValue] = useState(null);
  const [show, setShow] = useState(false);

  const fetchStaking = async () => {
    const snap = await getDoc(doc(db, "statistics", "totalPrize"));
    if (snap.exists()) {
      const total = snap.data().totalStakingReceived || 0;
      animateValue(0, total);
    }
  };

  const animateValue = (start, end) => {
    let current = start;
    const step = (end - start) / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        current = end;
        clearInterval(interval);
      }
      setValue(current.toFixed(3));
    }, 16);
    setShow(true);
  };

  const handleLeave = () => {
    setShow(false);
    setValue(null);
  };

  return (
    <div className="staking-card-container">
      <div
        className="card"
        onMouseEnter={fetchStaking}
        onMouseLeave={handleLeave}
      >
        <h2 style={{ color: "#00ffff" }}>Staking</h2>
        <p>Total Distributed in Staking</p>
  
        {show && (
          <div className="neon-result-card">
            <p>Staking Total</p>
            <h3>{value} USDC</h3>
          </div>
        )}
      </div>
    </div>
  );
}