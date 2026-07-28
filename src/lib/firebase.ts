import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
// Replace with your own Firebase project config from:
// Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyDWT_tlxSEhSJOVD9h5kRXqtvkVE19P928",
  authDomain: "more-english-with-miss-shereen.firebaseapp.com",
  projectId: "more-english-with-miss-shereen",
  storageBucket: "more-english-with-miss-shereen.firebasestorage.app",
  messagingSenderId: "844979273295",
  appId: "1:844979273295:web:a8d95c0b8606aa358a343a",
  measurementId: "G-QVPFYNZRQC"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
