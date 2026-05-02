// src/components/authentication/Login.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./auth.css"; // ✅ FIXED (lowercase)

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Email login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Email login error:", err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      console.log("🔄 Starting Google Login...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google login successful:", result.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("You closed the popup before signing in.");
      } else {
        setError("Google Sign-in failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>
        Login to <span style={{ color: "#00ffc8" }}>SaverBuddy</span>
      </h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleEmailLogin}>
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
          Login
        </button>
      </form>

      <div className="divider">or</div>

      <button onClick={handleGoogleLogin} className="google-btn">
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
        Don’t have an account?{" "}
        <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;