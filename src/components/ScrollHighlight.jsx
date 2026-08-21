import { useEffect, useMemo, useRef } from "react";

export default function ScrollHighlight({ text, className = "" }) {
  const ref = useRef(null);
  const charsRef = useRef([]);
  const litRef = useRef(-1);

  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const spans = charsRef.current.filter(Boolean);
    const total = spans.length;
    if (!total) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      spans.forEach((span) => span.classList.add("is-lit"));
      return undefined;
    }

    let frame = 0;

    const paint = (progress) => {
      const lit = Math.round(progress * (total - 1));
      if (lit === litRef.current) return;
      const prev = litRef.current;
      litRef.current = lit;

      if (prev < 0) {
        for (let i = 0; i < total; i += 1) {
          spans[i].classList.toggle("is-lit", i <= lit);
        }
        return;
      }

      if (lit > prev) {
        for (let i = prev + 1; i <= lit; i += 1) spans[i]?.classList.add("is-lit");
      } else {
        for (let i = lit + 1; i <= prev; i += 1) spans[i]?.classList.remove("is-lit");
      }
    };

    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const view = window.innerHeight || 1;
      // Starts dim as the block enters; finishes after ~one viewport of scroll
      const start = view * 0.92;
      const end = view * 0.18;
      const raw = (start - rect.top) / Math.max(1, start - end);
      paint(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chars]);

  // Group into words so wrapping stays natural
  const words = useMemo(() => {
    const parts = text.split(/(\s+)/);
    let index = 0;
    return parts.map((part) => {
      const items = Array.from(part).map((char) => {
        const item = { char, index };
        index += 1;
        return item;
      });
      return {
        key: `w-${index}`,
        isSpace: /^\s+$/.test(part),
        items,
      };
    });
  }, [text]);

  return (
    <p ref={ref} className={`scroll-highlight ${className}`.trim()}>
      {words.map((word) => (
        <span
          key={word.key}
          className={word.isSpace ? "scroll-space" : "scroll-word"}
        >
          {word.items.map(({ char, index }) => (
            <span
              key={index}
              ref={(el) => {
                charsRef.current[index] = el;
              }}
              className="scroll-char"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}
