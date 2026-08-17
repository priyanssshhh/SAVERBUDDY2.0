import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function SavingsGoals() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: "", targetAmount: "", currentSaved: "", monthlySaving: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setLoading(false);
        return;
      }
      setUser(u);
      try {
        await fetchGoals(u.uid);
      } catch (err) {
        console.error("Error fetching goals:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchGoals = async (uid) => {
    const q = query(collection(db, "savingsGoals"), where("uid", "==", uid));
    const snap = await getDocs(q);
    setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addGoal = async () => {
    if (!form.name || !form.targetAmount) return alert("Fill goal name and target amount.");
    if (!user) return;
    try {
      await addDoc(collection(db, "savingsGoals"), {
        uid: user.uid,
        name: form.name,
        targetAmount: Number(form.targetAmount),
        currentSaved: Number(form.currentSaved) || 0,
        monthlySaving: Number(form.monthlySaving) || 0,
        createdAt: new Date(),
      });
      setForm({ name: "", targetAmount: "", currentSaved: "", monthlySaving: "" });
      await fetchGoals(user.uid);
    } catch (err) {
      alert("Error saving goal: " + err.message);
    }
  };

  const deleteGoal = async (id) => {
    await deleteDoc(doc(db, "savingsGoals", id));
    setGoals(goals.filter(g => g.id !== id));
  };

  const addToSavings = async (goal, amount) => {
    const newSaved = Math.min(goal.currentSaved + amount, goal.targetAmount);
    await updateDoc(doc(db, "savingsGoals", goal.id), { currentSaved: newSaved });
    await fetchGoals(user.uid);
  };

  const getMonthsLeft = (goal) => {
    const remaining = goal.targetAmount - goal.currentSaved;
    if (goal.monthlySaving <= 0 || remaining <= 0) return null;
    return Math.ceil(remaining / goal.monthlySaving);
  };

  const getTargetDate = (monthsLeft) => {
    if (!monthsLeft) return null;
    const d = new Date();
    d.setMonth(d.getMonth() + monthsLeft);
    return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="finance-page">
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "#aaa" }}>Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="finance-page">
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "#aaa" }}>Please <a href="/login" style={{ color: "#00ffc8" }}>log in</a> to view your savings goals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-page">
      <h1>Savings Goals</h1>
      <p className="subtitle">Set targets, track progress, achieve dreams</p>

      <div className="card">
        <h2>New Goal</h2>
        <input
          placeholder="Goal name (e.g. New iPhone, Trip to Goa)"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Target amount (Rs)"
          value={form.targetAmount}
          onChange={e => setForm({ ...form, targetAmount: e.target.value })}
        />
        <input
          type="number"
          placeholder="Already saved (Rs)"
          value={form.currentSaved}
          onChange={e => setForm({ ...form, currentSaved: e.target.value })}
        />
        <input
          type="number"
          placeholder="Monthly saving amount (Rs)"
          value={form.monthlySaving}
          onChange={e => setForm({ ...form, monthlySaving: e.target.value })}
        />
        <button className="primary-btn" onClick={addGoal} style={{ width: "100%", padding: 14, marginTop: 4 }}>
          Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "#aaa" }}>No goals yet. Create your first savings goal above.</p>
        </div>
      ) : (
        goals.map(goal => {
          const pct = Math.min((goal.currentSaved / goal.targetAmount) * 100, 100).toFixed(1);
          const monthsLeft = getMonthsLeft(goal);
          const targetDate = getTargetDate(monthsLeft);
          const done = goal.currentSaved >= goal.targetAmount;

          return (
            <div key={goal.id} className="card" style={{ borderColor: done ? "#00ffc8" : "rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0 }}>{goal.name}</h2>
                  <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: 4 }}>
                    Rs {goal.currentSaved.toLocaleString()} of Rs {goal.targetAmount.toLocaleString()}
                  </p>
                </div>
                {done
                  ? <span style={{ color: "#00ffc8", fontSize: "1.2rem", fontWeight: "bold" }}>Done!</span>
                  : <span onClick={() => deleteGoal(goal.id)} style={{ color: "#ff6b6b", cursor: "pointer", fontSize: "1.2rem" }}>x</span>
                }
              </div>

              <div style={{ margin: "14px 0 6px", background: "rgba(255,255,255,0.08)", borderRadius: 10, height: 12 }}>
                <div style={{
                  width: `${pct}%`,
                  background: done ? "#00ffc8" : "linear-gradient(90deg,#00ffc8,#007bff)",
                  borderRadius: 10, height: 12, transition: "width 0.5s"
                }} />
              </div>
              <p style={{ color: "#aaa", fontSize: "0.82rem" }}>{pct}% complete</p>

              {!done && monthsLeft && (
                <p style={{ color: "#ff9f1c", fontSize: "0.85rem", marginTop: 8 }}>
                  Target: {targetDate} ({monthsLeft} months at Rs {goal.monthlySaving}/month)
                </p>
              )}
              {done && <p style={{ color: "#00ffc8", fontWeight: "bold", marginTop: 8 }}>Goal achieved!</p>}

              {!done && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {[500, 1000, 5000].map(amt => (
                    <button key={amt} onClick={() => addToSavings(goal, amt)}
                      style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: "rgba(0,255,200,0.12)", color: "#00ffc8", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>
                      +Rs {amt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}