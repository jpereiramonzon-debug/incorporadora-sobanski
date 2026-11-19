// Kit de reconstrução procedural: texturas geradas em código, primitivas e móveis
// das fotos de referência do Edifício Santa Ana. Unidades em metros; y para cima.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- texturas ---------------- */
const cache = new Map();
export function ctex(key, w, h, draw, srgb = true) {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}
// cópia com repetição própria (a imagem é compartilhada)
export function rep(t, rx, ry = rx) {
  const c = t.clone();
  c.repeat.set(rx, ry);
  c.needsUpdate = true;
  return c;
}

const lines = (g, r, n, w, h, col, a0, a1, lw0, lw1, wob) => {
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    g.strokeStyle = `rgba(${col},${a0 + r() * (a1 - a0)})`;
    g.lineWidth = lw0 + r() * (lw1 - lw0);
    g.beginPath(); g.moveTo(x, 0);
    const ph = r() * 9, am = r() * wob;
    for (let y = 0; y <= h; y += 16) g.lineTo(x + Math.sin(y * 0.018 + ph) * am, y);
    g.stroke();
  }
};

export const TX = {
  noise: () => ctex('noise', 256, 256, (g, w, h) => {
    const d = g.createImageData(w, h), r = rng(7);
    for (let i = 0; i < d.data.length; i += 4) { const v = 110 + r() * 40; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
  }, false),
  // tecido (bouclê, linho): grão fino usado como relevo
  weave: () => ctex('weave', 256, 256, (g, w, h) => {
    const r = rng(17);
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const v = 90 + r() * 80;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 1.8, 0, 7); g.fill();
    }
  }, false),
  wood: (base = '#b8875a') => ctex('wood' + base, 512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const r = rng(base.length * 31 + 5);
    lines(g, r, 160, w, h, '70,40,18', 0.04, 0.13, 0.6, 2.6, 4);
    lines(g, r, 70, w, h, '255,236,205', 0.04, 0.1, 1, 3, 3);
    for (let i = 0; i < 4; i++) { // nós discretos
      const x = r() * w, y = r() * h;
      g.strokeStyle = 'rgba(80,45,20,.12)'; g.lineWidth = 1.2;
      for (let k = 1; k < 5; k++) { g.beginPath(); g.ellipse(x, y, 3 * k, 9 * k, 0, 0, 7); g.stroke(); }
    }
  }),
  // porcelanato claro, 2 x 2 placas por textura
  porcelain: (base = '#e3dfd8') => ctex('porc' + base, 1024, 1024, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const r = rng(9);
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(150,140,128,${0.03 + r() * 0.05})`; g.lineWidth = 1 + r() * 4;
      g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 300; y += (r() - 0.5) * 300; g.quadraticCurveTo(x + 40, y - 40, x, y); }
      g.stroke();
    }
    g.fillStyle = 'rgba(150,142,130,.55)';
    for (const p of [0, w / 2]) { g.fillRect(p - 1.5, 0, 3, h); g.fillRect(0, p - 1.5, w, 3); }
  }),
  brick: () => ctex('brick', 512, 512, (g, w, h) => {
    g.fillStyle = '#cfc4b6'; g.fillRect(0, 0, w, h);
    const r = rng(3), bh = 32, bw = 96;
    for (let row = 0; row < h / bh; row++) {
      const off = (row % 2) * bw / 2;
      for (let x = -bw; x < w + bw; x += bw) {
        const k = r();
        g.fillStyle = `rgb(${150 + k * 55 | 0},${68 + k * 30 + r() * 10 | 0},${44 + k * 22 | 0})`;
        g.fillRect(x + off + 2.5, row * bh + 2.5, bw - 5, bh - 5);
        for (let s = 0; s < 14; s++) { g.fillStyle = `rgba(${r() < 0.5 ? '60,25,15' : '230,190,160'},.25)`; g.fillRect(x + off + r() * bw, row * bh + r() * bh, 2, 2); }
      }
    }
  }),
  subway: () => ctex('subway', 512, 512, (g, w, h) => {
    g.fillStyle = '#d8d2c8'; g.fillRect(0, 0, w, h);
    const bh = 32, bw = 128, r = rng(4);
    for (let row = 0; row < h / bh; row++) for (let x = -bw; x < w + bw; x += bw) {
      const v = 240 + r() * 10;
      g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
      g.fillRect(x + (row % 2) * bw / 2 + 2, row * bh + 2, bw - 4, bh - 4);
    }
  }),
  hex: () => ctex('hex', 512, 444, (g, w, h) => {
    g.fillStyle = '#f2f0ec'; g.fillRect(0, 0, w, h);
    const s = w / 6, vh = Math.sqrt(3) * s;
    g.strokeStyle = '#bdb8b0'; g.lineWidth = 3;
    for (let cx = -3 * s; cx < w + 3 * s; cx += 1.5 * s) {
      const col = Math.round(cx / (1.5 * s));
      for (let cy = -vh; cy < h + vh; cy += vh) {
        const y = cy + (col % 2 ? vh / 2 : 0);
        g.beginPath();
        for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.lineTo(cx + Math.cos(a) * s * 0.97, y + Math.sin(a) * s * 0.97); }
        g.closePath(); g.stroke();
      }
    }
  }),
  // ladrilho hidráulico azul e branco do hall
  encaustic: () => ctex('encaustic', 512, 512, (g, w, h) => {
    const t = 128, blue = '#2d4b80';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const x = i * t, y = j * t;
      g.fillStyle = '#f1ede4'; g.fillRect(x, y, t, t);
      g.fillStyle = blue;
      for (const [cx, cy] of [[x, y], [x + t, y], [x, y + t], [x + t, y + t]]) { g.beginPath(); g.arc(cx, cy, t * 0.28, 0, 7); g.fill(); }
      g.fillStyle = '#f1ede4';
      for (const [cx, cy] of [[x, y], [x + t, y], [x, y + t], [x + t, y + t]]) { g.beginPath(); g.arc(cx, cy, t * 0.15, 0, 7); g.fill(); }
      g.fillStyle = blue;
      g.beginPath(); g.moveTo(x + t / 2, y + t * 0.2); g.lineTo(x + t * 0.8, y + t / 2); g.lineTo(x + t / 2, y + t * 0.8); g.lineTo(x + t * 0.2, y + t / 2); g.fill();
      g.fillStyle = '#f1ede4';
      g.beginPath(); g.arc(x + t / 2, y + t / 2, t * 0.12, 0, 7); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, t - 2, t - 2);
    }
  }),
  grass: () => ctex('grass', 512, 512, (g, w, h) => {
    g.fillStyle = '#4d7a32'; g.fillRect(0, 0, w, h);
    const r = rng(21);
    for (let i = 0; i < 9000; i++) {
      const x = r() * w, y = r() * h, l = 4 + r() * 8;
      g.strokeStyle = `hsl(${85 + r() * 25},${40 + r() * 25}%,${22 + r() * 22}%)`; g.lineWidth = 1 + r();
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - l); g.stroke();
    }
  }),
  pavers: () => ctex('pavers', 512, 512, (g, w, h) => {
    g.fillStyle = '#7d7b78'; g.fillRect(0, 0, w, h);
    const r = rng(8), bw = 128, bh = 64;
    for (let row = 0; row < h / bh; row++) for (let x = -bw; x < w + bw; x += bw) {
      const v = 128 + r() * 30;
      g.fillStyle = `rgb(${v},${v - 2},${v - 6})`;
      g.fillRect(x + (row % 2) * bw / 2 + 3, row * bh + 3, bw - 6, bh - 6);
      for (let s = 0; s < 40; s++) { g.fillStyle = `rgba(${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},.05)`; g.fillRect(x + r() * bw, row * bh + r() * bh, 3, 3); }
    }
  }),
  ivy: () => ctex('ivy', 512, 512, (g, w, h) => {
    g.fillStyle = '#20361b'; g.fillRect(0, 0, w, h);
    const r = rng(33);
    for (let i = 0; i < 4200; i++) {
      g.fillStyle = `hsl(${88 + r() * 30},${35 + r() * 30}%,${18 + r() * 26}%)`;
      g.save(); g.translate(r() * w, r() * h); g.rotate(r() * 7);
      g.beginPath(); g.ellipse(0, 0, 4 + r() * 6, 3 + r() * 4, 0, 0, 7); g.fill(); g.restore();
    }
  }),
  concrete: (base = '#b9b5ae') => ctex('conc' + base, 512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const r = rng(12);
    for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '70,70,70' : '255,255,255'},${r() * 0.06})`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); }
  }),
  granite: () => ctex('granite', 512, 512, (g, w, h) => {
    g.fillStyle = '#16171a'; g.fillRect(0, 0, w, h);
    const r = rng(14);
    for (let i = 0; i < 7000; i++) { const v = 60 + r() * 160; g.fillStyle = `rgba(${v},${v},${v},${0.15 + r() * 0.4})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
  }),
  // paisagem vista pela janela (luz do dia, desfocada)
  view: (kind = 'trees') => ctex('view' + kind, 512, 512, (g, w, h) => {
    const s = g.createLinearGradient(0, 0, 0, h);
    s.addColorStop(0, '#d9e7f2'); s.addColorStop(0.55, '#f3efe4'); s.addColorStop(1, '#e8dcc4');
    g.fillStyle = s; g.fillRect(0, 0, w, h);
    const r = rng(kind.length * 7);
    g.filter = 'blur(7px)';
    if (kind === 'city') { g.fillStyle = '#c9c4ba'; for (let i = 0; i < 6; i++) g.fillRect(r() * w, h * (0.3 + r() * 0.2), 60 + r() * 90, h); }
    if (kind === 'field') { // campo aberto e enevoado, como nas fotos do Tipo 01
      const f = g.createLinearGradient(0, h * 0.55, 0, h);
      f.addColorStop(0, '#c9c6b4'); f.addColorStop(1, '#b3ad92');
      g.fillStyle = f; g.fillRect(0, h * 0.58, w, h);
      for (let i = 0; i < 18; i++) { g.fillStyle = `hsla(${80 + r() * 30},14%,${52 + r() * 10}%,.8)`; g.beginPath(); g.ellipse(r() * w, h * 0.57, 12 + r() * 26, 8 + r() * 12, 0, 0, 7); g.fill(); }
      g.filter = 'none';
      return;
    }
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `hsl(${90 + r() * 30},${25 + r() * 20}%,${38 + r() * 20}%)`;
      g.beginPath(); g.arc(r() * w, h * (0.35 + r() * 0.6), 30 + r() * 70, 0, 7); g.fill();
    }
    g.filter = 'none';
  }),
  // guarda-corpo de ferro com volutas (varanda do Tipo 01)
  railing: () => ctex('railing', 1024, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = g.fillStyle = '#141416'; g.lineCap = 'round';
    g.fillRect(0, 0, w, 16); g.fillRect(0, 70, w, 7); g.fillRect(0, h - 16, w, 16);
    for (let x = 6; x < w; x += 64) g.fillRect(x, 0, 8, h);
    g.lineWidth = 6;
    for (let x = 38; x < w; x += 128) { // par de volutas espelhadas em cada vão
      for (const s of [-1, 1]) {
        g.beginPath(); g.moveTo(x, 110); g.bezierCurveTo(x + s * 40, 120, x + s * 40, 190, x + s * 6, 200);
        g.bezierCurveTo(x - s * 26, 205, x - s * 20, 168, x + s * 2, 172); g.stroke();
        g.beginPath(); g.moveTo(x, 330); g.bezierCurveTo(x + s * 40, 320, x + s * 40, 250, x + s * 6, 240);
        g.bezierCurveTo(x - s * 26, 235, x - s * 20, 272, x + s * 2, 268); g.stroke();
      }
      g.fillRect(x - 4, 100, 8, 240);
      for (const s of [-1, 1]) { g.beginPath(); g.arc(x + 32 * s + 32, 40, 14, 0, 7); g.stroke(); }
    }
  }),
  carpet: () => ctex('carpet', 256, 256, (g, w, h) => {
    g.fillStyle = '#9c9e99'; g.fillRect(0, 0, w, h);
    const r = rng(52);
    for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(${r() < 0.5 ? '60,62,60' : '230,232,228'},${0.08 + r() * 0.1})`; g.fillRect(0, y, w, 2); }
  }),
  abstract: () => ctex('abstract', 300, 420, (g, w, h) => {
    g.fillStyle = '#f7f5f0'; g.fillRect(0, 0, w, h);
    const blob = (x, y, rx, ry, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0.2, 0, 7); g.fill(); };
    blob(120, 120, 70, 78, '#9cc9c6'); blob(185, 210, 70, 95, '#5d6f86'); blob(120, 300, 68, 70, '#a39aa8'); blob(220, 225, 40, 40, '#f0b58c');
    g.strokeStyle = '#d8b46a'; g.lineWidth = 3; g.beginPath(); g.ellipse(190, 120, 45, 38, 0.4, 0, 7); g.stroke();
  }),
  sheer: () => ctex('sheer', 256, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) { const v = 0.72 + Math.sin(x * 0.2) * 0.12 + Math.sin(x * 0.53) * 0.06; g.fillStyle = `rgba(255,255,255,${v})`; g.fillRect(x, 0, 1, h); }
  }),
  channel: () => ctex('channel', 256, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) { const v = 128 + Math.cos((x / 32) * Math.PI * 2) * 70; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, h); }
  }, false),
  // painel de madeira com frisos curvos (quarto 1 do Tipo 03)
  curves: () => ctex('curves', 1024, 1024, (g, w, h) => {
    g.drawImage(TX.wood('#b98a5d').image, 0, 0, w, h);
    g.strokeStyle = 'rgba(70,40,18,.55)'; g.lineWidth = 4;
    for (const x0 of [0.22, 0.5, 0.78]) {
      g.beginPath(); g.moveTo(x0 * w, h);
      g.bezierCurveTo(x0 * w - 70, h * 0.6, x0 * w + 70, h * 0.4, x0 * w, 0); g.stroke();
    }
    g.strokeStyle = 'rgba(70,40,18,.35)'; g.lineWidth = 3;
    for (let x = 0; x <= w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  }),
  reed: () => ctex('reed', 128, 64, (g, w, h) => {
    for (let x = 0; x < w; x++) { const v = 200 + Math.sin(x * 0.8) * 30; g.fillStyle = `rgb(${v},${v - 8},${v - 22})`; g.fillRect(x, 0, 1, h); }
  }),
  // mural do quarto infantil: balão, nuvens e folhagens
  mural: () => ctex('mural', 1024, 640, (g, w, h) => {
    g.fillStyle = '#efe6d3'; g.fillRect(0, 0, w, h);
    const r = rng(41);
    g.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 7; i++) { const x = r() * w, y = r() * h * 0.6 + 40; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + k * 26, y + Math.sin(k) * 10, 28 + r() * 16, 0, 7); g.fill(); } }
    g.strokeStyle = 'rgba(138,160,128,.8)'; g.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const x = r() < 0.5 ? r() * 200 : w - r() * 200; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + 30, h - 150, x - 10, h - 250 - r() * 90); g.stroke(); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(150,172,138,.75)'; g.beginPath(); g.ellipse(x + (k % 2 ? 16 : -16), h - 40 - k * 36, 14, 6, k % 2 ? 0.6 : -0.6, 0, 7); g.fill(); } }
    const cx = w * 0.52, cy = h * 0.34, R = 120; // balão desenhado à parte e recortado em elipse
    const bc = document.createElement('canvas'); bc.width = 2 * R; bc.height = 2.3 * R;
    const b = bc.getContext('2d'), cols = ['#b9c7b0', '#e9dcc4', '#c8b49a', '#e9dcc4', '#9fb4a6', '#e9dcc4'];
    for (let i = 0; i < 6; i++) { b.fillStyle = cols[i]; b.fillRect(i * (2 * R / 6), 0, 2 * R / 6 + 1, 2.3 * R); }
    b.globalCompositeOperation = 'destination-in'; b.beginPath(); b.ellipse(R, 1.12 * R, R, R * 1.12, 0, 0, 7); b.fill();
    g.drawImage(bc, cx - R, cy - 1.12 * R);
    g.strokeStyle = '#8a6a4a'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 60, cy + 95); g.lineTo(cx - 36, cy + 190); g.moveTo(cx + 60, cy + 95); g.lineTo(cx + 36, cy + 190); g.stroke();
    g.fillStyle = '#a8825a'; g.fillRect(cx - 40, cy + 190, 80, 54);
    g.fillStyle = '#b48b62'; g.beginPath(); g.arc(cx, cy + 178, 22, 0, 7); g.fill(); // ursinho no cesto
    g.beginPath(); g.arc(cx - 17, cy + 160, 9, 0, 7); g.arc(cx + 17, cy + 160, 9, 0, 7); g.fill();
  }),
  paws: () => ctex('paws', 256, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#1d1d1f';
    for (let i = 0; i < 5; i++) {
      const x = 70 + (i % 2) * 110, y = 470 - i * 95;
      g.beginPath(); g.ellipse(x, y, 20, 17, 0, 0, 7); g.fill();
      for (const [dx, dy] of [[-22, -24], [-8, -34], [8, -34], [22, -24]]) { g.beginPath(); g.ellipse(x + dx, y + dy, 7, 9, 0, 0, 7); g.fill(); }
    }
  }),
  art: (seed = 1) => ctex('art' + seed, 256, 320, (g, w, h) => {
    g.fillStyle = '#f2ece2'; g.fillRect(0, 0, w, h);
    const r = rng(seed * 13);
    g.strokeStyle = '#1e1e1e'; g.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + i * 0.4, x = w / 2, y = h * 0.82;
      g.beginPath(); g.moveTo(x, y); const ex = x + Math.sin(a) * 110, ey = y - Math.cos(a) * 160 * (0.7 + r() * 0.3);
      g.quadraticCurveTo(x + Math.sin(a) * 40, y - 70, ex, ey); g.stroke();
      g.fillStyle = '#1e1e1e'; g.beginPath(); g.ellipse(ex, ey, 9, 20, a, 0, 7); g.fill();
    }
  }),
  // céu para as áreas externas
  sky: () => ctex('sky', 16, 512, (g, w, h) => {
    const s = g.createLinearGradient(0, 0, 0, h);
    s.addColorStop(0, '#6ea5d8'); s.addColorStop(0.5, '#b7d3ea'); s.addColorStop(0.62, '#e9ecea'); s.addColorStop(1, '#c9cfc4');
    g.fillStyle = s; g.fillRect(0, 0, w, h);
  }),
};

