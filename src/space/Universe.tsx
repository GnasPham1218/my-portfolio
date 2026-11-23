import { Billboard, Html, Line, PerformanceMonitor, Sparkles, Stars, useCursor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { ARCH, EXT_NODES, MAIN_NODES, type NodeId } from "../data";
import {
  ORBIT_GROUPS,
  PLANETS,
  STATIONS,
  SUN_RADIUS,
  type OrbitGroup,
  type OrbitItem,
  type PlanetDef,
  type PlanetId,
  type StationId,
} from "./stations";
import { glowTexture, iconTile, nebulaTexture, planetTexture, seeded } from "./textures";

/** Written by the page on scroll, read by the camera every frame. */
export interface ScrollState {
  /** 0 = hero, 1 = about … fractional while flying between stops */
  p: number;
  mobile: boolean;
}

export interface UniverseProps {
  scroll: ScrollState;
  low: boolean;
  reduced: boolean;
  onNavigate: (id: StationId) => void;
  hotSkill: string | null;
  onHotSkill: (key: string | null) => void;
  selectedArch: NodeId;
  onSelectArch: (id: NodeId) => void;
  activeStation: StationId;
}

type Anchors = Partial<Record<PlanetId, THREE.Object3D>>;

/** Shared between the camera rig (writes) and click handlers (read) so a drag never counts as a click. */
interface DragState {
  yaw: number;
  pitch: number;
  vYaw: number;
  vPitch: number;
  down: boolean;
  moved: number;
  x: number;
  y: number;
}

const UP = new THREE.Vector3(0, 1, 0);
/** Share of the hero section's scroll used by the opening sweep; the rest flies on to About. */
const SWEEP_END = 0.6;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = THREE.MathUtils.damp;

function circle(radius: number, plane: "xz" | "xy", segments = 160) {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return plane === "xz"
      ? new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
      : new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  });
}

// ─── Shaders ──────────────────────────────────────────────────────────────────
const NOISE = /* glsl */ `
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
`;

function sunMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBoost: { value: 1 } },
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
      void main() {
        vPos = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uBoost;
      varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
      ${NOISE}
      void main() {
        vec3 p = normalize(vPos) * 2.4;
        float n = fbm(p + vec3(uTime * 0.07, uTime * 0.04, 0.0));
        float n2 = fbm(p * 2.6 - vec3(0.0, uTime * 0.11, uTime * 0.05));
        float heat = smoothstep(0.25, 0.85, n * 0.75 + n2 * 0.45);
        vec3 col = mix(vec3(1.7, 0.42, 0.06), vec3(3.4, 2.1, 0.75), heat);
        float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
        col += vec3(1.8, 0.9, 0.3) * rim;
        gl_FragColor = vec4(col * uBoost, 1.0);
      }`,
  });
}

/** Fresnel halo drawn on a slightly larger sphere around each planet. */
function atmosphereMaterial(color: string) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uIntensity;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
        gl_FragColor = vec4(uColor * f * uIntensity * 1.6, f * uIntensity);
      }`,
  });
}

// ─── Background ───────────────────────────────────────────────────────────────
function Nebula({ low }: { low: boolean }) {
  const tex = useMemo(() => nebulaTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const clouds: { pos: [number, number, number]; color: string; size: number }[] = [
    { pos: [-110, 35, -150], color: "#5b2bbf", size: 170 },
    { pos: [130, -25, -130], color: "#1f6fc4", size: 190 },
    { pos: [20, 80, -190], color: "#a12c7b", size: 140 },
    { pos: [-60, -70, 150], color: "#1c8fc9", size: 160 },
    { pos: [160, 40, 90], color: "#3a2a9e", size: 150 },
  ];
  return (
    <>
      {clouds.slice(0, low ? 2 : 3).map((c) => (
        <Billboard key={c.color} position={c.pos}>
          <mesh>
            <planeGeometry args={[c.size, c.size]} />
            <meshBasicMaterial map={tex} color={c.color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </Billboard>
      ))}
    </>
  );
}

function AsteroidBelt({ radius, width, count, reduced }: { radius: number; width: number; count: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const rnd = seeded(42);
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = radius + (rnd() - 0.5) * width;
      p.set(Math.cos(a) * r, (rnd() - 0.5) * 0.6, Math.sin(a) * r);
      q.setFromEuler(e.set(rnd() * 3, rnd() * 3, rnd() * 3));
      s.setScalar(0.04 + rnd() * rnd() * 0.22);
      m.setMatrixAt(i, mat.compose(p, q, s));
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, radius, width]);
  useFrame((_, dt) => {
    if (!reduced && group.current) group.current.rotation.y += dt * 0.006;
  });
  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8d8f9a" roughness={1} flatShading />
      </instancedMesh>
    </group>
  );
}

