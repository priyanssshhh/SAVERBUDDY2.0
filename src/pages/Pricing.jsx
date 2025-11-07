// src/pages/Pricing.jsx
import React from "react";
import "./Pricing.css";

const Pricing = () => {
  const plans = [
    {
      name: "Free Plan",
      price: "₹0 /month",
      features: [
        "AI Budget Assistant (Basic)",
        "Expense Splitter (Up to 5 People)",
        "Limited Reports & Insights",
        "Basic Expense Manager",
      ],
      highlight: false,
      color: "#00ffc8",
    },
    {
      name: "SaverBuddy Pro",
      price: "₹99 /month",
      features: [
        "Unlimited Expense Splitter",
        "Advanced AI Insights",
        "Smart Savings Recommendations",
        "Custom Categories",
        "Ad-Free Experience",
      ],
      highlight: true,
      color: "#007bff",
    },
    {
      name: "SaverBuddy Premium",
      price: "₹199 /month",
      features: [
        "All Pro Features",
        "Priority Support",
        "Cloud Sync & Backup",
        "Multi-Device Access",
        "Early Access to New Tools",
      ],
      highlight: false,
      color: "#ffae42",
    },
  ];

  return (
    <div className="pricing-page">
      <h1>
        Choose Your <span style={{ color: "#00ffc8" }}>SaverBuddy Plan</span>
      </h1>
      <p className="subtitle">
        Smart, affordable plans designed for students, professionals, and teams.
      </p>

      <div className="plans-container">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`plan-card ${plan.highlight ? "highlight" : ""}`}
            style={{ borderColor: plan.color }}
          >
            <h2 style={{ color: plan.color }}>{plan.name}</h2>
            <h3>{plan.price}</h3>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>✅ {feature}</li>
              ))}
            </ul>
            <button
              className="subscribe-btn"
              style={{
                background: `linear-gradient(90deg, ${plan.color}, #00aaff)`,
              }}
            >
              {plan.price === "₹0 /month" ? "Get Started" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
