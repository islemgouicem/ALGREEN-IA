"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, isTouch, motionAllowed } from "@/lib/gsap";

declare global {
  interface Window { __motionTimer?: number; __lenis?: Lenis }
}

function initPageMotion() {
  gsap.utils.toArray<HTMLElement>("[data-motion-text]").forEach((el) => {
    const words = el.querySelectorAll(".w > i");
    gsap.set(el, { autoAlpha: 1 });
    gsap.fromTo(words, { yPercent: 112 }, {
      yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.05,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
    const items = group.querySelectorAll("[data-reveal-item]");
    gsap.fromTo(items, { y: 36, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 0.95, ease: "power4.out", stagger: 0.075,
      scrollTrigger: { trigger: group, start: "top 86%", once: true },
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.fromTo(el, { y: 32, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-image-reveal]").forEach((fig) => {
    const img = fig.querySelector("img");
    gsap.set(fig, { autoAlpha: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: "top 85%", once: true } });
    tl.fromTo(fig, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power4.out" });
    if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.2, ease: "power4.out" }, 0);
  });

  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const speed = Number(el.dataset.parallax || 0.15);
    gsap.to(el, {
      y: () => window.innerHeight * speed * -1, ease: "none",
      scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 1.2, invalidateOnRefresh: true },
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-spin]").forEach((el) => {
    gsap.to(el, {
      rotate: Number(el.dataset.spin || 40), ease: "none",
      scrollTrigger: { trigger: el.closest("section") ?? el, start: "top top", end: "bottom top", scrub: 1.1 },
    });
  });

  // Footer roots grow down as the page reaches the soil
  const roots = gsap.utils.toArray<SVGPathElement>("[data-root]");
  if (roots.length) {
    gsap.fromTo(roots, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, ease: "none", stagger: 0.012,
      scrollTrigger: { trigger: ".soil", start: "top 82%", end: "top 8%", scrub: 1.1 },
    });
  }

  gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? "";
    const obj = { v: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(obj, {
      v: target, duration: 1.6, ease: "power3.out",
      onUpdate: () => { el.textContent = `${Math.round(obj.v).toLocaleString("en-US")}${suffix}`; },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  if (!isTouch()) {
    gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.22);
      };
      const leave = () => { xTo(0); yTo(0); };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    });
  }
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const wipeRef = useRef<HTMLDivElement>(null);
  const covering = useRef(false);
  const origin = useRef({ x: 50, y: 50 });
  const first = useRef(true);

  // Lenis runs once for the app and is driven by the GSAP ticker
  useEffect(() => {
    if (window.__motionTimer) window.clearTimeout(window.__motionTimer);
    if (!motionAllowed()) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, anchors: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Each route gets a clean set of triggers
  useEffect(() => {
    if (!motionAllowed()) {
      if (!first.current) window.scrollTo(0, 0);
      first.current = false;
      return;
    }
    if (!first.current) {
      window.__lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }
    const ctx = gsap.context(initPageMotion);
    ScrollTrigger.refresh();
    // Every page turn opens outward from where it closed
    if (covering.current && wipeRef.current) {
      covering.current = false;
      const rings = wipeRef.current.querySelectorAll<HTMLElement>("i");
      const { x, y } = origin.current;
      gsap.fromTo(rings, { clipPath: `circle(150% at ${x}% ${y}%)` }, {
        clipPath: `circle(0% at ${x}% ${y}%)`, duration: 0.75, ease: "expo.inOut", stagger: { each: 0.07, from: "end" },
        onComplete: () => { gsap.set(wipeRef.current, { visibility: "hidden" }); },
      });
    }
    first.current = false;
    return () => ctx.revert();
  }, [pathname]);

  // Internal links play the growth-ring wipe before navigating
  useEffect(() => {
    if (!motionAllowed()) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || url.pathname === location.pathname) return;
      const wipe = wipeRef.current;
      if (!wipe) return;
      e.preventDefault();
      e.stopPropagation();
      // Close any modal menu so it cannot sit above the wipe
      document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((d) => d.close());
      const x = Math.round((e.clientX / window.innerWidth) * 100) || 50;
      const y = Math.round((e.clientY / window.innerHeight) * 100) || 50;
      origin.current = { x, y };
      const rings = wipe.querySelectorAll<HTMLElement>("i");
      gsap.set(wipe, { visibility: "visible" });
      covering.current = true;
      gsap.fromTo(rings, { clipPath: `circle(0% at ${x}% ${y}%)` }, {
        clipPath: `circle(150% at ${x}% ${y}%)`, duration: 0.8, ease: "expo.inOut", stagger: 0.07,
        onComplete: () => router.push(url.pathname + url.search + url.hash),
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <>
      {children}
      <div ref={wipeRef} className="wipe" aria-hidden="true"><i /><i /><i /></div>
    </>
  );
}
