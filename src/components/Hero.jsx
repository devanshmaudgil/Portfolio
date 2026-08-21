import { useEffect, useRef, useState } from "react";
import heroBg from "../assets/hero.jpg";
import HeroSearch from "./HeroSearch";
import IntroFx from "./IntroFx";
import MatrixRain from "./MatrixRain";

const BEATS = [
  {
    kicker: "01",
    text: "Full-Stack Developer",
    sub: "Web, mobile, and AI-integrated systems",
    fx: "stack",
    duration: 2000,
  },
  {
    kicker: "02",
    text: "Shipped independently",
    sub: "From database design to native apps",
    fx: "ship",
    duration: 2000,
  },
  {
    kicker: "03",
    text: "Production work",
    sub: "ATS, vehicle audits, on-device recognition",
    fx: "grid",
    duration: 2000,
  },
];

export default function Hero({ ready, onReady }) {
  const hostRef = useRef(null);
  const [host, setHost] = useState(null);
  const [beat, setBeat] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const skipRef = useRef(false);
  const timersRef = useRef([]);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    setHost(hostRef.current);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealed(true);
      onReadyRef.current();
      return undefined;
    }

    let cancelled = false;
    const timers = [];
    timersRef.current = timers;
    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const show = async (next, hold) => {
      setBeat({ ...next, on: false });
      await wait(50);
      if (cancelled || skipRef.current) return;
      setBeat({ ...next, on: true });
      await wait(hold);
      if (cancelled || skipRef.current) return;
      setBeat((prev) => ({ ...prev, on: false }));
      await wait(380);
    };

    const play = async () => {
      await wait(700);
      for (const item of BEATS) {
        if (cancelled || skipRef.current) return;
        await show({ ...item, name: false }, item.duration);
      }
      if (cancelled || skipRef.current) return;
      setRevealed(true);
      await show(
        { kicker: "", text: "Devansh Maudgil", sub: "", name: true },
        2600
      );
      if (!cancelled && !skipRef.current) onReadyRef.current();
    };

    play();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const skip = () => {
    skipRef.current = true;
    timersRef.current.forEach(clearTimeout);
    setBeat(null);
    setRevealed(true);
    onReadyRef.current();
  };

  return (
    <section
      id="top"
      ref={hostRef}
      className={`hero ${ready ? "is-ready" : "is-intro"} ${
        revealed ? "is-revealed" : ""
      }`}
    >
      <div className="hero-media">
        <img src={heroBg} alt="Devansh Maudgil" />
      </div>
      <div className="hero-overlay" />
      {host && <MatrixRain src={heroBg} enabled={ready} host={host} />}

      {!revealed && beat?.fx && (
        <div className={`hero-fx ${beat.on ? "is-on" : "is-off"}`}>
          <IntroFx key={beat.fx} fx={beat.fx} />
        </div>
      )}

      <div className="hero-stage">
        {!ready && beat && (
          <div className={`cine-beat ${beat.on ? "is-on" : "is-off"} ${beat.name ? "is-name" : ""}`}>
            {beat.kicker ? <span className="cine-kicker">{beat.kicker}</span> : null}
            <h1>{beat.text}</h1>
            {beat.sub ? <p>{beat.sub}</p> : null}
          </div>
        )}
        {ready && <HeroSearch />}
      </div>

      {!ready && (
        <button className="cine-skip" type="button" onClick={skip}>
          Skip
        </button>
      )}
    </section>
  );
}
