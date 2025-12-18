import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

/* ================= CREATE USER PROFILE ================= */
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

      // 🔥 Month tracking (NUMBERS ONLY — IMPORTANT)
      activeMonth: now.getMonth(), // 0–11
      activeYear: now.getFullYear(),

      plan: "PRO",
      createdAt: now,
    });
  }
};

/* ================= GET USER PROFILE ================= */
export const getUserProfile = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

/* ================= UPDATE USER PROFILE ================= */
export const updateUserProfile = async (uid, data) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, data);
};

/* ================= GET USER PLAN ================= */
export const getUserPlan = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().plan : "FREE";
};

/* ================= GET ACTIVE MONTH ================= */
export const getActiveMonth = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  const now = new Date();

  if (!snap.exists()) {
    return {
      month: now.getMonth(),
      year: now.getFullYear(),
    };
  }

  const data = snap.data();

  return {
    month:
      typeof data.activeMonth === "number"
        ? data.activeMonth
        : now.getMonth(),
    year:
      typeof data.activeYear === "number"
        ? data.activeYear
        : now.getFullYear(),
  };
};

/* ================= RESET MONTH (NO DELETION) ================= */
export const resetMonth = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const { activeMonth, activeYear } = snap.data();

  const date = new Date(activeYear, activeMonth);
  date.setMonth(date.getMonth() + 1);

  await updateDoc(ref, {
    activeMonth: date.getMonth(),
    activeYear: date.getFullYear(),
  });
};
