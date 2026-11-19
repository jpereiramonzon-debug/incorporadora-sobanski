// Maquete 3D do Edifício Santa Ana: giro 360°, andares clicáveis.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeStatic } from './merge.js';

const FLOOR_Y = { T: 1.5, 1: 4.5, 2: 7.5, 3: 10.5 };
const HOME_Y = 7.4;

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
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 2 : 1.75)); // celular com tela densa: mais pixels para ficar nítido
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
  const camera = new THREE.PerspectiveCamera(32, 1, 2, 700);

  scene.add(new THREE.HemisphereLight(0x9aa6d8, 0x4a3a30, 1.25));
  const sun = new THREE.DirectionalLight(0xffc09a, 1.5);
  sun.position.set(-34, 17, 26);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(innerWidth < 860 ? 2048 : 4096);
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
        : new THREE.MeshStandardMaterial({ map: t, roughness: 0.18, metalness: 0.35 });
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
  const BLOBS = 90;
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M(0xffffff, { roughness: 1 }), trees.length * BLOBS + 60);
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.24, 1, 8), M(0x2c211a), trees.length);
  const o = new THREE.Object3D(); const col = new THREE.Color(); let n = 0;
  trees.forEach(([x, z, s], i) => {
    o.position.set(x, 2.6 * s, z); o.scale.set(s, 5.2 * s, s); o.rotation.set(0, 0, 0); o.updateMatrix(); trunks.setMatrixAt(i, o.matrix);
    for (let b = 0; b < BLOBS; b++) { // copa: muitos tufos pequenos sobre um elipsoide
      const a = rt() * Math.PI * 2, v = rt() * 2 - 1, sh = 0.55 + rt() * 0.45;
      const hr = Math.sqrt(1 - v * v) * 2.7 * s * sh;
      const k = (0.42 + rt() * 0.5) * s;
      o.position.set(x + Math.cos(a) * hr, 6.6 * s + v * 2.3 * s * sh + (v < 0 ? 0.5 : 0), z + Math.sin(a) * hr);
      o.scale.set(k * 1.15, k * 0.8, k * 1.15); o.rotation.set(rt() * 3, rt() * 3, rt() * 3); o.updateMatrix();
      leaves.setMatrixAt(n, o.matrix);
      leaves.setColorAt(n++, col.setHSL(0.25 + rt() * 0.07, 0.3 + rt() * 0.15, 0.05 + rt() * 0.07 + (v > 0.3 ? 0.03 : 0)));
    }
  });
  for (let i = 0; i < 60; i++) { // canteiro junto ao muro
    const x = -3.85 + (i / 59) * 5.1, k = 0.24 + rt() * 0.16;
    o.position.set(x, 0.55 + rt() * 0.1, 12.66 + rt() * 0.14); o.scale.set(k, k, k); o.rotation.set(rt() * 3, rt() * 3, 0); o.updateMatrix();
    leaves.setMatrixAt(n, o.matrix);
    leaves.setColorAt(n++, col.setHSL(0.26 + rt() * 0.07, 0.4, 0.13 + rt() * 0.1));
  }
  leaves.castShadow = trunks.castShadow = true; leaves.receiveShadow = true;
  scene.add(leaves, trunks);
  // ao aproximar um andar, as árvores ficam translúcidas para não esconder o prédio
  const foliage = [leaves.material, trunks.material];
  foliage.forEach((m) => { m.transparent = true; });
  let fade = 0;

  // áreas clicáveis dos andares
  const hits = Object.entries(FLOOR_Y).map(([k, y]) => {
    const g = new THREE.BoxGeometry(10.6, 2.86, 21.4);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(0, y, -0.5); m.userData.k = k;
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: new THREE.Color(0xffdca6).multiplyScalar(2) }));
    e.visible = false; m.visible = false; m.add(e); scene.add(m);
    return m;
  });

  // junta as peças estáticas por material: centenas de chamadas de desenho viram poucas dezenas
  mergeStatic(scene);

  /* ---------- pós-processamento ---------- */
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.35, 1.0);
  bloom.enabled = !coarse;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- câmera e interação ---------- */
  const cur = { az: -0.72, pol: 1.5, rad: 60, ty: HOME_Y, shift: 0 };
  const goal = { ...cur };
  let baseRad = 50, W = 1, H = 1, hovered = null, selected = null, panelOpen = false;
  let lastTouch = 0, visible = true, raf = 0, prev = performance.now(), dirty = true, lastDraw = 0;
  const perf = { n: 0, sum: 0, done: false, from: performance.now() + 2500 }; // não mede enquanto a página ainda carrega

  const paint = () => { dirty = true; hits.forEach((m) => {
    const sel = m.userData.k === selected, hov = m.userData.k === hovered;
    m.material.opacity = sel ? 0.2 : hov ? 0.13 : 0;
    m.children[0].visible = sel || hov;
    m.visible = sel || hov; // caixa de clique só é desenhada quando destacada (o clique funciona mesmo invisível)
  }); };
  const frame = () => {
    goal.rad = baseRad * (selected ? 0.86 : 1);
    goal.ty = selected ? FLOOR_Y[selected] * 0.5 + HOME_Y * 0.5 : HOME_Y;
    goal.shift = panelOpen ? 1 : 0;
  };
  const resize = () => {
    W = container.clientWidth; H = container.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H); composer.setSize(W, H); dirty = true;
    camera.aspect = W / H;
    baseRad = 46 / Math.min(1, Math.max(0.5, (W / H) * 1.08));
    frame();
  };
  new ResizeObserver(resize).observe(container);
  resize();
  cur.rad = goal.rad * 1.25;
  let slowUntil = 0;

  const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
  const pick = (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    return ray.intersectObjects(hits, false)[0]?.object.userData.k ?? null;
  };
  let drag = null;
  const touched = () => { lastTouch = performance.now(); };
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, moved: 0 };
    canvas.setPointerCapture(e.pointerId); touched();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
      goal.az -= dx * 0.0065;
      if (e.pointerType === 'mouse') goal.pol = THREE.MathUtils.clamp(goal.pol - dy * 0.004, 1.05, 1.53);
      canvas.classList.add('dragging'); touched();
      if (drag.moved > 6 && hovered) { hovered = null; paint(); onHover(null, e); }
    } else if (e.pointerType === 'mouse') {
      const k = pick(e);
      if (k !== hovered) { hovered = k; paint(); canvas.style.cursor = k ? 'pointer' : ''; }
      onHover(k, e);
    }
  });
  const end = (e) => {
    if (!drag) return;
    const click = drag.moved < 7; drag = null; canvas.classList.remove('dragging');
    if (click && e.type === 'pointerup') { const k = pick(e); if (k) { hovered = null; onHover(null, e); onSelect(k); } }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', (e) => { if (!drag && hovered) { hovered = null; paint(); onHover(null, e); } });
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goal.az -= 0.35; else if (e.key === 'ArrowRight') goal.az += 0.35; else return;
    e.preventDefault(); touched();
  });

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    const spinning = !calm && !drag && !selected && now - lastTouch > 5000;
    if (spinning) goal.az += dt * 0.07;
    // desenha só quando algo muda; o giro automático roda a ~30 quadros por segundo
    let moving = dirty || Math.abs(fade - (selected ? 1 : 0)) > 0.002;
    for (const p in cur) if (Math.abs(goal[p] - cur[p]) > 1e-4) moving = true;
    const settling = moving && !(spinning && !dirty);
    if (!moving || (!settling && now - lastDraw < 32)) return;
    const k = 1 - Math.exp(-dt * (now < slowUntil ? 1.1 : 5.5));
    for (const p in cur) cur[p] += (goal[p] - cur[p]) * k;
    fade += ((selected ? 1 : 0) - fade) * k;
    foliage.forEach((m) => { m.opacity = 1 - fade * 0.8; m.depthWrite = fade < 0.5; });
    const s = Math.sin(cur.pol);
    camera.position.set(cur.rad * s * Math.sin(cur.az), cur.ty + cur.rad * Math.cos(cur.pol), cur.rad * s * Math.cos(cur.az));
    camera.position.y = Math.max(1.2, camera.position.y);
    camera.lookAt(0, cur.ty, 0);
    // abre espaço para o painel: desloca a imagem para a esquerda (desktop) ou para cima (celular)
    const wide = W > 860;
    const ox = wide ? Math.min(480, W * 0.42) / 2 * cur.shift : 0;
    const oy = wide ? 0 : H * 0.27 * cur.shift;
    camera.setViewOffset(W, H, ox, oy, W, H);
    composer.render();
    const gap = now - lastDraw;
    dirty = false; lastDraw = now;
    if (!perf.done && settling && now > perf.from && ++perf.n > 5) { // aparelho lento: reduz resolução e brilho
      perf.sum += Math.min(gap, 100);
      if (perf.n === 65) {
        perf.done = true;
        if (perf.sum / 60 > 30 && renderer.getPixelRatio() > 1.5) { const pr = Math.max(1.5, renderer.getPixelRatio() - 0.5); renderer.setPixelRatio(pr); composer.setPixelRatio(pr); bloom.enabled = false; resize(); }
      }
    }
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) { prev = performance.now(); dirty = true; raf = requestAnimationFrame(tick); }
  }).observe(container);

  return {
    select(k) { selected = k; frame(); paint(); touched(); },
    highlight(k) { hovered = k; paint(); },
    setPanel(open) { panelOpen = open; frame(); },
    rotate(d) { goal.az += d; touched(); },
    // abertura: a câmera desce do alto, de longe, girando até o enquadramento normal
    intro(ms = 3600) {
      cur.rad = goal.rad * 2.3; cur.pol = 0.62; cur.az = goal.az - 1.5; cur.ty = HOME_Y + 3;
      slowUntil = performance.now() + ms; lastTouch = performance.now(); dirty = true;
    },
  };
}
