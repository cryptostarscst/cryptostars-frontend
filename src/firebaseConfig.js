// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrw4VchgtE4udF5Z1MoQ13DHB7n7D7ZGA",
  authDomain: "crypto-stars-2c126.firebaseapp.com",
  projectId: "crypto-stars-2c126",
  storageBucket: "crypto-stars-2c126.appspot.com", // corrigi aqui: estava .firebasestorage.app
  messagingSenderId: "883751799700",
  appId: "1:883751799700:web:42388e4bd32f5e88dadd81",
  measurementId: "G-DMVGSL08SW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };