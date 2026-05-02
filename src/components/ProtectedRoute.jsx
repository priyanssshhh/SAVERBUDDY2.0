import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setStatus(user ? "auth" : "unauth");
    });
    return () => unsub();
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "#0b0b0b",
        color: "#00ffc8", fontSize: "1.2rem", gap: "16px" }}>
        <div style={{ width: 48, height: 48, border: "4px solid rgba(0,255,200,0.2)",
          borderTop: "4px solid #00ffc8", borderRadius: "50%",
          animation: "spin 0.8s linear infinite" }} />
        <p>Loading SaverBuddy...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return status === "auth" ? children : <Navigate to="/login" replace />;
}