// Lookdev compartilhado: tira o aspecto "plástico" das cenas 3D sem custo pesado.
// - relevo (normal map) derivado da própria textura de cor: rejuntes, veios e tramas ganham volume
// - variação de rugosidade: nenhuma superfície fica uniformemente brilhante
// - ambiente HDR de céu procedural para reflexos coerentes no exterior
// - vinheta + grão de filme sutil, como numa foto real
import * as THREE from 'three';

const rnd = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* ---------- variação de rugosidade (manchas suaves + micro-ruído) ---------- */
let roughVar = null;
export function roughnessVariation() {
  if (roughVar) return roughVar;
  const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'), r = rnd(91);
  g.fillStyle = 'rgb(232,232,232)'; g.fillRect(0, 0, s, s);
  g.filter = 'blur(10px)';
  for (let i = 0; i < 40; i++) { const v = 190 + r() * 65 | 0; g.fillStyle = `rgba(${v},${v},${v},.55)`; g.beginPath(); g.arc(r() * s, r() * s, 12 + r() * 40, 0, 7); g.fill(); }
  g.filter = 'none';
  const d = g.getImageData(0, 0, s, s);
  for (let i = 0; i < d.data.length; i += 4) { const n = (r() - 0.5) * 26; d.data[i] = d.data[i + 1] = d.data[i + 2] = Math.max(150, Math.min(255, d.data[i + 1] + n)); }
  g.putImageData(d, 0, 0);
  roughVar = new THREE.CanvasTexture(c);
  roughVar.wrapS = roughVar.wrapT = THREE.RepeatWrapping;
  roughVar.repeat.set(3, 3);
  return roughVar;
}

/* ---------- normal map a partir da luminância da textura (Sobel) ---------- */
const normalCache = new Map();
function normalCanvasFrom(img, strength = 2.2) {
  if (normalCache.has(img)) return normalCache.get(img);
  const W = Math.min(512, img.width || 256), H = Math.min(512, img.height || 256);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, W, H);
  const src = g.getImageData(0, 0, W, H).data;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) lum[i] = (src[i * 4] * 0.299 + src[i * 4 + 1] * 0.587 + src[i * 4 + 2] * 0.114) / 255;
  const out = g.createImageData(W, H), o = out.data;
  const at = (x, y) => lum[((y + H) % H) * W + ((x + W) % W)];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
    const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
    let nx = -dx * strength, ny = dy * strength, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const k = (y * W + x) * 4;
    o[k] = (nx * 0.5 + 0.5) * 255; o[k + 1] = (ny * 0.5 + 0.5) * 255; o[k + 2] = (nz * 0.5 + 0.5) * 255; o[k + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  normalCache.set(img, c);
  return c;
}
const normalTexCache = new Map();
function normalFor(map) {
  const key = `${imgId(map.image)}|${map.repeat.x},${map.repeat.y}|${map.offset.x},${map.offset.y}`;
  if (normalTexCache.has(key)) return normalTexCache.get(key);
  const t = new THREE.CanvasTexture(normalCanvasFrom(map.image));
  t.wrapS = map.wrapS; t.wrapT = map.wrapT; t.repeat.copy(map.repeat); t.offset.copy(map.offset);
  t.anisotropy = 4;
  normalTexCache.set(key, t);
  return t;
}
const ids = new WeakMap(); let nid = 0;
const imgId = (img) => { if (!ids.has(img)) ids.set(img, ++nid); return ids.get(img); };

/* ---------- aplica o acabamento a todos os materiais de uma cena ---------- */
export function enhanceMaterials(root, { normalScale = 0.45, rough = true } = {}) {
  const done = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (!m || done.has(m) || !m.isMeshStandardMaterial || m.userData.flat || m.transparent) continue;
      done.add(m);
      if (rough && !m.roughnessMap) m.roughnessMap = roughnessVariation();
      const tex = m.map;
      if (tex && tex.image && !m.normalMap && !m.bumpMap && (tex.image.width || 0) >= 32) {
        try { m.normalMap = normalFor(tex); m.normalScale = new THREE.Vector2(normalScale, normalScale); } catch { /* imagem sem acesso a pixels */ }
      }
      m.needsUpdate = true;
    }
  });
}

/* ---------- céu HDR procedural (para reflexos e luz ambiente) ---------- */
export function skyEnvironment(renderer, { zenith = 0x0a1230, mid = 0x5a5088, horizon = 0xd9a088, ground = 0x2a2420, sunDir = [-0.75, 0.06, 0.6], sunColor = 0xffc896, sunPower = 18 } = {}) {
  const env = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 48, 24);
  const cols = [], c = new THREE.Color(), pos = geo.attributes.position;
  const stops = [[-1, ground], [-0.02, ground], [0.02, horizon], [0.22, mid], [1, zenith]];
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    let j = 1; while (j < stops.length - 1 && y > stops[j][0]) j++;
    const [y0, a] = stops[j - 1], [y1, b] = stops[j];
    c.set(a).lerp(new THREE.Color(b), Math.min(1, Math.max(0, (y - y0) / (y1 - y0))));
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  // disco do sol com energia acima de 1 (HDR) para brilhos especulares realistas
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(sunColor).multiplyScalar(sunPower) }));
  sun.position.set(...sunDir).normalize().multiplyScalar(9); env.add(sun);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.02).texture;
  pm.dispose(); geo.dispose();
  return tex;
}

/* ---------- vinheta e grão: fecha a imagem como uma lente real ---------- */
export const FilmShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.035 }, uVignette: { value: 0.28 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uGrain, uVignette; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5; float v = 1.0 - uVignette * smoothstep(0.25, 0.85, dot(d, d) * 2.2);
      float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      float g = (h(vUv * 1024.0) - 0.5) * uGrain * (1.0 - lum * 0.6); // grão mais visível nas sombras, como em filme
      gl_FragColor = vec4(c.rgb * v + g, c.a);
    }`,
};