/* ---------------- materiais ---------------- */
export const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
export const glow = (color, k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k) });
export const fabric = (color, scale = 3) => M(color, { roughness: 1, bumpMap: rep(TX.weave(), scale), bumpScale: 0.6 });
export const woodM = (base = '#b8875a', rx = 1, ry = 1, o = {}) => M(0xffffff, { map: rep(TX.wood(base), rx, ry), roughness: 0.6, ...o });
export const metal = (color = 0xc9c9cb, rough = 0.28) => M(color, { metalness: 1, roughness: rough });
export const brass = () => metal(0xc8a165, 0.32);
export const blackMetal = () => M(0x1b1b1d, { metalness: 0.6, roughness: 0.45 });
export const paint = (color) => M(color, { roughness: 0.92, bumpMap: rep(TX.noise(), 4), bumpScale: 0.25 });
export const glass = (o = {}) => new THREE.MeshStandardMaterial({ color: 0xdfe8ec, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.18, depthWrite: false, ...o });

/* ---------------- primitivas (y = base do objeto) ---------------- */
function put(p, mesh, x, y, z, o) {
  mesh.position.set(x, y, z);
  if (o.ry) mesh.rotation.y = o.ry;
  if (o.rx) mesh.rotation.x = o.rx;
  if (o.rz) mesh.rotation.z = o.rz;
  mesh.castShadow = o.cast ?? true;
  mesh.receiveShadow = true;
  if (o.solid) mesh.userData.solid = true;
  p.add(mesh);
  return mesh;
}
export const box = (p, m, w, h, d, x = 0, y = 0, z = 0, o = {}) => put(p, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y + h / 2, z, o);
export const rbox = (p, m, w, h, d, r, x = 0, y = 0, z = 0, o = {}) => put(p, new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), m), x, y + h / 2, z, o);
export const cyl = (p, m, rt, rb, h, x = 0, y = 0, z = 0, o = {}) => put(p, new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 32, 1, o.open ?? false, o.t0 ?? 0, o.tl ?? Math.PI * 2), m), x, y + h / 2, z, o);
export const sph = (p, m, r, x = 0, y = 0, z = 0, o = {}) => {
  const s = put(p, new THREE.Mesh(new THREE.SphereGeometry(r, o.seg ?? 24, Math.round((o.seg ?? 24) * 0.66)), m), x, y, z, o);
  if (o.s) s.scale.set(...o.s);
  return s;
};
export const plane = (p, m, w, h, x = 0, y = 0, z = 0, o = {}) => put(p, new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), x, y, z, { cast: false, ...o });
export const grp = (p, x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g); return g; };
export const solid = (o) => { o.userData.solid = true; return o; };

