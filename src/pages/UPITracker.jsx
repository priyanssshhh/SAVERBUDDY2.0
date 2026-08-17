import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { SERVER_URL } from "../config";

const PLATFORMS = {
  gpay:    { name: "Google Pay", color: "#4285F4" },
  paytm:   { name: "Paytm",      color: "#00BAF2" },
  phonepe: { name: "PhonePe",    color: "#5f259f" },
  bank:    { name: "Bank",       color: "#00ffc8" },
  manual:  { name: "Manual",     color: "#ff9f1c" },
  other:   { name: "Other",      color: "#aaa"    },
};

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Other"];

const CATEGORY_COLORS = {
  Food: "#FF6B6B", Travel: "#4ECDC4", Shopping: "#FF8C00",
  Bills: "#6A5ACD", Entertainment: "#FF69B4", Health: "#00ffc8", Other: "#aaa",
};

const MOCK_TRANSACTIONS = [
  { merchant: "Zomato Order", amount: 320, type: "debit", platform: "gpay", category: "Food", date: new Date() },
  { merchant: "Ola Cab", amount: 180, type: "debit", platform: "paytm", category: "Travel", date: new Date(Date.now() - 86400000) },
  { merchant: "Amazon Purchase", amount: 1299, type: "debit", platform: "phonepe", category: "Shopping", date: new Date(Date.now() - 172800000) },
  { merchant: "Electricity Bill", amount: 850, type: "debit", platform: "paytm", category: "Bills", date: new Date(Date.now() - 259200000) },
  { merchant: "Netflix", amount: 199, type: "debit", platform: "gpay", category: "Entertainment", date: new Date(Date.now() - 345600000) },
  { merchant: "Salary Credit", amount: 50000, type: "credit", platform: "bank", category: "Other", date: new Date(Date.now() - 432000000) },
  { merchant: "Swiggy Order", amount: 250, type: "debit", platform: "phonepe", category: "Food", date: new Date(Date.now() - 518400000) },
  { merchant: "Metro Recharge", amount: 200, type: "debit", platform: "gpay", category: "Travel", date: new Date(Date.now() - 604800000) },
];

