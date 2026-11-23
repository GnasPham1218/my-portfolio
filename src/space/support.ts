// No `three` import here, so the main bundle can check support without downloading Three.js.

export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

export const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Phones and low-core machines get fewer stars and no bloom. */
export function isLowPower(): boolean {
  const small = window.matchMedia?.("(max-width: 760px)").matches ?? false;
  const cores = navigator.hardwareConcurrency ?? 8;
  return small || cores <= 4;
}