// várias caixas iguais com uma única chamada de desenho (ripados, treliças)
export function boxes(p, m, list, o = {}) {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, list.length);
  const t = new THREE.Object3D();
  list.forEach(([w, h, d, x, y, z, ry = 0], i) => { t.position.set(x, y + h / 2, z); t.rotation.set(0, ry, 0); t.scale.set(w, h, d); t.updateMatrix(); im.setMatrixAt(i, t.matrix); });
  im.castShadow = o.cast ?? true; im.receiveShadow = true;
  p.add(im);
  return im;
}

/* ---------------- ambiente: casca do cômodo ---------------- */
// cômodo centrado na origem: x em [-w/2, w/2], z em [-d/2, d/2]; parede norte em z = -d/2
export function shell(p, { w, d, h = 2.65, floor, walls, ceil = paint(0xf7f5f1), baseboard = 0xf2efe9 }) {
  const W = 'n' in walls ? walls : { n: walls, s: walls, e: walls, w: walls };
  const f = plane(p, floor, w, d, 0, 0, 0, { rx: -Math.PI / 2 });
  f.userData.floor = true;
  plane(p, ceil, w, d, 0, h, 0, { rx: Math.PI / 2 });
  if (W.n) plane(p, W.n, w, h, 0, h / 2, -d / 2);
  if (W.s) plane(p, W.s, w, h, 0, h / 2, d / 2, { ry: Math.PI });
  if (W.w) plane(p, W.w, d, h, -w / 2, h / 2, 0, { ry: Math.PI / 2 });
  if (W.e) plane(p, W.e, d, h, w / 2, h / 2, 0, { ry: -Math.PI / 2 });
  if (baseboard) {
    const b = M(baseboard, { roughness: 0.6 });
    box(p, b, w, 0.08, 0.015, 0, 0, -d / 2 + 0.008, { cast: false });
    box(p, b, w, 0.08, 0.015, 0, 0, d / 2 - 0.008, { cast: false });
    box(p, b, 0.015, 0.08, d, -w / 2 + 0.008, 0, 0, { cast: false });
    box(p, b, 0.015, 0.08, d, w / 2 - 0.008, 0, 0, { cast: false });
  }
  return f;
}

