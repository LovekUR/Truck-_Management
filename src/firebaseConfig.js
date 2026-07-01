import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAik4x0VOVQMJPZhViSzFEXy8cveWlgr4c",
  // I fixed this line below - it MUST have the project name first
  authDomain: "truck-system-8f645.firebaseapp.com",
  projectId: "truck-system-8f645",
  storageBucket: "truck-system-8f645.firebasestorage.app",
  messagingSenderId: "952473670855",
  appId: "1:952473670855:web:c53d7251e0e607c3899ae2"
};

// SAFETY SHIELD: This checks if Firebase is already running
// If it is, we use the existing one. If not, we start it.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
