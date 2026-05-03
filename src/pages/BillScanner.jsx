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
  const [captureMode, setCaptureMode] = useState(null); // null = choose, "camera", "gallery"
  const galleryRef = useRef();
  const cameraRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResult(null);
    setAdded(false);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result.split(",")[1]);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      cameraRef.current.click();
    } catch {
      setError("❌ Camera permission denied. Please allow camera access in your browser settings.");
    }
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
      if (!data.items?.length) throw new Error("No items found. Try a clearer photo.");
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
        Take a photo or upload a receipt — AI extracts all items automatically
      </p>

      {/* HIDDEN INPUTS */}
      <input
        type="file"
        accept="image/*"
        ref={galleryRef}
        onChange={handleImage}
        style={{ display: "none" }}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraRef}
        onChange={handleImage}
        style={{ display: "none" }}
      />

      {/* STEP 1 — Choose input method */}
      {!preview && (
        <div className="card">
          <h2>📤 Choose Upload Method</h2>
          <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: 20 }}>
            Supports restaurant bills, grocery receipts, shopping invoices, utility bills
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button
              className="primary-btn"
              onClick={() => galleryRef.current.click()}
              style={{ padding: 18, fontSize: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <span style={{ fontSize: "2rem" }}>🖼️</span>
              <span>Gallery</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Choose existing photo</span>
            </button>
            <button
              className="primary-btn"
              onClick={openCamera}
              style={{ padding: 18, fontSize: "1rem", background: "linear-gradient(135deg,#6A5ACD,#007bff)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <span style={{ fontSize: "2rem" }}>📸</span>
              <span>Camera</span>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Tap to request permission</span>
            </button>
          </div>
          <p style={{ color: "#666", fontSize: "0.78rem", marginTop: 12, textAlign: "center" }}>
            Camera requires permission — you'll be asked to allow access
          </p>
        </div>
      )}

      {/* STEP 2 — Preview & scan */}
      {preview && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>📄 Preview</h2>
            <button
              onClick={() => { setPreview(null); setImageBase64(null); setResult(null); setError(""); }}
              style={{ background: "rgba(255,77,77,0.15)", border: "1px solid #ff4d4d", color: "#ff6b6b", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem" }}
            >
              ✕ Remove
            </button>
          </div>
          <img
            src={preview}
            alt="Bill preview"
            style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 12, border: "1px solid rgba(0,255,200,0.2)" }}
          />
          <button
            className="primary-btn"
            onClick={scanBill}
            disabled={loading}
            style={{ width: "100%", padding: 14, marginTop: 14, fontSize: "1rem" }}
          >
            {loading ? "🔍 AI is reading your bill..." : "🔍 Scan Bill with AI"}
          </button>
          <button
            onClick={() => galleryRef.current.click()}
            style={{ width: "100%", padding: 10, marginTop: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#aaa", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}
          >
            📁 Choose different image
          </button>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: "#ff4d4d" }}>
          <p style={{ color: "#ff6b6b" }}>{error}</p>
        </div>
      )}

      {/* RESULTS */}
      {result && (
        <div className="card" style={{ borderColor: "#00ffc8" }}>
          <h2>✅ Extracted Items</h2>
          {result.date && <p style={{ color: "#aaa", marginBottom: 12 }}>📅 Bill Date: {result.date}</p>}
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
            <button className="primary-btn" onClick={addAllToExpenses} style={{ width: "100%", marginTop: 16, padding: 14 }}>
              ➕ Add All to My Expenses
            </button>
          ) : (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p style={{ color: "#00ffc8", fontSize: "1.1rem" }}>✅ {result.items.length} items added!</p>
              <a href="/myfinances" style={{ color: "#007bff", fontSize: "0.9rem" }}>View in My Finances →</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}