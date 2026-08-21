import { useEffect, useRef, useState } from "react";
import { aiSkills, education, stackSkills } from "../data/content";
import ParticleLogo from "./ParticleLogo";
import Reveal from "./Reveal";

export default function Skills() {
  const pinRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const node = pinRef.current;
    if (!node) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const total = Math.max(1, node.offsetHeight - view);
      const scrolled = Math.min(total, Math.max(0, -rect.top));

      // Opening beat: heading sits centered before docking to the header
      const introLen = Math.min(total * 0.5, view * 0.9);
      const introProgress = Math.min(1, scrolled / introLen);
      setDocked(introProgress >= 0.5);

      const after = Math.max(0, scrolled - introLen);
      const t = Math.min(1, after / Math.max(1, total - introLen));

      const n = stackSkills.length;
      const index = Math.min(n - 1, Math.floor(t * n));

      if (index !== activeRef.current) {
        activeRef.current = index;
        setActive(index);
      }

      setEntered(rect.top < view * 0.85 && rect.bottom > view * 0.15);
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
  }, []);

  const skill = stackSkills[active];
  const pinHeight = `${100 + Math.max(3, stackSkills.length) * 78}vh`;

  return (
    <>
      <section
        id="skills"
        ref={pinRef}
        className={`stack-pin ${entered ? "is-entered" : ""}`}
        style={{ height: pinHeight }}
      >
        <div className="stack-pin-sticky">
          <div className="container stack-pin-inner">
            <header
              className={`stack-heading ${entered ? "is-in" : ""} ${
                docked ? "is-docked" : "is-intro"
              }`}
            >
              <div className="stack-heading-main">
                <p className="section-label">Capabilities</p>
                <h2 className="section-title">Tech Stack I ship with.</h2>
              </div>
              <span className="stack-counter">
                <strong>{String(active + 1).padStart(2, "0")}</strong>
                <i />
                {String(stackSkills.length).padStart(2, "0")}
              </span>
            </header>

            <div className={`stack-body ${docked ? "is-in" : ""}`}>
              <div className="stack-stage">
                <div className="stack-copy">
                  <div className="stack-copy-inner" key={skill.id}>
                    <h3>{skill.name}</h3>
                    <p>{skill.line}</p>
                  </div>
                </div>

                <div className="stack-visual">
                  <ParticleLogo skillId={skill.id} />
                </div>
              </div>

              <div className="stack-rail" aria-hidden="true">
                {stackSkills.map((item, i) => (
                  <span
                    key={item.id}
                    className={`stack-tick ${i === active ? "is-on" : ""} ${
                      i < active ? "is-done" : ""
                    }`}
                  >
                    <b>{item.name}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section stack-after">
        <div className="container stack-after-grid">
          <Reveal>
            <p className="section-label">AI Integration</p>
            <h2 className="section-title">Agents in the workflow.</h2>
            <p className="stack-after-copy">
              After the core stack, this is how I move faster: AI tools wired into
              real build loops, not just demos.
            </p>
            <div className="tags ai-tags">
              {aiSkills.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={140} className="edu-card stack-edu">
            <p className="section-label">Education</p>
            <h3>{education.degree}</h3>
            <p className="edu-focus">{education.focus}</p>
            <p className="muted">
              {education.school} · {education.period}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
