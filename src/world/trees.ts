import * as THREE from "three";
import { mulberry32 } from "./noise";

/**
 * Procedural Algerian species. Each tree is a skeleton of tapered branches plus a
 * point cloud of individual leaves, so canopies read like stippled botanical plates
 * instead of low-poly blobs.
 */

export type SpeciesId = "oak" | "pine" | "acacia" | "almond" | "cedar" | "palm" | "snag";

export const SPECIES: SpeciesId[] = ["oak", "pine", "acacia", "almond", "cedar", "palm"];

type V = [number, number, number];
interface Seg { a: V; b: V; ra: number; rb: number; order: number }
interface Leaf { p: V; c: V; s: number }

export interface TreeTemplate { segs: Seg[]; leaves: Leaf[]; height: number }

const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const hex = (h: number): V => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const mix = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

interface Recipe {
  trunk: number; trunkRadius: number; lean: number; depth: number; kids: number; spread: number;
  ratio: number; up: number; flatten: number; leafRadius: number; leafSpread: V; leaves: number;
  dark: number; light: number; bloom?: number; bloomChance?: number; leafSize: number;
}

const RECIPES: Record<Exclude<SpeciesId, "cedar" | "palm">, Recipe> = {
  // Dead tree: bare, twisted, no leaves at all
  snag: { trunk: 3.6, trunkRadius: 0.3, lean: 0.34, depth: 3, kids: 2, spread: 1.05, ratio: 0.76, up: 0.18, flatten: 0.9, leafRadius: 0, leafSpread: [0, 0, 0], leaves: 0, dark: 0, light: 0, leafSize: 0 },
  // Holm oak: short trunk, dense rounded crown
  oak: { trunk: 3.4, trunkRadius: 0.42, lean: 0.08, depth: 4, kids: 3, spread: 0.72, ratio: 0.74, up: 0.32, flatten: 1, leafRadius: 1.75, leafSpread: [1, 0.72, 1], leaves: 15, dark: 0x1e4a2a, light: 0x7fa648, leafSize: 1 },
  // Aleppo pine: leaning trunk, airy irregular crown
  pine: { trunk: 6.4, trunkRadius: 0.34, lean: 0.22, depth: 4, kids: 2, spread: 0.84, ratio: 0.72, up: 0.42, flatten: 0.85, leafRadius: 1.35, leafSpread: [1, 0.5, 1], leaves: 20, dark: 0x173f2f, light: 0x5e9150, leafSize: 0.85 },
  // Umbrella acacia: forked trunk, flat parasol with mimosa-yellow blossom
  acacia: { trunk: 2.8, trunkRadius: 0.27, lean: 0.14, depth: 4, kids: 2, spread: 0.92, ratio: 0.8, up: 0.2, flatten: 0.34, leafRadius: 1.7, leafSpread: [1.2, 0.26, 1.2], leaves: 15, dark: 0x4d7030, light: 0xa8bf52, bloom: 0xf2c230, bloomChance: 0.2, leafSize: 0.8 },
  // Almond: small tree, a cloud of oleander-pink blossom
  almond: { trunk: 2.4, trunkRadius: 0.24, lean: 0.12, depth: 4, kids: 3, spread: 0.8, ratio: 0.72, up: 0.26, flatten: 0.9, leafRadius: 1.25, leafSpread: [1, 0.8, 1], leaves: 12, dark: 0xd8497a, light: 0xf8b8c9, bloom: 0xfff0ee, bloomChance: 0.28, leafSize: 1 },
};

function perturb(dir: V, angle: number, r: () => number, up: number, flatten: number): V {
  const axis = norm([r() - 0.5, (r() - 0.5) * 0.3, r() - 0.5]);
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), angle * (0.7 + r() * 0.6));
  const v = new THREE.Vector3(...dir).applyQuaternion(q);
  v.y = v.y * flatten + up;
  v.normalize();
  return [v.x, v.y, v.z];
}

