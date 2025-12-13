// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🔹 Components
import Navbar from "./components/Navbar";
import BackgroundVideo from "./components/BackgroundVideo";

// 🔹 Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import MyFinances from "./pages/MyFinances";
import BillSplitter from "./pages/BillSplitter";
import Support from "./pages/Support";

// 🔹 Authentication
import Login from "./components/authentication/Login";
import Signup from "./components/authentication/Signup";

function App() {
  return (
    <Router>
      {/* Background + Navbar are global */}
      <BackgroundVideo />
      <Navbar />

      <Routes>
        {/* 🌐 Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />

        {/* 👤 User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 💰 Finance Tools */}
        <Route path="/myfinances" element={<MyFinances />} />
        <Route path="/splitter" element={<BillSplitter />} />

        {/* 🚀 Future Expansion (placeholders) */}
        <Route
          path="/deals"
          element={
            <div
              style={{
                minHeight: "100vh",
                color: "white",
                background: "linear-gradient(180deg, #0b0b0b, #111)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <h1>🏷️ Best Deals For You</h1>
              <p style={{ opacity: 0.8 }}>
                Compare top market discounts and coupons through SaverBuddy Pay.
              </p>
            </div>
          }
        />

        <Route
          path="/ai"
          element={
            <div
              style={{
                minHeight: "100vh",
                color: "white",
                background: "linear-gradient(180deg, #0b0b0b, #111)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <h1>🤖 AI Assistant (Pro Feature)</h1>
              <p style={{ opacity: 0.8 }}>
                Get personalized financial insights and budget optimization
                suggestions.
              </p>
            </div>
          }
        />

        <Route
          path="/invest"
          element={
            <div
              style={{
                minHeight: "100vh",
                color: "white",
                background: "linear-gradient(180deg, #0b0b0b, #111)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <h1>📈 Smart Investment Guide</h1>
              <p style={{ opacity: 0.8 }}>
                Track, plan, and learn where to invest your saved money safely.
              </p>
            </div>
          }
        />

        <Route
          path="/pay"
          element={
            <div
              style={{
                minHeight: "100vh",
                color: "white",
                background: "linear-gradient(180deg, #0b0b0b, #111)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <h1>💳 SaverBuddy Pay</h1>
              <p style={{ opacity: 0.8 }}>
                Pay directly through SaverBuddy for cashback and exclusive
                coupons.
              </p>
            </div>
          }
        />

        {/* 🔐 Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🧭 404 - Fallback */}
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                background: "black",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <h1>⚠️ 404</h1>
              <p>Page not found</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
