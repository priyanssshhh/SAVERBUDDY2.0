import React, { useState } from "react";
import "./BillSplitter.css";
import { calculateSettlement } from "../services/billSettlement";

export default function BillSplitter() {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    paidBy: "",
  });

  // ➕ Add person
  const addPerson = () => {
    if (!name.trim()) return;
    setPeople([...people, name]);
    setName("");
  };

  // ➕ Add expense
  const addExpense = () => {
    if (!expense.title || !expense.amount || !expense.paidBy) return;
    setExpenses([...expenses, expense]);
    setExpense({ title: "", amount: "", paidBy: "" });
  };

  // 🧠 AI Settlement Result
  const result =
    people.length > 0 && expenses.length > 0
      ? calculateSettlement(expenses, people)
      : null;

  return (
    <div className="splitter-page">
      <h1>🤝 AI Bill Splitter</h1>
      <p className="subtitle">
        Advanced AI-based settlement — minimum transactions, maximum clarity.
      </p>

      {/* 👥 Add People */}
      <div className="card">
        <h2>Add People</h2>
        <div className="row">
          <input
            placeholder="Person name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={addPerson}>Add</button>
        </div>

        <div className="people-list">
          {people.map((p, i) => (
            <span key={i} className="tag">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* 💸 Add Expense */}
      <div className="card">
        <h2>Add Expense</h2>

        <input
          placeholder="Expense title"
          value={expense.title}
          onChange={(e) =>
            setExpense({ ...expense, title: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Amount"
          value={expense.amount}
          onChange={(e) =>
            setExpense({ ...expense, amount: Number(e.target.value) })
          }
        />

        <select
          value={expense.paidBy}
          onChange={(e) =>
            setExpense({ ...expense, paidBy: e.target.value })
          }
        >
          <option value="">Paid by</option>
          {people.map((p, i) => (
            <option key={i}>{p}</option>
          ))}
        </select>

        <button onClick={addExpense}>Add Expense</button>
      </div>

      {/* 📊 AI Settlement Results */}
      <div className="card">
        <h2>🧠 AI Settlement</h2>

        {!result && <p>No expenses yet</p>}

        {result && (
          <>
            <p>
              <strong>Total Spent:</strong> ₹{result.totalSpent}
            </p>
            <p>
              <strong>Each Person Pays:</strong> ₹{result.sharePerPerson}
            </p>

            <hr style={{ margin: "15px 0", opacity: 0.2 }} />

            {result.settlements.length === 0 ? (
              <p>Everyone is settled 🎉</p>
            ) : (
              result.settlements.map((s, i) => (
                <div key={i} className="result">
                  👉 <strong>{s.from}</strong> pays{" "}
                  <strong>₹{s.amount}</strong> to{" "}
                  <strong>{s.to}</strong>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
