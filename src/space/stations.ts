import { SKILL_GROUPS } from "../data";

// ─── Stops of the camera tour (one per page section) ─────────────────────────
export type StationId = "hero" | "about" | "skills" | "maifit" | "organic" | "contact";

export interface Station {
  id: StationId;
  label: string;
  /** id of the HTML section that drives this stop */
  section: string;
  /** camera distance from the planet */
  dist: number;
  /** which side of the planet the camera sits on */
  side: 1 | -1;
  /** desktop: push the planet left (panel sits on the right), as a fraction of dist */
  shift: number;
  /** phones: push the planet up (panel sits below), as a fraction of dist */
  shiftY: number;
}

export const STATIONS: Station[] = [
  { id: "hero", label: "Home", section: "top", dist: 36, side: 1, shift: -0.24, shiftY: -0.16 },
  { id: "about", label: "About", section: "about", dist: 6.5, side: 1, shift: 0.3, shiftY: 0.24 },
  { id: "skills", label: "Skills", section: "skills", dist: 12.5, side: -1, shift: 0.3, shiftY: 0.22 },
  { id: "maifit", label: "MAIFit", section: "maifit", dist: 14.5, side: 1, shift: 0.3, shiftY: 0.22 },
  { id: "organic", label: "Organic Food", section: "organic", dist: 6.5, side: -1, shift: 0.3, shiftY: 0.24 },
  { id: "contact", label: "Contact", section: "contact", dist: 5.5, side: 1, shift: 0.3, shiftY: 0.24 },
];

// ─── Planets ─────────────────────────────────────────────────────────────────
export type PlanetId = Exclude<StationId, "hero">;

export interface PlanetDef {
  id: PlanetId;
  name: string;
  radius: number;
  orbit: number;
  /** starting angle on the orbit (radians) */
  angle: number;
  /** dark, mid and light tones for the procedural surface */
  colors: [string, string, string];
  glow: string;
  tilt: number;
  /** orbit speed (radians / second): inner planets go round faster, like a real solar system */
  speed: number;
}

export const SUN_RADIUS = 3;

export const PLANETS: PlanetDef[] = [
  { id: "about", name: "About", radius: 1.1, orbit: 9, angle: 0.35, colors: ["#16367d", "#4f8cff", "#d6e8ff"], glow: "#6fa8ff", tilt: 0.35, speed: 0.11 },
  { id: "skills", name: "Skills", radius: 1.35, orbit: 14, angle: -0.25, colors: ["#331a6e", "#a78bfa", "#f1e9ff"], glow: "#b69cff", tilt: -0.25, speed: 0.075 },
  { id: "maifit", name: "MAIFit", radius: 2, orbit: 19.5, angle: -0.8, colors: ["#0a3470", "#2b8cf6", "#a6d8ff"], glow: "#4aa8ff", tilt: 0.2, speed: 0.05 },
  { id: "organic", name: "Organic Food", radius: 1.15, orbit: 25.5, angle: -1.3, colors: ["#0d4326", "#22a55b", "#d0f7de"], glow: "#4cd98a", tilt: 0.12, speed: 0.036 },
  { id: "contact", name: "Contact", radius: 0.7, orbit: 30, angle: -1.75, colors: ["#4a3a10", "#f2b33d", "#fff1c9"], glow: "#ffd27a", tilt: 0, speed: 0.028 },
];

// ─── Skill belts around the Skills planet ────────────────────────────────────
export const GROUP_COLORS: Record<string, string> = {
  Languages: "#fb923c",
  Backend: "#6db33f",
  "Data & AI": "#f2b33d",
  Frontend: "#38bdf8",
  "Tools & DevOps": "#f472b6",
};

export interface OrbitItem {
  /** icon url; shared with the skill chips so hovering either highlights both */
  key: string;
  icon: string;
  names: string[];
}

export interface OrbitGroup {
  name: string;
  color: string;
  items: OrbitItem[];
}

/** One icon per distinct logo (the four Spring skills share one); fewest icons on the inner belt. */
export const ORBIT_GROUPS: OrbitGroup[] = SKILL_GROUPS.map((g) => {
  const byIcon = new Map<string, OrbitItem>();
  for (const s of g.items) {
    const item = byIcon.get(s.icon) ?? { key: s.icon, icon: s.icon, names: [] };
    item.names.push(s.name);
    byIcon.set(s.icon, item);
  }
  return { name: g.name, color: GROUP_COLORS[g.name] ?? "#8cc8ff", items: [...byIcon.values()] };
}).sort((a, b) => a.items.length - b.items.length);
