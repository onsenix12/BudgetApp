// src/firebase.js
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL CONFIGURATION FROM THE FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "budgetflow-wabmc.firebaseapp.com",
    projectId: "budgetflow-wabmc",
    storageBucket: "budgetflow-wabmc.firebasestorage.app",
    messagingSenderId: "737438918048",
    appId: "1:737438918048:web:08460ba0e724869f9ef0c5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// We will export db (database) instance later when we set up Firestore
// For now, just initializing the app is enough.
export { db };