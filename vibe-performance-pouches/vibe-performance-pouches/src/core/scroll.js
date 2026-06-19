import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// touch devices get native momentum scrolling — Lenis feels worse there
export const isTouch = window.matchMedia("(pointer: coarse)").matches;

// Apple-style inertial smooth scroll, wired so GSAP ScrollTrigger reads from it.
// Skipped on reduced-motion and on touch devices (native scroll instead).
export function initSmoothScroll() {
  if (reducedMotion || isTouch) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.documentElement.classList.add("lenis");
  return lenis;
}

export { gsap, ScrollTrigger };