function branching(recipe: Recipe, seed: number, leafScale: number): TreeTemplate {
  const r = mulberry32(seed);
  const segs: Seg[] = [];
  const leaves: Leaf[] = [];
  const dark = hex(recipe.dark);
  const light = hex(recipe.light);
  const maxDepth = recipe.depth;
  let height = 0;

  const addLeaves = (tip: V) => {
    if (recipe.leaves === 0) return;
    const n = Math.max(2, Math.round(recipe.leaves * leafScale));
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const u = r() * 2 - 1;
      const rad = recipe.leafRadius * Math.cbrt(r());
      const s = Math.sqrt(1 - u * u);
      const off: V = [Math.cos(a) * s * rad * recipe.leafSpread[0], u * rad * recipe.leafSpread[1], Math.sin(a) * s * rad * recipe.leafSpread[2]];
      const tone = Math.min(1, Math.max(0, (u + 1) * 0.42 + r() * 0.3));
      let c = mix(dark, light, tone);
      if (recipe.bloom && r() < (recipe.bloomChance ?? 0)) c = hex(recipe.bloom);
      const p = add(tip, off);
      height = Math.max(height, p[1]);
      leaves.push({ p, c, s: recipe.leafSize * (0.7 + r() * 0.6) });
    }
    // A few large dark points give each cluster real volume from any angle
    for (let i = 0; i < 2; i++) {
      const p = add(tip, [(r() - 0.5) * recipe.leafRadius * 0.9, (r() - 0.7) * recipe.leafRadius * 0.7, (r() - 0.5) * recipe.leafRadius * 0.9]);
      leaves.push({ p, c: mix(dark, [0.05, 0.1, 0.06], 0.35), s: recipe.leafSize * 3.4 });
    }
  };

  const grow = (from: V, dir: V, len: number, rad: number, depth: number) => {
    const to = add(from, dir, len);
    const level = maxDepth - depth;
    if (level <= 3) segs.push({ a: from, b: to, ra: rad, rb: rad * 0.68, order: level / (maxDepth + 1) });
    if (depth === 0) return addLeaves(to);
    const kids = recipe.kids + (r() > 0.72 ? 1 : 0);
    for (let i = 0; i < kids; i++) {
      grow(to, perturb(dir, recipe.spread, r, recipe.up, recipe.flatten), len * recipe.ratio * (0.82 + r() * 0.34), rad * 0.66, depth - 1);
    }
  };

  grow([0, 0, 0], norm([(r() - 0.5) * recipe.lean * 2, 1, (r() - 0.5) * recipe.lean * 2]), recipe.trunk, recipe.trunkRadius * 0.86, maxDepth);
  return { segs, leaves, height };
}

function cedar(seed: number, leafScale: number): TreeTemplate {
  const r = mulberry32(seed);
  const segs: Seg[] = [];
  const leaves: Leaf[] = [];
  const H = 13;
  const dark = hex(0x123a33);
  const light = hex(0x5d8f76);
  segs.push({ a: [0, 0, 0], b: [0, H * 0.55, 0], ra: 0.46, rb: 0.3, order: 0 });
  segs.push({ a: [0, H * 0.55, 0], b: [0, H, 0], ra: 0.3, rb: 0.05, order: 0.2 });
  const tiers = 7;
  for (let t = 0; t < tiers; t++) {
    const k = t / (tiers - 1);
    const y = H * (0.26 + 0.7 * k);
    const len = (1 - k) * 4.8 + 0.8;
    const boughs = 6 - Math.round(k * 2);
    for (let b = 0; b < boughs; b++) {
      const a = (b / boughs) * Math.PI * 2 + r() * 0.8;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      const tip: V = [dx * len, y - 0.1 - r() * 0.35, dz * len];
      segs.push({ a: [0, y, 0], b: tip, ra: 0.11, rb: 0.03, order: 0.3 + k * 0.4 });
      const n = Math.round(46 * leafScale * (1 - k * 0.5));
      for (let i = 0; i < n; i++) {
        const along = Math.sqrt(r());
        const sideA = r() * Math.PI * 2;
        const sideR = 0.3 + (1 - along * 0.5) * r() * len * 0.42;
        const p: V = [dx * len * along + Math.cos(sideA) * sideR, y - along * 0.3 + (r() - 0.5) * 0.3, dz * len * along + Math.sin(sideA) * sideR];
        leaves.push({ p, c: mix(dark, light, r() * 0.55 + 0.45 * Math.max(0, (p[1] - y + 0.3) * 1.5)), s: 0.72 + r() * 0.4 });
      }
    }
  }
  return { segs, leaves, height: H };
}

