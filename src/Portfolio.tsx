import { useState } from "react";
import avatarImg from "./assets/avatar.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tech {
  name: string;
  color: string;
  icon: React.ReactNode;
}
interface ProjectLink {
  label: string;
  url: string;
  isPlaceholder?: boolean;
}

interface Project {
  num: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  role: string;
  teamSize: number;
  features: string[];
  contributions: string[];
  tags: string[];
  links: ProjectLink[];
}

// ─── Tech Icons (inline SVG) ──────────────────────────────────────────────────
const TechIcons: Record<string, { color: string; svg: React.ReactNode }> = {
  JavaScript: {
    color: "#F7DF1E",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path d="M0 0h24v24H0z" fill="#F7DF1E" />
        <path
          d="M11.972 20.044c-.663 0-1.603-.13-2.434-.582l.983-1.696c.642.366 1.25.568 1.838.568 1.058 0 1.53-.472 1.53-1.107 0-.742-.647-.992-1.815-1.458-1.534-.606-2.63-1.517-2.63-2.955 0-1.483 1.137-2.732 3.193-2.732 1.146 0 2.01.275 2.593.61l-.865 1.76c-.463-.264-1.06-.484-1.693-.484-1.02 0-1.393.5-1.393 1.02 0 .66.568.91 1.765 1.385 1.638.648 2.68 1.537 2.68 3.033 0 1.633-1.233 2.638-3.752 2.638zM6.92 19.866c-1.353 0-2.348-.382-2.986-.77l.874-1.785c.523.313 1.25.617 2.05.617 1.028 0 1.49-.404 1.49-1.385v-6.38h2.04v6.495c0 1.98-1.222 3.208-3.468 3.208z"
          fill="#000000"
        />
      </svg>
    ),
  },
  "React Native": {
    color: "#61DAFB",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
        <circle cx="12" cy="12" r="2.05" fill="#61DAFB" />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="3.8"
          stroke="#61DAFB"
          strokeWidth="1.2"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="3.8"
          stroke="#61DAFB"
          strokeWidth="1.2"
          transform="rotate(60 12 12)"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="3.8"
          stroke="#61DAFB"
          strokeWidth="1.2"
          transform="rotate(120 12 12)"
        />
      </svg>
    ),
  },
  React: {
    color: "#61DAFB",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
        <circle cx="12" cy="12" r="2.05" fill="#61DAFB" />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="3.8"
          stroke="#61DAFB"
          strokeWidth="1.2"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="3.8"
          stroke="#61DAFB"
          strokeWidth="1.2"
          transform="rotate(60 12 12)"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="3.8"
          stroke="#61DAFB"
          strokeWidth="1.2"
          transform="rotate(120 12 12)"
        />
      </svg>
    ),
  },
  TypeScript: {
    color: "#3178C6",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <rect width="24" height="24" rx="3" fill="#3178C6" />
        <text
          x="2.5"
          y="17.5"
          fontFamily="Arial"
          fontWeight="bold"
          fontSize="11"
          fill="white"
        >
          TS
        </text>
      </svg>
    ),
  },
  "Tailwind CSS": {
    color: "#06B6D4",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M12 6c-2.667 0-4.333 1.333-5 4 1-1.333 2.167-1.833 3.5-1.5.76.19 1.304.743 1.906 1.357C13.387 10.944 14.373 12 16 12c2.667 0 4.333-1.333 5-4-1 1.333-2.167 1.833-3.5 1.5-.76-.19-1.304-.743-1.906-1.357C14.613 7.056 13.627 6 12 6zm-5 6c-2.667 0-4.333 1.333-5 4 1-1.333 2.167-1.833 3.5-1.5.76.19 1.304.743 1.906 1.357C8.387 16.944 9.373 18 11 18c2.667 0 4.333-1.333 5-4-1 1.333-2.167 1.833-3.5 1.5-.76-.19-1.304-.743-1.906-1.357C9.613 13.056 8.627 12 7 12z"
          fill="#06B6D4"
        />
      </svg>
    ),
  },
  Java: {
    color: "#E76F00",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573"
          fill="#E76F00"
        />
        <path
          d="M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.070-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.820M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.476 3.618-.476s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.893 3.776-.893M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.366 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.191-7.627"
          fill="#E76F00"
        />
        <path
          d="M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0 .001.553.457 3.393.639"
          fill="#E76F00"
        />
      </svg>
    ),
  },
  "Spring Boot": {
    color: "#6DB33F",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M20.205 16.392c-2.469 3.289-7.741 2.179-11.122 2.338 0 0-.599.034-1.201.133 0 0 .228-.097.519-.198 2.374-.821 3.496-.986 4.939-1.727 2.71-1.388 5.408-4.413 5.957-7.555-1.032 3.022-4.17 5.623-7.027 6.679-1.955.722-5.492 1.424-5.492 1.424a5.38 5.38 0 0 1-.28-.13c-2.408-1.188-2.487-6.484 1.905-8.198 1.9-.73 3.716-.328 5.765-.819 2.186-.515 4.714-2.143 5.74-4.267 1.141 3.35 2.497 8.505.297 12.32z"
          fill="#6DB33F"
        />
        <path
          d="M13.768 1C7.546 1 3.002 6.534 3.001 12.998c0 .023.001.045.001.068C4.432 10.648 6.677 8.992 9.218 8.992c4.003 0 7.259 3.237 7.259 7.22 0 2.818-1.634 5.262-4.019 6.476A11.9 11.9 0 0 0 13.768 23C20.001 23 25 17.96 25 11.5S20.001 1 13.768 1z"
          fill="#6DB33F"
        />
      </svg>
    ),
  },
  Python: {
    color: "#3776AB",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.89S0 5.789 0 11.969c0 6.18 3.403 5.963 3.403 5.963h2.031v-2.867s-.109-3.402 3.35-3.402h5.769s3.24.052 3.24-3.133V3.13S18.28 0 11.914 0zm-3.21 1.808a1.037 1.037 0 1 1 0 2.074 1.037 1.037 0 0 1 0-2.074z"
          fill="#3776AB"
        />
        <path
          d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.131S24 18.211 24 12.031c0-6.18-3.403-5.963-3.403-5.963h-2.031v2.867s.109 3.402-3.35 3.402H9.447s-3.24-.052-3.24 3.133V20.87S5.72 24 12.086 24zm3.21-1.808a1.037 1.037 0 1 1 0-2.074 1.037 1.037 0 0 1 0 2.074z"
          fill="#FFD43B"
        />
      </svg>
    ),
  },
  Dart: {
    color: "#00B4AB",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 0 1 1.481-.316 3.08 3.08 0 0 1 2.196.917l7.063 7.064L18.75 9.65 4.105 4.105zm14.74 9.545L14.76 9.56 4.105 4.105 18.845 18.84l.001-.001-.001-5.189zm-5.386 5.386L9.36 14.94l-5.255 5.255A3.08 3.08 0 0 0 6.28 21.47l7.064-7.063-5.581-5.58zM4.105 19.895L4.104 4.104 2.84 5.37A3.08 3.08 0 0 0 2.84 9.72l5.58 5.58-4.315 4.595z"
          fill="#00B4AB"
        />
      </svg>
    ),
  },

  FastAPI: {
    color: "#009688",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M12 0C5.375 0 0 5.375 0 12c0 6.627 5.375 12 12 12 6.626 0 12-5.373 12-12 0-6.625-5.374-12-12-12zm-.624 21.62v-7.528H7.19L13.203 2.38v7.528h4.029L11.376 21.62z"
          fill="#009688"
        />
      </svg>
    ),
  },
  Supabase: {
    color: "#3ECF8E",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.111 12.883.697 14.09 1.75 14.09h9.12l.02-.018.025 8.89c.015.987 1.26 1.41 1.874.637l9.262-11.652c.653-.833.067-2.039-.986-2.039h-9.12L11.9 1.036z"
          fill="#3ECF8E"
        />
      </svg>
    ),
  },
  MySQL: {
    color: "#4479A1",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M12 2C6.477 2 2 4.239 2 7v10c0 2.761 4.477 5 10 5s10-2.239 10-5V7c0-2.761-4.477-5-10-5zm0 2c4.418 0 8 1.79 8 3s-3.582 3-8 3-8-1.79-8-3 3.582-3 8-3zm0 16c-4.418 0-8-1.79-8-3v-2.148c2.164 1.34 5.295 2.148 8 2.148s5.836-.808 8-2.148V17c0 1.21-3.582 3-8 3z"
          fill="#4479A1"
        />
      </svg>
    ),
  },
  "SQL Server": {
    color: "#CC292B",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M12 0C5.373 0 0 1.95 0 4.36v15.28C0 22.05 5.373 24 12 24s12-1.95 12-4.36V4.36C24 1.95 18.627 0 12 0zm0 2.18c4.962 0 9 1.464 9 3.27 0 1.806-4.038 3.27-9 3.27S3 7.256 3 5.45C3 3.644 7.038 2.18 12 2.18zm0 19.64c-4.962 0-9-1.464-9-3.27v-2.18c2.31 1.442 5.485 2.333 9 2.333s6.69-.89 9-2.333v2.18c0 1.806-4.038 3.27-9 3.27z"
          fill="#CC292B"
        />
      </svg>
    ),
  },
  MongoDB: {
    color: "#47A248",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M11.96 0C11.96 0 5 6.45 5 13.5C5 17.64 8.13 21 12 21C12 21 12.5 21.5 12.5 22.5C12.5 22.5 13 21 13 21C16.87 21 20 17.64 20 13.5C20 6.45 11.96 0 11.96 0ZM12 18.5C12 18.5 9 15.5 9 12C9 8.5 12 4.5 12 4.5C12 4.5 15 8.5 15 12C15 15.5 12 18.5 12 18.5Z"
          fill="#47A248"
        />
      </svg>
    ),
  },
  Docker: {
    color: "#2496ED",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"
          fill="#2496ED"
        />
      </svg>
    ),
  },
  Linux: {
    color: "#FCC624",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 0 0-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.288-.950.6-.456.42-.525 1.07-.066 1.607.42.47.913.706 1.458.784.54.076 1.115.043 1.667.144.287.05.582.144.869.188.286.041.572.062.858.061.283-.002.567-.026.847-.068.282-.042.557-.117.832-.188.276-.07.547-.135.808-.131.26.004.512.073.76.193.25.12.504.303.772.458.268.156.551.28.84.31.29.03.584-.01.87-.098.285-.087.553-.22.806-.388.246-.165.47-.37.67-.584.197-.212.37-.44.517-.673.29-.464.509-.965.65-1.487.14-.522.199-1.06.194-1.597a7.13 7.13 0 0 0-.033-.597 7.17 7.17 0 0 0-.1-.588 7.034 7.034 0 0 0-.208-.69 6.94 6.94 0 0 0-.328-.793 6.96 6.96 0 0 0-.495-.857 7.037 7.037 0 0 0-.668-.917 7.154 7.154 0 0 0-.87-.954 7.198 7.198 0 0 0-1.086-.977c-.412-.294-.855-.546-1.322-.737a6.982 6.982 0 0 0-1.506-.387z"
          fill="#FCC624"
        />
      </svg>
    ),
  },
  Firebase: {
    color: "#FFCA28",
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path
          d="M3.89 15.672L6.255.461A.542.542 0 0 1 7.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 0 0-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 0 0 1.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 0 0-.96 0L3.53 17.984z"
          fill="#FFCA28"
        />
      </svg>
    ),
  },
};

