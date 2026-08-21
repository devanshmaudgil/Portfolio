import { profile } from "../data/content";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <Reveal className="container contact-card">
        <p className="section-label">Contact</p>
        <h2 className="section-title">Let's build the next one.</h2>
        <p className="muted contact-copy">
          Open to full-time roles, internships converting to full-time, and
          end-to-end client work across web, mobile, and AI-integrated systems.
        </p>
        <div className="contact-actions">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <a className="btn btn-ghost" href={profile.phoneHref}>
            {profile.phone}
          </a>
          <a
            className="btn btn-ghost"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </Reveal>
    </section>
  );
}
