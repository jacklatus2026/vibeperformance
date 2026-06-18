# VIBE° — Performance Pouches (3D product site)

An interactive single-page site for the **VIBE Performance System** — four matte-black
functional-pouch tins, each with a glowing LED-style ring, rendered in real time with
**Three.js / WebGL**, bloom-lit, and animated with **GSAP**.

> Full-Spectrum Performance — *where performance matters, precision is everything.*

## The range

| SKU | Positioning | Ring | Primary stimulant |
|-----|-------------|------|-------------------|
| **VIBE PRO** | Intensity | red | 75mg caffeine |
| **VIBE ENDURE** | Endurance | green | 30mg caffeine |
| **VIBE FOCUS** | Deep Work | blue | 100mg paraxanthine |
| **VIBE CALM** | Recovery | purple | caffeine-free |

## What it does

- **Real-time 3D tin** — a matte-black puck with PBR materials, image-based lighting,
  white lid artwork, and an **emissive accent ring** pushed through an Unreal **bloom**
  pass so it glows like the real product.
- **Drag to spin** with release inertia, **hover to lean** toward the cursor + scale,
  plus a gentle idle auto-spin.
- **SKU switcher** — clicking a tin spins it up fast, swaps the ring colour + lid text at
  the blurred peak, and cross-fades the page's accent glow/copy/stats in parallel (GSAP).
- **No build step** — native ES modules via an import map; Three.js + GSAP from CDN.

## Run it

```
Double-click  start.cmd        (Windows, no install needed)
```
or any static server, then open the printed URL:
```
npx serve .      |     python -m http.server 8000
```
ES modules need `http://`, not `file://`.

## Architecture

```
index.html        # markup + import map (three / addons / gsap)
styles.css        # dark cinematic UI; accent driven by CSS custom props
src/
  products.js     # the 4 SKUs (glow colour, positioning, stats) — single source of truth
  label.js        # canvas lid artwork + additive glow-halo texture
  pouch.js        # procedural black tin: body + emissive ring + halo + lid
  main.js         # scene, IBL, bloom composer, GSAP interactions, SKU switching
blender/
  generate_pouch.py   # OPTIONAL: models the tin → models/pouch.glb
server.ps1 / start.cmd # tiny static server + double-click launcher (no Node/Python)
```

## Tech

| Concern     | Choice                                              |
| ----------- | --------------------------------------------------- |
| Rendering   | Three.js 0.160 (WebGL), ACES tonemapping            |
| Lighting    | PMREM + RoomEnvironment IBL                         |
| Glow        | EffectComposer + UnrealBloomPass on the emissive ring |
| Animation   | GSAP 3.12 (timelines, inertia, accent cross-fade)   |
| Modelling   | procedural in-browser (Blender → glTF optional)     |
| Build       | none — native ES modules + import map               |

The site renders with **zero asset files** — the tin is built procedurally in `pouch.js`.
`blender/generate_pouch.py` is an optional higher-fidelity modelling path; keep its
proportions (`R`, `HH`, `CR`, `SEAM_Y`) in sync with `pouch.js`.
