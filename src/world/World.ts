import * as THREE from "three";
import { createNoise2D, mulberry32, smoothstep } from "./noise";
import { buildTemplate, createTreeDraw, SPECIES, type SpeciesId, type TreeDraw, type TreeUniforms } from "./trees";
import { MOODS, STORM, type WorldState } from "./keys";

THREE.ColorManagement.enabled = false;

const LENGTH = 460;
const WIDTH = 190;
const Z_START = 70;

const n = createNoise2D(19);

export const pathX = (z: number) => Math.sin(z * 0.012) * 14 + Math.sin(z * 0.031 + 1) * 5 - (Math.sin(1) * 5 + 0);

export function heightAt(x: number, z: number) {
  const r1 = 1 - Math.abs(n(x * 0.016 + 3, z * 0.026));
  const r2 = 1 - Math.abs(n(x * 0.041 - 9, z * 0.06 + 4));
  const dune = r1 * r1 * 10.5 + r2 * r2 * 2.2;
  const hill = (n(x * 0.011, z * 0.011) + 0.5 * n(x * 0.03 + 7, z * 0.03)) * 9 + 4;
  const k = smoothstep(-20, -130, z);
  const raw = dune * (1 - k) + hill * k;
  const corridor = smoothstep(6, 44, Math.abs(x - pathX(z)));
  return raw * (0.34 + 0.66 * corridor);
}

export interface Quality {
  grid: [number, number]; leafScale: number; perSpecies: number; grass: number; flowers: number;
  rain: number; motes: number; dpr: number;
}

export function pickQuality(): Quality {
  const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (coarse || cores <= 4) {
    return { grid: [90, 210], leafScale: 0.5, perSpecies: 40, grass: 12000, flowers: 2400, rain: 900, motes: 180, dpr: Math.min(window.devicePixelRatio, 1.4) };
  }
  return { grid: [190, 460], leafScale: 1, perSpecies: 90, grass: 34000, flowers: 6000, rain: 1600, motes: 520, dpr: Math.min(window.devicePixelRatio, 1.75) };
}

const PLANT_CAPACITY = 12;

export class World {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  private q: Quality;
  private treeU: TreeUniforms;
  private terrainU: Record<string, THREE.IUniform>;
  private grassU: Record<string, THREE.IUniform>;
  private rainU: Record<string, THREE.IUniform>;
  private moteU: Record<string, THREE.IUniform>;
  private draws: { id: SpeciesId; draw: TreeDraw; base: number; planted: number; peak: number }[] = [];
  private disposables: { dispose(): void }[] = [];
  private pointer = new THREE.Vector2();
  private pointerS = new THREE.Vector2();
  private time = 0;
  private plantedTotal = 0;
  private look = new THREE.Vector3();
  private slowFrames = 0;
  private frames = 0;

  constructor(canvas: HTMLCanvasElement, q: Quality) {
    this.q = q;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: q.dpr < 1.5, powerPreference: "high-performance", premultipliedAlpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setPixelRatio(q.dpr);
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.4, 340);

    const shared = {
      uFog: { value: new THREE.Color(0xb4dcf2) },
      uFogNear: { value: 70 },
      uFogFar: { value: 230 },
      uSunCol: { value: new THREE.Color(0xffffff) },
      uAmb: { value: new THREE.Color(0x888888) },
      uSun: { value: new THREE.Vector3(0.5, 0.4, 0.4).normalize() },
      uFront: { value: 90 },
      uTime: { value: 0 },
      uWind: { value: 1 },
    };
    this.treeU = { ...shared, uPointScale: { value: 260 }, uFirst: { value: 0 }, uLeafBoost: { value: 1 / Math.sqrt(q.leafScale) } };
    this.terrainU = { ...shared, uWet: { value: 0 } };
    this.grassU = { ...shared };
    this.rainU = { uTime: shared.uTime, uRain: { value: 0 }, uCam: { value: new THREE.Vector3() } };
    this.moteU = { uTime: shared.uTime, uCam: this.rainU.uCam, uPetals: { value: 0 }, uNight: { value: 0 }, uPx: { value: 1 } };

