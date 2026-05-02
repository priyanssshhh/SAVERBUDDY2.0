import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
}));

app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "SaverBuddy API is running ✅" });
});

/* ========================================
   AI EXPENSE ADVISOR
======================================== */
app.post("/api/ai", async (req, res) => {
  const { salary, transactions } = req.body;
  if (!salary || !transactions?.length) {
    return res.status(400).json({ error: "Salary and transactions are required." });
  }

  const prompt = `
You are a strict but caring Indian father who understands money deeply.
Monthly Salary: ₹${salary}
This month's expenses:
${transactions.map((t) => `• ${t.title} - ₹${t.amount} (${t.category})`).join("\n")}
Your task:
- Calculate total spending and savings
- Be honest about wasteful categories
- Suggest exact amounts to cut from each category
- Recommend where to redirect those savings
- Sound like a wise family elder
- Use short paragraphs
- End with one motivational line
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: "OpenAI error: " + err });
    }

    const data = await response.json();
    res.json({ text: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========================================
   BILL SCANNER
======================================== */
app.post("/api/scan-bill", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "No image provided." });

  const prompt = `You are an expert bill/receipt scanner.
Extract all line items from this image.
Return ONLY valid JSON, no markdown, no explanation:
{
  "items": [
    { "title": "item name", "amount": 0, "category": "Food" }
  ],
  "total": 0,
  "date": "DD/MM/YYYY or null"
}
Categories: Food, Bills, Shopping, Travel, Other.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
            ]
          }]
        }),
      }
    );

    const data = await response.json();
    if (!data.candidates?.[0]) return res.status(500).json({ error: "AI returned no response." });
    const raw = data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: "Bill scan failed: " + err.message });
  }
});

/* ========================================
   DEAL FINDER
======================================== */
app.post("/api/deals", async (req, res) => {
  const { query, budget } = req.body;
  if (!query) return res.status(400).json({ error: "Search query required." });

  const prompt = `You are a smart Indian shopping assistant.
User wants to buy: "${query}"
Budget: ₹${budget || "not specified"}
Compare prices across: Amazon India, Flipkart, Myntra, Zepto, Blinkit, Zomato.
Return ONLY valid JSON, no markdown:
{
  "deals": [
    {
      "platform": "Amazon",
      "productName": "full product name",
      "price": 0,
      "originalPrice": 0,
      "discount": "20%",
      "link": "https://www.amazon.in/s?k=product+name",
      "rating": "4.2/5",
      "tip": "one line buying tip"
    }
  ],
  "bestPick": "platform name",
  "savingTip": "one overall tip"
}
Sort cheapest first. Include 3-5 platforms.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    if (!data.candidates?.[0]) return res.status(500).json({ error: "AI returned no response." });
    const raw = data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: "Deals fetch failed: " + err.message });
  }
});

/* ========================================
   INVESTMENT ADVISOR
======================================== */
app.post("/api/invest", async (req, res) => {
  const { salary, totalExpenses, savings, goal } = req.body;

  const prompt = `You are a SEBI-registered Indian financial advisor.
Monthly Salary: ₹${salary}
Monthly Expenses: ₹${totalExpenses}
Monthly Savings: ₹${savings}
Goal: ${goal || "General wealth building"}
Return ONLY valid JSON, no markdown:
{
  "summary": "one line assessment",
  "recommendations": [
    {
      "type": "SIP",
      "name": "specific fund name",
      "amount": 0,
      "reason": "why suitable",
      "risk": "Low",
      "expectedReturn": "12% per year"
    }
  ],
  "emergencyFund": "advice string",
  "warnings": ["warning1"]
}
Risk must be: Low, Medium, or High.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    if (!data.candidates?.[0]) return res.status(500).json({ error: "AI returned no response." });
    const raw = data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: "Investment advice failed: " + err.message });
  }
});

/* ========================================
   UPI SMS PARSER
======================================== */
app.post("/api/parse-upi", async (req, res) => {
  const { smsText } = req.body;
  if (!smsText) return res.status(400).json({ error: "SMS text required." });

  const prompt = `You are a UPI transaction parser for Indian bank SMS.
Extract transactions from: "${smsText}"
Return ONLY valid JSON, no markdown:
{
  "transactions": [
    {
      "title": "merchant name",
      "amount": 0,
      "type": "debit",
      "category": "Food",
      "date": "DD/MM/YYYY or null",
      "upiRef": "ref number or null"
    }
  ]
}
Categories: Food, Bills, Shopping, Travel, Other.
type: debit or credit only.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    if (!data.candidates?.[0]) return res.status(500).json({ error: "AI returned no response." });
    const raw = data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: "UPI parse failed: " + err.message });
  }
});

/* ========================================
   EMAIL PARSER
======================================== */
app.post("/api/parse-email", async (req, res) => {
  const { emailText } = req.body;
  if (!emailText) return res.status(400).json({ error: "Email text required." });

  const prompt = `You are a UPI payment email parser for Indian apps.
Extract transactions from: "${emailText}"
Return ONLY valid JSON, no markdown:
{
  "transactions": [
    {
      "merchant": "merchant name",
      "amount": 0,
      "type": "debit",
      "platform": "gpay",
      "category": "Food",
      "date": "DD/MM/YYYY",
      "note": "description"
    }
  ]
}
platform: gpay, paytm, phonepe, bank, or other.
category: Food, Travel, Shopping, Bills, Entertainment, Health, Other.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    if (!data.candidates?.[0]) return res.status(500).json({ error: "AI returned no response." });
    const raw = data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: "Email parse failed: " + err.message });
  }
});

/* ========================================
   CSV PARSER
======================================== */
app.post("/api/parse-csv", async (req, res) => {
  const { csvText } = req.body;
  if (!csvText) return res.status(400).json({ error: "CSV text required." });

  const prompt = `You are a bank statement CSV parser for Indian banks.
Parse this data and extract all transactions:
"${csvText.substring(0, 3000)}"
Return ONLY valid JSON, no markdown:
{
  "transactions": [
    {
      "merchant": "description",
      "amount": 0,
      "type": "debit",
      "platform": "bank",
      "category": "Food",
      "date": "DD/MM/YYYY",
      "note": "original description"
    }
  ]
}
category: Food, Travel, Shopping, Bills, Entertainment, Health, Other.
type: debit or credit.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    if (!data.candidates?.[0]) return res.status(500).json({ error: "AI returned no response." });
    const raw = data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: "CSV parse failed: " + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});