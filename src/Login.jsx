// src/Login.jsx
import React, { useState } from "react";
import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import {
  setDoc,
  doc,
  updateDoc,
  getDoc,
  arrayUnion
} from "firebase/firestore";
import "./styles/custom.css";
import { v4 as uuidv4 } from 'uuid';

export default function Login({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [referrerId, setReferrerId] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError("");

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCred.user;

        if (!user.emailVerified) {
          setError("Please verify your email before logging in.");
          return;
        }

        await updateDoc(doc(db, "users", user.uid), {
          isVerified: true
        });

        localStorage.setItem("userId", user.uid); // <- Salva o ID

        alert("Login success!");
        onLoginSuccess(user.uid);
        onClose();
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCred.user;

        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {
          email,
          createdAt: new Date(),
          chips: 1000,
          balanceCST: 10000,
          balanceUSDT: 1,
          referredBy: referrerId || null,
          referredUsers: [],
          skin: "usuario_inicial",
          skins: ["usuario_inicial"],
          isVerified: false
        });

        localStorage.setItem("userId", user.uid); // <- Salva o ID

        if (referrerId) {
          const referrerRef = doc(db, "users", referrerId);
          const referrerSnap = await getDoc(referrerRef);

          if (referrerSnap.exists()) {
            await updateDoc(referrerRef, {
              referredUsers: arrayUnion(user.uid),
              balanceUSDT: (referrerSnap.data().balanceUSDT || 0) + 0.25
            });

            const msgRef = doc(db, "users", referrerId, "messages", uuidv4());
            await setDoc(msgRef, {
              text: `Congratulations! You have received 0.25 USDC for referring ${email}.`,
              read: false,
              timestamp: new Date()
            });
          }
        }

        alert("Account created! Please check your email to verify.");
        onLoginSuccess(user.uid);
        onClose();
      }
    } catch (e) {
      setError("Error: " + e.message);
    }
  };

  return (
    <div className="login-modal">
      <h2>{isLogin ? "Login" : "Create Account"}</h2>

      {error && (
        <div style={{
          backgroundColor: "#ff0033",
          color: "white",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "10px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      /><br />

      {!isLogin && (
        <input
          type="text"
          placeholder="Referral ID (optional)"
          value={referrerId}
          onChange={(e) => setReferrerId(e.target.value)}
        />
      )}

      <button onClick={handleAuth}>
        {isLogin ? "Enter" : "Register"}
      </button>

      <p
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
        }}
        style={{ cursor: "pointer", color: "#00ffff" }}
      >
        {isLogin ? "Create an account" : "I already have an account"}
      </p>

      <button onClick={onClose} style={{ marginTop: 10 }}>Close</button>
    </div>
  );
}