import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../services/userService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { SERVER_URL } from "../config";

export default function AIAdvisor() {
  const [user, setUser] = useState(null);
  const [salary, setSalary] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);
      const profile = await getUserProfile(u.uid);
      if (profile?.monthlyIncome) setSalary(String(profile.monthlyIncome));

      const q = query(collection(db, "transactions"), where("uid", "==", u.uid));
      const snap = await getDocs(q);
      const now = new Date();
      const current = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => {
          const d = new Date(t.createdAt.seconds * 1000);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

      setTransactions(current);
      setDataLoading(false);
    });
    return () => unsub();
  }, []);

  const getAdvice = async () => {
    if (!salary) return alert("Please save your salary in My Finances or Profile first.");
    if (transactions.length === 0) return alert("Please add at least one expense in My Finances first.");

    setLoading(true);
    setAdvice("");
    try {
      const res = await fetch(`${SERVER_URL}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary, transactions }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdvice(data.text);
    } catch (err) {
      setAdvice("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
  const savings = salary ? Number(salary) - totalSpent : 0;
  const savingsPercent = salary ? ((savings / Number(salary)) * 100).toFixed(1) : 0;

  const categoryTotals = {};
  transactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  return (
    <div className="finance-page">
      <h1>Smart Expense Advisor</h1>
      <p className="subtitle">AI-powered financial guidance based on your real spending data</p>

      {dataLoading ? (
        <div className="card"><p>Loading your financial data...</p></div>
      ) : (
        <>
          <div className="card">
            <h2>This Month's Overview</h2>
            <div className="transaction-row">
              <span>Monthly Salary</span>
              <span style={{ color: "#00ffc8" }}>Rs {salary || "Not set"}</span>
            </div>
            <div className="transaction-row">
              <span>Total Spent</span>
              <span style={{ color: "#ff6b6b" }}>Rs {totalSpent}</span>
            </div>
            <div className="transaction-row">
              <span>Savings</span>
              <span style={{ color: savings >= 0 ? "#00ffc8" : "#ff4d4d" }}>
                Rs {savings} ({savingsPercent}%)
              </span>
            </div>
            {savings < Number(salary) * 0.2 && salary && (
              <p style={{ color: "#ff9f1c", marginTop: 10, fontSize: "0.9rem" }}>
                You are saving less than 20% of your income. AI advice recommended.
              </p>
            )}
          </div>

          {Object.keys(categoryTotals).length > 0 && (
            <div className="card">
              <h2>Category Breakdown</h2>
              {Object.entries(categoryTotals).map(([cat, amt]) => (
                <div key={cat} className="transaction-row">
                  <span>{cat}</span>
                  <span>Rs {amt}</span>
                  <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                    {salary ? ((amt / Number(salary)) * 100).toFixed(1) + "% of salary" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!salary && (
            <div className="card" style={{ borderColor: "#ff9f1c" }}>
              <p>Salary not set. <a href="/myfinances" style={{ color: "#00ffc8" }}>Set it in My Finances</a></p>
            </div>
          )}
          {transactions.length === 0 && (
            <div className="card" style={{ borderColor: "#ff9f1c" }}>
              <p>No expenses this month. <a href="/myfinances" style={{ color: "#00ffc8" }}>Add expenses</a></p>
            </div>
          )}

          <div className="card">
            <button
              className="primary-btn"
              onClick={getAdvice}
              disabled={loading}
              style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
            >
              {loading ? "Analyzing your finances..." : "Get Personalized AI Advice"}
            </button>
          </div>

          {advice && (
            <div className="card" style={{ borderColor: "#00ffc8" }}>
              <h2>Your AI Financial Advisor Says:</h2>
              <pre style={{
                whiteSpace: "pre-wrap", lineHeight: 1.9,
                color: "#e0e0e0", fontFamily: "Poppins, sans-serif",
                fontSize: "0.95rem", marginTop: 12,
              }}>
                {advice}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}