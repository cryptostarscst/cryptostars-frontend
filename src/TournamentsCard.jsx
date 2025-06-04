import React, { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./styles/TournamentsCard.css";

export default function TournamentsCard() {
  const [value, setValue] = useState(null);
  const [show, setShow] = useState(false);

  const fetchTournaments = async () => {
    const snap = await getDoc(doc(db, "statistics", "totalPrize"));
    if (snap.exists()) {
      const total = snap.data().totalPaidTournaments || 0;
      animateValue(0, total);
    }
  };

  const animateValue = (start, end) => {
    let current = start;
    const step = Math.max(1, Math.floor((end - start) / 60));
    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        current = end;
        clearInterval(interval);
      }
      setValue(current);
    }, 16);
    setShow(true);
  };

  const handleLeave = () => {
    setShow(false);
    setValue(null);
  };

  return (
    <div className="tournament-card-container">
      <div
        className="card"
        onMouseEnter={fetchTournaments}
        onMouseLeave={handleLeave}
      >
        <h2 style={{ color: "#00ffff" }}> Tournaments</h2>
        <p>Total tournaments played</p>
  
        {show && (
          <div className="tournament-float">
            <p>Total Played</p>
            <h3>{value} </h3>
          </div>
        )}
      </div>
    </div>
  );
}