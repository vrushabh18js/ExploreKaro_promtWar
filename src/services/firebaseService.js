// exploreKaro Firebase Cloud Integration
// Realtime Database for Live Citizen Hazard Alerts + Firebase Analytics

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDi9QReUfXAAY9GywaOkckk_V5gR8CaYiY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "explorerkaro-6e905.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://explorerkaro-6e905-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "explorerkaro-6e905",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "explorerkaro-6e905.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "454980012731",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:454980012731:web:e8c41ddc995366b53c779e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1VVH347GP7"
};

// Initialize App safely (singleton)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

// Initialize Analytics safely
let analyticsInstance = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
      console.log("[exploreKaro Firebase] Analytics initialized successfully.");
    }
  }).catch(() => {});
}

// Log Analytics Event
export function trackAnalyticsEvent(eventName, params = {}) {
  try {
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, params);
    }
  } catch (e) {
    // Non-blocking
  }
}

// Push Citizen Report to Firebase Realtime Database
export async function pushLiveCitizenReport(report) {
  try {
    const reportsRef = ref(db, "citizen_reports");
    const newReportRef = push(reportsRef);
    const dataWithId = {
      ...report,
      firebaseId: newReportRef.key,
      timestamp: Date.now()
    };
    await set(newReportRef, dataWithId);
    trackAnalyticsEvent("citizen_report_created", { type: report.type, severity: report.severity });
    console.log("[exploreKaro Firebase] Report synced to Cloud Realtime DB:", dataWithId);
    return dataWithId;
  } catch (err) {
    console.warn("[exploreKaro Firebase] Realtime DB push error, fallback to local storage:", err.message);
    return report;
  }
}

// Listen to Live Citizen Reports (Realtime Sync across all browsers)
export function listenToLiveCitizenReports(callback) {
  try {
    const reportsRef = ref(db, "citizen_reports");
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const reportsArray = Object.keys(data).map((key) => ({
        ...data[key],
        firebaseId: key
      })).reverse(); // Newest first

      callback(reportsArray);
    }, (error) => {
      console.warn("[exploreKaro Firebase] Realtime DB listen error:", error.message);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("[exploreKaro Firebase] Failed to attach realtime listener:", err.message);
    return () => {};
  }
}

// Google Sign-In with Firebase Authentication
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    trackAnalyticsEvent("user_google_login_success");
    return result.user;
  } catch (error) {
    console.warn("[exploreKaro Auth] Google Sign-In error:", error.message);
    throw error;
  }
}

// Sign-Out
export async function logoutUser() {
  try {
    await signOut(auth);
    trackAnalyticsEvent("user_logout");
  } catch (error) {
    console.warn("[exploreKaro Auth] Sign-Out error:", error.message);
  }
}

// Observer for User Auth Changes
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
