import React, { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./styles/WardsCard.css";

export default function WardsCard() {
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

  const handleMouseLeave = () => {
    setShow(false);
    setValue(null);
  };

  return (
    <div className="wards-card-container">
      <div
        className="card"
        onMouseEnter={fetchPrize}
        onMouseLeave={handleMouseLeave}
      >
        <h2 style={{ color: "#00ffff" }}>Wards</h2>
        <p>Total prize pool distributed</p>
  
        {show && (
          <div className="wards-float">
            <p>Total Prize</p>
            <h3>{value} USDC</h3>
          </div>
        )}
      </div>
    </div>
  );
}