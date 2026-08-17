import React, { useState } from "react";
import { SERVER_URL } from "../config";
import "./Support.css";

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const res = await fetch(`${SERVER_URL}/api/contact-support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="support-page">
      <section className="support-hero">
        <h1>How can we help you?</h1>
        <p>Find answers, guides, and tips to make the most of SaverBuddy.</p>
        <div className="support-search">
          <input type="text" placeholder="Search for help..." />
          <button>Search</button>
        </div>
      </section>

      <section className="support-cards">
        <div className="support-card">
          <span>Guide</span>
          <h3>Get Started</h3>
          <p>Learn the basics and get your account set up quickly.</p>
        </div>
        <div className="support-card">
          <span>Account</span>
          <h3>Account & Login</h3>
          <p>Manage your profile, passwords, and connected devices.</p>
        </div>
        <div className="support-card">
          <span>AI</span>
          <h3>AI Insights</h3>
          <p>Understand how our AI helps optimize your savings and budget.</p>
        </div>
        <div className="support-card">
          <span>Reports</span>
          <h3>Expenses & Reports</h3>
          <p>Track balances, splits, and download your expense history.</p>
        </div>
        <div className="support-card">
          <span>Help</span>
          <h3>Troubleshooting</h3>
          <p>Fix common problems and get real-time help from support.</p>
        </div>
      </section>

      <section className="contact-section">
        <h2>Contact Our Team</h2>
        <p style={{ color: "#aaa", marginBottom: 30 }}>
          Our support team at <strong style={{ color: "#00ffc8" }}>priyanshsax0709@gmail.com</strong> is ready to help.
        </p>

        <form onSubmit={sendMessage} className="contact-form">
          <input
            placeholder="Your Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Describe your issue or question..."
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            rows={5}
            required
            style={{
              width: "100%", padding: 14, borderRadius: 10, border: "none",
              background: "rgba(255,255,255,0.08)", color: "#fff",
              fontSize: "0.95rem", resize: "vertical", outline: "none",
              fontFamily: "Poppins, sans-serif", marginBottom: 10
            }}
          />
          {status === "success" && (
            <p style={{ color: "#00ffc8", marginBottom: 10 }}>
              Message sent! We will get back to you within 24 hours.
            </p>
          )}
          {status.startsWith("error") && (
            <p style={{ color: "#ff6b6b", marginBottom: 10 }}>{status}</p>
          )}
          <button type="submit" className="primary-btn" disabled={sending} style={{ width: "100%", padding: 14 }}>
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      <section className="explore-section">
        <h2>Explore SaverBuddy</h2>
        <div className="explore-grid">
          <div className="explore-item">
            <h3>Tips & Tricks</h3>
            <p>Discover hidden features to maximize your savings potential.</p>
          </div>
          <div className="explore-item">
            <h3>Mobile App</h3>
            <p>Sync your data and track expenses on the go with our mobile app.</p>
          </div>
          <div className="explore-item">
            <h3>Notifications</h3>
            <p>Set alerts to never miss a bill or expense update again.</p>
          </div>
        </div>
      </section>

      <footer className="support-footer">
        <p>Need direct help? Email us at <span onClick={() => window.location.href = "mailto:priyanshsax0709@gmail.com"}>priyanshsax0709@gmail.com</span></p>
        <p>© {new Date().getFullYear()} SaverBuddy. All rights reserved.</p>
      </footer>
    </div>
  );
}