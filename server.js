require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const COMPANY_KEYS = {
  gemini: process.env.COMPANY_GEMINI_API_KEY,
  openai: process.env.COMPANY_OPENAI_API_KEY,
};

async function getUsage(userId, model) {
  const { data } = await supabase
    .from("profiles")
    .select(`company_${model}_tokens_used`)
    .eq("id", userId)
    .single();
  return data ? data[`company_${model}_tokens_used`] : 0;
}
async function incrementUsage(userId, model, tokens) {
  await supabase
    .from("profiles")
    .update({
      [`company_${model}_tokens_used`]: supabase.raw(
        `company_${model}_tokens_used + ${tokens}`
      ),
    })
    .eq("id", userId);
}
async function getLimit(model) {
  const { data } = await supabase
    .from("company_api_limits")
    .select("monthly_limit")
    .eq("model", model)
    .single();
  return data ? data.monthly_limit : 10000;
}

app.post("/api/ai-proxy", async (req, res) => {
  const { userId, model, prompt } = req.body;
  if (!userId || !model || !prompt)
    return res.status(400).json({ error: "Missing params" });

  const usage = await getUsage(userId, model);
  const limit = await getLimit(model);
  if (usage >= limit)
    return res.status(403).json({ error: "Free quota exceeded" });

  let apiRes,
    tokensUsed = 0;
  if (model === "gemini") {
    apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${COMPANY_KEYS.gemini}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    tokensUsed = prompt.length / 4;
  } else if (model === "openai") {
    apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COMPANY_KEYS.openai}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    tokensUsed = prompt.length / 4;
  } else {
    return res.status(400).json({ error: "Unknown model" });
  }

  const data = await apiRes.json();
  await incrementUsage(userId, model, Math.ceil(tokensUsed));
  res.json(data);
});

app.listen(3001, () => console.log("Proxy running on http://localhost:3001"));