// ─── Sun ──────────────────────────────────────────────────────────────────────
function Sun({ onClick, reduced }: { onClick: () => void; reduced: boolean }) {
  const mat = useMemo(sunMaterial, []);
  const glow = useMemo(glowTexture, []);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  useEffect(
    () => () => {
      mat.dispose();
      glow.dispose();
    },
    [mat, glow],
  );
  useFrame((_, dt) => {
    if (!reduced) mat.uniforms.uTime.value += dt;
    mat.uniforms.uBoost.value = damp(mat.uniforms.uBoost.value, hover ? 1.25 : 1, 5, dt);
  });
  return (
    <group>
      <mesh
        material={mat}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[SUN_RADIUS, 96, 96]} />
      </mesh>
      <Billboard>
        <mesh>
          <planeGeometry args={[SUN_RADIUS * 5, SUN_RADIUS * 5]} />
          <meshBasicMaterial map={glow} color={[1.1, 0.6, 0.25]} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[SUN_RADIUS * 9, SUN_RADIUS * 9]} />
          <meshBasicMaterial map={glow} color={[0.16, 0.08, 0.035]} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </Billboard>
      <pointLight color="#fff4e6" intensity={2.2} decay={0} />
    </group>
  );
}

// ─── Planet ───────────────────────────────────────────────────────────────────
interface PlanetProps {
  def: PlanetDef;
  anchors: Anchors;
  reduced: boolean;
  focused: boolean;
  hovered: boolean;
  showLabel: boolean;
  onHover: (id: PlanetId, on: boolean) => void;
  onClick: (id: PlanetId) => void;
  /** replaces the sphere (used for the Contact satellite) */
  body?: ReactNode;
  children?: ReactNode;
}

