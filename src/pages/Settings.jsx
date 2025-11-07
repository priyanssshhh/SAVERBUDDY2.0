// src/pages/Settings.jsx
import React from "react";
import "./Settings.css";

export default function Settings() {
  return (
    <div className="page-container">
      <div className="glass-box">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Customize your SaverBuddy experience</p>

        <div className="settings-options">
          <div className="setting-item">
            <label>Dark Mode</label>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="setting-item">
            <label>Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="setting-item">
            <label>Language</label>
            <select>
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>

        <button className="save-btn">Save Changes</button>
      </div>
    </div>
  );
}
