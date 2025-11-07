// src/pages/Profile.jsx
import React from "react";
import "./Profile.css";

export default function Profile() {
  return (
    <div className="page-container">
      <div className="glass-box">
        <h1 className="page-title">👤 Profile</h1>
        <p className="page-subtitle">Your account details and preferences</p>

        <div className="profile-info">
          <div className="info-item">
            <span className="label">Name:</span>
            <span className="value">Priyansh Saxena</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">example@gmail.com</span>
          </div>
          <div className="info-item">
            <span className="label">Member Since:</span>
            <span className="value">Nov 2025</span>
          </div>
        </div>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
}
