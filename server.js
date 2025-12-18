import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

/* ===== ENV LOAD ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🔑 OPENAI KEY FOUND:", !!process.env.OPENAI_API_KEY);
/* ==================== */

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
  const { transactions, salary } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  try {
    const prompt = `
You are a strict Indian father who gives honest money advice.

Monthly Salary: ₹${salary}

Expenses:
${transactions.map(t => `- ${t.title}: ₹${t.amount} (${t.category})`).join("\n")}

Tell me clearly:
• What is waste
• Where to cut money
• How to save better
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: prompt,
        }),
      }
    );

    const data = await response.json();

    if (!data.output_text) {
      console.error("❌ OpenAI error:", data);
      return res.status(500).json({ error: "OpenAI failed" });
    }

    res.json({ text: data.output_text });
  } catch (err) {
    console.error("❌ AI ERROR:", err);
    res.status(500).json({ error: "AI crashed" });
  }
});

app.listen(5000, () => {
  console.log("🚀 AI Server running on port 5000");
});
