import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProjectLink {
  label: "Repo" | "Live" | "Docs";
  url: string;
  /** Chưa public: bấm vào chỉ hiện "Coming soon" */
  comingSoon?: boolean;
}

interface Project {
  title: string;
  cover: { emoji: string; tagline: string };
  status: "building" | "shipped";
  summary: string;
  startDate: string;
  endDate: string;
  role: string;
  features: string[];
  contributions: string[];
  tags: string[];
  links: ProjectLink[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const EMAIL = "gnasai1218@gmail.com";
const RESUME_URL = `${import.meta.env.BASE_URL}CV_-_Pham_Thanh_Phuoc_Sang.pdf`;
const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const SKILLS: { name: string; icon: string }[] = [
  { name: "Java", icon: `${DEVICON}/java/java-original.svg` },
  { name: "Python", icon: `${DEVICON}/python/python-original.svg` },
  { name: "JavaScript", icon: `${DEVICON}/javascript/javascript-original.svg` },
  { name: "TypeScript", icon: `${DEVICON}/typescript/typescript-original.svg` },
  { name: "Spring Boot", icon: `${DEVICON}/spring/spring-original.svg` },
  { name: "Spring AI", icon: `${DEVICON}/spring/spring-original.svg` },
  { name: "React", icon: `${DEVICON}/react/react-original.svg` },
  { name: "React Native", icon: `${DEVICON}/react/react-original.svg` },
  { name: "Tailwind CSS", icon: `${DEVICON}/tailwindcss/tailwindcss-original.svg` },
  { name: "PostgreSQL", icon: `${DEVICON}/postgresql/postgresql-original.svg` },
  { name: "MySQL", icon: `${DEVICON}/mysql/mysql-original.svg` },
  { name: "Docker", icon: `${DEVICON}/docker/docker-original.svg` },
  { name: "Nginx", icon: `${DEVICON}/nginx/nginx-original.svg` },
  { name: "Linux", icon: `${DEVICON}/linux/linux-original.svg` },
  { name: "Git", icon: `${DEVICON}/git/git-original.svg` },
  { name: "GitHub Actions", icon: `${DEVICON}/githubactions/githubactions-original.svg` },
  { name: "Postman", icon: `${DEVICON}/postman/postman-original.svg` },
];

const PROJECTS: Project[] = [
  {
    title: "MAIFit",
    cover: { emoji: "🏋️", tagline: "AI fitness web app" },
    status: "building",
    summary:
      "A personal fitness web app with AI, already running in production with accounts, TDEE and calorie tracking. Next up: logging meals from a photo, counting reps with the camera, and a chatbot that answers from real nutrition data.",
    startDate: "10/2026",
    endDate: "now",
    role: "Solo Fullstack & DevOps Developer",
    features: [
      "Sign-up, email verification and password reset, with JWT access and refresh tokens",
      "Profile, TDEE calculation and body check-ins",
      "Calorie tracking with a monthly calendar and a daily calorie chart (in progress)",
      "Coming next: meal photo recognition, rep counting with MediaPipe, a RAG chatbot with chat history, and daily, weekly and monthly leaderboards",
    ],
    contributions: [
      "Designed calorie logic that doesn't trust the AI: the model only identifies ingredients and estimates grams, while calories always come from a standard foods table (USDA and Vietnam's National Institute of Nutrition), with an ai_grams column to measure the model's error",
      "Capped AI cost per user with an atomic conditional upsert: a credit is taken before each call and refunded if the call fails, with no race conditions",
      "Implemented refresh token rotation that detects reuse of old tokens, stored tokens only as hashes, and added IDOR checks to every API",
      "Kept private photos private: EXIF is stripped, images are served only with a JWT, body photos never go to the AI, and backups are encrypted with rclone crypt",
      "Built the full CI/CD pipeline: GitHub Actions builds images to ghcr.io, the Singapore VPS only pulls and runs them behind Nginx, and Postgres is never exposed publicly",
    ],
    tags: ["Java 25", "Spring Boot 4", "Spring AI", "React", "TypeScript", "PostgreSQL", "Docker"],
    links: [
      { label: "Repo", url: "https://github.com/GnasPham1218/maifit" },
      { label: "Live", url: "https://maifit.gnaspham1218.dev", comingSoon: true },
    ],
  },
  {
    title: "Organic Food Ecosystem",
    cover: { emoji: "🥬", tagline: "Web + mobile e-commerce" },
    status: "shipped",
    summary:
      "A multi-platform e-commerce ecosystem for organic food: a React customer web app, a Spring Boot backend with an admin dashboard, and an Expo / React Native mobile app.",
    startDate: "10/2025",
    endDate: "12/2025",
    role: "Team Leader & Fullstack Developer, team of 2",
    features: [
      "Core e-commerce flow: product lists, shopping cart and streamlined checkout",
      "Member registration, secure login and discount voucher management",
      "Admin dashboard for transactions, inventory and order status",
      "Data kept in sync between the Spring Boot backend and both web & mobile apps",
    ],
    contributions: [
      "Architected system logic and designed MySQL schemas for products, categories and orders",
      "Built RESTful APIs with Spring Boot and wired them into the React frontend",
      "Integrated the PayOS payment gateway and SMTP email for registration",
      "Built the entire React Native app alone, from UI/UX design to API integration",
      "Wrote a Python crawler that collected 1,000+ organic products, then used an LLM to generate product descriptions",
    ],
    tags: ["Java 17", "Spring Boot 3", "React 19", "React Native", "MySQL", "PayOS"],
    links: [
      { label: "Repo", url: "https://github.com/vudev1412/Organic-Food" },
      { label: "Repo", url: "https://github.com/GnasPham1218/Organic_Mobile_App" },
      {
        label: "Docs",
        url: "https://drive.google.com/drive/folders/1WK8CZlc5E5fOhbUE0MzXQA5yonfkb-F7?usp=drive_link",
      },
    ],
  },
];

const FACTS = [
  { label: "Education", value: "HUIT, Software Engineering", sub: "2022 – 2026" },
  { label: "GPA", value: "3.3 / 4.0", sub: "Bachelor's degree" },
  { label: "English", value: "TOEIC 750", sub: "Listening & Reading" },
  { label: "Location", value: "Ho Chi Minh City", sub: "Open to work" },
];

const SOCIALS = [
  { name: "GitHub", url: "https://github.com/GnasPham1218" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/gnasai1218" },
  { name: "+84 903 915 722", url: "tel:+84903915722" },
];

const SECTIONS = ["about", "skills", "projects", "contact"] as const;

// ─── Hooks ────────────────────────────────────────────────────────────────────
/** Thêm class "in" khi phần tử .reveal cuộn vào màn hình */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
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
  const [active, setActive] = useState<string>("");
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

function useTyping(words: string[]) {
  const [text, setText] = useState("");
  const state = useRef({ w: 0, i: 0, deleting: false });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(words[0]);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = state.current;
      const word = words[s.w];
      s.i += s.deleting ? -1 : 1;
      setText(word.slice(0, s.i));
      let delay = s.deleting ? 40 : 85;
      if (!s.deleting && s.i === word.length) {
        delay = 1800;
        s.deleting = true;
      } else if (s.deleting && s.i === 0) {
        s.deleting = false;
        s.w = (s.w + 1) % words.length;
        delay = 350;
      }
      t = setTimeout(tick, delay);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [words]);

  return text;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* localStorage không dùng được */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ThemeSwitch({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      className={dark ? "switch night" : "switch"}
      onClick={onToggle}
    >
      <span className="switch-sky" aria-hidden="true">
        <span className="cloud c1" />
        <span className="cloud c2" />
        <span className="star s1" />
        <span className="star s2" />
        <span className="star s3" />
      </span>
      <span className="switch-knob" aria-hidden="true" />
    </button>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: string }) {
  return <h2 className="section-title reveal">{children}</h2>;
}

function LinkButton({ link, label }: { link: ProjectLink; label: string }) {
  const [soon, setSoon] = useState(false);
  const icon =
    link.label === "Live" ? (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></svg>
    ) : link.label === "Docs" ? (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>
    ) : (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" /></svg>
    );

  if (link.comingSoon) {
    return (
      <button
        type="button"
        className={soon ? "pbtn soon" : "pbtn"}
        onClick={() => {
          setSoon(true);
          setTimeout(() => setSoon(false), 2200);
        }}
        aria-live="polite"
      >
        {icon}
        {soon ? "Coming soon" : label}
      </button>
    );
  }
  return (
    <a className="pbtn" href={link.url} target="_blank" rel="noopener noreferrer">
      {icon}
      {label}
    </a>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const building = project.status === "building";
  const id = `details-${index}`;
  const repoCount = project.links.filter((l) => l.label === "Repo").length;
  let repoSeen = 0;

  return (
    <article className="card reveal" style={{ transitionDelay: `${index * 120}ms` }}>
      <div className={building ? "cover cover-a" : "cover cover-b"}>
        <span className="cover-emoji" aria-hidden="true">{project.cover.emoji}</span>
        <span className="cover-title">{project.cover.tagline}</span>
        <span className="cover-meta">
          {project.startDate} – {project.endDate}
        </span>
        {building && <span className="cover-badge">In progress</span>}
      </div>

      <div className="card-body">
        <ul className="pills">
          {project.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h3>{project.title}</h3>
        <p className="card-role">{project.role}</p>
        <p className="card-summary">{project.summary}</p>

        <button
          type="button"
          className="more"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Hide details" : "Show details"}
          <svg className={open ? "chev up" : "chev"} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>

        <div id={id} className={open ? "details open" : "details"}>
          <div className="details-inner">
            <h4>What it does</h4>
            <ul>
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <h4>What I did</h4>
            <ul>
              {project.contributions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-actions">
          {project.links.map((l) => {
            let label: string = l.label;
            if (l.label === "Repo" && repoCount > 1) {
              repoSeen++;
              label = repoSeen === 1 ? "Web" : "Mobile";
            }
            return <LinkButton key={l.url} link={l} label={label} />;
          })}
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const ROLES = ["Fresher Full-stack Developer", "Spring Boot & React dev", "Builder of MAIFit"];

export default function Portfolio() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [copied, setCopied] = useState(false);
  const { progress, active, showTop } = useScrollState();
  const role = useTyping(ROLES);
  useReveal();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* bỏ qua */
    }
  }, [theme]);

  const copyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ── Hero ── */}
      <header id="top" className="hero">
        <div className="hero-inner">
          <p className="hello">
            <span className="wave" aria-hidden="true">👋</span> Hi,
          </p>
          <p className="hello">My name is</p>
          <h1 className="hero-name">Pham Thanh Phuoc Sang</h1>
          <p className="hero-role">
            I am a <span className="typed">{role}</span>
            <span className="caret" aria-hidden="true" /> <span aria-hidden="true">💻</span>
          </p>
          <div className="hero-ctas">
            <a className="btn primary" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
              View résumé
            </a>
            <a className="btn ghost" href="#projects">
              See my projects
            </a>
          </div>
        </div>
        <a href="#about" className="scroll-cue" aria-label="Scroll to About">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7 7 7 7-7" /><path d="m5 13 7 7 7-7" /></svg>
        </a>
      </header>

      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#top" className="logo">Gnas Pham</a>
          <ul className="nav-links">
            {SECTIONS.map((s) => (
              <li key={s}>
                <a href={`#${s}`} className={active === s ? "active" : undefined}>
                  {s[0].toUpperCase() + s.slice(1)}
                </a>
              </li>
            ))}
          </ul>
          <ThemeSwitch theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
        </div>
        <span className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </nav>

      <main>
        {/* ── About ── */}
        <section id="about" className="section">
          <SectionTitle>About me</SectionTitle>
          <div className="about reveal">
            <p className="lead">
              <span className="dropcap">H</span>i, my name is <strong className="hl">Pham Thanh Phuoc Sang</strong>{" "}
              (Gnas Pham), a Software Engineering graduate from HUIT. I build web and mobile apps
              with <strong className="hl">Java Spring Boot</strong>, <strong className="hl">React</strong> and{" "}
              <strong className="hl">React Native</strong>.
            </p>
            <p className="soft">
              I like owning a feature end to end: modelling the data, writing the API and shipping
              the screen people actually use. Right now I'm building <strong className="hl">MAIFit</strong>,
              an AI fitness web app, and looking for my first full-time role.
            </p>
          </div>
          <div className="facts">
            {FACTS.map((f, i) => (
              <div key={f.label} className="fact reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="fact-label">{f.label}</span>
                <span className="fact-value">{f.value}</span>
                <span className="fact-sub">{f.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills ── */}
        <section id="skills" className="section">
          <SectionTitle>Technical skills</SectionTitle>
          <ul className="skills">
            {SKILLS.map((s, i) => (
              <li key={s.name} className="skill reveal" style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
                <img src={s.icon} alt="" width="56" height="56" />
                <span>{s.name}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Projects ── */}
        <section id="projects" className="section">
          <SectionTitle>My projects</SectionTitle>
          <div className="cards">
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.title} project={p} index={i} />
            ))}
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="section contact">
          <SectionTitle>Get in touch</SectionTitle>
          <p className="contact-text reveal">
            Hiring a fresher full-stack developer, or want to hear more about MAIFit?
            <br />
            Send me an email and I'll get back to you. 😊
          </p>
          <a className="mail reveal" href={`mailto:${EMAIL}`} onClick={copyEmail}>
            {copied ? "Email copied ✓" : EMAIL}
          </a>
          <ul className="socials reveal">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a href={s.url} target={s.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">© 2026 Pham Thanh Phuoc Sang (Gnas Pham)</footer>

      <a href="#top" className={showTop ? "to-top show" : "to-top"} aria-label="Back to top">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
      </a>
    </>
  );
}
