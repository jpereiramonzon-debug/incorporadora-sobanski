// Planta em 3D: maquete giratória do apartamento, montada a partir da planta de divulgação.
// Medidas aproximadas (metros), apenas ilustrativas. x = largura, z = profundidade.
import * as THREE from 'three';

// Plantas medidas diretamente sobre as plantas oficiais (tools/plantas-3d.py gera plan3d-data.js):
// paredes, portas e cada móvel na mesma posição, tamanho e orientação do desenho de divulgação.
import { PLANS } from './plan3d-data.js';
export { PLANS };

const WALL_H = 1.25, WALL_T = 0.12;

// remove dos trechos de parede [a,b] os vãos de porta
function cut(a, b, holes) {
  let out = [[a, b]];
  for (const [h0, h1] of holes) out = out.flatMap(([s, e]) => (h1 <= s || h0 >= e ? [[s, e]] : [[s, Math.min(e, h0)], [Math.max(s, h1), e]].filter(([p, q]) => q - p > 0.02)));
  return out;
}

/* ---------- texturas de piso (geradas uma vez, compartilhadas) ---------- */
const texCache = {};
function ctex(key, draw, size = 512) {
  if (texCache[key]) return texCache[key];
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return (texCache[key] = t);
}
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const woodTex = () => ctex('wood', (g, s) => { // tábuas de carvalho com veio e variação de tom
  const rows = 6, ph = s / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * s;
    while (x < s) {
      const len = s * (0.45 + rnd() * 0.5), l = 52 + rnd() * 9;
      g.fillStyle = `hsl(32,${36 + rnd() * 8}%,${l}%)`; g.fillRect(x, r * ph, len, ph);
      for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(90,55,25,${0.05 + rnd() * 0.08})`; g.lineWidth = 0.6 + rnd(); const y = r * ph + rnd() * ph; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * 0.3, y + (rnd() - 0.5) * 6, x + len * 0.7, y + (rnd() - 0.5) * 6, x + len, y); g.stroke(); }
      g.fillStyle = 'rgba(60,36,18,.45)'; g.fillRect(x, r * ph, 1.5, ph);
      x += len;
    }
    g.fillStyle = 'rgba(60,36,18,.4)'; g.fillRect(0, r * ph, s, 1.2);
  }
});
const tileTex = () => ctex('tile', (g, s) => { // porcelanato claro 4x4 com rejunte fino e leve nuvem
  g.fillStyle = '#ebe5da'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${200 + rnd() * 40},${190 + rnd() * 40},${175 + rnd() * 40},.08)`; g.beginPath(); g.arc(rnd() * s, rnd() * s, 8 + rnd() * 40, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(150,140,125,.55)'; const n = 4;
  for (let i = 0; i <= n; i++) { g.fillRect(i * s / n - 1, 0, 2, s); g.fillRect(0, i * s / n - 1, s, 2); }
});
const stoneTex = () => ctex('stone', (g, s) => { // piso da sacada: pedra cinza com granulado
  g.fillStyle = '#b8b1a5'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 5000; i++) { const v = 140 + rnd() * 90; g.fillStyle = `rgba(${v},${v - 6},${v - 14},.5)`; g.fillRect(rnd() * s, rnd() * s, 1 + rnd() * 2, 1 + rnd() * 2); }
  g.fillStyle = 'rgba(110,104,95,.5)'; for (let i = 0; i <= 2; i++) { g.fillRect(i * s / 2 - 1, 0, 2, s); g.fillRect(0, i * s / 2 - 1, s, 2); }
});
const FLOOR_TEX = { wood: [woodTex, 1.6, 0.62], tile: [tileTex, 2.4, 0.22], stone: [stoneTex, 1.2, 0.75] };

/* ---------- maquete 3D (cutaway, sem teto) de uma planta ----------
   Usada no painel (createPlan) e no estúdio da vista de unidade (building.js).
   fade: true cria materiais translúcidos (opacidade animável) para a troca entre unidades. */
export function buildPlanGroup(plan, { fade = false } = {}) {
  const maxX = Math.max(...plan.rooms.map((r) => r.x + r.w)), maxZ = Math.max(...plan.rooms.map((r) => r.z + r.d));
  const root = new THREE.Group();
  const g = new THREE.Group(); g.position.set(-maxX / 2, 0, -maxZ / 2); root.add(g);
  const mats = {};
  const opts = (o) => (fade ? { transparent: true, ...o } : o);
  const mat = (c, rough = 0.85, metal = 0) => (mats[`${c}|${rough}|${metal}`] ??= new THREE.MeshStandardMaterial(opts({ color: c, roughness: rough, metalness: metal })));
  const box = (x, y, z, w, h, d, c, rough, metal) => { // canto (x,z), base y
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'object' ? c : mat(c, rough, metal));
    m.position.set(x + w / 2, y + h / 2, z + d / 2); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  const cyl = (x, y, z, r, h, c) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28), mat(c));
    m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  // pisos com textura real em escala (UV em metros), rugosidade de acordo com o acabamento
  const floorMat = (f) => {
    const [tex, tile, rough] = FLOOR_TEX[f];
    return (mats['floor-' + f] ??= new THREE.MeshStandardMaterial(opts({ map: tex(), roughness: rough, bumpMap: tex(), bumpScale: 0.6 })));
  };
  const floorBox = (r) => {
    const geo = new THREE.BoxGeometry(r.w, 0.18, r.d), uv = geo.attributes.uv, k = FLOOR_TEX[r.f][1];
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * r.w / k, uv.getY(i) * r.d / k);
    const m = new THREE.Mesh(geo, floorMat(r.f)); m.position.set(r.x + r.w / 2, -0.09, r.z + r.d / 2); m.receiveShadow = true; g.add(m);
  };

  box(-0.15, -0.34, -0.15, maxX + 0.3, 0.16, maxZ + 0.3, 0xf1ece4, 0.9).castShadow = false; // laje (base branca, como numa maquete)
  const wallM = mat(0xf6f2ea, 0.92);
  const eq = (a, b) => Math.abs(a - b) < 0.01;
  for (const r of plan.rooms) {
    floorBox(r);
    if (r.open) continue;
    const edges = [[r.x, r.z, r.x + r.w, r.z], [r.x, r.z + r.d, r.x + r.w, r.z + r.d], [r.x, r.z, r.x, r.z + r.d], [r.x + r.w, r.z, r.x + r.w, r.z + r.d]];
    for (const [x1, z1, x2, z2] of edges) {
      const horiz = eq(z1, z2);
      const holes = plan.openings.filter((o) => (horiz ? eq(o[1], z1) && eq(o[3], z1) : eq(o[0], x1) && eq(o[2], x1))).map((o) => (horiz ? [o[0], o[2]] : [o[1], o[3]]));
      for (const [a, b] of cut(horiz ? x1 : z1, horiz ? x2 : z2, holes)) {
        if (horiz) box(a - WALL_T / 2, 0, z1 - WALL_T / 2, b - a + WALL_T, WALL_H, WALL_T, wallM);
        else box(x1 - WALL_T / 2, 0, a - WALL_T / 2, WALL_T, WALL_H, b - a + WALL_T, wallM);
      }
    }
  }
  for (const [x1, z1, x2, z2] of plan.rails) { // guarda-corpo das sacadas
    const horiz = eq(z1, z2), len = horiz ? x2 - x1 : z2 - z1;
    if (horiz) box(x1, 0.86, z1 - 0.025, len, 0.05, 0.05, 0x1c1c1e, 0.45, 0.6); else box(x1 - 0.025, 0.86, z1, 0.05, 0.05, len, 0x1c1c1e, 0.45, 0.6);
    for (let t = 0; t <= len + 0.01; t += 0.14) box((horiz ? x1 + t : x1) - 0.012, 0, (horiz ? z1 : z1 + t) - 0.012, 0.024, 0.86, 0.024, 0x1c1c1e, 0.45, 0.6).castShadow = false;
  }

  const build = {
    // cama: head = lado da cabeceira ('n','s' ao longo de z; 'e','w' ao longo de x), como na planta
    bed(x, z, w, d, head = 'n') {
      const alongX = head === 'e' || head === 'w', far = head === 's' || head === 'e';
      const L = alongX ? w : d, W = alongX ? d : w; // comprimento e largura da cama
      // monta em coordenadas locais (u ao longo do comprimento, v na largura) e converte para x/z
      const part = (u, v, lu, lv, y, h, c) => (alongX ? box(x + (far ? L - u - lu : u), y, z + v, lu, h, lv, c) : box(x + v, y, z + (far ? L - u - lu : u), lv, h, lu, c));
      part(0, 0, L, W, 0, 0.3, 0xd8cbb8); part(0.04, 0.04, L - 0.08, W - 0.08, 0.3, 0.18, 0xf6f2ea);
      part(-0.1, 0, 0.1, W, 0, 0.95, 0xc4ad8e);                       // cabeceira
      part(L * 0.45, 0.02, L * 0.5, W - 0.04, 0.44, 0.07, 0xb39f86);  // manta nos pés
      for (const pv of [0.14, W / 2 + 0.06]) part(0.14, pv, 0.36, W / 2 - 0.2, 0.48, 0.12, 0xffffff); // travesseiros
    },
    // sofá: back = lado do encosto (o assento olha para o lado oposto), como na planta
    sofa(x, z, w, d, back = 's') {
      const alongX = back === 'n' || back === 's', far = back === 's' || back === 'e';
      const L = alongX ? w : d, D = alongX ? d : w;
      const part = (u, v, lu, lv, y, h, c, r) => (alongX ? box(x + u, y, z + (far ? D - v - lv : v), lu, h, lv, c, r) : box(x + (far ? D - v - lv : v), y, z + u, lv, h, lu, c, r));
      part(0, 0, L, D, 0, 0.4, 0xece6da, 1);
      part(0, D - 0.22, L, 0.22, 0.4, 0.42, 0xe3dccf);               // encosto
      part(0, 0, 0.18, D - 0.22, 0.4, 0.22, 0xe3dccf); part(L - 0.18, 0, 0.18, D - 0.22, 0.4, 0.22, 0xe3dccf); // braços
      part(0.3, D - 0.6, 0.42, 0.36, 0.4, 0.14, 0xc9a45c);            // almofada
    },
    desk(x, z, w, d) { box(x, 0.72, z, w, 0.04, d, 0x8a6a55); box(x + 0.03, 0, z + 0.03, 0.04, 0.72, 0.04, 0x6f5442); box(x + w - 0.07, 0, z + d - 0.07, 0.04, 0.72, 0.04, 0x6f5442); box(x + w - 0.07, 0, z + 0.03, 0.04, 0.72, 0.04, 0x6f5442); box(x + 0.03, 0, z + d - 0.07, 0.04, 0.72, 0.04, 0x6f5442); },
    nightstand(x, z, w, d) { box(x, 0, z, w, 0.5, d, 0xb08b62); },
    tv(x, z, w, d) { box(x, 0, z, w, 1.15, d, 0xb98b5d); box(x + (w < d ? w : 0.1), 0.75, z + (w < d ? 0.1 : d), w < d ? 0.03 : w - 0.2, 0.45, w < d ? d - 0.2 : 0.03, 0x141416, 0.25); },
    panel(x, z, w, d) { box(x, 0, z, w, 0.95, d, 0xe8e4dd, 0.35); },
    shower(x, z, w, d) { box(x + 0.02, 0, z + 0.02, w - 0.04, 0.02, d - 0.04, 0xcfd3d6, 0.4).castShadow = false; },
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
      box(x, 0, z, w, 0.86, d, 0xf3eee4); box(x - 0.01, 0.86, z - 0.01, w + 0.02, 0.04, d + 0.02, 0xdcd8d1, 0.3); // tampo em mármore claro, como nas plantas
      const long = w > d; // cooktop e cuba
      box(long ? x + w * 0.2 : x + 0.1, 0.9, long ? z + 0.1 : z + d * 0.2, long ? 0.6 : d > w ? w - 0.2 : 0.4, 0.015, long ? d - 0.2 : 0.6, 0x0c0c0d, 0.2);
      box(long ? x + w * 0.62 : x + 0.12, 0.895, long ? z + 0.12 : z + d * 0.62, long ? 0.55 : w - 0.24, 0.012, long ? d - 0.24 : 0.55, 0xb9bcc0, 0.3);
    },
    fridge(x, z, w, d) { box(x, 0, z, w, 1.2, d, 0xb4b8bd, 0.32, 0.65); },
    wardrobe(x, z, w, d) { box(x, 0, z, w, 1.2, d, 0xb9966b); box(x + (w > d ? w / 2 - 0.01 : 0), 0, z + (w > d ? 0 : d / 2 - 0.01), w > d ? 0.02 : w + 0.005, 1.205, w > d ? d + 0.005 : 0.02, 0x8f6f48); },
    // vaso: (x,z) = centro; dir = lado da caixa acoplada (parede)
    wc(x, z, dir = 'n') {
      const ew = dir === 'e' || dir === 'w', w = ew ? 0.55 : 0.4, d = ew ? 0.4 : 0.55, x0 = x - w / 2, z0 = z - d / 2;
      box(x0, 0, z0, w, 0.4, d, 0xffffff, 0.3);
      if (ew) box(dir === 'w' ? x0 : x0 + w - 0.16, 0.4, z0, 0.16, 0.3, d, 0xffffff, 0.3);
      else box(x0, 0.4, dir === 'n' ? z0 : z0 + d - 0.16, w, 0.3, 0.16, 0xffffff, 0.3);
    },
    sink(x, z, w, d) { box(x, 0, z, w, 0.8, d, 0xdccfbb); box(x + 0.08, 0.8, z + 0.08, w - 0.16, 0.05, d - 0.16, 0xffffff, 0.3); },
    rug(x, z, w, d) { box(x, 0, z, w, 0.02, d, 0xd9ccb6, 1).castShadow = false; },
    grill(x, z, w, d) { box(x, 0, z, w, 0.9, d, 0x8a5a44); box(x + 0.08, 0.9, z + 0.08, w - 0.16, 0.05, d - 0.16, 0x1c1c1e); },
    chair(x, z) { cyl(x, 0, z, 0.28, 0.42, 0xd9ccb6); },
  };
  for (const [type, ...args] of plan.items) build[type](...args);
  const labels = plan.rooms.filter((r) => r.n).map((r) => ({ n: r.n, p: new THREE.Vector3(r.x + r.w / 2 - maxX / 2, WALL_H + 0.2, r.z + r.d / 2 - maxZ / 2) }));
  return { group: root, size: [maxX, maxZ], mats: Object.values(mats), labels };
}

export function createPlan(container, plan) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
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

  const built = buildPlanGroup(plan);
  scene.add(built.group);
  const [maxX, maxZ] = built.size;

  // rótulos dos ambientes (HTML, sempre nítidos)
  const labels = built.labels.map(({ n, p }) => {
    const el = document.createElement('span');
    el.className = 'plan-label'; el.textContent = n; container.appendChild(el);
    return { el, p };
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
      built.mats.forEach((m) => m.dispose());
      renderer.dispose(); renderer.forceContextLoss();
      canvas.remove(); labels.forEach((l) => l.el.remove());
    },
  };
}
