// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global Components
import Navbar from "./components/Navbar";
import BackgroundVideo from "./components/BackgroundVideo";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import MyFinances from "./pages/MyFinances";
import BillSplitter from "./pages/BillSplitter";
import Support from "./pages/Support";
import Features from "./pages/Features"; // ✅ ADD THIS
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";



// Auth
import Login from "./components/authentication/Login";
import Signup from "./components/authentication/Signup";

function App() {
  return (
    <Router>
      <BackgroundVideo />
      <Navbar />

      <Routes>
        {/* 🌐 Public */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />
        <Route path="/features" element={<Features />} /> {/* ✅ FIX */}
        <Route path="/settings" element={<Settings />} />


        {/* 🔐 Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 👤 User Area */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myfinances" element={<MyFinances />} />
        <Route path="/splitter" element={<BillSplitter />} />
        <Route path="/profile" element={<Profile />} />


        {/* 🚀 Future features */}
        <Route path="/ai" element={<ComingSoon title="AI Assistant" />} />
        <Route path="/deals" element={<ComingSoon title="Best Market Deals" />} />
        <Route path="/invest" element={<ComingSoon title="Investment Advisor" />} />
        <Route path="/pay" element={<ComingSoon title="SaverBuddy Pay" />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

/* 🔧 Helper components (unchanged) */
const ComingSoon = ({ title }) => (
  <div style={pageStyle}>
    <h1>🚧 {title}</h1>
    <p>Coming soon in SaverBuddy Pro</p>
  </div>
);

const NotFound = () => (
  <div style={pageStyle}>
    <h1>404</h1>
    <p>Page not found</p>
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
};

export default App;
