import { createNoise2D, mulberry32 } from "@/world/noise";

export interface Ring { d: string; r: number; heavy: boolean }

/**
 * Tree-ring cross-section as closed noisy paths. Deterministic, so the server and
 * the browser render identical markup. A wide gap between rings reads as a wet year.
 */
export function ringPaths(seed: number, count: number, size: number, wobble = 0.05): Ring[] {
  const noise = createNoise2D(seed);
  const rng = mulberry32(seed + 3);
  const out: Ring[] = [];
  const c = size / 2;
  let r = size * 0.012;
  const widths = Array.from({ length: count }, () => 0.5 + rng() * 1.4);
  const scale = (size * 0.485 - r) / widths.reduce((a, b) => a + b, 0);
  const STEPS = 72;
  widths.forEach((w, ring) => {
    r += w * scale;
    const pts: string[] = [];
    for (let i = 0; i < STEPS; i++) {
      const a = (i / STEPS) * Math.PI * 2;
      const nx = Math.cos(a) * 1.4;
      const ny = Math.sin(a) * 1.4;
      const k = 1 + noise(nx + ring * 0.015, ny) * wobble * Math.min(1, ring / 5 + 0.35) + noise(nx * 3 + 40, ny * 3) * wobble * 0.3;
      pts.push(`${(c + Math.cos(a) * r * k).toFixed(1)} ${(c + Math.sin(a) * r * k).toFixed(1)}`);
    }
    out.push({ d: `M${pts.join("L")}Z`, r, heavy: w > 1.45 });
  });
  return out;
}
