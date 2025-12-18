// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { createUserProfile } from "../services/userService"; // ✅ ADD THIS
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Track Firebase Auth state + ensure Firestore profile exists
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // ✅ ENSURE USER PROFILE EXISTS IN FIRESTORE
      if (currentUser) {
        await createUserProfile(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ✅ Scroll smoothly to a section on Home
  const scrollToSection = (id) => {
    const scrollNow = () => {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    };

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollNow, 400);
    } else {
      scrollNow();
    }
  };

  return (
    <nav className="navbar">
      {/* ===== LEFT SECTION ===== */}
      <div className="navbar-left" onClick={() => navigate("/")}>
        <div className="navbar-logo">
          <img src="/logo.png" alt="SaverBuddy Logo" />
          <span className="logo-text">SaverBuddy</span>
        </div>

        <div
          className="pro-label"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/pricing");
          }}
          style={{ cursor: "pointer" }}
        >
          <span>|</span> <span className="pro-text">SAVERBUDDY PRO</span>
        </div>
      </div>

      {/* ===== CENTER NAV LINKS ===== */}
      <ul className="navbar-links">
        <li>
          {!user ? (
            <button
              className="resources-link-btn"
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>
          ) : (
            <Link to="/features">Features</Link>
          )}
        </li>

        <li>
          <Link to="/pricing">Plans & Pricing</Link>
        </li>

        {!user ? (
          <li>
            <button
              onClick={() => scrollToSection("resources")}
              className="resources-link-btn"
            >
              Resources
            </button>
          </li>
        ) : (
          <li>
            <Link to="/myfinances">My Finances</Link>
          </li>
        )}

        <li>
          {!user ? (
            <button
              className="resources-link-btn"
              onClick={() => scrollToSection("support")}
            >
              Support
            </button>
          ) : (
            <Link to="/support">Support</Link>
          )}
        </li>
      </ul>

      {/* ===== RIGHT SECTION ===== */}
      <div className="account-dropdown">
        {!user ? (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        ) : (
          <div
            className="profile-container"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="profile-name">
              {user.displayName || "My Account"}
            </span>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-title">My Account</div>
                <Link to="/dashboard" className="dropdown-item">
                  📊 Dashboard
                </Link>
                <Link to="/profile" className="dropdown-item">
                  👤 Profile
                </Link>
                <Link to="/settings" className="dropdown-item">
                  ⚙️ Settings
                </Link>
                <Link to="/help" className="dropdown-item">
                  ❓ Help & Support
                </Link>
                <hr className="dropdown-divider" />
                <button className="logout" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
