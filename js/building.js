// Maquete 3D do Edifício Santa Ana: giro 360°, andares clicáveis.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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

const windowTex = (lit, tall, seed) => tex(160, tall ? 288 : 208, (g, w, h) => {
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

const railTex = () => tex(512, 160, (g, w, h) => {
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
    g.fillStyle = '#f1e4cb'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f2616'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'italic 500 118px "Cormorant Garamond", Georgia, serif';
    g.fillText('Edifício Santa Ana', w / 2, h / 2 + 6);
  };
  const t = tex(1024, 256, draw);
  document.fonts?.load('italic 500 118px "Cormorant Garamond"').then(() => {
    draw(t.image.getContext('2d'), 1024, 256); t.needsUpdate = true;
  }).catch(() => {});
  return t;
};

/* ---------- cena ---------- */
export function createViewer(container, { onHover = () => {}, onSelect = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 860 ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Maquete 3D do Edifício Santa Ana. Arraste para girar e clique em um andar.');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xb48a86, 0.0062);
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
  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 600);

  scene.add(new THREE.HemisphereLight(0x8f9bd0, 0x3d3028, 0.95));
  const sun = new THREE.DirectionalLight(0xffc09a, 1.5);
  sun.position.set(-34, 17, 26);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  scene.add(sun);

  const noise = noiseTex();
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, ...o });
  const wall = M(0x7d766d, { bumpMap: noise, bumpScale: 1.2 });
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

  // corpo do prédio: 3 pavimentos sobre pilotis, com sacadas recuadas à esquerda da fachada
  box(6.4, 9, 20, wall, 1.8, 7.5, 0);
  box(3.6, 9, 18.6, wall, -3.2, 7.5, -0.7);
  box(0.22, 9, 1.4, wallDark, -4.89, 7.5, 9.3);
  box(0.3, 9, 0.12, wallDark, -1.25, 7.5, 9.96);
  for (const y of [3, 6, 9]) {
    box(10.18, 0.16, 20.18, trim, 0, y, 0);
    box(10.24, 0.045, 20.24, led, 0, y - 0.11, 0, false);
  }
  box(10.24, 0.045, 20.24, led, 0, 11.93, 0, false);
  box(10.5, 0.5, 20.5, trim, 0, 12.25, 0);
  box(10.8, 0.22, 20.8, trim, 0, 12.6, 0);
  box(10.36, 0.55, 20.36, trim, 0, 12.98, 0);

  // torre de escada e elevador aos fundos
  box(4, 14, 2.6, wallDark, 0, 7, -11.3);
  box(4.3, 0.3, 2.9, trim, 0, 14.15, -11.3);
  plane(0.55, 8.4, new THREE.MeshBasicMaterial({ map: blockTex() }), 0, 7.6, -12.61, Math.PI);

  // térreo: núcleo recuado, pilares e garagem iluminada
  box(8.2, 3, 16, wallDark, 0, 1.5, -1.6);
  for (const z of [9.7, 4.9, 0, -4.9, -9.7]) for (const x of [-4.7, 4.7]) box(0.5, 3, 0.5, wall, x, 1.5, z);
  box(0.5, 3, 0.5, wall, -1.2, 1.5, 9.7);
  for (const [x, z] of [[-3, 8], [2.6, 8], [0, 3]]) {
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), lamp);
    d.rotation.x = Math.PI / 2; d.position.set(x, 2.9, z); scene.add(d);
  }
  const garage = new THREE.PointLight(0xffc78a, 26, 16, 1.6); garage.position.set(0, 2.3, 8); scene.add(garage);

  // janelas
  const winMats = {};
  const winMat = (lit, tall, v) => {
    const key = `${lit}${tall}${v}`;
    if (!winMats[key]) {
      const t = windowTex(lit, tall, v * 13 + (tall ? 5 : 1));
      winMats[key] = lit
        ? new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.55, roughness: 0.5 })
        : new THREE.MeshStandardMaterial({ map: t, roughness: 0.18, metalness: 0.35 });
    }
    return winMats[key];
  };
  const rw = rng(42);
  const addWindow = (x, y, z, ry, w, h, tall = false, forceLit = false) => {
    const lit = forceLit || rw() < 0.72;
    plane(w, h, winMat(lit, tall, Math.floor(rw() * 3)), x, y, z, ry);
    const nx = Math.sin(ry), nz = Math.cos(ry);
    const sill = box(ry % Math.PI ? 0.14 : w + 0.24, 0.07, ry % Math.PI ? w + 0.24 : 0.14, trim, x + nx * 0.05, y - h / 2 - 0.04, z + nz * 0.05, false);
    sill.castShadow = false;
  };
  const rail = new THREE.MeshBasicMaterial({ map: railTex(), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
  for (const f of [3, 6, 9]) {
    // fachada: sacada + duas janelas
    addWindow(-3.1, f + 1.33, 8.615, 0, 1.9, 2.3, true, true);
    plane(3.4, 1.05, rail, -3.1, f + 0.62, 10.02);
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), lamp);
    spot.rotation.x = Math.PI / 2; spot.position.set(-3.1, f + 2.9, 9.4); scene.add(spot);
    const pl = new THREE.PointLight(0xffc98f, 5, 5, 1.8); pl.position.set(-3.1, f + 2.5, 9.4); scene.add(pl);
    addWindow(0.75, f + 1.6, 10.015, 0, 1.3, 1.75);
    addWindow(3.3, f + 1.6, 10.015, 0, 1.3, 1.75);
    // laterais
    [7, 3.6, 0.2, -3.2, -6.6].forEach((z, i) => {
      const small = i === 2;
      addWindow(5.015, f + (small ? 2.05 : 1.6), z, Math.PI / 2, small ? 0.8 : 1.25, small ? 0.75 : 1.6);
    });
    [5.4, 2, -1.4, -4.8, -8.2].forEach((z, i) => {
      const small = i === 3;
      addWindow(-5.015, f + (small ? 2.05 : 1.6), z, -Math.PI / 2, small ? 0.8 : 1.25, small ? 0.75 : 1.6);
    });
    // fundos
    addWindow(-3.5, f + 1.6, -10.015, Math.PI, 1.25, 1.6);
    addWindow(3.5, f + 1.6, -10.015, Math.PI, 1.25, 1.6);
  }
  // coluna de tijolos de vidro iluminada
  plane(0.5, 8.6, new THREE.MeshBasicMaterial({ map: blockTex(), color: new THREE.Color(1.5, 1.4, 1.2) }), -0.8, 7.5, 10.02);

  // terreno, calçada, rua e muros
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), M(0x1d2618, { roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  box(18, 0.06, 28.4, M(0x6f6961, { bumpMap: noise, bumpScale: 0.8 }), 0, 0.03, -1, false);
  box(300, 0.16, 3.2, M(0x8d877e, { bumpMap: noise, bumpScale: 0.8 }), 0, 0.08, 14.95, false);
  box(300, 0.05, 10, M(0x242528, { roughness: 0.85 }), 0, 0.025, 21.5, false);
  for (const [x, w] of [[-8.5, 1], [0.3, 9.8], [7.8, 2.4]]) {
    box(w, 2.3, 0.26, muro, x, 1.15, 13.2);
    box(w + 0.1, 0.1, 0.36, trim, x, 2.35, 13.2);
  }
  box(3.4, 2.15, 0.08, metal, -6.3, 1.08, 13.2);
  for (let y = 0.25; y < 2.1; y += 0.27) box(3.4, 0.03, 0.1, trim, -6.3, y, 13.2, false);
  const gateTex = railTex(); gateTex.wrapS = THREE.RepeatWrapping; gateTex.repeat.set(0.4, 1);
  plane(1.4, 2.1, new THREE.MeshBasicMaterial({ map: gateTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), 5.9, 1.05, 13.2);
  box(0.2, 2, 28.6, muro, -9, 1, -1.1); box(0.2, 2, 28.6, muro, 9, 1, -1.1); box(18, 2, 0.2, muro, 0, 1, -15.3);
  plane(4.4, 1.1, new THREE.MeshBasicMaterial({ map: signTex(), color: new THREE.Color(1.25, 1.2, 1.1) }), 0.6, 1.3, 13.34);

  // luzes rasantes no muro e na fachada
  const cone = new THREE.MeshBasicMaterial({ map: coneTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const x of [-8.5, -3.6, -2.2, 3.4, 4.8, 7.4, 8.6]) plane(1.1, 2.2, cone, x, 1.1, 13.345);
  for (const x of [-4.7, -1.2, 4.7]) plane(1.5, 5.5, cone, x, 2.9, 9.97);
  for (const [x, z] of [[-6.5, 11], [6.5, 11], [0.5, 15.6]]) {
    const p = new THREE.PointLight(0xffbf80, 7, 13, 1.7); p.position.set(x, 0.6, z); scene.add(p);
  }

  // vegetação
  const rt = rng(3);
  const trees = [[-15, -1, 1.1], [-16.5, -12, 1.3], [15.5, -3, 1.2], [16, -14, 1.05], [-7, -23, 1.3], [6, -24, 1.15], [0, -29, 1.4], [-24, 9, 1], [24, 8, 1.1], [-28, -22, 1.5], [29, -24, 1.4]];
  const BLOBS = 90;
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M(0xffffff, { roughness: 1, flatShading: true }), trees.length * BLOBS + 60);
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
    const x = -4.3 + (i / 59) * 9.3, k = 0.26 + rt() * 0.18;
    o.position.set(x, 0.3 + rt() * 0.12, 13.62 + rt() * 0.16); o.scale.set(k, k, k); o.rotation.set(rt() * 3, rt() * 3, 0); o.updateMatrix();
    leaves.setMatrixAt(n, o.matrix);
    leaves.setColorAt(n++, col.setHSL(0.26 + rt() * 0.07, 0.4, 0.13 + rt() * 0.1));
  }
  leaves.castShadow = trunks.castShadow = true; leaves.receiveShadow = true;
  scene.add(leaves, trunks);

  // áreas clicáveis dos andares
  const hits = Object.entries(FLOOR_Y).map(([k, y]) => {
    const g = new THREE.BoxGeometry(10.5, 2.86, 20.5);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(0, y, 0); m.userData.k = k;
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: new THREE.Color(0xffdca6).multiplyScalar(2) }));
    e.visible = false; m.add(e); scene.add(m);
    return m;
  });

  /* ---------- pós-processamento ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.75, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- câmera e interação ---------- */
  const cur = { az: -0.72, pol: 1.5, rad: 60, ty: HOME_Y, shift: 0 };
  const goal = { ...cur };
  let baseRad = 50, W = 1, H = 1, hovered = null, selected = null, panelOpen = false;
  let lastTouch = 0, visible = true, raf = 0, prev = performance.now();

  const paint = () => hits.forEach((m) => {
    const sel = m.userData.k === selected, hov = m.userData.k === hovered;
    m.material.opacity = sel ? 0.2 : hov ? 0.13 : 0;
    m.children[0].visible = sel || hov;
  });
  const frame = () => {
    goal.rad = baseRad * (selected ? 0.86 : 1);
    goal.ty = selected ? FLOOR_Y[selected] * 0.5 + HOME_Y * 0.5 : HOME_Y;
    goal.shift = panelOpen ? 1 : 0;
  };
  const resize = () => {
    W = container.clientWidth; H = container.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H); composer.setSize(W, H);
    camera.aspect = W / H;
    baseRad = 46 / Math.min(1, Math.max(0.5, (W / H) * 1.25));
    frame();
  };
  new ResizeObserver(resize).observe(container);
  resize();
  cur.rad = goal.rad * 1.25;

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
    if (!calm && !drag && !selected && now - lastTouch > 5000) goal.az += dt * 0.07;
    const k = 1 - Math.exp(-dt * 5.5);
    for (const p in cur) cur[p] += (goal[p] - cur[p]) * k;
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
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) { prev = performance.now(); raf = requestAnimationFrame(tick); }
  }).observe(container);

  return {
    select(k) { selected = k; frame(); paint(); touched(); },
    highlight(k) { hovered = k; paint(); },
    setPanel(open) { panelOpen = open; frame(); },
    rotate(d) { goal.az += d; touched(); },
  };
}
