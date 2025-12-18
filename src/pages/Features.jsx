import React from "react";

const Features = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "120px 20px",
        background: "linear-gradient(180deg,#0b0b0b,#111)",
        color: "white",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        🚀 SaverBuddy Features
      </h1>

      <p
        style={{
          maxWidth: "900px",
          margin: "0 auto 60px",
          fontSize: "18px",
          opacity: 0.9,
        }}
      >
        SaverBuddy is an AI-powered personal finance platform that helps users
        track expenses, split bills, and receive intelligent financial guidance.
        Designed as a real-world SaaS product.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "25px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <FeatureCard title="💰 Expense Tracking">
          Track daily expenses with categories and monthly summaries.
        </FeatureCard>

        <FeatureCard title="👥 Bill Splitter">
          Split group expenses fairly among friends or roommates.
        </FeatureCard>

        <FeatureCard title="🤖 AI Expense Advisor (Pro)">
          Personalized AI insights to reduce unnecessary spending.
        </FeatureCard>

        <FeatureCard title="📊 Monthly History">
          Clean monthly reset with archived expense history.
        </FeatureCard>

        <FeatureCard title="📈 Smart Investment (Pro)">
          AI-guided savings and investment recommendations.
        </FeatureCard>

        <FeatureCard title="🛡️ Secure Authentication">
          Firebase-based authentication and data protection.
        </FeatureCard>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, children }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.06)",
      padding: "25px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.12)",
      backdropFilter: "blur(10px)",
    }}
  >
    <h3 style={{ marginBottom: "12px" }}>{title}</h3>
    <p style={{ fontSize: "15px", opacity: 0.85 }}>{children}</p>
  </div>
);

export default Features;
