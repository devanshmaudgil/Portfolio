import { useEffect, useRef, useState } from "react";
import { experience } from "../data/content";
import Reveal from "./Reveal";

function ProgressBar({ delay }) {
  const ref = useRef(null);
  const [fill, setFill] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFill(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="exp-bar"
      style={{ "--fill-delay": `${delay}ms` }}
    >
      <span className={`exp-bar-fill ${fill ? "is-in" : ""}`} />
    </span>
  );
}

function HighlightItem({ text, index }) {
  return (
    <Reveal as="li" delay={index * 120} className="exp-highlight">
      <span className="exp-highlight-num">0{index + 1}</span>
      <span>{text}</span>
    </Reveal>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <Reveal>
          <p className="section-label">Experience</p>
          <h2 className="section-title">What I've built.</h2>
        </Reveal>

        <div className="exp-track">
          {experience.map((item, i) => (
            <Reveal
              key={item.id}
              delay={i * 200}
              className="exp-card"
            >
              <div className="exp-card-head">
                <div className="exp-card-badge">
                  <span className="exp-type">{item.type}</span>
                  <span className={`exp-status ${item.status === "Shipped" ? "is-shipped" : ""}`}>
                    {item.status === "Shipped" && <i className="exp-dot" />}
                    {item.status}
                  </span>
                </div>
                <h3 className="exp-card-title">{item.title}</h3>
                <p className="exp-card-desc">{item.description}</p>
              </div>

              <div className="exp-stack">
                {item.stack.map((tech, j) => (
                  <div key={tech} className="exp-stack-item">
                    <span className="exp-stack-label">{tech}</span>
                    <ProgressBar delay={300 + j * 140} />
                  </div>
                ))}
              </div>

              <ul className="exp-highlights">
                {item.highlights.map((hl, j) => (
                  <HighlightItem key={hl} text={hl} index={j} />
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
