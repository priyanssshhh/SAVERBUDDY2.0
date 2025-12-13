// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdM9J-GM2vC8vNjvyw0gRjXkdnROXs3Y4",
  authDomain: "saverbuddy-4f402.firebaseapp.com",
  projectId: "saverbuddy-4f402",
  storageBucket: "saverbuddy-4f402.appspot.com",
  messagingSenderId: "749297516721",
  appId: "1:749297516721:web:3f67e36a20ada970fb2290",
  measurementId: "G-DPM6HPTW5L",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Setup Firebase Authentication
const auth = getAuth(app);
auth.languageCode = "en";

// ✅ Make login persistent (keeps user signed in even after refresh)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Firebase Auth persistence enabled (local).");
  })
  .catch((error) => {
    console.error("❌ Firebase persistence error:", error.message);
  });

// ✅ Setup Google Sign-In Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { auth, googleProvider, db };
