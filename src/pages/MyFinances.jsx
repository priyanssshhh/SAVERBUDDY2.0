// src/pages/MyFinances.jsx
import React from "react";
import "../pages/MyFinances.css";

export default function MyFinances() {
  return (
    <div className="finances-page">
      <h1>💰 My Finances</h1>
      <p>Manage your budget, expenses, and savings goals all in one place.</p>

      <div className="finances-grid">
        <div className="card">
          <h3>📊 Budget Overview</h3>
          <p>Track your monthly income and spending automatically.</p>
        </div>
        <div className="card">
          <h3>🧾 Expense History</h3>
          <p>View and categorize your past transactions easily.</p>
        </div>
        <div className="card">
          <h3>🎯 Savings Goals</h3>
          <p>Set personal targets and monitor your progress.</p>
        </div>
      </div>
    </div>
  );
}
