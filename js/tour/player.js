// Player 3D em primeira pessoa dos ambientes do Edifício Santa Ana.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ENVS, SHOTS } from './scenes.js';
import { TX } from './kit.js';
import { mergeStatic } from '../merge.js';
import { enhanceMaterials, withFilm } from '../lookdev.js';
import { best, bestSet, avifReady } from '../media.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

/* ---------------- render ---------------- */
RectAreaLightUniformsLib.init();
const stage = $('stage');
const modest = coarse || (navigator.hardwareConcurrency || 8) <= 4;
// O antisserrilhado é feito no alvo interno (MSAA); o canvas final não precisa de MSAA próprio.
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
// A tela fica SEMPRE na resolução nativa do aparelho (até 2x: num monitor 4K com escala 200% o
// canvas tem 3840 px). O que se adapta ao desempenho é só a resolução interna da cena: mudar o
// tamanho do canvas apaga o conteúdo dele, e era isso que causava os flashes pretos ao andar.
const PR = Math.min(devicePixelRatio, 2);
const Q_MIN = modest ? 0.5 : 0.6;                       // escala interna mínima andando
const Q_IDLE = modest ? 1 : Math.min(2, Math.max(1, 1.5 / PR)); // parado: nativo (ou supersample em tela 1x)
let qMove = modest ? 0.75 : 1, qNow = 0;
renderer.setPixelRatio(PR);
const maxAniso = renderer.capabilities.getMaxAnisotropy();
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
let roomEnv = null; // reflexos e luz rebatida capturados do próprio cômodo (ver captureRoomEnv)
const hemi = new THREE.HemisphereLight(0xfff6ea, 0x8a7d6c, 0.5);
const sun = new THREE.DirectionalLight(0xfff1de, 1.6);
sun.castShadow = true;
sun.shadow.mapSize.setScalar(2048); // sombra calculada uma vez por ambiente: pode ser nítida também no celular
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(hemi, sun, sun.target);
const sky = TX.sky();

let dirty = true; // só desenha quando algo muda na tela

// quadro refinado: quando a câmera para, o quadro é refeito com oclusão de ambiente (GTAO)
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: modest ? 2 : 4 }));
// MSAA só no buffer da cena; o segundo só recebe passes de tela cheia (menos memória e banda de GPU)
composer.renderTarget2.samples = 0;
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, 1, 1);
gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.2, thickness: 1.2, scale: 1.1, samples: modest ? 8 : 12, distanceFallOff: 1 });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: modest ? 8 : 12 });
gtao.blendIntensity = 0.85;
composer.addPass(gtao);
// conversão de cor + vinheta e grão sutis (como numa foto de interiores) num único passe
const film = withFilm(new OutputPass(), { grain: 0.025, vignette: 0.22 });
composer.addPass(film);
// todos os quadros passam pelo mesmo caminho de qualidade (andando ou parado); só a escala
// interna muda, com histerese, e sem nunca tocar no tamanho do canvas
const setQuality = (q) => { if (q !== qNow) { qNow = q; composer.setPixelRatio(PR * q); } };
setQuality(qMove);
const perf = { avg: 16.7, lastDraw: 0, lastChange: 0, warmUntil: 0 };
function adaptResolution(now) {
  const gap = now - perf.lastDraw;
  perf.lastDraw = now;
  if (gap > 100 || now < perf.warmUntil) return; // pausa ou shaders compilando: não mede
  perf.avg = perf.avg * 0.9 + gap * 0.1;
  if (now - perf.lastChange < 2000) return;
  let next = qMove;
  if (perf.avg > 24 && qMove > Q_MIN) next = Math.max(Q_MIN, qMove - 0.1);
  else if (perf.avg < 15.5 && qMove < 1) next = Math.min(1, qMove + 0.05);
  if (next !== qMove) { qMove = next; perf.lastChange = now; perf.avg = 16.7; setQuality(qMove); }
}

// campo de visão: no celular em pé garante pelo menos ~46° na horizontal (antes eram ~34°, e
// qualquer parede a meio metro tomava a tela inteira, parecendo que o passeio tinha travado)
function updateFov() {
  const a = camera.aspect, base = shot?.fov ?? 56;
  const minH = THREE.MathUtils.degToRad(46);
  const vForH = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(minH / 2) / a));
  camera.fov = a < 1 ? Math.min(88, Math.max(base + 12, vForH)) : base;
  camera.updateProjectionMatrix();
}
const resize = () => {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h); composer.setSize(w, h);
  camera.aspect = w / h;
  updateFov();
  dirty = true;
  draw(performance.now()); // redesenha no mesmo quadro: o navegador nunca exibe o canvas apagado
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

