// src/pages/HelpSupport.jsx
import React from "react";
import "./HelpSupport.css";

export default function HelpSupport() {
  return (
    <div className="page-container">
      <div className="glass-box">
        <h1 className="page-title">❓ Help & Support</h1>
        <p className="page-subtitle">
          Need help? We’re here to assist you anytime.
        </p>

        <div className="support-cards">
          <div className="support-card">
            <h3>📘 FAQs</h3>
            <p>Find answers to common questions about using SaverBuddy.</p>
            <button className="btn-outline">View FAQs</button>
          </div>

          <div className="support-card">
            <h3>💬 Contact Support</h3>
            <p>Reach out to our support team for personalized help.</p>
            <button className="btn-outline">Contact Us</button>
          </div>

          <div className="support-card">
            <h3>📢 Feedback</h3>
            <p>Help us improve SaverBuddy with your valuable suggestions.</p>
            <button className="btn-outline">Send Feedback</button>
          </div>
        </div>
      </div>
    </div>
  );
}
