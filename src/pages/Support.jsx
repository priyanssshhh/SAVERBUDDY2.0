// src/pages/Support.jsx
import React from "react";
import "./Support.css";

export default function Support() {
  return (
    <div className="support-page">
      {/* ---- Hero Section ---- */}
      <section className="support-hero">
        <h1>How can we help you?</h1>
        <p>Find answers, guides, and tips to make the most of SaverBuddy.</p>
        <div className="support-search">
          <input type="text" placeholder="Search for help..." />
          <button>Search</button>
        </div>
      </section>

      {/* ---- Quick Help Categories ---- */}
      <section className="support-cards">
        <div className="support-card">
          <span>🚀</span>
          <h3>Get Started</h3>
          <p>Learn the basics and get your account set up quickly.</p>
        </div>

        <div className="support-card">
          <span>👤</span>
          <h3>Account & Login</h3>
          <p>Manage your profile, passwords, and connected devices.</p>
        </div>

        <div className="support-card">
          <span>🤖</span>
          <h3>AI Insights</h3>
          <p>Understand how our AI helps optimize your savings and budget.</p>
        </div>

        <div className="support-card">
          <span>🧾</span>
          <h3>Expenses & Reports</h3>
          <p>Track balances, splits, and download your expense history.</p>
        </div>

        <div className="support-card">
          <span>🛠️</span>
          <h3>Troubleshooting</h3>
          <p>Fix common problems and get real-time help from support.</p>
        </div>
      </section>

      {/* ---- Explore SaverBuddy ---- */}
      <section className="explore-section">
        <h2>Explore SaverBuddy</h2>
        <div className="explore-grid">
          <div className="explore-item">
            <h3>💡 Tips & Tricks</h3>
            <p>Discover hidden features to maximize your savings potential.</p>
          </div>
          <div className="explore-item">
            <h3>📱 Mobile App</h3>
            <p>Sync your data and track expenses on the go with our mobile app.</p>
          </div>
          <div className="explore-item">
            <h3>🔔 Notifications</h3>
            <p>Set alerts to never miss a bill or expense update again.</p>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="support-footer">
        <p>Need more help? Contact our team at <span>support@saverbuddy.com</span></p>
        <p>© {new Date().getFullYear()} SaverBuddy. All rights reserved.</p>
      </footer>
    </div>
  );
}
