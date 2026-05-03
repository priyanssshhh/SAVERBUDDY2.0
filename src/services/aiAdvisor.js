// src/services/aiAdvisor.js

export async function getAIAdvice(transactions, salary) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salary,
          transactions,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error("Backend Error: " + err);
    }

    const data = await response.json();

    return data.text;
  } catch (error) {
    console.error("AI Advice Error:", error);
    throw error;
  }
}