function Planet({ def, anchors, reduced, focused, hovered, showLabel, onHover, onClick, body, children }: PlanetProps) {
  const orbit = useRef<THREE.Group>(null);
  const scaleGroup = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => (body ? null : planetTexture(def.colors, def.orbit)), [def, body]);
  const atmo = useMemo(() => atmosphereMaterial(def.glow), [def.glow]);
  useCursor(hovered);

  useEffect(() => {
    if (orbit.current) anchors[def.id] = orbit.current;
    return () => {
      delete anchors[def.id];
    };
  }, [anchors, def.id]);
  useEffect(
    () => () => {
      tex?.dispose();
      atmo.dispose();
    },
    [tex, atmo],
  );

  useFrame((state, dt) => {
    const t = reduced ? 0 : state.clock.elapsedTime;
    const a = def.angle + t * def.speed;
    orbit.current?.position.set(Math.cos(a) * def.orbit, 0, Math.sin(a) * def.orbit);
    if (!reduced && surface.current) surface.current.rotation.y += dt * 0.12;
    const g = scaleGroup.current;
    if (g) g.scale.setScalar(damp(g.scale.x, hovered ? 1.08 : 1, 6, dt));
    atmo.uniforms.uIntensity.value = damp(atmo.uniforms.uIntensity.value, hovered ? 1.9 : focused ? 1.3 : 0.9, 5, dt);
  });

  const handlers = {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onHover(def.id, true);
    },
    onPointerOut: () => onHover(def.id, false),
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onClick(def.id);
    },
  };

  return (
    <group ref={orbit}>
      <group ref={scaleGroup}>
        <group rotation={[0, 0, def.tilt]}>
          {body ? (
            <>
              {body}
              {/* invisible, larger hit area for the small satellite */}
              <mesh {...handlers}>
                <sphereGeometry args={[def.radius * 1.8, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            </>
          ) : (
            <mesh ref={surface} {...handlers}>
              <sphereGeometry args={[def.radius, 64, 64]} />
              <meshStandardMaterial map={tex} roughness={0.85} metalness={0.05} />
            </mesh>
          )}
          <mesh material={atmo} scale={body ? 1.9 : 1.18}>
            <sphereGeometry args={[def.radius, 48, 48]} />
          </mesh>
        </group>
      </group>
      <Html position={[0, def.radius + 0.75, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div className={`planet-label${hovered ? " on" : ""}${focused ? " here" : ""}${showLabel || hovered ? "" : " hide"}`}>{def.name}</div>
      </Html>
      {children}
    </group>
  );
}

// ─── Skills: belts of logos around the Skills planet ─────────────────────────
function SkillIcon({
  item,
  group,
  position,
  active,
  dim,
  onHot,
}: {
  item: OrbitItem;
  group: OrbitGroup;
  position: [number, number, number];
  active: boolean;
  dim: boolean;
  onHot: (key: string | null) => void;
}) {
  const tex = useMemo(() => iconTile(item.icon, group.color, item.names[0]?.[0] ?? "?"), [item, group.color]);
  const holder = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame((_, dt) => {
    if (holder.current) holder.current.scale.setScalar(damp(holder.current.scale.x, active ? 0.95 : 0.55, 7, dt));
    if (mat.current) mat.current.opacity = damp(mat.current.opacity, dim ? 0.25 : 1, 7, dt);
  });
  return (
    <group position={position}>
      <group ref={holder} scale={0.55}>
        <Billboard>
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(true);
              onHot(item.key);
            }}
            onPointerOut={() => {
              setHover(false);
              onHot(null);
            }}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial ref={mat} map={tex} transparent alphaTest={0.05} toneMapped={false} />
          </mesh>
        </Billboard>
      </group>
      {/* always mounted (mounting/unmounting Html every hover makes React warn and stutter) */}
      <Html center position={[0, 0.85, 0]} pointerEvents="none" zIndexRange={[30, 20]}>
        <div className={`space-tip${active ? " show" : ""}`}>
          <b style={{ color: group.color }}>{group.name}</b>
          {item.names.join(" · ")}
        </div>
      </Html>
    </group>
  );
}

function SkillBelt({
  group,
  index,
  hot,
  activeBelt,
  onHot,
  reduced,
}: {
  group: OrbitGroup;
  index: number;
  hot: string | null;
  activeBelt: number;
  onHot: (key: string | null) => void;
  reduced: boolean;
}) {
  const r = 2.25 + index * 0.6;
  const spin = useRef<THREE.Group>(null);
  const slow = useRef(1);
  const focus = activeBelt === index;
  const pts = useMemo(() => circle(r, "xy"), [r]);
  useFrame((_, dt) => {
    slow.current = damp(slow.current, focus ? 0.04 : 1, 5, dt);
    if (!reduced && spin.current) spin.current.rotation.z += dt * (0.34 - index * 0.06) * (index % 2 ? -1 : 1) * slow.current;
  });
  return (
    <group rotation={[1.15 + (index % 2 ? 0.14 : -0.1), (index - 1.5) * 0.22, 0]}>
      <Line points={pts} color={group.color} lineWidth={1.2} transparent opacity={activeBelt === -1 ? 0.4 : focus ? 0.95 : 0.12} />
      <group ref={spin}>
        {group.items.map((it, i) => {
          const a = (i / group.items.length) * Math.PI * 2 + index * 0.8;
          return (
            <SkillIcon
              key={it.key}
              item={it}
              group={group}
              position={[Math.cos(a) * r, Math.sin(a) * r, 0]}
              active={hot === it.key}
              dim={activeBelt !== -1 && !focus}
              onHot={onHot}
            />
          );
        })}
      </group>
    </group>
  );
}

function SkillBelts({ hot, onHot, reduced }: { hot: string | null; onHot: (key: string | null) => void; reduced: boolean }) {
  const activeBelt = hot ? ORBIT_GROUPS.findIndex((g) => g.items.some((it) => it.key === hot)) : -1;
  return (
    <>
      {ORBIT_GROUPS.map((g, i) => (
        <SkillBelt key={g.name} group={g} index={i} hot={hot} activeBelt={activeBelt} onHot={onHot} reduced={reduced} />
      ))}
    </>
  );
}

// ─── MAIFit: architecture as moons ────────────────────────────────────────────
function Moon({
  id,
  position,
  color,
  selected,
  showLabel,
  onSelect,
}: {
  id: NodeId;
  position: [number, number, number];
  color: string;
  selected: boolean;
  showLabel: boolean;
  onSelect: (id: NodeId) => void;
}) {
  const [hover, setHover] = useState(false);
  const holder = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useCursor(hover);
  useFrame((_, dt) => {
    if (holder.current) holder.current.scale.setScalar(damp(holder.current.scale.x, selected ? 1.45 : hover ? 1.25 : 1, 7, dt));
    if (mat.current) mat.current.emissiveIntensity = damp(mat.current.emissiveIntensity, selected ? 2.6 : hover ? 1.3 : 0.35, 7, dt);
  });
  return (
    <group position={position}>
      <group ref={holder}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
          }}
          onPointerOut={() => setHover(false)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
          }}
        >
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.35} roughness={0.5} />
        </mesh>
      </group>
      <Html center position={[0, 0.62, 0]} pointerEvents="none" zIndexRange={[25, 20]}>
        <div className={`moon-label${selected ? " on" : ""}${showLabel || hover ? "" : " hide"}`}>{ARCH[id].name}</div>
      </Html>
    </group>
  );
}

