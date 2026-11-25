import { useCallback, useEffect, useState } from "react";
import {
  ARCH,
  EMAIL,
  EXT_NODES,
  FACTS,
  GITHUB_URL,
  LINKEDIN_URL,
  MAIFIT_PERIOD,
  MAIFIT_POINTS,
  MAIFIT_REPO,
  MAIFIT_SUMMARY,
  MAIFIT_TAGS,
  MAIFIT_URL,
  MAIN_NODES,
  METRICS,
  ORGANIC_LINKS,
  ORGANIC_PERIOD,
  ORGANIC_POINTS,
  ORGANIC_SUMMARY,
  ORGANIC_TAGS,
  RESUME_URL,
  SKILL_GROUPS,
  type NodeId,
} from "../data";
import { GROUP_COLORS, STATIONS, type StationId } from "./stations";
import { isLowPower, prefersReducedMotion } from "./support";
import Universe, { type ScrollState } from "./Universe";
import "./space.css";

const BASE = import.meta.env.BASE_URL;
const NAV: StationId[] = ["about", "skills", "maifit", "organic", "contact"];

/** Phrases the hero role line types out, one after another, like a terminal prompt. */
const ROLE_PHRASES = [
  "Java Backend Developer",
  "A Chill Dev",
  "Loves building things",
  "Fueled by coffee & curiosity",
  "Always shipping something",
];

/** Typewriter effect: types a phrase, pauses, deletes it, moves to the next. Static when `reduced` is set. */
function TypedRole({ reduced }: { reduced: boolean }) {
  const [text, setText] = useState(ROLE_PHRASES[0]);

  useEffect(() => {
    if (reduced) return;
    let phrase = 0;
    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = ROLE_PHRASES[phrase];
      if (!deleting) {
        i++;
        setText(full.slice(0, i));
        if (i === full.length) {
          timer = setTimeout(() => {
            deleting = true;
            tick();
          }, 1700);
          return;
        }
        timer = setTimeout(tick, 60 + Math.random() * 40);
      } else {
        i--;
        setText(full.slice(0, i));
        if (i === 0) {
          deleting = false;
          phrase = (phrase + 1) % ROLE_PHRASES.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 28);
      }
    };

    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <>
      &gt; {text}
      <span className="caret" aria-hidden="true" />
    </>
  );
}

