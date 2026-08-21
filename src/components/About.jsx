import { profile } from "../data/content";
import Reveal from "./Reveal";
import ScrollHighlight from "./ScrollHighlight";

const stats = [
  { value: "End-to-end", label: "Client delivery" },
  { value: "Web + Mobile", label: "Product surface" },
  { value: "AI agents", label: "Build workflow" },
];

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container about-grid">
        <Reveal>
          <p className="section-label">Profile</p>
          <h2 className="section-title">Building systems that actually ship.</h2>
        </Reveal>
        <div>
          <ScrollHighlight className="about-copy" text={profile.summary} />
          <Reveal delay={240}>
            <p className="about-copy muted">
              Proficient in AI integration and building with AI agents, using tools
              such as Cursor, Claude Code, and Emergent.sh.
            </p>
          </Reveal>
          <div className="stat-row">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={180 + i * 120} className="stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