function palm(seed: number, leafScale: number): TreeTemplate {
  const r = mulberry32(seed);
  const segs: Seg[] = [];
  const leaves: Leaf[] = [];
  const H = 11;
  const bend = 0.8 + r() * 1.2;
  const pts = 6;
  let prev: V = [0, 0, 0];
  for (let i = 1; i <= pts; i++) {
    const k = i / pts;
    const next: V = [bend * k * k, H * k, 0];
    segs.push({ a: prev, b: next, ra: 0.36 - 0.1 * (k - 1 / pts), rb: 0.36 - 0.1 * k, order: (k - 1 / pts) * 0.6 });
    prev = next;
  }
  const dark = hex(0x2f6132);
  const light = hex(0xa5c257);
  const fronds = 15;
  for (let f = 0; f < fronds; f++) {
    const a = (f / fronds) * Math.PI * 2 + r() * 0.3;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const lift = 0.5 + r() * 1.1;
    const len = 4.2 + r() * 1.6;
    const n = Math.round(46 * leafScale);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const out = len * t;
      const y = lift * 2.3 * t - 2.6 * t * t * t * 1.4;
      const side = (i % 2 ? 1 : -1) * (0.15 + 0.75 * Math.sin(Math.PI * Math.min(1, t * 1.1)));
      const p: V = [prev[0] + dx * out - dz * side, prev[1] + y - Math.abs(side) * 0.25, prev[2] + dz * out + dx * side];
      leaves.push({ p, c: mix(dark, light, r() * 0.8), s: 0.68 + r() * 0.3 });
    }
  }
  return { segs, leaves, height: H + 2 };
}

export function buildTemplate(id: SpeciesId, leafScale: number, seed = 11): TreeTemplate {
  if (id === "cedar") return cedar(seed, leafScale);
  if (id === "palm") return palm(seed, leafScale);
  return branching(RECIPES[id], seed + id.length * 31, leafScale);
}

/* ------------------------------------------------------------------ */

const growth = /* glsl */ `
  attribute vec3 aOffset;
  attribute vec3 aInst; // x rotation, y scale, z seed
  attribute float aBorn;
  uniform float uFront, uTime, uWind, uFirst;

  float growthOf(float z, float seed) {
    if (aBorn < -1.5) return 1.0 - clamp((z - uFront) / 26.0, 0.0, 1.0);
    if (aBorn < 0.0) return uFirst;
    if (aBorn > 0.0) return clamp((uTime - aBorn) / 2.6, 0.0, 1.0);
    return clamp((z - uFront) / 34.0 + seed * 0.18 - 0.18, 0.0, 1.0);
  }
  vec3 place(vec3 p) {
    float c = cos(aInst.x), s = sin(aInst.x);
    p = vec3(c * p.x - s * p.z, p.y, s * p.x + c * p.z) * aInst.y;
    return p;
  }
  vec3 sway(vec3 p, float h) {
    float t = uTime * (1.1 + aInst.z * 0.6) + aOffset.x * 0.17 + aOffset.z * 0.11;
    float a = (sin(t) + 0.5 * sin(t * 2.3 + 1.7)) * uWind * h * h * 0.016;
    return p + vec3(a, 0.0, a * 0.6);
  }
`;

const fade = /* glsl */ `
  uniform vec3 uFog;
  uniform float uFogNear, uFogFar;
`;

export interface TreeUniforms {
  uFront: { value: number }; uTime: { value: number }; uWind: { value: number };
  uFog: { value: THREE.Color }; uFogNear: { value: number }; uFogFar: { value: number };
  uSunCol: { value: THREE.Color }; uAmb: { value: THREE.Color }; uSun: { value: THREE.Vector3 };
  uPointScale: { value: number }; uFirst: { value: number }; uLeafBoost: { value: number };
}