// captura o cômodo iluminado num mapa de ambiente: reflexos coerentes (janelas claras refletem
// no porcelanato, madeira reflete a parede) e uma luz rebatida suave, como iluminação global barata
function captureRoomEnv() {
  scene.environment = null;
  const eye = 1.45;
  group.position.y -= eye; group.updateMatrixWorld(true); // o mapa é tirado a partir da altura dos olhos
  const was = ring.visible; ring.visible = false;
  const rt = pmrem.fromScene(scene, 0.03, 0.05, 40);
  group.position.y += eye; group.updateMatrixWorld(true);
  ring.visible = was;
  renderer.shadowMap.needsUpdate = true; // refaz as sombras com o cômodo na posição certa
  roomEnv?.dispose(); roomEnv = rt;
  scene.environment = rt.texture;
}

// troca de ambiente sem bloquear a tela: a cena nova é montada, os shaders são compilados em
// paralelo (KHR_parallel_shader_compile via compileAsync) e só então o quadro é trocado.
// Enquanto isso o último quadro continua na tela, sob um véu, nunca uma tela preta.
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const parallel = renderer.extensions.has('KHR_parallel_shader_compile');
// compila todos os materiais do ambiente de uma vez (não só os visíveis): virar o rosto ou andar
// nunca mais engasga ao revelar um móvel que ainda não tinha sido desenhado
// a compilação é feita na variante "desenho em textura" (a usada de verdade, pelo pós-processamento
// e pela captura de reflexos); com o alvo nulo saía outra variante e tudo recompilava na hora,
// travando a troca de ambiente
const compile = () => {
  const t = renderer.getRenderTarget(); renderer.setRenderTarget(composer.renderTarget1);
  const r = parallel ? renderer.compileAsync(scene, camera).catch(() => {}) : Promise.resolve(renderer.compile(scene, camera));
  renderer.setRenderTarget(t); return r;
};
async function loadEnv(id) {
  if (id === envId) return;
  await nextFrame(); // deixa o véu aparecer antes do trabalho pesado
  if (group) { scene.remove(group); disposeGroup(group); }
  env = ENVS[id]; envId = id;
  group = new THREE.Group();
  env.build(group);
  scene.add(group);
  group.updateMatrixWorld(true);

  const out = !!env.outdoor;
  scene.background = out ? sky : new THREE.Color(0x15161a);
  scene.environmentIntensity = out ? 0.85 : 0.75;
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
  dirty = true;

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
  enhanceMaterials(group, { normalScale: 0.4, anisotropy: maxAniso }); // relevo, rugosidade e texturas nítidas em ângulo
  mergeStatic(group); // depois de medir os obstáculos: junta as peças estáticas por material
  scene.environment = null;
  await compile();      // variantes sem mapa de ambiente (usadas na captura)
  captureRoomEnv();
  await compile();      // variantes finais, com o reflexo do cômodo
  perf.warmUntil = performance.now() + 1200;

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
  // pontos de onde cada foto foi tirada neste ambiente
  for (const s of SHOTS.filter((x) => x.env === id)) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'poi is-view';
    el.innerHTML = `<i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 8h3l2-2h6l2 2h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></i><span>${s.title}</span>`;
    el.setAttribute('aria-label', `Ir para o ponto da foto: ${s.title}`);
    el.addEventListener('click', (e) => { e.stopPropagation(); closeCard(); goShot(s.id); });
    poiLayer.appendChild(el);
    pois.push({ el, v: new THREE.Vector3(s.pos[0], 0.05, s.pos[2]), view: s.id });
  }
}

