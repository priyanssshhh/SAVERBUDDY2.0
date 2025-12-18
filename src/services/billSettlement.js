// src/services/billSettlement.js

export function calculateSettlement(expenses, people) {
  // 1️⃣ Total spent
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 2️⃣ Equal share
  const sharePerPerson = totalSpent / people.length;

  // 3️⃣ Initialize balances
  const balance = {};
  people.forEach((p) => (balance[p] = 0));

  // 4️⃣ Add what each person paid
  expenses.forEach((e) => {
    balance[e.paidBy] += e.amount;
  });

  // 5️⃣ Subtract equal share
  people.forEach((p) => {
    balance[p] = Number((balance[p] - sharePerPerson).toFixed(2));
  });

  // 6️⃣ Separate debtors & creditors
  const debtors = [];
  const creditors = [];

  Object.entries(balance).forEach(([person, amount]) => {
    if (amount < 0) debtors.push({ person, amount: Math.abs(amount) });
    if (amount > 0) creditors.push({ person, amount });
  });

  // 7️⃣ Settlement logic (AI-like optimization)
  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payAmount = Math.min(debtors[i].amount, creditors[j].amount);

    settlements.push({
      from: debtors[i].person,
      to: creditors[j].person,
      amount: payAmount.toFixed(2),
    });

    debtors[i].amount -= payAmount;
    creditors[j].amount -= payAmount;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return {
    totalSpent: totalSpent.toFixed(2),
    sharePerPerson: sharePerPerson.toFixed(2),
    balance,
    settlements,
  };
}
