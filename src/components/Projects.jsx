import { projects } from "../data/content";
import Reveal from "./Reveal";

export default function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="container">
        <Reveal>
          <p className="section-label">Selected work</p>
          <h2 className="section-title">Personal projects.</h2>
        </Reveal>

        <div className="project-grid">
          {projects.map((project, index) => (
            <Reveal
              key={project.title}
              delay={index * 110}
              as="article"
              className="project-card"
            >
              <span className="project-index">{String(index + 1).padStart(2, "0")}</span>

              <h3>{project.title}</h3>

              <div className="tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <p>{project.description}</p>

              <ul className="project-points">
                {project.points.map((point, i) => (
                  <li key={`${project.title}-${i}`}>{point}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