const TECHS = Object.entries(TechIcons).map(([name, { color, svg }]) => ({
  name,
  color,
  icon: svg,
}));

// ─── Skill Categories (updated to match CV) ───────────────────────────────────
const SKILL_CATEGORIES = [
  {
    title: "Programming Languages",
    skills: ["Java", "Python", "JavaScript", "TypeScript"],
  },
  {
    title: "Frameworks & Libraries",
    skills: [
      "React",
      "React Native",
      "Flutter",
      "Spring Boot",
      "FastAPI",
      "Tailwind CSS",
    ],
  },
  {
    title: "Databases & DevOps",
    skills: ["MySQL", "SQL Server", "MongoDB", "Supabase", "Docker", "Linux"],
  },
];

// ─── Projects (updated to match CV — 3 projects) ─────────────────────────────
const PROJECTS: Project[] = [
  {
    num: "01",
    title: "Organic Food Ecosystem",
    description:
      "A comprehensive multi-platform e-commerce ecosystem for organic food — featuring a React customer web app, a Spring Boot backend with Admin Dashboard, and a fully-featured Expo/React Native mobile app.",
    startDate: "10/2025",
    endDate: "12/2025",
    role: "Team Leader & Fullstack Developer",
    teamSize: 2,
    features: [
      "Core e-commerce flow: Product Lists, Shopping Cart, and streamlined Checkout process",
      "Member registration, secure login, and discount voucher management",
      "Admin Dashboard for monitoring transactions, managing inventory, and tracking order status",
      "Seamless data synchronization between Spring Boot backend and both Web & Mobile platforms",
    ],
    contributions: [
      "Architected system logic and designed MySQL database schemas for products, categories, and orders",
      "Built RESTful APIs with Spring Boot and integrated them with React frontend for product catalog and user actions",
      "Integrated PayOS automated payment gateway and implemented SMTP Email for registration",
      "Independently developed the entire React Native app from UI/UX design to API integration, covering the full shopping flow",
      "Built a Python-based crawler to collect 1,000+ organic product listings, then used AI (LLM) to auto-generate product descriptions",
    ],
    tags: [
      "Java 17",
      "Spring Boot 3",
      "React 19",
      "React Native",
      "MySQL",
      "PayOS",
    ],
    links: [
      {
        label: "GitHub (Web)",
        url: "https://github.com/vudev1412/Organic-Food",
      },
      {
        label: "GitHub (Mobile)",
        url: "https://github.com/GnasPham1218/Organic_Mobile_App",
      },
      {
        label: "Docs",
        url: "https://drive.google.com/drive/folders/1WK8CZlc5E5fOhbUE0MzXQA5yonfkb-F7?usp=drive_link",
      },
    ],
  },
  {
    num: "02",
    title: "FishFeeder Extended (IoT)",
    description:
      "A complete IoT ecosystem for automated fish feeding — featuring an ESP32-powered hardware dispenser and a real-time web dashboard connected via secure MQTT over TLS/SSL.",
    startDate: "10/2025",
    endDate: "11/2025",
    role: "IoT & Web Developer",
    teamSize: 1,
    features: [
      "Remote control: Manual 'Feed Now' trigger and configurable servo rotation duration/count via Web",
      "Smart automation: Scheduled feeding times with Add/Remove functionality and Auto-Mode toggle",
      "Real-time monitoring: Live updates for food level, temperature, and daily feed count with low-food alerts",
      "Persistent storage: Synchronization of feeding schedules and device states between ESP32 and cloud",
    ],
    contributions: [
      "Developed ESP32 firmware in C++ to control a servo motor dispensing system and integrated OLED SSD1306 for status display",
      "Implemented RTC DS3231 and Preferences library to ensure precise scheduling and data persistence during power loss",
      "Architected a real-time communication bridge using MQTT (TLS/SSL) via HiveMQ Cloud for secure data exchange",
      "Built a Web Dashboard using Paho MQTT JS and Chart.js to visualize temperature history and manage feeding logs",
    ],
    tags: ["ESP32", "C++", "MQTT", "HiveMQ", "Chart.js", "JavaScript"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/GnasPham1218/Automatic_Feed_Fish",
      },
      {
        label: "Live Dashboard",
        url: "https://gnaspham1218.github.io/Automatic_Feed_Fish/",
      },
      {
        label: "Demo",
        url: "https://drive.google.com/file/d/1z_ucfc0XvqAFOyc4vMbnFrYKN8630FC3/view?usp=sharing",
      },
    ],
  },
  {
    num: "03",
    title: "Smart English Learning App",
    description:
      "A cross-platform mobile application for learning English vocabulary, built with Flutter & Firebase — featuring Oxford 3000+ word sets, quiz modules, spaced-repetition tracking, and daily notification reminders.",
    startDate: "04/2025",
    endDate: "06/2025",
    role: "Mobile Developer",
    teamSize: 2,
    features: [
      "Seamless onboarding and secure authentication via Firebase Auth",
      "Personalized vocabulary tracking: learned words, streaks, and custom word lists",
      "Integrated English-Vietnamese dictionary and text translation using online APIs",
      "Cross-platform performance (Android/iOS) with synchronized user data via Cloud Firestore",
    ],
    contributions: [
      "Developed a Python-based crawler to extract the Oxford 3000+ vocabulary set (meanings, examples, audio)",
      "Designed and implemented the Cloud Firestore database schema for user progress and vocabulary storage",
      "Built the Quiz Module featuring multiple-choice and listening exercises with personalized vocabulary lists",
      "Implemented Local Notifications for daily reminders with customizable scheduling",
    ],
    tags: ["Flutter", "Dart", "Firebase", "Oxford API", "Python"],
    links: [{ label: "GitHub", url: "https://github.com/DinhHoz/tienganh" }],
  },
];

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    url: "https://github.com/GnasPham1218",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/gnasai1218",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Email",
    url: "mailto:gnasai1218@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  {
    name: "Phone",
    url: "tel:+84903915722",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    ),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkillChip({ tech }: { tech: Tech }) {
  return (
    <div
      className="group flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm font-medium
        transition-all duration-200 hover:-translate-y-0.5 cursor-default
        bg-white dark:bg-zinc-900 border-black/[0.08] dark:border-white/[0.08]
        text-zinc-800 dark:text-zinc-200"
    >
      {tech.icon}
      <span>{tech.name}</span>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 py-10 border-b border-black/[0.08] dark:border-white/[0.08] last:border-0 group relative hover:bg-black/[0.01] dark:hover:bg-white/[0.01] rounded-2xl transition-colors md:p-10 -mx-10">
      {/* ── Left Column ── */}
      <div className="w-full lg:w-1/4 shrink-0 flex flex-col items-start px-10 md:px-0">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
          {project.startDate} — {project.endDate}
        </p>

        <div className="flex flex-col gap-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {project.role}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.04] w-fit">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Team Size: {project.teamSize}
          </div>
        </div>

        {/* Desktop Tags */}
        <div className="hidden lg:flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.04]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right Column ── */}
      <div className="w-full lg:w-3/4 flex flex-col px-10 md:px-0">
        <h3 className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-sky-500 transition-colors">
          {project.title}
        </h3>
        <p className="text-base font-light text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
          {project.description}
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Features */}
          <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-500">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Key Features
            </h4>
            <ul className="space-y-3">
              {project.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="text-sm font-light text-zinc-600 dark:text-zinc-400 flex items-start gap-3"
                >
                  <svg
                    className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Contributions */}
          <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              My Contributions
            </h4>
            <ul className="space-y-3">
              {project.contributions.map((contribution, idx) => (
                <li
                  key={idx}
                  className="text-sm font-light text-zinc-600 dark:text-zinc-400 flex items-start gap-3"
                >
                  <svg
                    className="w-4 h-4 text-emerald-400 dark:text-emerald-600 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {contribution}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Tags */}
        <div className="flex lg:hidden flex-wrap gap-1.5 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.04]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        {project.links.length > 0 && (
          <div className="flex flex-wrap gap-6 pt-2 mt-auto">
            {project.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Portfolio() {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleTheme = () => {
    setDark((d) => !d);
    document.documentElement.classList.toggle("dark");
  };

  const handleCopyEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText("gnasai1218@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans w-full">
        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-50 border-b border-black/[0.08] dark:border-white/[0.08] bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur w-full">
          <div className="w-full px-6 md:px-12 lg:px-24 xl:px-32 h-14 flex items-center justify-between">
            <span className="font-display text-lg font-extrabold tracking-tight">
              Pham Thanh Phuoc Sang<span className="text-sky-500">.</span>
            </span>
            <ul className="hidden md:flex gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {["About", "Skills", "Projects"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="hover:text-sky-500 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="relative h-7 rounded-full transition-colors duration-300 flex items-center px-1
                bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] shadow-sm"
              style={{ width: 52 }}
            >
              <span
                className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-[10px] text-white transition-transform duration-300 shadow-sm"
                style={{
                  transform: dark ? "translateX(24px)" : "translateX(0)",
                }}
              >
                {dark ? "☾" : "☀"}
              </span>
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="w-full px-6 md:px-12 lg:px-24 xl:px-32 pt-24 pb-16 flex flex-col-reverse lg:flex-row lg:justify-between gap-12 lg:gap-24 items-center">
          <div className="max-w-3xl flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium mb-6 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Open to opportunities
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-[-0.04em] mb-6">
              Hi, I'm{" "}
              <em className="not-italic text-sky-500">
                Pham Thanh Phuoc Sang{" "}
              </em>
              (Gnas Pham)
            </h1>

            <p className="text-base md:text-lg font-light text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed mb-10">
              Fresh Software Engineering graduate from HUIT with a strong focus
              on Full-Stack development. Proficient in Java Spring Boot and
              React. Experienced in IoT integration and data crawling. Based in
              Ho Chi Minh City.
            </p>

            <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
              <a
                href="https://your-google-drive-link-to-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-colors shadow-sm shadow-sky-500/20"
              >
                View Resume ↗
              </a>
              <a
                href="#footer"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("footer")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg text-sm font-semibold bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] hover:border-sky-500 hover:text-sky-500 transition-colors shadow-sm"
              >
                Get in Touch
              </a>
            </div>
          </div>

          <div className="w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-96 xl:h-96 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] overflow-hidden shadow-2xl">
            <img
              src={avatarImg}
              alt="Pham Thanh Phuoc Sang"
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
        </header>

        {/* ── About ── */}
        <section
          id="about"
          className="w-full px-6 md:px-12 lg:px-24 xl:px-32 py-16 md:py-24 bg-white/[0.3] dark:bg-zinc-900/[0.2]"
        >
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-sky-500 mb-2">
            Background
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-10">
            About Me
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-7xl">
            <div className="space-y-6 text-base md:text-lg font-light text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                I'm a{" "}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  fresh Software Engineering graduate
                </strong>{" "}
                from HUIT (Ho Chi Minh City University of Industry and Trade),
                with a GPA of 3.3/4.0.
              </p>
              <p>
                I enjoy working across the full stack — from crafting clean UI
                in React & Flutter to designing scalable APIs in Spring Boot.
                I'm also experienced in IoT development (ESP32/MQTT) and
                Python-based data crawling.
              </p>
              <p>
                Currently based in{" "}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  Ho Chi Minh City
                </strong>{" "}
                and actively looking for my first full-time role. English level:
                B2.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "3", label: "Projects shipped" },
                { num: "3.3", label: "GPA / 4.0" },
                { num: "Full", label: "Stack developer" },
                { num: "2026", label: "Fresh graduate" },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.04] shadow-sm"
                >
                  <p className="font-display text-4xl font-extrabold text-sky-500">
                    {num}
                  </p>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Block */}
          <div className="mt-12 max-w-7xl">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-sky-500" />
              Education
            </h3>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Ho Chi Minh City University of Industry and Trade (HUIT)
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Bachelor of Software Engineering &nbsp;·&nbsp; GPA 3.3 / 4.0
                </p>
              </div>
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
                2022 – 2026
              </span>
            </div>
          </div>
        </section>

        <div className="w-full border-t border-black/[0.06] dark:border-white/[0.06]" />

        {/* ── Skills ── */}
        <section
          id="skills"
          className="w-full px-6 md:px-12 lg:px-24 xl:px-32 py-16 md:py-24"
        >
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-sky-500 mb-2">
            What I work with
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-12">
            Skills & Technologies
          </h2>

          <div className="flex flex-col gap-10 max-w-7xl">
            {SKILL_CATEGORIES.map((category) => (
              <div
                key={category.title}
                className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8"
              >
                <h3 className="md:w-56 shrink-0 text-lg font-semibold text-zinc-800 dark:text-zinc-200 pt-2 border-b-2 md:border-b-0 md:border-l-2 border-sky-500/30 md:pl-4 pb-2 md:pb-0">
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-3 flex-1">
                  {category.skills.map((skillName) => {
                    const tech = TECHS.find((t) => t.name === skillName);
                    return tech ? (
                      <SkillChip key={tech.name} tech={tech} />
                    ) : null;
                  })}
                </div>
              </div>
            ))}

            {/* Tools row */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
              <h3 className="md:w-56 shrink-0 text-lg font-semibold text-zinc-800 dark:text-zinc-200 pt-2 border-b-2 md:border-b-0 md:border-l-2 border-sky-500/30 md:pl-4 pb-2 md:pb-0">
                Tools & Languages
              </h3>
              <div className="flex flex-wrap gap-3 flex-1">
                {["Git", "Postman"].map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm font-medium bg-white dark:bg-zinc-900 border-black/[0.08] dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="w-full border-t border-black/[0.06] dark:border-white/[0.06]" />

        {/* ── Projects ── */}
        <section
          id="projects"
          className="w-full px-6 md:px-12 lg:px-24 xl:px-32 py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-sky-500 mb-2">
              Selected work
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-12">
              Featured Projects
            </h2>
            <div className="flex flex-col space-y-4">
              {PROJECTS.map((project) => (
                <ProjectRow key={project.num} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          id="footer"
          className="w-full border-t border-black/[0.06] dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300"
        >
          <div className="w-full px-6 md:px-12 lg:px-24 xl:px-32 py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full mb-5 overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-2xl">
              <img
                src={avatarImg}
                alt="Pham Thanh Phuoc Sang"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>

            <p className="font-display text-2xl font-extrabold tracking-tight mb-1 text-zinc-900 dark:text-zinc-100">
              Pham Thanh Phuoc Sang
            </p>
            <p className="font-display text-xl font-extrabold tracking-tight mb-1 text-zinc-900 dark:text-zinc-100">
              (Gnas Pham)
            </p>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
              Software Engineer · Ho Chi Minh City <br />
              <span className="inline-block mt-2 text-sky-500 dark:text-sky-400 font-semibold">
                Available for new opportunities.
              </span>
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {SOCIAL_LINKS.map((link) => {
                const isEmail = link.name === "Email";
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    onClick={isEmail ? handleCopyEmail : undefined}
                    target={
                      isEmail || link.name === "Phone" ? undefined : "_blank"
                    }
                    rel={
                      isEmail || link.name === "Phone"
                        ? undefined
                        : "noopener noreferrer"
                    }
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold
                    bg-white dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.06] shadow-sm
                    text-zinc-600 dark:text-zinc-300
                    hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-500/30 dark:hover:border-sky-400/30
                    hover:bg-sky-50/50 dark:hover:bg-sky-950/20
                    transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                      {link.icon}
                    </span>
                    <span
                      className={isEmail && copied ? "text-emerald-500" : ""}
                    >
                      {isEmail && copied
                        ? "Copied!"
                        : link.name === "Phone"
                          ? "+84 903 915 722"
                          : link.name}
                    </span>
                  </a>
                );
              })}
            </div>

            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex flex-col sm:flex-row items-center gap-1.5">
              <span>© 2026 Pham Thanh Phuoc Sang (Gnas Pham).</span>
              <span className="hidden sm:inline-block">•</span>
              <span>Built with React & Tailwind CSS.</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
