import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdM9J-GM2vC8vNjvyw0gRjXkdnROXs3Y4",
  authDomain: "saverbuddy-4f402.firebaseapp.com",
  projectId: "saverbuddy-4f402",
  storageBucket: "saverbuddy-4f402.appspot.com",
  messagingSenderId: "749297516721",
  appId: "1:749297516721:web:3f67e36a20ada970fb2290",
  measurementId: "G-DPM6HPTW5L",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
auth.languageCode = "en";

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase persistence error:", error.message);
});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth, googleProvider, db };