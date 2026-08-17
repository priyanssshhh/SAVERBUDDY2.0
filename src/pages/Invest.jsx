import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../services/userService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { SERVER_URL } from "../config";

export default function Invest() {
  const [salary, setSalary] = useState("");
  const [goal, setGoal] = useState("");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [stocks, setStocks] = useState([]);
  const [stocksSource, setStocksSource] = useState("");
  const [activeTab, setActiveTab] = useState("advisor");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      const profile = await getUserProfile(u.uid);
      if (profile?.monthlyIncome) setSalary(String(profile.monthlyIncome));
      const q = query(collection(db, "transactions"), where("uid", "==", u.uid));
      const snap = await getDocs(q);
      const now = new Date();
      const total = snap.docs.map(d => d.data())
        .filter(t => { const d = new Date(t.createdAt.seconds * 1000); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
        .reduce((s, t) => s + t.amount, 0);
      setTotalExpenses(total);
      setDataLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/stocks`);
      const data = await res.json();
      setStocks(data.stocks || []);
      setStocksSource(data.source || "");
    } catch (err) {
      console.error("Stock fetch error:", err);
    }
  };

  const getAdvice = async () => {
    if (!salary) return alert("Please set your salary in My Finances or Profile first.");
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const savings = Math.max(0, Number(salary) - totalExpenses);
      const res = await fetch(`${SERVER_URL}/api/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary, totalExpenses, savings, goal }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = { Low: "#00ffc8", Medium: "#ff9f1c", High: "#ff4d4d" };
  const savings = Math.max(0, Number(salary) - totalExpenses);

  return (
    <div className="finance-page">
      <h1>Smart Investment Advisor</h1>
      <p className="subtitle">AI-powered SIP, stock and savings recommendations based on your real finances</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["advisor", "stocks"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 24px", borderRadius: 25, border: "none", cursor: "pointer",
            fontWeight: "bold", fontSize: "0.9rem",
            background: activeTab === tab ? "linear-gradient(90deg,#00ffc8,#007bff)" : "rgba(255,255,255,0.08)",
            color: activeTab === tab ? "#000" : "#fff",
          }}>
            {tab === "advisor" ? "Investment Advisor" : "Market Watch"}
          </button>
        ))}
      </div>

      {activeTab === "stocks" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ color: "#00ffc8" }}>Nifty 50 Stocks</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {stocksSource === "simulated" && (
                <span style={{ fontSize: "0.75rem", color: "#ff9f1c", background: "rgba(255,159,28,0.1)", padding: "4px 10px", borderRadius: 20 }}>
                  Simulated
                </span>
              )}
              {stocksSource === "live" && (
                <span style={{ fontSize: "0.75rem", color: "#00ffc8", background: "rgba(0,255,200,0.1)", padding: "4px 10px", borderRadius: 20 }}>
                  Live Data
                </span>
              )}
              <button onClick={fetchStocks} style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid rgba(0,255,200,0.3)", background: "transparent", color: "#00ffc8", cursor: "pointer", fontSize: "0.85rem" }}>
                Refresh
              </button>
            </div>
          </div>

          {stocks.length === 0 ? (
            <div className="card"><p style={{ color: "#aaa", textAlign: "center" }}>Loading market data...</p></div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {stocks.map((stock, i) => {
                const isPositive = parseFloat(stock.change) >= 0;
                return (
                  <div key={i} className="card" style={{ padding: 16, borderColor: isPositive ? "rgba(0,255,200,0.2)" : "rgba(255,107,107,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontWeight: "bold", fontSize: "1rem" }}>{stock.symbol}</p>
                        <p style={{ color: "#aaa", fontSize: "0.75rem" }}>NSE</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: isPositive ? "#00ffc8" : "#ff6b6b" }}>Rs {stock.price}</p>
                        <p style={{ fontSize: "0.85rem", color: isPositive ? "#00ffc8" : "#ff6b6b" }}>
                          {isPositive ? "+" : ""}{stock.change} ({stock.changePercent})
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: "0.8rem", color: "#aaa" }}>
                      <span>H: Rs {stock.high}</span>
                      <span>L: Rs {stock.low}</span>
                    </div>
                    <div style={{ marginTop: 10, padding: "6px 12px", background: "rgba(0,255,200,0.06)", borderRadius: 8, textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "#555" }}>Buy/Sell coming soon in Pro</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "advisor" && (
        <>
          {dataLoading ? (
            <div className="card"><p>Loading your financial data...</p></div>
          ) : (
            <>
              <div className="card">
                <h2>Your Financial Snapshot</h2>
                <div className="transaction-row"><span>Monthly Salary</span><span style={{ color: "#00ffc8" }}>Rs {salary || "Not set"}</span></div>
                <div className="transaction-row"><span>This Month's Expenses</span><span style={{ color: "#ff6b6b" }}>Rs {totalExpenses}</span></div>
                <div className="transaction-row"><span>Available to Invest</span><span style={{ color: savings > 0 ? "#00ffc8" : "#ff4d4d", fontWeight: "bold" }}>Rs {savings}</span></div>
              </div>

              <div className="card">
                <h2>Your Investment Goal</h2>
                <input placeholder="e.g. Buy a car in 2 years, Save for education, Retire at 45" value={goal} onChange={(e) => setGoal(e.target.value)} />
                <button className="primary-btn" onClick={getAdvice} disabled={loading} style={{ width: "100%", padding: 14, marginTop: 12, fontSize: "1rem" }}>
                  {loading ? "AI is building your investment plan..." : "Get My Investment Plan"}
                </button>
              </div>

              {error && <div className="card" style={{ borderColor: "#ff4d4d" }}><p style={{ color: "#ff6b6b" }}>{error}</p></div>}

              {result && (
                <>
                  <div className="card" style={{ borderColor: "#00ffc8" }}>
                    <h2>Assessment</h2>
                    <p style={{ color: "#00ffc8", fontSize: "1.05rem" }}>{result.summary}</p>
                    {result.emergencyFund && <p style={{ color: "#aaa", marginTop: 10, fontSize: "0.9rem" }}>Emergency Fund: {result.emergencyFund}</p>}
                  </div>
                  <h2 style={{ textAlign: "center", margin: "20px 0 10px" }}>Recommended Investment Plan</h2>
                  {result.recommendations?.map((rec, i) => (
                    <div key={i} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#aaa", textTransform: "uppercase" }}>{rec.type}</span>
                          <h2 style={{ fontSize: "1.1rem", marginTop: 4 }}>{rec.name}</h2>
                        </div>
                        <span style={{ background: riskColor[rec.risk] + "22", color: riskColor[rec.risk], padding: "4px 12px", borderRadius: 20, fontSize: "0.85rem", fontWeight: "bold" }}>
                          {rec.risk} Risk
                        </span>
                      </div>
                      <div className="transaction-row" style={{ marginTop: 12 }}><span>Monthly Investment</span><span style={{ color: "#00ffc8", fontWeight: "bold" }}>Rs {rec.amount}</span></div>
                      <div className="transaction-row"><span>Expected Return</span><span style={{ color: "#ff9f1c" }}>{rec.expectedReturn}</span></div>
                      <p style={{ color: "#aaa", fontSize: "0.88rem", marginTop: 10 }}>{rec.reason}</p>
                    </div>
                  ))}
                  {result.warnings?.length > 0 && (
                    <div className="card" style={{ borderColor: "#ff4d4d" }}>
                      <h2 style={{ color: "#ff4d4d" }}>Important Warnings</h2>
                      {result.warnings.map((w, i) => <p key={i} style={{ color: "#ffaaaa", marginTop: 8 }}>• {w}</p>)}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}