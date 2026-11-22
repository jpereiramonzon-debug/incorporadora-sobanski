// Lookdev compartilhado: tira o aspecto "plástico" das cenas 3D sem custo pesado.
// - relevo (bump na GPU) derivado da própria textura de cor: rejuntes, veios e tramas ganham volume
// - variação de rugosidade: nenhuma superfície fica uniformemente brilhante
// - ambiente HDR de céu procedural para reflexos coerentes no exterior
// - vinheta + grão de filme sutil, como numa foto real
import * as THREE from 'three';

/* ---------- bump à prova de NaN ----------
   A fórmula de bump do three.js normaliza um vetor que vira zero quando uma face é vista exatamente
   de lado (derivadas nulas). O resultado é NaN: um pixel preto no quadro e, na captura do reflexo do
   cômodo (PMREM), um NaN que o filtro espalha pelo mapa inteiro e apaga o ambiente todo (era o que
   deixava o Tipo 03 preto com pontos brancos). Aqui a normal original é usada nesses casos. */
THREE.ShaderChunk.bumpmap_pars_fragment = THREE.ShaderChunk.bumpmap_pars_fragment.replace(
  /vec3 perturbNormalArb\([\s\S]*?\n\t}\n/,
  `vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
\t\tvec3 dX = dFdx( surf_pos.xyz ), dY = dFdy( surf_pos.xyz );
\t\tif ( dot( dX, dX ) < 1e-12 || dot( dY, dY ) < 1e-12 ) return surf_norm;
\t\tvec3 vSigmaX = normalize( dX );
\t\tvec3 vSigmaY = normalize( dY );
\t\tvec3 vN = surf_norm;
\t\tvec3 R1 = cross( vSigmaY, vN );
\t\tvec3 R2 = cross( vN, vSigmaX );
\t\tfloat fDet = dot( vSigmaX, R1 ) * faceDirection;
\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
\t\tvec3 n = abs( fDet ) * surf_norm - vGrad;
\t\treturn dot( n, n ) > 1e-12 ? normalize( n ) : surf_norm;
\t}
`);

const rnd = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* ---------- variação de rugosidade (manchas suaves + micro-ruído) ---------- */
let roughVar = null;
export function roughnessVariation() {
  if (roughVar) return roughVar;
  // manchas suaves: ruído em 24 px ampliado com interpolação bilinear (o próprio drawImage suaviza),
  // sem o filtro blur() do canvas, que custava ~0,5 s de CPU no celular
  const s = 256, lo = 24, r = rnd(91);
  const small = document.createElement('canvas'); small.width = small.height = lo;
  const sg = small.getContext('2d'), sd = sg.createImageData(lo, lo);
  for (let i = 0; i < sd.data.length; i += 4) { const v = 196 + r() * 59; sd.data[i] = sd.data[i + 1] = sd.data[i + 2] = v; sd.data[i + 3] = 255; }
  sg.putImageData(sd, 0, 0);
  const c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(small, 0, 0, s, s);
  const d = g.getImageData(0, 0, s, s);
  for (let i = 0; i < d.data.length; i += 4) { const n = (r() - 0.5) * 26; d.data[i] = d.data[i + 1] = d.data[i + 2] = Math.max(150, Math.min(255, d.data[i + 1] + n)); }
  g.putImageData(d, 0, 0);
  roughVar = new THREE.CanvasTexture(c);
  roughVar.wrapS = roughVar.wrapT = THREE.RepeatWrapping;
  roughVar.repeat.set(3, 3);
  return roughVar;
}

/* ---------- aplica o acabamento a todos os materiais de uma cena ---------- */
export function enhanceMaterials(root, { normalScale = 0.45, rough = true, anisotropy = 0 } = {}) {
  // O relevo vem da própria textura de cor, calculado na GPU (bump mapping por derivadas):
  // custo zero de CPU no carregamento. A versão anterior gerava normal maps com filtro Sobel em
  // JavaScript e travava a thread principal por ~3,5 s em celulares a cada ambiente aberto.
  const done = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (!m || done.has(m) || !m.isMeshStandardMaterial || m.userData.flat || m.transparent) continue;
      done.add(m);
      if (rough && !m.roughnessMap) m.roughnessMap = roughnessVariation();
      const tex = m.map;
      if (tex && !m.normalMap && !m.bumpMap) { m.bumpMap = tex; m.bumpScale = normalScale * 2.2; }
      if (anisotropy) for (const t of [m.map, m.roughnessMap, m.normalMap]) if (t && t.anisotropy < anisotropy) { t.anisotropy = anisotropy; t.needsUpdate = true; }
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
