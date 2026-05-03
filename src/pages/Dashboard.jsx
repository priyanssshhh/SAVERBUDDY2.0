// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    { title: "My Finances", desc: "Track monthly expenses, salary & savings with history.", icon: "💰", path: "/myfinances", color: "#00ffc8" },
    { title: "Bill Splitter", desc: "AI-optimized settlements — minimum transactions.", icon: "🤝", path: "/splitter", color: "#007bff" },
    { title: "AI Advisor", desc: "Personalized AI advice on spending & saving.", icon: "🤖", path: "/ai", color: "#6A5ACD" },
    { title: "Best Deals", desc: "Compare prices across Amazon, Flipkart, Zepto & more.", icon: "🏷️", path: "/deals", color: "#FF8C00" },
    { title: "Investment Advisor", desc: "AI-guided SIP, stocks & savings plan.", icon: "📈", path: "/invest", color: "#00aaff" },
    { title: "Bill Scanner", desc: "Scan receipts — AI auto-adds all expenses.", icon: "📷", path: "/scanner", color: "#FF4D4D" },
    { title: "UPI Tracker", desc: "Paste GPay/Paytm SMS — auto-track expenses.", icon: "📱", path: "/upi", color: "#8B2CF5" },
    { title: "SaverBuddy Pay", desc: "Pay bills & get cashback. Coming soon.", icon: "💳", path: "/pay", color: "#ffae42" },
    { title: "Savings Goals", desc: "Set targets and track progress toward your dreams.", icon: "🎯", path: "/goals", color: "#00c896" },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">
        Welcome to <span>SaverBuddy</span> 🚀
      </h1>
      <p className="dashboard-subtitle">
        All your money tools — one powerful AI dashboard
      </p>

      <div className="dashboard-grid">
        {features.map((item, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(item.path)}
            style={{ "--card-color": item.color }}
          >
            <div className="icon">{item.icon}</div>
            <h3 style={{ color: item.color }}>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}