export default function UPITracker() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inputMode, setInputMode] = useState("sms");
  const [inputText, setInputText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ period: "month", platform: "all", category: "all" });
  const csvRef = useRef();

  const [manualForm, setManualForm] = useState({
    merchant: "", amount: "", type: "debit",
    platform: "gpay", category: "Food", note: "", date: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);
      await fetchTransactions(u.uid);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchTransactions = async (uid) => {
    try {
      const q = query(collection(db, "upiTransactions"), where("uid", "==", uid));
      const snap = await getDocs(q);
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
          const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
          return dateB - dateA;
        });
      setTransactions(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const saveTransactions = async (txList) => {
    if (!user) return;
    for (const tx of txList) {
      await addDoc(collection(db, "upiTransactions"), {
        uid: user.uid,
        merchant: tx.merchant || "Unknown",
        amount: Number(tx.amount),
        type: tx.type || "debit",
        platform: tx.platform || "other",
        category: tx.category || "Other",
        note: tx.note || "",
        date: tx.date ? new Date(tx.date) : new Date(),
        source: tx.source || "manual",
        createdAt: new Date(),
      });
    }
    await fetchTransactions(user.uid);
  };

  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, "upiTransactions", id));
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const parseSMS = async () => {
    if (!inputText.trim()) return alert("Paste your SMS first.");
    setParsing(true); setParsed(null); setError("");
    try {
      const res = await fetch(`${SERVER_URL}/api/parse-upi`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsText: inputText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.transactions?.length) throw new Error("No transactions found.");
      setParsed(data.transactions.map((t) => ({ ...t, source: "sms" })));
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const parseEmail = async () => {
    if (!inputText.trim()) return alert("Paste your email content first.");
    setParsing(true); setParsed(null); setError("");
    try {
      const res = await fetch(`${SERVER_URL}/api/parse-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText: inputText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.transactions?.length) throw new Error("No transactions found in email.");
      setParsed(data.transactions.map((t) => ({ ...t, source: "email" })));
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const parseCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    setParsing(true); setParsed(null); setError("");
    try {
      const res = await fetch(`${SERVER_URL}/api/parse-csv`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.transactions?.length) throw new Error("No transactions found in CSV.");
      setParsed(data.transactions.map((t) => ({ ...t, source: "csv" })));
    } catch (err) {
      setError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const addManual = async () => {
    if (!manualForm.merchant || !manualForm.amount) return alert("Fill merchant and amount.");
    await saveTransactions([{ ...manualForm, source: "manual" }]);
    setManualForm({ merchant: "", amount: "", type: "debit", platform: "gpay", category: "Food", note: "", date: "" });
    alert("Transaction added!");
  };

  const loadMockData = async () => {
    if (!window.confirm("Load sample demo transactions?")) return;
    await saveTransactions(MOCK_TRANSACTIONS.map((t) => ({ ...t, source: "mock" })));
    alert("Demo data loaded!");
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter((t) => {
      const date = t.date?.seconds ? new Date(t.date.seconds * 1000) : new Date(t.date);
      const periodOk =
        filter.period === "all" ? true :
        filter.period === "today" ? date.toDateString() === now.toDateString() :
        filter.period === "week" ? (now - date) < 7 * 86400000 :
        filter.period === "month" ? date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() :
        filter.period === "year" ? date.getFullYear() === now.getFullYear() : true;
      const platformOk = filter.platform === "all" || t.platform === filter.platform;
      const categoryOk = filter.category === "all" || t.category === filter.category;
      return periodOk && platformOk && categoryOk;
    });
  };

  const getAnalytics = (txList) => {
    const debits = txList.filter((t) => t.type === "debit");
    const credits = txList.filter((t) => t.type === "credit");
    const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
    const totalReceived = credits.reduce((s, t) => s + t.amount, 0);
    const byPlatform = {}, byCategory = {};
    debits.forEach((t) => {
      byPlatform[t.platform] = (byPlatform[t.platform] || 0) + t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return { totalSpent, totalReceived, byPlatform, byCategory, debitCount: debits.length };
  };

  const filtered = getFilteredTransactions();
  const analytics = getAnalytics(filtered);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "import", label: "Import" },
    { id: "transactions", label: "Transactions" },
    { id: "analytics", label: "Analytics" },
  ];

  if (loading) {
    return <div className="finance-page"><p style={{ textAlign: "center", color: "#00ffc8" }}>Loading UPI Tracker...</p></div>;
  }

  return (
    <div className="finance-page">
      <h1>Unified UPI Tracker</h1>
      <p className="subtitle">Track all GPay, Paytm, PhonePe expenses in one place</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 18px", borderRadius: 25, border: "none", cursor: "pointer",
            fontWeight: "bold", fontSize: "0.9rem",
            background: activeTab === tab.id ? "linear-gradient(90deg, #00ffc8, #007bff)" : "rgba(255,255,255,0.08)",
            color: activeTab === tab.id ? "#000" : "#fff", transition: "all 0.2s",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Spent", value: `Rs ${analytics.totalSpent.toFixed(0)}`, color: "#ff6b6b" },
              { label: "Total Received", value: `Rs ${analytics.totalReceived.toFixed(0)}`, color: "#00ffc8" },
              { label: "Transactions", value: analytics.debitCount, color: "#007bff" },
              { label: "Net Balance", value: `Rs ${(analytics.totalReceived - analytics.totalSpent).toFixed(0)}`, color: (analytics.totalReceived - analytics.totalSpent) >= 0 ? "#00ffc8" : "#ff6b6b" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: 6 }}>{stat.label}</p>
                <p style={{ color: stat.color, fontSize: "1.3rem", fontWeight: "bold" }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Filter</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["today", "week", "month", "year", "all"].map((p) => (
                <button key={p} onClick={() => setFilter({ ...filter, period: p })} style={{
                  padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                  background: filter.period === p ? "#00ffc8" : "rgba(255,255,255,0.1)",
                  color: filter.period === p ? "#000" : "#fff",
                  fontWeight: "bold", fontSize: "0.85rem", textTransform: "capitalize",
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(analytics.byPlatform).length > 0 && (
            <div className="card">
              <h2>Platform Breakdown</h2>
              {Object.entries(analytics.byPlatform).sort((a, b) => b[1] - a[1]).map(([platform, amount]) => {
                const pct = ((amount / analytics.totalSpent) * 100).toFixed(1);
                const p = PLATFORMS[platform] || PLATFORMS.other;
                return (
                  <div key={platform} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>{p.name}</span>
                      <span style={{ color: p.color, fontWeight: "bold" }}>Rs {amount.toFixed(0)} ({pct}%)</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, height: 8 }}>
                      <div style={{ width: `${pct}%`, background: p.color, borderRadius: 10, height: 8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {Object.keys(analytics.byCategory).length > 0 && (
            <div className="card">
              <h2>Category Breakdown</h2>
              {Object.entries(analytics.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                const pct = ((amount / analytics.totalSpent) * 100).toFixed(1);
                const color = CATEGORY_COLORS[cat] || "#aaa";
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>{cat}</span>
                      <span style={{ color, fontWeight: "bold" }}>Rs {amount.toFixed(0)} ({pct}%)</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, height: 8 }}>
                      <div style={{ width: `${pct}%`, background: color, borderRadius: 10, height: 8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {transactions.length === 0 && (
            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ color: "#aaa", marginBottom: 16 }}>No transactions yet.</p>
              <button className="primary-btn" onClick={loadMockData} style={{ marginRight: 10, width: "auto", padding: "10px 20px" }}>
                Load Demo Data
              </button>
              <button className="primary-btn" onClick={() => setActiveTab("import")}
                style={{ background: "linear-gradient(90deg,#6A5ACD,#007bff)", width: "auto", padding: "10px 20px" }}>
                Import Transactions
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "import" && (
        <div>
          <div className="card">
            <h2>Choose Import Method</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 12 }}>
              {[
                { id: "sms", label: "SMS", desc: "Paste bank SMS" },
                { id: "email", label: "Email", desc: "Paste receipt email" },
                { id: "csv", label: "CSV", desc: "Upload bank statement" },
                { id: "manual", label: "Manual", desc: "Enter manually" },
              ].map((mode) => (
                <div key={mode.id} onClick={() => { setInputMode(mode.id); setParsed(null); setError(""); setInputText(""); }}
                  style={{
                    padding: 14, borderRadius: 12, cursor: "pointer", textAlign: "center",
                    background: inputMode === mode.id ? "rgba(0,255,200,0.12)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${inputMode === mode.id ? "#00ffc8" : "rgba(255,255,255,0.1)"}`,
                  }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{mode.label}</div>
                  <div style={{ color: "#aaa", fontSize: "0.75rem", marginTop: 4 }}>{mode.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {inputMode === "sms" && (
            <div className="card">
              <h2>Paste Bank SMS</h2>
              <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 12 }}>
                Works with SBI, HDFC, ICICI, Axis, Kotak, Yes Bank, PNB and all Indian banks.
              </p>
              <textarea placeholder="Paste one or multiple SMS messages here..."
                value={inputText} onChange={(e) => setInputText(e.target.value)} rows={5}
                style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "Poppins, sans-serif" }} />
              <button className="primary-btn" onClick={parseSMS} disabled={parsing} style={{ width: "100%", padding: 14, marginTop: 10 }}>
                {parsing ? "Reading SMS..." : "Extract Transactions"}
              </button>
            </div>
          )}

          {inputMode === "email" && (
            <div className="card">
              <h2>Paste Payment Email</h2>
              <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 12 }}>
                Works with GPay receipts, Paytm emails, PhonePe confirmations, bank emails.
              </p>
              <textarea placeholder="Paste the full email content here..."
                value={inputText} onChange={(e) => setInputText(e.target.value)} rows={8}
                style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "Poppins, sans-serif" }} />
              <button className="primary-btn" onClick={parseEmail} disabled={parsing} style={{ width: "100%", padding: 14, marginTop: 10 }}>
                {parsing ? "Reading email..." : "Extract Transactions"}
              </button>
            </div>
          )}

          {inputMode === "csv" && (
            <div className="card">
              <h2>Upload Bank Statement CSV</h2>
              <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 16 }}>
                Download your statement from your bank's website as CSV and upload here.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank"].map((bank) => (
                  <div key={bank} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.05)", textAlign: "center", fontSize: "0.85rem", color: "#ccc" }}>
                    {bank}
                  </div>
                ))}
              </div>
              <input type="file" accept=".csv,.txt" ref={csvRef} onChange={parseCSV} style={{ display: "none" }} />
              <button className="primary-btn" onClick={() => csvRef.current.click()} style={{ width: "100%", padding: 14 }}>
                {parsing ? "Reading CSV..." : "Choose CSV File"}
              </button>
            </div>
          )}

          {inputMode === "manual" && (
            <div className="card">
              <h2>Add Transaction Manually</h2>
              <input placeholder="Merchant / Description" value={manualForm.merchant} onChange={(e) => setManualForm({ ...manualForm, merchant: e.target.value })} />
              <input type="number" placeholder="Amount (Rs)" value={manualForm.amount} onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })} style={{ marginTop: 10 }} />
              <select value={manualForm.type} onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })} style={{ marginTop: 10 }}>
                <option value="debit">Debit (Money Spent)</option>
                <option value="credit">Credit (Money Received)</option>
              </select>
              <select value={manualForm.platform} onChange={(e) => setManualForm({ ...manualForm, platform: e.target.value })} style={{ marginTop: 10 }}>
                {Object.entries(PLATFORMS).map(([key, val]) => <option key={key} value={key}>{val.name}</option>)}
              </select>
              <select value={manualForm.category} onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })} style={{ marginTop: 10 }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="date" value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} style={{ marginTop: 10 }} />
              <input placeholder="Note (optional)" value={manualForm.note} onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })} style={{ marginTop: 10 }} />
              <button className="primary-btn" onClick={addManual} style={{ width: "100%", padding: 14, marginTop: 12 }}>
                Add Transaction
              </button>
            </div>
          )}

          {error && <div className="card" style={{ borderColor: "#ff4d4d" }}><p style={{ color: "#ff6b6b" }}>{error}</p></div>}

          {parsed && parsed.length > 0 && (
            <div className="card" style={{ borderColor: "#00ffc8" }}>
              <h2>Found {parsed.length} Transaction{parsed.length > 1 ? "s" : ""}</h2>
              {parsed.map((t, i) => (
                <div key={i} className="transaction-row">
                  <span>{t.merchant}</span>
                  <span style={{ color: t.type === "debit" ? "#ff6b6b" : "#00ffc8", fontWeight: "bold" }}>
                    {t.type === "debit" ? "-" : "+"}Rs {t.amount}
                  </span>
                  <span style={{ color: "#aaa", fontSize: "0.8rem" }}>{t.category}</span>
                </div>
              ))}
              <button className="primary-btn" onClick={async () => {
                await saveTransactions(parsed);
                setParsed(null); setInputText("");
                setActiveTab("transactions");
                alert(`${parsed.length} transactions saved!`);
              }} style={{ width: "100%", padding: 14, marginTop: 16 }}>
                Save All to UPI Tracker
              </button>
            </div>
          )}

          <div className="card" style={{ textAlign: "center", borderColor: "rgba(255,159,28,0.3)" }}>
            <h2 style={{ color: "#ff9f1c" }}>No real data yet?</h2>
            <p style={{ color: "#aaa", marginBottom: 16 }}>Load sample transactions to explore the dashboard</p>
            <button className="primary-btn" onClick={loadMockData} style={{ background: "linear-gradient(90deg,#ff9f1c,#ff6b6b)", width: "auto", padding: "10px 24px" }}>
              Load Demo Transactions
            </button>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div>
          <div className="card">
            <h2>Filter Transactions</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {["today", "week", "month", "year", "all"].map((p) => (
                <button key={p} onClick={() => setFilter({ ...filter, period: p })}
                  style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: "0.8rem",
                    background: filter.period === p ? "#00ffc8" : "rgba(255,255,255,0.1)",
                    color: filter.period === p ? "#000" : "#fff", fontWeight: "bold", textTransform: "capitalize" }}>
                  {p}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={filter.platform} onChange={(e) => setFilter({ ...filter, platform: e.target.value })} style={{ flex: 1 }}>
                <option value="all">All Platforms</option>
                {Object.entries(PLATFORMS).map(([key, val]) => <option key={key} value={key}>{val.name}</option>)}
              </select>
              <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} style={{ flex: 1 }}>
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 12 }}>Showing {filtered.length} transactions</p>

          {filtered.length === 0 ? (
            <div className="card"><p style={{ color: "#aaa", textAlign: "center" }}>No transactions match this filter.</p></div>
          ) : (
            filtered.map((t) => {
              const date = t.date?.seconds ? new Date(t.date.seconds * 1000) : new Date(t.date);
              const p = PLATFORMS[t.platform] || PLATFORMS.other;
              return (
                <div key={t.id} className="card" style={{ padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{t.merchant}</p>
                      <p style={{ color: "#aaa", fontSize: "0.78rem", marginTop: 3 }}>
                        {p.name} · {t.category} · {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: t.type === "debit" ? "#ff6b6b" : "#00ffc8", fontWeight: "bold" }}>
                        {t.type === "debit" ? "-" : "+"}Rs {t.amount}
                      </span>
                      <span onClick={() => deleteTransaction(t.id)} style={{ cursor: "pointer", color: "#ff4d4d" }}>x</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          <div className="card">
            <h2>Time Period</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[{ id: "today", label: "Today" }, { id: "week", label: "This Week" }, { id: "month", label: "This Month" }, { id: "year", label: "This Year" }, { id: "all", label: "All Time" }].map((p) => (
                <button key={p.id} onClick={() => setFilter({ ...filter, period: p.id })}
                  style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                    background: filter.period === p.id ? "linear-gradient(90deg,#00ffc8,#007bff)" : "rgba(255,255,255,0.08)",
                    color: filter.period === p.id ? "#000" : "#fff", fontWeight: "bold", fontSize: "0.85rem" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Summary</h2>
            <div className="transaction-row"><span>Total Spent</span><span style={{ color: "#ff6b6b", fontWeight: "bold" }}>Rs {analytics.totalSpent.toFixed(2)}</span></div>
            <div className="transaction-row"><span>Total Received</span><span style={{ color: "#00ffc8", fontWeight: "bold" }}>Rs {analytics.totalReceived.toFixed(2)}</span></div>
            <div className="transaction-row"><span>Transactions Count</span><span style={{ color: "#007bff", fontWeight: "bold" }}>{analytics.debitCount}</span></div>
            <div className="transaction-row">
              <span>Average per Transaction</span>
              <span style={{ color: "#ff9f1c", fontWeight: "bold" }}>
                Rs {analytics.debitCount > 0 ? (analytics.totalSpent / analytics.debitCount).toFixed(2) : 0}
              </span>
            </div>
          </div>

          {Object.keys(analytics.byCategory).length > 0 && (
            <div className="card">
              <h2>Top Spending Categories</h2>
              {Object.entries(analytics.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount], i) => {
                const pct = ((amount / analytics.totalSpent) * 100).toFixed(1);
                const color = CATEGORY_COLORS[cat] || "#aaa";
                return (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontWeight: i === 0 ? "bold" : "normal" }}>{cat}</span>
                      <span style={{ color, fontWeight: "bold" }}>Rs {amount.toFixed(0)} · {pct}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, height: 10 }}>
                      <div style={{ width: `${pct}%`, background: color, borderRadius: 10, height: 10 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ color: "#aaa" }}>No data for this period. Import transactions first.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}