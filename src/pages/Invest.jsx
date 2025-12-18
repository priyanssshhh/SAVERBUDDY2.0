import React, { useState } from "react";

export default function Invest() {
  const [income, setIncome] = useState("");
  const [goal, setGoal] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:5000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salary: income,
          transactions: [
            {
              title: "Goal",
              amount: 0,
              category: goal,
            },
          ],
        }),
      });

      const data = await res.json();
      setResponse(data.text);
    } catch {
      setResponse("AI service unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finance-page">
      <h1>📈 Smart Invest & Deals</h1>

      <input
        placeholder="Monthly Income (₹)"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
      />

      <input
        placeholder="Goal (Savings / Investment / Reduce Bills)"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <button onClick={askAI}>
        {loading ? "Thinking..." : "🧠 Get Smart Advice"}
      </button>

      {response && <pre>{response}</pre>}
    </div>
  );
}
