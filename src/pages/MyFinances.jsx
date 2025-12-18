import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getUserPlan } from "../services/userService";
import "./MyFinances.css";

/* ===== CHART ===== */
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function MyFinances() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("FREE");
  const [salary, setSalary] = useState("");

  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState({});

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
  });

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);
      setPlan(await getUserPlan(u.uid));
      fetchTransactions(u.uid);
    });
    return () => unsub();
  }, []);

  /* ================= FETCH ================= */
  const fetchTransactions = async (uid) => {
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", uid)
    );
    const snap = await getDocs(q);

    const all = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const currentMonth = [];
    const past = {};

    all.forEach((t) => {
      const date = new Date(t.createdAt.seconds * 1000);
      const m = date.getMonth();
      const y = date.getFullYear();
      const label = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (m === thisMonth && y === thisYear) {
        currentMonth.push(t);
      } else {
        if (!past[label]) past[label] = [];
        past[label].push(t);
      }
    });

    setCurrent(currentMonth);
    setHistory(past);
  };

  /* ================= ADD ================= */
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

  /* ================= END MONTH ================= */
  const endMonth = async () => {
    if (!user || current.length === 0) return;

    const confirmReset = window.confirm(
      "End current month? Expenses will move to history."
    );
    if (!confirmReset) return;

    for (let t of current) {
      await deleteDoc(doc(db, "transactions", t.id));
    }

    fetchTransactions(user.uid);
  };

  /* ================= CHART ================= */
  const categoryTotals = {};
  current.forEach((t) => {
    categoryTotals[t.category] =
      (categoryTotals[t.category] || 0) + t.amount;
  });

  const COLORS = [
    "#00FFC8",
    "#FF8C00",
    "#FF4D4D",
    "#6A5ACD",
    "#1E90FF",
    "#FFD700",
  ];

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Expenses ₹",
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          (_, i) => COLORS[i % COLORS.length]
        ),
        borderRadius: 8,
      },
    ],
  };

  const totalSpent = current.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  /* ================= UI ================= */
  return (
    <div className="finance-page">
      <h1>💰 My Finances</h1>

      {/* INPUT CARD */}
      <div className="card">
        <input
          placeholder="Monthly Salary (₹)"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />

        <form onSubmit={addTransaction} className="expense-form">
          <input
            placeholder="Expense title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            required
          />
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option>Food</option>
            <option>Bills</option>
            <option>Shopping</option>
            <option>Travel</option>
            <option>Other</option>
          </select>

          <button className="primary-btn">
            Add Expense
          </button>
        </form>
      </div>

      {/* CURRENT MONTH */}
      <div className="card">
        <div className="section-header">
          <h2>📊 Current Month</h2>
          <button className="reset-btn" onClick={endMonth}>
            🔄 End Month
          </button>
        </div>

        <p><strong>Total Spent:</strong> ₹{totalSpent}</p>

        {current.length === 0 && <p>No expenses yet.</p>}

        {current.map((t) => (
          <div key={t.id} className="transaction-row">
            <span>{t.title}</span>
            <span>₹{t.amount}</span>
            <span>{t.category}</span>
          </div>
        ))}
      </div>

      {/* CHART */}
      {current.length > 0 && (
        <div className="card">
          <h2>📈 Monthly Breakdown</h2>
          <Bar data={chartData} />
        </div>
      )}

      {/* HISTORY */}
      {Object.keys(history).length > 0 && (
        <div className="card">
          <h2>📁 Past Months</h2>

          {Object.entries(history).map(([month, items]) => (
            <div key={month} className="history-block">
              <h3>{month}</h3>
              {items.map((t) => (
                <div
                  key={t.id}
                  className="transaction-row faded"
                >
                  <span>{t.title}</span>
                  <span>₹{t.amount}</span>
                  <span>{t.category}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
