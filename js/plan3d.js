// Planta em 3D: maquete giratória do apartamento, montada a partir da planta de divulgação.
// Medidas aproximadas (metros), apenas ilustrativas. x = largura, z = profundidade.
import * as THREE from 'three';

export const PLANS = {
  t02: {
    rooms: [
      { n: 'Sacada · churrasqueira', x: 0, z: 0, w: 1.5, d: 2.2, f: 'stone', open: true },
      { n: 'Estar · jantar · cozinha', x: 1.5, z: 0, w: 4, d: 5.4, f: 'tile' },
      { n: 'Banheiro', x: 1.5, z: 5.4, w: 2.7, d: 1.5, f: 'tile' },
      { n: '', x: 4.2, z: 5.4, w: 1.3, d: 5, f: 'wood' },
      { n: 'Quarto', x: 1.5, z: 6.9, w: 2.7, d: 3.5, f: 'wood' },
      { n: 'Quarto com sacada', x: 1.5, z: 10.4, w: 4, d: 3.4, f: 'wood' },
      { n: 'Sacada privativa', x: 0, z: 10.6, w: 1.5, d: 3.2, f: 'stone', open: true },
    ],
    openings: [[1.5, 0.4, 1.5, 1.8], [4.3, 5.4, 5.4, 5.4], [4.2, 5.7, 4.2, 6.5], [4.2, 7.3, 4.2, 8.2], [4.3, 10.4, 5.3, 10.4], [1.5, 11.2, 1.5, 13]],
    rails: [[0, 0, 1.5, 0], [0, 0, 0, 2.2], [0, 2.2, 1.5, 2.2], [0, 10.6, 1.5, 10.6], [0, 10.6, 0, 13.8], [0, 13.8, 1.5, 13.8]],
    items: [
      ['grill', 0.15, 0.15, 0.75, 0.6], ['counter', 1.7, 0.1, 2.9, 0.6], ['fridge', 4.65, 0.1, 0.7, 0.7],
      ['table', 3.4, 2.3, 0.58], ['rug', 1.9, 3.3, 3, 1.9], ['sofa', 2.2, 4.3, 2.2, 0.9, 's'],
      ['wc', 1.7, 5.6], ['sink', 3.1, 5.5, 0.9, 0.5],
      ['bed', 1.8, 7.05, 1.5, 2, 'n'], ['wardrobe', 1.65, 9.75, 2.4, 0.55],
      ['bed', 2.7, 11.65, 1.6, 2, 's'], ['wardrobe', 4.85, 10.6, 0.55, 2.4], ['chair', 0.45, 12.6],
    ],
  },
  t03: {
    rooms: [
      { n: 'Quarto 1', x: 0, z: 0, w: 3, d: 4.2, f: 'wood' },
      { n: 'Sacada privativa', x: 3, z: 0, w: 2.8, d: 0.9, f: 'stone', open: true },
      { n: 'Quarto 2', x: 3, z: 0.9, w: 2.8, d: 4.6, f: 'wood' },
      { n: 'Banheiro', x: 0, z: 4.2, w: 1.9, d: 2.8, f: 'tile' },
      { n: '', x: 1.9, z: 4.2, w: 1.1, d: 1.7, f: 'wood' },
      { n: 'Estar · jantar · cozinha', x: 1.9, z: 5.9, w: 4.3, d: 6.1, f: 'tile' },
    ],
    openings: [[2, 4.2, 2.85, 4.2], [3, 4.4, 3, 5.3], [1.9, 4.6, 1.9, 5.4], [1.95, 5.9, 2.95, 5.9], [3.5, 0.9, 5.3, 0.9]],
    rails: [[3, 0, 5.8, 0], [5.8, 0, 5.8, 0.9]],
    items: [
      ['bed', 0.7, 0.25, 1.6, 2, 'n'], ['wardrobe', 0.15, 3.5, 1.7, 0.55],
      ['bed', 3.2, 3.3, 1.5, 2, 's'], ['wardrobe', 5.1, 1.1, 0.55, 2.3],
      ['wc', 0.2, 6.1], ['sink', 0.15, 4.4, 0.5, 0.9],
      ['table', 3.3, 7.2, 0.58], ['counter', 5.5, 6.05, 0.6, 3.3], ['fridge', 5.4, 9.4, 0.7, 0.7],
      ['rug', 2.2, 9.5, 2.9, 1.9], ['sofa', 2.5, 10.9, 2.2, 0.9, 's'],
    ],
  },
};

const FLOORS = { wood: 0xc9a67c, tile: 0xe9e3d8, stone: 0xb9b2a6 };
const WALL_H = 1.25, WALL_T = 0.12;

// remove dos trechos de parede [a,b] os vãos de porta
function cut(a, b, holes) {
  let out = [[a, b]];
  for (const [h0, h1] of holes) out = out.flatMap(([s, e]) => (h1 <= s || h0 >= e ? [[s, e]] : [[s, Math.min(e, h0)], [Math.max(s, h1), e]].filter(([p, q]) => q - p > 0.02)));
  return out;
}

