"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.85 });
}

export { gsap, ScrollTrigger };

export const MOTION_KEY = "algreenia:motion";

export function motionAllowed() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("has-motion") || document.documentElement.dataset.motion === "on";
}

export const isTouch = () => window.matchMedia("(pointer: coarse)").matches;
