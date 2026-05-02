// src/pages/BillScanner.jsx
import React, { useState, useRef } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { SERVER_URL } from "../config";

export default function BillScanner() {
  const [imageBase64, setImageBase64] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResult(null);
    setAdded(false);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setImageBase64(base64);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const scanBill = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(`${SERVER_URL}/api/scan-bill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.items?.length) throw new Error("No items found in the image. Try a clearer photo.");
      setResult(data);
    } catch (err) {
      setError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAllToExpenses = async () => {
    const user = auth.currentUser;
    if (!user || !result?.items) return;

    for (const item of result.items) {
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        title: item.title,
        amount: Number(item.amount),
        category: item.category || "Other",
        createdAt: new Date(),
        source: "bill-scanner",
      });
    }
    setAdded(true);
  };

  return (
    <div className="finance-page">
      <h1>📷 Bill Scanner</h1>
      <p className="subtitle">
        Take a photo of any receipt or bill — AI extracts all items and adds them to your expenses automatically
      </p>

      {/* UPLOAD */}
      <div className="card">
        <h2>📤 Upload Bill / Receipt</h2>
        <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: 16 }}>
          Supports restaurant bills, grocery receipts, shopping invoices, utility bills
        </p>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileRef}
          onChange={handleImage}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="primary-btn"
            onClick={() => fileRef.current.click()}
            style={{ flex: 1, padding: 12 }}
          >
            📁 Choose from Gallery
          </button>
          <button
            className="primary-btn"
            onClick={() => { fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); }}
            style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#6A5ACD,#007bff)" }}
          >
            📸 Take Photo
          </button>
        </div>

        {preview && (
          <img
            src={preview}
            alt="Bill preview"
            style={{
              width: "100%", maxHeight: 320, objectFit: "contain",
              borderRadius: 12, marginTop: 16,
              border: "1px solid rgba(0,255,200,0.2)",
            }}
          />
        )}

        {imageBase64 && (
          <button
            className="primary-btn"
            onClick={scanBill}
            disabled={loading}
            style={{ width: "100%", padding: 14, marginTop: 12, fontSize: "1rem" }}
          >
            {loading ? "🔍 AI is reading your bill..." : "🔍 Scan Bill with AI"}
          </button>
        )}
      </div>

      {error && (
        <div className="card" style={{ borderColor: "#ff4d4d" }}>
          <p style={{ color: "#ff6b6b" }}>{error}</p>
        </div>
      )}

      {/* RESULTS */}
      {result && (
        <div className="card" style={{ borderColor: "#00ffc8" }}>
          <h2>✅ Extracted Items</h2>
          {result.date && (
            <p style={{ color: "#aaa", marginBottom: 12 }}>📅 Bill Date: {result.date}</p>
          )}

          {result.items.map((item, i) => (
            <div key={i} className="transaction-row">
              <span>{item.title}</span>
              <span style={{ color: "#ff6b6b" }}>₹{item.amount}</span>
              <span style={{ color: "#00ffc8", fontSize: "0.85rem" }}>{item.category}</span>
            </div>
          ))}

          <div className="transaction-row" style={{ marginTop: 12, fontWeight: "bold", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
            <span>Total</span>
            <span style={{ color: "#00ffc8", fontSize: "1.1rem" }}>₹{result.total}</span>
          </div>

          {!added ? (
            <button
              className="primary-btn"
              onClick={addAllToExpenses}
              style={{ width: "100%", marginTop: 16, padding: 14 }}
            >
              ➕ Add All to My Expenses
            </button>
          ) : (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p style={{ color: "#00ffc8", fontSize: "1.1rem" }}>
                ✅ {result.items.length} items added to My Finances!
              </p>
              <a href="/myfinances" style={{ color: "#007bff", fontSize: "0.9rem" }}>
                View in My Finances →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}