export interface TreeDraw {
  group: THREE.Group;
  setInstance(i: number, x: number, y: number, z: number, rot: number, scale: number, seed: number, born: number): void;
  setCount(n: number): void;
  dispose(): void;
}

export function createTreeDraw(t: TreeTemplate, capacity: number, uniforms: TreeUniforms): TreeDraw {
  // Instance buffers are shared between the branch mesh and the leaf cloud
  const offsets = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
  const inst = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
  const born = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
  offsets.setUsage(THREE.DynamicDrawUsage);
  inst.setUsage(THREE.DynamicDrawUsage);
  born.setUsage(THREE.DynamicDrawUsage);

  /* Branches: four-sided tapered prisms */
  const V_PER = 8;
  const pos = new Float32Array(t.segs.length * V_PER * 3);
  const nor = new Float32Array(t.segs.length * V_PER * 3);
  const base = new Float32Array(t.segs.length * V_PER * 3);
  const ord = new Float32Array(t.segs.length * V_PER);
  const idx: number[] = [];
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const u = new THREE.Vector3();
  const v = new THREE.Vector3();
  t.segs.forEach((s, si) => {
    tmpA.set(...s.a);
    tmpB.set(...s.b);
    axis.subVectors(tmpB, tmpA).normalize();
    u.set(0.31, 1, 0.17).cross(axis).normalize();
    v.crossVectors(axis, u).normalize();
    for (let e = 0; e < 2; e++) {
      const c = e === 0 ? tmpA : tmpB;
      const r = e === 0 ? s.ra : s.rb;
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2;
        const nx = u.x * Math.cos(a) + v.x * Math.sin(a);
        const ny = u.y * Math.cos(a) + v.y * Math.sin(a);
        const nz = u.z * Math.cos(a) + v.z * Math.sin(a);
        const vi = si * V_PER + e * 4 + k;
        pos.set([c.x + nx * r, c.y + ny * r, c.z + nz * r], vi * 3);
        nor.set([nx, ny, nz], vi * 3);
        base.set([tmpA.x, tmpA.y, tmpA.z], vi * 3);
        ord[vi] = s.order;
      }
    }
    for (let k = 0; k < 4; k++) {
      const a0 = si * V_PER + k;
      const a1 = si * V_PER + ((k + 1) % 4);
      const b0 = a0 + 4;
      const b1 = a1 + 4;
      idx.push(a0, b0, a1, a1, b0, b1);
    }
  });

  const branchGeo = new THREE.InstancedBufferGeometry();
  branchGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  branchGeo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  branchGeo.setAttribute("aBase", new THREE.BufferAttribute(base, 3));
  branchGeo.setAttribute("aOrder", new THREE.BufferAttribute(ord, 1));
  branchGeo.setIndex(idx);
  branchGeo.setAttribute("aOffset", offsets);
  branchGeo.setAttribute("aInst", inst);
  branchGeo.setAttribute("aBorn", born);

  const branchMat = new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      ${growth}
      attribute vec3 aBase; attribute float aOrder;
      varying vec3 vN; varying vec3 vW; varying float vH;
      void main() {
        float g = growthOf(aOffset.z, aInst.z);
        float k = smoothstep(aOrder, min(1.0, aOrder + 0.42), g);
        vec3 p = aBase + (position - aBase) * k;
        p *= mix(0.08, 1.0, g * g * (3.0 - 2.0 * g));
        float h = p.y;
        p = place(p);
        p = sway(p, h);
        vec3 w = p + aOffset;
        if (g <= 0.0) w = vec3(0.0, -1000.0, 0.0);
        float c = cos(aInst.x), s = sin(aInst.x);
        vN = vec3(c * normal.x - s * normal.z, normal.y, s * normal.x + c * normal.z);
        vW = w; vH = h;
        gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      ${fade}
      uniform vec3 uSunCol, uAmb, uSun;
      varying vec3 vN; varying vec3 vW; varying float vH;
      void main() {
        vec3 alb = mix(vec3(0.20, 0.13, 0.08), vec3(0.40, 0.29, 0.19), clamp(vH * 0.12, 0.0, 1.0));
        vec3 lit = alb * (uAmb + uSunCol * max(dot(normalize(vN), uSun), 0.0));
        float d = length(vW - cameraPosition);
        float f = smoothstep(uFogNear, uFogFar, d);
        gl_FragColor = vec4(mix(lit, uFog, f * 0.9), 1.0 - smoothstep(uFogFar * 0.85, uFogFar * 1.1, d));
      }`,
  });
  const branches = new THREE.Mesh(branchGeo, branchMat);
  branches.frustumCulled = false;
  branches.renderOrder = 2;

  /* Leaves: instanced GL points */
  const lp = new Float32Array(t.leaves.length * 3);
  const lc = new Float32Array(t.leaves.length * 3);
  const ls = new Float32Array(t.leaves.length * 2);
  t.leaves.forEach((l, i) => {
    lp.set(l.p, i * 3);
    lc.set(l.c, i * 3);
    ls[i * 2] = l.s;
    ls[i * 2 + 1] = (i * 12.9898) % 1;
  });
  const leafGeo = new THREE.InstancedBufferGeometry();
  leafGeo.setAttribute("position", new THREE.BufferAttribute(lp, 3));
  leafGeo.setAttribute("aColor", new THREE.BufferAttribute(lc, 3));
  leafGeo.setAttribute("aLeaf", new THREE.BufferAttribute(ls, 2));
  leafGeo.setAttribute("aOffset", offsets);
  leafGeo.setAttribute("aInst", inst);
  leafGeo.setAttribute("aBorn", born);

  const leafMat = new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    transparent: true,
    vertexShader: /* glsl */ `
      ${growth}
      uniform float uPointScale, uLeafBoost;
      uniform vec3 uSunCol, uAmb;
      attribute vec3 aColor; attribute vec2 aLeaf;
      varying vec3 vC; varying float vA; varying float vRot; varying float vFog;
      uniform vec3 uFog; uniform float uFogNear, uFogFar;
      void main() {
        float g = growthOf(aOffset.z, aInst.z);
        float k = smoothstep(0.42 + aLeaf.y * 0.34, 1.0, g);
        vec3 p = position * mix(0.08, 1.0, g * g * (3.0 - 2.0 * g));
        float h = p.y;
        p = place(p);
        p = sway(p, h);
        p.x += sin(uTime * 2.4 + aLeaf.y * 40.0) * 0.035 * uWind;
        vec4 mv = viewMatrix * vec4(p + aOffset, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = uPointScale * uLeafBoost * aLeaf.x * aInst.y * k / max(1.0, -mv.z);
        gl_PointSize = clamp(size, 0.0, 30.0);
        if (k <= 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        float d = -mv.z;
        vFog = smoothstep(uFogNear, uFogFar, d);
        vA = 1.0 - smoothstep(uFogFar * 0.85, uFogFar * 1.1, d);
        vC = aColor * (uAmb * 1.1 + uSunCol * 0.72);
        vRot = aLeaf.y * 6.283;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uFog;
      varying vec3 vC; varying float vA; varying float vRot; varying float vFog;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float cs = cos(vRot), sn = sin(vRot);
        vec2 q = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
        if (q.x * q.x * 4.0 + q.y * q.y * 2.05 > 0.5) discard;
        gl_FragColor = vec4(mix(vC, uFog, vFog * 0.92), vA);
      }`,
  });
  const leaves = new THREE.Points(leafGeo, leafMat);
  leaves.frustumCulled = false;
  leaves.renderOrder = 3;
  leaves.visible = t.leaves.length > 0;

  const group = new THREE.Group();
  group.add(branches, leaves);

  return {
    group,
    setInstance(i, x, y, z, rot, scale, seed, b) {
      offsets.setXYZ(i, x, y, z);
      inst.setXYZ(i, rot, scale, seed);
      born.setX(i, b);
      offsets.needsUpdate = true;
      inst.needsUpdate = true;
      born.needsUpdate = true;
    },
    setCount(n) {
      branchGeo.instanceCount = n;
      leafGeo.instanceCount = n;
    },
    dispose() {
      branchGeo.dispose();
      leafGeo.dispose();
      branchMat.dispose();
      leafMat.dispose();
    },
  };
}
