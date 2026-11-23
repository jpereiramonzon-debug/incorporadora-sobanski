// Maquete 3D do Edifício Santa Ana: giro 360°, unidades clicáveis na fachada e voo de câmera até a
// planta 3D isolada de cada apartamento num estúdio claro.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeStatic } from './merge.js?v=20261124';
import { enhanceMaterials, skyEnvironment, FilmShader } from './lookdev.js?v=20261124';
import { buildPlanGroup, PLANS } from './plan3d.js?v=20261124';

// cartão de folhagem: tufo de folhas recortado por transparência (substitui as copas de esferas)
function leafCardTex() {
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'); let seed = 7;
  const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.strokeStyle = 'rgba(70,52,30,.9)'; g.lineWidth = 2;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(s / 2, s); g.quadraticCurveTo(s * (0.3 + r() * 0.4), s * 0.6, s * (0.15 + r() * 0.7), s * (0.15 + r() * 0.3)); g.stroke(); }
  for (let i = 0; i < 95; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * s * 0.42;
    const x = s / 2 + Math.cos(a) * d, y = s * 0.48 + Math.sin(a) * d * 0.9;
    const l = 46 + r() * 34 | 0;
    g.fillStyle = `hsl(${92 + r() * 26},${32 + r() * 22}%,${l}%)`;
    g.save(); g.translate(x, y); g.rotate(r() * Math.PI * 2);
    g.beginPath(); g.ellipse(0, 0, 9 + r() * 9, 4 + r() * 3.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,230,.18)'; g.beginPath(); g.ellipse(-2, -1, 5, 1.5, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

const FLOOR_Y = { T: 1.5, 1: 4.5, 2: 7.5, 3: 10.5 };
const HOME_Y = 7.4;

/* ---------- unidades na fachada ----------
   Cada andar (1º a 3º) tem 5 apartamentos. Cada "slot" diz onde fica a unidade no volume do prédio
   (caixa x0,x1,z0,z1), o ponto da fachada que a câmera mira (at), de que lado a câmera chega (az),
   e qual planta 3D é revelada no estúdio. Id da unidade = andar + final (ex.: 201).
   Posições aproximadas a partir das vistas oficiais: confirme com a incorporadora e ajuste aqui. */
export const SLOTS = [
  { fin: '01', plan: 't01', box: [-5.05, 0, 6.75, 10.1], at: [-2.5, 10.05], az: -0.42 },
  { fin: '02', plan: 't02', box: [0, 5.05, 6.75, 10.1], at: [2.5, 10.05], az: 0.42 },
  { fin: '03', plan: 't03', box: [-4.2, 0.15, -6.2, 6.75], at: [-4.15, 0.3], az: -Math.PI / 2 + 0.34 },
  { fin: '05', plan: 't05', box: [0.15, 4.5, -6.2, 6.75], at: [4.45, 0.3], az: Math.PI / 2 - 0.34 },
  { fin: '04', plan: 't04', box: [-5.05, 5.05, -11.1, -6.2], at: [0, -11.05], az: Math.PI - 0.34 },
];
const SLAB = { 1: 3, 2: 6, 3: 9 };
const slotOf = (id) => SLOTS.find((s) => s.fin === id.slice(1));
const ease3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // power3.inOut
const clamp01 = (t) => Math.min(1, Math.max(0, t));

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- texturas ---------- */
const noiseTex = () => {
  const t = tex(256, 256, (g, w, h) => {
    const d = g.createImageData(w, h);
    const r = rng(7);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 118 + r() * 34;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
  }, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 5);
  return t;
};

const windowTex = (lit, tall, seed) => tex(320, tall ? 576 : 416, (g, W2, H2) => {
  g.scale(2, 2); const w = W2 / 2, h = H2 / 2;
  const r = rng(seed);
  g.fillStyle = '#121214'; g.fillRect(0, 0, w, h);
  const m = 9;
  const grad = g.createLinearGradient(0, 0, 0, h);
  if (lit) {
    const warm = r() > 0.4;
    grad.addColorStop(0, warm ? '#fff3d4' : '#fff8e8');
    grad.addColorStop(1, warm ? '#f1ab58' : '#f4c888');
  } else { grad.addColorStop(0, '#343b55'); grad.addColorStop(0.55, '#1c2132'); grad.addColorStop(1, '#141722'); }
  g.fillStyle = grad; g.fillRect(m, m, w - 2 * m, h - 2 * m);
  if (lit) { // cortinas e sombra do interior
    g.fillStyle = 'rgba(255,252,240,.6)';
    const c = 0.16 + r() * 0.18;
    g.fillRect(m, m, (w - 2 * m) * c, h - 2 * m);
    g.fillRect(w - m - (w - 2 * m) * c, m, (w - 2 * m) * c, h - 2 * m);
    g.fillStyle = 'rgba(120,70,20,.22)'; g.fillRect(m, h * 0.72, w - 2 * m, h * 0.28 - m);
  } else {
    g.fillStyle = 'rgba(255,190,150,.10)';
    g.beginPath(); g.moveTo(m, h * 0.5); g.lineTo(w - m, h * 0.2); g.lineTo(w - m, h * 0.36); g.lineTo(m, h * 0.7); g.fill();
  }
  g.fillStyle = '#121214';
  g.fillRect(w / 2 - 3, 0, 6, h);
  g.fillRect(0, h * (tall ? 0.2 : 0.3) - 2.5, w, 5);
});

const railTex = () => tex(1024, 320, (g, W2, H2) => {
  g.scale(2, 2); const w = W2 / 2, h = H2 / 2;
  g.strokeStyle = '#0b0b0c'; g.fillStyle = '#0b0b0c';
  g.fillRect(0, 0, w, 9); g.fillRect(0, 44, w, 5); g.fillRect(0, h - 8, w, 8);
  for (let x = 4; x < w; x += 16) g.fillRect(x, 0, 4, h);
  g.lineWidth = 3;
  for (let x = 14; x < w; x += 32) { g.beginPath(); g.arc(x + 8, 27, 11, 0, Math.PI * 2); g.stroke(); }
});

const blockTex = () => tex(64, 1024, (g, w, h) => {
  g.fillStyle = '#a57b45'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 2; x++) {
    const gr = g.createRadialGradient(x * 32 + 16, y * 32 + 16, 2, x * 32 + 16, y * 32 + 16, 20);
    gr.addColorStop(0, '#fff6dd'); gr.addColorStop(1, '#f6c987');
    g.fillStyle = gr; g.fillRect(x * 32 + 2, y * 32 + 2, 28, 28);
  }
});

const coneTex = () => tex(64, 128, (g, w, h) => {
  const v = g.createLinearGradient(0, h, 0, 0);
  v.addColorStop(0, 'rgba(255,205,140,.95)'); v.addColorStop(0.5, 'rgba(255,190,120,.3)'); v.addColorStop(1, 'rgba(255,190,120,0)');
  g.fillStyle = v; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in';
  const hz = g.createLinearGradient(0, 0, w, 0);
  hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(0.5, 'rgba(0,0,0,1)'); hz.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hz; g.fillRect(0, 0, w, h);
});

const glowTex = () => tex(256, 256, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,214,170,1)'); r.addColorStop(0.25, 'rgba(255,170,120,.45)'); r.addColorStop(1, 'rgba(255,150,110,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
});

const signTex = () => {
  const draw = (g, w, h) => {
    g.fillStyle = '#efe4cf'; g.fillRect(0, 0, w, h);
    const flag = (x, y, top, bottom) => { g.fillStyle = top; g.fillRect(x, y, 46, 15); g.fillStyle = bottom; g.fillRect(x, y + 15, 46, 15); };
    g.fillStyle = '#2f2616'; g.textBaseline = 'middle';
    flag(60, 48, '#ffffff', '#d4213d'); g.font = '40px Georgia, serif'; g.textAlign = 'left'; g.fillText('Witamy', 120, 64);
    flag(w - 106, 48, '#0057b7', '#ffd700'); g.textAlign = 'right'; g.fillText('Laskavo prosymo', w - 120, 64);
    g.textAlign = 'center'; g.font = 'italic 600 112px Georgia, serif'; g.fillText('Edifício Santa Ana', w / 2, h * 0.62);
  };
  return tex(1024, 310, draw);
};
const nameTex = () => tex(512, 150, (g, w, h) => {
  g.fillStyle = '#e8e2d8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '500 92px Georgia, serif'; g.fillText('Sobanski', w / 2, h / 2);
});

