// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { createUserProfile } from "../services/userService";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await createUserProfile(u);
    });
    return () => unsub();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".account-dropdown")) setDropdownOpen(false);
      if (!e.target.closest(".hamburger") && !e.target.closest(".mobile-menu")) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await signOut(auth);
    navigate("/login");
  };

  const scrollToSection = (id) => {
    setMobileOpen(false);
    const scrollNow = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollNow, 400);
    } else {
      scrollNow();
    }
  };

  const navLink = (to, label) => (
    <Link to={to} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
      {label}
    </Link>
  );

  return (
    <>
      <nav className="navbar">
        {/* LEFT */}
        <div className="navbar-left" onClick={() => navigate("/")}>
          <div className="navbar-logo">
            <img src="/logo.png" alt="SaverBuddy" />
            <span className="logo-text">SaverBuddy</span>
          </div>
          <div className="pro-label" onClick={(e) => { e.stopPropagation(); navigate("/pricing"); }}>
            <span>|</span>
            <span className="pro-text">PRO</span>
          </div>
        </div>

        {/* CENTER — desktop only */}
        <ul className="navbar-links">
          <li>
            {!user
              ? <button className="resources-link-btn" onClick={() => scrollToSection("features")}>Features</button>
              : <Link to="/features">Features</Link>}
          </li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li>
            {!user
              ? <button className="resources-link-btn" onClick={() => scrollToSection("resources")}>Resources</button>
              : <Link to="/myfinances">My Finances</Link>}
          </li>
          <li>
            {!user
              ? <button className="resources-link-btn" onClick={() => scrollToSection("support")}>Support</button>
              : <Link to="/deals">Deals</Link>}
          </li>
        </ul>

        {/* RIGHT — desktop only */}
        <div className="account-dropdown">
          {!user ? (
            <Link to="/login" className="login-btn">Login</Link>
          ) : (
            <div className="profile-container"
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}>
              <span className="profile-name">{user.displayName || "My Account"}</span>
              {dropdownOpen && (
                <div className="dropdown-menu" style={{ display: "block" }}>
                  <div className="dropdown-title">My Account</div>
                  {navLink("/dashboard", "📊 Dashboard")}
                  {navLink("/myfinances", "💰 My Finances")}
                  {navLink("/ai", "🤖 AI Advisor")}
                  {navLink("/deals", "🏷️ Best Deals")}
                  {navLink("/invest", "📈 Investments")}
                  {navLink("/scanner", "📷 Bill Scanner")}
                  {navLink("/upi", "📱 UPI Tracker")}
                  {navLink("/splitter", "🤝 Bill Splitter")}
                  <hr className="dropdown-divider" />
                  {navLink("/profile", "👤 Profile")}
                  {navLink("/settings", "⚙️ Settings")}
                  {navLink("/support", "❓ Support")}
                  <hr className="dropdown-divider" />
                  <button className="logout" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* HAMBURGER — mobile only */}
        <button
          className={`hamburger ${mobileOpen ? "open" : ""}`}
          onClick={(e) => { e.stopPropagation(); setMobileOpen(!mobileOpen); }}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {!user ? (
          <>
            <button onClick={() => scrollToSection("features")}>Features</button>
            <Link to="/pricing">💎 Pricing</Link>
            <button onClick={() => scrollToSection("resources")}>Resources</button>
            <button onClick={() => scrollToSection("support")}>Support</button>
            <div className="mobile-divider" />
            <Link to="/login">🔐 Login</Link>
            <Link to="/signup">✨ Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">📊 Dashboard</Link>
            <Link to="/myfinances">💰 My Finances</Link>
            <Link to="/ai">🤖 AI Advisor</Link>
            <Link to="/deals">🏷️ Best Deals</Link>
            <Link to="/invest">📈 Investments</Link>
            <Link to="/scanner">📷 Bill Scanner</Link>
            <Link to="/upi">📱 UPI Tracker</Link>
            <Link to="/splitter">🤝 Bill Splitter</Link>
            <div className="mobile-divider" />
            <Link to="/profile">👤 Profile</Link>
            <Link to="/settings">⚙️ Settings</Link>
            <Link to="/pricing">💎 Pricing</Link>
            <Link to="/support">❓ Support</Link>
            <div className="mobile-divider" />
            <button className="mobile-logout" onClick={handleLogout}>🚪 Logout</button>
          </>
        )}
      </div>
    </>
  );
}