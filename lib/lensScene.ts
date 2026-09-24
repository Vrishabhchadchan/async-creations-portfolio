import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * A 24–70mm-style zoom lens, built procedurally and lit with an
 * environment map so the metal and glass actually reflect their
 * surroundings — that reflection, not extra geometry, is what makes a
 * lens read as an object rather than a picture of one.
 *
 * Axis runs along +Z toward the viewer. Scroll progress (0→1) racks the
 * zoom: the ring turns, the nested barrel sections telescope out, and the
 * camera dollies in until the front element fills the frame.
 */

export interface LensScene {
  setProgress(p: number): void;
  setPointer(nx: number, ny: number): void;
  setActive(on: boolean): void;
  resize(): void;
  onContextLost(cb: () => void): void;
  dispose(): void;
}

type Profile = Array<[number, number]>; // [radius, axial z]

const CLAY = 0xc2612f;

const IRIS_OPEN = 6;
const IRIS_REST = 15;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Revolve a profile about the Z axis. */
function lathe(profile: Profile, material: THREE.Material, segments = 192) {
  const pts = profile.map(([r, z]) => new THREE.Vector2(r, z));
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, segments), material);
  // Lathe revolves about Y; turning it +90° about X lays that axis along +Z.
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

/** A chamfered cylindrical band between z0 and z1. */
function band(r: number, z0: number, z1: number, chamfer = 0.02): Profile {
  return [
    [r - chamfer, z0],
    [r, z0 + chamfer],
    [r, z1 - chamfer],
    [r - chamfer, z1],
  ];
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

/** Fine axial ridges for rubber grips, as a bump map. */
function ridgeBump(count: number) {
  const { canvas, ctx } = makeCanvas(1024, 8);
  const step = canvas.width / count;
  for (let i = 0; i < count; i++) {
    const g = ctx.createLinearGradient(i * step, 0, (i + 1) * step, 0);
    g.addColorStop(0, '#000');
    g.addColorStop(0.5, '#fff');
    g.addColorStop(1, '#000');
    ctx.fillStyle = g;
    ctx.fillRect(i * step, 0, step, canvas.height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Engraved text set around an annulus, mapped planar onto a RingGeometry. */
function ringTextTexture(text: string, innerFrac: number) {
  const size = 2048;
  const { canvas, ctx } = makeCanvas(size, size);
  ctx.fillStyle = '#131110';
  ctx.fillRect(0, 0, size, size);

  const outer = size / 2;
  const mid = outer * ((1 + innerFrac) / 2);
  ctx.translate(outer, outer);
  ctx.fillStyle = '#e4dccb';
  ctx.font = `600 ${Math.round(outer * 0.085)}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = Array.from(text);
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    ctx.save();
    ctx.rotate(i * step);
    ctx.translate(0, -mid);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  // Hairline tick ring just inside the lettering
  ctx.strokeStyle = 'rgba(228,220,203,0.55)';
  for (let i = 0; i < 120; i++) {
    ctx.save();
    ctx.rotate((i / 120) * Math.PI * 2);
    ctx.lineWidth = i % 5 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(0, -outer * innerFrac - 6);
    ctx.lineTo(0, -outer * innerFrac - (i % 5 === 0 ? 30 : 16));
    ctx.stroke();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Distance scale that wraps the barrel (u runs around, v along). */
function scaleBandTexture() {
  const { canvas, ctx } = makeCanvas(2048, 128);
  ctx.fillStyle = '#16130f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ded5c3';
  ctx.strokeStyle = '#ded5c3';
  ctx.textAlign = 'center';
  ctx.font = '600 34px ui-monospace, Menlo, Consolas, monospace';
  const marks = ['0.38', '0.5', '0.7', '1', '1.5', '3', '∞'];
  for (let i = 0; i < 28; i++) {
    const x = (i / 28) * canvas.width;
    ctx.lineWidth = i % 4 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x, i % 4 === 0 ? 46 : 30);
    ctx.stroke();
    if (i % 4 === 0) ctx.fillText(marks[(i / 4) % marks.length], x, 92);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function irisBladeGeometry() {
  // Hand-set from the vector iris: a curved-edge blade hinged at its
  // outer tip. Local origin is the hinge.
  const k = 0.0026;
  const P = (x: number, y: number) => [(x - 176) * k, -y * k] as const;
  const s = new THREE.Shape();
  s.moveTo(...P(176, 0));
  const c1 = P(122, -2);
  const a = P(74, 20);
  s.quadraticCurveTo(c1[0], c1[1], a[0], a[1]);
  const b = P(83, 82);
  s.lineTo(b[0], b[1]);
  const c2 = P(132, 112);
  const e = P(182, 152);
  s.quadraticCurveTo(c2[0], c2[1], e[0], e[1]);
  s.closePath();
  return { geometry: new THREE.ShapeGeometry(s, 16), hingeRadius: 176 * k };
}

export function createLensScene(container: HTMLElement, opts: { reduced: boolean }): LensScene {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'lens-3d-canvas';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  // ---- Lighting: warm key, cool rim, and a clay kicker echoing the site ----
  const key = new THREE.DirectionalLight(0xffe4c4, 2.4);
  key.position.set(-5, 4, 7);
  const rim = new THREE.DirectionalLight(0xbcd2ff, 1.6);
  rim.position.set(6, 2, -4);
  const kicker = new THREE.PointLight(CLAY, 18, 14, 2);
  kicker.position.set(3.2, -2.4, 4.5);
  scene.add(key, rim, kicker);

  const disposables: Array<{ dispose(): void }> = [envTex, pmrem];
  const track = <T extends { dispose(): void }>(o: T) => {
    disposables.push(o);
    return o;
  };

  // ---- Materials ----
  const blackAnodised = track(
    new THREE.MeshStandardMaterial({ color: 0x171512, metalness: 0.75, roughness: 0.42, side: THREE.DoubleSide }),
  );
  const chrome = track(
    new THREE.MeshStandardMaterial({ color: 0xd9d2c6, metalness: 1, roughness: 0.2, side: THREE.DoubleSide }),
  );
  const satinTube = track(
    new THREE.MeshStandardMaterial({ color: 0xa8a196, metalness: 1, roughness: 0.34, side: THREE.DoubleSide }),
  );
  const focusRubber = track(
    new THREE.MeshStandardMaterial({
      color: 0x0d0c0b,
      metalness: 0.15,
      roughness: 0.78,
      bumpMap: track(ridgeBump(96)),
      bumpScale: 3,
      side: THREE.DoubleSide,
    }),
  );
  const zoomRubber = track(
    new THREE.MeshStandardMaterial({
      color: 0x0d0c0b,
      metalness: 0.15,
      roughness: 0.72,
      bumpMap: track(ridgeBump(56)),
      bumpScale: 3.5,
      side: THREE.DoubleSide,
    }),
  );
  const scaleMat = track(
    new THREE.MeshStandardMaterial({
      map: track(scaleBandTexture()),
      metalness: 0.4,
      roughness: 0.55,
      side: THREE.DoubleSide,
    }),
  );
  const clayMat = track(
    new THREE.MeshStandardMaterial({ color: CLAY, metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide }),
  );
  const darkVoid = track(
    new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.2, roughness: 0.9, side: THREE.DoubleSide }),
  );
  const bladeMat = track(
    new THREE.MeshStandardMaterial({ color: 0x3b352e, metalness: 0.9, roughness: 0.38, side: THREE.DoubleSide }),
  );
  const glassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x0b1118,
      metalness: 0,
      roughness: 0.03,
      transparent: true,
      opacity: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      iridescence: 1,
      iridescenceIOR: 1.55,
      iridescenceThicknessRange: [160, 460],
      envMapIntensity: 2.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const glassDeepMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x06090d,
      metalness: 0,
      roughness: 0.05,
      transparent: true,
      opacity: 0.4,
      clearcoat: 1,
      iridescence: 0.8,
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [120, 380],
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );

  // ---- Assembly ----
  const root = new THREE.Group();
  scene.add(root);

  // Fixed body
  root.add(lathe(band(0.82, -1.55, -1.32, 0.03), chrome, 128));
  root.add(lathe(band(0.97, -1.32, -0.42, 0.03), blackAnodised));
  root.add(lathe([[0.985, -0.43], [0.985, -0.4]], chrome, 128));

  // Focus ring (turns slowly, as if racked)
  const focusGroup = new THREE.Group();
  focusGroup.add(lathe(band(1.0, -0.4, 0.12, 0.035), focusRubber, 256));
  root.add(focusGroup);

  // Distance scale band
  root.add(lathe(band(0.985, 0.12, 0.34, 0.012), scaleMat, 192));

  // Zoom ring (driven by scroll)
  const zoomGroup = new THREE.Group();
  zoomGroup.add(lathe(band(1.0, 0.34, 0.96, 0.035), zoomRubber, 256));
  zoomGroup.add(lathe(band(1.004, 0.93, 0.965, 0.006), clayMat, 128));
  root.add(zoomGroup);

  // Shadowed gap between the zoom ring and the tube emerging from it
  const gap = new THREE.Mesh(new THREE.RingGeometry(0.9, 0.985, 96), darkVoid);
  gap.position.z = 0.955;
  root.add(gap);
  disposables.push(gap.geometry);

  // Telescoping tube 1
  const tube1 = new THREE.Group();
  tube1.add(lathe(band(0.9, 0.7, 1.8, 0.02), satinTube, 192));
  root.add(tube1);

  // Front group: sleeve, glass stack, iris, engraved front face
  const front = new THREE.Group();
  front.add(lathe(band(0.84, 1.45, 2.32, 0.025), blackAnodised, 192));
  front.add(lathe(band(0.87, 1.74, 1.8, 0.01), chrome, 128));
  // inner bore
  front.add(lathe([[0.7, 1.5], [0.7, 2.3]], darkVoid, 128));
  front.add(lathe([[0.7, 1.5], [0.0, 1.5]], darkVoid, 64));

  // Chrome filter lip
  front.add(
    lathe(
      [
        [0.845, 2.3],
        [0.86, 2.325],
        [0.86, 2.345],
        [0.72, 2.345],
        [0.705, 2.32],
        [0.705, 2.3],
      ],
      chrome,
      192,
    ),
  );

  // Engraved front face
  const faceTex = track(ringTextTexture('ASYNC CREATION · 24-70mm 1:2.8 · PUNE · ', 0.82));
  const faceMat = track(
    new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.55, roughness: 0.5, side: THREE.DoubleSide }),
  );
  const face = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.845, 160), faceMat);
  // Ring UVs are planar over the outer radius; remap so the texture spans it.
  const uv = face.geometry.attributes.uv as THREE.BufferAttribute;
  const pos = face.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, pos.getX(i) / 0.845 / 2 + 0.5, pos.getY(i) / 0.845 / 2 + 0.5);
  }
  face.position.z = 2.3;
  front.add(face);
  disposables.push(face.geometry);

  // Clay accent index mark on the face
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.012), clayMat);
  mark.position.set(0, 0.79, 2.348);
  front.add(mark);
  disposables.push(mark.geometry);

  // Glass elements at staggered depths so the eye finds parallax inside the barrel
  const cap = (r: number, z: number, sag: number, mat: THREE.Material) => {
    const pts: Profile = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const rr = (i / steps) * r;
      pts.push([rr, z + sag * (1 - (rr / r) * (rr / r))]);
    }
    return lathe(pts, mat, 96);
  };
  const retainer = (rIn: number, rOut: number, z: number) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 128), chrome);
    m.position.z = z;
    disposables.push(m.geometry);
    front.add(m);
  };
  retainer(0.66, 0.705, 2.17);
  retainer(0.6, 0.705, 1.95);
  retainer(0.55, 0.705, 1.74);
  front.add(cap(0.69, 2.16, 0.13, glassMat));
  front.add(cap(0.64, 1.94, -0.05, glassDeepMat));
  front.add(cap(0.58, 1.74, 0.09, glassDeepMat));

  // Iris
  const { geometry: bladeGeo, hingeRadius } = irisBladeGeometry();
  disposables.push(bladeGeo);
  const BLADES = 9;
  const bladePivots: THREE.Group[] = [];
  for (let i = 0; i < BLADES; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i / BLADES) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.position.set(hingeRadius, 0, 1.58 + i * 0.0025);
    pivot.add(new THREE.Mesh(bladeGeo, bladeMat));
    arm.add(pivot);
    front.add(arm);
    bladePivots.push(pivot);
  }
  const setIris = (deg: number) => bladePivots.forEach((b) => (b.rotation.z = -rad(deg)));
  setIris(IRIS_REST);

  root.add(front);

  // Soft blob under the lens so it sits on the page rather than floating
  const shadowTex = (() => {
    const { canvas, ctx } = makeCanvas(256, 256);
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(40,24,12,0.34)');
    g.addColorStop(1, 'rgba(40,24,12,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return track(new THREE.CanvasTexture(canvas));
  })();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.5), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -1.65, 0.4);
  scene.add(shadow);
  disposables.push(shadow.geometry, shadowMat);

  // ---- Animation state ----
  let target = 0; // scroll progress the page asked for
  let current = 0; // eased toward target each frame
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let active = true;
  let raf = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let contextLostCb: (() => void) | null = null;

  const look = new THREE.Vector3();
  let viewW = 1;
  let viewH = 1;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!active || document.hidden) {
      lastTime = now;
      return;
    }
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    elapsed += dt;

    current += (target - current) * (1 - Math.pow(0.001, dt)); // frame-rate independent ease
    pointer.sx += (pointer.x - pointer.sx) * 0.06;
    pointer.sy += (pointer.y - pointer.sy) * 0.06;

    const e = easeInOut(clamp01(current));

    // Mechanics: the ring turns, the barrel sections slide out in turn
    zoomGroup.rotation.z = e * 2.1;
    focusGroup.rotation.z = -e * 0.7 + (opts.reduced ? 0 : elapsed * 0.05);
    tube1.position.z = e * 0.66;
    front.position.z = e * 1.32;
    setIris(lerp(IRIS_REST, IRIS_OPEN, e) + (opts.reduced ? 0 : Math.sin(elapsed * 0.9) * 3));

    // Camera: swings from a three-quarter view toward head-on and dollies in
    const az = rad(lerp(-26, -5, e) + pointer.sx * 5);
    const el = rad(lerp(13, 3, e) - pointer.sy * 4);
    const dist = lerp(9.4, 4.1, e);
    const zc = lerp(0.35, 2.15 + front.position.z, e);
    look.set(0, 0, zc);
    camera.position.set(
      Math.sin(az) * Math.cos(el) * dist,
      Math.sin(el) * dist,
      zc + Math.cos(az) * Math.cos(el) * dist,
    );
    camera.fov = lerp(30, 23, e);
    // The canvas spans the whole hero, but the lens rests in its right-hand
    // column (centre at 76% of the width) and drifts to centre as it dives.
    camera.setViewOffset(viewW, viewH, -viewW * lerp(0.26, 0, e), 0, viewW, viewH);
    camera.lookAt(look);

    // Idle drift so it never feels pinned to the page
    if (!opts.reduced) root.rotation.y = Math.sin(elapsed * 0.35) * 0.035;

    shadowMat.opacity = clamp01(1 - e * 4);
    key.position.x = -5 + pointer.sx * 1.5;
    renderer.render(scene, camera);
  }

  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    viewW = w;
    viewH = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  renderer.domElement.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault();
    cancelAnimationFrame(raf);
    contextLostCb?.();
  });

  raf = requestAnimationFrame(frame);

  return {
    setProgress(p) {
      target = clamp01(p);
    },
    setPointer(nx, ny) {
      pointer.x = Math.max(-1, Math.min(1, nx));
      pointer.y = Math.max(-1, Math.min(1, ny));
    },
    setActive(on) {
      active = on;
    },
    resize,
    onContextLost(cb) {
      contextLostCb = cb;
    },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

