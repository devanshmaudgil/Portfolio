import {
  buildContext,
  buildMessages,
  isPortfolioQuestion,
  offTopicReply,
  polishAnswer,
  retrieve,
  sourcesFromChunks,
} from "../src/lib/ragCore.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

function getApiConfig() {
  // Prefer server-only names; accept VITE_ only as a migration fallback
  // (still server-side here — never ship VITE_ keys to the client bundle).
  const groqKey = (
    process.env.GROQ_API_KEY ||
    process.env.VITE_GROQ_API_KEY ||
    ""
  ).trim();
  const openAiKey = (
    process.env.OPENAI_API_KEY ||
    process.env.VITE_OPENAI_API_KEY ||
    ""
  ).trim();

  if (groqKey) {
    return {
      apiKey: groqKey,
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: "openai/gpt-oss-120b",
      provider: "groq",
    };
  }

  if (openAiKey) {
    return {
      apiKey: openAiKey,
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
      provider: "openai",
    };
  }

  return null;
}

function parseBody(req) {
  if (req.body == null || req.body === "") return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (typeof req.body === "object") return req.body;
  return {};
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const query = String(body.query || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!query) {
      return res.status(400).json({ error: "Question is required." });
    }

    if (query.length > 500) {
      return res.status(400).json({ error: "Question is too long." });
    }

    // Block off-topic asks before spending any Groq tokens
    if (!isPortfolioQuestion(query)) {
      return res.status(200).json({
        answer: offTopicReply(),
        sources: [],
        provider: "guard",
      });
    }

    const config = getApiConfig();
    if (!config) {
      return res.status(500).json({
        error:
          "Server AI key missing. In Vercel → Settings → Environment Variables, add GROQ_API_KEY (Production), then Redeploy.",
      });
    }

    const retrieved = retrieve(query, 8);
    // No useful portfolio match and no strong portfolio cue → don't call the model
    const best = retrieved[0]?.score || 0;
    if (best < 1.5 && !/\b(devansh|maudgil|he|him|his)\b/i.test(query)) {
      return res.status(200).json({
        answer: offTopicReply(),
        sources: [],
        provider: "guard",
      });
    }

    const chunks = buildContext(query, retrieved);
    const messages = buildMessages(query, chunks, history);

    const upstream = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.55,
        max_tokens: 220,
        messages,
      }),
    });

    if (!upstream.ok) {
      let detail = "";
      try {
        const err = await upstream.json();
        detail = err?.error?.message || JSON.stringify(err);
      } catch {
        detail = "";
      }
      return res.status(502).json({
        error: detail || `Upstream AI failed (${upstream.status}).`,
      });
    }

    const data = await upstream.json();
    const answer = polishAnswer(data?.choices?.[0]?.message?.content || "");
    if (!answer) {
      return res.status(502).json({ error: "Empty model response." });
    }

    return res.status(200).json({
      answer,
      sources: sourcesFromChunks(chunks),
      provider: config.provider,
    });
  } catch (err) {
    console.error("[api/ask]", err);
    return res.status(500).json({
      error: err?.message || "Ask endpoint failed.",
    });
  }
}
