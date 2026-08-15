import React, { useState } from "react";
import { SERVER_URL } from "../config";

const platformColors = {
  Amazon: "#FF9900", Flipkart: "#2874F0", Myntra: "#FF3F6C",
  Zepto: "#8B2CF5", Blinkit: "#F8C200", Zomato: "#E23744"
};

function DealCard({ deal, index }) {
  const color = platformColors[deal.platform] || "#007bff";
  return (
    <div className="card" style={{ borderColor: index === 0 ? "#00ffc8" : "rgba(255,255,255,0.1)" }}>
      <h2 style={{ color }}>{deal.platform}</h2>
      <p style={{ fontWeight: 600, margin: "10px 0" }}>{deal.productName}</p>
      <div className="transaction-row">
        <span>Price</span>
        <span style={{ color: "#00ffc8" }}>Rs {deal.price}</span>
      </div>
      <div className="transaction-row">
        <span>Original</span>
        <span style={{ textDecoration: "line-through", color: "#aaa" }}>Rs {deal.originalPrice}</span>
      </div>
      <div className="transaction-row">
        <span>Discount</span>
        <span style={{ color: "#ff9f1c" }}>{deal.discount}</span>
      </div>
      <div className="transaction-row">
        <span>Rating</span>
        <span>{deal.rating}</span>
      </div>
      <p style={{ color: "#aaa", fontSize: "0.85rem", margin: "10px 0" }}>{deal.tip}</p>
      <a
        href={deal.link}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-block", marginTop: 8, padding: "8px 20px", background: color, color: "#fff", borderRadius: 20, textDecoration: "none", fontWeight: "bold" }}
      >
        Buy on {deal.platform}
      </a>
    </div>
  );
}

export default function Deals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findDeals = async () => {
    if (!searchQuery.trim()) return alert("Please enter what you want to buy.");
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(`${SERVER_URL}/api/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, budget }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finance-page">
      <h1>Best Deal Finder</h1>
      <p className="subtitle">Compare prices across Amazon, Flipkart, Myntra, Zepto and more</p>

      <div className="card">
        <h2>Search for the Best Deal</h2>
        <input
          placeholder="What do you want to buy?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          placeholder="Budget in rupees (optional)"
          value={budget}
          type="number"
          onChange={(e) => setBudget(e.target.value)}
          style={{ marginTop: 10 }}
        />
        <button
          className="primary-btn"
          onClick={findDeals}
          disabled={loading}
          style={{ width: "100%", padding: "14px", marginTop: 10 }}
        >
          {loading ? "Searching..." : "Find Best Deals"}
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "#ff4d4d" }}>
          <p style={{ color: "#ff6b6b" }}>{error}</p>
        </div>
      )}

      {result && (
        <div>
          <div className="card" style={{ borderColor: "#00ffc8" }}>
            <h2>Best Pick: {result.bestPick}</h2>
            <p style={{ color: "#aaa", marginTop: 8 }}>{result.savingTip}</p>
          </div>
          {result.deals && result.deals.map((deal, i) => <DealCard key={i} deal={deal} index={i} />)}
        </div>
      )}
    </div>
  );
}