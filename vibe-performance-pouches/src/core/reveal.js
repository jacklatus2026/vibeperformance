import { gsap, ScrollTrigger, reducedMotion } from "./scroll.js";

// Apple-style "reveal on enter": every [data-reveal] element fades + rises into
// place as it scrolls into view. Honours reduced-motion by showing instantly.
export function setupReveals() {
  const els = gsap.utils.toArray("[data-reveal]");
  if (!els.length) return;

  if (reducedMotion) {
    gsap.set(els, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(els, { opacity: 0, y: 26 });
  ScrollTrigger.batch(els, {
    start: "top 86%",
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.09,
        overwrite: true,
      }),
  });
}
