// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Import Realtime Database
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXCZmQdh6h409Ft7jotAFq3Ii8D_MqhJE",
  authDomain: "police-call-3cecf.firebaseapp.com",
  databaseURL: "https://police-call-3cecf-default-rtdb.firebaseio.com",
  projectId: "police-call-3cecf",
  storageBucket: "police-call-3cecf.firebasestorage.app",
  messagingSenderId: "177664578873",
  appId: "1:177664578873:web:b128634a758426b65684e8",
  measurementId: "G-CL3GJBC0T3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app); // Initialize Firebase Realtime Database

export { app, database, analytics };
