import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();
  return (
    <div className="hero-container">
      <div className="hero-box">
        <h1 className="hero-title">Welcome to SaverBuddy</h1>
        <p className="hero-subtitle">Your Smart AI Budget App</p>
        <button className="hero-btn" onClick={() => navigate("/login")}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Hero;
