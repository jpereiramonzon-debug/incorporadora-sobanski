// Player 3D em primeira pessoa dos ambientes do Edifício Santa Ana.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ENVS, SHOTS } from './scenes.js';
import { TX } from './kit.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

/* ---------------- render ---------------- */
RectAreaLightUniformsLib.init();
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false; // ambientes estáticos: sombra calculada ao entrar
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
const canvas = renderer.domElement;
canvas.tabIndex = 0;
canvas.setAttribute('aria-label', 'Ambiente em 3D. Use W, A, S e D para andar e arraste para olhar.');
stage.prepend(canvas);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 200);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const hemi = new THREE.HemisphereLight(0xfff6ea, 0x8a7d6c, 0.5);
const sun = new THREE.DirectionalLight(0xfff1de, 1.6);
sun.castShadow = true;
sun.shadow.mapSize.setScalar(coarse ? 1024 : 2048);
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(hemi, sun, sun.target);
const sky = TX.sky();

const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.35, 1.0));
composer.addPass(new OutputPass());

const resize = () => {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h); composer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w / h < 1 ? 74 : 62;
  camera.updateProjectionMatrix();
};
new ResizeObserver(resize).observe(stage);

/* ---------------- ambientes ---------------- */
let env = null, envId = null, group = null, colliders = [], floors = [], pois = [];
const poiLayer = $('pois');

function disposeGroup(g) {
  g.traverse((o) => {
    o.geometry?.dispose();
    for (const m of [].concat(o.material || [])) m.dispose();
    if (o.isLight && o.dispose) o.dispose();
  });
}

function loadEnv(id) {
  if (id === envId) return;
  if (group) { scene.remove(group); disposeGroup(group); }
  env = ENVS[id]; envId = id;
  group = new THREE.Group();
  env.build(group);
  scene.add(group);
  group.updateMatrixWorld(true);

  const out = !!env.outdoor;
  scene.background = out ? sky : new THREE.Color(0x15161a);
  scene.environmentIntensity = out ? 0.6 : 0.3;
  const k = env.lightK ?? 1;
  scene.environmentIntensity *= k;
  hemi.intensity = (out ? 1.1 : 0.35) * k;
  sun.intensity = (out ? 3.0 : 1.1) * (out ? k : 1);
  sun.color.set(out ? 0xfff2de : 0xfff4e6);
  const [x0, x1, z0, z1] = env.bounds;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, span = Math.max(x1 - x0, z1 - z0) + 5;
  sun.position.set(cx + env.sun[0], env.sun[1], cz + env.sun[2]);
  sun.target.position.set(cx, 0, cz);
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 0.5, far: 40 });
  sun.shadow.camera.updateProjectionMatrix();
  renderer.shadowMap.needsUpdate = true;

  // obstáculos (móveis) e piso clicável
  colliders = []; floors = [];
  const b = new THREE.Box3();
  group.traverse((o) => {
    if (o.userData.floor) floors.push(o);
    if (o.userData.solid) {
      b.setFromObject(o);
      if (b.min.y < 1.2 && b.max.x - b.min.x < 6) colliders.push([b.min.x - 0.22, b.min.z - 0.22, b.max.x + 0.22, b.max.z + 0.22]);
    }
  });

  poiLayer.innerHTML = '';
  pois = env.pois.map((p) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'poi' + (p.go ? ' is-go' : '');
    el.innerHTML = `<i aria-hidden="true">${p.go ? '&rarr;' : '+'}</i><span>${p.t}</span>`;
    el.setAttribute('aria-label', p.go ? `${p.t}: ir` : p.t);
    el.addEventListener('click', (e) => { e.stopPropagation(); onPoi(p); });
    poiLayer.appendChild(el);
    return { ...p, el, v: new THREE.Vector3(...p.p) };
  });
}

