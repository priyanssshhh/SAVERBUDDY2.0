import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import crypto from "crypto";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
}));

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => res.json({ status: "SaverBuddy API running" }));

const otpStore = new Map();

async function geminiGenerate(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Gemini returned empty response.");
  }

  return data.candidates[0].content.parts[0].text;
}

function safeParseJSON(raw) {
  const clean = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = clean.indexOf("{");
  const firstBracket = clean.indexOf("[");
  let start = -1;

  if (firstBrace === -1 && firstBracket === -1) throw new Error("No JSON found in response.");
  if (firstBrace === -1) start = firstBracket;
  else if (firstBracket === -1) start = firstBrace;
  else start = Math.min(firstBrace, firstBracket);

  const lastBrace = clean.lastIndexOf("}");
  const lastBracket = clean.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);

  if (start === -1 || end === -1) throw new Error("Could not extract JSON.");

  return JSON.parse(clean.substring(start, end + 1));
}

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  if (!process.env.RESEND_API_KEY) {
    console.log(`OTP for ${email}: ${otp}`);
    return res.json({ success: true, message: "OTP generated (check server logs — configure RESEND_API_KEY for email delivery)." });
  }

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SaverBuddy <noreply@saverbuddy.app>",
        to: [email],
        subject: "Your SaverBuddy OTP",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f0f0f;color:#fff;border-radius:12px;">
            <h2 style="color:#00ffc8;">SaverBuddy Verification</h2>
            <p>Your one-time password is:</p>
            <div style="font-size:2.5rem;font-weight:bold;color:#00ffc8;letter-spacing:8px;margin:24px 0;">${otp}</div>
            <p style="color:#aaa;font-size:0.9rem;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      throw new Error(err);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP email: " + err.message });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required." });

  const stored = otpStore.get(email);
  if (!stored) return res.status(400).json({ error: "No OTP found for this email." });
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP has expired. Please request a new one." });
  }
  if (stored.otp !== otp) return res.status(400).json({ error: "Incorrect OTP." });

  otpStore.delete(email);
  res.json({ success: true });
});

app.post("/api/ai", async (req, res) => {
  const { salary, transactions } = req.body;
  if (!salary || !transactions?.length)
    return res.status(400).json({ error: "Salary and transactions required." });

  const prompt = `You are a strict but caring Indian financial advisor.
Monthly Salary: Rs ${salary}
This month's expenses:
${transactions.map(t => `- ${t.title}: Rs ${t.amount} (${t.category})`).join("\n")}

Analyze spending, identify wasteful categories, suggest exact cuts, and recommend savings redirection.
Be direct, use short paragraphs. End with one motivational line.`;

  if (process.env.OPENAI_API_KEY) {
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
      if (response.ok) {
        const data = await response.json();
        return res.json({ text: data.choices[0].message.content });
      }
      const errBody = await response.json().catch(() => ({}));
      if (!["insufficient_quota", "credit_balance_exhausted"].includes(errBody?.error?.code)) {
        throw new Error(errBody?.error?.message || "OpenAI error");
      }
    } catch (err) {
      if (!err.message?.includes("quota") && !err.message?.includes("credits")) {
        return res.status(500).json({ error: "AI advisor temporarily unavailable. Please try again." });
      }
    }
  }

  try {
    const text = await geminiGenerate(prompt);
    return res.json({ text });
  } catch (err) {
    return res.status(500).json({ error: "AI advisor temporarily unavailable. Please try again in a few minutes." });
  }
});

app.post("/api/scan-bill", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "No image provided." });

  const prompt = `You are an expert bill scanner. Extract all line items from this receipt image.
Return ONLY valid JSON with no markdown:
{"items":[{"title":"item name","amount":0,"category":"Food"}],"total":0,"date":"DD/MM/YYYY or null"}
Categories: Food, Bills, Shopping, Travel, Other.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
        ]}]
      }),
    });
    const data = await response.json();
    if (!data.candidates?.[0]) return res.status(500).json({ error: "Could not read the bill. Try a clearer photo." });
    const raw = data.candidates[0].content.parts[0].text;
    res.json(safeParseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: "Bill scan failed. Please try a clearer photo." });
  }
});

app.post("/api/deals", async (req, res) => {
  const { query, budget } = req.body;
  if (!query) return res.status(400).json({ error: "Search query required." });

  const prompt = `You are a smart Indian shopping assistant. The user wants to buy: "${query}". Budget: Rs ${budget || "not specified"}.

