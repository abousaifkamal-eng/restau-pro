import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

let messaging = null;
try {
  messaging = getMessaging(app);
} catch(e) {
  console.warn("Messaging not supported:", e);
}

const VAPID_KEY = "BMpbtlKTZRVPmZSJ37-uXKgR0h8qgjWNEAIEHPPBhKu122NNZk4vQkfDJQ5A2imr3gcGSPVwBuvdvT6-o2UsQJc";

export async function requestNotificationPermission() {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token;
  } catch(e) {
    console.warn("Notification permission error:", e);
    return null;
  }
}

export async function saveFCMToken(userId, token) {
  if (!token) return;
  try {
    const ref = doc(db, "fcm-tokens", userId);
    await setDoc(ref, { token, updatedAt: Date.now() }, { merge: true });
  } catch(e) {
    console.warn("Save FCM token error:", e);
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

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

export async function saveToFirestore(data, version) {
  try {
    const ref = doc(db, "restau-pro", "state");
    const ts = version || Date.now();
    await setDoc(ref, { db: data, updatedAt: ts, version: ts });
  } catch (e) {
    console.warn("Firestore save error:", e);
  }
}

export function subscribeToFirestore(callback) {
  try {
    const ref = doc(db, "restau-pro", "state");
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback(data.db, data.version || 0);
      }
    });
  } catch (e) {
    console.warn("Firestore subscribe error:", e);
    return () => {};
  }
}