/* ---------------- câmera em primeira pessoa ---------------- */
const pos = new THREE.Vector3(0, 1.5, 2);
let yaw = 0, pitch = 0, tween = null, walkTo = null;
const lookAngles = (p, l) => {
  const dx = l[0] - p[0], dy = l[1] - p[1], dz = l[2] - p[2];
  return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
};
const shortest = (a, b) => a + ((((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

let shot = null;
function goShot(id, instant = false) {
  const s = SHOTS.find((x) => x.id === id) || SHOTS[0];
  const changing = s.env !== envId;
  const a = lookAngles(s.pos, s.look);
  const apply = () => {
    loadEnv(s.env);
    if (instant || changing || calm) { pos.set(...s.pos); yaw = a.yaw; pitch = a.pitch; tween = null; }
    else tween = { t: 0, from: { p: pos.clone(), yaw, pitch }, to: { p: new THREE.Vector3(...s.pos), yaw: shortest(yaw, a.yaw), pitch: a.pitch } };
  };
  walkTo = null;
  shot = s;
  if (changing && !instant) fade(apply); else apply();
  updateUI();
  history.replaceState(null, '', `#${s.id}`);
}

function fade(fn) {
  const l = $('loading');
  l.classList.add('on');
  setTimeout(() => { fn(); requestAnimationFrame(() => requestAnimationFrame(() => l.classList.remove('on'))); }, calm ? 0 : 260);
}

function onPoi(p) {
  if (p.go) { closeCard(); goShot(p.go); return; }
  $('cardT').textContent = p.t;
  $('cardD').textContent = p.d;
  $('card').hidden = false;
}
const closeCard = () => { $('card').hidden = true; };
$('cardX').addEventListener('click', closeCard);

/* teclado */
const keys = new Set();
const MOVE = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r' };
addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, textarea')) return;
  if (MOVE[e.code]) { keys.add(MOVE[e.code]); e.preventDefault(); hideHelp(); }
  if (e.key === 'Shift') keys.add('run');
  if (e.key === 'Escape') { closeCard(); setMenu(false); }
});
addEventListener('keyup', (e) => { if (MOVE[e.code]) keys.delete(MOVE[e.code]); if (e.key === 'Shift') keys.delete('run'); });
addEventListener('blur', () => keys.clear());

/* arrastar para olhar, clicar no chão para ir */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false }));
ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 2;
scene.add(ring);
const floorHit = (e) => {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.intersectObjects(floors, false)[0]?.point ?? null;
};
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
  canvas.setPointerCapture(e.pointerId);
  tween = null;
});
canvas.addEventListener('pointermove', (e) => {
  if (drag && drag.id === e.pointerId) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
    const k = e.pointerType === 'touch' ? 0.005 : 0.0038;
    yaw += dx * k; pitch = clamp(pitch + dy * k, -1.25, 1.25);
    if (drag.moved > 6) { canvas.classList.add('dragging'); ring.visible = false; hideHelp(); }
  } else if (e.pointerType === 'mouse') {
    const p = floorHit(e);
    ring.visible = !!p;
    if (p) ring.position.set(p.x, p.y + 0.01, p.z);
  }
});
const endDrag = (e) => {
  if (!drag) return;
  const click = drag.moved < 6;
  drag = null; canvas.classList.remove('dragging');
  if (click && e.type === 'pointerup') {
    const p = floorHit(e);
    if (p) { walkTo = new THREE.Vector3(p.x, pos.y, p.z); closeCard(); hideHelp(); }
  }
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('pointerleave', () => { ring.visible = false; });

/* joystick para celular */
const joy = $('joy'), stick = { x: 0, y: 0 };
if (coarse) {
  joy.hidden = false;
  let jid = null;
  const setStick = (e) => {
    const r = joy.getBoundingClientRect(), R = r.width / 2;
    let x = (e.clientX - r.left - R) / R, y = (e.clientY - r.top - R) / R;
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    stick.x = x; stick.y = y;
    joy.firstElementChild.style.transform = `translate(${x * R * 0.55}px, ${y * R * 0.55}px)`;
  };
  joy.addEventListener('pointerdown', (e) => { jid = e.pointerId; joy.setPointerCapture(jid); setStick(e); hideHelp(); walkTo = null; tween = null; });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === jid) setStick(e); });
  const up = () => { jid = null; stick.x = stick.y = 0; joy.firstElementChild.style.transform = ''; };
  joy.addEventListener('pointerup', up); joy.addEventListener('pointercancel', up);
}

/* colisão: limites do ambiente e móveis (só impede entrar, nunca prende) */
function moveTo(nx, nz) {
  const [x0, x1, z0, z1] = env.bounds;
  const outX = (x) => x < x0 || x > x1, outZ = (z) => z < z0 || z > z1;
  const inside = (x, z) => colliders.some((r) => x > r[0] && x < r[2] && z > r[1] && z < r[3]);
  const was = inside(pos.x, pos.z);
  let ok = false;
  if (!(outX(nx) && Math.abs(nx - (x0 + x1) / 2) > Math.abs(pos.x - (x0 + x1) / 2)) && (was || !inside(nx, pos.z))) { pos.x = nx; ok = true; }
  if (!(outZ(nz) && Math.abs(nz - (z0 + z1) / 2) > Math.abs(pos.z - (z0 + z1) / 2)) && (was || !inside(pos.x, nz))) { pos.z = nz; ok = true; }
  return ok;
}