// sanca de gesso com fita de LED (recorte retangular no forro)
export function cove(p, { w, d, x = 0, z = 0, h = 2.65, drop = 0.12 }) {
  const c = paint(0xf7f5f1);
  const t = 0.35;
  box(p, c, w + 2 * t, drop, t, x, h - drop, z - d / 2 - t / 2, { cast: false });
  box(p, c, w + 2 * t, drop, t, x, h - drop, z + d / 2 + t / 2, { cast: false });
  box(p, c, t, drop, d, x - w / 2 - t / 2, h - drop, z, { cast: false });
  box(p, c, t, drop, d, x + w / 2 + t / 2, h - drop, z, { cast: false });
  const led = glow(0xffd9a3, 3);
  for (const [lw, ld, lx, lz] of [[w, 0.02, x, z - d / 2 - 0.02], [w, 0.02, x, z + d / 2 + 0.02], [0.02, d, x - w / 2 - 0.02, z], [0.02, d, x + w / 2 + 0.02, z]]) box(p, led, lw, 0.015, ld, lx, h - drop - 0.005, lz, { cast: false });
}

export function spots(p, pts, h = 2.65) {
  const ring = M(0xffffff, { roughness: 0.4 }), lit = glow(0xfff1d8, 4);
  for (const [x, z] of pts) {
    cyl(p, ring, 0.05, 0.05, 0.01, x, h - 0.012, z, { cast: false });
    cyl(p, lit, 0.032, 0.032, 0.004, x, h - 0.016, z, { cast: false });
  }
}

/* ---------------- aberturas ---------------- */
function curtainGeo(w, h, waves) {
  const g = new THREE.PlaneGeometry(w, h, Math.max(16, waves * 8), 1);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) / w) * waves * Math.PI * 2) * 0.035);
  g.computeVertexNormals();
  return g;
}
export const curtainMat = () => new THREE.MeshStandardMaterial({ color: 0xffffff, map: TX.sheer(), transparent: true, side: THREE.DoubleSide, roughness: 1, emissive: 0xfff6ea, emissiveIntensity: 0.18, depthWrite: false });
export function curtain(p, w, h, x, z, ry = 0, y = 0) {
  const m = new THREE.Mesh(curtainGeo(w, h, Math.round(w * 6)), curtainMat());
  m.position.set(x, y + h / 2, z); m.rotation.y = ry; p.add(m);
  return m;
}

// janela: vista externa luminosa + caixilho preto + cortinas; o lado interno fica para +z local
export function windowUnit(p, { w = 1.2, h = 1.5, sill = 0.8, x = 0, z = 0, ry = 0, view = 'trees', curtains = true, ceil = 2.65, door = false, lightK = 1 }) {
  const g = grp(p, x, 0, z, ry);
  const y0 = door ? 0 : sill;
  plane(g, new THREE.MeshBasicMaterial({ map: TX.view(view), color: new THREE.Color(1.05, 1.05, 1.05) }), w, h, 0, y0 + h / 2, 0.004);
  const f = blackMetal(), t = 0.05;
  box(g, f, w + t, t, 0.06, 0, y0 + h - t / 2, 0.03, { cast: false });
  box(g, f, w + t, t, 0.06, 0, y0 - t / 2 + (door ? t : 0), 0.03, { cast: false });
  box(g, f, t, h, 0.06, -w / 2, y0, 0.03, { cast: false });
  box(g, f, t, h, 0.06, w / 2, y0, 0.03, { cast: false });
  box(g, f, 0.035, h, 0.05, 0, y0, 0.035, { cast: false });
  if (!door) box(g, M(0xeeeae2, { roughness: 0.5 }), w + 0.1, 0.03, 0.14, 0, sill - 0.03, 0.07, { cast: false });
  if (curtains) {
    const ch = ceil - 0.04;
    box(g, metal(0x2a2a2c, 0.5), w + 0.7, 0.02, 0.02, 0, ch - 0.02, 0.17, { cast: false });
    curtain(g, w * 0.55, ch - 0.03, -w / 2 - 0.12, 0.17);
    curtain(g, w * 0.55, ch - 0.03, w / 2 + 0.12, 0.17);
  }
  const L = new THREE.RectAreaLight(0xfff3e2, 5 * lightK, w, h);
  L.position.set(0, y0 + h / 2, 0.05); L.lookAt(0, y0 + h / 2, 5); g.add(L);
  return g;
}

export function door(p, { x, z, ry = 0, w = 0.82, h = 2.1, color = 0xf3f0ea }) {
  const g = grp(p, x, 0, z, ry);
  box(g, M(color, { roughness: 0.55 }), w, h, 0.04, 0, 0, 0.02, { cast: false });
  box(g, M(0xffffff, { roughness: 0.5 }), w + 0.12, 0.06, 0.02, 0, h, 0.012, { cast: false });
  for (const s of [-1, 1]) box(g, M(0xffffff, { roughness: 0.5 }), 0.06, h, 0.02, s * (w / 2 + 0.03), 0, 0.012, { cast: false });
  box(g, metal(0x2b2b2d, 0.35), 0.14, 0.02, 0.05, w / 2 - 0.12, 1.02, 0.05, { cast: false });
  return g;
}

/* ---------------- móveis e objetos ---------------- */
// sofá: assento voltado para +z local
export function sofa(p, { len = 2.1, dep = 0.92, color = 0xefebe3, x = 0, z = 0, ry = 0, pillows = [0xd8c7ae, 0x8c7b6a] }) {
  const g = solid(grp(p, x, 0, z, ry)), f = fabric(color);
  for (const s of [-1, 1]) for (const t of [-1, 1]) cyl(g, woodM('#6b4a2e'), 0.02, 0.016, 0.08, s * (len / 2 - 0.08), 0, t * (dep / 2 - 0.08));
  rbox(g, f, len, 0.3, dep, 0.05, 0, 0.08, 0);
  rbox(g, f, len, 0.42, 0.24, 0.08, 0, 0.3, -dep / 2 + 0.12);
  for (const s of [-1, 1]) rbox(g, f, 0.2, 0.26, dep, 0.08, s * (len / 2 - 0.1), 0.3, 0);
  const n = len > 1.8 ? 2 : 1, cw = (len - 0.4) / n;
  for (let i = 0; i < n; i++) {
    const cx = -len / 2 + 0.2 + cw * (i + 0.5);
    rbox(g, f, cw - 0.02, 0.14, dep - 0.28, 0.06, cx, 0.36, 0.1);
    const b = rbox(g, f, cw - 0.04, 0.42, 0.16, 0.07, cx, 0.46, -dep / 2 + 0.3); b.rotation.x = -0.18;
  }
  pillows.forEach((c, i) => { const q = rbox(g, fabric(c, 2), 0.42, 0.4, 0.13, 0.06, (i ? 1 : -1) * (len / 2 - 0.42), 0.48, -dep / 2 + 0.42); q.rotation.set(-0.25, (i ? -1 : 1) * 0.25, (i ? 1 : -1) * 0.12); });
  return g;
}

export function boucleChair(p, { x, z, ry = 0, color = 0xf1ece2 }) {
  const g = grp(p, x, 0, z, ry), f = fabric(color, 2), w = woodM('#b48a5c');
  for (const [lx, lz] of [[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.17], [0.18, 0.17]]) { const l = cyl(g, w, 0.015, 0.012, 0.45, lx, 0, lz); l.rotation.set(lz * 0.25, 0, -lx * 0.25); }
  rbox(g, f, 0.5, 0.09, 0.47, 0.04, 0, 0.43, 0.02);
  cyl(g, f, 0.27, 0.25, 0.34, 0, 0.5, 0.02, { open: true, t0: Math.PI * 0.62, tl: Math.PI * 0.76, seg: 24 }).material.side = THREE.DoubleSide;
  cyl(g, f, 0.29, 0.27, 0.34, 0, 0.5, 0.02, { open: true, t0: Math.PI * 0.62, tl: Math.PI * 0.76, seg: 24 });
  return g;
}

export function roundTable(p, { x, z, r = 0.55, top = '#c39a6b' }) {
  const g = solid(grp(p, x, 0, z)), w = woodM(top);
  cyl(g, w, r, r, 0.04, 0, 0.72, 0, { seg: 48 });
  cyl(g, w, 0.11, 0.3, 0.72, 0, 0, 0, { seg: 40 });
  return g;
}

