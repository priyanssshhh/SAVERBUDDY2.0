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

  // ✅ Track login state
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

  // ✅ Scroll smoothly to “Resources” section (only on Home)
  const handleResourcesClick = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      const section = document.getElementById("resources");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById("resources");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 600);
    }
  };

  return (
    <nav className="navbar">
      {/* ===== LEFT SECTION (Logo + Pro Label) ===== */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="SaverBuddy Logo" />
          <span className="logo-text">SaverBuddy</span>
        </div>

        <div
          className="pro-label"
          onClick={() => navigate("/pricing")}
          style={{ cursor: "pointer" }}
        >
          <span>|</span> <span className="pro-text">SaverBuddy Pro</span>
        </div>
      </div>

      {/* ===== CENTER NAV LINKS ===== */}
      <ul className="navbar-links">
        <li>
          <Link to="/features">Features</Link>
        </li>
        <li>
          <Link to="/pricing">Plans & Pricing</Link>
        </li>

        {/* Before Login → Resources | After Login → My Finances */}
        {!user ? (
          <li>
            <button onClick={handleResourcesClick} className="resources-link-btn">
              Resources
            </button>
          </li>
        ) : (
          <li>
            <Link to="/myfinances">My Finances</Link>
          </li>
        )}

        <li>
          <Link to="/support">Support</Link>
        </li>
      </ul>

      {/* ===== RIGHT SECTION (Login / Profile) ===== */}
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
