// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Bill Splitter",
      desc: "Split bills & see who pays whom exactly.",
      icon: "🤝",
      path: "/splitter",
    },
    {
      title: "My Finances",
      desc: "Track expenses, income & savings.",
      icon: "💰",
      path: "/myfinances",
    },
    {
      title: "AI Assistant",
      desc: "Smart budgeting & saving suggestions.",
      icon: "🤖",
      path: "/ai",
    },
    {
      title: "Best Deals",
      desc: "Find best market deals & coupons.",
      icon: "🏷️",
      path: "/deals",
    },
    {
      title: "Where to Invest",
      desc: "Guidance on saving & investing money.",
      icon: "📈",
      path: "/invest",
    },
    {
      title: "SaverBuddy Pay",
      desc: "Pay bills & get cashback offers.",
      icon: "💳",
      path: "/pay",
    },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">
        Welcome to <span>SaverBuddy</span> 🚀
      </h1>
      <p className="dashboard-subtitle">
        All your money tools — one powerful dashboard
      </p>

      <div className="dashboard-grid">
        {features.map((item, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(item.path)}
          >
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