export function chandelierGlobes(p, { x, z, ceil = 2.65, y = 1.95, n = 6, span = 0.5 }) {
  const g = grp(p, x, 0, z), b = brass(), gl = M(0xf3e6d0, { roughness: 0.08, transparent: true, opacity: 0.55, depthWrite: false, emissive: 0xffd9a8, emissiveIntensity: 0.6 }), bulb = glow(0xffd9a3, 6);
  cyl(g, b, 0.006, 0.006, ceil - y, 0, y, 0, { cast: false });
  box(g, b, span * 2, 0.018, 0.018, 0, y, 0, { cast: false });
  box(g, b, 0.018, 0.018, span * 1.2, 0, y - 0.12, 0, { cast: false });
  cyl(g, b, 0.006, 0.006, 0.12, 0, y - 0.12, 0, { cast: false });
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, px = Math.cos(a) * span * (i % 2 ? 0.95 : 0.6), pz = Math.sin(a) * span * 0.6, py = y - 0.06 - (i % 3) * 0.08;
    sph(g, gl, 0.085, px, py, pz, { cast: false });
    sph(g, bulb, 0.022, px, py, pz, { cast: false });
  }
  const L = new THREE.PointLight(0xffc98a, 4, 5, 2); L.position.set(0, y - 0.1, 0); g.add(L);
  return g;
}

export function pendant(p, { x, z, ceil = 2.65, y = 1.75, style = 'black', light = 2.2 }) {
  const g = grp(p, x, 0, z), m = style === 'gold' ? brass() : blackMetal();
  cyl(g, M(0x111111), 0.003, 0.003, ceil - y, 0, y, 0, { cast: false });
  if (style === 'gold') cyl(g, m, 0.05, 0.05, 0.22, 0, y - 0.22, 0, { cast: false });
  else cyl(g, m, 0.03, 0.12, 0.16, 0, y - 0.16, 0, { cast: false, open: true });
  cyl(g, glow(0xffe0b0, 5), style === 'gold' ? 0.045 : 0.1, style === 'gold' ? 0.045 : 0.1, 0.005, 0, y - (style === 'gold' ? 0.225 : 0.165), 0, { cast: false });
  if (light) { const L = new THREE.PointLight(0xffc98a, light, 4, 2); L.position.set(0, y - 0.3, 0); g.add(L); }
  return g;
}

export function sconce(p, { x, y, z, ry = 0, globes = 2 }) {
  const g = grp(p, x, y, z, ry), b = brass();
  box(g, b, 0.05, 0.36, 0.02, 0, -0.18, 0.01, { cast: false });
  for (let i = 0; i < globes; i++) {
    const gy = 0.1 - i * 0.2;
    box(g, b, 0.015, 0.015, 0.1, 0, gy - 0.008, 0.06, { cast: false });
    sph(g, M(0xfff4e0, { emissive: 0xffd7a0, emissiveIntensity: 2.2, roughness: 0.2 }), 0.06, 0, gy, 0.13, { cast: false });
  }
  const L = new THREE.PointLight(0xffc98a, 1.4, 3, 2); L.position.set(0, 0, 0.25); g.add(L);
  return g;
}

export function tv(p, { w = 1.3, x, y = 1.05, z, ry = 0 }) {
  const g = grp(p, x, y, z, ry), h = w * 0.5625;
  box(g, M(0x0d0d0f, { roughness: 0.4, metalness: 0.3 }), w, h, 0.04, 0, -h / 2, 0.02);
  plane(g, M(0x101216, { roughness: 0.35, metalness: 0.3 }), w - 0.02, h - 0.02, 0, 0, 0.041);
  return g;
}

export function rack(p, { w = 1.8, x, z, ry = 0, wood = '#b8875a', h = 0.42, floating = true }) {
  const g = solid(grp(p, x, 0, z, ry)), m = woodM(wood, w, 0.4);
  const y = floating ? 0.22 : 0;
  box(g, m, w, h, 0.42, 0, y, 0.21);
  for (let i = 1; i < 3; i++) box(g, M(0x6b4a2e), 0.006, h - 0.04, 0.002, -w / 2 + (w / 3) * i, y + 0.02, 0.421, { cast: false });
  return g;
}

export function ac(p, { x, y = 2.2, z, ry = 0, w = 0.85 }) {
  const g = grp(p, x, y, z, ry);
  rbox(g, M(0xfbfbf9, { roughness: 0.35 }), w, 0.28, 0.2, 0.04, 0, 0, 0.1);
  box(g, M(0x9c9c9c, { roughness: 0.5 }), w - 0.12, 0.025, 0.02, 0, 0.03, 0.2, { cast: false });
  box(g, glow(0x7fd0ff, 1.5), 0.05, 0.01, 0.005, w / 2 - 0.12, 0.2, 0.202, { cast: false });
  return g;
}

export function plant(p, { x, z, h = 1.1, pot = 0xd9d2c5, potR = 0.18, leaf = 'broad', seed = 1, y = 0 }) {
  const g = grp(p, x, y, z), r = rng(seed * 97 + 3);
  cyl(g, M(pot, { roughness: 0.7 }), potR, potR * 0.82, potR * 1.6, 0, 0, 0);
  cyl(g, M(0x3a2c22, { roughness: 1 }), potR * 0.95, potR * 0.95, 0.01, 0, potR * 1.55, 0, { cast: false });
  const n = leaf === 'bamboo' ? 220 : Math.round(40 + h * 40), k = Math.min(1, 0.35 + h * 0.55);
  const geo = leaf === 'bamboo' ? new THREE.PlaneGeometry(0.035, 0.16) : new THREE.SphereGeometry(1, 16, 10);
  const im = new THREE.InstancedMesh(geo, M(0xffffff, { roughness: 0.75, side: THREE.DoubleSide }), n);
  const o = new THREE.Object3D(), c = new THREE.Color();
  const stemM = M(0x5a4632);
  const stems = leaf === 'bamboo' ? 7 : 4;
  for (let s = 0; s < stems; s++) cyl(g, leaf === 'bamboo' ? M(0x8c9a5a) : stemM, 0.008, 0.012, h * (0.6 + r() * 0.4), (r() - 0.5) * potR, potR * 1.5, (r() - 0.5) * potR, { cast: false });
  for (let i = 0; i < n; i++) {
    const t = r(), a = r() * 7, rad = (leaf === 'bamboo' ? 0.08 : 0.32 * k) * Math.sin(t * Math.PI) + 0.03 * k;
    o.position.set(Math.cos(a) * rad, potR * 1.6 + h * (0.25 + t * 0.75), Math.sin(a) * rad);
    o.rotation.set(r() * 3, r() * 3, r() * 3);
    if (leaf === 'bamboo') o.scale.setScalar(0.8 + r() * 0.5); else o.scale.set((0.09 + r() * 0.04) * k, 0.01, (0.05 + r() * 0.025) * k);
    o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    im.setColorAt(i, c.setHSL(0.27 + r() * 0.06, 0.45, 0.2 + r() * 0.14));
  }
  im.castShadow = true; g.add(im);
  return g;
}

export function rug(p, { w = 2, d = 1.4, x = 0, z = 0, color = 0xe6dccb, round = false, ry = 0 }) {
  const m = M(color, { roughness: 1, bumpMap: rep(TX.weave(), 6), bumpScale: 0.8 });
  const r = round ? cyl(p, m, w / 2, w / 2, 0.012, x, 0.001, z, { cast: false, seg: 64 }) : box(p, m, w, 0.012, d, x, 0.001, z, { cast: false, ry });
  return r;
}

