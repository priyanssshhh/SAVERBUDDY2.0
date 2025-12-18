// src/services/aiAdvisor.js

export async function getAIAdvice(transactions, salary) {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error("OpenAI API key not found");
  }

  const prompt = `
You are a strict Indian father who understands money deeply.

Monthly Salary: ₹${salary}

Expenses:
${transactions
  .map(
    (t) => `• ${t.title} - ₹${t.amount} (${t.category})`
  )
  .join("\n")}

Rules:
- Be honest and practical
- Clearly point out waste
- Suggest exact savings
- Sound like a family elder
- Short paragraphs
`;

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error("OpenAI Error: " + err);
  }

  const data = await response.json();

  return data.choices[0].message.content;
}
