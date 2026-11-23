import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ARCH, EMAIL, EXT_NODES, FACTS, GITHUB_URL, LINKEDIN_URL, MAIFIT_REPO, MAIFIT_TAGS, MAIFIT_URL, MAIN_NODES, METRICS, ORGANIC_TAGS, RESUME_URL, SECTIONS, SKILL_GROUPS, type NodeId } from "./data";

// ─── Hooks ────────────────────────────────────────────────────────────────────
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Adds the "in" class to every .reveal element once it scrolls into view. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window) || reducedMotion()) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useScrollState() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? h.scrollTop / max : 0);
      setShowTop(h.scrollTop > window.innerHeight * 0.8);
      let current = "";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { progress, active, showTop };
}

/** Counts from 0 to 1 (eased) once the element enters the viewport. */
function useCountUp<T extends HTMLElement>(duration = 1600) {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || reducedMotion()) {
      setP(1);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setP(1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration]);

  return { ref, p };
}

// ─── Theme ────────────────────────────────────────────────────────────────────
type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* localStorage unavailable */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// ─── Small components ─────────────────────────────────────────────────────────
function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ThemeButton({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === "dark";
  return (
    <button type="button" className="icon-btn" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={onToggle}>
      {dark ? (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

function ArchitectureDiagram() {
  const [selected, setSelected] = useState<NodeId>("spring");
  const node = (id: NodeId, dashed = false) => (
    <button
      type="button"
      className={`arch-node${dashed ? " dashed" : ""}${selected === id ? " on" : ""}`}
      aria-pressed={selected === id}
      onClick={() => setSelected(id)}
    >
      <span className="arch-name">{ARCH[id].name}</span>
      <span className="arch-sub">{ARCH[id].sub}</span>
    </button>
  );

  return (
    <div className="arch reveal">
      <div className="arch-head">
        <span className="mono accent">// architecture · click a box</span>
        <span className="small mute">Docker Compose on 1 VPS</span>
      </div>
      <div className="arch-row">
        {MAIN_NODES.map((id, i) => (
          <div key={id} className="arch-step">
            {node(id)}
            {i < MAIN_NODES.length - 1 && (
              <span aria-hidden="true" className="arch-arrow" style={{ animationDelay: `${i * 0.2}s` }}>→</span>
            )}
          </div>
        ))}
      </div>
      <div className="arch-calls">
        <span aria-hidden="true" className="arch-arrow">↓ calls</span>
      </div>
      <div className="arch-ext">{EXT_NODES.map((id) => <span key={id}>{node(id, true)}</span>)}</div>
      <div className="arch-why" aria-live="polite">
        <span className="arch-why-title">{ARCH[selected].name} · why</span>
        <span>{ARCH[selected].why}</span>
      </div>
    </div>
  );
}

function Metrics() {
  const { ref, p } = useCountUp<HTMLDivElement>();
  return (
    <div ref={ref} className="metrics reveal">
      {METRICS.map((m) => (
        <div key={m.label} className="metric">
          <span className="metric-value">{m.format(Math.round(m.target * p))}</span>
          <span className="metric-label">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Command palette ──────────────────────────────────────────────────────────
interface Command {
  label: string;
  group: string;
  run: () => void;
}

function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Command[] }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  const run = (c: Command | undefined) => {
    if (!c) return;
    onClose();
    c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[index]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <SearchIcon size={18} />
          <label htmlFor="cmdq" className="sr-only">Type a command</label>
          <input
            id="cmdq"
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            autoComplete="off"
          />
          <button type="button" className="kbd" onClick={onClose}>Esc</button>
        </div>
        <ul className="palette-list" role="listbox" aria-label="Commands">
          {filtered.map((c, i) => (
            <li key={c.label} role="option" aria-selected={i === index}>
              <button type="button" className={i === index ? "cmd on" : "cmd"} onMouseEnter={() => setIndex(i)} onClick={() => run(c)}>
                <span className="cmd-label">{c.label}</span>
                <span className="cmd-group">{c.group}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="cmd-empty">No matching command.</li>}
        </ul>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Portfolio({ onSpace }: { onSpace?: () => void }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { progress, active, showTop } = useScrollState();
  useReveal();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // Ctrl/Cmd + K opens the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const commands = useMemo<Command[]>(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
    const open = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");
    return [
      { label: "Go to Projects", group: "Navigate", run: go("projects") },
      { label: "Go to About", group: "Navigate", run: go("about") },
      { label: "Go to Contact", group: "Navigate", run: go("contact") },
      { label: "Open MAIFit live app", group: "Links", run: open(MAIFIT_URL) },
      { label: "Download résumé (PDF)", group: "Links", run: open(RESUME_URL) },
      { label: "Open GitHub profile", group: "Links", run: open(GITHUB_URL) },
      { label: "Copy email address", group: "Actions", run: copyEmail },
      { label: "Toggle dark mode", group: "Actions", run: toggleTheme },
    ];
  }, [copyEmail, toggleTheme]);

  return (
    <>
      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#top" className="logo">
            gnas<span className="accent">.</span>pham
          </a>
          <div className="nav-links">
            {SECTIONS.map((s) => (
              <a key={s} href={`#${s}`} className={active === s ? "active" : undefined}>
                {s[0].toUpperCase() + s.slice(1)}
              </a>
            ))}
          </div>
          <button type="button" className="search-btn" aria-label="Open command palette" onClick={() => setPaletteOpen(true)}>
            <SearchIcon />
            <span className="hide-sm">Search or jump to…</span>
            <span className="kbd hide-sm">Ctrl K</span>
          </button>
          {onSpace && (
            <button type="button" className="search-btn" onClick={onSpace} aria-label="Switch to the 3D space view">
              <span aria-hidden="true">🪐</span>
              <span className="hide-sm">Space view</span>
            </button>
          )}
          <ThemeButton theme={theme} onToggle={toggleTheme} />
        </div>
        <span className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </nav>

      <main id="top" className="page">
        {/* ── Hero ── */}
        <section className="bento">
          <div className="tile rise span-full hero-main" style={{ animationDelay: "0ms" }}>
            <div aria-hidden="true" className="hero-ring" />
            <div aria-hidden="true" className="hero-sun" />
            <p className="hero-hello">Hi, my name is</p>
            <h1 className="hero-name">
              Pham Thanh
              <br />
              Phuoc Sang
            </h1>
            <p className="hero-role">
              &gt; Java Backend Developer<span className="caret" aria-hidden="true" />
            </p>
            <p className="hero-lead">
              I build Spring Boot APIs on PostgreSQL and ship them to production. My latest: MAIFit, an AI fitness app I built and run on my own.
            </p>
            <div className="hero-ctas">
              <a className="btn primary" href={RESUME_URL} target="_blank" rel="noopener noreferrer">View résumé</a>
              <a className="btn ghost" href="#projects">See my projects</a>
            </div>
          </div>

          <div className="tile rise open-tile" style={{ animationDelay: "120ms" }}>
            <div className="status">
              <span className="dot ping" />
              Open to work
            </div>
            <div>
              <p className="open-title">
                Fresher Java
                <br />
                backend role
              </p>
              <p className="open-sub">Ho Chi Minh City, Vietnam</p>
            </div>
          </div>

          <a href={MAIFIT_URL} target="_blank" rel="noopener noreferrer" className="tile rise live-tile" style={{ animationDelay: "220ms" }}>
            <div className="live-top">
              <img src={`${import.meta.env.BASE_URL}maifit-logo.svg`} alt="MAIFit logo" width="44" height="44" />
              <span className="status mute">
                <span className="dot ping-green" />
                Live
              </span>
            </div>
            <div>
              <p className="live-name">MAIFit</p>
              <p className="live-url">maifit.gnaspham1218.dev ↗</p>
            </div>
          </a>

          {FACTS.map((f, i) => (
            <div key={f.label} className="tile rise fact" style={{ animationDelay: `${280 + i * 60}ms` }}>
              <span className="fact-label">{f.label}</span>
              <span className="fact-value">{f.value}</span>
              <span className="fact-sub">{f.sub}</span>
            </div>
          ))}
        </section>

        {/* ── About + Skills ── */}
        <section id="about" className="bento">
          <div className="tile reveal span-2 span-full pad about">
            <span className="mono accent">// about</span>
            <h2>Backend first, full stack when needed</h2>
            <p className="mute">
              Software Engineering graduate from HUIT. I work with Spring Boot and PostgreSQL, and what I enjoy most is building things people
              actually use: software that solves someone else's real problem.
            </p>
            <p className="mute">
              I built and run MAIFit on my own, from database design to CI/CD, payments and security, and I can work across the stack with React
              and TypeScript.
            </p>
          </div>

          <div className="tile reveal span-2 span-full pad skills">
            <span className="mono accent">// skills</span>
            {SKILL_GROUPS.map((g) => (
              <div key={g.name} className="skill-group">
                <span className="skill-group-name">{g.name}</span>
                <ul className="chips">
                  {g.items.map((s) => (
                    <li key={s.name} className="chip">
                      <span className="chip-icon">
                        <img src={s.icon} alt="" width="20" height="20" loading="lazy" />
                      </span>
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects ── */}
        <section id="projects" className="projects">
          <div className="projects-head reveal">
            <h2>Projects</h2>
            <span className="mono mute">2 projects · 1 live in production</span>
          </div>

          {/* MAIFit */}
          <article className="tile reveal pad maifit">
            <div className="maifit-info">
              <div className="badges">
                <span className="badge solid">Featured</span>
                <span className="badge soft">In progress · 10/2026 – now</span>
              </div>
              <div className="maifit-title">
                <img src={`${import.meta.env.BASE_URL}maifit-logo.svg`} alt="MAIFit logo" width="64" height="64" />
                <div>
                  <h3>
                    M<span className="accent">AI</span>Fit
                  </h3>
                  <p className="small mute">"My AI Fit" · not fit today, fit tomorrow</p>
                </div>
              </div>
              <p className="role">Solo Backend, Frontend &amp; DevOps Developer</p>
              <p>
                An AI fitness web app in production: log meals from a photo, count reps with the camera, ask a nutrition chatbot that cites its
                sources, and compete on weekly leaderboards. AI only recognises things; every number users rely on is calculated in code from real
                data.
              </p>
              <ul className="tags">
                {MAIFIT_TAGS.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <div className="actions">
                <a className="btn primary sm" href={MAIFIT_URL} target="_blank" rel="noopener noreferrer">Open live app</a>
                <a className="btn ghost sm" href={MAIFIT_REPO} target="_blank" rel="noopener noreferrer">GitHub repo</a>
              </div>
            </div>

            <ArchitectureDiagram />

            <div className="bot reveal">
              <div aria-hidden="true" className="bot-glow" />
              <img src={`${import.meta.env.BASE_URL}mbotfit.webp`} alt="MBotFit, the MAIFit chatbot mascot" width="150" height="150" loading="lazy" />
              <div className="bot-body">
                <span className="mono bot-tag">// meet MBotFit</span>
                <p className="bot-title">MAIFit's RAG nutrition chatbot</p>
                <div className="bubble me">200g cơm với 2 quả trứng luộc?</div>
                <div className="bubble typing" aria-label="MBotFit is typing">
                  <span />
                  <span />
                  <span />
                </div>
                <p className="bot-note">Answers only from cited sources; calories are computed in code, never by the model.</p>
              </div>
            </div>

            <Metrics />
          </article>

          {/* Organic Food */}
          <article className="tile reveal pad organic">
            <div className="organic-top">
              <span className="badge outline">Local build · 10/2025 – 12/2025</span>
              <span className="small mute">Team leader · team of 2</span>
            </div>
            <h3>Organic Food Ecosystem</h3>
            <p className="mute">
              Web + mobile e-commerce: a Spring Boot backend with an admin dashboard, a React customer site and an Expo / React Native app. I
              designed the schema, built the APIs, integrated payOS and built the mobile app alone.
            </p>
            <ul className="tags">
              {ORGANIC_TAGS.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <div className="actions">
              <a className="btn ghost sm" href="https://github.com/vudev1412/Organic-Food" target="_blank" rel="noopener noreferrer">Web repo</a>
              <a className="btn ghost sm" href="https://github.com/GnasPham1218/Organic_Mobile_App" target="_blank" rel="noopener noreferrer">Mobile repo</a>
              <a
                className="btn ghost sm"
                href="https://drive.google.com/drive/folders/1WK8CZlc5E5fOhbUE0MzXQA5yonfkb-F7?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </a>
            </div>
          </article>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="tile reveal contact">
          <div aria-hidden="true" className="contact-ring" />
          <div className="contact-text">
            <span className="mono">// get in touch</span>
            <h2>Hiring a fresher Java backend developer?</h2>
            <p>Send me an email, or ask me about MAIFit. I'll get back to you.</p>
          </div>
          <div className="contact-links">
            <a className="mail" href={`mailto:${EMAIL}`} onClick={(e) => { e.preventDefault(); copyEmail(); }}>
              {copied ? "Email copied ✓" : EMAIL}
            </a>
            <div className="socials">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="tel:+84903915722">+84 903 915 722</a>
            </div>
          </div>
        </section>

        <footer className="footer">© 2026 Pham Thanh Phuoc Sang (Gnas Pham)</footer>
      </main>

      <a href="#top" className={showTop ? "to-top show" : "to-top"} aria-label="Back to top">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
      </a>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </>
  );
}
