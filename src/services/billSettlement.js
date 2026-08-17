export function calculateSettlement(expenses, people) {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const sharePerPerson = totalSpent / people.length;

  const paid = {};
  people.forEach((p) => (paid[p] = 0));
  expenses.forEach((e) => {
    if (paid[e.paidBy] !== undefined) paid[e.paidBy] += e.amount;
  });

  const balance = {};
  people.forEach((p) => {
    balance[p] = Number((paid[p] - sharePerPerson).toFixed(2));
  });

  let creditors = [];
  let debtors = [];

  Object.entries(balance).forEach(([person, amount]) => {
    if (amount > 0.01) creditors.push({ person, amount });
    else if (amount < -0.01) debtors.push({ person, amount: Math.abs(amount) });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payAmount = Math.min(debtors[i].amount, creditors[j].amount);
    if (payAmount > 0.01) {
      settlements.push({ from: debtors[i].person, to: creditors[j].person, amount: payAmount.toFixed(2) });
    }
    debtors[i].amount = Number((debtors[i].amount - payAmount).toFixed(2));
    creditors[j].amount = Number((creditors[j].amount - payAmount).toFixed(2));
    if (debtors[i].amount <= 0.01) i++;
    if (creditors[j].amount <= 0.01) j++;
  }

  const summary = people.map((p) => ({
    person: p,
    paid: Number(paid[p].toFixed(2)),
    share: Number(sharePerPerson.toFixed(2)),
    balance: balance[p],
    status: balance[p] > 0.01 ? "receives" : balance[p] < -0.01 ? "owes" : "settled",
  }));

  return {
    totalSpent: totalSpent.toFixed(2),
    sharePerPerson: sharePerPerson.toFixed(2),
    balance,
    summary,
    settlements,
  };
}