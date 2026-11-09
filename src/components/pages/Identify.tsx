"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, RotateCw, Upload, X } from "lucide-react";
import { SAMPLE_RESULT as R, SPECIMENS } from "@/lib/data";
import { motionAllowed } from "@/lib/gsap";
import { setState, toast, useApp } from "@/lib/store";

export function ComingSoon() {
  const waitlist = useApp((s) => s.waitlist);
  return (
    <div className="scanbox">
      <div className="scanbox__art" aria-hidden="true"><span /><span /><span /><span /></div>
      <p className="soon">Coming soon</p>
      <h2 className="display display--md">The AI is still learning its leaves.</h2>
      <p>Soon you will be able to photograph a tree and have it named on the spot. Until then, explore the species below.</p>
      <div className="row row--center">
        <button type="button" className="btn btn--ghost" disabled><span>Take a photo</span><Camera size={18} aria-hidden="true" /></button>
        <button type="button" className="btn btn--ghost" disabled><span>Upload an image</span><Upload size={18} aria-hidden="true" /></button>
      </div>
      <button type="button" className="btn btn--solid" disabled={waitlist} onClick={() => { setState({ waitlist: true }); toast("You are on the list."); }}>
        <span>{waitlist ? "You are on the list" : "Tell me when it is ready"}</span>
      </button>
    </div>
  );
}

