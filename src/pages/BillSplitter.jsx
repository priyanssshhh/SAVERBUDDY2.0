// src/pages/BillSplitter.jsx
import React, { useState } from "react";
import "./BillSplitter.css";
import { calculateSettlement } from "../services/billSettlement";
// src/pages/BillSplitter.jsx
export { default } from "../components/Splitter";
export default function BillSplitter() {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expense, setExpense] = useState({ title: "", amount: "", paidBy: "" });
  const [settled, setSettled] = useState(false);

  // Add person
  const addPerson = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (people.includes(trimmed)) return alert("Person already added.");
    setPeople([...people, trimmed]);
    setName("");
  };

  // Remove person
  const removePerson = (p) => {
    setPeople(people.filter((x) => x !== p));
    setExpenses(expenses.filter((e) => e.paidBy !== p));
  };

  // Add expense
  const addExpense = () => {
    if (!expense.title || !expense.amount || !expense.paidBy) return;
    if (Number(expense.amount) <= 0) return alert("Amount must be greater than 0.");
    setExpenses([...expenses, { ...expense, amount: Number(expense.amount) }]);
    setExpense({ title: "", amount: "", paidBy: "" });
    setSettled(false);
  };

  // Remove expense
  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
    setSettled(false);
  };

  // Reset everything
  const resetAll = () => {
    setPeople([]);
    setExpenses([]);
    setExpense({ title: "", amount: "", paidBy: "" });
    setName("");
    setSettled(false);
  };

  // Calculate result
  const result =
    people.length >= 2 && expenses.length > 0
      ? calculateSettlement(expenses, people)
      : null;

  const statusColor = (status) => {
    if (status === "receives") return "#00ffc8";
    if (status === "owes") return "#ff6b6b";
    return "#aaa";
  };

  return (
    <div className="splitter-page">
      <h1>🤝 AI Bill Splitter</h1>
      <p className="subtitle">
        Smart settlement — minimum transactions, maximum clarity
      </p>

      {/* ===== ADD PEOPLE ===== */}
      <div className="card">
        <h2>👥 Add Participants</h2>
        <div className="row">
          <input
            placeholder="Person name (e.g. Priyansh)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPerson()}
          />
          <button onClick={addPerson}>Add</button>
        </div>

        {people.length > 0 && (
          <div className="people-list" style={{ marginTop: 12 }}>
            {people.map((p, i) => (
              <span key={i} className="tag" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {p}
                <span
                  onClick={() => removePerson(p)}
                  style={{ cursor: "pointer", color: "#ff6b6b", fontWeight: "bold", marginLeft: 4 }}
                >
                  ✕
                </span>
              </span>
            ))}
          </div>
        )}

        {people.length < 2 && people.length > 0 && (
          <p style={{ color: "#ff9f1c", fontSize: "0.85rem", marginTop: 8 }}>
            ⚠️ Add at least 2 people to split bills.
          </p>
        )}
      </div>

      {/* ===== ADD EXPENSES ===== */}
      {people.length >= 2 && (
        <div className="card">
          <h2>💸 Add Expenses</h2>

          <input
            placeholder="Expense title (e.g. Dinner, Cab, Hotel)"
            value={expense.title}
            onChange={(e) => setExpense({ ...expense, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount (₹)"
            value={expense.amount}
            onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
          />
          <select
            value={expense.paidBy}
            onChange={(e) => setExpense({ ...expense, paidBy: e.target.value })}
          >
            <option value="">Who paid?</option>
            {people.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>

          <button onClick={addExpense} style={{ marginTop: 10 }}>
            ➕ Add Expense
          </button>

          {/* Expense list */}
          {expenses.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ color: "#00ffc8", marginBottom: 8 }}>Added Expenses:</h3>
              {expenses.map((exp, i) => (
                <div
                  key={i}
                  className="result"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span>{exp.title}</span>
                  <span style={{ color: "#00ffc8" }}>₹{exp.amount}</span>
                  <span style={{ color: "#aaa", fontSize: "0.85rem" }}>paid by {exp.paidBy}</span>
                  <span
                    onClick={() => removeExpense(i)}
                    style={{ cursor: "pointer", color: "#ff6b6b", fontWeight: "bold" }}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SETTLEMENT RESULT ===== */}
      {result && (
        <div className="card">
          <h2>🧠 AI Settlement Result</h2>

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "rgba(0,255,200,0.08)", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <p style={{ color: "#aaa", fontSize: "0.85rem" }}>Total Expense</p>
              <p style={{ color: "#00ffc8", fontSize: "1.4rem", fontWeight: "bold" }}>₹{result.totalSpent}</p>
            </div>
            <div style={{ background: "rgba(0,255,200,0.08)", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <p style={{ color: "#aaa", fontSize: "0.85rem" }}>Per Person Share</p>
              <p style={{ color: "#00ffc8", fontSize: "1.4rem", fontWeight: "bold" }}>₹{result.sharePerPerson}</p>
            </div>
          </div>

          {/* Per person balance */}
          <h3 style={{ color: "#fff", marginBottom: 10 }}>📊 Individual Balances</h3>
          {result.summary.map((s, i) => (
            <div
              key={i}
              className="result"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ fontWeight: "bold" }}>{s.person}</span>
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>paid ₹{s.paid}</span>
              <span style={{ color: statusColor(s.status), fontWeight: "bold" }}>
                {s.status === "receives"
                  ? `receives ₹${Math.abs(s.balance)}`
                  : s.status === "owes"
                  ? `owes ₹${Math.abs(s.balance)}`
                  : "✅ settled"}
              </span>
            </div>
          ))}

          <hr style={{ margin: "20px 0", opacity: 0.15 }} />

          {/* Final settlements */}
          <h3 style={{ color: "#fff", marginBottom: 10 }}>💳 Final Settlement Instructions</h3>

          {result.settlements.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ color: "#00ffc8", fontSize: "1.1rem" }}>🎉 Everyone is already settled!</p>
            </div>
          ) : (
            <>
              {result.settlements.map((s, i) => (
                <div
                  key={i}
                  className="result"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 0",
                    fontSize: "1rem",
                  }}
                >
                  <span style={{ fontWeight: "bold", color: "#ff6b6b" }}>{s.from}</span>
                  <span style={{ color: "#aaa" }}>pays</span>
                  <span style={{ fontWeight: "bold", color: "#00ffc8" }}>₹{s.amount}</span>
                  <span style={{ color: "#aaa" }}>to</span>
                  <span style={{ fontWeight: "bold", color: "#00ffc8" }}>{s.to}</span>
                </div>
              ))}

              <div style={{
                marginTop: 16, padding: 12,
                background: "rgba(0,255,200,0.06)",
                borderRadius: 10, textAlign: "center"
              }}>
                <p style={{ color: "#aaa", fontSize: "0.85rem" }}>
                  ✅ {result.settlements.length} transaction{result.settlements.length > 1 ? "s" : ""} needed
                  to settle ₹{result.totalSpent} among {people.length} people
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== RESET ===== */}
      {(people.length > 0 || expenses.length > 0) && (
        <div style={{ textAlign: "center", marginTop: 10, marginBottom: 40 }}>
          <button
            onClick={resetAll}
            style={{
              background: "rgba(255,77,77,0.15)",
              border: "1px solid #ff4d4d",
              color: "#ff6b6b",
              padding: "10px 30px",
              borderRadius: 25,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔄 Reset Everything
          </button>
        </div>
      )}
    </div>
  );
}