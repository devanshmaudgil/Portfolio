import { useEffect, useRef, useState } from "react";
import { useAsk } from "../context/AskContext";
import { suggestedAsks } from "../lib/rag";

export default function AskPanel() {
  const { open, loading, messages, ask, close, clear } = useAsk();
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 280);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const submit = (text) => {
    const q = (text ?? draft).trim();
    if (!q || loading) return;
    setDraft("");
    ask(q);
  };

  return (
    <>
      <button
        type="button"
        className={`ask-backdrop ${open ? "is-on" : ""}`}
        aria-label="Close ask panel"
        onClick={close}
      />

      <aside
        className={`ask-panel ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        aria-label="Ask about Devansh"
      >
        <header className="ask-panel-head">
          <div>
            <p className="ask-kicker">Devansh&apos;s assistant</p>
            <h2>Ask me anything</h2>
          </div>
          <div className="ask-panel-actions">
            {messages.length > 0 && (
              <button type="button" className="ask-ghost" onClick={clear}>
                Clear
              </button>
            )}
            <button type="button" className="ask-close" onClick={close} aria-label="Close">
              ×
            </button>
          </div>
        </header>

        <div className="ask-panel-body">
          {messages.length === 0 && !loading && (
            <div className="ask-empty">
              <p>
                I&apos;m Devansh&apos;s assistant. Ask me anything about his
                work, stack, projects, or how to reach him.
              </p>
              <div className="ask-suggestions">
                {suggestedAsks.map((item) => (
                  <button key={item} type="button" onClick={() => submit(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`ask-bubble ask-${msg.role}`}>
              <p>{msg.text}</p>
              {msg.sources?.length > 0 && (
                <div className="ask-sources">
                  {msg.sources.map((src) => (
                    <a
                      key={src.id}
                      href={src.href}
                      onClick={close}
                    >
                      {src.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="ask-bubble ask-assistant is-loading">
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="ask-panel-foot"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything about Devansh…"
            autoComplete="off"
            spellCheck="false"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !draft.trim()}>
            Ask
          </button>
        </form>
      </aside>
    </>
  );
}
