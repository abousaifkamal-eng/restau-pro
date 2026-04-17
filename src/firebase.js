import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMOYHEHuM3TQ5mTRIRTU0vUQqtShA8JnY",
  authDomain: "restau-pro.firebaseapp.com",
  projectId: "restau-pro",
  storageBucket: "restau-pro.firebasestorage.app",
  messagingSenderId: "572122108168",
  appId: "1:572122108168:web:929919fb152a1183c4dcbd",
  measurementId: "G-PPBB6PTTE3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function loadFromFirestore() {
  try {
    const ref = doc(db, "restau-pro", "state");
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data().db;
    return null;
  } catch (e) {
    console.warn("Firestore load error:", e);
    return null;
  }
}

export async function saveToFirestore(data) {
  try {
    const ref = doc(db, "restau-pro", "state");
    await setDoc(ref, { db: data, updatedAt: Date.now() });
  } catch (e) {
    console.warn("Firestore save error:", e);
  }
}

export function subscribeToFirestore(callback) {
  try {
    const ref = doc(db, "restau-pro", "state");
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) callback(snap.data().db);
    });
  } catch (e) {
    console.warn("Firestore subscribe error:", e);
    return () => {};
  }
}