function MoonRing({
  ids,
  radius,
  tilt,
  color,
  dashed,
  speed,
  selected,
  showLabels,
  onSelect,
  reduced,
}: {
  ids: NodeId[];
  radius: number;
  tilt: [number, number, number];
  color: string;
  dashed?: boolean;
  speed: number;
  selected: NodeId;
  showLabels: boolean;
  onSelect: (id: NodeId) => void;
  reduced: boolean;
}) {
  const spin = useRef<THREE.Group>(null);
  const pts = useMemo(() => circle(radius, "xz"), [radius]);
  useFrame((_, dt) => {
    if (!reduced && spin.current) spin.current.rotation.y += dt * speed;
  });
  return (
    <group rotation={tilt}>
      <Line points={pts} color={color} lineWidth={1} transparent opacity={0.35} dashed={dashed} dashSize={0.3} gapSize={0.18} />
      <group ref={spin}>
        {ids.map((id, i) => {
          const a = (i / ids.length) * Math.PI * 2;
          return (
            <Moon
              key={id}
              id={id}
              position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}
              color={color}
              selected={selected === id}
              showLabel={showLabels}
              onSelect={onSelect}
            />
          );
        })}
      </group>
    </group>
  );
}

function LittleMoon({ radius, tilt, color, reduced }: { radius: number; tilt: number; color: string; reduced: boolean }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!reduced && spin.current) spin.current.rotation.y += dt * 0.4;
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={spin}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Contact: a little satellite ──────────────────────────────────────────────
function Satellite({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state, dt) => {
    if (!reduced && ref.current) ref.current.rotation.y += dt * 0.35;
    if (beacon.current) beacon.current.emissiveIntensity = Math.sin(state.clock.elapsedTime * 4) > 0.55 ? 5 : 0.4;
  });
  const panel = (x: number) => (
    <mesh position={[x, 0, 0]}>
      <boxGeometry args={[1.2, 0.04, 0.5]} />
      <meshStandardMaterial color="#173f8c" emissive="#1f6fc4" emissiveIntensity={0.7} metalness={0.5} roughness={0.35} />
    </mesh>
  );
  return (
    <group ref={ref} scale={0.9}>
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 0.8, 20]} />
        <meshStandardMaterial color="#d7deea" metalness={0.8} roughness={0.25} />
      </mesh>
      {panel(0.88)}
      {panel(-0.88)}
      <mesh position={[0, 0.56, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.26, 24, 1, true]} />
        <meshStandardMaterial color="#eef2f8" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial ref={beacon} color="#ff7a7a" emissive="#ff3b3b" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// ─── Camera: follows the scroll, drag to look around, leans with the mouse ───
