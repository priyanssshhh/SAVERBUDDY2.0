import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const createUserProfile = async (user) => {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const now = new Date();
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email,
      monthlyIncome: "",
      savingsGoal: "",
      activeMonth: now.getMonth(),
      activeYear: now.getFullYear(),
      plan: "PRO",
      createdAt: now,
    });
  }
};

export const getUserProfile = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = async (uid, data) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, data);
};

export const getUserPlan = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().plan : "FREE";
};

export const getActiveMonth = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const now = new Date();
  if (!snap.exists()) return { month: now.getMonth(), year: now.getFullYear() };
  const data = snap.data();
  return {
    month: typeof data.activeMonth === "number" ? data.activeMonth : now.getMonth(),
    year: typeof data.activeYear === "number" ? data.activeYear : now.getFullYear(),
  };
};

export const resetMonth = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const { activeMonth, activeYear } = snap.data();
  const date = new Date(activeYear, activeMonth);
  date.setMonth(date.getMonth() + 1);
  await updateDoc(ref, { activeMonth: date.getMonth(), activeYear: date.getFullYear() });
};