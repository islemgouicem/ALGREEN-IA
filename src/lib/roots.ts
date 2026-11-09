import { createNoise2D, mulberry32 } from "@/world/noise";

export interface Root { d: string; w: number }

/** Deterministic root system: one main root to each target, with side rootlets. */
export function rootSystem(targets: [number, number][], seed = 9): Root[] {
  const noise = createNoise2D(seed);
  const r = mulberry32(seed + 1);
  const out: Root[] = [];

  const trace = (x0: number, y0: number, x1: number, y1: number, wob: number, nz: number) => {
    const N = 16;
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      // Roots leave the base sideways, then dive
      const ease = 1 - Math.pow(1 - t, 1.7);
      const x = x0 + (x1 - x0) * ease + noise(t * 3.4, nz) * wob * Math.sin(Math.PI * t);
      const y = y0 + (y1 - y0) * t * t * 0.45 + (y1 - y0) * t * 0.55 + noise(nz, t * 3.1) * wob * 0.42 * Math.sin(Math.PI * t);
      pts.push([x, y]);
    }
    return pts;
  };
  const dOf = (pts: [number, number][]) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}`;

  const bx = 800;
  targets.forEach(([tx, ty], i) => {
    const main = trace(bx + (tx - bx) * 0.05, 0, tx, ty, 58, i * 9 + 1);
    out.push({ d: dOf(main), w: 7 });
    for (let k = 0; k < 7; k++) {
      const at = 3 + Math.floor(r() * 11);
      const [sx, sy] = main[at];
      const dir = r() > 0.5 ? 1 : -1;
      const len = 60 + r() * 150;
      out.push({ d: dOf(trace(sx, sy, sx + dir * len, sy + 40 + r() * 120, 18, k * 3 + i + 30)), w: 2.2 });
    }
  });
  return out;
}

/** Grass tufts along the top of the soil, as one silhouette path. */
export function grassPath(seed: number, width: number, height: number, step: number) {
  const r = mulberry32(seed);
  let d = `M0 ${height}`;
  for (let x = 0; x < width; x += step) {
    const h = height * (0.25 + r() * 0.75);
    const lean = (r() - 0.5) * step * 1.4;
    d += `L${x.toFixed(0)} ${height}L${(x + step / 2 + lean).toFixed(1)} ${(height - h).toFixed(1)}L${(x + step).toFixed(0)} ${height}`;
  }
  return `${d}L${width} ${height}Z`;
}

export function pebbles(seed: number, count: number, w: number, h: number) {
  const r = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    cx: +(r() * w).toFixed(0), cy: +(40 + r() * (h - 40)).toFixed(0), rx: +(2 + r() * 9).toFixed(1), ry: +(1.5 + r() * 4).toFixed(1), o: +(0.12 + r() * 0.3).toFixed(2),
  }));
}
