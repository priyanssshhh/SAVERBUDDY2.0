// src/components/authentication/Signup.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Account created successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      console.log("🔄 Google signup started...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google signup success:", result.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Google signup error:", err);
      setError("Google Signup Failed: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>
        Create your <span style={{ color: "#00ffc8" }}>SaverBuddy</span> Account
      </h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleEmailSignup}>
        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-btn">
          Sign Up
        </button>
      </form>

      <div className="divider">or</div>

      <button onClick={handleGoogleSignup} className="google-btn">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          style={{
            width: "22px",
            marginRight: "10px",
            verticalAlign: "middle",
          }}
        />
        Continue with Google
      </button>

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Signup;