// ripado vertical de madeira: espessuras e vãos como nas fotos
export function slats(p, { w, h, x = 0, y = 0, z = 0, ry = 0, slat = 0.035, gap = 0.025, dep = 0.04, wood = '#b07c4f', back = null }) {
  const g = grp(p, x, y, z, ry), list = [];
  for (let sx = -w / 2 + slat / 2; sx <= w / 2; sx += slat + gap) list.push([slat, h, dep, sx, 0, 0]);
  boxes(g, woodM(wood, 0.1, h / 1.2), list);
  if (back) box(g, back, w, h, 0.01, 0, 0, -dep / 2 - 0.005, { cast: false });
  return g;
}

export function lattice(p, { w, h, x, y = 0, z, ry = 0, cell = 0.16, t = 0.03, dep = 0.05, wood = '#b07c4f' }) {
  const g = grp(p, x, y, z, ry), list = [];
  for (let sx = -w / 2; sx <= w / 2 + 1e-3; sx += cell) list.push([t, h, dep, sx, 0, 0]);
  for (let sy = 0; sy <= h + 1e-3; sy += cell) list.push([w, t, dep, 0, Math.min(sy, h - t), 0]);
  boxes(g, woodM(wood, 0.2, 2), list);
  return solid(g);
}

export function nightstand(p, { x, z, ry = 0, wood = '#b8875a', w = 0.48 }) {
  const g = grp(p, x, 0, z, ry);
  box(g, woodM(wood, 0.5, 0.5), w, 0.5, 0.4, 0, 0.05, 0);
  box(g, M(0x3a2a1c), w - 0.04, 0.005, 0.002, 0, 0.3, 0.2, { cast: false });
  return g;
}

// cama: cabeceira para -z local
export function bed(p, { w = 1.6, l = 2.0, x, z, ry = 0, sheet = 0xf4f1ea, duvet = 0xbdb6ab, throwC = 0xc89a84, pillows = [0xf4f1ea, 0xbdb6ab, 0xd9c7b0], wood = '#c4a27e' }) {
  const g = solid(grp(p, x, 0, z, ry));
  box(g, woodM(wood, 1, 1), w + 0.04, 0.28, l + 0.02, 0, 0, 0);
  rbox(g, fabric(sheet, 3), w, 0.24, l, 0.06, 0, 0.26, 0);
  rbox(g, fabric(duvet, 3), w + 0.06, 0.08, l * 0.72, 0.04, 0, 0.47, l * 0.14);
  box(g, fabric(duvet, 3), w + 0.06, 0.24, 0.04, 0, 0.28, l * 0.5 - 0.04 + 0.02);
  rbox(g, fabric(throwC, 2), w + 0.1, 0.05, 0.5, 0.025, 0, 0.53, l / 2 - 0.3);
  for (const s of [-1, 1]) box(g, fabric(throwC, 2), 0.03, 0.3, 0.5, s * (w / 2 + 0.05), 0.25, l / 2 - 0.3);
  pillows.forEach((c, i) => {
    for (const s of [-1, 1]) {
      const q = rbox(g, fabric(c, 2), w * 0.42 - i * 0.06, 0.36 - i * 0.07, 0.14, 0.06, s * w * 0.22, 0.5, -l / 2 + 0.16 + i * 0.11);
      q.rotation.x = -0.25;
    }
  });
  return g;
}

export function headboard(p, { w, h = 1.15, x, y = 0, z, ry = 0, color = 0xe7dfd2, channels = true }) {
  const ch = TX.channel();
  return rbox(p, M(color, { roughness: 1, bumpMap: channels ? rep(ch, w / 0.5, 1) : null, bumpScale: 2.5 }), w, h, 0.09, 0.03, x, y, z, { ry });
}

export function wardrobe(p, { w, h = 2.45, d = 0.6, x, z, ry = 0, color = 0xf1ede6, doors = 3, handle = 'brass', wood = null }) {
  const g = solid(grp(p, x, 0, z, ry));
  const m = wood ? woodM(wood, w / 1.2, 2) : M(color, { roughness: 0.45 });
  box(g, m, w, h, d, 0, 0, 0);
  const lineM = M(0x8c867c);
  for (let i = 1; i < doors; i++) box(g, lineM, 0.004, h - 0.04, 0.002, -w / 2 + (w / doors) * i, 0.02, d / 2 + 0.001, { cast: false });
  const hm = handle === 'brass' ? brass() : blackMetal();
  for (let i = 0; i < doors; i++) {
    const hx = -w / 2 + (w / doors) * (i + (i % 2 ? 0.08 : 0.92));
    box(g, hm, 0.015, 0.45, 0.02, hx, 1.0, d / 2 + 0.01, { cast: false });
  }
  return g;
}

// guarda-roupa aberto com cabideiro, roupas e gavetas (quarto do Tipo 02)
export function openWardrobe(p, { w = 1.2, h = 2.45, d = 0.58, x, z, ry = 0, wood = '#c49a6c' }) {
  const g = solid(grp(p, x, 0, z, ry)), carc = M(0xf2efe8, { roughness: 0.5 });
  box(g, carc, w, h, 0.02, 0, 0, -d / 2 + 0.01);
  for (const s of [-1, 1]) box(g, carc, 0.025, h, d, s * (w / 2 - 0.0125), 0, 0);
  box(g, carc, w, 0.025, d, 0, h - 0.025, 0);
  box(g, carc, w, 0.025, d, 0, 1.95, 0);
  box(g, carc, w, 0.72, d - 0.02, 0, 0, 0.01);
  for (let i = 0; i < 3; i++) { box(g, M(0x8c867c), w - 0.06, 0.003, 0.002, 0, 0.24 * (i + 1), d / 2 + 0.002, { cast: false }); box(g, brass(), 0.18, 0.012, 0.02, 0, 0.24 * i + 0.13, d / 2 + 0.01, { cast: false }); }
  box(g, brass(), w - 0.06, 0.015, 0.015, 0, 1.82, 0);
  const r = rng(5), cols = [0xd8c7b0, 0x8c6b52, 0xefe9de, 0x5f6b72, 0xc79a7a, 0x3d3a37, 0xb7aa98];
  for (let cx = -w / 2 + 0.1; cx < w / 2 - 0.08; cx += 0.07 + r() * 0.04) {
    const lh = 0.7 + r() * 0.35;
    box(g, fabric(cols[(r() * cols.length) | 0], 1), 0.03, lh, 0.42, cx, 1.8 - lh, 0, { cast: true });
  }
  box(g, glow(0xffd9a3, 2.5), w - 0.08, 0.008, 0.01, 0, 1.935, d / 2 - 0.05, { cast: false });
  return g;
}

