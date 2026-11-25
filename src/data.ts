// Content shared by the classic page and the space page.

export const EMAIL = "gnasai1218@gmail.com";
export const RESUME_URL = `${import.meta.env.BASE_URL}CV_-_Pham_Thanh_Phuoc_Sang.pdf`;
export const MAIFIT_URL = "https://maifit.gnaspham1218.dev";
export const MAIFIT_REPO = "https://github.com/GnasPham1218/maifit";
export const GITHUB_URL = "https://github.com/GnasPham1218";
export const LINKEDIN_URL = "https://www.linkedin.com/in/gnasai1218";
export const ICON = (name: string) => `${import.meta.env.BASE_URL}icons/${name}.svg`;

export const FACTS = [
  { label: "Education", value: "HUIT", sub: "Software Engineering · 04/2026" },
  { label: "GPA", value: "8.0 / 10", sub: "3.3 / 4.0 · Bachelor's degree" },
  { label: "English", value: "TOEIC 750", sub: "Listening & Reading" },
  { label: "Currently exploring", value: "RAG & vector search", sub: "Spring AI · pgvector · Ollama" },
];

// Mirrors the "Technical Skills" section of the CV.
export const SKILL_GROUPS: { name: string; items: { name: string; icon: string }[] }[] = [
  {
    name: "Languages",
    items: [
      { name: "Java", icon: ICON("java") },
      { name: "TypeScript", icon: ICON("typescript") },
      { name: "Python", icon: ICON("python") },
    ],
  },
  {
    name: "Backend",
    items: [
      { name: "Spring Boot", icon: ICON("spring") },
      { name: "Spring Security (JWT)", icon: ICON("spring") },
      { name: "Spring Data JPA (Hibernate)", icon: ICON("spring") },
      { name: "Spring AI", icon: ICON("spring") },
      { name: "JUnit", icon: ICON("junit") },
    ],
  },
  {
    name: "Data & AI",
    items: [
      { name: "PostgreSQL", icon: ICON("postgresql") },
      { name: "pgvector", icon: ICON("postgresql") },
      { name: "MySQL", icon: ICON("mysql") },
      { name: "Flyway", icon: ICON("flyway") },
      { name: "RAG", icon: ICON("rag") },
      { name: "Ollama", icon: ICON("ollama") },
    ],
  },
  {
    name: "Frontend",
    items: [
      { name: "React", icon: ICON("react") },
      { name: "React Native", icon: ICON("react") },
      { name: "Tailwind CSS", icon: ICON("tailwindcss") },
    ],
  },
  {
    name: "Tools & DevOps",
    items: [
      { name: "Git", icon: ICON("git") },
      { name: "Docker", icon: ICON("docker") },
      { name: "GitHub Actions", icon: ICON("githubactions") },
      { name: "Nginx", icon: ICON("nginx") },
      { name: "Linux", icon: ICON("linux") },
    ],
  },
];

// Project content mirrors the latest CV (public/CV_-_Pham_Thanh_Phuoc_Sang.pdf) — update both together.
export const MAIFIT_PERIOD = "10/2026 – now";
export const MAIFIT_SUMMARY = "A production AI fitness web app I built and deployed solo.";
export const MAIFIT_POINTS = [
  "Log meals from a photo, count reps with the camera and ask a nutrition chatbot that cites its sources.",
  "Calories are computed in code from 300+ USDA foods, not by the LLM, so every number traces to a FoodData Central ID.",
  "RAG chatbot over 450 indexed chunks (Spring AI, pgvector, bge-m3) with hybrid search and citations checked in code.",
  "29,999 VND Premium plan priced from measured AI cost, paid through HMAC-verified, idempotent payOS webhooks.",
  "A+ on Mozilla Observatory; GitHub Actions builds and Trivy-scans images, the VPS only pulls and runs them.",
];
export const MAIFIT_TAGS = [
  "Java 25",
  "Spring Boot 4",
  "Spring AI",
  "PostgreSQL + pgvector",
  "Ollama",
  "React",
  "TypeScript",
  "Docker",
  "GitHub Actions",
];

export const ORGANIC_PERIOD = "10/2025 – 12/2025";
export const ORGANIC_SUMMARY = "A customer web, admin web and mobile app covering 13 use cases for 5 roles.";
export const ORGANIC_POINTS = [
  "Led a team of 2, split the tasks and designed the MySQL schema for products, orders, invoices and returns.",
  "Built Spring Boot APIs and React pages for OTP sign-up, password reset, product search and filters, reviews, vouchers and order tracking.",
  "Integrated payOS with webhooks that update order status automatically; built returns with photo evidence and printable tax invoices.",
  "Built the whole React Native (Expo) app alone and seeded 1,000+ products with a Python crawler and LLM-written descriptions.",
];
export const ORGANIC_TAGS = ["Java 17", "Spring Boot 3", "React 19", "React Native (Expo)", "MySQL", "payOS", "Python"];

export type NodeId = "react" | "nginx" | "spring" | "pg" | "ollama" | "gemini" | "payos";
export const ARCH: Record<NodeId, { name: string; sub: string; why: string }> = {
  react: { name: "React", sub: "TypeScript", why: "Static build served by Nginx in a container. Rep counting runs here with MediaPipe, so no video ever leaves the device." },
  nginx: { name: "Nginx", sub: "reverse proxy", why: "TLS, rate limits and security headers with a strict CSP, rated A+ on Mozilla Observatory. Only ports 22, 80 and 443 are open." },
  spring: { name: "Spring Boot", sub: "Java 25", why: "Auth with rotating refresh tokens, daily AI quotas taken by one atomic SQL upsert, payments and the RAG chat pipeline." },
  pg: { name: "PostgreSQL", sub: "+ pgvector", why: "Business data and vectors in one database: one backup, one migration tool (Flyway). Never published to the internet." },
  ollama: { name: "Ollama", sub: "bge-m3", why: "Embeddings run on the VPS. bge-m3 was chosen by measuring Vietnamese-question retrieval, not by guessing." },
  gemini: { name: "Gemini", sub: "vision + chat", why: "Only names dishes and estimates grams. Calories are always computed in code from USDA data, so every number is traceable." },
  payos: { name: "payOS", sub: "payments", why: "HMAC-verified, idempotent webhooks behind a PaymentProvider interface, with reconciliation when a webhook is lost." },
};
export const MAIN_NODES: NodeId[] = ["react", "nginx", "spring", "pg"];
export const EXT_NODES: NodeId[] = ["ollama", "gemini", "payos"];

export const METRICS: { target: number; format: (n: number) => string; label: string }[] = [
  { target: 0, format: () => "A+", label: "Mozilla Observatory" },
  { target: 22, format: (n) => `${n}/23`, label: "chatbot regression eval" },
  { target: 450, format: (n) => String(n), label: "indexed RAG chunks" },
  { target: 23, format: (n) => `~${n}đ`, label: "AI cost per photo scan" },
];

export const SECTIONS = ["about", "projects", "contact"] as const;

export const ORGANIC_LINKS = [
  { label: "Web repo", href: "https://github.com/vudev1412/Organic-Food" },
  { label: "Mobile repo", href: "https://github.com/GnasPham1218/Organic_Mobile_App" },
  { label: "Docs", href: "https://drive.google.com/drive/folders/1WK8CZlc5E5fOhbUE0MzXQA5yonfkb-F7?usp=drive_link" },
];
