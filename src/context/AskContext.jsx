import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { askAboutDevansh, hasAiKey } from "../lib/rag";

const AskContext = createContext(null);

export function AskProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const close = useCallback(() => setOpen(false), []);

  const ask = useCallback(async (raw) => {
    const query = raw.trim();
    if (!query) return;

    setOpen(true);
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: query,
    };

    // Capture history before appending the new user turn
    let historySnapshot = [];
    setMessages((prev) => {
      historySnapshot = prev;
      return [...prev, userMsg];
    });
    setLoading(true);

    try {
      if (!hasAiKey()) {
        throw new Error(
          "AI key not loaded. Add VITE_GROQ_API_KEY in .env and restart npm run dev."
        );
      }

      const result = await askAboutDevansh(query, historySnapshot);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: result.answer,
          sources: result.sources || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text:
            err?.message ||
            "Something went wrong talking to the AI. Try again in a moment.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo(
    () => ({ open, loading, messages, ask, close, clear, setOpen }),
    [open, loading, messages, ask, close, clear]
  );

  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}

export function useAsk() {
  const ctx = useContext(AskContext);
  if (!ctx) throw new Error("useAsk must be used inside AskProvider");
  return ctx;
}
