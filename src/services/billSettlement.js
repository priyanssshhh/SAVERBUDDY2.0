// src/services/billSettlement.js

export function calculateSettlement(expenses, people) {
  // 1. Total spent
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. Equal share per person
  const sharePerPerson = totalSpent / people.length;

  // 3. How much each person paid
  const paid = {};
  people.forEach((p) => (paid[p] = 0));
  expenses.forEach((e) => {
    if (paid[e.paidBy] !== undefined) {
      paid[e.paidBy] += e.amount;
    }
  });

  // 4. Net balance (positive = should receive, negative = owes)
  const balance = {};
  people.forEach((p) => {
    balance[p] = Number((paid[p] - sharePerPerson).toFixed(2));
  });

  // 5. Separate into creditors and debtors
  let creditors = [];
  let debtors = [];

  Object.entries(balance).forEach(([person, amount]) => {
    if (amount > 0.01) creditors.push({ person, amount });
    else if (amount < -0.01) debtors.push({ person, amount: Math.abs(amount) });
  });

  // Sort descending for optimal matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // 6. Minimize transactions (greedy algorithm)
  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payAmount = Math.min(debtors[i].amount, creditors[j].amount);

    if (payAmount > 0.01) {
      settlements.push({
        from: debtors[i].person,
        to: creditors[j].person,
        amount: payAmount.toFixed(2),
      });
    }

    debtors[i].amount = Number((debtors[i].amount - payAmount).toFixed(2));
    creditors[j].amount = Number((creditors[j].amount - payAmount).toFixed(2));

    if (debtors[i].amount <= 0.01) i++;
    if (creditors[j].amount <= 0.01) j++;
  }

  // 7. Summary per person
  const summary = people.map((p) => ({
    person: p,
    paid: Number(paid[p].toFixed(2)),
    share: Number(sharePerPerson.toFixed(2)),
    balance: balance[p],
    status:
      balance[p] > 0.01
        ? "receives"
        : balance[p] < -0.01
        ? "owes"
        : "settled",
  }));

  return {
    totalSpent: totalSpent.toFixed(2),
    sharePerPerson: sharePerPerson.toFixed(2),
    balance,
    summary,
    settlements,
  };
}