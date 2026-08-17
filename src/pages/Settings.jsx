import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { navigate("/login"); return; }
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user) return null;

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-card">
        <h2>Account</h2>
        <p><strong>Name:</strong> {user.displayName || "User"}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="settings-card">
        <h2>Preferences</h2>
        <label className="toggle-row">
          <span>Dark Mode</span>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </label>
        <label className="toggle-row">
          <span>Email Alerts</span>
          <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
        </label>
        <p className="hint">Preference saving coming soon.</p>
      </div>

      <div className="settings-card danger">
        <h2>Security</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}