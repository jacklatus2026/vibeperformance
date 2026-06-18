import gsap from "gsap";
import { reducedMotion } from "./core/scroll.js";

// Builds the scroll-driven "mechanism of action" sequence:
//   1 tin opens + pouches rise  →  2 pouch tucks under the lip  →
//   3 electric pulse runs the neuron  →  4 the brain lights up.
// Pinned + scrubbed by ScrollTrigger; falls back to an autoplay loop if the
// plugin can't load.
export async function setupHowItWorks() {
  const svg = document.getElementById("moa-svg");
  if (!svg) return;

  const signal = svg.querySelector("#signal");
  const len = signal.getTotalLength();
  const PULSE = 64;
  signal.style.strokeDasharray = `${PULSE} ${len}`;

  // ---- initial states ----
  gsap.set("#lid", { transformOrigin: "50% 100%" });
  gsap.set(".pouch", { opacity: 0, y: 0 });
  gsap.set("#travelPouch", { opacity: 0 });
  gsap.set("#lipFlash", { opacity: 0, transformOrigin: "50% 50%", scale: 0.4 });
  gsap.set(signal, { strokeDashoffset: PULSE }); // pulse parked just before the path
  gsap.set(".tnode", { opacity: 0.18 });
  gsap.set(".bnode", { opacity: 0.16, attr: { r: 1.6 } });
  gsap.set(".bline", { opacity: 0.08 });
  gsap.set("#brainGlow", { opacity: 0 });
  gsap.set("#brainOutline", { opacity: 0.85 });

  function build(scrollTrigger) {
    const tl = gsap.timeline(scrollTrigger ? { scrollTrigger } : {});

    // 1 — OPEN
    tl.to("#lid", { y: -78, rotation: -9, duration: 1, ease: "back.out(1.5)" }, 0)
      .to(".pouch", { opacity: 1, y: -24, duration: 0.8, ease: "power2.out", stagger: 0.1 }, 0.25)
      .to("#pouch1", { x: -28, duration: 0.7, ease: "power2.out" }, 0.35)
      .to("#pouch3", { x: 28, duration: 0.7, ease: "power2.out" }, 0.35);

    // 2 — PLACE (a pouch travels to under the lip)
    tl.set("#travelPouch", { opacity: 1 }, 1.05)
      .to("#travelPouch", { x: 322, y: -22, duration: 1.1, ease: "power2.inOut" }, 1.05)
      .to("#lipGroup", { scaleY: 0.9, transformOrigin: "50% 50%", duration: 0.22, yoyo: true, repeat: 1 }, 2.0)
      .to("#travelPouch", { opacity: 0, duration: 0.2 }, 2.25)
      .fromTo("#lipFlash", { opacity: 0.95, scale: 0.5 }, { opacity: 0, scale: 1.5, duration: 0.5, ease: "power2.out" }, 2.2);

    // 3 — SIGNAL (pulse runs the neuron; nodes flash as it passes)
    tl.to(signal, { strokeDashoffset: -len, duration: 1.5, ease: "power1.inOut" }, 2.45)
      .to(".tnode", { opacity: 1, duration: 0.18, stagger: 0.42 }, 2.7)
      .to(".tnode", { opacity: 0.25, duration: 0.5, stagger: 0.42 }, 3.0);

    // 4 — ACTIVATE (brain lights up)
    tl.to(".bline", { opacity: 0.75, duration: 0.5, stagger: 0.05 }, 3.55)
      .to(".bnode", { opacity: 1, attr: { r: 4 }, duration: 0.5, ease: "back.out(2)", stagger: { each: 0.1, from: "edges" } }, 3.6)
      .to("#brainGlow", { opacity: 0.55, duration: 0.9, ease: "power2.out" }, 3.7)
      .to("#brainOutline", { opacity: 1, duration: 0.5 }, 3.6);

    return tl;
  }

  function setCap(p) {
    const idx = p < 0.25 ? 1 : p < 0.48 ? 2 : p < 0.74 ? 3 : 4;
    for (let i = 1; i <= 4; i++)
      document.getElementById("cap" + i)?.classList.toggle("active", i === idx);
  }
  setCap(0);

  // reduced motion: show the completed diagram statically, no pin/scrub
  if (reducedMotion) {
    const tl = build(null);
    tl.progress(1).pause();
    setCap(1);
    return;
  }

  try {
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
    build({
      trigger: ".howit",
      start: "top top",
      end: "+=2200",
      scrub: 0.6,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => setCap(self.progress),
    });
    ScrollTrigger.refresh();
  } catch (e) {
    console.info("[VIBE] ScrollTrigger unavailable — autoplaying the sequence.", e?.message || e);
    const tl = build(null);
    tl.repeat(-1).repeatDelay(0.8);
    tl.eventCallback("onUpdate", () => setCap(tl.progress()));
  }
}