/* ---------- cena ---------- */
export function createViewer(container, { onHover = () => {}, onSelect = () => {} } = {}) {
  // qualidade adaptada ao aparelho: celular e máquinas modestas usam menos pixels e efeitos
  const coarse = matchMedia('(pointer: coarse)').matches;
  const modest = coarse || (navigator.hardwareConcurrency || 8) <= 4;
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  // celular com tela densa: 2x para ficar nítido (sem GTAO/bloom lá). Desktop: 1,5x com MSAA 4x já é
  // indistinguível de 1,75x/2x numa tela Retina, e desenha ~27-44% menos pixels por quadro
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 2 : 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // a cena é estática: sombras calculadas uma vez
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Maquete 3D do Edifício Santa Ana. Arraste para girar e clique em um andar.');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xb48a86, 0.0026);
  { // cúpula do céu ao entardecer, com brilho do pôr do sol e estrelas
    const g = new THREE.SphereGeometry(480, 48, 32);
    const stops = [[-1, 0xb48a86], [0, 0xb48a86], [0.05, 0xd9a088], [0.13, 0xa87a8c], [0.27, 0x5a5088], [0.5, 0x232a5c], [1, 0x070d28]];
    const c = new THREE.Color(), c2 = new THREE.Color(), cols = [];
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 480;
      let j = 1; while (j < stops.length - 1 && y > stops[j][0]) j++;
      const [y0, h0] = stops[j - 1], [y1, h1] = stops[j];
      c.set(h0).lerp(c2.set(h1), Math.min(1, Math.max(0, (y - y0) / (y1 - y0))));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
    const sunset = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), blending: THREE.AdditiveBlending, fog: false, depthWrite: false, opacity: 0.85 }));
    sunset.position.set(-330, 26, 250); sunset.scale.set(420, 200, 1); scene.add(sunset);
    const rs = rng(11), sp = [];
    for (let i = 0; i < 500; i++) {
      const a = rs() * Math.PI * 2, e = 0.35 + rs() * 1.2;
      sp.push(460 * Math.cos(e) * Math.cos(a), 460 * Math.sin(e), 460 * Math.cos(e) * Math.sin(a));
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.7 })));
  }
  const camera = new THREE.PerspectiveCamera(29, 1, 2, 700); // lente um pouco mais longa: menos distorção, leitura de foto de arquitetura

  // céu HDR do entardecer como ambiente: reflexos coerentes em vidros e metais e luz ambiente suave
  scene.environment = skyEnvironment(renderer, { zenith: 0x0d1638, mid: 0x5a5088, horizon: 0xe2a684, ground: 0x241e1a, sunDir: [-0.79, 0.07, 0.6], sunColor: 0xffbf8a, sunPower: 22 });
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0x9aa6d8, 0x4a3a30, 0.7));
  const sun = new THREE.DirectionalLight(0xffc09a, 1.5);
  sun.position.set(-34, 17, 26);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(innerWidth < 860 ? 2048 : 3072); // 4096² ocupava 64 MB de GPU; 3072² (36 MB) mantém a nitidez da sombra
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 100 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd7c3e8, 0.55); // luz de preenchimento do lado oposto ao sol
  fill.position.set(30, 14, -24); scene.add(fill);

  const noise = noiseTex();
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, ...o });
  const wall = M(0xb9b2a8, { bumpMap: noise, bumpScale: 1.2 });
  const wallDark = M(0x4d4944, { bumpMap: noise, bumpScale: 1.2 });
  const trim = M(0x35322f, { roughness: 0.8 });
  const muro = M(0xb5ab9c, { bumpMap: noise, bumpScale: 1 });
  const metal = M(0x1b1b1d, { roughness: 0.55, metalness: 0.4 });
  const glow = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
  const led = glow(0xffd29a, 1.7);
  const lamp = glow(0xffe2b8, 3.2);

  const box = (w, h, d, mat, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true;
    scene.add(m); return m;
  };
  const plane = (w, h, mat, x, y, z, ry = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m;
  };

  // ===== corpo do prédio, conforme as vistas oficiais (frente, quina esquerda e fundos) =====
  const dark = M(0x57524d, { bumpMap: noise, bumpScale: 1.2 });
  const light = M(0xcdc4b7, { bumpMap: noise, bumpScale: 1.0 });
  const inner = M(0xddd3c5, { bumpMap: noise, bumpScale: 0.8 });
  const corn = M(0x59544f, { roughness: 0.85 });
  const G = (x, y, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); return g; };
  const gb = (g, w, h, d, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m; };
  const gp = (g, w, h, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); g.add(m); return m; };
  const blk = (x0, x1, y0, y1, z0, z1, mat) => box(x1 - x0, y1 - y0, z1 - z0, mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const winMats = {};
  const winMat = (lit, tall, v) => {
    const key = `${lit}${tall}${v}`;
    if (!winMats[key]) {
      const t = windowTex(lit, tall, v * 13 + (tall ? 5 : 1));
      winMats[key] = lit
        ? new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.45, roughness: 0.5 })
        : new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.06, metalness: 0, ior: 1.52, reflectivity: 0.6, envMapIntensity: 1.6, userData: { flat: true } }); // vidro: reflete o céu do entardecer
    }
    return winMats[key];
  };
  const rw = rng(42);
  // janela no plano local (vidro em z=0 olhando para +z), com caixilho preto, moldura de reboco e peitoril
  const win = (g, x, y, w, h, { lit = rw() < 0.75, surround = true } = {}) => {
    gp(g, w, h, winMat(lit, h > 1.9, Math.floor(rw() * 3)), x, y, 0.012);
    for (const [bw, bh, ox, oy] of [[w + 0.06, 0.05, 0, h / 2], [w + 0.06, 0.05, 0, -h / 2], [0.05, h, -w / 2, 0], [0.05, h, w / 2, 0]]) gb(g, bw, bh, 0.06, metal, x + ox, y + oy, 0.03, false);
    if (surround) for (const [bw, bh, ox, oy] of [[w + 0.32, 0.12, 0, h / 2 + 0.1], [0.12, h + 0.2, -w / 2 - 0.1, 0], [0.12, h + 0.2, w / 2 + 0.1, 0]]) gb(g, bw, bh, 0.06, light, x + ox, y + oy, 0.03, false);
    gb(g, w + 0.36, 0.07, 0.15, light, x, y - h / 2 - 0.05, 0.06, false);
  };
  const rail = new THREE.MeshBasicMaterial({ map: railTex(), alphaTest: 0.4, side: THREE.DoubleSide });
  const railing = (g, x, y, w) => { gp(g, w, 1.0, rail, x, y + 0.5, 0.02); gb(g, w, 0.05, 0.06, metal, x, y + 1.02, 0.02, false); };
  const FL = [3, 6, 9];

  // laje sobre os pilotis
  blk(-5.05, 5.05, 2.78, 3.0, -11.05, 10.05, corn);

  // --- bloco da frente (z 6.8..10): loggias à esquerda, painel claro com janelas à direita
  blk(-5, -4.55, 3, 12, 6.8, 10, dark);
  blk(-4.55, -1.4, 3, 12, 6.8, 8.7, inner);
  blk(-1.4, -0.55, 3, 12, 6.8, 10, light);
  blk(-0.55, -0.15, 3, 12, 6.8, 10, dark);
  blk(-0.15, 4.6, 3, 12, 6.8, 10, light);
  blk(4.6, 5, 3, 12, 6.8, 10, dark);
  const fr = G(0, 0, 10);
  for (const f of FL) {
    blk(-4.55, -1.4, f - 0.02, f + 0.16, 8.7, 10.02, corn); // laje da varanda
    const lg = G(0, 0, 8.7);
    win(lg, -2.7, f + 1.2, 1.25, 2.3, { lit: true, surround: false });
    win(lg, -1.85, f + 1.55, 0.35, 1.2, { lit: true, surround: false });
    railing(fr, -2.975, f + 0.16, 3.15);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), lamp); d.rotation.x = Math.PI / 2; d.position.set(-2.95, f + 2.82, 9.4); scene.add(d);
    const pl = new THREE.PointLight(0xffc98f, 4, 5, 1.8); pl.position.set(-2.95, f + 2.4, 9.5); scene.add(pl);
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), M(0x3e5f34, { roughness: 1 })); pot.position.set(-4.15, f + 0.65, 9.2); pot.scale.y = 1.3; scene.add(pot);
    win(fr, 0.95, f + 1.55, 1.3, 2.05);
    win(fr, 3.6, f + 1.55, 1.3, 2.05);
  }
  blk(-4.55, -1.4, 11.84, 12, 8.7, 10.02, corn);
  for (const y of [6, 9]) blk(-0.15, 4.6, y - 0.04, y + 0.04, 10, 10.03, corn);
  // fitas de LED nas bordas das lajes, dobrando a quina esquerda
  for (const y of [3, 6, 9, 11.98]) {
    box(3.66, 0.06, 0.06, led, -3.2, y - 0.08, 10.03, false);
    box(0.06, 0.06, 3.26, led, -5.03, y - 0.08, 8.4, false);
  }
  // coluna de tijolos de vidro iluminada na lateral esquerda
  plane(0.62, 8.6, new THREE.MeshBasicMaterial({ map: blockTex(), color: new THREE.Color(1.35, 1.3, 1.2) }), -5.02, 7.5, 7.25, -Math.PI / 2);

  // --- bloco do meio (z -6.2..6.8): mais baixo e recuado, claro com faixas escuras
  blk(-4.1, 4.4, 3, 11.8, -6.2, 5.3, light);
  blk(-3.2, 3.5, 3, 11.8, 5.3, 6.8, inner);
  blk(-4.2, 4.5, 11.8, 12.3, -6.25, 6.8, corn);
  for (const y of [6, 9]) { blk(-4.14, -4.1, y - 0.07, y + 0.07, -6.2, 5.3, dark); blk(4.4, 4.44, y - 0.07, y + 0.07, -6.2, 5.3, dark); }
  blk(-4.16, -4.1, 3, 11.8, 0.2, 1.0, dark); blk(4.4, 4.46, 3, 11.8, 0.2, 1.0, dark);
  const ls = G(-4.1, 0, 0, -Math.PI / 2), rs = G(4.4, 0, 0, Math.PI / 2);
  for (const f of FL) {
    for (const z of [4.2, 2.3, -0.9, -3.1]) win(ls, z, f + 1.55, 0.95, 1.5);
    win(ls, -5.1, f + 1.9, 0.5, 0.6, { surround: false });
    for (const z of [4.2, 2.3, -0.9, -3.1]) win(rs, -z, f + 1.55, 0.95, 1.5);
    // sacadinhas recuadas nas duas laterais, junto ao bloco da frente
    for (const sx of [-1, 1]) {
      const xe = sx < 0 ? -4.1 : 4.4, xi = sx < 0 ? -3.2 : 3.5;
      blk(Math.min(xe, xi), Math.max(xe, xi), f - 0.02, f + 0.14, 5.3, 6.8, corn);
      const g = G(xi, 0, 6.05, sx * Math.PI / 2);
      win(g, 0, f + 1.2, 0.9, 2.2, { lit: true, surround: false });
      railing(G(xe, 0, 6.05, sx * Math.PI / 2), 0, f + 0.14, 1.5);
    }
  }

  // --- bloco dos fundos (z -11..-6.2): loggia central e duas janelas por andar
  blk(-5, -1.9, 3, 12, -11, -6.2, dark);
  blk(1.9, 5, 3, 12, -11, -6.2, dark);
  blk(-1.9, 1.9, 3, 12, -9.7, -6.2, inner);
  const rr = G(0, 0, -11, Math.PI), rl = G(0, 0, -9.7, Math.PI);
  for (const f of FL) {
    blk(-1.9, 1.9, f - 0.02, f + 0.16, -11.02, -9.7, corn);
    win(rr, 3.45, f + 1.55, 1.1, 1.6); win(rr, -3.45, f + 1.55, 1.1, 1.6);
    win(rl, -0.8, f + 1.2, 1.0, 2.25, { lit: true, surround: false }); win(rl, 0.8, f + 1.2, 1.0, 2.25, { lit: true, surround: false });
    railing(rr, 0, f + 0.16, 3.8);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), lamp); d.rotation.x = Math.PI / 2; d.position.set(0, f + 2.82, -10.4); scene.add(d);
  }
  blk(-1.9, 1.9, 11.84, 12, -11.02, -9.7, corn);
  // torre da escada e do elevador com o nome Sobanski
  blk(-5, -3, 3, 14.4, -9.2, -6.2, dark);
  blk(-5.15, -2.85, 14.4, 14.65, -9.35, -6.05, corn);
  plane(1.9, 0.55, new THREE.MeshBasicMaterial({ map: nameTex(), transparent: true }), -5.02, 13.3, -7.7, -Math.PI / 2);

  // cornijas clássicas nos blocos da frente e dos fundos
  const cornice = (x0, x1, z0, z1) => {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    box(w + 0.1, 0.45, d + 0.1, corn, cx, 12.22, cz);
    box(w + 0.5, 0.15, d + 0.5, corn, cx, 12.52, cz);
    box(w + 0.3, 0.55, d + 0.3, dark, cx, 12.87, cz);
    box(w + 0.34, 0.06, d + 0.34, corn, cx, 12.95, cz, false);
    box(w + 0.46, 0.12, d + 0.46, corn, cx, 13.2, cz);
  };
  cornice(-5, 5, 6.8, 10);
  cornice(-5, 5, -11, -6.2);

  // --- térreo: arcadas, hall envidraçado, salão e garagem sob o prédio
  const archWall = (x0, x1, arches) => {
    const sh = new THREE.Shape(); sh.moveTo(x0, 0); sh.lineTo(x1, 0); sh.lineTo(x1, 2.78); sh.lineTo(x0, 2.78); sh.lineTo(x0, 0);
    for (const [a0, a1] of arches) {
      const r = (a1 - a0) / 2, c = (a0 + a1) / 2, spring = 2.55 - Math.min(r, 1.1);
      const h = new THREE.Path(); h.moveTo(a0, 0); h.lineTo(a0, spring); h.absellipse(c, spring, r, 2.55 - spring, Math.PI, 0, true); h.lineTo(a1, 0); h.lineTo(a0, 0);
      sh.holes.push(h);
    }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false, curveSegments: 24 });
    const m = new THREE.Mesh(geo, dark); m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  };
  archWall(-0.15, 5.05, [[0.25, 2.4], [2.7, 4.65]]).position.z = 9.65;
  archWall(-5.05, 5.05, [[-4.5, -0.35], [0.35, 4.5]]).position.z = -11.05;
  // hall com caixilhos em arco (porta de entrada)
  blk(-4.65, -0.3, 0, 2.78, 6.2, 9.45, inner);
  const hallGlow = M(0xfff1dc, { emissive: 0xffd8a0, emissiveIntensity: 0.55 });
  plane(4.3, 2.75, hallGlow, -2.47, 1.38, 9.46);
  for (const x of [-4.62, -3.17, -1.72, -0.32]) box(0.07, 2.78, 0.08, metal, x, 1.39, 9.6, false);
  box(4.4, 0.07, 0.08, metal, -2.47, 2.0, 9.6, false);
  for (const cx of [-3.895, -2.445, -1.02]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.035, 6, 32, Math.PI), metal); t.position.set(cx, 2.0, 9.6); t.scale.y = 1.05; scene.add(t); }
  const hl = new THREE.PointLight(0xffd8a0, 10, 9, 1.6); hl.position.set(-2.5, 2.3, 10.4); scene.add(hl);
  // salão de festas e áreas comuns (metade esquerda do térreo)
  blk(-4.65, -0.3, 0, 2.78, -10.5, 6.2, light);
  const gs = G(-4.65, 0, 0, -Math.PI / 2);
  for (const z of [3.5, 0.5, -2.5, -5.5]) win(gs, z, 1.4, 1.6, 1.3, { lit: true });
  // pilares e garagem sob o prédio
  for (const z of [5.4, 1.4, -2.6, -6.6]) box(0.45, 2.78, 0.45, dark, 4.75, 1.39, z);
  box(5.2, 0.04, 21.0, M(0x8d8780, { bumpMap: noise, bumpScale: 0.6 }), 2.4, 0.04, -0.5, false);
  for (const z of [7.5, 3.5, -0.5, -4.5, -8.5]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), lamp); d.rotation.x = Math.PI / 2; d.position.set(2.4, 2.76, z); scene.add(d); }
  const gl = new THREE.PointLight(0xffd2a0, 14, 14, 1.5); gl.position.set(2.4, 2.3, 0); scene.add(gl);
  const car = (x, z, color) => {
    const c = G(x, 0, z), body = M(color, { roughness: 0.25, metalness: 0.6 }), glassM = M(0x1d232a, { roughness: 0.1, metalness: 0.5 });
    gb(c, 1.8, 0.6, 4.3, body, 0, 0.55, 0); gb(c, 1.6, 0.5, 2.2, glassM, 0, 1.08, -0.2);
    for (const [wx, wz] of [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 16), M(0x111111)); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.33, wz); c.add(w); }
  };
  car(2.6, 4.2, 0xe9e9e7); car(2.6, -1.4, 0x8f9499); car(2.6, -7.2, 0xd8d8d6);

  // --- lote: piso, calçada, rua, muro com portões e letreiro
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), M(0x1d2618, { roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  box(20, 0.05, 27.2, M(0x2f3a24, { roughness: 1 }), 0, 0.02, -1.4, false);
  box(9.5, 0.06, 26.8, M(0x8b857d, { bumpMap: noise, bumpScale: 0.8 }), 5.0, 0.03, -1.4, false);
  box(300, 0.16, 3.0, M(0x9a948b, { bumpMap: noise, bumpScale: 0.8 }), 0, 0.08, 14.0, false);
  box(300, 0.05, 10, M(0x242528, { roughness: 0.85 }), 0, 0.025, 20.5, false);
  const muroM = M(0x6e6862, { bumpMap: noise, bumpScale: 1 });
  const wallSeg = (x0, x1, h = 2.6) => { blk(x0, x1, 0, h, 12.0, 12.4, muroM); blk(x0 - 0.03, x1 + 0.03, h, h + 0.08, 11.97, 12.43, corn); };
  wallSeg(-10, -8.7); wallSeg(-6.0, -5.9); wallSeg(-4.0, 1.45); wallSeg(6.5, 6.9, 3.0); wallSeg(8.4, 10, 3.0);
  blk(-8.7, -6.0, 2.35, 2.6, 12.0, 12.4, muroM); blk(-5.9, -4.0, 2.35, 2.6, 12.0, 12.4, muroM);
  // portões de garagem pretos (largo e estreito)
  const door = M(0x1e1e20, { roughness: 0.5, metalness: 0.3 });
  blk(-8.7, -6.0, 0, 2.35, 12.1, 12.25, door); blk(-5.9, -4.0, 0, 2.35, 12.1, 12.25, door);
  for (let y = 0.3; y < 2.3; y += 0.32) { box(2.7, 0.02, 0.04, metal, -7.35, y, 12.27, false); box(1.9, 0.02, 0.04, metal, -4.95, y, 12.27, false); }
  // letreiro iluminado com o nome do edifício e boas-vindas em polonês e ucraniano
  plane(5.2, 1.55, new THREE.MeshBasicMaterial({ map: signTex(), color: new THREE.Color(1.18, 1.14, 1.06) }), -1.27, 1.55, 12.41);
  blk(-4.0, 1.45, 0, 0.45, 12.4, 12.9, muroM);
  // portão de ferro em arco da garagem e portão de pedestres
  const gateTex = railTex(); gateTex.wrapS = THREE.RepeatWrapping; gateTex.repeat.set(2.2, 1.3);
  const gateM = new THREE.MeshBasicMaterial({ map: gateTex, alphaTest: 0.4, side: THREE.DoubleSide });
  plane(5.0, 2.3, gateM, 4.0, 1.15, 12.2);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.05, 6, 48, Math.PI), metal); arch.position.set(4.0, 2.3, 12.2); arch.scale.y = 0.38; scene.add(arch);
  const pg2 = gateTex.clone(); pg2.repeat.set(0.7, 1.2); pg2.needsUpdate = true;
  plane(1.45, 2.6, new THREE.MeshBasicMaterial({ map: pg2, alphaTest: 0.4, side: THREE.DoubleSide }), 7.65, 1.3, 12.2);
  // muros laterais e do fundo
  blk(-10.1, -9.9, 0, 2.2, -14.8, 12.0, muroM); blk(9.9, 10.1, 0, 2.2, -14.8, 12.0, muroM); blk(-10, 10, 0, 2.2, -15, -14.8, muroM);

  // palmeira em frente às varandas
  {
    const pm = G(-2.7, 0, 11.2), trunkM = M(0x6e5a44, { roughness: 1 }), frondM = M(0x3f6b34, { roughness: 0.9, side: THREE.DoubleSide });
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 6.2, 10), trunkM); tr.position.y = 3.1; tr.castShadow = true; pm.add(tr);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, tilt = 0.35 + (i % 3) * 0.25;
      const fg = new THREE.Group(); fg.position.y = 6.15; fg.rotation.set(0, a, 0); pm.add(fg);
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.6, 1, 6), frondM);
      const pos = leaf.geometry.attributes.position;
      for (let k = 0; k < pos.count; k++) { const yy = pos.getY(k) + 1.3; pos.setZ(k, -0.12 * yy * yy); pos.setX(k, pos.getX(k) * (1 - yy / 2.9)); }
      leaf.geometry.computeVertexNormals();
      leaf.rotation.x = -Math.PI / 2 + tilt; leaf.position.set(0, 0, 1.25); leaf.castShadow = true; fg.add(leaf);
    }
  }

  // luzes rasantes no muro e na fachada
  const cone = new THREE.MeshBasicMaterial({ map: coneTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const x of [-9.35, -5.95, -3.6, 1.1, 6.7, 8.6, 9.6]) plane(1.0, 2.3, cone, x, 1.15, 12.42);
  for (const x of [-4.8, -0.35, 4.8]) plane(1.2, 4.0, cone, x, 2.0, 10.42);
  for (const [x, z] of [[-6.5, 13.4], [4.5, 13.4], [-1.3, 13.6]]) { const p = new THREE.PointLight(0xffbf80, 7, 12, 1.7); p.position.set(x, 0.6, z); scene.add(p); }

  // vegetação
  const rt = rng(3);
  const trees = [[-13.5, 7, 1.15], [13.5, 7.5, 1.05], [-15, -4, 1.2], [-16.5, -14, 1.3], [15.5, -4, 1.2], [16, -15, 1.05], [-7, -23, 1.3], [6, -24, 1.15], [0, -29, 1.4], [-24, 9, 1], [24, 8, 1.1], [-28, -22, 1.5], [29, -24, 1.4]];
  const BLOBS = 170;
  const leafTex = leafCardTex();
  const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.82, envMapIntensity: 0.35, userData: { flat: true } });
  const leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.7, 1.7), leafMat, trees.length * BLOBS + 60);
  leaves.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafTex, alphaTest: 0.5 }); // sombra recortada pelas folhas
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.24, 1, 8), M(0x2c211a), trees.length);
  const o = new THREE.Object3D(); const col = new THREE.Color(); let n = 0;
  trees.forEach(([x, z, s], i) => {
    o.position.set(x, 2.6 * s, z); o.scale.set(s, 5.2 * s, s); o.rotation.set(0, 0, 0); o.updateMatrix(); trunks.setMatrixAt(i, o.matrix);
    for (let b = 0; b < BLOBS; b++) { // copa: muitos tufos pequenos sobre um elipsoide
      const a = rt() * Math.PI * 2, v = rt() * 2 - 1, sh = 0.55 + rt() * 0.45;
      const hr = Math.sqrt(1 - v * v) * 2.7 * s * sh;
      const k = (0.55 + rt() * 0.55) * s;
      o.position.set(x + Math.cos(a) * hr, 6.6 * s + v * 2.3 * s * sh + (v < 0 ? 0.5 : 0), z + Math.sin(a) * hr);
      o.scale.set(k * 1.15, k * 0.8, k * 1.15); o.rotation.set(rt() * 3, rt() * 3, rt() * 3); o.updateMatrix();
      leaves.setMatrixAt(n, o.matrix);
      leaves.setColorAt(n++, col.setHSL(0.2 + rt() * 0.06, 0.16 + rt() * 0.1, 0.16 + rt() * 0.1 + (v > 0.3 ? 0.06 : 0))); // copa: mais clara no topo, onde o céu ilumina
    }
  });
  for (let i = 0; i < 60; i++) { // canteiro junto ao muro
    const x = -3.85 + (i / 59) * 5.1, k = 0.24 + rt() * 0.16;
    o.position.set(x, 0.55 + rt() * 0.1, 12.66 + rt() * 0.14); o.scale.set(k, k, k); o.rotation.set(rt() * 3, rt() * 3, 0); o.updateMatrix();
    leaves.setMatrixAt(n, o.matrix);
    leaves.setColorAt(n++, col.setHSL(0.22 + rt() * 0.06, 0.25, 0.2 + rt() * 0.1));
  }
  leaves.castShadow = trunks.castShadow = true; leaves.receiveShadow = true;
  scene.add(leaves, trunks);
  // ao aproximar um andar, as árvores ficam translúcidas para não esconder o prédio
  const foliage = [leaves.material, trunks.material];
  foliage.forEach((m) => { m.transparent = true; });
  let fade = 0;

  // áreas clicáveis: uma por unidade (andar + final) e o térreo inteiro (áreas sociais)
  const hitBox = (k, floor, x0, x1, y0, y1, z0, z1) => {
    const g = new THREE.BoxGeometry(x1 - x0 + 0.08, y1 - y0 - 0.1, z1 - z0 + 0.08);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.userData = { k, floor, a: 0, target: 0 };
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: new THREE.Color(0xffdca6).multiplyScalar(2), transparent: true, opacity: 0 }));
    m.add(e); m.visible = false; scene.add(m);
    return m;
  };
  const hits = [hitBox('T', 'T', -5.05, 5.05, 0, 3, -11.1, 10.1)];
  for (const f of [1, 2, 3]) for (const sl of SLOTS) { const [x0, x1, z0, z1] = sl.box; hits.push(hitBox(`${f}${sl.fin}`, String(f), x0, x1, SLAB[f], SLAB[f] + 3, z0, z1)); }

  // relevo e variação de rugosidade nos acabamentos, antes de unir as peças por material
  enhanceMaterials(scene, { normalScale: 0.6, anisotropy: renderer.capabilities.getMaxAnisotropy() });
  // junta as peças estáticas por material: centenas de chamadas de desenho viram poucas dezenas
  mergeStatic(scene);

  /* ---------- pós-processamento ---------- */
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  // oclusão de ambiente (sombras de contato sob beirais, sacadas e junto ao chão) — só no computador
  let gtaoPass = null; // referência para o governador de qualidade
  if (!coarse) {
    const gtao = gtaoPass = new GTAOPass(scene, camera, 1, 1);
    // oclusão em meia resolução: a sombra de contato é suave (baixa frequência), então o resultado é
    // o mesmo à vista, mas o passe de normais (que redesenha a cena inteira) e o cálculo de AO
    // custam ~1/4. A mistura final continua na resolução cheia.
    const gtaoSize = gtao.setSize.bind(gtao);
    gtao.setSize = (w, h) => gtaoSize(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)));
    gtao.updateGtaoMaterial({ radius: 1.6, distanceExponent: 1.2, thickness: 3, scale: 1.15, samples: 12, distanceFallOff: 1 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 12 });
    gtao.blendIntensity = 0.9;
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.4, 1.0);
  bloom.enabled = !coarse;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const film = new ShaderPass(FilmShader); // vinheta e grão de filme, depois da conversão de cor
  film.uniforms.uGrain.value = coarse ? 0.02 : 0.03;
  film.material.toneMapped = false; // a mesma variante serve para a tela e para o dissolve
  composer.addPass(film);

  /* ---------- câmera e interação ---------- */
  // a câmera orbita um alvo (tx, ty, tz): o centro do prédio na vista normal, a unidade no voo
  const cur = { az: -0.72, pol: 1.5, rad: 60, tx: 0, ty: HOME_Y, tz: 0, shift: 0 };
  const goal = { ...cur };
  const KEYS = Object.keys(cur);
  let baseRad = 50, W = 1, H = 1, hovered = null, selected = null, panelOpen = false;
  let lastTouch = 0, visible = true, raf = 0, prev = performance.now(), dirty = true, lastDraw = 0;
  // shaders compilados em paralelo antes do primeiro quadro: a abertura (letras SOBANSKI) não engasga
  // enquanto a GPU prepara o prédio, e o primeiro quadro já sai completo, sem "pop"
  let ready = false, holdIntro = false, firstFrame;
  const whenReady = new Promise((r) => { firstFrame = r; });
  const parallel = renderer.extensions.has('KHR_parallel_shader_compile');
  // compila TODOS os materiais (não só os que estão no enquadramento): sem isso, cada objeto que
  // entrava na tela pela primeira vez durante a descida da câmera travava a animação
  (parallel ? renderer.compileAsync(scene, camera).catch(() => {}) : Promise.resolve(renderer.compile(scene, camera))).then(() => { ready = true; dirty = true; });

  /* ---------- estúdio claro: a planta 3D isolada (cutaway, sem teto) da unidade ----------
     Fica numa segunda cena, desenhada pelo MESMO renderer e pela mesma câmera: nada de novo
     contexto WebGL nem tela preta. A troca prédio -> estúdio é um dissolve feito na GPU. */
  const studio = new THREE.Scene();
  studio.add(new THREE.HemisphereLight(0xfffaf2, 0xd8c8b0, 0.62));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.2); // luz principal suave, de cima e da esquerda (~5200 K)
  key.castShadow = true; key.shadow.mapSize.setScalar(coarse ? 1024 : 2048);
  key.shadow.radius = 5; key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02;
  const rimL = new THREE.DirectionalLight(0xe9eefc, 0.55); // contraluz frio, separa as paredes do fundo
  studio.add(key, key.target, rimL, rimL.target);
  // chão do estúdio que só recebe sombra (o fundo creme continua limpo) + sombra de contato difusa
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.2 }));
  catcher.rotation.x = -Math.PI / 2; catcher.receiveShadow = true; studio.add(catcher);
  const blobTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(0.55, 'rgba(0,0,0,.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  let studioEnvDone = false;
  const studioEnv = () => { // reflexos de estúdio (softbox) para os materiais PBR da planta
    if (studioEnvDone) return; studioEnvDone = true;
    const pm = new THREE.PMREMGenerator(renderer);
    studio.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    studio.environmentIntensity = 0.38; pm.dispose();
  };

  const SCALE = 0.62; // planta em escala de maquete dentro do volume da unidade
  const apts = new Map();
  const setOpacity = (a, o) => { a.op = o; a.group.visible = o > 0.003; for (const m of a.mats) m.opacity = o; };
  function apt(planId) { // monta (uma vez) a maquete da planta; depois só reposiciona
    if (apts.has(planId)) return apts.get(planId);
    const b = buildPlanGroup(PLANS[planId]);
    const g = b.group;
    mergeStatic(g); // centenas de peças viram poucas malhas
    const mats = [...new Set(b.mats)];
    mats.forEach((m) => { m.transparent = true; });
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.scale.set(b.size[0] * 1.22, b.size[1] * 1.22, 1); blob.position.y = -0.335; blob.renderOrder = -1;
    g.add(blob); mats.push(blob.material);
    g.scale.setScalar(SCALE);
    studio.add(g);
    const a = { id: planId, group: g, mats, size: b.size, op: 0, anim: null };
    setOpacity(a, 0);
    apts.set(planId, a);
    return a;
  }
  const unitCenter = (id) => { const [x0, x1, z0, z1] = slotOf(id).box; return new THREE.Vector3((x0 + x1) / 2, SLAB[id[0]], (z0 + z1) / 2); };
  let studioShadow = false;
  const place = (a, id) => placeAt(a, unitCenter(id), slotOf(id).az);
  function placeAt(a, c, az) { // c = ponto do piso da unidade; luzes e chão do estúdio acompanham
    a.group.position.set(c.x, c.y + 0.34 * SCALE, c.z);
    a.group.rotation.y = az;
    const span = Math.hypot(...a.size) * SCALE * 0.75;
    key.position.set(c.x - 7, c.y + 12, c.z + 6); key.target.position.copy(c);
    Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 40 });
    key.shadow.camera.updateProjectionMatrix();
    rimL.position.set(c.x + 9, c.y + 6, c.z - 9); rimL.target.position.copy(c);
    catcher.position.set(c.x, c.y + 0.001, c.z);
    studioShadow = true;
  }
  const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 60));
  let studioCompiled = false;
  function precompileStudio() { // programas do estúdio prontos antes do clique: a transição começa na hora
    if (studioCompiled) return; studioCompiled = true;
    studioEnv();
    const vis = [...apts.values()].map((a) => [a, a.group.visible]);
    vis.forEach(([a]) => { a.group.visible = true; });
    if (parallel) renderer.compileAsync(studio, camera).catch(() => {}); else renderer.compile(studio, camera);
    vis.forEach(([a, v]) => { a.group.visible = v; });
    idle(warmUp);
  }
  // aquecimento: desenha uma vez, fora da tela, tudo o que a transição usa (estúdio, sombras do
  // estúdio, composição e dissolve). Sem isso esses programas compilavam no primeiro quadro do
  // dissolve e a animação engasgava justamente no meio da transição.
  let warmed = false;
  function warmUp(force) {
    if (mode !== 'orbit' || warmed) return;
    // nunca durante a rolagem nem com o topo fora da tela: espera um momento calmo (o clique força)
    if (force !== true && (performance.now() - lastScroll < 1200 || heroRatio < 0.5 || document.hidden)) { setTimeout(() => idle(warmUp), 1500); return; }
    warmed = true;
    const vis = [...apts.values()].map((a) => [a, a.group.visible, a.op]);
    vis.forEach(([a]) => { a.group.visible = true; for (const m of a.mats) m.opacity = 0.001; });
    const any = vis[0]?.[0]; if (any) place(any, `1${slotOf('101').fin}`);
    renderer.shadowMap.needsUpdate = true;
    composerB.setSize(64, 64); // compila tudo num alvo minúsculo: a memória cheia só é usada ao abrir uma unidade
    composerB.render();
    composer.renderToScreen = false; composer.render(); composer.renderToScreen = true; // variantes "fora da tela" do prédio
    const rt = new THREE.WebGLRenderTarget(4, 4), u = mixQuad.material.uniforms;
    u.tA.value = composer.readBuffer.texture; u.tB.value = composerB.readBuffer.texture;
    renderer.setRenderTarget(rt); mixQuad.render(renderer); renderer.setRenderTarget(null);
    rt.dispose(); u.tB.value = null;
    composerB.setSize(W, H); // volta ao tamanho da tela sem alocar: a memória só é usada ao abrir uma unidade
    vis.forEach(([a, v, op]) => { setOpacity(a, op); a.group.visible = v; });
    dirty = true;
  }

  // composição: prédio (composer A) e estúdio (composer B) misturados num shader de dissolve
  const targetB = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: coarse ? 2 : 4 });
  const composerB = new EffectComposer(renderer, targetB);
  composerB.addPass(new RenderPass(studio, camera, null, new THREE.Color(0, 0, 0), 0)); // fundo transparente: só a maquete
  composerB.addPass(new OutputPass());
  composerB.renderToScreen = false;
  // RawShaderMaterial: um único programa serve para a tela e para o aquecimento fora dela
  const mixQuad = new FullScreenQuad(new THREE.RawShaderMaterial({
    uniforms: { tA: { value: null }, tB: { value: null }, k: { value: 0 }, useA: { value: 1 }, back: { value: 0 }, uTime: { value: 0 }, cream: { value: new THREE.Vector3(241 / 255, 236 / 255, 229 / 255) } },
    vertexShader: 'precision highp float; attribute vec3 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `precision highp float; uniform sampler2D tA, tB; uniform float k, useA, back, uTime; uniform vec3 cream; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
      void main(){
        vec4 b = texture2D(tB, vUv);                                   // maquete (cor pré-multiplicada + alfa)
        vec2 d = vUv - 0.5;
        vec3 bg = cream * (1.0 - 0.06 * smoothstep(0.2, 0.9, dot(d, d) * 2.2)); // fundo creme com vinheta suave
        vec3 st = b.rgb + bg * (1.0 - b.a) + (h(vUv * 1024.0) - 0.5) * 0.01;
        vec3 a = useA > 0.5 ? texture2D(tA, vUv).rgb : st;
        // ida: a maquete aparece antes e o prédio se dissolve em creme logo depois;
        // volta: a maquete some primeiro, para não ficar flutuando diante da fachada
        float wa = mix(smoothstep(0.0, 0.55, k), smoothstep(0.5, 1.0, k), back);
        float w = mix(smoothstep(0.2, 1.0, k), wa, b.a);
        gl_FragColor = vec4(mix(a, st, w), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  }));

  const paint = () => { dirty = true; hits.forEach((m) => {
    const u = m.userData;
    u.target = u.floor === selected ? 0.2 : (hovered && (u.k === hovered || u.floor === hovered)) ? 0.16 : 0;
  }); };
  // destaque com fade suave (sobe e desce em ~150 ms)
  const stepHits = (dt) => {
    let busy = false;
    for (const m of hits) {
      const u = m.userData, t = u.target || 0;
      if (Math.abs(u.a - t) < 0.002) { if (u.a !== t) { u.a = t; busy = true; } } else { u.a += (t - u.a) * (1 - Math.exp(-dt * 14)); busy = true; }
      m.material.opacity = u.a; m.children[0].material.opacity = u.a * 4;
      m.visible = u.a > 0.002; // caixa só é desenhada quando destacada (o clique funciona mesmo invisível)
    }
    return busy;
  };
  const frame = () => {
    goal.rad = baseRad * (selected ? 0.86 : 1);
    goal.ty = selected ? FLOOR_Y[selected] * 0.5 + HOME_Y * 0.5 : HOME_Y;
    goal.shift = panelOpen ? 1 : 0;
  };
  const resize = () => {
    W = container.clientWidth; H = container.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H); composer.setSize(W, H); composerB.setSize(W, H); dirty = true;
    camera.aspect = W / H;
    baseRad = 46 / Math.min(1, Math.max(0.5, (W / H) * 1.08));
    if (mode === 'orbit') frame();
    else if (mode === 'studio' && unit) studioBase = studioRad(unit); // reenquadra sem girar nem pular
    // mudar o tamanho apaga o canvas: redesenha no mesmo quadro (no celular a barra de endereço
    // muda a altura ao rolar, e isso dava um piscar escuro na maquete)
    if (ready) draw(performance.now());
  };
  let mode = 'orbit', unit = null, flight = null, mixAnim = null, mix = 0, mixBack = 0, homeAz = 0;
  new ResizeObserver(resize).observe(container);
  resize();
  cur.rad = goal.rad * 1.25;
  let slowUntil = 0;

  /* ---------- voo de câmera (tween) ---------- */
  function fly(to, dur, { done, progress, radLate = false } = {}) {
    const from = {}; for (const p of KEYS) from[p] = cur[p];
    const t = { ...from, ...to };
    t.az = from.az + Math.atan2(Math.sin(t.az - from.az), Math.cos(t.az - from.az)); // menor caminho
    flight = { from, to: t, t0: performance.now(), dur: calm ? 1 : dur, done, progress, radLate };
  }
  function stepFlight(now) {
    const f = flight, t = clamp01((now - f.t0) / f.dur), e = ease3(t);
    // no voo de ida a aproximação se concentra no fim (primeiro orbita, depois mergulha), como no vídeo
    const er = f.radLate ? ease3(clamp01((t - 0.22) / 0.78)) : e;
    for (const p of KEYS) cur[p] = f.from[p] + (f.to[p] - f.from[p]) * (p === 'rad' ? er : e);
    f.progress?.(t);
    if (t >= 1 && flight === f) { flight = null; f.done?.(); }
  }
  const fadeMix = (to, dur) => { mixAnim = { from: mix, to, t0: performance.now(), dur: calm ? 1 : dur }; };
  const stepMix = (now) => {
    const m = mixAnim, t = clamp01((now - m.t0) / m.dur);
    mix = m.from + (m.to - m.from) * t * t * (3 - 2 * t);
    if (t >= 1) mixAnim = null;
  };
  const animOpacity = (a, to, dur, delay = 0) => { a.anim = { from: a.op, to, t0: performance.now() + delay, dur: calm ? 1 : dur }; if (to > 0) a.group.visible = true; };
  const stepApts = (now) => {
    let busy = false;
    for (const a of apts.values()) {
      if (!a.anim) continue; busy = true;
      const t = clamp01((now - a.anim.t0) / a.anim.dur);
      setOpacity(a, a.anim.from + (a.anim.to - a.anim.from) * t * t * (3 - 2 * t));
      if (t >= 1) a.anim = null;
    }
    return busy;
  };
  const fit = () => Math.min(1, Math.max(0.45, (W / H) * 1.08));
  const approachPose = (id) => { const sl = slotOf(id); return { az: sl.az, pol: 1.38, rad: 17 / fit(), tx: sl.at[0], ty: SLAB[id[0]] + 1.5, tz: sl.at[1], shift: 0 }; };
  // área livre da tela para a maquete (px): o que sobra entre o botão de voltar, as pílulas e o
  // cartão. O main.js mede os elementos reais e informa; aqui há um padrão até a primeira medida.
  let safe = null, zoom = 1, studioBase = 20;
  const ZMIN = 0.4, ZMAX = 1.5;
  const freeBox = () => {
    const s = safe || (W > 860 ? { t: 70, r: Math.min(460, W * 0.42), b: 80, l: 0 } : { t: 170, r: 0, b: H * 0.47, l: 0 });
    const fw = Math.max(140, W - s.l - s.r), fh = Math.max(140, H - s.t - s.b);
    return { fw, fh, cx: s.l + fw / 2, cy: s.t + fh / 2 };
  };
  // distância que faz a maquete caber inteira na área livre (largura: diagonal da planta, que é o
  // pior caso enquanto ela gira; altura: a planta vista de cima a ~52° mais a altura das paredes)
  const studioRad = (id) => {
    const a = apt(slotOf(id).plan), span = Math.hypot(...a.size) * SCALE, f = freeBox();
    const k = H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    return Math.max(span * k / (f.fw * 0.92), (span * 0.66 + 0.9) * k / (f.fh * 0.9));
  };
  const studioPose = (id, c = unitCenter(id), az = slotOf(id).az + 0.62) => {
    studioBase = studioRad(id); zoom = 1;
    return { az, pol: 0.9, rad: studioBase, tx: c.x, ty: c.y + 0.2, tz: c.z, shift: 1 };
  };

  const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
  const pick = (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    return ray.intersectObjects(hits, false)[0]?.object.userData.k ?? null;
  };
  let drag = null, pinch = null, lastTap = 0;
  const pts = new Map(); // dedos na tela (pinça para zoom no estúdio)
  const touched = () => { lastTouch = performance.now(); };
  const setZoom = (z) => { zoom = THREE.MathUtils.clamp(z, ZMIN, ZMAX); touched(); };
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  canvas.addEventListener('pointerdown', (e) => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { canvas.setPointerCapture(e.pointerId); } catch { /* ponteiro já liberado */ }
    touched();
    if (pts.size === 2 && mode === 'studio') { pinch = { d: Math.max(20, dist()), z: zoom }; drag = null; return; }
    if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, moved: 0 };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size >= 2) { setZoom(pinch.z * pinch.d / Math.max(20, dist())); return; } // afastar os dedos aproxima
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
      if (mode === 'fly') return;
      goal.az -= dx * 0.0065;
      if (mode === 'orbit' && e.pointerType === 'mouse') goal.pol = THREE.MathUtils.clamp(goal.pol - dy * 0.004, 1.05, 1.53);
      if (mode === 'studio') goal.pol = THREE.MathUtils.clamp(goal.pol - dy * 0.0045, 0.32, 1.25); // arrastar na vertical: ver mais de cima
      canvas.classList.add('dragging'); touched();
      if (drag.moved > 6 && hovered) { hovered = null; paint(); onHover(null, e); }
    } else if (e.pointerType === 'mouse' && mode === 'orbit') {
      const k = pick(e);
      if (k) touched(); // parado sobre uma unidade: o giro automático espera
      if (k !== hovered) { hovered = k; paint(); canvas.style.cursor = k ? 'pointer' : ''; if (k && k !== 'T') apt(slotOf(k).plan); } // já monta a planta no hover
      onHover(k, e, k ? anchorOf(k) : null);
    }
  });
  const end = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!drag) return;
    const click = drag.moved < 7; drag = null; canvas.classList.remove('dragging');
    if (click && e.type === 'pointerup' && mode === 'orbit') { const k = pick(e); if (k) { hovered = null; paint(); onHover(null, e); onSelect(k); } }
    if (click && e.type === 'pointerup' && mode === 'studio' && e.pointerType !== 'mouse') { // duplo toque: aproxima / volta
      const now = performance.now();
      if (now - lastTap < 320) { setZoom(zoom > 0.8 ? 0.55 : 1); lastTap = 0; } else lastTap = now;
    }
  };
  // rodinha do mouse e duplo clique: zoom na maquete (só no estúdio; no prédio a rodinha rola a página)
  canvas.addEventListener('wheel', (e) => { if (mode !== 'studio') return; e.preventDefault(); setZoom(zoom * Math.exp(e.deltaY * 0.0012)); }, { passive: false });
  canvas.addEventListener('dblclick', () => { if (mode === 'studio') setZoom(zoom > 0.8 ? 0.55 : 1); });
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', (e) => { if (!drag && hovered) { hovered = null; paint(); canvas.style.cursor = ''; onHover(null, e); } });
  canvas.addEventListener('keydown', (e) => {
    if (mode === 'fly') return;
    if (e.key === 'ArrowLeft') goal.az -= 0.35; else if (e.key === 'ArrowRight') goal.az += 0.35; else return;
    e.preventDefault(); touched();
  });
  // ponto da fachada onde o cartão do hover se ancora (coordenadas da tela)
  const av = new THREE.Vector3();
  function anchorOf(k) {
    if (k === 'T') av.set(0, 1.6, 10.1); else { const sl = slotOf(k); av.set(sl.at[0], SLAB[k[0]] + 1.5, sl.at[1]); }
    av.project(camera);
    return { x: (av.x + 1) / 2 * W, y: (1 - av.y) / 2 * H };
  }

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const rawDt = now - prev;
    const dt = Math.min(0.05, rawDt / 1000); prev = now;
    if (!ready || (holdIntro && !dirty)) return; // atrás da abertura: um único quadro pronto, depois espera
    const hl = stepHits(dt);
    // voo, dissolve e estúdio: um quadro por atualização de tela (60 fps), sem limitação
    if (mode !== 'orbit' || flight || mixAnim) {
      if (flight) stepFlight(now);
      if (mixAnim) stepMix(now);
      const fading = stepApts(now);
      if (mode === 'studio' && !flight) {
        if (!calm && !drag && !pinch && now - lastTouch > 3500) goal.az += dt * 0.05; // a maquete gira devagar sozinha
        goal.rad = studioBase * zoom;
        const ks = 1 - Math.exp(-dt * 6);
        cur.az += (goal.az - cur.az) * ks; cur.pol += (goal.pol - cur.pol) * ks; cur.rad += (goal.rad - cur.rad) * ks;
      }
      if (fading) studioShadow = true;
      draw(now);
      return;
    }
    // giro automático só com o topo bem à vista e a página parada: durante a rolagem a GPU fica livre
    // para o navegador (era a principal causa de travadas ao rolar)
    // giro só com a página parada, o topo à vista e alguém por perto (30 s sem interação: a GPU descansa)
    const spinning = !calm && !drag && !selected && now - lastTouch > 5000 && heroRatio >= 0.5 && now - lastScroll > 220 && now - lastActive < 30000;
    if (spinning) govern(now, rawDt);
    // rolando a página: a maquete congela no último quadro (sem nenhum desenho WebGL) até a rolagem parar
    if (now - lastScroll < 220 && !dirty && !drag && !hl) { if (!spinning) goal.az = cur.az; return; }
    if (spinning) goal.az += dt * 0.07;
    // desenha só quando algo muda; o giro automático roda a ~30 quadros por segundo
    let moving = dirty || hl || Math.abs(fade - (selected ? 1 : 0)) > 0.002;
    for (const p of KEYS) if (Math.abs(goal[p] - cur[p]) > 1e-4) moving = true;
    const settling = moving && !(spinning && !dirty && !hl);
    if (!moving || (!settling && now - lastDraw < 40)) return; // giro lento a 25 qps: suave e mais leve
    const k = holdIntro ? 0 : 1 - Math.exp(-dt * (now < slowUntil ? 1.1 : 5.5));
    for (const p of KEYS) cur[p] += (goal[p] - cur[p]) * k;
    fade += ((selected ? 1 : 0) - fade) * k;
    draw(now);
  };
  function draw(now) {
    foliage.forEach((m) => { m.opacity = 1 - fade * 0.8; m.depthWrite = fade < 0.5; });
    const s = Math.sin(cur.pol);
    camera.position.set(cur.tx + cur.rad * s * Math.sin(cur.az), cur.ty + cur.rad * Math.cos(cur.pol), cur.tz + cur.rad * s * Math.cos(cur.az));
    if (mode === 'orbit') camera.position.y = Math.max(1.2, camera.position.y);
    camera.lookAt(cur.tx, cur.ty, cur.tz);
    // abre espaço para o painel/cartão: desloca a imagem para a esquerda (desktop) ou para cima (celular)
    const wide = W > 860;
    let ox = wide ? Math.min(480, W * 0.42) / 2 * cur.shift : 0;
    let oy = wide ? 0 : H * 0.24 * cur.shift;
    if (unit) { const f = freeBox(); ox = (W / 2 - f.cx) * cur.shift; oy = (H / 2 - f.cy) * cur.shift; } // centraliza na área livre
    camera.setViewOffset(W, H, ox, oy, W, H);
    const tsec = (now * 0.001) % 97;
    film.uniforms.uTime.value = tsec;
    if (mix <= 0.0005) { composer.renderToScreen = true; composer.render(); }
    else {
      const useA = mix < 0.9995; // estúdio pleno: o prédio nem é desenhado (economia de GPU)
      if (useA) { composer.renderToScreen = false; composer.render(); }
      if (studioShadow) { renderer.shadowMap.needsUpdate = true; studioShadow = false; }
      composerB.render();
      const u = mixQuad.material.uniforms;
      u.tA.value = composer.readBuffer.texture; u.tB.value = composerB.readBuffer.texture;
      u.k.value = mix; u.useA.value = useA ? 1 : 0; u.back.value = mixBack; u.uTime.value = tsec;
      renderer.setRenderTarget(null); mixQuad.render(renderer);
    }
    if (hovered && mode === 'orbit' && (hovered === 'T' || hovered.length === 3)) onHover(hovered, null, anchorOf(hovered)); // o cartão acompanha a unidade (não no destaque de andar)
    dirty = false; lastDraw = now;
    firstFrame();
  }
  // laço 3D só roda com a maquete na tela e a aba visível; o giro pausa ao rolar
  let heroRatio = 1, lastScroll = 0, ioFirst = true, lastActive = performance.now();
  for (const ev of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']) addEventListener(ev, () => { lastActive = performance.now(); }, { passive: true });

  /* governador de qualidade: mede o ritmo real da página durante o giro. Se a GPU do aparelho não
     acompanha (média > 26 ms por quadro, ou seja, a página toda abaixo de ~38 qps), desliga um efeito
     por vez, do menos para o mais perceptível: brilho (bloom), oclusão (GTAO) e só então resolução.
     Num computador que acompanha, nada muda. Nunca volta a subir (sem oscilar). */
  const gov = { avg: 16.7, since: performance.now() + 5000 };
  const steps = [
    () => { if (!bloom.enabled) return false; bloom.enabled = false; return true; },
    () => { if (!gtaoPass?.enabled) return false; gtaoPass.enabled = false; return true; },
    () => { const pr = renderer.getPixelRatio(); if (pr <= 1.01) return false; const n = Math.max(1, pr - 0.5); renderer.setPixelRatio(n); composer.setPixelRatio(n); composerB.setPixelRatio(n); resize(); return true; },
  ];
  let tier = 0;
  function govern(now, rawDt) {
    if (now < gov.since || rawDt > 150 || tier >= steps.length) return; // aba voltando / já no mínimo
    gov.avg = gov.avg * 0.93 + rawDt * 0.07;
    if (gov.avg < 26) return;
    gov.avg = 16.7; gov.since = now + 2500; dirty = true;
    while (tier < steps.length && !steps[tier++]()) { /* pula o que já está desligado */ }
  }
  const wake = () => { cancelAnimationFrame(raf); if (visible && !document.hidden) { prev = performance.now(); dirty = true; gov.since = Math.max(gov.since, prev + 1500); raf = requestAnimationFrame(tick); } };
  new IntersectionObserver(([e]) => {
    heroRatio = e.intersectionRatio;
    if (ioFirst || visible !== e.isIntersecting) { ioFirst = false; visible = e.isIntersecting; wake(); } // o 1º aviso dá a partida
  }, { threshold: [0, 0.5, 1] }).observe(container);
  document.addEventListener('visibilitychange', wake);
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });

  /* ---------- pré-carregamento em segundo plano ----------
     Depois que a maquete aparece, as plantas são montadas uma por vez em momentos ociosos do
     navegador e os shaders do estúdio são compilados: o clique dispara a transição sem espera. */
  function preload() {
    const queue = [...new Set(SLOTS.map((s) => s.plan))];
    const next = () => { const id = queue.shift(); if (id) { apt(id); idle(next); } else idle(precompileStudio); };
    idle(next);
  }

  return {
    select(k) { if (mode !== 'orbit') return; selected = k; frame(); paint(); touched(); },
    highlight(k) { if (mode !== 'orbit') return; hovered = k; paint(); },
    setPanel(open) { if (mode !== 'orbit') return; panelOpen = open; frame(); },
    rotate(d) { goal.az += d; touched(); },
    whenReady, preload,
    get unit() { return unit; },
    // área livre (px) informada pela página; no estúdio a câmera reenquadra suavemente
    setSafe(s) { safe = s; if (mode === 'studio' && unit) { studioBase = studioRad(unit); touched(); } },
    zoomBy(f) { if (mode === 'studio') setZoom(zoom * f); },
    zoomReset() { if (mode === 'studio') { setZoom(1); goal.pol = 0.9; } },
    // clique numa unidade: orbita e aproxima até ela, dissolve o prédio no estúdio claro e
    // revela a planta 3D da unidade no mesmo lugar; onStudio avisa a hora de mostrar o cartão
    focusUnit(id, { onStudio } = {}) {
      if (mode === 'fly') return false;
      if (mode === 'studio') return this.switchUnit(id, { onStudio });
      hovered = null; paint(); onHover(null);
      homeAz = goal.az; selected = null; panelOpen = false; fade = 0;
      const a = apt(slotOf(id).plan);
      precompileStudio();
      warmUp(true); // clique antes do pré-carregamento terminar: prepara tudo agora, antes do voo (nunca no meio do dissolve)
      unit = id; mode = 'fly';
      for (const o of apts.values()) if (o !== a) setOpacity(o, 0);
      place(a, id); setOpacity(a, 1);
      let mixed = false; mixBack = 0;
      fly(approachPose(id), 2300, {
        radLate: true,
        progress: (t) => { if (!mixed && t > 0.8) { mixed = true; fadeMix(1, 750); } },
        done: () => {
          let told = false;
          fly(studioPose(id), 1100, {
            progress: (t) => { if (!told && t > 0.35) { told = true; onStudio?.(); } },
            done: () => { mode = 'studio'; Object.assign(goal, cur); touched(); },
          });
        },
      });
      return true;
    },
    // troca de unidade sem sair do estúdio: a nova planta surge no mesmo lugar, em cross-fade, com um
    // leve giro de câmera (no estúdio não há prédio de referência, então nada precisa atravessar a tela)
    switchUnit(id, { onStudio } = {}) {
      if (!unit || mode === 'fly' || id === unit) return false;
      const from = apt(slotOf(unit).plan), to = apt(slotOf(id).plan);
      const c = new THREE.Vector3(cur.tx, cur.ty - 0.2, cur.tz);
      unit = id; mode = 'fly';
      if (from === to) { animOpacity(to, 0.15, 260); setTimeout(() => animOpacity(to, 1, 420), 270); } // mesmo modelo, outro andar
      else { placeAt(to, c, from.group.rotation.y); setOpacity(to, 0); animOpacity(from, 0, 420); animOpacity(to, 1, 620, 140); }
      fly(studioPose(id, c, cur.az + 0.35), 1000, { done: () => { mode = 'studio'; Object.assign(goal, cur); touched(); onStudio?.(); } });
      return true;
    },
    // volta ao prédio: o caminho inverso, igualmente contínuo
    exitUnit({ onLanding, onDone } = {}) {
      if (!unit || mode === 'fly') return false;
      const id = unit; mode = 'fly';
      let faded = false; mixBack = 1;
      fly(approachPose(id), 1000, {
        progress: (t) => { if (!faded && t > 0.3) { faded = true; fadeMix(0, 700); } },
        done: () => {
          let landed = false;
          fly({ az: homeAz, pol: 1.5, rad: baseRad, tx: 0, ty: HOME_Y, tz: 0, shift: 0 }, 1800, {
            progress: (t) => { if (!landed && t > 0.5) { landed = true; onLanding?.(); } },
            done: () => {
              mode = 'orbit'; unit = null; Object.assign(goal, cur); touched();
              for (const o of apts.values()) setOpacity(o, 0);
              composerB.renderTarget1.dispose(); composerB.renderTarget2.dispose(); // libera a memória do estúdio
              onDone?.();
            },
          });
        },
      });
      return true;
    },
    // posiciona a câmera no ponto de partida da abertura e desenha esse quadro por trás da tela
    // preta: quando a abertura some, o prédio já está lá, sem salto de câmera
    prime() {
      cur.rad = goal.rad * 2.3; cur.pol = 0.62; cur.az = goal.az - 1.5; cur.ty = HOME_Y + 3;
      holdIntro = true; dirty = true;
    },
    // abertura: a câmera desce do alto, de longe, girando até o enquadramento normal
    intro(ms = 3600) {
      if (!holdIntro) this.prime();
      holdIntro = false;
      slowUntil = performance.now() + ms; lastTouch = performance.now(); dirty = true;
    },
  };
}
