import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../config";
import "./auth.css";

const Signup = () => {
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${SERVER_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndCreate = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Please enter the OTP.");
    setLoading(true);
    setError("");
    try {
      const verifyRes = await fetch(`${SERVER_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.error) throw new Error(verifyData.error);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError("Google Signup Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create your <span style={{ color: "#00ffc8" }}>SaverBuddy</span> Account</h2>

      {error && <p style={{ color: "#ff6b6b", marginBottom: 8 }}>{error}</p>}

      {step === "form" && (
        <>
          <form onSubmit={sendOtp}>
            <input type="email" placeholder="Enter your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Enter your Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
          <div className="divider">or</div>
          <button onClick={handleGoogleSignup} className="google-btn" disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "22px", marginRight: "10px" }} />
            Continue with Google
          </button>
          <p>Already have an account? <a href="/login">Login</a></p>
        </>
      )}

      {step === "otp" && (
        <form onSubmit={verifyAndCreate} style={{ width: "100%", maxWidth: 320 }}>
          <p style={{ color: "#aaa", marginBottom: 16, textAlign: "center", fontSize: "0.9rem" }}>
            We sent a 6-digit OTP to <strong style={{ color: "#00ffc8" }}>{email}</strong>
          </p>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            style={{ letterSpacing: "8px", fontSize: "1.4rem", textAlign: "center" }}
            required
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>
          <button type="button" onClick={() => { setStep("form"); setOtp(""); setError(""); }}
            style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", marginTop: 12, width: "100%", fontSize: "0.9rem" }}>
            Back to Sign Up
          </button>
        </form>
      )}
    </div>
  );
};

export default Signup;