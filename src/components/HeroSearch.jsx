import { useState } from "react";
import { useAsk } from "../context/AskContext";
import { suggestedAsks } from "../lib/rag";

export default function HeroSearch() {
  const { ask, open: panelOpen } = useAsk();
  const [query, setQuery] = useState("");
  const [hintsOpen, setHintsOpen] = useState(false);

  const submit = (text) => {
    const q = (text ?? query).trim();
    if (!q) return;
    setHintsOpen(false);
    setQuery("");
    ask(q);
  };

  const hints = suggestedAsks.filter((item) =>
    query.trim()
      ? item.toLowerCase().includes(query.trim().toLowerCase())
      : true
  );

  return (
    <div className="hero-search">
      <label className="hero-search-bar">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          placeholder="Ask anything about Devansh…"
          autoComplete="off"
          spellCheck="false"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHintsOpen(true);
          }}
          onFocus={() => setHintsOpen(true)}
          onBlur={() => setTimeout(() => setHintsOpen(false), 140)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          className="hero-search-go"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => submit()}
        >
          Ask AI
        </button>
      </label>

      {hintsOpen && !panelOpen && hints.length > 0 && (
        <ul className="hero-search-results">
          {hints.slice(0, 6).map((item) => (
            <li key={item}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit(item);
                }}
              >
                <span>{item}</span>
                <small>Ask AI</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
