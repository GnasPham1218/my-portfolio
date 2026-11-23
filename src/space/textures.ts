import * as THREE from "three";

/** Small seeded random generator so planets look the same on every visit. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d")! };
}

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Banded gas-giant style surface with storms, drawn on a canvas. */
export function planetTexture([dark, mid, light]: [string, string, string], seed: number) {
  const W = 1024;
  const H = 512;
  const rnd = seeded(seed * 9973);
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, W, H);

  const phase = rnd() * 10;
  for (let y = 0; y < H; y++) {
    const v = Math.sin(y * 0.045 + Math.sin(y * 0.011 + phase) * 3.2 + phase) * 0.5 + 0.5;
    ctx.globalAlpha = 0.25 + v * 0.65;
    ctx.fillStyle = v > 0.72 ? light : mid;
    ctx.fillRect(0, y, W, 1);
  }
  // streaks and storms
  for (let i = 0; i < 260; i++) {
    ctx.globalAlpha = 0.05 + rnd() * 0.12;
    ctx.fillStyle = rnd() > 0.5 ? light : dark;
    ctx.beginPath();
    ctx.ellipse(rnd() * W, rnd() * H, 20 + rnd() * 120, 2 + rnd() * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 3; i++) {
    const x = rnd() * W;
    const y = H * (0.25 + rnd() * 0.5);
    const r = 14 + rnd() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
    g.addColorStop(0, light);
    g.addColorStop(0.5, mid);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.6, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // soften everything
  ctx.globalAlpha = 1;
  ctx.filter = "blur(2px)";
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = "none";
  return toTexture(canvas);
}

/** Soft round glow with a bright core. */
export function glowTexture() {
  const S = 128;
  const { canvas, ctx } = makeCanvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.15, "rgba(255,255,255,0.75)");
  g.addColorStop(0.45, "rgba(255,255,255,0.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return toTexture(canvas);
}

/** Cloudy blob for nebulae (tinted by the material colour). */
export function nebulaTexture(seed = 3) {
  const S = 512;
  const rnd = seeded(seed);
  const { canvas, ctx } = makeCanvas(S, S);
  for (let i = 0; i < 40; i++) {
    const x = S / 2 + (rnd() - 0.5) * S * 0.5;
    const y = S / 2 + (rnd() - 0.5) * S * 0.5;
    const r = S * (0.08 + rnd() * 0.22);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${0.08 + rnd() * 0.12})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  return toTexture(canvas);
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Loads an SVG icon with an explicit size. The site's icons only have a viewBox,
 * and Firefox cannot draw such SVGs onto a canvas.
 */
async function loadIcon(url: string): Promise<HTMLImageElement> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`icon ${url}: ${res.status}`);
  const text = await res.text();
  const sized = /<svg[^>]*\swidth=/.test(text) ? text : text.replace("<svg", '<svg width="128" height="128"');
  const blobUrl = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = blobUrl;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/** White rounded tile with a coloured rim and the skill logo; the logo is filled in once it loads. */
export function iconTile(url: string, color: string, fallbackLetter: string) {
  const S = 128;
  const { canvas, ctx } = makeCanvas(S, S);
  const texture = toTexture(canvas);
  const draw = (img: HTMLImageElement | null) => {
    ctx.clearRect(0, 0, S, S);
    roundRectPath(ctx, 8, 8, 112, 112, 30);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = color;
    ctx.stroke();
    if (img) {
      ctx.drawImage(img, 30, 30, 68, 68);
    } else {
      ctx.fillStyle = color;
      ctx.font = '800 54px "Be Vietnam Pro", system-ui, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fallbackLetter, S / 2, S / 2 + 4);
    }
    texture.needsUpdate = true;
  };
  draw(null);
  loadIcon(url)
    .then((img) => {
      draw(img);
      try {
        ctx.getImageData(0, 0, 1, 1); // throws if the browser marked the canvas unsafe for WebGL
      } catch {
        draw(null);
      }
    })
    .catch(() => {});
  return texture;
}
