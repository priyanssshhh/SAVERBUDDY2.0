import React from "react";
import "./HeroSection.css";

function HeroSection() {
  return (
    <section className="hero">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/pigvid.mp4" type="video/mp4" />
      </video>
      <div className="overlay">
        <h1>Take Control of Your Money with <span>SaverBuddy</span></h1>
        <p>Your AI-powered financial assistant.</p>
        <button className="get-started">Get Started</button>
      </div>
    </section>
  );
}

export default HeroSection;
