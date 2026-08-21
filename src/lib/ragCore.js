import { knowledgeChunks } from "../data/knowledge.js";
import { profile } from "../data/content.js";

export const SYSTEM_PROMPT = `You are Devansh's personal assistant on his portfolio site. Talk like a sharp, friendly human who actually knows him, not like a corporate chatbot or a search engine.

Scope (strict):
- You ONLY answer questions about Devansh Maudgil: his work, projects, skills, education, contact, and this portfolio.
- Refuse coding homework, general tech tutorials, writing code, math, recipes, jokes, news, or anything not about him.
- If off-topic, say briefly that you only help with questions about Devansh and his work. Do not write code or solve the off-topic request.

Voice:
- Casual-professional. Short. Natural. First person as his assistant ("he", "Devansh", "I'd say").
- No stiff lines like "The available information does not mention", "Based on the context", "You could ask about".
- No markdown, no bullet walls, no bold.
- Never use em dashes or en dashes. Use commas, periods, or a normal hyphen (-) only.
- 1 to 3 sentences most of the time. Sound like you're texting a recruiter back, not writing a report.

Content rules:
- Stick to the retrieved knowledge. Don't invent skills, jobs, or tools.
- Contact details on this portfolio are PUBLIC on purpose. If the knowledge includes email, phone, GitHub, or resume, share them when asked (number, phone, email, contact, reach him, hire him, etc.). Never refuse those or invent LinkedIn/contact forms that are not in the knowledge.
- When sharing his phone number, always format it exactly as: +91 98176 09921
- If something else isn't in the knowledge (for example Linux), be honest in a human way and offer one useful adjacent fact if you have it.
- If they ask what he's built, name a few highlights in a sentence or two. Don't list everything.
- Only go deep when they ask about one specific project or skill.`;

const OFF_TOPIC_REPLY =
  "I only answer questions about Devansh and his work here. Ask about his projects, skills, experience, education, or how to reach him.";

const PORTFOLIO_HINTS =
  /\b(devansh|maudgil|portfolio|project|projects|skill|skills|stack|experience|work|shipped|hire|contact|email|phone|number|resume|github|education|bca|college|university|react|flutter|laravel|node|mysql|ats|attendance|f1|fruit|ninja|music|community|hub|ticket|about\s+him|who\s+is|what\s+does\s+he|has\s+he\s+built|tell\s+me\s+about\s+him)\b/i;

const OFF_TOPIC_HINTS =
  /\b(write|generate|create|code|program|script|function|algorithm|leetcode|homework|solve|python|javascript\s+code|java\s+code|c\+\+|recipe|weather|news|joke|poem|essay|translate|summarize\s+this|chatgpt|prompt)\b/i;

/** Cheap gate: block token burn on homework / general AI misuse. */
export function isPortfolioQuestion(query) {
  const q = String(query || "").trim();
  if (!q) return false;

  const aboutHim = /\b(devansh|maudgil|he|him|his|portfolio)\b/i.test(q);
  const onTopic = PORTFOLIO_HINTS.test(q);
  const codeAsk =
    /\b(generate|write|create|implement|code|program|script|function|algorithm|leetcode|homework|solve)\b/i.test(
      q
    ) &&
    /\b(program|code|script|function|algorithm|app|todo|class|method|python|java|c\+\+|html|css)\b/i.test(
      q
    );

  // Coding / generate homework that is not clearly about Devansh
  if (codeAsk && !aboutHim) return false;

  if (OFF_TOPIC_HINTS.test(q) && !onTopic && !aboutHim) return false;

  return true;
}

export function offTopicReply() {
  return OFF_TOPIC_REPLY;
}

export function polishAnswer(text) {
  let out = String(text || "");
  // Strip em/en dashes the model still sneaks in
  out = out.replace(/\u2014|\u2013|&mdash;|&ndash;/g, ",");
  out = out.replace(/\s*,\s*,+/g, ",");
  out = out.replace(/\s+,/g, ",");
  // Normalize any form of his Indian mobile to the preferred display
  out = out.replace(
    /(?:\+?91[\s-]*)?981[\s-]?760[\s-]?9921/g,
    "+91 98176 09921"
  );
  return out.trim();
}

const STOP = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "to", "of", "in", "on", "for", "with", "and", "or", "but", "if", "as",
  "at", "by", "from", "that", "this", "these", "those", "it", "he", "she",
  "they", "his", "her", "their", "you", "your", "me", "my", "i", "we",
  "can", "could", "would", "should", "what", "who", "where", "when", "how",
  "why", "which", "about", "any", "some", "does", "do", "did", "tell",
]);

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

export function retrieve(query, k = 8) {
  const tokens = tokenize(query);
  if (!tokens.length) {
    return knowledgeChunks
      .filter((c) =>
        ["profile", "skills-stack", "contact", "education"].includes(c.id)
      )
      .slice(0, k)
      .map((c) => ({ ...c, score: 1 }));
  }

  return knowledgeChunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(tokens, chunk) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function buildContext(query, retrieved) {
  const byId = new Map();
  const add = (chunk, score = chunk.score || 0) => {
    if (!chunk) return;
    const prev = byId.get(chunk.id);
    if (!prev || score > prev.score) byId.set(chunk.id, { ...chunk, score });
  };

  add(knowledgeChunks.find((c) => c.id === "profile"), 0.5);
  for (const chunk of retrieved) add(chunk);

  const q = query.toLowerCase();
  if (/(contact|email|phone|number|call|hire|reach|resume|github|whatsapp)/.test(q)) {
    add(knowledgeChunks.find((c) => c.id === "contact"), 3);
  }
  if (/(educat|college|universit|degree|stud|bca|school)/.test(q)) {
    add(knowledgeChunks.find((c) => c.id === "education"), 2);
  }
  if (/(project|built|portfolio|app)/.test(q)) {
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

export function buildMessages(query, chunks, history = []) {
  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.title}\n${c.text}`)
    .join("\n\n");

  const prior = history.slice(-6).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.text,
  }));

  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Retrieved knowledge about ${profile.name}:\n\n${context}`,
    },
    ...prior,
    { role: "user", content: query },
  ];
}

export function sourcesFromChunks(chunks) {
  return chunks.slice(0, 5).map((c) => ({
    id: c.id,
    title: c.title,
    href: c.href,
  }));
}
