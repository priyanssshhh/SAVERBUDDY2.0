// src/pages/Home.jsx
import React from "react";
import Hero from "../components/Hero";
import "../pages/Home.css";

export default function Home() {
  return (
    <div className="home-page">
      {/* 🌟 Hero Section */}
      <section className="hero-section" id="hero">
        <Hero />
      </section>

      {/* 💡 Features Section */}
      <section className="features-section" id="features">
        <h2 className="section-title">What Makes SaverBuddy Smart?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>💸 Track Balances</h3>
            <p>
              Keep track of shared expenses, balances, and who owes who — all in real time.
            </p>
          </div>
          <div className="feature-card">
            <h3>🤖 AI Budget Insights</h3>
            <p>
              Get AI-powered insights that analyze your spending and suggest where to save more efficiently.
            </p>
          </div>
          <div className="feature-card">
            <h3>👥 Split Expenses</h3>
            <p>
              Traveling or sharing bills? Split costs easily among friends, roommates, or groups.
            </p>
          </div>
          <div className="feature-card">
            <h3>🔒 Secure Cloud Storage</h3>
            <p>
              All your financial data is securely synced and encrypted in real-time with cloud protection.
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 SaverBuddy Pro Section */}
      <section className="pro-section" id="pro">
        <div className="pro-content">
          <h2>
            Upgrade to <span>SaverBuddy Pro</span>
          </h2>
          <p>
            Unlock advanced analytics, receipt scanning, and personalized budgeting — take full control of your finances.
          </p>
          <button className="pro-btn" onClick={() => window.location.href = "/pricing"}>
            Get Pro
          </button>
        </div>
      </section>

      {/* 📱 Resources Section */}
      <section id="resources" className="resources-section">
        <div className="resources-content">
          <h2>📱 Get the SaverBuddy Mobile App</h2>
          <p>
            Download now for <strong>Android</strong> or <strong>iOS</strong> using the QR code below.
          </p>

          <div className="qr-box">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://saverbuddy.app"
              alt="SaverBuddy App QR"
            />
          </div>

          <p className="link-text">
            Trouble scanning?{" "}
            <a href="https://saverbuddy.app" target="_blank" rel="noreferrer">
              Click here to download
            </a>
          </p>
        </div>
      </section>

      {/* 💬 Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">Loved by Smart Savers</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>
              “SaverBuddy helped me save 20% more each month! Its AI insights are game-changing.”
            </p>
            <h4>— Aarav, Student</h4>
          </div>
          <div className="testimonial-card">
            <p>
              “Managing group trips has never been easier. The splitter tool is genius!”
            </p>
            <h4>— Ishi, Traveler</h4>
          </div>
          <div className="testimonial-card">
            <p>
              “It’s like having a personal finance assistant 24/7. Highly recommend it!”
            </p>
            <h4>— Karan, Engineer</h4>
          </div>
        </div>
      </section>

      {/* 🛠️ Support Section (for smooth scroll) */}
      <section className="support-section" id="support">
        <div className="support-content">
          <h2>Need Help?</h2>
          <p>
            Our team is always here to help you manage your finances smarter.
          </p>
          <div className="support-buttons">
            <a href="/support" className="support-btn">Visit Help Center</a>
            <a href="mailto:support@saverbuddy.app" className="support-btn secondary">Contact Support</a>
          </div>
        </div>
      </section>

      {/* ⚫ Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">SaverBuddy</div>
          <div className="footer-links">
            <a href="#hero">Home</a>
            <a href="#features">Features</a>
            <a href="#resources">Resources</a>
            <a href="#support">Support</a>
          </div>
          <p className="footer-text">
            © {new Date().getFullYear()} SaverBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