    this.buildTerrain();
    this.buildTrees();
    this.buildGrass();
    this.buildFlowers();
    this.buildRain();
    this.buildMotes();
    this.resize();
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }

  private buildTerrain() {
    const [gx, gz] = this.q.grid;
    const geo = new THREE.PlaneGeometry(WIDTH, LENGTH, gx, gz);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, Z_START - LENGTH / 2);
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
    geo.computeVertexNormals();
    const mat = new THREE.ShaderMaterial({
      uniforms: this.terrainU,
      transparent: true,
      vertexShader: /* glsl */ `
        varying vec3 vW; varying vec3 vN;
        void main() { vW = position; vN = normal; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uFront, uWet, uFogNear, uFogFar;
        uniform vec3 uSun, uSunCol, uAmb, uFog;
        varying vec3 vW; varying vec3 vN;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
        }
        float fbm(vec2 p) { return vn(p) * 0.6 + vn(p * 2.1 + 3.1) * 0.28 + vn(p * 4.3 + 7.7) * 0.12; }
        void main() {
          vec3 n = normalize(vN);
          float warp = vn(vW.xz * 0.2) * 7.0;
          float rip = sin(vW.x * 0.55 + vW.z * 1.5 + warp);
          vec3 nn = normalize(n + vec3(rip * 0.05, 0.0, rip * 0.11));
          float pat = fbm(vW.xz * 0.045);
          vec3 sand = mix(vec3(0.73, 0.49, 0.28), vec3(0.97, 0.80, 0.56), smoothstep(0.25, 0.8, pat + n.y * 0.25 - 0.1));
          float f = smoothstep(0.0, 26.0, vW.z - uFront + (pat - 0.5) * 46.0);
          float pat2 = fbm(vW.xz * 0.11 + 11.0);
          vec3 grass = mix(vec3(0.12, 0.27, 0.13), vec3(0.42, 0.56, 0.2), pat2);
          grass = mix(grass, vec3(0.69, 0.68, 0.24), smoothstep(0.58, 0.8, fbm(vW.xz * 0.024 + 41.0)) * 0.5);
          vec3 alb = mix(sand, grass, f);
          alb *= 1.0 - uWet * 0.2;
          float ndl = max(dot(nn, uSun), 0.0);
          vec3 lit = alb * (uAmb + uSunCol * ndl);
          float d = length(vW - cameraPosition);
          lit = mix(lit, uFog, smoothstep(uFogNear, uFogFar, d) * 0.88);
          lit += (hash(gl_FragCoord.xy) - 0.5) * 0.04;
          gl_FragColor = vec4(lit, 1.0 - smoothstep(uFogFar * 0.8, uFogFar * 1.05, d));
        }`,
    });
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false;
    m.renderOrder = 1;
    this.scene.add(m);
    this.disposables.push(geo, mat);
  }

  private buildTrees() {
    const r = mulberry32(2024);
    const cap = this.q.perSpecies;
    const placements: Record<SpeciesId, [number, number, number][]> = { oak: [], pine: [], acacia: [], almond: [], cedar: [], palm: [] };

    // The first tree. It stands alone in the opening chapter.
    placements.oak.push([pathX(4) + 3.2, 4, 1.4]);

    const pick = (z: number): SpeciesId => {
      const t = r();
      if (z > -70) return t < 0.4 ? "acacia" : t < 0.72 ? "palm" : t < 0.9 ? "oak" : "almond";
      if (z > -190) return t < 0.36 ? "pine" : t < 0.66 ? "oak" : t < 0.86 ? "almond" : "acacia";
      return t < 0.46 ? "cedar" : t < 0.74 ? "pine" : t < 0.92 ? "oak" : "almond";
    };

    let safety = 0;
    while (safety++ < cap * 90) {
      const z = 2 - Math.pow(r(), 0.85) * 370;
      const side = r() > 0.5 ? 1 : -1;
      const off = 9 + Math.pow(r(), 1.7) * 74;
      const x = pathX(z) + side * off;
      const id = pick(z);
      if (placements[id].length < cap) placements[id].push([x, z, 0.66 + r() * 0.6]);
      if (SPECIES.every((s) => placements[s].length >= cap)) break;
    }

    SPECIES.forEach((id, si) => {
      const tpl = buildTemplate(id, this.q.leafScale, 11 + si);
      const list = placements[id];
      const draw = createTreeDraw(tpl, list.length + PLANT_CAPACITY, this.treeU);
      list.forEach(([x, z, s], i) => {
        draw.setInstance(i, x, heightAt(x, z) - 0.15, z, r() * 6.28, s, r(), id === "oak" && i === 0 ? -1 : 0);
      });
      draw.setCount(list.length);
      this.scene.add(draw.group);
      this.draws.push({ id, draw, base: list.length, planted: 0, peak: 0 });
    });
  }

  private buildGrass() {
    const count = this.q.grass;
    const r = mulberry32(55);
    const geo = new THREE.InstancedBufferGeometry();
    // One tapered blade: base pair, mid pair, tip
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
      -0.5, 0, 0, 0.5, 0, 0, -0.34, 0.55, 0, 0.34, 0.55, 0, 0, 1, 0,
    ]), 3));
    geo.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4]);
    const off = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const z = 10 - r() * 370;
      const spread = 2 + Math.pow(r(), 1.6) * 34;
      const x = pathX(z) + (r() > 0.5 ? 1 : -1) * spread * r();
      off.set([x, heightAt(x, z), z, r()], i * 4);
    }
    geo.setAttribute("aO", new THREE.InstancedBufferAttribute(off, 4));
    geo.instanceCount = count;
    const mat = new THREE.ShaderMaterial({
      uniforms: this.grassU,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec4 aO;
        uniform float uFront, uTime, uWind, uFogNear, uFogFar;
        uniform vec3 uFog, uSunCol, uAmb;
        varying vec3 vC; varying float vA;
        void main() {
          float g = clamp((aO.z - uFront) / 22.0 - 0.2 + aO.w * 0.3, 0.0, 1.0);
          float a = aO.w * 6.283;
          float h = position.y;
          float tall = (0.32 + aO.w * 0.55) * g;
          vec3 p = vec3(position.x * 0.17 * cos(a), h * tall, position.x * 0.17 * sin(a));
          float w = sin(uTime * 1.7 + aO.x * 0.4 + aO.z * 0.3) * uWind * 0.13;
          p.x += w * h * h; p.z += w * 0.6 * h * h;
          vec3 world = p + aO.xyz;
          if (g <= 0.0) world.y = -1000.0;
          vec3 base = vec3(0.1, 0.24, 0.11);
          vec3 tip = mix(vec3(0.42, 0.6, 0.18), vec3(0.74, 0.72, 0.26), step(0.8, aO.w));
          vec3 c = mix(base, tip, h) * (uAmb + uSunCol * 0.72);
          vec4 mv = viewMatrix * vec4(world, 1.0);
          float d = -mv.z;
          vC = mix(c, uFog, smoothstep(uFogNear, uFogFar, d) * 0.9);
          vA = 1.0 - smoothstep(110.0, 150.0, d);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vC; varying float vA;
        void main() { if (vA <= 0.01) discard; gl_FragColor = vec4(vC, vA); }`,
    });
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false;
    m.renderOrder = 4;
    this.scene.add(m);
    this.disposables.push(geo, mat);
  }

  private buildFlowers() {
    const count = this.q.flowers;
    const r = mulberry32(99);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 4);
    const palette = [[0.93, 0.28, 0.25], [0.95, 0.36, 0.52], [0.96, 0.78, 0.2], [0.98, 0.95, 0.88], [0.62, 0.42, 0.85]];
    for (let i = 0; i < count; i++) {
      const z = -8 - r() * 350;
      const x = pathX(z) + (r() > 0.5 ? 1 : -1) * (1 + Math.pow(r(), 1.4) * 30);
      pos.set([x, heightAt(x, z) + 0.5 + r() * 0.35, z], i * 3);
      // Flowers grow in drifts of one color, as they do in a real meadow
      const drift = Math.abs(n(x * 0.04 + 50, z * 0.04));
      const c = palette[Math.min(palette.length - 1, Math.floor(drift * 7 + r() * 0.8))];
      col.set([c[0], c[1], c[2], r()], i * 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aC", new THREE.BufferAttribute(col, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...this.grassU, uPx: { value: this.q.dpr * 150 } },
      transparent: true,
      vertexShader: /* glsl */ `
        attribute vec4 aC;
        uniform float uFront, uTime, uFogNear, uFogFar, uPx;
        uniform vec3 uFog, uSunCol, uAmb;
        varying vec3 vC; varying float vA;
        void main() {
          float g = smoothstep(-0.5, 1.2, (position.z - uFront - 30.0) / 22.0 + aC.w);
          vec3 p = position;
          p.x += sin(uTime * 1.6 + position.z) * 0.05;
          p.y -= (1.0 - g) * 1.1;
          vec4 mv = viewMatrix * vec4(p, 1.0);
          float d = -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(uPx * g * 0.6 / max(1.0, d), 0.0, 20.0);
          vC = mix(aC.rgb * (uAmb * 0.7 + uSunCol * 0.72), uFog, smoothstep(uFogNear * 0.8, uFogFar * 0.75, d) * 0.9);
          vA = (1.0 - smoothstep(80.0, 130.0, d)) * step(0.01, g);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vC; varying float vA;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a = atan(c.y, c.x);
          float petal = 0.32 + 0.14 * cos(a * 5.0);
          float r = length(c);
          if (r > petal || vA < 0.01) discard;
          vec3 col = r < 0.09 ? vec3(0.96, 0.76, 0.2) : vC;
          gl_FragColor = vec4(col, vA);
        }`,
    });
    const m = new THREE.Points(geo, mat);
    m.frustumCulled = false;
    m.renderOrder = 5;
    this.scene.add(m);
    this.disposables.push(geo, mat);
  }

  private buildRain() {
    const count = this.q.rain;
    const r = mulberry32(5);
    const pos = new Float32Array(count * 2 * 4);
    for (let i = 0; i < count; i++) {
      const x = r(), y = r(), z = r(), sp = 0.7 + r() * 0.6;
      pos.set([x, y, z, sp * 0], i * 8);
      pos.set([x, y, z, sp], i * 8 + 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 2 * 3), 3));
    geo.setAttribute("aD", new THREE.BufferAttribute(pos, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: this.rainU,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute vec4 aD; uniform float uTime, uRain; uniform vec3 uCam;
        varying float vA;
        void main() {
          float speed = 34.0 + aD.x * 20.0;
          float y = 44.0 - mod(aD.y * 44.0 + uTime * speed, 44.0);
          vec3 p = vec3((aD.x - 0.5) * 60.0, y - 10.0, (aD.z - 0.5) * 70.0 - 26.0) + uCam;
          p.x += y * 0.09;
          p.y += aD.w > 0.0 ? 1.7 : 0.0;
          vA = uRain * (aD.w > 0.0 ? 0.05 : 0.85);
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() { gl_FragColor = vec4(0.92, 0.97, 1.0, vA); }`,
    });
    const m = new THREE.LineSegments(geo, mat);
    m.frustumCulled = false;
    m.renderOrder = 8;
    this.scene.add(m);
    this.disposables.push(geo, mat);
  }

  private buildMotes() {
    const count = this.q.motes;
    const r = mulberry32(8);
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) data.set([r(), r(), r(), r()], i * 4);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aD", new THREE.BufferAttribute(data, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: this.moteU,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute vec4 aD; uniform float uTime, uPetals, uNight, uPx; uniform vec3 uCam;
        varying vec3 vC; varying float vA; varying float vPetal;
        void main() {
          float t = uTime * (0.25 + aD.w * 0.3);
          vec3 p = vec3(
            mod(aD.x * 60.0 + sin(t + aD.y * 6.28) * 3.0 + t * 2.4, 60.0) - 30.0,
            mod(aD.y * 22.0 - t * (uNight > 0.5 ? -0.5 : 1.8), 22.0) - 6.0,
            (aD.z - 0.5) * 60.0 - 22.0
          ) + uCam;
          vec4 mv = viewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float blink = 0.55 + 0.45 * sin(uTime * (1.5 + aD.w * 2.0) + aD.x * 40.0);
          float isPetal = step(aD.w, 0.5);
          vPetal = 1.0 - uNight;
          vC = mix(mix(vec3(0.96, 0.46, 0.6), vec3(0.98, 0.84, 0.42), step(0.28, aD.w)), vec3(0.85, 1.0, 0.42), uNight);
          vA = mix(uPetals * 0.9 * (isPetal * 0.7 + 0.3), blink, uNight);
          gl_PointSize = clamp(uPx * mix(70.0, 150.0, uNight) / max(1.0, -mv.z), 0.0, 26.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vC; varying float vA; varying float vPetal;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c * vec2(1.0, 1.0 + vPetal * 0.9));
          if (d > 0.5 || vA < 0.01) discard;
          float glow = mix(pow(1.0 - d * 2.0, 1.6), 1.0, vPetal);
          gl_FragColor = vec4(vC, vA * glow);
        }`,
    });
    const m = new THREE.Points(geo, mat);
    m.frustumCulled = false;
    m.renderOrder = 9;
    this.scene.add(m);
    this.disposables.push(geo, mat);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // On a phone the frame is narrow, so widen the lens to keep the land in shot
    this.camera.fov = w < h ? 62 : 46;
    this.camera.updateProjectionMatrix();
    const px = this.renderer.getPixelRatio() * (h / 900);
    this.treeU.uPointScale.value = 300 * px;
    this.moteU.uPx.value = px;
  }

  /** Project a screen point onto the ground and grow a tree there. */
  plantAt(ndcX: number | null, ndcY: number | null) {
    const camera = this.camera;
    let x: number;
    let z: number;
    const dir = new THREE.Vector3();
    if (ndcX !== null && ndcY !== null) {
      dir.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
      const p = camera.position.clone();
      let hit = false;
      for (let i = 0; i < 120; i++) {
        p.addScaledVector(dir, 0.6);
        if (p.y <= heightAt(p.x, p.z)) { hit = true; break; }
      }
      if (!hit) return false;
      x = p.x;
      z = p.z;
    } else {
      const r = Math.random;
      z = camera.position.z - 9 - r() * 13;
      x = camera.position.x + (r() - 0.5) * 16;
    }
    const slot = this.draws[this.plantedTotal % this.draws.length];
    this.plantedTotal++;
    if (slot.planted >= PLANT_CAPACITY) slot.planted = 0;
    slot.draw.setInstance(slot.base + slot.planted, x, heightAt(x, z) - 0.1, z, Math.random() * 6.28, 0.5 + Math.random() * 0.25, Math.random(), this.time);
    slot.planted++;
    slot.peak = Math.max(slot.peak, slot.planted);
    slot.draw.setCount(slot.base + slot.peak);
    return true;
  }

  render(dt: number, s: WorldState) {
    this.time += dt;
    const u = this.terrainU;
    u.uTime.value = this.time;
    u.uFront.value = s.front;
    u.uWet.value = s.rain;

    // Blend the two neighbouring moods
    const i = Math.min(MOODS.length - 2, Math.floor(s.mood));
    const t = s.mood - i;
    const a = MOODS[i];
    const b = MOODS[i + 1];
    const col = (x: number, y: number, target: THREE.Color, k = 1) => {
      const c0 = _c0.setHex(x);
      const c1 = _c1.setHex(y);
      target.copy(c0).lerp(c1, t).multiplyScalar(k);
    };
    col(a.sun, b.sun, this.treeU.uSunCol.value, a.sunI + (b.sunI - a.sunI) * t);
    col(a.amb, b.amb, this.treeU.uAmb.value);
    col(a.fog, b.fog, this.treeU.uFog.value);
    // Rain pulls the whole light toward the storm
    this.treeU.uSunCol.value.lerp(_c0.setHex(STORM.sun).multiplyScalar(STORM.sunI), s.rain);
    this.treeU.uAmb.value.lerp(_c0.setHex(STORM.amb), s.rain);
    this.treeU.uFog.value.lerp(_c0.setHex(STORM.fog), s.rain);
    this.treeU.uSun.value.set(
      a.sunDir[0] + (b.sunDir[0] - a.sunDir[0]) * t,
      a.sunDir[1] + (b.sunDir[1] - a.sunDir[1]) * t,
      a.sunDir[2] + (b.sunDir[2] - a.sunDir[2]) * t,
    ).normalize();
    this.treeU.uWind.value = (a.wind + (b.wind - a.wind) * t) * (1 - s.rain) + STORM.wind * s.rain;
    this.treeU.uFirst.value = s.first;

    this.rainU.uRain.value = s.rain;
    this.moteU.uPetals.value = s.petals;
    this.moteU.uNight.value = smoothstep(2.25, 2.9, s.mood);

    // Camera rides the corridor; ground follows its own curve so it never clips a dune
    this.pointerS.lerp(this.pointer, 1 - Math.exp(-dt * 3.2));
    const px = pathX(s.camZ) + s.side;
    const camera = this.camera;
    camera.position.set(px + this.pointerS.x * 1.1, heightAt(px, s.camZ) + s.eye + this.pointerS.y * 0.35, s.camZ);
    const lz = s.camZ - 36;
    this.look.set(pathX(lz) * 0.55 + px * 0.45, heightAt(px, s.camZ) + s.look, lz);
    camera.lookAt(this.look);
    camera.updateMatrixWorld();
    this.rainU.uCam.value.copy(camera.position);

    this.renderer.render(this.scene, camera);
    this.adapt(dt);
  }

  /** Lower the resolution if this device cannot hold the frame rate. */
  private adapt(dt: number) {
    this.frames++;
    if (this.frames < 40) return;
    if (dt > 1 / 38) this.slowFrames++;
    else this.slowFrames = Math.max(0, this.slowFrames - 0.25);
    if (this.slowFrames > 26) {
      const pr = this.renderer.getPixelRatio();
      if (pr > 0.8) {
        this.renderer.setPixelRatio(Math.max(0.8, pr - 0.25));
        this.resize();
      }
      this.slowFrames = 0;
    }
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.draws.forEach((d) => d.draw.dispose());
    this.renderer.dispose();
  }
}

const _c0 = new THREE.Color();
const _c1 = new THREE.Color();
