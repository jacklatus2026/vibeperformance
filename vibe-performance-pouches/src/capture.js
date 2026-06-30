import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// ===================== KNOBS (edit these to re-shoot) =====================
// Square output resolution in pixels.
const RESOLUTION = 2048;
// Locked rig orientation used identically for every SKU (radians).
// x = forward tilt (more = more lid visible); y = turn. The wrap label centres
// the SKU name at the cylinder's ±90° sides, so y = -PI/2 faces a name straight
// at the camera; the raised x-tilt shows more of the lid.
const ANGLE = { x: 0.35, y: -Math.PI / 2 };
// Capture camera field of view (deg). With PADDING this sets the framing.
const CAMERA_FOV = 30;
// Framing headroom — 1.0 = tin touches the frame edges, >1 adds even padding.
const PADDING = 1.2;
// Which background treatments to emit per SKU: "transparent" and/or "white".
const BACKGROUNDS = ["transparent", "white"];
// ==========================================================================

// Exports 8 stills (4 SKUs × transparent + white). Fully isolated: it builds
// its own renderer/camera/environment and restores the rig afterwards, so the
// live scene is left exactly as it was.
export async function runCapture({ scene, rig, PRODUCTS, setFlavor }) {
  // ensure the label font is ready so the canvas textures bake the right type
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (_) { /* ignore */ }
  }

  // dedicated renderer: preserveDrawingBuffer so toBlob() isn't blank; its own
  // GL context, matched to the live renderer's look.
  const cr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  cr.setPixelRatio(1);
  cr.setSize(RESOLUTION, RESOLUTION, false);
  cr.toneMapping = THREE.ACESFilmicToneMapping;
  cr.toneMappingExposure = 1.05;
  cr.outputColorSpace = THREE.SRGBColorSpace;

  // PMREM environment must be regenerated in THIS renderer's context
  const pmrem = new THREE.PMREMGenerator(cr);
  const captureEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const liveEnv = scene.environment;
  scene.environment = captureEnv;

  // freeze the rig at the chosen orientation, centred, full scale
  const prev = {
    rot: rig.rotation.clone(),
    pos: rig.position.clone(),
    scl: rig.scale.clone(),
  };
  rig.rotation.set(ANGLE.x, ANGLE.y, 0);
  rig.position.set(0, 0, 0);
  rig.scale.set(1, 1, 1);
  rig.updateWorldMatrix(true, true);

  // auto-frame: fit the rig's bounding sphere into the square with PADDING
  const sphere = new THREE.Box3().setFromObject(rig).getBoundingSphere(new THREE.Sphere());
  const cam = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  const dist = (sphere.radius * PADDING) / Math.sin(THREE.MathUtils.degToRad(CAMERA_FOV) / 2);
  cam.position.set(sphere.center.x, sphere.center.y, sphere.center.z + dist);
  cam.lookAt(sphere.center);
  cam.updateProjectionMatrix();

  const twoFrames = () =>
    new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));

  for (const p of PRODUCTS) {
    setFlavor(p); // swap tin label/colour + accent light (no scene rebuild)
    await twoFrames(); // let the new textures upload

    const name = p.name.toLowerCase();
    for (const bg of BACKGROUNDS) {
      scene.background = null;
      if (bg === "white") cr.setClearColor(0xffffff, 1);
      else cr.setClearColor(0x000000, 0); // transparent

      cr.render(scene, cam);

      const file =
        bg === "white"
          ? `vibe-${name}-${RESOLUTION}-white.png`
          : `vibe-${name}-${RESOLUTION}.png`;
      await downloadCanvas(cr.domElement, file);
      await twoFrames(); // stagger downloads so they don't collide
    }
  }

  // restore the live scene exactly as it was
  scene.environment = liveEnv;
  rig.rotation.copy(prev.rot);
  rig.position.copy(prev.pos);
  rig.scale.copy(prev.scl);
  captureEnv.dispose();
  pmrem.dispose();
  cr.dispose();

  console.info(`[VIBE] capture complete — ${PRODUCTS.length * BACKGROUNDS.length} PNGs downloaded.`);
}

function downloadCanvas(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, "image/png");
  });
}