/* ---------------- câmera em primeira pessoa ---------------- */
const pos = new THREE.Vector3(0, 1.5, 2);
let yaw = 0, pitch = 0, yawT = 0, pitchT = 0, tween = null, walkTo = null;
const vel = new THREE.Vector2();
const lookAngles = (p, l) => {
  const dx = l[0] - p[0], dy = l[1] - p[1], dz = l[2] - p[2];
  return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
};
const shortest = (a, b) => a + ((((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

let shot = null, busy = false, queue = Promise.resolve(), want = 0;
function place(s, jump) {
  const a = lookAngles(s.pos, s.look);
  vel.set(0, 0);
  if (jump || calm) { pos.set(...s.pos); yaw = yawT = a.yaw; pitch = pitchT = a.pitch; tween = null; showPhoto(s); }
  else { yaw = yawT; pitch = pitchT; tween = { t: 0, from: { p: pos.clone(), yaw, pitch }, to: { p: new THREE.Vector3(...s.pos), yaw: shortest(yaw, a.yaw), pitch: a.pitch } }; }
  dirty = true;
}
const veil = $('loading');

/* ---------- vista fotorrealista em alta definição ----------
   Cada ponto de foto tem uma imagem fotográfica em HD (até 2560 px). Ao chegar no ponto, ela
   aparece por cima do 3D com uma transição suave, só depois de baixada e decodificada (sem tela
   preta nem imagem pela metade). Ao andar, girar ou trocar de ponto, o 3D volta na hora. O
   navegador escolhe a versão de 800 px ou a HD conforme a tela (srcset). */
const photoBox = $('photo'), photoImg = $('photoImg'), photoBtn = $('photoBtn');
let photoOn = false, photoReq = 0;
async function showPhoto(s) {
  const req = ++photoReq;
  await avifReady; // detecção do AVIF (milissegundos; só espera na primeira foto)
  if (req !== photoReq) return;
  photoImg.alt = `Foto realista: ${s.title}`;
  photoImg.srcset = bestSet(`${s.photo.replace(/\.webp$/, '-800.webp')} 800w, ${s.photo} 2560w`);
  photoImg.src = best(s.photo);
  try { await photoImg.decode(); } catch { return; }
  if (req !== photoReq || shot !== s || busy || tween) return;
  photoOn = true;
  photoBox.classList.remove('fast'); photoBox.classList.add('on');
  stage.classList.add('photo-on'); photoBtn.setAttribute('aria-pressed', 'true');
}
function hidePhoto(fast = true) {
  photoReq++;
  if (!photoOn) return;
  photoOn = false;
  photoBox.classList.toggle('fast', fast); photoBox.classList.remove('on');
  stage.classList.remove('photo-on'); photoBtn.setAttribute('aria-pressed', 'false');
}
photoBtn.addEventListener('click', () => { if (photoOn) hidePhoto(false); else if (shot) goShot(shot.id); });

function goShot(id, instant = false) {
  const s = SHOTS.find((x) => x.id === id) || SHOTS[0];
  hidePhoto(false);
  walkTo = null;
  shot = s;
  updateFov();
  updateUI();
  history.replaceState(null, '', `#${s.id}`);
  const ticket = ++want;
  if (s.env === envId && !busy) { place(s, instant); return; }
  // troca de ambiente: o quadro atual fica na tela sob um véu translúcido até o novo estar pronto
  busy = true;
  veil.classList.toggle('first', !env);
  veil.classList.add('on');
  queue = queue.then(() => loadEnv(s.env)).then(() => {
    if (ticket !== want) return; // outra troca foi pedida no meio: ela assume
    busy = false;
    place(s, true);
    photoBtn.hidden = false;
    draw(performance.now());
    requestAnimationFrame(() => veil.classList.remove('on'));
  }).catch((err) => { console.error(err); busy = false; veil.classList.remove('on'); });
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
  if (e.code === 'KeyQ') keys.add('tl');
  if (e.code === 'KeyE') keys.add('tr');
  if (e.code === 'BracketLeft' || e.code === 'PageUp') step(-1);
  if (e.code === 'BracketRight' || e.code === 'PageDown') step(1);
  if (e.key === 'Escape') { closeCard(); setMenu(false); }
});
addEventListener('keyup', (e) => { if (MOVE[e.code]) keys.delete(MOVE[e.code]); if (e.key === 'Shift') keys.delete('run'); if (e.code === 'KeyQ') keys.delete('tl'); if (e.code === 'KeyE') keys.delete('tr'); });
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
  try { canvas.setPointerCapture(e.pointerId); } catch { /* ponteiro já liberado */ }
  tween = null;
});
canvas.addEventListener('pointermove', (e) => {
  if (drag && drag.id === e.pointerId) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
    const k = e.pointerType === 'touch' ? 0.005 : 0.0038;
    yawT += dx * k; pitchT = clamp(pitchT + dy * k, -1.25, 1.25);
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
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  tween = null; hideHelp();
  const d = clamp(-e.deltaY * 0.004, -0.6, 0.6);
  const base = walkTo || pos;
  walkTo = new THREE.Vector3(base.x - Math.sin(yaw) * d, pos.y, base.z - Math.cos(yaw) * d);
}, { passive: false });

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
  joy.addEventListener('pointerdown', (e) => { jid = e.pointerId; try { joy.setPointerCapture(jid); } catch { /* ponteiro já liberado */ } setStick(e); hideHelp(); walkTo = null; tween = null; });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === jid) setStick(e); });
  const up = () => { jid = null; stick.x = stick.y = 0; joy.firstElementChild.style.transform = ''; };
  joy.addEventListener('pointerup', up); joy.addEventListener('pointercancel', up);
}

