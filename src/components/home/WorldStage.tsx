"use client";

import { useEffect, useRef } from "react";
import { gsap, motionAllowed } from "@/lib/gsap";
import { FIELDS, SKY_LAYERS, WORLD_KEYS, type WorldState } from "@/world/keys";
import { clamp, smoothstep } from "@/world/noise";

export interface PlantDetail { x: number | null; y: number | null; hit: boolean }

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function WorldStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = document.documentElement;
    const fail = () => {
      root.classList.add("no-world");
      window.dispatchEvent(new Event("world:ready"));
    };
    if (!canvas || !motionAllowed() || !supportsWebGL()) {
      fail();
      return () => root.classList.remove("no-world");
    }

    let disposed = false;
    let cleanup = () => {};

    import("@/world/World").then(({ World, pickQuality }) => {
      if (disposed) return;
      let world: InstanceType<typeof World>;
      try {
        world = new World(canvas, pickQuality());
      } catch {
        fail();
        return;
      }

      const cur: WorldState = { ...WORLD_KEYS.hero };
      const tar: WorldState = { ...WORLD_KEYS.hero };
      let anchors: { y: number; key: WorldState }[] = [];
      let covers: { top: number; bottom: number }[] = [];
      const measure = () => {
        const vh = window.innerHeight;
        const y = window.scrollY;
        anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-world]"))
          .map((el) => ({ y: Math.max(0, el.getBoundingClientRect().top + y - vh * 0.35), key: WORLD_KEYS[el.dataset.world as string] }))
          .filter((a) => a.key)
          .sort((a, b) => a.y - b.y);
        covers = Array.from(document.querySelectorAll<HTMLElement>("[data-cover]")).map((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top + y, bottom: r.bottom + y };
        });
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(document.body);

      const sky = Array.from(skyRef.current?.children ?? []) as HTMLElement[];
      const hudCanopy = document.querySelector<HTMLElement>("[data-hud-canopy]");
      let lastCanopy = -1;

      const onResize = () => { world.resize(); measure(); };
      window.addEventListener("resize", onResize);
      const onPlant = (e: Event) => {
        const d = (e as CustomEvent<PlantDetail>).detail;
        d.hit = world.plantAt(d.x, d.y);
      };
      window.addEventListener("world:plant", onPlant);
      const onPointer = (e: PointerEvent) => {
        world.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      let last = performance.now();
      let hidden = false;
      const onVis = () => { hidden = document.hidden; last = performance.now(); };
      document.addEventListener("visibilitychange", onVis);

      const tick = () => {
        if (hidden) return;
        const now = performance.now();
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        const y = window.scrollY;

        // Find the two chapters we sit between and blend
        let i = 0;
        while (i < anchors.length - 2 && y >= anchors[i + 1].y) i++;
        const a = anchors[i];
        const b = anchors[Math.min(i + 1, anchors.length - 1)];
        const t = b.y > a.y ? smoothstep(0, 1, clamp((y - a.y) / (b.y - a.y))) : 0;
        for (const f of FIELDS) tar[f] = a.key[f] + (b.key[f] - a.key[f]) * t;
        const k = 1 - Math.exp(-dt * 4.4);
        for (const f of FIELDS) cur[f] += (tar[f] - cur[f]) * k;

        // Sky crossfades on the compositor only
        for (let s = 1; s < SKY_LAYERS; s++) sky[s].style.opacity = String(clamp(cur.mood - (s - 1)));
        sky[SKY_LAYERS].style.opacity = String(cur.rain);
        if (sunRef.current) {
          const dawn = 1 - clamp(cur.mood * 1.2);
          const dusk = clamp(1 - Math.abs(cur.mood - 2) * 1.8) * (1 - cur.rain);
          sunRef.current.style.opacity = String(Math.max(dawn, dusk));
          sunRef.current.style.transform = `translate3d(0, ${(1 - dawn) * 18 + y * -0.02}vh, 0)`;
        }

        const canopy = Math.round(clamp((60 - cur.front) / 420) * 92 + 4 * clamp((90 - cur.front) / 30));
        if (canopy !== lastCanopy && hudCanopy) {
          hudCanopy.textContent = `${canopy}%`;
          lastCanopy = canopy;
        }

        // Nothing to draw while an opaque chapter fills the screen
        const vh = window.innerHeight;
        const covered = covers.some((c) => c.top <= y && c.bottom >= y + vh);
        if (!covered) world.render(dt, cur);
      };
      gsap.ticker.add(tick);
      tick();
      // One compiled frame before revealing, so the hero never pops in
      requestAnimationFrame(() => window.dispatchEvent(new Event("world:ready")));

      cleanup = () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        window.removeEventListener("resize", onResize);
        window.removeEventListener("world:plant", onPlant);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVis);
        world.dispose();
      };
    }).catch(fail);

    return () => {
      disposed = true;
      cleanup();
      root.classList.remove("no-world");
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div className="sky" ref={skyRef}>
        <i className="sky--dawn" /><i className="sky--day" /><i className="sky--dusk" /><i className="sky--night" /><i className="sky--storm" />
      </div>
      <div className="sun" ref={sunRef} />
      <svg className="dunes" viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice">
        <path d="M0 260C200 150 420 130 640 220S1100 330 1600 170V500H0Z" fill="#E3B57B" />
        <path d="M0 360C300 250 520 300 760 350S1260 420 1600 290V500H0Z" fill="#C98F55" />
        <path d="M0 430C260 380 620 390 900 440S1400 470 1600 420V500H0Z" fill="#A86C3B" />
      </svg>
      <canvas ref={canvasRef} className="world" />
    </div>
  );
}