export function SpecimenViewer() {
  const [index, setIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<{ show(key: string): void; rotate(d: number): void } | null>(null);
  const s = SPECIMENS[index];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let stop = () => {};
    let cancelled = false;
    (async () => {
      const THREE = await import("three");
      const { buildTemplate, createTreeDraw } = await import("@/world/trees");
      if (cancelled) return;
      THREE.ColorManagement.enabled = false;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        canvas.style.display = "none";
        return;
      }
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 200);
      const uniforms = {
        uFront: { value: -1000 }, uTime: { value: 0 }, uWind: { value: 1 }, uFog: { value: new THREE.Color(0xffffff) },
        uFogNear: { value: 500 }, uFogFar: { value: 900 }, uSunCol: { value: new THREE.Color(0xfff6dc) }, uAmb: { value: new THREE.Color(0x7c8a78) },
        uSun: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() }, uPointScale: { value: 300 }, uFirst: { value: 1 }, uLeafBoost: { value: 1 },
      };
      const animated = motionAllowed();
      let draw: ReturnType<typeof createTreeDraw> | null = null;
      let height = 12;
      let angle = 0;

      const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        uniforms.uPointScale.value = 340 * renderer.getPixelRatio() * (h / 620);
      };
      const place = () => {
        // Tree shaders work in world space, so the camera orbits instead of the model
        const dist = Math.max(height * 2.5, 26);
        camera.position.set(Math.sin(angle) * dist, height * 0.56, Math.cos(angle) * dist);
        camera.lookAt(0, height * 0.5, 0);
        camera.updateMatrixWorld();
      };
      const paint = () => renderer.render(scene, camera);

      let target = 0;
      let current = 0;
      let dragging = false;

      apiRef.current = {
        show(key) {
          if (draw) { scene.remove(draw.group); draw.dispose(); }
          const tpl = buildTemplate(key as never, 1, 14);
          height = tpl.height;
          draw = createTreeDraw(tpl, 1, uniforms);
          draw.setInstance(0, 0, 0, 0, 0, 1, 0.5, animated ? uniforms.uTime.value + 0.001 : 0);
          draw.setCount(1);
          scene.add(draw.group);
          place();
          paint();
        },
        rotate(d) { target += d; if (!animated) { current = target; angle = current; place(); paint(); } },
      };

      const ro = new ResizeObserver(() => { resize(); place(); paint(); });
      ro.observe(canvas);
      resize();
      apiRef.current.show(SPECIMENS[0].key);

      let lastX = 0;
      const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
      const move = (e: PointerEvent) => { if (!dragging) return; apiRef.current?.rotate((e.clientX - lastX) * 0.01); lastX = e.clientX; };
      const up = () => { dragging = false; };
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);

      let raf = 0;
      let last = performance.now();
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(canvas);
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) { last = now; return; }
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        uniforms.uTime.value += dt;
        if (!dragging) target += dt * 0.18;
        current += (target - current) * (1 - Math.exp(-dt * 6));
        angle = current;
        place();
        paint();
      };
      if (animated) raf = requestAnimationFrame(loop);

      stop = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        if (draw) draw.dispose();
        renderer.dispose();
      };
    })();
    return () => { cancelled = true; stop(); apiRef.current = null; };
  }, []);

  useEffect(() => { apiRef.current?.show(SPECIMENS[index].key); }, [index]);

  return (
    <section className="viewer" aria-labelledby="viewer-title">
      <div className="viewer__stage">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label={`Rotating 3D model of ${s.name}. Use the left and right arrow keys to rotate.`}
          data-cursor-label="Drag"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") { e.preventDefault(); apiRef.current?.rotate(-0.35); }
            if (e.key === "ArrowRight") { e.preventDefault(); apiRef.current?.rotate(0.35); }
          }}
        />
        <p className="viewer__hint"><RotateCw size={15} aria-hidden="true" /> Drag to rotate</p>
      </div>
      <div className="viewer__info">
        <p className="eyebrow">Species plate {String(index + 1).padStart(2, "0")} of {String(SPECIMENS.length).padStart(2, "0")}</p>
        <h2 id="viewer-title" className="display display--md">{s.name}</h2>
        <p className="latin">{s.latin}</p>
        <p>{s.description}</p>
        <dl className="specs">
          <div><dt>Family</dt><dd>{s.family}</dd></div>
          <div><dt>Soil type</dt><dd>{s.soil}</dd></div>
          <div><dt>Moisture level</dt><dd>{s.moisture}</dd></div>
          <div><dt>Typical locations</dt><dd>{s.locations}</dd></div>
          <div><dt>Distribution</dt><dd>{s.distribution}</dd></div>
          <div><dt>Uses</dt><dd>{s.uses}</dd></div>
        </dl>
        <div className="chips" role="group" aria-label="Choose a species">
          {SPECIMENS.map((sp, i) => (
            <button key={sp.key} type="button" aria-pressed={i === index} onClick={() => setIndex(i)}>{sp.name}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SamplePlate() {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const open = (src: string, alt: string) => {
    setZoom({ src, alt });
    dialog.current?.showModal();
    window.__lenis?.stop();
  };
  const Thumb = ({ src, alt, label }: { src: string; alt: string; label: string }) => (
    <button type="button" className="thumb" onClick={() => open(src, alt)} aria-label={`Enlarge ${label}`} data-cursor-label="View">
      <Image src={src} alt={alt} fill sizes="200px" />
      <span>{label}</span>
    </button>
  );
  const C = 2 * Math.PI * 54;
  return (
    <section className="sample" aria-labelledby="sample-title">
      <p className="soon">Preview. Example result only</p>
      <h2 id="sample-title" className="display display--lg">What a result will look like</h2>
      <div className="sample__grid">
        <figure className="sample__hero">
          <Image src={R.images.tree} alt="A broad tree in fresh spring leaf" fill sizes="(max-width: 860px) 90vw, 40vw" />
        </figure>
        <div className="sample__text">
          <h3 className="latin latin--lg">{R.name}</h3>
          <p>{R.common}. {R.description}</p>
          <dl className="specs">
            <div><dt>Family</dt><dd>{R.family}</dd></div>
            <div><dt>Soil type</dt><dd>{R.soil}</dd></div>
            <div><dt>Moisture level</dt><dd>{R.moisture}</dd></div>
            <div><dt>Typical locations</dt><dd>{R.locations}</dd></div>
            <div><dt>Distribution</dt><dd>{R.distribution}</dd></div>
            <div><dt>Uses</dt><dd>{R.uses}</dd></div>
          </dl>
        </div>
        <div className="sample__side">
          <div className="gauge">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="54" />
              <circle cx="60" cy="60" r="54" strokeDasharray={C} strokeDashoffset={C * (1 - R.accuracy / 100)} />
            </svg>
            <p><b>{R.accuracy}%</b><span>Accuracy</span></p>
          </div>
          <div className="thumbs">
            <Thumb src={R.images.leaf} alt="New oak leaves in spring" label="Leaf" />
            <Thumb src={R.images.flower} alt="Hanging oak catkins up close" label="Flower" />
          </div>
          <h3 className="eyebrow">Similar trees</h3>
          <div className="thumbs thumbs--3">
            {R.similar.map((t) => <Thumb key={t.name} src={t.image} alt={t.name} label={t.name} />)}
          </div>
        </div>
      </div>
      <dialog ref={dialog} className="lightbox" aria-label={zoom?.alt ?? "Enlarged image"} onClose={() => window.__lenis?.start()} onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <button type="button" className="iconbtn" onClick={() => dialog.current?.close()} aria-label="Close"><X aria-hidden="true" /></button>
        {zoom ? <div className="lightbox__img"><Image src={zoom.src} alt={zoom.alt} fill sizes="90vw" /></div> : null}
      </dialog>
    </section>
  );
}
