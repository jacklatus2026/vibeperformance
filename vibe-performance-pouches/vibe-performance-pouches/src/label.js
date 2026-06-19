import * as THREE from "three";

// Wrap-around side label for the BLACK tin: near-black base with the SKU colour
// as glowing accent lines/text, white wordmark. Canvas is very wide (wraps the
// circumference) and short (the wall height), laid out as a seamless band.
export function makeLabelTexture(product) {
  const W = 2048;
  const H = 320;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // --- near-black base with a soft vertical sheen ---
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#141417");
  grad.addColorStop(0.5, "#070708");
  grad.addColorStop(1, "#141417");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // diagonal sheen streaks
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#ffffff";
  for (let i = -2; i < 22; i++) {
    ctx.save();
    ctx.translate(i * 130, 0);
    ctx.transform(1, 0, -0.4, 1, 0, 0);
    ctx.fillRect(0, 0, 36, H);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // --- glowing accent hairlines in the SKU colour ---
  ctx.save();
  ctx.shadowColor = product.glow;
  ctx.shadowBlur = 18;
  ctx.fillStyle = product.glow;
  ctx.fillRect(0, 28, W, 3);
  ctx.fillRect(0, H - 31, W, 3);
  ctx.restore();

  // --- top micro-band: repeated brand ribbon ---
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 26px 'Space Grotesk', sans-serif";
  ctx.textBaseline = "middle";
  // tile a whole number of phrases around the can so the wrap seam never cuts a word
  const ribbon = "VIBE°   ·   PERFORMANCE POUCHES   ·   ";
  const rN = Math.max(1, Math.floor(W / ctx.measureText(ribbon).width));
  const rStep = W / rN;
  for (let i = 0; i < rN; i++) ctx.fillText(ribbon, i * rStep, 54);

  // --- centre: SKU name, repeated twice so each face reads it ---
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 104px 'Space Grotesk', sans-serif";
  const name = product.name.toUpperCase();
  ctx.fillText(name, W * 0.25, H * 0.5);
  ctx.fillText(name, W * 0.75, H * 0.5);

  // --- bottom micro-band: stats ribbon in the SKU colour ---
  ctx.textAlign = "left";
  ctx.fillStyle = product.glow;
  ctx.font = "600 24px 'Space Grotesk', sans-serif";
  const stim =
    product.stimulant === "0mg" ? "CAFFEINE-FREE" : `${product.stimulant} ${product.stimulantLabel}`.toUpperCase();
  const meta = `${stim}   ·   ${product.positioning.toUpperCase()}   ·   NICOTINE-FREE   ·   `;
  const mN = Math.max(1, Math.floor(W / ctx.measureText(meta).width));
  const mStep = W / mN;
  for (let i = 0; i < mN; i++) ctx.fillText(meta, i * mStep, H - 52);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// Black brushed-metal lid with an engraved SKU-coloured ring and white logo.
export function makeLidTexture(product) {
  const S = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");

  // brushed black base
  ctx.fillStyle = "#0a0a0c";
  ctx.fillRect(0, 0, S, S);
  const r = ctx.createRadialGradient(S / 2, S / 2, S * 0.08, S / 2, S / 2, S * 0.52);
  r.addColorStop(0, "rgba(255,255,255,0.16)");
  r.addColorStop(0.6, "rgba(255,255,255,0.03)");
  r.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, S, S);

  // engraved ring glowing in the SKU colour
  ctx.save();
  ctx.shadowColor = product.glow;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = product.glow;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // centred white wordmark
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 175px 'Space Grotesk', sans-serif";
  ctx.fillText("VIBE°", S / 2, S / 2 - 14);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 60px 'Space Grotesk', sans-serif";
  ctx.fillText(product.name.toUpperCase(), S / 2, S / 2 + 96);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
