import React, { useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./styles/RewardsCard.css";

const db = getFirestore();

export default function RewardsCard() {
  const [value, setValue] = useState(null);
  const [show, setShow] = useState(false);

  const fetchPrize = async () => {
    const snap = await getDoc(doc(db, "statistics", "totalPrize"));
    if (snap.exists()) {
      const total = snap.data().value || 0;
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
      setValue(current.toFixed(2));
    }, 16);
    setShow(true);
  };

  return (
    <div
      className="reward-card-container"
      onMouseEnter={fetchPrize}
      onMouseLeave={() => setShow(false)}
    >
      <div className="card neon-card">
        <h2 style={{ color: "#ff66ff" }}>Rewards</h2>
        <p>Buy and sell digital collectibles</p>
      </div>

      {show && (
        <div className="reward-float">
          <p>Total Distributed</p>
          <h3>{value} USBC</h3>
        </div>
      )}
    </div>
  );
}