/* ---------------- interface ---------------- */
const shotsNav = $('shots');
const groups = [...new Set(SHOTS.map((s) => ENVS[s.env].group))];
shotsNav.innerHTML = groups.map((gname) => `
  <section><h2>${gname}</h2>${SHOTS.filter((s) => ENVS[s.env].group === gname).map((s) => `
    <button type="button" class="shot" data-id="${s.id}">
      <img src="${s.photo}" alt="" loading="lazy" width="96" height="64">
      <span><b>${s.title}</b><small>${s.sub}</small></span>
    </button>`).join('')}</section>`).join('');
shotsNav.addEventListener('click', (e) => {
  const b = e.target.closest('.shot');
  if (!b) return;
  closeCard(); goShot(b.dataset.id);
  if (innerWidth < 900) setMenu(false);
});

function updateUI() {
  document.querySelectorAll('.shot').forEach((b) => b.setAttribute('aria-current', b.dataset.id === shot.id ? 'true' : 'false'));
  $('nowGroup').textContent = ENVS[shot.env].group;
  $('nowTitle').textContent = shot.title;
  $('refImg').src = shot.photo;
  $('refImg').alt = `Foto de referência: ${shot.title}`;
  $('overlay').src = shot.photo;
  document.title = `${shot.title} · Tour 3D · Edifício Santa Ana`;
}

const overlay = $('overlay'), cmp = $('cmp');
const levels = [0, 0.5, 1], labels = ['Comparar', 'Foto 50%', 'Só a foto'];
let lvl = 0;
cmp.addEventListener('click', () => {
  lvl = (lvl + 1) % levels.length;
  overlay.style.opacity = levels[lvl];
  cmp.textContent = labels[lvl];
  cmp.setAttribute('aria-pressed', lvl > 0);
  if (lvl && shot) goShot(shot.id); // volta ao ponto de vista da foto para comparar
});

const menu = $('menu');
function setMenu(open) { menu.classList.toggle('open', open); $('menuBtn').setAttribute('aria-expanded', open); }
$('menuBtn').addEventListener('click', () => setMenu(!menu.classList.contains('open')));

let helpShown = true;
function hideHelp() { if (helpShown) { helpShown = false; $('help').classList.add('gone'); } }
$('help').querySelector('.coarse').hidden = !coarse;
$('help').querySelector('.fine').hidden = coarse;

/* ---------------- laço ---------------- */
const v = new THREE.Vector3();
let prev = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
  if (!env) return;

  if (tween) {
    tween.t = Math.min(1, tween.t + dt / 1.1);
    const e = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - (-2 * tween.t + 2) ** 3 / 2;
    pos.lerpVectors(tween.from.p, tween.to.p, e);
    yaw = tween.from.yaw + (tween.to.yaw - tween.from.yaw) * e;
    pitch = tween.from.pitch + (tween.to.pitch - tween.from.pitch) * e;
    if (tween.t >= 1) tween = null;
  } else {
    let f = (keys.has('f') ? 1 : 0) - (keys.has('b') ? 1 : 0) - stick.y;
    let s = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0) + stick.x;
    const m = Math.hypot(f, s);
    if (m > 0.05) {
      walkTo = null;
      if (m > 1) { f /= m; s /= m; }
      const sp = (keys.has('run') ? 3.2 : 1.45) * dt;
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      moveTo(pos.x + (fx * f + rx * s) * sp, pos.z + (fz * f + rz * s) * sp);
    } else if (walkTo) {
      const dx = walkTo.x - pos.x, dz = walkTo.z - pos.z, d = Math.hypot(dx, dz);
      const st = Math.min(d, 1.8 * dt);
      if (d < 0.04 || !moveTo(pos.x + (dx / d) * st, pos.z + (dz / d) * st)) walkTo = null;
    }
    pos.y += (clamp(pos.y, 1.25, 1.65) - pos.y) * Math.min(1, dt * 2);
  }
  camera.position.copy(pos);
  camera.rotation.set(pitch, yaw, 0, 'YXZ');

  // marcadores dos pontos de interesse
  const W = stage.clientWidth, H = stage.clientHeight;
  for (const p of pois) {
    v.copy(p.v).project(camera);
    const dist = p.v.distanceTo(pos);
    const vis = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 && dist < 8.5;
    p.el.classList.toggle('off', !vis);
    if (vis) p.el.style.transform = `translate(${((v.x + 1) / 2 * W).toFixed(1)}px, ${((1 - v.y) / 2 * H).toFixed(1)}px)`;
  }
  composer.render();
}

/* ---------------- início ---------------- */
const start = decodeURIComponent(location.hash.slice(1));
goShot(SHOTS.some((s) => s.id === start) ? start : SHOTS[0].id, true);
resize();
requestAnimationFrame((t) => { prev = t; tick(t); setTimeout(() => $('loading').classList.remove('on'), 150); });
addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id !== shot?.id && SHOTS.some((s) => s.id === id)) goShot(id); });
