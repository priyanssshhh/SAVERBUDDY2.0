// src/pages/BillSplitter.jsx
import React, { useState } from "react";
import "./BillSplitter.css";

export default function BillSplitter() {
  const [people, setPeople] = useState([{ name: "", paid: 0 }]);
  const [results, setResults] = useState([]);

  const addPerson = () => {
    setPeople([...people, { name: "", paid: 0 }]);
  };

  const handleChange = (index, field, value) => {
    const newPeople = [...people];
    newPeople[index][field] = field === "paid" ? Number(value) : value;
    setPeople(newPeople);
  };

  const calculateSplit = () => {
    const totalPaid = people.reduce((sum, p) => sum + p.paid, 0);
    const avgShare = totalPaid / people.length;

    const owes = people
      .map((p) => ({
        name: p.name || "Unnamed",
        diff: +(p.paid - avgShare).toFixed(2),
      }))
      .sort((a, b) => a.diff - b.diff);

    let i = 0,
      j = owes.length - 1,
      result = [];

    while (i < j) {
      const debt = Math.min(-owes[i].diff, owes[j].diff);
      if (debt > 0) {
        result.push({
          from: owes[i].name,
          to: owes[j].name,
          amount: debt.toFixed(2),
        });
      }
      owes[i].diff += debt;
      owes[j].diff -= debt;
      if (owes[i].diff >= -0.01) i++;
      if (owes[j].diff <= 0.01) j--;
    }

    setResults(result);
  };

  return (
    <div className="splitter-page">
      <h1>🤝 Smart Bill Splitter</h1>
      <p className="subtitle">
        Easily calculate who owes whom — clear and instant results.
      </p>

      <div className="people-container">
        {people.map((person, i) => (
          <div key={i} className="person-row">
            <input
              type="text"
              placeholder="Name"
              value={person.name}
              onChange={(e) => handleChange(i, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount Paid (₹)"
              value={person.paid}
              onChange={(e) => handleChange(i, "paid", e.target.value)}
            />
          </div>
        ))}
        <button className="add-btn" onClick={addPerson}>
          + Add Person
        </button>
      </div>

      <button className="calc-btn" onClick={calculateSplit}>
        Calculate Split
      </button>

      {results.length > 0 && (
        <div className="results">
          <h2>💸 Settlement Summary</h2>
          {results.map((r, i) => (
            <p key={i}>
              <strong>{r.from}</strong> ➜ pays <strong>{r.to}</strong> ₹{r.amount}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