Compare estimated prices across Amazon India, Flipkart, Myntra, Zepto, Blinkit.
Return ONLY valid JSON with no markdown:
{
  "deals": [
    {
      "platform": "Amazon",
      "productName": "specific product name with brand",
      "price": 799,
      "originalPrice": 1299,
      "discount": "38%",
      "link": "https://www.amazon.in/s?k=${encodeURIComponent(query)}",
      "rating": "4.2/5",
      "tip": "one line buying tip"
    }
  ],
  "bestPick": "platform name",
  "savingTip": "one overall tip"
}
Include 3-5 platforms. Sort by price ascending. Use realistic price estimates.`;

  try {
    const text = await geminiGenerate(prompt);
    const result = safeParseJSON(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Deal search failed. Please try again." });
  }
});

app.post("/api/invest", async (req, res) => {
  const { salary, totalExpenses, savings, goal } = req.body;

  const prompt = `You are a SEBI-registered Indian financial advisor.
Monthly Salary: Rs ${salary}
Monthly Expenses: Rs ${totalExpenses}
Monthly Savings: Rs ${savings}
Goal: ${goal || "General wealth building"}

Return ONLY valid JSON with no markdown:
{
  "summary": "one line assessment",
  "recommendations": [
    {
      "type": "SIP",
      "name": "specific fund name",
      "amount": 1000,
      "reason": "why suitable",
      "risk": "Low",
      "expectedReturn": "12% per year"
    }
  ],
  "emergencyFund": "advice string",
  "warnings": ["warning if any"]
}
Risk must be exactly: Low, Medium, or High.`;

  try {
    const text = await geminiGenerate(prompt);
    const result = safeParseJSON(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Investment advice failed. Please try again." });
  }
});

app.post("/api/parse-upi", async (req, res) => {
  const { smsText } = req.body;
  if (!smsText) return res.status(400).json({ error: "SMS text required." });

  const prompt = `Parse UPI transactions from this Indian bank SMS: "${smsText}"
Return ONLY valid JSON with no markdown:
{
  "transactions": [
    {
      "merchant": "merchant name",
      "amount": 0,
      "type": "debit",
      "platform": "gpay",
      "category": "Food",
      "date": "DD/MM/YYYY or null"
    }
  ]
}
platform: gpay, paytm, phonepe, bank, or other. type: debit or credit.
category: Food, Travel, Shopping, Bills, Entertainment, Health, Other.`;

  try {
    const text = await geminiGenerate(prompt);
    const result = safeParseJSON(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not parse SMS. Please check the format." });
  }
});

app.post("/api/parse-email", async (req, res) => {
  const { emailText } = req.body;
  if (!emailText) return res.status(400).json({ error: "Email text required." });

  const prompt = `Parse payment transactions from this Indian payment email: "${emailText}"
Return ONLY valid JSON with no markdown:
{
  "transactions": [
    {
      "merchant": "merchant name",
      "amount": 0,
      "type": "debit",
      "platform": "gpay",
      "category": "Food",
      "date": "DD/MM/YYYY"
    }
  ]
}
platform: gpay, paytm, phonepe, bank, or other.`;

  try {
    const text = await geminiGenerate(prompt);
    const result = safeParseJSON(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not parse email. Please check the content." });
  }
});

app.post("/api/parse-csv", async (req, res) => {
  const { csvText } = req.body;
  if (!csvText) return res.status(400).json({ error: "CSV text required." });

  const prompt = `Parse this Indian bank statement CSV and extract transactions:
