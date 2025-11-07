// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import BackgroundVideo from "./components/BackgroundVideo";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";

// Auth
import Login from "./components/authentication/Login";
import Signup from "./components/authentication/Signup";

function App() {
  return (
    <Router>
      <BackgroundVideo />
      <Navbar />

      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* ✅ Resources Page (Mobile App QR) */}
        <Route
          path="/resources"
          element={
            <div
              style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #00121b, #031e2a)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#fff",
              }}
            >
              <h1
                style={{
                  fontSize: "2.2rem",
                  color: "#00ffc8",
                  marginBottom: "20px",
                  textShadow: "0 0 20px rgba(0, 255, 200, 0.4)",
                }}
              >
                📱 Get the SaverBuddy Mobile App
              </h1>
              <p style={{ color: "#ddd", marginBottom: "25px" }}>
                Download now for <strong>Android</strong> or <strong>iOS</strong> using the QR code below.
              </p>
              <img
                src="/qr-code.png" // ✅ replace with your own QR image
                alt="SaverBuddy App QR"
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "12px",
                  boxShadow: "0 0 25px rgba(0, 255, 200, 0.4)",
                }}
              />
              <p style={{ marginTop: "20px", color: "#00ffc8" }}>
                Trouble scanning?{" "}
                <a
                  href="https://your-app-download-link.com"
                  style={{ color: "#00ffc8", textDecoration: "underline" }}
                >
                  Click here to download
                </a>
              </p>
            </div>
          }
        />

        {/* ✅ My Finances Placeholder */}
        <Route
          path="/finances"
          element={
            <div
              style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #0f0f0f, #1a1a1a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexDirection: "column",
              }}
            >
              <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
                💰 My Finances (Coming Soon)
              </h1>
              <p style={{ opacity: 0.7 }}>
                Track savings, analyze spending, and manage your goals — all in one place.
              </p>
            </div>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
