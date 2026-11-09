"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, isTouch, motionAllowed } from "@/lib/gsap";

/** The scroll choreography that belongs to the home page alone. */
export function HomeMotion() {
  useEffect(() => {
    if (!motionAllowed()) return;

    const loader = document.querySelector<HTMLElement>(".loader");
    let played = false;
    const heroIn = () => {
      if (played) return;
      played = true;
      const tl = gsap.timeline();
      if (loader) {
        tl.to(loader, { clipPath: "circle(0% at 50% 50%)", duration: 0.95, ease: "expo.inOut" })
          .set(loader, { display: "none" });
      }
      tl.fromTo(".hero__title .w > i", { y: 0, yPercent: 112 }, { y: 0, yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.07 }, loader ? "-=0.35" : 0)
        .to(".hero__meta > *", { autoAlpha: 1, y: 0, duration: 0.9, ease: "power4.out", stagger: 0.08 }, "-=0.75");
      try { sessionStorage.setItem("algreenia:seen", "1"); } catch { /* ignore */ }
    };

    let seen = false;
    try { seen = Boolean(sessionStorage.getItem("algreenia:seen")); } catch { /* ignore */ }
    if (seen && loader) loader.style.display = "none";
    // The crest gets a real moment on a first visit, even if the world is ready sooner
    const shownAt = performance.now();
    let hold = 0;
    const onReady = () => { hold = window.setTimeout(heroIn, seen ? 0 : Math.max(0, 2000 - (performance.now() - shownAt))); };
    window.addEventListener("world:ready", onReady, { once: true });
    const failsafe = window.setTimeout(heroIn, 3600);

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      gsap.set(".hero__meta > *", { autoAlpha: 0, y: 26 });

      // Title lifts out and leaves the dune behind
      gsap.to(".hero__title", {
        yPercent: -22, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
      });

      // Manifesto inks in word by word
      gsap.fromTo(".manifesto .m", { opacity: 0.14 }, {
        opacity: 1, ease: "none", stagger: 0.25,
        scrollTrigger: { trigger: ".manifesto", start: "top top", end: "bottom bottom", scrub: 0.9 },
      });

      // The trunk cross-section grows outward, ring after ring
      const rings = gsap.utils.toArray<SVGPathElement>(".trunk__art path");
      const trunk = gsap.timeline({
        scrollTrigger: { trigger: ".trunk", start: "top top", end: "bottom bottom", scrub: 1 },
      });
      trunk.fromTo(".trunk__art", { scale: 0.42, rotate: -18 }, { scale: 1.32, rotate: 8, ease: "none", duration: 1 }, 0);
      trunk.fromTo(rings, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 0.06, stagger: 0.94 / rings.length }, 0);
      gsap.utils.toArray<HTMLElement>(".trunk__stat").forEach((stat, i, all) => {
        const at = 0.08 + (i / all.length) * 0.88;
        trunk.fromTo(stat, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.09, ease: "power3.out" }, at);
        const num = stat.querySelector<HTMLElement>("[data-tick]");
        if (num) {
          const obj = { v: 0 };
          const target = Number(num.dataset.tick);
          trunk.to(obj, { v: target, duration: 0.14, ease: "none", onUpdate: () => { num.textContent = Math.round(obj.v).toLocaleString("en-US"); } }, at);
        }
        if (i < all.length - 1) trunk.to(stat, { autoAlpha: 0, y: -34, duration: 0.07, ease: "power3.in" }, at + 0.2);
      });

      // The crest grows out from the heart of its vines
      const crest = gsap.timeline({ scrollTrigger: { trigger: ".crest", start: "top top", end: "bottom bottom", scrub: 1 } });
      crest.fromTo(".crest__art", { clipPath: "circle(4% at 50% 60%)", scale: 0.86 }, { clipPath: "circle(74% at 50% 50%)", scale: 1.04, ease: "none", duration: 0.78 }, 0)
        .fromTo(".crest__glow", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.6 }, 0.1)
        .fromTo(".crest__line", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.18 }, 0.72);

      // Vine that climbs as you read
      gsap.fromTo(".stem__line", { strokeDashoffset: 1 }, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: ".home", start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      gsap.utils.toArray<HTMLAnchorElement>(".stem a").forEach((a) => {
        const target = document.querySelector(a.getAttribute("href") ?? "");
        if (!target) return;
        ScrollTrigger.create({ trigger: target, start: "top 60%", onToggle: (self) => a.classList.toggle("is-on", self.isActive || self.progress > 0), end: "max" });
      });

      // Identify: the frame closes in on one leaf
      gsap.fromTo(".scan__frame", { scale: 1.2 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: ".scan", start: "top bottom", end: "center center", scrub: 1 },
      });

      // Stories drift at slightly different speeds
      gsap.utils.toArray<HTMLElement>(".story__num").forEach((el, i) => {
        gsap.fromTo(el, { yPercent: 26 + i * 8 }, {
          yPercent: -18, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
      });
    });

    // Campaign tags travel sideways on desktop; touch keeps native swiping
    mm.add("(min-width: 900px) and (pointer: fine)", () => {
      const section = document.querySelector<HTMLElement>(".camp");
      const track = document.querySelector<HTMLElement>(".camp__track");
      if (!section || !track) return;
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const setHeight = () => { section.style.height = `${dist() + window.innerHeight * 1.05}px`; };
      setHeight();
      ScrollTrigger.addEventListener("refreshInit", setHeight);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
      });
      gsap.utils.toArray<HTMLElement>(".ctag").forEach((tag, i) => {
        gsap.fromTo(tag, { rotate: i % 2 ? 3.5 : -3.5 }, {
          rotate: i % 2 ? -2 : 2, ease: "none",
          scrollTrigger: { trigger: tag, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        });
      });
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", setHeight);
        section.style.height = "";
      };
    });

    if (isTouch()) document.documentElement.classList.add("is-touch");

    return () => {
      window.clearTimeout(failsafe);
      window.clearTimeout(hold);
      window.removeEventListener("world:ready", onReady);
      mm.revert();
      ctx.revert();
    };
  }, []);

  return null;
}