/* colisão: limites do ambiente e móveis, com deslizamento.
   Antes, quem começava dentro da margem de um móvel (vários pontos de foto ficam colados ao sofá)
   podia atravessar tudo até bater na parede. Agora mede a "profundidade" dentro dos móveis: um
   passo só é aceito se não aprofunda; assim dá para sair, nunca entrar, e encostar desliza. */
function depth(x, z) {
  let d = 0;
  for (const r of colliders) if (x > r[0] && x < r[2] && z > r[1] && z < r[3]) d = Math.max(d, Math.min(x - r[0], r[2] - x, z - r[1], r[3] - z));
  return d;
}
function moveTo(nx, nz) {
  const [x0, x1, z0, z1] = env.bounds;
  const okX = (x) => !((x < x0 && x < pos.x) || (x > x1 && x > pos.x));
  const okZ = (z) => !((z < z0 && z < pos.z) || (z > z1 && z > pos.z));
  // dentro da margem (0,22 m) pode andar sem se aprofundar; dentro do móvel em si, só saindo
  const free = (x, z) => { const d0 = depth(pos.x, pos.z), d = depth(x, z); return d <= d0 + 1e-6 && (d <= 0.22 || d < d0 - 1e-4); };
  if (okX(nx) && okZ(nz) && free(nx, nz)) { pos.x = nx; pos.z = nz; return true; }
  let ok = false; // bloqueado: desliza no eixo livre (contorna quinas e acompanha paredes)
  if (okX(nx) && free(nx, pos.z)) { pos.x = nx; ok = true; }
  if (okZ(nz) && free(pos.x, nz)) { pos.z = nz; ok = true; }
  return ok;
}

/* ---------------- interface ---------------- */
const shotsNav = $('shots');
const groups = [...new Set(SHOTS.map((s) => ENVS[s.env].group))];
shotsNav.innerHTML = groups.map((gname) => `
  <section><h2>${gname}</h2>${SHOTS.filter((s) => ENVS[s.env].group === gname).map((s) => `
    <button type="button" class="shot" data-id="${s.id}">
      <img src="${s.photo.replace('assets/', 'assets/thumbs/')}" alt="" loading="lazy" width="96" height="64">
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
  $('refImg').src = shot.photo.replace('assets/', 'assets/thumbs/');
  $('refImg').alt = `Foto de referência: ${shot.title}`;
  document.title = `${shot.title} · Tour 3D · Edifício Santa Ana`;
}

function step(d) {
  const i = SHOTS.findIndex((s) => s.id === shot.id);
  closeCard(); goShot(SHOTS[(i + d + SHOTS.length) % SHOTS.length].id);
}
$('prevShot').addEventListener('click', () => step(-1));
$('nextShot').addEventListener('click', () => step(1));

const menu = $('menu');
function setMenu(open) { menu.classList.toggle('open', open); $('menuBtn').setAttribute('aria-expanded', open); }
$('menuBtn').addEventListener('click', () => setMenu(!menu.classList.contains('open')));

let helpShown = true;
function hideHelp() { if (helpShown) { helpShown = false; $('help').classList.add('gone'); } }
$('help').querySelector('.coarse').hidden = !coarse;
$('help').querySelector('.fine').hidden = coarse;

