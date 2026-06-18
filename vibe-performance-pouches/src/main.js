import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import gsap from "gsap";
import { PRODUCTS } from "./products.js";
import { createPouch } from "./pouch.js";
import { initSmoothScroll, ScrollTrigger, reducedMotion } from "./core/scroll.js";
import { setupReveals } from "./core/reveal.js";
import { setupRange } from "./sections/range.js";
import { setupFormula, setupNumbers, setupRitual } from "./sections/bands.js";

const canvas = document.getElementById("scene");
const loaderEl = document.getElementById("loader");

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ---------- scene + camera ----------
const scene = new THREE.Scene(); // transparent — the CSS gradient shows through
const camera = new THREE.PerspectiveCamera(
  34,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0.18, 4.6);
camera.lookAt(0, 0, 0);

// IBL for believable reflections on the black metal + glossy label
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------- lights ----------
const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(3, 4, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0xbcd6ff, 1.8);
rim.position.set(-4, 2, -3);
scene.add(rim);

scene.add(new THREE.AmbientLight(0xffffff, 0.28));

// coloured accent wash, recoloured per SKU
const accentLight = new THREE.PointLight(0xff2e3a, 18, 12, 2);
accentLight.position.set(-1.6, -1.0, 2.4);
scene.add(accentLight);

// ---------- the product ----------
const rig = new THREE.Group();
scene.add(rig);

let active = 0;
let pouch = null;
let switching = false;
let updateFormula = null;

// connected Shopify store — buy buttons deep-link to its cart/checkout.
// Change SHOP to your custom domain once it's connected (single source of truth).
const SHOP = "vibe-performance-2.myshopify.com";
const COLLECTION = "the-vibe-performance-system";
const cartUrl = (p) => `https://${SHOP}/cart/${p.shopifyVariant}:1`;
const collectionUrl = () => `https://${SHOP}/collections/${COLLECTION}`;
// "build-your-own" full system — one of each SKU in a single checkout
const fullSystemUrl = () =>
  `https://${SHOP}/cart/` + PRODUCTS.map((p) => `${p.shopifyVariant}:1`).join(",");

const spin = { speed: 0.45, base: 0.45 };
const tilt = { x: 0, y: 0 };
let dragging = false;
let lastX = 0;

// camera framing, driven by the hero scroll scrub
const view = { camX: 0, camY: 0.18, camZ: 4.6 };
// the tin is only on-screen for the hero + closer bands; pause rendering elsewhere
let renderActive = true;

function init() {
  initSmoothScroll();
  pouch = createPouch(PRODUCTS[active]);
  pouch.group.rotation.x = 0.12;
  rig.add(pouch.group);

  buildSelector();
  applyFlavour(PRODUCTS[active], true);
  layoutRig();

  gsap.to(loaderEl, { opacity: 0, duration: 0.5, onComplete: () => loaderEl.remove() });
  rig.scale.set(0.6, 0.6, 0.6);
  gsap.to(rig.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: "elastic.out(1, 0.6)" });
  gsap.from(rig.position, { y: -1.2, duration: 1.1, ease: "power3.out" });

  animate();
  setupRange((i) => switchFlavour(i));
  updateFormula = setupFormula();
  updateFormula(PRODUCTS[active]);
  setupNumbers();
  setupRitual();
  setupHeroScroll();
  setupReveals();

  // wire the range-band commerce CTAs to the connected store
  const buySystem = document.getElementById("buy-system");
  if (buySystem) buySystem.href = fullSystemUrl();
  const shopRange = document.getElementById("shop-range");
  if (shopRange) shopRange.href = collectionUrl();

  ScrollTrigger.refresh();
}

// ---------- hero: scroll-scrubbed camera ----------
function setupHeroScroll() {
  // dolly the camera back + up as the hero scrolls away (Apple-style)
  if (!reducedMotion) {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        view.camZ = 4.6 + p * 2.4;
        view.camY = 0.18 + p * 0.6;
        view.camX = p * 0.9;
      },
    });
  }

  // only render the WebGL tin while the hero is on-screen
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => (renderActive = self.isActive),
  });
}