/* cozinha: bancada ao longo de x local, frente para +z */
export function kitchenRun(p, { len, x, z, ry = 0, base = 0xf0ebe2, counter = 0x1f1f22, upper = 'wood', wood = '#b8875a', backsplash = 'subway', sinkAt = null, cooktopAt = null, ovenAt = null, h = 2.65, upperFrom = 1.5 }) {
  const g = solid(grp(p, x, 0, z, ry));
  const baseM = M(base, { roughness: 0.45 });
  box(g, M(0x2a2a2a), len, 0.1, 0.52, 0, 0, -0.02, { cast: false });
  box(g, baseM, len, 0.78, 0.58, 0, 0.1, 0);
  const n = Math.max(1, Math.round(len / 0.6));
  for (let i = 1; i < n; i++) box(g, M(0xb5aea3), 0.003, 0.76, 0.002, -len / 2 + (len / n) * i, 0.11, 0.291, { cast: false });
  box(g, M(counter, { roughness: 0.2, metalness: 0.05 }), len + 0.02, 0.03, 0.62, 0, 0.88, 0.01);
  const bs = backsplash === 'subway' ? M(0xffffff, { map: rep(TX.subway(), len / 1.2, 0.5), roughness: 0.25 }) : backsplash === 'marble' ? M(0xffffff, { map: rep(TX.concrete('#cfc9c1'), len / 1.5, 0.6), roughness: 0.3 }) : M(0xe8dfd0, { map: rep(TX.concrete('#e4d9c6'), len, 1), roughness: 0.5 });
  plane(g, bs, len, upperFrom - 0.91, 0, 0.91 + (upperFrom - 0.91) / 2, -0.285);
  if (sinkAt !== null) {
    box(g, metal(0xbfc2c5, 0.3), 0.55, 0.005, 0.4, sinkAt, 0.905, 0, { cast: false });
    const f = grp(g, sinkAt, 0.91, -0.22);
    cyl(f, metal(0x2b2b2d, 0.3), 0.015, 0.015, 0.3, 0, 0, 0);
    box(f, metal(0x2b2b2d, 0.3), 0.02, 0.02, 0.18, 0, 0.3, 0.08);
  }
  if (cooktopAt !== null) {
    box(g, M(0x0b0b0c, { roughness: 0.1, metalness: 0.3 }), 0.58, 0.006, 0.5, cooktopAt, 0.91, 0, { cast: false });
    for (const [a, b] of [[-0.14, -0.12], [0.14, -0.12], [-0.14, 0.12], [0.14, 0.12]]) cyl(g, M(0x2b2b2d), 0.07, 0.07, 0.003, cooktopAt + a, 0.916, b, { cast: false });
  }
  if (ovenAt !== null) {
    box(g, M(0x101012, { roughness: 0.15, metalness: 0.4 }), 0.58, 0.58, 0.01, ovenAt, 0.2, 0.292, { cast: false });
    box(g, metal(), 0.5, 0.02, 0.03, ovenAt, 0.72, 0.31, { cast: false });
    box(g, glow(0xffa860, 0.6), 0.4, 0.3, 0.002, ovenAt, 0.3, 0.298, { cast: false });
  }
  if (upper !== 'none') {
    const uh = h - upperFrom - 0.02, uy = upperFrom;
    if (upper === 'shelves') {
      box(g, woodM(wood, len / 1.2, 1), len, uh, 0.02, 0, uy, -0.27);
      for (let i = 0; i < 3; i++) {
        const sy = uy + 0.05 + i * (uh / 3);
        box(g, woodM(wood, len / 1.2, 0.2), len, 0.03, 0.3, 0, sy, -0.13);
        box(g, glow(0xffd9a3, 3), len - 0.05, 0.006, 0.01, 0, sy - 0.006, -0.02, { cast: false });
        dishes(g, len, sy + 0.03, -0.13, i + 1);
      }
      for (const s of [-1, 0, 1]) box(g, brass(), 0.02, uh, 0.02, s * (len / 2 - 0.01), uy, 0.01, { cast: false });
    } else {
      const um = upper === 'glass' || upper === 'wood' ? woodM(wood, 0.6, 1) : M(base, { roughness: 0.45 });
      box(g, um, len, uh, 0.35, 0, uy, -0.11);
      const doorsN = Math.max(1, Math.round(len / 0.5));
      for (let i = 0; i < doorsN; i++) {
        const dx = -len / 2 + (len / doorsN) * (i + 0.5);
        if (upper === 'glass') plane(g, M(0xe2c99d, { map: TX.reed(), roughness: 0.3, emissive: 0xffd9a0, emissiveIntensity: 0.12 }), len / doorsN - 0.09, uh - 0.1, dx, uy + uh / 2, 0.067);
        else box(g, M(upper === 'wood' ? 0x5a3e28 : 0xb5aea3), 0.003, uh - 0.02, 0.002, -len / 2 + (len / doorsN) * i, uy + 0.01, 0.067, { cast: false });
      }
      box(g, glow(0xffd9a3, 3), len - 0.05, 0.006, 0.02, 0, uy - 0.006, 0.0, { cast: false });
    }
    const L = new THREE.RectAreaLight(0xffcf96, 5, len, 0.3); L.position.set(0, uy - 0.02, 0); L.lookAt(0, 0, 0.2); g.add(L);
  }
  return g;
}

function dishes(g, len, y, z, seed) {
  const r = rng(seed * 11), cer = M(0xf3efe7, { roughness: 0.3 }), gl = M(0xe8eef0, { roughness: 0.05, transparent: true, opacity: 0.5 });
  for (let x = -len / 2 + 0.15; x < len / 2 - 0.15; x += 0.18 + r() * 0.15) {
    const k = r();
    if (k < 0.35) for (let s = 0; s < 4; s++) cyl(g, cer, 0.11, 0.1, 0.012, x, y + s * 0.014, z, { cast: false });
    else if (k < 0.6) { cyl(g, gl, 0.035, 0.03, 0.12, x, y, z, { cast: false }); cyl(g, gl, 0.035, 0.03, 0.12, x + 0.08, y, z, { cast: false }); }
    else if (k < 0.8) cyl(g, cer, 0.07, 0.05, 0.22, x, y, z);
    else plant(g, { x, z, y, h: 0.12, potR: 0.05, pot: 0xe9e4da, seed: seed + x * 10 });
  }
}

export function fridge(p, { x, z, ry = 0, w = 0.7, h = 1.86 }) {
  const g = solid(grp(p, x, 0, z, ry)), s = metal(0xc4c7ca, 0.32);
  rbox(g, s, w, h, 0.68, 0.02, 0, 0, 0);
  box(g, M(0x2a2a2c), w - 0.02, 0.006, 0.002, 0, h * 0.38, 0.341, { cast: false });
  box(g, M(0x2a2a2c), 0.004, h * 0.62, 0.002, 0, h * 0.38, 0.341, { cast: false });
  for (const sx of [-0.04, 0.04]) box(g, metal(0x9a9da0, 0.3), 0.02, 0.5, 0.03, sx, h * 0.55, 0.35, { cast: false });
  box(g, M(0x0e0e10, { roughness: 0.2 }), 0.1, 0.18, 0.003, -w / 4, h * 0.7, 0.342, { cast: false });
  return g;
}

export function ovenTower(p, { x, z, ry = 0, w = 0.62, h = 2.5, color = 0xf0ebe2 }) {
  const g = solid(grp(p, x, 0, z, ry));
  box(g, M(color, { roughness: 0.45 }), w, h, 0.6, 0, 0, 0);
  for (const [y, hh] of [[0.85, 0.58], [1.48, 0.38]]) {
    box(g, M(0x101012, { roughness: 0.12, metalness: 0.4 }), w - 0.04, hh, 0.01, 0, y, 0.301, { cast: false });
    box(g, metal(), w - 0.12, 0.02, 0.03, 0, y + hh - 0.06, 0.32, { cast: false });
  }
  return g;
}

export function washer(p, { x, z, ry = 0 }) {
  const g = solid(grp(p, x, 0, z, ry));
  rbox(g, M(0xf6f6f4, { roughness: 0.35 }), 0.6, 0.85, 0.6, 0.02, 0, 0, 0);
  const d = cyl(g, M(0x30343a, { roughness: 0.1, metalness: 0.5 }), 0.2, 0.2, 0.03, 0, 0.4, 0.3, { cast: false });
  d.rotation.x = Math.PI / 2; d.position.y = 0.42;
  return g;
}

export function barStool(p, { x, z, ry = 0, seat = 0xb06a3c, wood = '#b48a5c', h = 0.66, back = true, leather = true }) {
  const g = grp(p, x, 0, z, ry), w = leather ? blackMetal() : woodM(wood);
  for (const [lx, lz] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) cyl(g, w, 0.013, 0.013, h, lx, 0, lz);
  for (const s of [-1, 1]) box(g, w, 0.32, 0.015, 0.015, 0, 0.25, s * 0.16);
  rbox(g, M(seat, { roughness: leather ? 0.55 : 0.6, map: leather ? null : rep(TX.wood(wood), 0.4) }), 0.42, 0.06, 0.4, 0.03, 0, h, 0);
  if (back) { const b = rbox(g, M(seat, { roughness: 0.55 }), 0.4, 0.22, 0.04, 0.02, 0, h + 0.14, -0.19); b.rotation.x = -0.12; for (const s of [-1, 1]) cyl(g, w, 0.01, 0.01, 0.22, s * 0.16, h, -0.19); }
  return g;
}

