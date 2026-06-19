import * as THREE from "three";
import { makeLabelTexture, makeLidTexture } from "./label.js";

// Snus-style tin: wrapped side label + rounded metallic shoulders + a lid disc.
// Rendered in BLACK (dark satin metal) with the SKU colour as a glowing accent
// baked into the label/lid textures.
const R = 1.0;            // body radius
const HH = 0.26;          // half-height to the top of the rounded shoulder
const CR = 0.07;          // corner radius of the shoulder
const WALL_H = (HH - CR) * 2; // straight wall height (carries the label)

// Lathe profile for the rounded top cap: arc over the shoulder, then flat lid.
function capProfile() {
  const pts = [];
  const cx = R - CR;
  const cy = HH - CR;
  const SEG = 10;
  for (let i = 0; i <= SEG; i++) {
    const a = (Math.PI / 2) * (i / SEG);
    pts.push(new THREE.Vector2(cx + Math.cos(a) * CR, cy + Math.sin(a) * CR));
  }
  pts.push(new THREE.Vector2(0, HH));
  return pts;
}

export function createPouch(product) {
  const group = new THREE.Group();

  let labelTex = makeLabelTexture(product);
  let lidTex = makeLidTexture(product);

  // glossy black label wall
  const labelMat = new THREE.MeshPhysicalMaterial({
    map: labelTex,
    roughness: 0.42,
    metalness: 0.1,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
  });
  // dark satin metal for the shoulders / rim
  const metalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x16161a),
    metalness: 0.92,
    roughness: 0.4,
    clearcoat: 0.3,
  });
  // black brushed-metal lid — leave colour white so the texture (which already
  // has a black base + white VIBE° logo) is not multiplied away.
  const lidMat = new THREE.MeshPhysicalMaterial({
    map: lidTex,
    metalness: 0.6,
    roughness: 0.42,
    clearcoat: 0.25,
  });

  // body wall (open-ended cylinder, carries the wrap label)
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, WALL_H, 96, 1, true),
    labelMat
  );
  body.name = "Vibe_Label";
  group.add(body);

  // bottom cap stays with the body
  const capGeo = new THREE.LatheGeometry(capProfile(), 96);
  const botCap = new THREE.Mesh(capGeo, metalMat);
  botCap.scale.y = -1;
  botCap.name = "Vibe_Cap_Bottom";
  group.add(botCap);

  // openable lid assembly (top shoulder + lid disc) — lifts off on "explode"
  const capGroup = new THREE.Group();
  const topCap = new THREE.Mesh(capGeo, metalMat);
  topCap.name = "Vibe_Cap_Top";
  capGroup.add(topCap);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(R - CR, 96), lidMat);
  lid.rotation.x = -Math.PI / 2;
  lid.position.y = HH + 0.001;
  lid.name = "Vibe_Lid";
  capGroup.add(lid);
  group.add(capGroup);

  // pouches tucked inside, revealed on explode
  const pouchMat = new THREE.MeshStandardMaterial({ color: 0xf2f3f6, roughness: 0.85, metalness: 0.0 });
  const pouches = [];
  for (let i = 0; i < 3; i++) {
    const pch = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.13, 48), pouchMat);
    pch.visible = false;
    pch.position.y = -0.02 + i * 0.02;
    pouches.push(pch);
    group.add(pch);
  }

  function setFlavor(next) {
    const freshLabel = makeLabelTexture(next);
    const freshLid = makeLidTexture(next);
    labelMat.map = freshLabel;
    labelMat.needsUpdate = true;
    lidMat.map = freshLid;
    lidMat.needsUpdate = true;
    labelTex.dispose();
    lidTex.dispose();
    labelTex = freshLabel;
    lidTex = freshLid;
  }

  // t: 0 = closed tin, 1 = lid off + pouches lifted out and fanned
  function setExplode(t) {
    const e = Math.max(0, Math.min(1, t));
    capGroup.position.y = e * 1.3;
    capGroup.rotation.z = e * 0.1;
    const tt = Math.max(0, (e - 0.12) / 0.88);
    pouches.forEach((p, i) => {
      p.visible = e > 0.04;
      p.scale.setScalar(Math.max(0.0001, tt));
      p.position.y = -0.02 + i * 0.02 + tt * 0.5;
      p.position.x = (i - 1) * 0.55 * tt;
      p.rotation.z = (i - 1) * 0.22 * tt;
    });
  }

  return { group, setFlavor, setExplode, kind: "procedural" };
}
