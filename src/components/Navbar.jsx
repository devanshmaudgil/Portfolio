import { useState } from "react";
import { navLinks, profile } from "../data/content";

export default function Navbar({ scrolled, ready }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""} ${ready ? "is-ready" : ""}`}>
      <div className="container nav-inner">
        <a href="#top" className="logo" onClick={() => setOpen(false)}>
          DM
        </a>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a
            className="nav-github"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            GitHub
          </a>
        </nav>

        <button
          className={`menu-btn ${open ? "open" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