export function shellChair(p, { x, z, ry = 0, color = 0xb06a3c, legs = 'black' }) {
  const g = grp(p, x, 0, z, ry), l = legs === 'brass' ? brass() : blackMetal(), c = M(color, { roughness: legs === 'brass' ? 0.95 : 0.55 });
  for (const [lx, lz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) cyl(g, l, 0.012, 0.012, 0.45, lx, 0, lz);
  rbox(g, c, 0.5, 0.07, 0.48, 0.03, 0, 0.45, 0);
  cyl(g, c, 0.27, 0.26, 0.32, 0, 0.5, 0.02, { open: true, t0: Math.PI * 0.6, tl: Math.PI * 0.8 }).material.side = THREE.DoubleSide;
  return g;
}

export function brickWall(p, { w, h, x, y = 0, z, ry = 0, dep = 0.1 }) {
  return box(p, M(0xffffff, { map: rep(TX.brick(), w / 1.17, h / 1.12), roughness: 0.95, bumpMap: rep(TX.brick(), w / 1.17, h / 1.12), bumpScale: 1.5 }), w, h, dep, x, y, z, { ry, cast: false });
}

// vaso pequeno com flores (decoração de aparadores e criados-mudos)
export function vase(p, { x, y = 0, z, color = 0xb02a3a, glassy = true, h = 0.22 }) {
  const g = grp(p, x, y, z);
  cyl(g, glassy ? M(0xe6eef0, { roughness: 0.05, transparent: true, opacity: 0.45, depthWrite: false }) : M(0xd9d6d0, { roughness: 0.3 }), 0.035, 0.03, h * 0.55, 0, 0, 0, { cast: false });
  const st = M(0x55703c);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26, dx = Math.cos(a) * 0.04, dz = Math.sin(a) * 0.04;
    cyl(g, st, 0.003, 0.003, h, dx * 0.4, h * 0.4, dz * 0.4, { cast: false });
    sph(g, M(color, { roughness: 0.7 }), 0.025, dx, h * 1.4 + (i % 2) * 0.03, dz, { cast: false });
  }
  return g;
}
export function basket(p, { x, y = 0, z }) {
  const g = grp(p, x, y, z);
  box(g, M(0xb8935e, { roughness: 0.95, bumpMap: rep(TX.weave(), 1), bumpScale: 1 }), 0.26, 0.11, 0.14, 0, 0, 0);
  sph(g, M(0x4c7a37, { roughness: 0.9 }), 0.08, -0.04, 0.13, 0, { s: [1.2, 0.7, 0.9] });
  sph(g, M(0x5b8a42, { roughness: 0.9 }), 0.07, 0.06, 0.14, 0.01, { s: [1, 0.7, 0.9] });
  return g;
}

export function frameArt(p, { w = 0.5, h = 0.65, x, y, z, ry = 0, seed = 1 }) {
  const g = grp(p, x, y, z, ry);
  box(g, M(0x1b1b1b, { roughness: 0.5 }), w, h, 0.03, 0, -h / 2, 0.015, { cast: false });
  plane(g, M(0xffffff, { map: TX.art(seed), roughness: 0.9 }), w - 0.08, h - 0.08, 0, 0, 0.032);
  return g;
}

export function teddy(p, { x, y = 0, z, ry = 0, s = 1, color = 0xb48b62 }) {
  const g = grp(p, x, y, z, ry), m = fabric(color, 1);
  g.scale.setScalar(s);
  sph(g, m, 0.1, 0, 0.1, 0, { s: [1, 1.1, 0.9] });
  sph(g, m, 0.075, 0, 0.25, 0.01);
  for (const sx of [-1, 1]) { sph(g, m, 0.028, sx * 0.055, 0.31, 0); sph(g, m, 0.035, sx * 0.1, 0.13, 0.04); sph(g, m, 0.04, sx * 0.06, 0.03, 0.07); }
  sph(g, fabric(0xe5cfb0, 1), 0.03, 0, 0.235, 0.07);
  sph(g, M(0x111111), 0.008, 0, 0.245, 0.1);
  return g;
}

/* ---------------- áreas externas ---------------- */
export function ground(p, { w, d, x = 0, z = 0, kind = 'grass' }) {
  const t = kind === 'grass' ? TX.grass() : kind === 'pavers' ? TX.pavers() : TX.concrete('#a8a49c');
  const s = kind === 'grass' ? 1.5 : kind === 'pavers' ? 1.6 : 3;
  const f = plane(p, M(0xffffff, { map: rep(t, w / s, d / s), roughness: 0.95, bumpMap: rep(t, w / s, d / s), bumpScale: 1 }), w, d, x, 0.002, z, { rx: -Math.PI / 2 });
  f.userData.floor = true;
  return f;
}
export function wallBlock(p, { w, h, x, z, ry = 0, dep = 0.15, color = '#b9b5ae' }) {
  return box(p, M(0xffffff, { map: rep(TX.concrete(color), w / 2, h / 2), roughness: 0.95, bumpMap: rep(TX.noise(), w, h), bumpScale: 0.6 }), w, h, dep, x, 0, z, { ry });
}
export function ivyWall(p, { w, h, x, z, ry = 0 }) {
  const g = grp(p, x, 0, z, ry), t = TX.ivy();
  box(g, M(0xffffff, { map: rep(t, w / 1.2, h / 1.2), roughness: 0.9, bumpMap: rep(t, w / 1.2, h / 1.2), bumpScale: 3 }), w, h, 0.15, 0, 0, 0);
  const n = Math.round(w * h * 60), r = rng(w * 10), im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), M(0xffffff, { roughness: 0.8 }), n);
  const o = new THREE.Object3D(), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    o.position.set((r() - 0.5) * w, r() * h, 0.08 + r() * 0.06);
    o.scale.set(0.05 + r() * 0.04, 0.04 + r() * 0.03, 0.012); o.rotation.set(0, 0, r() * 7); o.updateMatrix();
    im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.setHSL(0.26 + r() * 0.08, 0.45, 0.15 + r() * 0.17));
  }
  im.castShadow = true; im.receiveShadow = true; g.add(im);
  return g;
}
export function wallLamp(p, { x, y = 1.9, z, ry = 0 }) {
  const g = grp(p, x, y, z, ry);
  box(g, M(0x1c1c1e, { roughness: 0.5 }), 0.12, 0.22, 0.1, 0, -0.11, 0.05);
  box(g, glow(0xffd29a, 3), 0.08, 0.005, 0.06, 0, -0.115, 0.05, { cast: false });
  const L = new THREE.SpotLight(0xffc98a, 6, 4, 0.9, 0.8, 2); L.position.set(0, -0.12, 0.12); L.target.position.set(0, -2, 0.4); g.add(L, L.target);
  return g;
}
export function bench(p, { w = 1.4, x, z, ry = 0 }) {
  const g = solid(grp(p, x, 0, z, ry));
  for (const s of [-1, 1]) box(g, M(0x9a958d, { map: rep(TX.concrete('#a39e95'), 0.3), roughness: 0.9 }), 0.25, 0.4, 0.4, s * (w / 2 - 0.2), 0, 0);
  box(g, woodM('#9a6b42', w, 0.3), w, 0.06, 0.42, 0, 0.4, 0);
  return g;
}
export function bamboo(p, { x, z, n = 9, h = 2.6, seed = 1 }) {
  const g = grp(p, x, 0, z), r = rng(seed * 5);
  for (let i = 0; i < n; i++) {
    const bx = (r() - 0.5) * 0.6, bz = (r() - 0.5) * 0.6, bh = h * (0.7 + r() * 0.3);
    cyl(g, M(0x9aa458, { roughness: 0.6 }), 0.016, 0.022, bh, bx, 0, bz);
    plant(g, { x: bx, z: bz, y: bh * 0.35, h: bh * 0.65, potR: 0.001, pot: 0x9aa458, leaf: 'bamboo', seed: seed * 10 + i });
  }
  return g;
}
