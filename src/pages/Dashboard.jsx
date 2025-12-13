// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Expense Tracker",
      desc: "Track your spending, set budgets, and visualize your flow.",
      icon: "💰",
      path: "/myfinances",
    },
    {
      title: "Bill Splitter",
      desc: "Split bills seamlessly with friends, roommates, or colleagues.",
      icon: "🤝",
      path: "/splitter",
    },
    {
      title: "Best from the Market",
      desc: "Discover best deals, discounts, and offers just for you.",
      icon: "🏷️",
      path: "/deals",
    },
    {
      title: "AI Assistant",
      desc: "Get smart saving & investment suggestions using AI.",
      icon: "🤖",
      path: "/ai",
    },
    {
      title: "Smart Investments",
      desc: "Let SaverBuddy guide where your saved money should go.",
      icon: "📈",
      path: "/invest",
    },
    {
      title: "Pay via SaverBuddy",
      desc: "Use SaverBuddy Pay for cashback & exclusive coupons.",
      icon: "💳",
      path: "/pay",
    },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome to SaverBuddy Dashboard 🎉</h1>
      <p className="dashboard-subtitle">
        Manage your budget, track spending, explore AI insights & more — all in one place.
      </p>

      <div className="features-grid">
        {features.map((f, i) => (
          <div
            key={i}
            className="feature-card"
            onClick={() => navigate(f.path)}
          >
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