/* ---------------- laço ---------------- */
const v = new THREE.Vector3();
const last = { p: new THREE.Vector3(NaN), yaw: 0, pitch: 0, ring: new THREE.Vector3(), rv: false };
let prev = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  // passo de até 0,1 s: em aparelhos que rodam a 15-20 quadros por segundo a caminhada mantém a
  // velocidade real em vez de ficar em câmera lenta (antes o limite de 0,05 s freava o passo)
  const dt = Math.min(0.1, (now - prev) / 1000); prev = now;
  if (!env || busy) return;

  if (tween) {
    tween.t = Math.min(1, tween.t + dt / 0.75);
    const e = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - (-2 * tween.t + 2) ** 3 / 2;
    pos.lerpVectors(tween.from.p, tween.to.p, e);
    yaw = tween.from.yaw + (tween.to.yaw - tween.from.yaw) * e;
    pitch = tween.from.pitch + (tween.to.pitch - tween.from.pitch) * e;
    yawT = yaw; pitchT = pitch;
    if (tween.t >= 1) { tween = null; showPhoto(shot); } // chegou ao ponto da foto
  } else {
    // olhar com amortecimento
    yawT += ((keys.has('tr') ? -1 : 0) + (keys.has('tl') ? 1 : 0)) * 1.6 * dt;
    const kl = 1 - Math.exp(-dt * 16);
    yaw += (yawT - yaw) * kl; pitch += (pitchT - pitch) * kl;
    if (Math.abs(yawT - yaw) < 1e-4) yaw = yawT;
    if (Math.abs(pitchT - pitch) < 1e-4) pitch = pitchT;
    let f = (keys.has('f') ? 1 : 0) - (keys.has('b') ? 1 : 0) - stick.y;
    let s = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0) + stick.x;
    const m = Math.hypot(f, s);
    // caminhada com aceleração e desaceleração suaves
    const tv = new THREE.Vector2();
    if (m > 0.05) {
      walkTo = null;
      if (m > 1) { f /= m; s /= m; }
      const sp = keys.has('run') ? 3.2 : 1.45;
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      tv.set((fx * f + rx * s) * sp, (fz * f + rz * s) * sp);
    }
    vel.lerp(tv, 1 - Math.exp(-dt * (m > 0.05 ? 7 : 10)));
    if (vel.lengthSq() < 1e-5) vel.set(0, 0);
    if (vel.lengthSq() > 0) {
      const ox = pos.x, oz = pos.z;
      if (!moveTo(pos.x + vel.x * dt, pos.z + vel.y * dt)) vel.multiplyScalar(0.5);
      else if (dt > 0) vel.set((pos.x - ox) / dt, (pos.z - oz) / dt); // a velocidade acompanha o deslizamento
    }
    if (m > 0.05) {
      // já tratado acima
    } else if (walkTo) {
      const dx = walkTo.x - pos.x, dz = walkTo.z - pos.z, d = Math.hypot(dx, dz);
      const st = Math.min(d, Math.min(1.8, 0.6 + d * 2) * dt);
      if (d < 0.04 || !moveTo(pos.x + (dx / d) * st, pos.z + (dz / d) * st)) walkTo = null;
    }
    pos.y += (clamp(pos.y, 1.25, 1.65) - pos.y) * Math.min(1, dt * 2);
  }
  const same = !dirty && pos.equals(last.p) && yaw === last.yaw && pitch === last.pitch && ring.position.equals(last.ring) && ring.visible === last.rv;
  if (same) {
    // parado: um único quadro refinado na resolução máxima (nítido para olhar com calma)
    if (!refined && now - movedAt > 260 && Q_IDLE > qNow && !busy) { refined = true; setQuality(Q_IDLE); draw(now); }
    return;
  }
  movedAt = now;
  if (photoOn && !tween && (!pos.equals(last.p) || yaw !== last.yaw || pitch !== last.pitch)) hidePhoto(); // andou ou girou: volta ao 3D
  if (refined) { refined = false; setQuality(qMove); }
  adaptResolution(now);
  draw(now);
}
let movedAt = 0, refined = false;
function draw(now) {
  if (!env || busy) return;
  last.p.copy(pos); last.yaw = yaw; last.pitch = pitch; last.ring.copy(ring.position); last.rv = ring.visible;
  dirty = false;
  camera.position.copy(pos);
  camera.rotation.set(pitch, yaw, 0, 'YXZ');

  // marcadores dos pontos de interesse
  const W = stage.clientWidth, H = stage.clientHeight;
  for (const p of pois) {
    v.copy(p.v).project(camera);
    const dist = p.v.distanceTo(pos);
    const vis = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 && dist < 8.5 && (!p.view || (p.view !== shot.id && dist > 0.6));
    p.el.classList.toggle('off', !vis);
    if (vis) p.el.style.transform = `translate(${((v.x + 1) / 2 * W).toFixed(1)}px, ${((1 - v.y) / 2 * H).toFixed(1)}px)`;
  }
  film.uniforms.uTime.value = (now * 0.001) % 97;
  if (composer.readBuffer !== composer.renderTarget1) composer.swapBuffers(); // cena sempre no buffer com MSAA
  composer.render();
}

/* ---------------- início ---------------- */
const start = decodeURIComponent(location.hash.slice(1));
const known = SHOTS.some((s) => s.id === start);
goShot(known ? start : SHOTS[0].id, true);
// sem ambiente no endereço: pergunta por onde começar
const welcome = $('welcome');
if (!known) {
  welcome.hidden = false;
  welcome.querySelector('button')?.focus();
  welcome.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    welcome.hidden = true;
    goShot(b.dataset.go);
    canvas.focus();
  });
}
resize();
requestAnimationFrame((t) => { prev = t; tick(t); });
addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id !== shot?.id && SHOTS.some((s) => s.id === id)) goShot(id); });