export function createPlan(container, plan) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Planta do apartamento em 3D. Arraste para girar.');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9c8ae, 1.9));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.3);
  sun.position.set(-7, 14, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
  sun.shadow.bias = -0.001; sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // centraliza a planta na origem
  const maxX = Math.max(...plan.rooms.map((r) => r.x + r.w)), maxZ = Math.max(...plan.rooms.map((r) => r.z + r.d));
  const g = new THREE.Group(); g.position.set(-maxX / 2, 0, -maxZ / 2); scene.add(g);
  const mats = {};
  const mat = (c, rough = 0.85) => (mats[c + rough] ??= new THREE.MeshStandardMaterial({ color: c, roughness: rough }));
  const box = (x, y, z, w, h, d, c, rough) => { // canto (x,z), base y
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, rough));
    m.position.set(x + w / 2, y + h / 2, z + d / 2); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  const cyl = (x, y, z, r, h, c) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28), mat(c));
    m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };

  box(-0.15, -0.2, -0.15, maxX + 0.3, 0.02, maxZ + 0.3, 0xe1d6c4).castShadow = false; // base
  const eq = (a, b) => Math.abs(a - b) < 0.01;
  for (const r of plan.rooms) {
    box(r.x, -0.18, r.z, r.w, 0.18, r.d, FLOORS[r.f], r.f === 'tile' ? 0.35 : 0.7);
    if (r.open) continue;
    const edges = [[r.x, r.z, r.x + r.w, r.z], [r.x, r.z + r.d, r.x + r.w, r.z + r.d], [r.x, r.z, r.x, r.z + r.d], [r.x + r.w, r.z, r.x + r.w, r.z + r.d]];
    for (const [x1, z1, x2, z2] of edges) {
      const horiz = eq(z1, z2);
      const holes = plan.openings.filter((o) => (horiz ? eq(o[1], z1) && eq(o[3], z1) : eq(o[0], x1) && eq(o[2], x1))).map((o) => (horiz ? [o[0], o[2]] : [o[1], o[3]]));
      for (const [a, b] of cut(horiz ? x1 : z1, horiz ? x2 : z2, holes)) {
        if (horiz) box(a - WALL_T / 2, 0, z1 - WALL_T / 2, b - a + WALL_T, WALL_H, WALL_T, 0xf6f2ea);
        else box(x1 - WALL_T / 2, 0, a - WALL_T / 2, WALL_T, WALL_H, b - a + WALL_T, 0xf6f2ea);
      }
    }
  }
  for (const [x1, z1, x2, z2] of plan.rails) { // guarda-corpo das sacadas
    const horiz = eq(z1, z2), len = horiz ? x2 - x1 : z2 - z1;
    if (horiz) box(x1, 0.86, z1 - 0.025, len, 0.05, 0.05, 0x1c1c1e); else box(x1 - 0.025, 0.86, z1, 0.05, 0.05, len, 0x1c1c1e);
    for (let t = 0; t <= len + 0.01; t += 0.14) box((horiz ? x1 + t : x1) - 0.012, 0, (horiz ? z1 : z1 + t) - 0.012, 0.024, 0.86, 0.024, 0x1c1c1e).castShadow = false;
  }

  const build = {
    bed(x, z, w, d, head) {
      const n = head === 'n';
      box(x, 0, z, w, 0.3, d, 0xd8cbb8); box(x + 0.04, 0.3, z + 0.04, w - 0.08, 0.18, d - 0.08, 0xf6f2ea);
      box(x, 0, n ? z - 0.1 : z + d, w, 0.95, 0.1, 0xc4ad8e);
      box(x + 0.02, 0.44, n ? z + d * 0.45 : z + 0.04, w - 0.04, 0.07, d * 0.5, 0xb39f86);
      for (const px of [x + 0.14, x + w / 2 + 0.06]) box(px, 0.48, n ? z + 0.14 : z + d - 0.5, w / 2 - 0.2, 0.12, 0.36, 0xffffff);
    },
    sofa(x, z, w, d) {
      box(x, 0, z, w, 0.4, d, 0xece6da); box(x, 0.4, z + d - 0.22, w, 0.42, 0.22, 0xe3dccf);
      box(x, 0.4, z, 0.18, 0.22, d - 0.22, 0xe3dccf); box(x + w - 0.18, 0.4, z, 0.18, 0.22, d - 0.22, 0xe3dccf);
      box(x + 0.3, 0.4, z + 0.3, 0.42, 0.14, 0.36, 0xc9a45c);
    },
    table(x, z, r) {
      cyl(x, 0.7, z, r, 0.05, 0xc9a273); cyl(x, 0, z, 0.16, 0.7, 0xb89263);
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4, cx = x + Math.cos(a) * (r + 0.22), cz = z + Math.sin(a) * (r + 0.22);
        cyl(cx, 0, cz, 0.21, 0.44, 0xf3eee4);
        const back = box(-0.2, 0.44, -0.03, 0.4, 0.36, 0.06, 0xf3eee4);
        back.position.set(x + Math.cos(a) * (r + 0.42), 0.62, z + Math.sin(a) * (r + 0.42)); back.rotation.y = Math.PI / 2 - a;
      }
    },
    counter(x, z, w, d) {
      box(x, 0, z, w, 0.86, d, 0xf3eee4); box(x - 0.01, 0.86, z - 0.01, w + 0.02, 0.04, d + 0.02, 0x26262a, 0.3);
      const long = w > d; // cooktop e cuba
      box(long ? x + w * 0.2 : x + 0.1, 0.9, long ? z + 0.1 : z + d * 0.2, long ? 0.6 : d > w ? w - 0.2 : 0.4, 0.015, long ? d - 0.2 : 0.6, 0x0c0c0d, 0.2);
      box(long ? x + w * 0.62 : x + 0.12, 0.895, long ? z + 0.12 : z + d * 0.62, long ? 0.55 : w - 0.24, 0.012, long ? d - 0.24 : 0.55, 0xb9bcc0, 0.3);
    },
    fridge(x, z, w, d) { box(x, 0, z, w, 1.2, d, 0xb4b8bd, 0.35); },
    wardrobe(x, z, w, d) { box(x, 0, z, w, 1.2, d, 0xb9966b); box(x + (w > d ? w / 2 - 0.01 : 0), 0, z + (w > d ? 0 : d / 2 - 0.01), w > d ? 0.02 : w + 0.005, 1.205, w > d ? d + 0.005 : 0.02, 0x8f6f48); },
    wc(x, z) { box(x, 0, z, 0.4, 0.4, 0.55, 0xffffff, 0.3); box(x, 0.4, z, 0.4, 0.3, 0.16, 0xffffff, 0.3); },
    sink(x, z, w, d) { box(x, 0, z, w, 0.8, d, 0xdccfbb); box(x + 0.08, 0.8, z + 0.08, w - 0.16, 0.05, d - 0.16, 0xffffff, 0.3); },
    rug(x, z, w, d) { box(x, 0, z, w, 0.02, d, 0xd9ccb6, 1).castShadow = false; },
    grill(x, z, w, d) { box(x, 0, z, w, 0.9, d, 0x8a5a44); box(x + 0.08, 0.9, z + 0.08, w - 0.16, 0.05, d - 0.16, 0x1c1c1e); },
    chair(x, z) { cyl(x + 0.3, 0, z + 0.3, 0.3, 0.42, 0xd9ccb6); },
  };
  for (const [type, ...args] of plan.items) build[type](...args);

  // rótulos dos ambientes (HTML, sempre nítidos)
  const labels = plan.rooms.filter((r) => r.n).map((r) => {
    const el = document.createElement('span');
    el.className = 'plan-label'; el.textContent = r.n; container.appendChild(el);
    return { el, p: new THREE.Vector3(r.x + r.w / 2 - maxX / 2, WALL_H + 0.2, r.z + r.d / 2 - maxZ / 2) };
  });

  const span = Math.hypot(maxX, maxZ);
  let az = -0.65, goalAz = az, W = 1, H = 1, raf = 0, prev = performance.now(), touched = 0, drag = null;
  const resize = () => {
    W = container.clientWidth; H = container.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  canvas.addEventListener('pointerdown', (e) => { drag = e.clientX; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); });
  canvas.addEventListener('pointermove', (e) => { if (drag === null) return; goalAz -= (e.clientX - drag) * 0.009; drag = e.clientX; touched = performance.now(); });
  const end = () => { drag = null; canvas.classList.remove('dragging'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v = new THREE.Vector3();
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    if (!calm && drag === null && now - touched > 4000) goalAz += dt * 0.12;
    az += (goalAz - az) * (1 - Math.exp(-dt * 7));
    const rad = span * 1.7 / Math.min(1, camera.aspect * 0.9), pol = 0.6;
    camera.position.set(rad * Math.sin(pol) * Math.sin(az), rad * Math.cos(pol), rad * Math.sin(pol) * Math.cos(az));
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    for (const { el, p } of labels) {
      v.copy(p).project(camera);
      el.style.transform = `translate(-50%,-50%) translate(${((v.x + 1) / 2 * W).toFixed(1)}px,${((1 - v.y) / 2 * H).toFixed(1)}px)`;
    }
  };
  raf = requestAnimationFrame(tick);

  return {
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect();
      scene.traverse((o) => o.geometry?.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      renderer.dispose(); renderer.forceContextLoss();
      canvas.remove(); labels.forEach((l) => l.el.remove());
    },
  };
}
