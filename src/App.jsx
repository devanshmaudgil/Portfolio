import { useCallback, useEffect, useState } from "react";
import "./styles.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AskPanel from "./components/AskPanel";
import { AskProvider } from "./context/AskContext";

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AskProvider>
      <Navbar scrolled={scrolled} ready={ready} />
      <main>
        <Hero ready={ready} onReady={onReady} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <AskPanel />
    </AskProvider>
  );
}
