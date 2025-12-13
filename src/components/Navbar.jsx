// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      setTimeout(scrollNow, 400); // Wait until Home loads
    } else {
      scrollNow();
    }
  };

  return (
    <nav className="navbar">
      {/* ===== LEFT SECTION (Logo + SaverBuddy Pro) ===== */}
      <div className="navbar-left" onClick={() => navigate("/")}>
        <div className="navbar-logo">
          <img src="/logo.png" alt="SaverBuddy Logo" />
          <span className="logo-text">SaverBuddy</span>
        </div>

        {/* ✅ Fixed: Prevent logo click when pressing SaverBuddy Pro */}
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
        {/* Features */}
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

        {/* Plans & Pricing */}
        <li>
          <Link to="/pricing">Plans & Pricing</Link>
        </li>

        {/* Before Login → Resources | After Login → My Finances */}
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

        {/* Support (scrolls to support section before login) */}
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

      {/* ===== RIGHT SECTION (Login or Account Dropdown) ===== */}
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
