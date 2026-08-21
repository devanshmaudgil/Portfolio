import { knowledgeChunks, suggestedAsks } from "../data/knowledge";
import { profile } from "../data/content";

const STOP = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "to", "of", "in", "on", "for", "with", "and", "or", "but", "if", "as",
  "at", "by", "from", "that", "this", "these", "those", "it", "he", "she",
  "they", "his", "her", "their", "you", "your", "me", "my", "i", "we",
  "can", "could", "would", "should", "what", "who", "where", "when", "how",
  "why", "which", "about", "any", "some", "does", "do", "did", "tell",
]);

const SYSTEM_PROMPT = `You are Devansh's personal assistant on his portfolio site. Talk like a sharp, friendly human who actually knows him — not like a corporate chatbot or a search engine.

Voice:
- Casual-professional. Short. Natural. First person as his assistant ("he", "Devansh", "I'd say…").
- No stiff lines like "The available information does not mention…", "Based on the context…", "You could ask about…".
- No markdown, no bullet walls, no bold, no em dashes.
- 1–3 sentences most of the time. Sound like you're texting a recruiter back, not writing a report.

Content rules:
- Stick to the retrieved knowledge. Don't invent skills, jobs, or tools.
- If something isn't in the knowledge (e.g. Linux), be honest in a human way: "Nothing on the portfolio about Linux specifically — his stack here is more React, Flutter, Laravel, that kind of thing." Offer one useful adjacent fact if you have it.
- If they ask what he's built, name a few highlights in a sentence or two — don't list everything.
- Only go deep when they ask about one specific project or skill.`;

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function scoreChunk(queryTokens, chunk) {
  const hay = `${chunk.title} ${chunk.text} ${chunk.tags.join(" ")}`.toLowerCase();
  const hayTokens = new Set(tokenize(hay));
  let score = 0;

  for (const token of queryTokens) {
    if (hayTokens.has(token)) score += 2.2;
    else if (hay.includes(token)) score += 1.4;
    else {
      for (const tag of chunk.tags) {
        if (tag.includes(token) || token.includes(tag)) {
          score += 1.1;
          break;
        }
      }
    }
  }

  const title = chunk.title.toLowerCase();
  for (const token of queryTokens) {
    if (title.includes(token)) score += 1.5;
  }

  return score;
}

/** Retrieve top-k relevant knowledge chunks for a question. */
export function retrieve(query, k = 8) {
  const tokens = tokenize(query);
  if (!tokens.length) {
    return knowledgeChunks
      .filter((c) => ["profile", "skills-stack", "contact", "education"].includes(c.id))
      .slice(0, k)
      .map((c) => ({ ...c, score: 1 }));
  }

  return knowledgeChunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(tokens, chunk) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/** Ensure the LLM always has a grounded core + retrieved hits. */
function buildContext(query, retrieved) {
  const byId = new Map();
  const add = (chunk, score = chunk.score || 0) => {
    if (!chunk) return;
    const prev = byId.get(chunk.id);
    if (!prev || score > prev.score) byId.set(chunk.id, { ...chunk, score });
  };

  // Always ground with profile
  add(knowledgeChunks.find((c) => c.id === "profile"), 0.5);

  for (const chunk of retrieved) add(chunk);

  const q = query.toLowerCase();
  if (/(contact|email|phone|hire|reach|resume|github)/.test(q)) {
    add(knowledgeChunks.find((c) => c.id === "contact"), 2);
  }
  if (/(educat|college|universit|degree|stud|bca|school)/.test(q)) {
    add(knowledgeChunks.find((c) => c.id === "education"), 2);
  }
  if (/(project|built|portfolio|app)/.test(q)) {
    // Prefer retrieved hits; only add a couple more project cards if needed
    const projects = knowledgeChunks.filter((c) => c.id.startsWith("project-"));
    projects.slice(0, 3).forEach((c) => add(c, 1.0));
  }
  if (/(experience|work|job|ats|audit|shipped)/.test(q)) {
    knowledgeChunks
      .filter((c) => c.id.startsWith("exp-"))
      .forEach((c) => add(c, 1.2));
  }
  if (/(skill|stack|tech|know|language|framework|ai)/.test(q)) {
    add(knowledgeChunks.find((c) => c.id === "skills-stack"), 1.5);
    add(knowledgeChunks.find((c) => c.id === "ai-tools"), 1.2);
  }

  // Weak retrieval fallback: give the model a broad portfolio slice
  if (retrieved.length < 2) {
    ["education", "skills-stack", "contact", "availability"].forEach((id) => {
      add(knowledgeChunks.find((c) => c.id === id), 0.8);
    });
    knowledgeChunks
      .filter((c) => c.id.startsWith("project-") || c.id.startsWith("exp-"))
      .slice(0, 4)
      .forEach((c) => add(c, 0.7));
  }

  return [...byId.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function getApiConfig() {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  const openAiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim();

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

async function generateWithLlm(query, chunks, history = []) {
  const config = getApiConfig();
  if (!config) {
    throw new Error(
      "Missing API key. Add VITE_GROQ_API_KEY to your .env file and restart the dev server."
    );
  }

  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.title}\n${c.text}`)
    .join("\n\n");

  const prior = history
    .slice(-6)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    }));

  const res = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.55,
      max_tokens: 220,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Retrieved knowledge about ${profile.name}:\n\n${context}`,
        },
        ...prior,
        { role: "user", content: query },
      ],
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err?.error?.message || "";
    } catch {
      detail = "";
    }
    throw new Error(
      detail ||
        `AI request failed (${res.status}). Check your API key and try again.`
    );
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The model returned an empty answer.");

  return {
    answer: text,
    sources: chunks.slice(0, 5).map((c) => ({
      id: c.id,
      title: c.title,
      href: c.href,
    })),
    provider: config.provider,
  };
}

/**
 * Real RAG: retrieve portfolio chunks → answer with Groq/OpenAI.
 */
export async function askAboutDevansh(query, history = []) {
  const q = query.trim();
  if (!q) {
    return {
      answer: "Ask me anything about Devansh — projects, skills, experience, or how to reach him.",
      sources: [],
    };
  }

  const retrieved = retrieve(q, 8);
  const chunks = buildContext(q, retrieved);
  return generateWithLlm(q, chunks, history);
}

export function hasAiKey() {
  return Boolean(getApiConfig());
}

export { suggestedAsks };
