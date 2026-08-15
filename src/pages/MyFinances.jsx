import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getUserPlan, getUserProfile, updateUserProfile } from "../services/userService";
import "./MyFinances.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CATEGORIES = ["Food", "Bills", "Shopping", "Travel", "Other"];
const COLORS = ["#00FFC8", "#FF8C00", "#FF4D4D", "#6A5ACD", "#1E90FF"];

export default function MyFinances() {
  const [user, setUser] = useState(null);
  const [salary, setSalary] = useState("");
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState({});
  const [form, setForm] = useState({ title: "", amount: "", category: "Food" });
  const [savingSalary, setSavingSalary] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);
      getUserPlan(u.uid);
      const profile = await getUserProfile(u.uid);
      if (profile?.monthlyIncome) setSalary(String(profile.monthlyIncome));
      fetchTransactions(u.uid);
    });
    return () => unsub();
  }, []);

  const fetchTransactions = async (uid) => {
    const q = query(collection(db, "transactions"), where("uid", "==", uid));
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const currentMonth = [];
    const past = {};

    all.forEach((t) => {
      const date = new Date(t.createdAt.seconds * 1000);
      const label = date.toLocaleString("default", { month: "long", year: "numeric" });
      if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
        currentMonth.push(t);
      } else {
        if (!past[label]) past[label] = [];
        past[label].push(t);
      }
    });

    const hq = query(collection(db, "history"), where("uid", "==", uid));
    const hsnap = await getDocs(hq);
    hsnap.docs.forEach((d) => {
      const data = { id: d.id, ...d.data() };
      const label = data.monthLabel || "Archived";
      if (!past[label]) past[label] = [];
      if (!past[label].find((x) => x.id === data.id)) past[label].push(data);
    });

    setCurrent(currentMonth);
    setHistory(past);
  };

  const saveSalary = async () => {
    if (!user || !salary) return;
    setSavingSalary(true);
    await updateUserProfile(user.uid, { monthlyIncome: Number(salary) });
    setSavingSalary(false);
    alert("Salary saved!");
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, "transactions"), {
      uid: user.uid,
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      createdAt: new Date(),
    });
    setForm({ title: "", amount: "", category: "Food" });
    fetchTransactions(user.uid);
  };

  const endMonth = async () => {
    if (!user || current.length === 0) return;
    const confirmReset = window.confirm(
      "End current month? All expenses will be archived to history and the month resets."
    );
    if (!confirmReset) return;

    const now = new Date();
    const label = now.toLocaleString("default", { month: "long", year: "numeric" });

    for (let t of current) {
      await addDoc(collection(db, "history"), { ...t, archivedAt: new Date(), monthLabel: label });
      await deleteDoc(doc(db, "transactions", t.id));
    }

    fetchTransactions(user.uid);
    alert("Month ended! Data saved to history.");
  };

  const categoryTotals = {};
  current.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: "Expenses Rs",
      data: Object.values(categoryTotals),
      backgroundColor: Object.keys(categoryTotals).map((_, i) => COLORS[i % COLORS.length]),
      borderRadius: 8,
    }],
  };

  const totalSpent = current.reduce((sum, t) => sum + t.amount, 0);
  const savings = salary ? Number(salary) - totalSpent : null;

  return (
    <div className="finance-page">
      <h1>My Finances</h1>

      <div className="card">
        <h2>Monthly Salary</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Enter monthly salary (Rs)"
            value={salary}
            type="number"
            onChange={(e) => setSalary(e.target.value)}
          />
          <button className="primary-btn" onClick={saveSalary} style={{ whiteSpace: "nowrap" }}>
            {savingSalary ? "Saving..." : "Save"}
          </button>
        </div>
        {salary && (
          <div style={{ marginTop: 12, display: "flex", gap: 20 }}>
            <span style={{ color: "#aaa" }}>Salary: <strong style={{ color: "#00ffc8" }}>Rs {salary}</strong></span>
            <span style={{ color: "#aaa" }}>Spent: <strong style={{ color: "#ff6b6b" }}>Rs {totalSpent}</strong></span>
            {savings !== null && (
              <span style={{ color: "#aaa" }}>
                Savings: <strong style={{ color: savings >= 0 ? "#00ffc8" : "#ff4d4d" }}>Rs {savings}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Add Expense</h2>
        <form onSubmit={addTransaction} className="expense-form">
          <input
            placeholder="Expense title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Amount (Rs)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="primary-btn" type="submit">Add Expense</button>
        </form>
      </div>

      <div className="card">
        <div className="section-header">
          <h2>Current Month</h2>
          <button className="reset-btn" onClick={endMonth}>End Month</button>
        </div>
        <p style={{ marginBottom: 12 }}>
          <strong>Total Spent:</strong> <span style={{ color: "#ff6b6b" }}>Rs {totalSpent}</span>
        </p>
        {current.length === 0 ? (
          <p style={{ color: "#aaa" }}>No expenses this month yet.</p>
        ) : (
          current.map((t) => (
            <div key={t.id} className="transaction-row">
              <span>{t.title}</span>
              <span style={{ color: "#ff6b6b" }}>Rs {t.amount}</span>
              <span style={{ color: "#00ffc8", fontSize: "0.85rem" }}>{t.category}</span>
            </div>
          ))
        )}
      </div>

      {current.length > 0 && (
        <div className="card">
          <h2>Spending Breakdown</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      )}

      {Object.keys(history).length > 0 && (
        <div className="card">
          <h2>Past Months</h2>
          {Object.entries(history).map(([month, items]) => {
            const monthTotal = items.reduce((s, t) => s + t.amount, 0);
            return (
              <div key={month} className="history-block" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <h3 style={{ color: "#00ffc8" }}>{month}</h3>
                  <span style={{ color: "#aaa" }}>Total: Rs {monthTotal}</span>
                </div>
                {items.map((t) => (
                  <div key={t.id} className="transaction-row faded">
                    <span>{t.title}</span>
                    <span>Rs {t.amount}</span>
                    <span style={{ fontSize: "0.85rem" }}>{t.category}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}