/** The 3D solar-system portfolio: a fixed WebGL scene with the page content scrolling over it. */
export default function SpacePortfolio({ onClassic }: { onClassic: () => void }) {
  const [scroll] = useState<ScrollState>(() => ({ p: 0, mobile: false }));
  const [low] = useState(isLowPower);
  const [reduced] = useState(prefersReducedMotion);
  const [hq, setHq] = useState(() => {
    try {
      return localStorage.getItem("quality") === "high";
    } catch {
      return false;
    }
  });
  const toggleHq = () => {
    setHq((on) => {
      try {
        localStorage.setItem("quality", on ? "auto" : "high");
      } catch {
        /* localStorage unavailable */
      }
      return !on;
    });
  };
  const [active, setActive] = useState(0);
  const [hotSkill, setHotSkill] = useState<string | null>(null);
  const [selectedArch, setSelectedArch] = useState<NodeId>("spring");
  const [copied, setCopied] = useState(false);

  // dark space background for the whole document while this view is open
  useEffect(() => {
    document.documentElement.dataset.view = "space";
    return () => {
      delete document.documentElement.dataset.view;
    };
  }, []);

  // scroll position → camera progress (0 = hero, 1 = about, …)
  useEffect(() => {
    const sections = STATIONS.map((s) => document.getElementById(s.section));
    const update = () => {
      scroll.mobile = window.innerWidth < 1024; // same breakpoint as space.css
      const y = window.scrollY;
      const tops = sections.map((el) => (el ? el.getBoundingClientRect().top + y : 0));
      let p = 0;
      for (let i = 0; i < tops.length; i++) {
        if (y < tops[i]) break;
        const next = tops[i + 1];
        p = next === undefined ? i : i + Math.min(1, (y - tops[i]) / Math.max(1, next - tops[i]));
      }
      scroll.p = p;
      // the hint fades out over the first part of the scroll
      document.documentElement.style.setProperty("--hint-fade", String(Math.max(0, 1 - y / (window.innerHeight * 0.35))));
      setActive(Math.min(STATIONS.length - 1, Math.floor(p + 0.3)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scroll]);

  const go = useCallback(
    (id: StationId) => {
      const st = STATIONS.find((s) => s.id === id);
      document.getElementById(st?.section ?? "top")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeId = STATIONS[active].id;
  const sec = (id: StationId) => `space-sec${activeId === id ? " on" : ""}`;

  return (
    <div className="space-root">
      <div className="space-canvas" aria-hidden="true">
        <Universe
          scroll={scroll}
          low={low}
          hq={hq}
          reduced={reduced}
          onNavigate={go}
          hotSkill={hotSkill}
          onHotSkill={setHotSkill}
          selectedArch={selectedArch}
          onSelectArch={setSelectedArch}
          activeStation={activeId}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="space-nav" aria-label="Sections">
        <a href="#top" className="space-logo">
          gnas<span>.</span>pham
        </a>
        <div className="space-links">
          {NAV.map((id) => (
            <a key={id} href={`#${id}`} className={activeId === id ? "on" : undefined}>
              {STATIONS.find((s) => s.id === id)?.label}
            </a>
          ))}
        </div>
        <a className="space-btn primary" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
          Résumé
        </a>
        <button
          type="button"
          className={`space-btn${hq ? " on" : ""}`}
          onClick={toggleHq}
          aria-pressed={hq}
          title={hq ? "High quality on: click to go back to automatic quality" : "Turn on high quality (needs a good graphics card)"}
        >
          HQ
        </button>
        <button type="button" className="space-btn" onClick={onClassic} title="Switch to the classic 2D page">
          2D
        </button>
      </nav>

      {/* ── Station dots ── */}
      <div className="space-dots" role="group" aria-label="Jump to a planet">
        {STATIONS.map((s, i) => (
          <button key={s.id} type="button" className={i === active ? "on" : undefined} onClick={() => go(s.id)} aria-label={s.label}>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <main className="space-main">
        {/* ── Hero: the sun ── */}
        <section id="top" className={`${sec("hero")} space-hero`}>
          <div className="hero-card">
            <p className="space-hello">Hi, my name is</p>
            <h1 className="space-name">
              Pham Thanh
              <br />
              Phuoc Sang
            </h1>
            <p className="space-role">
              <TypedRole reduced={reduced} />
            </p>
            <p className="space-lead">
              I build Spring Boot APIs on PostgreSQL and ship them to production. Welcome to my little solar system: every planet is a part of
              my work.
            </p>
            <div className="space-ctas">
              <a className="space-btn primary lg" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
                View résumé
              </a>
              <button type="button" className="space-btn lg" onClick={() => go("about")}>
                Start the tour ↓
              </button>
            </div>
            <p className="space-status">
              <span className="dot" /> Open to work · Ho Chi Minh City, Vietnam
            </p>
          </div>
          <p className="space-hint" aria-hidden="true">
            Scroll to fly · drag to look around · click a planet
          </p>
        </section>

        {/* ── About ── */}
        <section id="about" className={sec("about")}>
          <div className="glass">
            <span className="kicker">// planet 01 · about</span>
            <h2>Backend first, full stack when needed</h2>
            <p className="mute">
              Software Engineering graduate from HUIT. I work with Spring Boot and PostgreSQL, and what I enjoy most is building things people
              actually use: software that solves someone else's real problem.
            </p>
            <p className="mute">
              I built and run MAIFit on my own, from database design to CI/CD, payments and security, and I can work across the stack with React
              and TypeScript.
            </p>
            <div className="facts">
              {FACTS.map((f) => (
                <div key={f.label} className="fact">
                  <span className="fact-l">{f.label}</span>
                  <span className="fact-v">{f.value}</span>
                  <span className="fact-s">{f.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Skills ── */}
        <section id="skills" className={sec("skills")}>
          <div className="glass">
            <span className="kicker">// planet 02 · skills</span>
            <h2>My stack, in orbit</h2>
            <p className="mute small">Hover a logo around the violet planet, or a chip below.</p>
            {SKILL_GROUPS.map((g) => (
              <div key={g.name} className="sgroup">
                <span className="sgroup-name">
                  <i style={{ background: GROUP_COLORS[g.name] }} />
                  {g.name}
                </span>
                <ul className="schips">
                  {g.items.map((s) => (
                    <li
                      key={s.name}
                      className={hotSkill === s.icon ? "hot" : undefined}
                      onMouseEnter={() => setHotSkill(s.icon)}
                      onMouseLeave={() => setHotSkill(null)}
                    >
                      <img src={s.icon} alt="" width="18" height="18" loading="lazy" />
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── MAIFit ── */}
        <section id="maifit" className={sec("maifit")}>
          <div className="glass wide">
            <span className="kicker">// planet 03 · featured project</span>
            <div className="ptitle">
              <img src={`${BASE}maifit-logo.svg`} alt="MAIFit logo" width="52" height="52" />
              <div>
                <h2>
                  M<span className="accent">AI</span>Fit
                </h2>
                <p className="mute small">Live in production · in progress, {MAIFIT_PERIOD} · solo backend, frontend &amp; DevOps</p>
              </div>
            </div>
            <p>{MAIFIT_SUMMARY}</p>
            <ul className="points">
              {MAIFIT_POINTS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <ul className="tags">
              {MAIFIT_TAGS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <div className="arch-box">
              <span className="kicker">// its moons are the architecture · click one</span>
              <div className="moons" role="group" aria-label="Architecture components">
                {[...MAIN_NODES, ...EXT_NODES].map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={EXT_NODES.includes(id) ? "ext" : undefined}
                    aria-pressed={selectedArch === id}
                    onClick={() => setSelectedArch(id)}
                  >
                    {ARCH[id].name}
                  </button>
                ))}
              </div>
              <div className="why" aria-live="polite">
                <b>
                  {ARCH[selectedArch].name} <span className="mute">· {ARCH[selectedArch].sub}</span>
                </b>
                <span>{ARCH[selectedArch].why}</span>
              </div>
            </div>

            <div className="metrics">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <span className="mv">{m.format(m.target)}</span>
                  <span className="ml">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="actions">
              <a className="space-btn primary" href={MAIFIT_URL} target="_blank" rel="noopener noreferrer">
                Open live app ↗
              </a>
              <a className="space-btn" href={MAIFIT_REPO} target="_blank" rel="noopener noreferrer">
                GitHub repo
              </a>
            </div>
          </div>
        </section>

        {/* ── Organic Food ── */}
        <section id="organic" className={sec("organic")}>
          <div className="glass">
            <span className="kicker">// planet 04 · graduation project</span>
            <h2>Organic Food Ecosystem</h2>
            <p className="mute small">Team leader · team of 2 · {ORGANIC_PERIOD}</p>
            <p>{ORGANIC_SUMMARY}</p>
            <ul className="points">
              {ORGANIC_POINTS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <ul className="tags">
              {ORGANIC_TAGS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="actions">
              {ORGANIC_LINKS.map((l) => (
                <a key={l.label} className="space-btn" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className={sec("contact")}>
          <div className="glass">
            <span className="kicker">// station 05 · contact</span>
            <h2>Hiring a fresher Java backend developer?</h2>
            <p className="mute">Send me a signal. I'll get back to you.</p>
            <button type="button" className="mail" onClick={copyEmail}>
              {copied ? "Email copied ✓" : EMAIL}
            </button>
            <div className="actions">
              <a className="space-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a className="space-btn" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a className="space-btn" href="tel:+84903915722">
                +84 903 915 722
              </a>
            </div>
            <p className="foot">© 2026 Pham Thanh Phuoc Sang (Gnas Pham)</p>
          </div>
        </section>
      </main>
    </div>
  );
}