"${csvText.substring(0, 3000)}"
Return ONLY valid JSON with no markdown:
{
  "transactions": [
    {
      "merchant": "description",
      "amount": 0,
      "type": "debit",
      "platform": "bank",
      "category": "Food",
      "date": "DD/MM/YYYY"
    }
  ]
}
category: Food, Travel, Shopping, Bills, Entertainment, Health, Other. type: debit or credit.`;

  try {
    const text = await geminiGenerate(prompt);
    const result = safeParseJSON(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not parse CSV. Please check the file format." });
  }
});

app.post("/api/categorize", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required." });

  const prompt = `Categorize this expense: "${text}"
Categories: Food, Travel, Shopping, Bills, Entertainment, Health, Other
Return ONLY the category name, nothing else.`;

  try {
    const result = await geminiGenerate(prompt);
    res.json({ category: result.trim() || "Other" });
  } catch (err) {
    res.status(500).json({ error: "Categorization failed." });
  }
});

app.post("/api/goal-predict", (req, res) => {
  const { goalName, targetAmount, currentSavings, monthlySaving } = req.body;
  const monthsLeft = monthlySaving > 0
    ? Math.ceil((targetAmount - currentSavings) / monthlySaving)
    : null;
  const targetDate = monthsLeft
    ? new Date(Date.now() + monthsLeft * 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;
  res.json({
    monthsLeft,
    targetDate,
    message: monthsLeft
      ? `At your current savings rate, you'll reach "${goalName}" in ${monthsLeft} months (${targetDate}).`
      : "Increase your monthly savings to reach this goal.",
  });
});

app.get("/api/stocks", async (req, res) => {
  const symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "WIPRO", "SBIN", "BAJFINANCE", "HINDUNILVR", "ITC"];

  if (process.env.ALPHA_VANTAGE_KEY) {
    try {
      const results = await Promise.all(
        symbols.slice(0, 5).map(async (sym) => {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}.BSE&apikey=${process.env.ALPHA_VANTAGE_KEY}`;
          const r = await fetch(url);
          const d = await r.json();
          const q = d["Global Quote"];
          return {
            symbol: sym,
            price: parseFloat(q?.["05. price"] || 0).toFixed(2),
            change: parseFloat(q?.["09. change"] || 0).toFixed(2),
            changePercent: q?.["10. change percent"] || "0%",
            high: parseFloat(q?.["03. high"] || 0).toFixed(2),
            low: parseFloat(q?.["04. low"] || 0).toFixed(2),
          };
        })
      );
      return res.json({ stocks: results, source: "live" });
    } catch (err) {
      console.error("Stock API error:", err.message);
    }
  }

  const mock = symbols.map(sym => {
    const base = { RELIANCE: 2850, TCS: 3920, INFY: 1780, HDFCBANK: 1650, ICICIBANK: 1120, WIPRO: 480, SBIN: 820, BAJFINANCE: 6900, HINDUNILVR: 2400, ITC: 465 }[sym] || 1000;
    const change = (Math.random() * 60 - 30).toFixed(2);
    const price = (base + parseFloat(change)).toFixed(2);
    return {
      symbol: sym,
      price,
      change,
      changePercent: ((parseFloat(change) / base) * 100).toFixed(2) + "%",
      high: (parseFloat(price) + Math.random() * 20).toFixed(2),
      low: (parseFloat(price) - Math.random() * 20).toFixed(2),
    };
  });

  res.json({ stocks: mock, source: "simulated" });
});

app.post("/api/contact-support", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "All fields required." });

  if (!process.env.RESEND_API_KEY) {
    console.log(`Support request from ${name} (${email}): ${message}`);
    return res.json({ success: true });
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SaverBuddy Support <noreply@saverbuddy.app>",
        to: ["priyanshsax0709@gmail.com"],
        subject: `Support Request from ${name}`,
        html: `
          <h2>New Support Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      }),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not send message. Please email us directly at priyanshsax0709@gmail.com" });
  }
});

app.get("/api/debug", (req, res) => {
  res.json({
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    resend: !!process.env.RESEND_API_KEY,
    alphaVantage: !!process.env.ALPHA_VANTAGE_KEY,
    frontend: process.env.FRONTEND_URL || "not set",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SaverBuddy API running on port ${PORT}`));