// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global Components
import Navbar from "./components/Navbar";
import BackgroundVideo from "./components/BackgroundVideo";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import Features from "./pages/Features";

// Auth
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import MyFinances from "./pages/MyFinances";
import BillSplitter from "./pages/BillSplitter";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AIAdvisor from "./pages/AIAdvisor";
import Deals from "./pages/Deals";
import Invest from "./pages/Invest";
import BillScanner from "./pages/BillScanner";
import UPITracker from "./pages/UPITracker";
import SavingsGoals from "./pages/SavingsGoals";

function App() {
  return (
    <Router>
      <BackgroundVideo />
      <Navbar />

      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />
        <Route path="/features" element={<Features />} />

        {/* 🔐 Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 👤 Protected Routes */}
        <Route
          path="/savings"
          element={
            <ProtectedRoute>
              <SavingsGoals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myfinances"
          element={
            <ProtectedRoute>
              <MyFinances />
            </ProtectedRoute>
          }
        />
        <Route
          path="/splitter"
          element={
            <ProtectedRoute>
              <BillSplitter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AIAdvisor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals"
          element={
            <ProtectedRoute>
              <Deals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invest"
          element={
            <ProtectedRoute>
              <Invest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute>
              <BillScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upi"
          element={
            <ProtectedRoute>
              <UPITracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pay"
          element={
            <ProtectedRoute>
              <ComingSoon title="SaverBuddy Pay" />
            </ProtectedRoute>
          }
        />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

const ComingSoon = ({ title }) => (
  <div style={pageStyle}>
    <h1>🚧 {title}</h1>
    <p style={{ color: "#aaa", marginTop: 10 }}>
      Coming soon in SaverBuddy Pro
    </p>
  </div>
);

const NotFound = () => (
  <div style={pageStyle}>
    <h1 style={{ color: "#00ffc8" }}>404</h1>
    <p style={{ color: "#aaa", marginTop: 10 }}>Page not found</p>
  </div>
);

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#0b0b0b,#111)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Poppins, sans-serif",
};

export default App;