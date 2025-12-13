// src/pages/MyFinances.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../pages/MyFinances.css";
import Splitter from "../components/Splitter";

export default function MyFinances() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchTransactions(currentUser.uid);
    });
    return () => unsub();
  }, []);

  const fetchTransactions = async (uid) => {
    try {
      const q = query(collection(db, "transactions"), where("uid", "==", uid));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    } catch (err) {
      console.error("❌ Firestore fetch error:", err);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first!");
    if (!form.title || !form.amount) return alert("Fill all fields!");

    try {
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category || "Other",
        createdAt: new Date(),
      });
      setForm({ title: "", amount: "", category: "" });
      fetchTransactions(user.uid);
    } catch (err) {
      console.error("❌ Firestore add error:", err);
    }
  };

  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="finance-page">
      <h1>💰 My Finances</h1>
      <p className="subtitle">
        Manage your budget, add expenses, and use AI tools to save smarter.
      </p>

      {/* Add Transaction */}
      <form onSubmit={addTransaction} className="transaction-form">
        <input
          type="text"
          placeholder="Expense Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select Category</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Other</option>
        </select>
        <button type="submit">Add</button>
      </form>

      {/* Summary */}
      <div className="summary-card">
        <h3>Total Spent: ₹{totalSpent}</h3>
      </div>

      {/* Transaction List */}
      <div className="transaction-list">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet. Add your first!</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="transaction-item">
              <span>{t.title}</span>
              <span>₹{t.amount}</span>
              <span>{t.category}</span>
            </div>
          ))
        )}
      </div>

      {/* Smart Splitter */}
      <Splitter />
    </div>
  );
}