function CameraRig({ scroll, anchors, drag, reduced }: { scroll: ScrollState; anchors: Anchors; drag: DragState; reduced: boolean }) {
  const { camera, gl, pointer } = useThree();
  const v = useMemo(
    () => ({
      look: new THREE.Vector3(0, 0, 0),
      posA: new THREE.Vector3(),
      posB: new THREE.Vector3(),
      lookA: new THREE.Vector3(),
      lookB: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      lk: new THREE.Vector3(),
      target: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      radial: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      right: new THREE.Vector3(),
      camUp: new THREE.Vector3(),
    }),
    [],
  );

  // drag to orbit (mouse / pen only, so touch keeps scrolling the page)
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      drag.down = true;
      drag.moved = 0;
      drag.x = e.clientX;
      drag.y = e.clientY;
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag.down) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.vYaw = -dx * 0.005;
      drag.vPitch = dy * 0.004;
    };
    const up = () => {
      drag.down = false;
      el.style.cursor = "";
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl, drag]);

  const pose = (i: number, outPos: THREE.Vector3, outLook: THREE.Vector3) => {
    const st = STATIONS[i];
    const { target, dir, radial, tangent, right, camUp } = v;
    const anchor = st.id === "hero" ? undefined : anchors[st.id];
    if (anchor) target.copy(anchor.position);
    else target.set(0, 0, 0);

    if (st.id === "hero" || !anchor) {
      dir.set(0.3, 0.45, 1);
    } else {
      // beside the planet, slightly sun-side, so its lit face shows and the sun glows behind
      radial.set(target.x, 0, target.z).normalize();
      tangent.set(-radial.z, 0, radial.x);
      dir.copy(tangent).multiplyScalar(st.side).addScaledVector(radial, -0.45).addScaledVector(UP, 0.32);
    }
    dir.normalize().applyAxisAngle(UP, drag.yaw);
    right.crossVectors(UP, dir).normalize();
    dir.applyAxisAngle(right, -drag.pitch).normalize();
    camUp.crossVectors(dir, right).normalize();

    const dist = st.dist * (scroll.mobile ? (st.id === "hero" ? 1.45 : 1.3) : 1);
    outPos.copy(target).addScaledVector(dir, dist);
    outLook.copy(target);
    if (scroll.mobile) outLook.addScaledVector(camUp, -st.shiftY * dist);
    else outLook.addScaledVector(right, st.shift * dist);
  };

  useFrame((_, dt) => {
    // drag inertia
    drag.yaw += drag.vYaw;
    drag.pitch = THREE.MathUtils.clamp(drag.pitch + drag.vPitch, -0.55, 0.75);
    const friction = Math.pow(0.0025, dt);
    drag.vYaw *= friction;
    drag.vPitch *= friction;

    const last = STATIONS.length - 1;
    const p = THREE.MathUtils.clamp(scroll.p, 0, last);

    // settle the look-around back to its default heading near the hero, so scrolling back to the
    // top always lands on the same framing (sun to the right of the name) even after a drag
    if (!drag.down) {
      const settle = THREE.MathUtils.clamp(1 - p, 0, 1);
      if (settle > 0) {
        const k3 = 1 - Math.exp(-dt * 2.2 * settle);
        drag.yaw *= 1 - k3;
        drag.pitch *= 1 - k3;
      }
    }
    const i = Math.min(Math.floor(p), last - 1);
    // hold at each stop for the first part of the scroll, then fly
    let raw = THREE.MathUtils.clamp((p - i - 0.3) / 0.7, 0, 1);
    pose(i + 1, v.posB, v.lookB);
    pose(i, v.posA, v.lookA); // second, so v.right is this stop's camera right
    if (i === 0) {
      // opening shot, driven by scroll: from deep space off to the side, sweep across and zoom
      // in on the solar system, then carry on to the first planet
      const away = reduced ? 0 : 1 - easeInOut(THREE.MathUtils.clamp(p / SWEEP_END, 0, 1));
      v.lookA.addScaledVector(v.right, -away * 60).addScaledVector(UP, -away * 16); // system sits big, to the right of the name
      v.posA.applyAxisAngle(UP, away * 1.25).multiplyScalar(1 + away * 0.6);
      v.posA.y += away * 9;
      raw = THREE.MathUtils.clamp((p - SWEEP_END) / (1 - SWEEP_END), 0, 1);
    }
    const f = raw * raw * (3 - 2 * raw);
    // planets move at different speeds, so arc over the system (and the sun) on longer flights
    const lift = 3 + v.posA.distanceTo(v.posB) * 0.3;
    v.pos.lerpVectors(v.posA, v.posB, f).addScaledVector(UP, Math.sin(Math.PI * f) * lift);
    v.lk.lerpVectors(v.lookA, v.lookB, f);

    // lean towards the mouse
    v.pos.addScaledVector(v.right, pointer.x * 0.5).addScaledVector(UP, pointer.y * 0.35);

    const k = 1 - Math.exp(-dt * 3.5);
    camera.position.lerp(v.pos, k);
    v.look.lerp(v.lk, k);
    camera.lookAt(v.look);
  });

  return null;
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene(props: UniverseProps) {
  const { scroll, low, reduced, onNavigate, hotSkill, onHotSkill, selectedArch, onSelectArch, activeStation } = props;
  const anchors = useMemo<Anchors>(() => ({}), []);
  const drag = useMemo<DragState>(() => ({ yaw: 0, pitch: 0, vYaw: 0, vPitch: 0, down: false, moved: 0, x: 0, y: 0 }), []);
  const [hovered, setHovered] = useState<PlanetId | null>(null);
  const orbits = useMemo(() => PLANETS.map((d) => ({ id: d.id, pts: circle(d.orbit, "xz", 220) })), []);

  const onHover = (id: PlanetId, on: boolean) => setHovered((h) => (on ? id : h === id ? null : h));
  const clickPlanet = (id: PlanetId) => {
    if (drag.moved < 6) onNavigate(id);
  };
  const selectMoon = (id: NodeId) => {
    if (drag.moved < 6) onSelectArch(id);
  };

  return (
    <>
      <color attach="background" args={["#02040b"]} />
      <ambientLight intensity={0.22} />
      <Stars radius={160} depth={90} count={low ? 2000 : 5000} factor={5} saturation={0.5} fade speed={reduced ? 0 : 0.5} />
      <Nebula low={low} />
      <Sun onClick={() => onNavigate("hero")} reduced={reduced} />
      {!low && <Sparkles count={90} scale={[16, 10, 16]} size={3} speed={reduced ? 0 : 0.25} color="#ffd59a" opacity={0.7} />}

      {orbits.map((o) => (
        <Line key={o.id} points={o.pts} color="#8cc8ff" lineWidth={1} transparent opacity={hovered === o.id || activeStation === o.id ? 0.35 : 0.1} />
      ))}
      <AsteroidBelt radius={22.5} width={1.6} count={low ? 180 : 600} reduced={reduced} />

      {PLANETS.map((def) => {
        const common = {
          def,
          anchors,
          reduced,
          focused: activeStation === def.id,
          hovered: hovered === def.id,
          showLabel: activeStation !== "hero",
          onHover,
          onClick: clickPlanet,
        };
        if (def.id === "skills")
          return (
            <Planet key={def.id} {...common}>
              <SkillBelts hot={hotSkill} onHot={onHotSkill} reduced={reduced} />
            </Planet>
          );
        if (def.id === "maifit")
          return (
            <Planet key={def.id} {...common}>
              <MoonRing
                ids={MAIN_NODES}
                radius={3.1}
                tilt={[0.32, 0, 0.12]}
                color="#8cc8ff"
                speed={0.22}
                selected={selectedArch}
                showLabels={activeStation === "maifit"}
                onSelect={selectMoon}
                reduced={reduced}
              />
              <MoonRing
                ids={EXT_NODES}
                radius={4.4}
                tilt={[-0.42, 0, -0.18]}
                color="#f2b33d"
                dashed
                speed={-0.16}
                selected={selectedArch}
                showLabels={activeStation === "maifit"}
                onSelect={selectMoon}
                reduced={reduced}
              />
            </Planet>
          );
        if (def.id === "organic")
          return (
            <Planet key={def.id} {...common}>
              <LittleMoon radius={2} tilt={0.5} color="#cfe9d8" reduced={reduced} />
            </Planet>
          );
        if (def.id === "contact") return <Planet key={def.id} {...common} body={<Satellite reduced={reduced} />} />;
        return <Planet key={def.id} {...common} />;
      })}

      <CameraRig scroll={scroll} anchors={anchors} drag={drag} reduced={reduced} />

      {!low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.9} luminanceSmoothing={0.25} />
          <ToneMapping />
          <Vignette offset={0.22} darkness={0.8} />
        </EffectComposer>
      )}
    </>
  );
}

/** The whole solar system: a fixed, full-screen canvas behind the page. */
export default function Universe(props: UniverseProps) {
  // drop resolution and bloom automatically when the GPU can't keep up (e.g. integrated graphics)
  const [degraded, setDegraded] = useState(false);
  const low = props.low || degraded;
  return (
    <Canvas
      dpr={low ? 1 : [1, 1.25]}
      camera={{ fov: 45, near: 0.1, far: 800, position: [12, 26, 70] }}
      gl={{ antialias: !low, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor onDecline={() => setDegraded(true)} onIncline={() => setDegraded(false)} flipflops={3} onFallback={() => setDegraded(true)}>
        <Scene {...props} low={low} />
      </PerformanceMonitor>
    </Canvas>
  );
}
