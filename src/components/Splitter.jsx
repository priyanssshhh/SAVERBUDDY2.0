// src/components/Splitter.jsx
import React, { useState } from "react";
import "./Splitter.css";

export default function Splitter() {
  const [people, setPeople] = useState([{ name: "", amount: "" }]);
  const [total, setTotal] = useState(0);

  const addPerson = () => setPeople([...people, { name: "", amount: "" }]);

  const updatePerson = (index, field, value) => {
    const updated = [...people];
    updated[index][field] = value;
    setPeople(updated);
  };

  const calculateSplit = () => {
    const totalAmount = people.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );
    setTotal(totalAmount / people.length);
  };

  return (
    <div className="splitter-container">
      <h2>💸 Smart Expense Splitter</h2>
      {people.map((p, i) => (
        <div className="split-row" key={i}>
          <input
            type="text"
            placeholder="Name"
            value={p.name}
            onChange={(e) => updatePerson(i, "name", e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={p.amount}
            onChange={(e) => updatePerson(i, "amount", e.target.value)}
          />
        </div>
      ))}
      <div className="split-buttons">
        <button onClick={addPerson}>➕ Add Person</button>
        <button onClick={calculateSplit}>🧮 Calculate Split</button>
      </div>

      {total > 0 && (
        <p className="result">
          Each person should pay <strong>₹{total.toFixed(2)}</strong>
        </p>
      )}
    </div>
  );
}
