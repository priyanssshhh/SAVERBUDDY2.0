import React from "react";

function Dashboard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
        color: "#333",
      }}
    >
      <h1>Welcome to SaverBuddy Dashboard 🎉</h1>
      <p>Manage your budget, split bills, and track spending smarter.</p>
    </div>
  );
}

export default Dashboard;