// ---------- flavour selector ----------
function buildSelector() {
  const rail = document.getElementById("selector");
  PRODUCTS.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.className = "flavour-pill" + (i === active ? " active" : "");
    btn.innerHTML = `<span class="dot" style="background:${p.glow};color:${p.glow}"></span>VIBE ${p.name}`;
    btn.addEventListener("click", () => switchFlavour(i));
    rail.appendChild(btn);
  });
}

function switchFlavour(i) {
  if (i === active || switching) return;
  switching = true;
  active = i;
  const p = PRODUCTS[i];

  document.querySelectorAll(".flavour-pill").forEach((el, idx) =>
    el.classList.toggle("active", idx === i)
  );

  applyFlavour(p);

  gsap.to(spin, {
    speed: 9,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () =>
      gsap.to(spin, { speed: spin.base, duration: 0.9, ease: "power3.out" }),
  });
  // standalone callbacks (no shared target -> never overwritten by hover/drag)
  gsap.delayedCall(0.4, () => pouch.setFlavor(p));
  gsap.delayedCall(1.3, () => (switching = false));

  gsap.fromTo(
    rig.position,
    { y: rig.position.y },
    { y: 0.18, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" }
  );
}

// ---------- palette + copy ----------
function applyFlavour(p, instant = false) {
  const root = document.documentElement;
  root.style.setProperty("--accent", p.glow);
  root.style.setProperty("--accent-2", p.glowDeep);

  const c = new THREE.Color(p.glow);
  gsap.to(accentLight.color, { r: c.r, g: c.g, b: c.b, duration: instant ? 0 : 0.8 });

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("eyebrow", p.positioning);
  set("hero-flavour", p.name);
  set("hero-sub", p.blurb);
  set("stat-mg", p.stimulant);
  set("stat-mg-label", p.stimulantLabel);
  set("stat-payload", p.payload);
  set("stat-wear", p.wear);
  const ab = document.getElementById("add-cart");
  if (ab) ab.textContent = `Add to bag — ${p.price}`;
  if (updateFormula) updateFormula(p);
}

// ---------- pointer interaction ----------
canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastX = e.clientX;
  canvas.setPointerCapture(e.pointerId);
  gsap.to(spin, { speed: 0, duration: 0.2 });
});

canvas.addEventListener("pointermove", (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  gsap.to(tilt, { x: ny * 0.18, y: nx * 0.25, duration: 0.6, ease: "power2.out" });
  if (dragging) {
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    rig.rotation.y += dx * 0.01;
  }
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  gsap.to(spin, { speed: spin.base, duration: 1.4, ease: "power2.out" });
}
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

canvas.addEventListener("pointerenter", () =>
  gsap.to(rig.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.5, ease: "power2.out" })
);
canvas.addEventListener("pointerleave", () => {
  gsap.to(rig.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "power2.out" });
  gsap.to(tilt, { x: 0, y: 0, duration: 0.8 });
  endDrag();
});

// add-to-bag micro-interaction
const addBtn = document.getElementById("add-cart");
addBtn.addEventListener("click", (e) => {
  const b = e.currentTarget;
  const p = PRODUCTS[active];
  gsap.fromTo(b, { scale: 1 }, {
    scale: 0.94, duration: 0.1, yoyo: true, repeat: 1,
    onComplete: () => (window.location.href = cartUrl(p)), // → Shopify checkout
  });
});

// newsletter signup (front-end stub)
const newsletter = document.getElementById("newsletter");
if (newsletter) {
  newsletter.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = newsletter.querySelector("input");
    if (!input.checkValidity()) return input.reportValidity();
    newsletter.innerHTML = '<p class="newsletter-thanks">Thanks — you\'re on the list. ✓</p>';
  });
}

// ---------- layout ----------
function layoutRig() {
  const wide = window.innerWidth > 860;
  gsap.to(rig.position, { x: wide ? 1.1 : 0, duration: 0.6, ease: "power2.out" });
}

// ---------- render loop ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  // skip the GPU work while the tin is scrolled off-screen / covered
  if (!renderActive || document.hidden) return;
  if (!dragging) rig.rotation.y += spin.speed * dt;
  rig.rotation.x += (0.12 + tilt.x - rig.rotation.x) * 0.08;
  rig.rotation.z += (tilt.y * 0.4 - rig.rotation.z) * 0.06;
  // camera framing follows the hero scroll scrub
  camera.position.set(view.camX, view.camY, view.camZ);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

// ---------- resize ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  layoutRig();
});

init();
