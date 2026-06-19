import { PRODUCTS } from "../products.js";
import { gsap, ScrollTrigger, reducedMotion } from "../core/scroll.js";

// Formula band — shows the active SKU's key actives; returns an updater(product).
export function setupFormula() {
  const grid = document.getElementById("formula-grid");
  const label = document.getElementById("formula-sku");
  if (!grid) return () => {};
  return function render(p) {
    grid.innerHTML = p.actives
      .map(
        (a) => `
        <div class="formula-card" style="--c:${p.glow}">
          <span class="formula-dose">${a.dose}</span>
          <span class="formula-name">${a.name}</span>
        </div>`
      )
      .join("");
    if (label) {
      label.textContent = "VIBE " + p.name;
      label.style.color = p.glow;
    }
  };
}

// Big-numbers band — counts up [data-count] values when scrolled into view.
export function setupNumbers() {
  gsap.utils.toArray("#numbers [data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (reducedMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => (el.textContent = prefix + Math.round(obj.v) + suffix),
        }),
    });
  });
}

// Daily-ritual band — a timeline mapping the four SKUs across a day.
export function setupRitual() {
  const track = document.getElementById("ritual-track");
  if (!track) return;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const steps = [
    { id: "pro", time: "07:00", use: "Train" },
    { id: "focus", time: "10:00", use: "Deep work" },
    { id: "endure", time: "16:00", use: "Go again" },
    { id: "calm", time: "21:00", use: "Wind down" },
  ];
  track.innerHTML = steps
    .map((s) => {
      const p = byId[s.id];
      return `
      <div class="ritual-step" data-reveal style="--c:${p.glow}">
        <span class="ritual-time">${s.time}</span>
        <span class="ritual-dot"></span>
        <span class="ritual-sku">VIBE ${p.name}</span>
        <span class="ritual-use">${s.use} · ${p.positioning}</span>
      </div>`;
    })
    .join("");
}
