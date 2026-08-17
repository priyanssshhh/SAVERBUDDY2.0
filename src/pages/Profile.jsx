import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "../services/userService";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", monthlyIncome: "", savingsGoal: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);
      const data = await getUserProfile(currentUser.uid);
      setProfile(data);
      setForm({
        name: data?.name || "",
        monthlyIncome: data?.monthlyIncome || "",
        savingsGoal: data?.savingsGoal || "",
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    await updateUserProfile(user.uid, form);
    setProfile({ ...profile, ...form });
    setEditing(false);
    alert("Profile updated!");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="glass-box"><p>Loading profile...</p></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="glass-box">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account details and preferences</p>

        {!editing ? (
          <>
            <div className="profile-info">
              <div className="info-item">
                <span className="label">Name</span>
                <span className="value">{profile?.name || "Not set"}</span>
              </div>
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">{profile?.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Monthly Income</span>
                <span className="value">Rs {profile?.monthlyIncome || "Not set"}</span>
              </div>
              <div className="info-item">
                <span className="label">Savings Goal</span>
                <span className="value">Rs {profile?.savingsGoal || "Not set"}</span>
              </div>
            </div>
            <button className="edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
          </>
        ) : (
          <>
            <div className="profile-info">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Monthly Income (Rs)"
                value={form.monthlyIncome}
                onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
              />
              <input
                type="number"
                placeholder="Savings Goal (Rs)"
                value={form.savingsGoal}
                onChange={(e) => setForm({ ...form, savingsGoal: e.target.value })}
              />
            </div>
            <button className="save-btn" onClick={saveProfile}>Save Changes</button>
            <button
              onClick={() => setEditing(false)}
              style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", marginTop: 10, fontSize: "0.9rem" }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}