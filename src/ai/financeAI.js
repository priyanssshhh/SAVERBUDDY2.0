export function analyzeExpenses(transactions, salary) {
  let totalSpent = 0;
  const categories = {};

  transactions.forEach((t) => {
    totalSpent += t.amount;
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const suggestions = [];

  if (salary) {
    const savings = salary - totalSpent;
    if (savings < salary * 0.2) {
      suggestions.push("Your savings are below 20%. Try reducing unnecessary expenses.");
    } else {
      suggestions.push("Great job! You are saving a healthy portion of your income.");
    }
  }

  Object.entries(categories).forEach(([cat, amt]) => {
    if (amt > totalSpent * 0.4) {
      suggestions.push(`You are spending heavily on ${cat}. Consider setting a monthly limit.`);
    }
  });

  return { totalSpent, categories, suggestions };
}