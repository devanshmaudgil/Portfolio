import { suggestedAsks } from "../data/knowledge";

/**
 * Client-side Ask entry. The Groq/OpenAI key never leaves the server.
 * Browser only posts the question to /api/ask.
 */
export async function askAboutDevansh(query, history = []) {
  const q = query.trim();
  if (!q) {
    return {
      answer:
        "Ask me anything about Devansh — projects, skills, experience, or how to reach him.",
      sources: [],
    };
  }

  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: q,
      history: history.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      })),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `Ask failed (${res.status}). Check Vercel logs / GROQ_API_KEY.`
    );
  }

  return {
    answer: data.answer,
    sources: data.sources || [],
    provider: data.provider,
  };
}

/** Key stays on the server — the panel is always available. */
export function hasAiKey() {
  return true;
}

export { suggestedAsks };
