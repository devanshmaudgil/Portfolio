import { useEffect, useRef, useState } from "react";
import { buildMaskUrl, buildSilhouetteMask } from "../lib/silhouette";

const GLYPHS =
  "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン<>{}[]/=+*;:#$%&@";
const COL_GAP = 18;
const FONT = 14;

function randGlyph() {
  return GLYPHS[(Math.random() * GLYPHS.length) | 0];
}

export default function MatrixRain({ src, enabled, host }) {
  const canvasRef = useRef(null);
  const maskUrlRef = useRef("");
  const hotRef = useRef(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!host) return undefined;

    let revoked = false;
    const image = new Image();
    image.src = src;

    const apply = () => {
      if (revoked || !image.naturalWidth || !canvasRef.current) return;
      const rect = host.getBoundingClientRect();
      const mask = buildSilhouetteMask(image);
      const url = buildMaskUrl(
        mask,
        image,
        Math.round(rect.width * 0.45),
        Math.round(rect.height * 0.45)
      );
      maskUrlRef.current = url;
      const canvas = canvasRef.current;
      canvas.style.webkitMaskImage = `url(${url})`;
      canvas.style.maskImage = `url(${url})`;
      canvas.style.webkitMaskSize = "100% 100%";
      canvas.style.maskSize = "100% 100%";
    };

    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 80);
    };

    image.onload = apply;
    if (image.complete) apply();
    const observer = new ResizeObserver(schedule);
    observer.observe(host);

    return () => {
      revoked = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [src, host]);

  useEffect(() => {
    if (!host || !canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let drops = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let running = true;
    let last = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / COL_GAP);
      drops = Array.from({ length: cols }, () => ({
        y: Math.random() * h,
        speed: 0.5 + Math.random() * 1.2,
        trail: 10 + ((Math.random() * 12) | 0),
        glyphs: Array.from({ length: 22 }, randGlyph),
        tick: (Math.random() * 8) | 0,
      }));
    };

    const draw = (now) => {
      if (!running) return;
      const dt = Math.min(32, now - last || 16);
      last = now;

      ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${FONT}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (let i = 0; i < drops.length; i += 1) {
        const drop = drops[i];
        drop.y += drop.speed * (dt / 16);
        drop.tick += 1;

        if (drop.tick % 5 === 0) {
          drop.glyphs.pop();
          drop.glyphs.unshift(randGlyph());
        }

        const x = i * COL_GAP + COL_GAP * 0.5;
        if (drop.y - drop.trail * FONT > h) {
          drop.y = -Math.random() * h * 0.35;
          drop.speed = 0.5 + Math.random() * 1.2;
        }

        for (let t = 0; t < drop.trail; t += 1) {
          const gy = drop.y - t * FONT;
          if (gy < -FONT || gy > h) continue;
          const fade = 1 - t / drop.trail;
          if (t === 0) {
            ctx.fillStyle = `rgba(190, 255, 205, ${0.42 * fade})`;
          } else {
            ctx.fillStyle = `rgba(48, 170, 85, ${0.22 * fade})`;
          }
          ctx.fillText(drop.glyphs[t % drop.glyphs.length], x, gy);
        }
      }

      frame = requestAnimationFrame(draw);
    };

    const onEnter = () => {
      if (!enabled) return;
      hotRef.current = true;
      setActive(true);
    };

    const onMove = () => {
      if (!enabled || hotRef.current) return;
      onEnter();
    };

    const onLeave = () => {
      hotRef.current = false;
      setActive(false);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener("mouseenter", onEnter);
    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, host]);

  useEffect(() => {
    if (!enabled) setActive(false);
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      className={`matrix-rain ${enabled ? "is-enabled" : ""} ${active ? "is-active" : ""}`}
      aria-hidden="true"
    />
  );
}
