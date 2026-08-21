import { useEffect, useRef } from "react";
import { getLogoPoints, getSkillColor } from "../lib/skillLogos";

const COUNT = 15000;
const SCATTER_MS = 320;
const REFORM_MS = 900;

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

// Smoothstep — no overshoot, settles cleanly
const smooth = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export default function ParticleLogo({ skillId }) {
  const canvasRef = useRef(null);
  const skillRef = useRef(skillId);

  useEffect(() => {
    skillRef.current = skillId;
  }, [skillId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d");

    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const tx = new Float32Array(COUNT);
    const ty = new Float32Array(COUNT);
    const lerp = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    const idleAmp = new Float32Array(COUNT);
    const idleSpeed = new Float32Array(COUNT);
    const scatterDir = new Float32Array(COUNT);
    const scatterDist = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i += 1) {
      // Slight per-particle stagger so the morph feels organic, not springy
      lerp[i] = 0.08 + Math.random() * 0.05;
      phase[i] = Math.random() * Math.PI * 2;
      idleAmp[i] = 0.8 + Math.random() * 2.2;
      idleSpeed[i] = 0.45 + Math.random() * 1.1;
      scatterDir[i] = Math.random() * Math.PI * 2;
      scatterDist[i] = 0.55 + Math.random() * 0.45;
    }

    let w = 0;
    let h = 0;
    let dw = 0;
    let dh = 0;
    let image = null;
    let buffer = null;
    let seeded = false;
    let frame = 0;
    let running = true;
    let time = 0;

    let renderedId = skillRef.current;
    let stage = "reform";
    let stageStart = performance.now();
    let form = 0;

    const retarget = (id) => {
      const points = getLogoPoints(id, COUNT);
      const total = points.length;
      const cx = dw * 0.5;
      const cy = dh * 0.5;
      const scale = Math.min(dw, dh) * 0.76;

      for (let i = 0; i < COUNT; i += 1) {
        if (total) {
          const t = points[i % total];
          tx[i] = cx + t.x * scale;
          ty[i] = cy + t.y * scale;
        } else {
          tx[i] = cx;
          ty[i] = cy;
        }
      }
      renderedId = id;
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dw = Math.round(w * dpr);
      dh = Math.round(h * dpr);
      canvas.width = dw;
      canvas.height = dh;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      image = ctx.createImageData(dw, dh);
      buffer = new Uint32Array(image.data.buffer);

      if (!seeded) {
        for (let i = 0; i < COUNT; i += 1) {
          px[i] = Math.random() * dw;
          py[i] = Math.random() * dh;
        }
        seeded = true;
      }
      retarget(renderedId);
    };

    const draw = (now) => {
      if (!running) return;
      time += 0.016;

      const wanted = skillRef.current;

      // Queue the next morph only when settled — avoids mid-bounce retargets
      if (stage === "idle" && wanted !== renderedId) {
        stage = "scatter";
        stageStart = now;
      }

      if (stage === "scatter") {
        const p = Math.min(1, (now - stageStart) / SCATTER_MS);
        form = 1 - smooth(p);
        if (p >= 1) {
          retarget(wanted);
          stage = "reform";
          stageStart = now;
        }
      } else if (stage === "reform") {
        const p = Math.min(1, (now - stageStart) / REFORM_MS);
        form = smooth(p);
        if (p >= 1) {
          form = 1;
          // If scroll jumped ahead, chain into the next logo without a pause
          if (wanted !== renderedId) {
            stage = "scatter";
            stageStart = now;
          } else {
            stage = "idle";
          }
        }
      } else {
        form = 1;
      }

      // Soft outward drift — enough to dissolve, not a hard bounce
      const scatter = (1 - form) * Math.min(dw, dh) * 0.22;
      const alpha = Math.round((0.32 + form * 0.58) * 255);
      const { r, g, b } = hexToRgb(getSkillColor(renderedId));
      const packed = (alpha << 24) | (b << 16) | (g << 8) | r;

      buffer.fill(0);

      for (let i = 0; i < COUNT; i += 1) {
        const ph = phase[i] + time * idleSpeed[i];
        const dir = scatterDir[i];
        const gx =
          tx[i] +
          Math.cos(ph) * idleAmp[i] +
          Math.cos(dir) * scatter * scatterDist[i];
        const gy =
          ty[i] +
          Math.sin(ph * 1.17) * idleAmp[i] +
          Math.sin(dir) * scatter * scatterDist[i];

        // Critical-style lerp: approaches target, never overshoots
        const k = lerp[i] * (0.55 + form * 0.7);
        px[i] += (gx - px[i]) * k;
        py[i] += (gy - py[i]) * k;

        const ix = px[i] | 0;
        const iy = py[i] | 0;
        if (ix >= 0 && ix < dw && iy >= 0 && iy < dh) {
          buffer[iy * dw + ix] = packed;
        }
      }

      ctx.putImageData(image, 0, 0);
      frame = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    frame = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-logo" aria-hidden="true" />;
}
