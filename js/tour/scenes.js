// Ambientes reconstruídos a partir das fotos de divulgação (medidas estimadas, em metros).
// Cada ambiente define limites de caminhada, pontos de vista (um por foto) e pontos de interesse.
import * as THREE from 'three';
import {
  TX, M, rep, glow, fabric, woodM, metal, brass, blackMetal, paint, glass,
  box, rbox, cyl, sph, plane, grp, solid, boxes,
  shell, cove, spots, windowUnit, door, curtain,
  sofa, boucleChair, roundTable, chandelierGlobes, pendant, sconce, tv, rack, ac, plant, rug,
  slats, lattice, nightstand, bed, headboard, wardrobe, openWardrobe,
  kitchenRun, fridge, ovenTower, washer, barStool, shellChair, brickWall, frameArt, teddy, vase, basket,
  ground, wallBlock, ivyWall, wallLamp, bench, bamboo,
} from './kit.js?v=20261124b';

const porcelainFloor = (w, d, base = '#e3dfd8') => M(0xffffff, { map: rep(TX.porcelain(base), w / 1.8, d / 1.8), roughness: 0.22, metalness: 0.02 });
const woodFloor = (w, d, base = '#cfae86') => M(0xffffff, { map: rep(TX.wood(base), w / 1.1, d / 2.2), roughness: 0.55 });
const around = (cx, cz, r, n, a0, fn) => {
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * Math.PI * 2, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    fn({ x, z, ry: Math.atan2(cx - x, cz - z) });
  }
};
const FEAT = {
  ac: 'Infraestrutura para ar-condicionado: mais praticidade para o seu dia.',
  forro: 'Forro de gesso: acabamento moderno e ambientes ainda mais valorizados.',
  piso: 'Piso aquecido no banheiro: mais conforto no dia a dia.',
  person: 'Personalização durante a obra: deixe o apartamento com a sua cara.',
  elev: 'Elevador: mais comodidade no dia a dia.',
};

export const ENVS = {
  /* ------------------------------------------------ Tipo 01 (fotos: cozinha e sala, varanda, quarto 01 e 02) */
  't01-estar': {
    name: 'Cozinha e sala', group: 'Apartamento Tipo 01', h: 2.6,
    bounds: [-1.2, 1.75, -2.0, 2.05], sun: [-1, 5, -6],
    build(g) {
      const W = 4.0, D = 4.6, H = 2.6;
      shell(g, { w: W, d: D, h: H, floor: porcelainFloor(W, D, '#dedbd6'), walls: paint(0xece8e1) });
      // parede das janelas: dois vãos altos com caixilho preto e cortina de voil
      windowUnit(g, { x: -0.7, z: -2.3, w: 1.25, h: 1.95, sill: 0.45, ceil: H, view: 'field' });
      windowUnit(g, { x: 1.3, z: -2.3, w: 1.15, h: 1.95, sill: 0.45, ceil: H, view: 'field' });
      // cozinha linear na parede oeste: base cinza, tampo de mármore claro, aéreos de madeira
      kitchenRun(g, { len: 2.8, x: -1.7, z: -0.15, ry: Math.PI / 2, base: 0xc7cac3, counter: 0xe4dfd7, upper: 'wood', wood: '#b98b5d', backsplash: 'marble', sinkAt: -0.85, cooktopAt: 0.2, ovenAt: 0.2, h: H, upperFrom: 1.52 });
      box(g, M(0x5e432c), 0.005, 0.38, 0.72, -1.636, 1.52, -1.0, { cast: false }); // nicho do micro-ondas
      rbox(g, M(0xf4f4f1, { roughness: 0.4 }), 0.34, 0.27, 0.5, 0.02, -1.79, 1.56, -0.95);
      box(g, M(0x1b1c1e, { roughness: 0.2 }), 0.005, 0.18, 0.3, -1.618, 1.6, -1.0, { cast: false });
      // geladeira inox em torre de madeira junto à janela
      fridge(g, { x: -1.66, z: -1.93, ry: Math.PI / 2, w: 0.68, h: 1.82 });
      box(g, woodM('#b98b5d', 0.6, 2), 0.62, H, 0.03, -1.70, 0, -1.575, { solid: true });
      box(g, woodM('#b98b5d', 0.6, 0.6), 0.62, H - 1.9, 0.72, -1.70, 1.9, -1.93);
      // jantar: mesa redonda de tampo branco, base de madeira, cadeiras terracota com estrutura dourada
      const mesa = solid(grp(g, -0.45, 0, -0.95));
      cyl(mesa, M(0xf3f1ec, { roughness: 0.35 }), 0.56, 0.56, 0.035, 0, 0.72, 0, { seg: 56 });
      cyl(mesa, woodM('#c9a77c'), 0.12, 0.33, 0.72, 0, 0, 0, { seg: 40 });
      around(-0.45, -0.95, 0.78, 4, Math.PI / 4, (o) => shellChair(g, { ...o, color: 0xa4512e, legs: 'brass' }));
      chandelierGlobes(g, { x: -0.45, z: -0.95, y: 1.95, ceil: H, n: 8, span: 0.6 });
      // estar: sofá branco voltado para o painel da TV, aparador preto e branco atrás
      sofa(g, { x: 0.85, z: 0.55, ry: Math.PI / 2, len: 2.0, color: 0xf2efe9, pillows: [0xf2efe9, 0xe6e1d8] });
      const ap = solid(grp(g, 0.2, 0, 0.55));
      box(ap, M(0xf1eeea, { roughness: 0.3 }), 0.3, 0.03, 1.6, 0, 0.75, 0);
      box(ap, M(0xf1eeea, { roughness: 0.3 }), 0.28, 0.02, 1.55, 0, 0.18, 0);
      for (const [lx, lz] of [[-0.13, -0.78], [0.13, -0.78], [-0.13, 0.78], [0.13, 0.78]]) box(ap, blackMetal(), 0.02, 0.75, 0.02, lx, 0, lz);
      vase(ap, { x: 0, z: -0.6, y: 0.78, color: 0xf3f0ea, h: 0.28 });
      rug(g, { x: 1.2, z: 0.55, w: 1.5, d: 2.5, color: 0xe7ddcc });
      box(g, woodM('#b5875b', 2, 2.2), 0.04, H, 2.6, 1.98, 0, 0.45, { cast: false });
      box(g, M(0xf4f2ee, { map: rep(TX.concrete('#e6e2dc'), 2, 0.3), roughness: 0.3 }), 0.38, 0.22, 2.3, 1.79, 0.38, 0.45, { solid: true });
      tv(g, { x: 1.95, y: 1.4, z: 0.45, ry: -Math.PI / 2, w: 1.15 });
      ac(g, { x: 1.97, z: -1.55, y: 2.18, ry: -Math.PI / 2 });
      vase(g, { x: 1.8, z: 1.25, y: 0.6, color: 0x9c1f35, glassy: false, h: 0.25 });
      spots(g, [[-1.0, -1.6], [0.6, -1.6], [-1.0, 0.6], [0.4, 1.5]], H);
      door(g, { x: -1.35, z: 2.29, ry: Math.PI });
      door(g, { x: 1.0, z: 2.29, ry: Math.PI });
    },
    pois: [
      { p: [1.95, 2.18, -1.55], t: 'Ar-condicionado', d: FEAT.ac },
      { p: [-1.75, 1.4, -0.2], t: 'Cozinha integrada', d: 'Aéreos em madeira, tampo de mármore claro, cooktop, forno embutido e nicho para micro-ondas.', go: 't01-cozinha' },
      { p: [-0.45, 1.25, -0.95], t: 'Mesa de jantar', d: 'Jantar integrado à cozinha e à sala, com luz natural das janelas amplas.' },
      { p: [-1.35, 1.6, 2.2], t: 'Ir para a varanda', d: 'Varanda com churrasqueira e área de serviço.', go: 't01-varanda' },
      { p: [1.0, 1.6, 2.2], t: 'Ir para os quartos', d: 'Quarto 01 com painel de madeira e quarto 02 com armário espelhado.', go: 't01-quarto-1' },
    ],
  },
  't01-varanda': {
    name: 'Varanda e área de serviço', group: 'Apartamento Tipo 01', h: 2.6, outdoor: 'sky',
    bounds: [-1.2, 1.25, -0.2, 0.75], sun: [6, 5, 2],
    build(g) {
      const W = 3.0, D = 1.9, H = 2.6, wall = paint(0xdcd8d1);
      shell(g, { w: W, d: D, h: H, floor: porcelainFloor(W, D, '#dddad5'), walls: { n: wall, s: wall, w: wall, e: null } });
      // abertura para fora com guarda-corpo de ferro ornamental
      const rail = new THREE.MeshStandardMaterial({ map: TX.railing(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.4 });
      rail.map.repeat.set(1, 1);
      plane(g, rail, D, 1.0, 1.47, 0.6, 0, { ry: -Math.PI / 2 });
      box(g, blackMetal(), 0.05, 0.05, D, 1.47, 1.08, 0, { cast: false });
      box(g, M(0xe8e5e0), 0.12, 0.08, D, 1.47, 0, 0, { cast: false });
      box(g, paint(0xdcd8d1), 0.2, 0.3, D + 0.2, 1.55, H - 0.3, 0, { cast: false });
      plane(g, new THREE.MeshBasicMaterial({ map: TX.view('field'), color: new THREE.Color(1.05, 1.05, 1.05) }), 30, 12, 9, 3, 0, { ry: -Math.PI / 2 });
      const sunL = new THREE.RectAreaLight(0xfff1dc, 6, D, 1.6); sunL.position.set(1.45, 1.4, 0); sunL.lookAt(-3, 1.2, 0); g.add(sunL);
      // área de serviço: lavadora, gabinete cinza com tanque, prateleira e aéreos estilo shaker
      const zb = -0.95;
      washer(g, { x: -1.17, z: zb + 0.31 });
      const cab = solid(grp(g, -0.43, 0, zb + 0.3));
      box(cab, M(0xc9ccc6, { roughness: 0.45 }), 0.86, 0.84, 0.58, 0, 0, 0);
      for (const y of [0.3, 0.6]) box(cab, M(0x9da09a), 0.84, 0.004, 0.002, 0, y, 0.292, { cast: false });
      for (const y of [0.2, 0.52]) for (const hx of [-0.2, 0.2]) cyl(cab, metal(), 0.012, 0.012, 0.01, hx, y + 0.02, 0.3, { rx: Math.PI / 2, cast: false });
      box(g, M(0xffffff, { map: rep(TX.concrete('#d9d4cc'), 1, 0.3), roughness: 0.3 }), 1.5, 0.04, 0.62, -0.75, 0.86, zb + 0.31);
      box(g, metal(0xbfc2c5, 0.3), 0.45, 0.005, 0.35, -0.4, 0.901, zb + 0.32, { cast: false });
      cyl(g, metal(0x9a9da0, 0.3), 0.012, 0.012, 0.28, -0.4, 0.9, zb + 0.08);
      box(g, metal(0x9a9da0, 0.3), 0.02, 0.02, 0.14, -0.4, 1.17, zb + 0.15, { cast: false });
      plane(g, M(0xffffff, { map: rep(TX.porcelain('#ebe8e3'), 0.8, 0.4), roughness: 0.25 }), 1.5, 0.72, -0.75, 1.26, zb + 0.004);
      box(g, M(0xd6d8d3), 1.5, 0.025, 0.22, -0.75, 1.22, zb + 0.11);
      basket(g, { x: -1.1, z: zb + 0.12, y: 1.245 });
      vase(g, { x: -0.62, z: zb + 0.12, y: 1.245, color: 0x4f7a3a, glassy: false, h: 0.12 });
      const up = solid(grp(g, -0.75, 1.62, zb + 0.18));
      box(up, M(0xc9ccc6, { roughness: 0.45 }), 1.5, 0.82, 0.36, 0, 0, 0);
      for (const dx of [-0.37, 0.37]) {
        for (const [w, h, xx, yy] of [[0.62, 0.035, 0, 0.08], [0.62, 0.035, 0, 0.71], [0.035, 0.62, -0.29, 0.1], [0.035, 0.62, 0.29, 0.1]]) box(up, M(0xbfc2bc), w, h, 0.012, dx + xx, yy, 0.186, { cast: false });
        sph(up, metal(), 0.015, dx + (dx < 0 ? 0.28 : -0.28), 0.12, 0.2, { cast: false });
      }
      // pilar com churrasqueira em granito preto
      const col = solid(grp(g, 0.32, 0, zb + 0.25));
      box(col, wall, 0.66, H, 0.5, 0, 0, 0);
      const gr = M(0xffffff, { map: rep(TX.granite(), 0.6, 0.6), roughness: 0.25 });
      box(col, gr, 0.56, 0.08, 0.04, 0, 0.94, 0.25);
      box(col, gr, 0.56, 0.08, 0.04, 0, 1.68, 0.25);
      box(col, gr, 0.08, 0.74, 0.04, -0.24, 0.94, 0.25);
      box(col, gr, 0.08, 0.74, 0.04, 0.24, 0.94, 0.25);
      box(col, M(0xc9b39a, { roughness: 0.9 }), 0.4, 0.58, 0.005, 0, 1.02, 0.19, { cast: false });
      for (const y of [1.18, 1.36]) { box(col, metal(0xcfd2d4, 0.3), 0.46, 0.012, 0.012, 0, y, 0.24, { cast: false }); for (const sx of [-0.1, 0.1]) sph(col, M(0x6b1d12), 0.016, sx, y + 0.006, 0.255, { cast: false }); }
      spots(g, [[-0.6, 0], [0.8, 0]], H);
      door(g, { x: 0.85, z: 0.94, ry: Math.PI });
    },
    pois: [
      { p: [0.32, 1.35, -0.3], t: 'Churrasqueira', d: 'Churrasqueira na varanda, em moldura de granito preto.' },
      { p: [-0.75, 1.05, -0.5], t: 'Área de serviço', d: 'Lavadora, tanque e armários integrados à varanda.' },
      { p: [1.45, 1.2, 0], t: 'Vista da varanda', d: 'Guarda-corpo de ferro com volutas, o mesmo da fachada.' },
      { p: [0.85, 1.6, 0.85], t: 'Voltar para a sala', d: 'Cozinha e sala integradas.', go: 't01-sala' },
    ],
  },
  't01-quarto1': {
    name: 'Quarto 01', group: 'Apartamento Tipo 01', h: 2.6,
    bounds: [-1.15, 1.2, -1.2, 1.25], sun: [1, 5, 6],
    build(g) {
      const W = 2.9, D = 3.0, H = 2.6, walnut = '#7a5236';
      shell(g, { w: W, d: D, h: H, floor: woodFloor(W, D, '#d9c09b'), walls: paint(0xf4f2ee) });
      // marcenaria da parede da cama: aéreos brancos e nicho de nogueira com prateleira
      const mc = grp(g, -0.4, 0, -1.5);
      box(mc, M(0xf7f6f3, { roughness: 0.4 }), 2.1, H - 1.84, 0.42, 0, 1.84, 0.21);
      for (let i = 1; i < 4; i++) box(mc, M(0xc8c5bf), 0.003, H - 1.86, 0.002, -1.05 + i * 0.525, 1.85, 0.421, { cast: false });
      const nog = woodM(walnut, 1.6, 1.4);
      box(mc, nog, 2.1, 1.84, 0.02, 0, 0, 0.01, { cast: false });
      for (const sx of [-1.03, 1.03]) box(mc, nog, 0.04, 1.84, 0.32, sx, 0, 0.16);
      box(mc, nog, 2.1, 0.05, 0.32, 0, 1.79, 0.16);
      box(mc, nog, 2.02, 0.03, 0.26, 0, 1.42, 0.13);
      const books = [[0x111111, 0.05, 0.24], [0x222222, 0.04, 0.22], [0xe9e4da, 0.06, 0.2], [0x1a1a1a, 0.03, 0.25]];
      books.forEach(([c, w, h], i) => box(mc, M(c, { roughness: 0.7 }), w, h, 0.18, -0.92 + i * 0.06, 1.45, 0.12));
      box(mc, M(0x141414), 0.24, 0.24, 0.03, -0.1, 1.45, 0.08);
      cyl(mc, M(0xd9d6d0, { roughness: 0.3 }), 0.08, 0.06, 0.18, 0.55, 1.45, 0.12);
      box(mc, M(0x1c1c1c), 0.3, 0.07, 0.2, 0.8, 1.45, 0.12);
      // criado-mudo suspenso, arandela de braço articulado e cama estofada cinza
      box(g, woodM(walnut, 0.5, 0.3), 0.5, 0.3, 0.38, -1.12, 0.42, -1.29);
      box(g, M(0x3a2618), 0.46, 0.004, 0.002, -1.12, 0.57, -1.098, { cast: false });
      vase(g, { x: -1.25, z: -1.32, y: 0.72, color: 0x5b8a42, h: 0.26 });
      const arm = grp(g, -0.95, 1.2, -1.47);
      box(arm, M(0x161616), 0.04, 0.12, 0.03, 0, -0.06, 0.015);
      box(arm, M(0x161616), 0.012, 0.012, 0.32, 0, 0.0, 0.18);
      box(arm, M(0x161616), 0.012, 0.012, 0.3, 0.08, 0.12, 0.34, { ry: 0.6 });
      cyl(arm, M(0x161616), 0.035, 0.03, 0.08, 0.2, 0.08, 0.45);
      bed(g, { x: -0.35, z: -0.52, w: 1.45, l: 1.95, sheet: 0xeceae6, duvet: 0x9b9995, throwC: 0x737170, pillows: [0x8f8d8a, 0x6f6d6a, 0xd9d7d3], wood: '#bdbab4' });
      // ripado de nogueira até o teto
      slats(g, { x: 0.93, z: -1.475, w: 0.55, h: H, wood: walnut, dep: 0.03 });
      door(g, { x: 1.44, z: -0.9, ry: -Math.PI / 2 });
      windowUnit(g, { x: 0, z: 1.5, ry: Math.PI, w: 1.2, h: 1.2, sill: 1.0, ceil: H });
      spots(g, [[-0.9, -0.8], [0.3, -0.8]], H);
    },
    pois: [
      { p: [-0.4, 1.6, -1.35], t: 'Marcenaria sob medida', d: 'Painel de nogueira com prateleira e armários brancos até o teto. ' + FEAT.person },
      { p: [0.93, 1.6, -1.45], t: 'Ripado de madeira', d: 'Ripado em nogueira do piso ao teto.' },
      { p: [1.4, 1.6, -0.9], t: 'Quarto 02', d: 'Quarto com armário espelhado e boiserie.', go: 't01-quarto-2' },
      { p: [0, 1.6, 1.45], t: 'Voltar para a sala', d: 'Cozinha e sala integradas.', go: 't01-sala' },
    ],
  },
  't01-quarto2': {
    name: 'Quarto 02', group: 'Apartamento Tipo 01', h: 2.6,
    bounds: [-1.2, 0.8, -1.5, 1.55], sun: [1, 5, -6],
    build(g) {
      const W = 3.0, D = 3.6, H = 2.6;
      shell(g, { w: W, d: D, h: H, floor: M(0xffffff, { map: rep(TX.carpet(), 3, 3), roughness: 1 }), walls: paint(0xd8d1c7) });
      // parede da cabeceira: lambri de madeira e boiserie branca
      box(g, woodM('#8a5f3e', 2.4, 0.8), 0.03, 1.1, D, -1.485, 0, 0, { cast: false });
      const mold = M(0xf6f4f0, { roughness: 0.5 });
      for (const [zc, w] of [[-1.05, 0.52], [-0.25, 0.85], [0.6, 0.62]]) {
        const y0 = 1.22, hh = 1.18;
        box(g, mold, 0.025, 0.035, w, -1.485, y0, zc, { cast: false });
        box(g, mold, 0.025, 0.035, w, -1.485, y0 + hh, zc, { cast: false });
        box(g, mold, 0.025, hh, 0.035, -1.485, y0, zc - w / 2, { cast: false });
        box(g, mold, 0.025, hh, 0.035, -1.485, y0, zc + w / 2, { cast: false });
      }
      headboard(g, { w: 1.75, h: 1.0, x: -1.42, y: 0.28, z: -0.15, ry: Math.PI / 2, color: 0xb29d8e, channels: false });
      bed(g, { x: -0.45, z: -0.15, ry: Math.PI / 2, w: 1.6, l: 2.0, sheet: 0xf4f2ee, duvet: 0xf2f0ec, throwC: 0x8e8f8d, pillows: [0xb6a699, 0xf4f2ee, 0xe9e6e1], wood: '#a38877' });
      for (const z of [-1.22, 0.92]) {
        cyl(g, M(0x8f9096, { roughness: 0.5 }), 0.22, 0.22, 0.55, -1.22, 0, z, { solid: true });
        const pd = grp(g, -1.12, 0, z);
        cyl(pd, brass(), 0.004, 0.004, H - 1.42, 0, 1.42, 0, { cast: false });
        sph(pd, M(0xfff8ec, { emissive: 0xffe2b5, emissiveIntensity: 1.8, roughness: 0.2 }), 0.09, 0, 1.33, 0, { cast: false });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.006, 8, 40), brass()); ring.position.set(0, 1.33, 0); ring.rotation.y = Math.PI / 2; pd.add(ring);
        const L = new THREE.PointLight(0xffc98a, 1.2, 3, 2); L.position.set(0.1, 1.3, 0); pd.add(L);
      }
      vase(g, { x: -1.22, z: 0.62, y: 0.55, color: 0xf6f4ef, h: 0.18 });
      windowUnit(g, { x: -0.55, z: -1.8, w: 1.25, h: 1.3, sill: 0.95, curtains: false, ceil: H, view: 'field' });
      plane(g, M(0xffffff, { map: TX.abstract(), roughness: 0.8 }), 0.78, 1.1, 0.55, 1.5, -1.78);
      // armário com portas espelhadas bronze na parede leste
      const ar = solid(grp(g, 1.2, 0, -0.27));
      box(ar, M(0x6c6358, { roughness: 0.4 }), 0.6, 2.5, 2.45, 0, 0, 0);
      const mir = M(0xc2b3a1, { metalness: 0.55, roughness: 0.12, envMapIntensity: 1.6 });
      for (let i = 0; i < 3; i++) {
        const dz = -1.225 + 0.8167 * (i + 0.5);
        plane(ar, mir, 0.79, 2.42, -0.302, 1.24, dz, { ry: -Math.PI / 2 });
      }
      for (let i = 0; i <= 3; i++) box(ar, M(0x5a4c3d, { metalness: 0.6, roughness: 0.3 }), 0.012, 2.46, 0.02, -0.305, 0.02, -1.225 + 0.8167 * i, { cast: false });
      spots(g, [[0, -0.6], [0, 0.7]], H);
      door(g, { x: 0.3, z: 1.79, ry: Math.PI });
    },
    pois: [
      { p: [-1.45, 1.8, -0.25], t: 'Boiserie e lambri', d: 'Lambri de madeira na cabeceira e molduras brancas na parede.' },
      { p: [0.9, 1.5, -0.3], t: 'Armário espelhado', d: 'Portas com espelho bronze que ampliam o quarto. ' + FEAT.person },
      { p: [-0.55, 1.6, -1.75], t: 'Janela', d: 'Ótima ventilação e entrada de luz natural.' },
      { p: [0.3, 1.6, 1.7], t: 'Voltar para o quarto 01', d: 'Quarto com marcenaria de nogueira.', go: 't01-quarto-1' },
    ],
  },

  /* ------------------------------------------------ Tipo 02 (fotos oficiais: cozinha e sala, sacadas e quarto 01) */
  't02-estar': {
    name: 'Cozinha e sala', group: 'Apartamento Tipo 02', h: 2.6,
    bounds: [-1.6, 1.4, -1.95, 2.0], sun: [-1, 5, -6],
    build(g) {
      const W = 4.2, D = 4.6, H = 2.6;
      shell(g, { w: W, d: D, h: H, floor: porcelainFloor(W, D, '#d8d5cf'), walls: paint(0xd8cfc3) });
      // parede norte: janela com cortinas e porta de vidro para a sacada da área de serviço
      windowUnit(g, { x: -0.75, z: -2.3, w: 1.3, h: 1.55, sill: 0.85, ceil: H, view: 'trees' });
      windowUnit(g, { x: 0.95, z: -2.3, w: 0.85, h: 2.15, door: true, curtains: false, ceil: H, view: 'field' });
      // treliça de madeira no forro junto à janela e painel em grade no canto
      const tre = [];
      for (let x = -2.08; x <= 0.45; x += 0.1) tre.push([0.025, 0.06, 0.4, x, H - 0.07, -2.08]);
      for (let z = -2.27; z <= -1.9; z += 0.1) tre.push([2.55, 0.06, 0.025, -0.82, H - 0.07, z]);
      boxes(g, woodM('#b07c4f', 2, 0.3), tre, { cast: false });
      lattice(g, { x: -1.98, z: -1.95, w: 0.6, h: H, ry: Math.PI / 2, cell: 0.12 });
      // parede da TV: painel de madeira, rack branco suspenso e ar-condicionado
      box(g, woodM('#b5875b', 2, 2.2), 0.04, H, 2.9, -2.08, 0, -0.55, { cast: false });
      box(g, M(0xeeebe6, { roughness: 0.4 }), 0.36, 0.2, 2.3, -1.9, 0.5, -0.5, { solid: true });
      tv(g, { x: -2.05, y: 1.35, z: -0.35, ry: Math.PI / 2, w: 1.0 });
      ac(g, { x: -2.05, z: 0.45, y: 2.2, ry: Math.PI / 2 });
      // sofá em bouclê voltado para a TV
      sofa(g, { x: -0.75, z: -0.2, ry: -Math.PI / 2, len: 1.9, color: 0xe2ddd6, pillows: [0xe9d6d0, 0xe2ddd6] });
      rug(g, { x: -1.35, z: -0.25, w: 1.6, d: 2.4, color: 0xe9e2d6 });
      plant(g, { x: -0.15, z: -2.0, h: 1.25, potR: 0.18, pot: 0x2f2f30, seed: 91 });
      // jantar: tampo bege, base de madeira, cadeiras bouclê brancas com estrutura dourada
      const mesa = solid(grp(g, 0.5, 0, -0.9));
      cyl(mesa, M(0xe7e0d5, { roughness: 0.35 }), 0.56, 0.56, 0.035, 0, 0.72, 0, { seg: 56 });
      cyl(mesa, woodM('#c9a77c'), 0.12, 0.33, 0.72, 0, 0, 0, { seg: 40 });
      around(0.5, -0.9, 0.78, 4, Math.PI / 4, (o) => shellChair(g, { ...o, color: 0xefebe5, legs: 'brass' }));
      const pend = grp(g, 0.5, 0, -0.9), gl = M(0xf3e6d0, { roughness: 0.08, transparent: true, opacity: 0.5, depthWrite: false, emissive: 0xffd9a8, emissiveIntensity: 0.5 });
      for (const z of [-0.25, 0.25]) cyl(pend, M(0x111111), 0.003, 0.003, H - 1.85, 0, 1.85, z, { cast: false });
      box(pend, brass(), 0.02, 0.02, 1.0, 0, 1.84, 0, { cast: false });
      [[-0.45, 0.1], [-0.25, -0.12], [-0.05, 0.12], [0.15, -0.1], [0.32, 0.1], [0.46, -0.06]].forEach(([z, dy]) => { sph(pend, gl, 0.075, 0, 1.78 + dy, z, { cast: false }); sph(pend, glow(0xffd9a3, 5), 0.02, 0, 1.78 + dy, z, { cast: false }); });
      const pl = new THREE.PointLight(0xffc98a, 3, 4, 2); pl.position.set(0, 1.6, 0); pend.add(pl);
      // cozinha na parede leste: pia com granito escuro, nichos de vidro canelado iluminados, geladeira e torre de fornos
      kitchenRun(g, { len: 1.45, x: 1.8, z: -1.575, ry: -Math.PI / 2, base: 0xa8a49e, counter: 0x1d1d20, upper: 'glass', wood: '#a8784c', backsplash: 'subway', sinkAt: 0.1, h: H, upperFrom: 1.55 });
      fridge(g, { x: 1.76, z: -0.475, ry: -Math.PI / 2, w: 0.72 });
      box(g, M(0xa29e98, { roughness: 0.45 }), 0.62, H - 1.88, 0.78, 1.8, 1.88, -0.475);
      ovenTower(g, { x: 1.8, z: 0.24, ry: -Math.PI / 2, w: 0.68, h: H, color: 0xa29e98 });
      box(g, glow(0xfff2dc, 3), 0.02, 0.005, 2.0, 0.5, H - 0.006, -0.9, { cast: false });
      spots(g, [[-1.2, -1.4], [-1.2, 0.8], [0.4, 1.4], [-1.2, 1.8]], H);
      door(g, { x: 2.09, z: 1.4, ry: -Math.PI / 2 });
      door(g, { x: -1.3, z: 2.29, ry: Math.PI });
    },
    pois: [
      { p: [-2.0, 2.2, 0.45], t: 'Ar-condicionado', d: FEAT.ac },
      { p: [-0.8, 2.5, -2.1], t: 'Treliça de madeira', d: 'Treliça no forro e no canto da janela. ' + FEAT.forro },
      { p: [1.8, 1.8, -1.5], t: 'Cozinha planejada', d: 'Nichos de vidro canelado iluminados, granito escuro, geladeira embutida e torre com dois fornos.', go: 't02-cozinha' },
      { p: [0.95, 1.6, -2.25], t: 'Ir para a sacada', d: 'Sacada com churrasqueira e área de serviço.', go: 't02-varanda' },
      { p: [-1.3, 1.6, 2.2], t: 'Ir para o quarto 01', d: 'Quarto com painel de madeira e sacada privativa.', go: 't02-quarto-01' },
    ],
  },
  't02-varanda': {
    name: 'Sacada com área de serviço', group: 'Apartamento Tipo 02', h: 2.6, outdoor: 'sky',
    bounds: [-1.25, 1.2, -0.2, 0.75], sun: [-6, 5, 2],
    // mesma solução do Tipo 01, espelhada como na foto do Tipo 02
    build(g) { const m = grp(g); m.scale.x = -1; ENVS['t01-varanda'].build(m); },
    pois: [
      { p: [-0.32, 1.35, -0.3], t: 'Churrasqueira', d: 'Churrasqueira na sacada, em moldura de granito preto.' },
      { p: [0.75, 1.05, -0.5], t: 'Área de serviço', d: 'Lavadora, tanque e armários integrados à sacada.' },
      { p: [-0.85, 1.6, 0.85], t: 'Voltar para a sala', d: 'Cozinha e sala integradas.', go: 't02-sala' },
    ],
  },
  't02-sacada-q1': {
    name: 'Sacada do quarto 01', group: 'Apartamento Tipo 02', h: 2.6, outdoor: 'sky',
    bounds: [-0.9, 0.95, -0.55, 0.75], sun: [6, 5, 2],
    build(g) {
      const W = 2.4, D = 1.9, H = 2.6, wall = paint(0xbcb6ad);
      shell(g, { w: W, d: D, h: H, floor: porcelainFloor(W, D, '#8f8c87'), walls: { n: wall, s: wall, w: wall, e: null } });
      // coluna de tijolos de vidro verde
      box(g, M(0xffffff, { map: rep(TX.glassBlock(), 1, 3.75), roughness: 0.08, metalness: 0.1, emissive: 0x24463a, emissiveIntensity: 0.25 }), 0.75, H - 0.3, 0.08, 0.05, 0, -0.91, { cast: false });
      box(g, wall, 0.3, H, 0.3, 0.92, 0, -0.8);
      // guarda-corpo de vidro com perfil preto
      plane(g, glass({ opacity: 0.28 }), D, 1.05, 1.18, 0.55, 0, { ry: -Math.PI / 2 });
      box(g, blackMetal(), 0.05, 0.05, D, 1.18, 1.06, 0, { cast: false });
      box(g, blackMetal(), 0.06, 0.04, D, 1.18, 0, 0, { cast: false });
      box(g, wall, 0.2, 0.3, D + 0.2, 1.25, H - 0.3, 0, { cast: false });
      plane(g, new THREE.MeshBasicMaterial({ map: TX.view('field'), color: new THREE.Color(1.05, 1.05, 1.05) }), 30, 12, 9, 3, 0, { ry: -Math.PI / 2 });
      const sunL = new THREE.RectAreaLight(0xfff1dc, 6, D, 1.6); sunL.position.set(1.15, 1.4, 0); sunL.lookAt(-3, 1.2, 0); g.add(sunL);
      // poltrona de madeira com almofadas bege
      const pt = solid(grp(g, -0.7, 0, 0.2, Math.PI / 2)), wd = woodM('#5a3a26', 0.3, 1), cu = fabric(0xd9cdb9, 2);
      for (const sx of [-0.33, 0.33]) { box(pt, wd, 0.04, 0.04, 0.75, sx, 0.55, 0); for (const sz of [-0.3, 0.3]) { const l = box(pt, wd, 0.04, 0.55, 0.04, sx, 0, sz); l.rotation.x = sz > 0 ? 0.12 : -0.12; } }
      rbox(pt, cu, 0.6, 0.12, 0.6, 0.04, 0, 0.3, 0.02);
      const bk = rbox(pt, cu, 0.6, 0.6, 0.12, 0.04, 0, 0.42, -0.3); bk.rotation.x = -0.25;
      spots(g, [[0, 0]], H);
      door(g, { x: -1.19, z: 0.1, ry: Math.PI / 2 });
    },
    pois: [
      { p: [0.05, 1.5, -0.88], t: 'Tijolo de vidro', d: 'Coluna de tijolos de vidro verde que deixa a luz passar.' },
      { p: [1.15, 1.2, 0], t: 'Guarda-corpo de vidro', d: 'Sacada privativa do quarto 01, com vista aberta.' },
      { p: [-1.15, 1.6, 0.1], t: 'Voltar para o quarto 01', d: 'Quarto com painel de madeira.', go: 't02-quarto-01' },
    ],
  },
  't02-quarto1': {
    name: 'Quarto 01', group: 'Apartamento Tipo 02', h: 2.6,
    bounds: [-0.55, 1.0, -0.2, 1.3], sun: [6, 5, 1],
    build(g) {
      const W = 2.6, D = 3.2, H = 2.6;
      shell(g, { w: W, d: D, h: H, floor: M(0xffffff, { map: rep(TX.carpet(), 3, 3), roughness: 1 }), walls: paint(0xf1ede6) });
      // parede da cama: painel de madeira em cima e cabeceira estofada canelada em toda a largura
      box(g, woodM('#9a6a43', 2.6, 1.4), W, H - 1.2, 0.04, 0, 1.2, -1.58, { cast: false });
      headboard(g, { w: W - 0.02, h: 0.98, x: 0, y: 0.22, z: -1.555, color: 0xeee8dd });
      ac(g, { x: 0.05, z: -1.56, y: 2.18 });
      bed(g, { x: 0.05, z: -0.55, w: 1.5, l: 1.95, sheet: 0xd5d6d8, duvet: 0xc7c8ca, throwC: 0xd9b8a2, pillows: [0xc4c6c9, 0xd9b8a2, 0xe9e7e3], wood: '#cfcbc4' });
      nightstand(g, { x: 1.0, z: -1.35, wood: '#8a5c3a', w: 0.45 });
      vase(g, { x: 0.95, z: -1.4, y: 0.55, color: 0x6d9a52, h: 0.2 });
      pendant(g, { x: 1.0, z: -1.25, y: 1.2, style: 'gold', light: 1.4, ceil: H });
      // parede leste: cortina de voil de ponta a ponta, com a porta da sacada atrás
      windowUnit(g, { x: 1.3, z: -0.4, ry: -Math.PI / 2, w: 1.6, h: 2.15, door: true, curtains: false, ceil: H, view: 'field' });
      curtain(g, 3.0, H - 0.05, 1.18, 0, -Math.PI / 2);
      // closet aberto com portas de vidro e arandela dourada de globos
      openWardrobe(g, { x: -1.0, z: -0.55, ry: Math.PI / 2, w: 1.5 });
      plane(g, glass({ opacity: 0.12 }), 1.5, 2.4, -0.7, 1.2, -0.55, { ry: Math.PI / 2 });
      box(g, woodM('#9a6a43', 0.3, 2), 0.03, 2.4, 0.35, -1.285, 0, 0.95, { cast: false });
      const sc = grp(g, -1.25, 0, 0.95);
      box(sc, brass(), 0.02, 1.0, 0.03, 0.02, 1.0, 0.05, { cast: false });
      for (const [y, dz] of [[1.85, -0.07], [1.85, 0.14], [1.4, -0.07], [1.4, 0.14]]) sph(sc, M(0xfff8ec, { emissive: 0xffe2b5, emissiveIntensity: 1.8 }), 0.06, 0.08, y, dz, { cast: false });
      const sl = new THREE.PointLight(0xffc98a, 1.3, 3, 2); sl.position.set(0.25, 1.6, 0.05); sc.add(sl);
      spots(g, [[0, 0.3]], H);
      door(g, { x: -0.6, z: 1.59, ry: Math.PI });
    },
    pois: [
      { p: [0.05, 1.8, -1.55], t: 'Painel e cabeceira', d: 'Painel de madeira e cabeceira estofada canelada em toda a parede.' },
      { p: [0.05, 2.18, -1.5], t: 'Ar-condicionado', d: FEAT.ac },
      { p: [-0.75, 1.5, -0.55], t: 'Closet aberto', d: FEAT.person },
      { p: [1.15, 1.5, -0.4], t: 'Sacada do quarto', d: 'Este quarto tem sacada privativa.', go: 't02-sacada' },
      { p: [-0.6, 1.6, 1.5], t: 'Voltar para a sala', d: 'Cozinha e sala integradas.', go: 't02-sala' },
    ],
  },

  /* ------------------------------------------------ Tipo 03 */
  't03-estar': {
    name: 'Estar e cozinha', group: 'Apartamento Tipo 03 e 05', h: 2.65,
    bounds: [-1.9, 1.9, -2.3, 2.8], sun: [-2, 5, 6],
    build(g) {
      const W = 4.3, D = 6.1, H = 2.65;
      shell(g, { w: W, d: D, h: H, floor: porcelainFloor(W, D, '#e6e1d8'), walls: paint(0xf0ebe2) });
      // cozinha na parede norte
      kitchenRun(g, { len: 2.0, x: -1.15, z: -2.75, upper: 'glass', wood: '#b88454', base: 0xece4d6, counter: 0xd9cbb4, backsplash: 'stone', sinkAt: -0.5, cooktopAt: 0.45, ovenAt: 0.45 });
      fridge(g, { x: 0.22, z: -2.7 });
      const nicho = woodM('#b88454', 1, 2);
      box(g, nicho, 0.06, H, 0.62, 0.6, 0, -2.74);
      box(g, nicho, 0.06, H, 0.62, 1.32, 0, -2.74);
      box(g, nicho, 0.7, H - 0.9, 0.62, 0.96, 0.9, -2.74);
      washer(g, { x: 0.96, z: -2.72 });
      slats(g, { x: 1.74, z: -3.02, w: 0.82, h: H, dep: 0.04 });
      // bancada com banquetas
      const ilha = solid(grp(g, -1.0, 0, -1.55));
      box(ilha, woodM('#b88454', 1.5, 0.8), 1.8, 0.92, 0.55, 0, 0, 0);
      box(ilha, M(0xdccfb9, { roughness: 0.3 }), 1.86, 0.04, 0.62, 0, 0.92, 0.02);
      for (const x of [-1.6, -1.0, -0.4]) barStool(g, { x, z: -1.0, ry: Math.PI, leather: false, seat: 0xc39a6b, h: 0.66 });
      pendant(g, { x: -1.5, z: -1.55, y: 1.65 });
      pendant(g, { x: -0.5, z: -1.55, y: 1.65 });
      // ripado de piso a teto entre cozinha e estar
      solid(slats(g, { x: 0.55, z: -1.1, w: 1.0, h: H, ry: Math.PI / 2, dep: 0.05 }));
      // estar
      tv(g, { x: 2.12, y: 1.4, z: 0.95, ry: -Math.PI / 2, w: 1.3 });
      rack(g, { x: 2.13, z: 0.95, ry: -Math.PI / 2, w: 1.9, wood: '#b88454', floating: false, h: 0.45 });
      ac(g, { x: 2.13, z: -0.4, y: 2.25, ry: -Math.PI / 2 });
      sofa(g, { x: 0.15, z: 0.95, ry: Math.PI / 2, len: 2.0 });
      rug(g, { x: 0.9, z: 0.95, w: 2.4, round: true, color: 0xd9ccb6 });
      plant(g, { x: 1.85, z: 2.55, h: 1.4, potR: 0.2, seed: 3 });
      plant(g, { x: 1.85, z: -0.85, h: 0.9, potR: 0.15, pot: 0x2f2f30, seed: 8 });
      windowUnit(g, { x: -0.6, z: 3.05, ry: Math.PI, w: 1.5, h: 1.5, sill: 0.8 });
      cove(g, { w: 2.6, d: 2.4, x: 0.6, z: 1.1, h: H });
      spots(g, [[-1.6, -2.2], [-0.5, -2.2], [0.3, 0.6], [0.9, 1.6], [-1.5, 1.8]], H);
      door(g, { x: 1.4, z: 3.04, ry: Math.PI });
      door(g, { x: -2.14, z: 0.4, ry: Math.PI / 2 });
    },
    pois: [
      { p: [0.6, 2.55, 1.1], t: 'Forro de gesso com LED', d: FEAT.forro },
      { p: [2.1, 2.25, -0.4], t: 'Ar-condicionado', d: FEAT.ac },
      { p: [0.96, 1.15, -2.6], t: 'Área de serviço integrada', d: 'Lavadora em nicho de madeira dentro da cozinha.', go: 't03-cozinha' },
      { p: [-1.0, 1.3, -1.55], t: 'Bancada de refeições', d: 'Bancada com banquetas integrada à cozinha.' },
      { p: [-2.05, 1.6, 0.4], t: 'Ir para os quartos', d: 'Quarto 1 com painel de madeira e quarto 2 com sacada.', go: 't03-quarto1-a' },
    ],
  },
  't03-quarto1': {
    name: 'Quarto 1', group: 'Apartamento Tipo 03 e 05', h: 2.65,
    bounds: [-1.2, 1.25, -1.55, 1.55], sun: [6, 4, -2],
    build(g) {
      const W = 3.0, D = 3.6, H = 2.65;
      shell(g, { w: W, d: D, h: H, floor: woodFloor(W, D, '#d6b48c'), walls: paint(0xf1ece3) });
      box(g, M(0xffffff, { map: TX.curves(), roughness: 0.6 }), W, H, 0.05, 0, 0, -1.775, { cast: false });
      box(g, glow(0xffd29a, 3), W - 0.05, 0.012, 0.03, 0, H - 0.03, -1.74, { cast: false });
      headboard(g, { w: 1.9, h: 1.05, x: 0, z: -1.71, color: 0xe7ddcc });
      bed(g, { x: 0, z: -0.72, w: 1.6, l: 2.0, sheet: 0xf3eee5, duvet: 0xeae2d4, throwC: 0x7a5b43, pillows: [0xeee6d8, 0xcfc2ae, 0xe9e0d0] });
      nightstand(g, { x: -1.1, z: -1.55, wood: '#a97a50' });
      nightstand(g, { x: 1.1, z: -1.55, wood: '#a97a50' });
      sconce(g, { x: -1.12, y: 1.45, z: -1.74 });
      sconce(g, { x: 1.12, y: 1.45, z: -1.74 });
      plant(g, { x: -1.1, z: -1.55, y: 0.55, h: 0.3, potR: 0.07, pot: 0xe9e4da, seed: 12 });
      windowUnit(g, { x: 1.5, z: -0.35, ry: -Math.PI / 2, w: 1.2, h: 1.7, sill: 0.55 });
      wardrobe(g, { x: -1.2, z: 0.75, ry: Math.PI / 2, w: 1.8, doors: 3, color: 0xf3efe8, handle: 'brass' });
      rug(g, { x: 0, z: -0.35, w: 2.3, d: 2.4, color: 0xd8cbb5 });
      door(g, { x: 0.8, z: 1.79, ry: Math.PI });
    },
    pois: [
      { p: [0, 2.0, -1.7], t: 'Painel de madeira', d: FEAT.person },
      { p: [1.45, 1.5, -0.35], t: 'Janela ampla', d: 'Luz natural com cortina de voil.' },
      { p: [0.8, 1.6, 1.7], t: 'Voltar para a sala', d: 'Estar e cozinha integrados.', go: 't03-sala' },
      { p: [-1.2, 1.6, 0.75], t: 'Quarto 2', d: 'Quarto com acesso à sacada privativa.', go: 't03-quarto2-a' },
    ],
  },
  't03-quarto2': {
    name: 'Quarto 2', group: 'Apartamento Tipo 03 e 05', h: 2.65,
    bounds: [-1.1, 1.15, -1.0, 1.45], sun: [-6, 4, 0],
    build(g) {
      const W = 2.8, D = 3.4, H = 2.65;
      shell(g, { w: W, d: D, h: H, floor: woodFloor(W, D, '#dcc4a2'), walls: paint(0xf3eee6) });
      plane(g, M(0xffffff, { map: TX.mural(), roughness: 0.95 }), 2.0, 1.4, 0.3, 1.25, -1.69);
      const white = M(0xf4f1ea, { roughness: 0.45 });
      box(g, white, 2.2, 0.55, 0.38, 0.3, H - 0.56, -1.51);
      for (let i = 1; i < 4; i++) box(g, M(0xc9c3b8), 0.003, 0.52, 0.002, -0.8 + i * 0.55, H - 0.55, -1.32, { cast: false });
      wardrobe(g, { x: -0.95, z: -1.4, w: 0.9, d: 0.6, doors: 2, color: 0xf4f1ea, handle: 'brass' });
      box(g, woodM('#e2d3bc', 2, 0.2), 1.9, 0.03, 0.22, 0.4, 1.7, -1.59);
      box(g, glow(0xffd29a, 3), 1.85, 0.008, 0.01, 0.4, 1.695, -1.5, { cast: false });
      teddy(g, { x: 0.0, y: 1.73, z: -1.6, s: 0.6 });
      teddy(g, { x: 0.8, y: 1.73, z: -1.6, s: 0.5, color: 0xc9a27a });
      plant(g, { x: 0.4, z: -1.6, y: 1.73, h: 0.15, potR: 0.05, pot: 0xe9e4da, seed: 21 });
      // sofá-cama infantil com estofado curvo
      const db = solid(grp(g, 0.4, 0, -1.2));
      const up = fabric(0xebe2d2, 2);
      rbox(db, up, 1.95, 0.32, 0.92, 0.08, 0, 0, 0);
      rbox(db, up, 2.0, 0.62, 0.14, 0.07, 0, 0.1, -0.43);
      for (const s of [-1, 1]) rbox(db, up, 0.14, 0.52, 0.92, 0.07, s * 0.95, 0.1, 0);
      rbox(db, fabric(0xa9b8a0, 2), 1.75, 0.12, 0.8, 0.05, 0, 0.32, 0.03);
      rbox(db, fabric(0xdccbb2, 2), 0.5, 0.06, 0.82, 0.03, -0.45, 0.44, 0.04);
      for (const [x, c] of [[-0.5, 0xa9b8a0], [0.1, 0xefe9de], [0.55, 0xc9b79c]]) { const q = rbox(db, fabric(c, 2), 0.42, 0.36, 0.13, 0.06, x, 0.45, -0.28); q.rotation.x = -0.2; }
      teddy(db, { x: 0.65, y: 0.44, z: 0.05, s: 0.9 });
      teddy(g, { x: 1.05, z: -0.45, s: 1.4 });
      rbox(g, fabric(0xa9b8a0, 2), 0.55, 0.12, 0.45, 0.06, 0.3, 0, -0.35);
      rug(g, { x: 0.3, z: -0.1, w: 2.0, d: 1.6, color: 0xf2ece1 });
      windowUnit(g, { x: -1.4, z: 0.35, ry: Math.PI / 2, w: 1.3, h: 2.15, door: true });
      const rail = blackMetal(), rl = [];
      for (let z = -0.25; z <= 0.95; z += 0.1) rl.push([0.004, 1.05, 0.02, -1.388, 0, z]);
      rl.push([0.004, 0.04, 1.3, -1.388, 1.05, 0.35]);
      const out = grp(g, 0, 0, 0); boxes(out, rail, rl, { cast: false });
      door(g, { x: 0.9, z: 1.69, ry: Math.PI });
    },
    pois: [
      { p: [0.3, 1.25, -1.6], t: 'Mural infantil', d: FEAT.person },
      { p: [-1.35, 1.5, 0.35], t: 'Sacada privativa', d: '1 quarto com sacada privativa no Tipo 03.' },
      { p: [0.9, 1.6, 1.6], t: 'Voltar para o quarto 1', d: 'Quarto com painel de madeira.', go: 't03-quarto1-a' },
    ],
  },

  't03-infantil': {
    name: 'Quarto infantil', group: 'Apartamento Tipo 03 e 05', h: 2.6,
    bounds: [-0.6, 0.85, 0.1, 1.35], sun: [1, 5, -6],
    build(g) {
      const W = 3.0, D = 3.2, H = 2.6;
      shell(g, { w: W, d: D, h: H, floor: woodFloor(W, D, '#c99b62'), walls: paint(0xe6d8b8) });
      // faixa de papel listrado no alto das paredes
      const st = M(0xffffff, { map: rep(TX.stripes(), 6, 1), roughness: 0.9 });
      plane(g, st, W, 0.45, 0, H - 0.225, -1.595);
      plane(g, st, D, 0.45, -1.495, H - 0.225, 0, { ry: Math.PI / 2 });
      // painéis estofados de topo arredondado (rosa) nas paredes da cama
      const pk = fabric(0xd59c86, 2), pn = [];
      for (let x = -1.38; x < 1.15; x += 0.25) pn.push([x, -1.56, 0]);
      for (let z = -1.38; z < 0.8; z += 0.25) pn.push([-1.46, z, Math.PI / 2]);
      for (const [x, z, ry] of pn) {
        const pg = grp(g, x, 0, z, ry);
        box(pg, pk, 0.23, 0.98, 0.05, 0, 0, 0, { cast: false });
        cyl(pg, pk, 0.115, 0.115, 0.05, 0, 0.955, 0, { rx: Math.PI / 2, cast: false }).position.y = 0.98;
      }
      windowUnit(g, { x: 0.05, z: -1.6, w: 1.25, h: 1.05, sill: 1.2, curtains: false, ceil: H, view: 'trees' });
      bed(g, { x: -0.55, z: -1.0, ry: Math.PI / 2, w: 1.15, l: 1.9, sheet: 0xb8c4a8, duvet: 0xb9c2aa, throwC: 0xbfae95, pillows: [0xa9b89a, 0xe8c6a8, 0xf1d36a], wood: '#b9c2aa' });
      // criado-mudo creme com abajur
      const cm = solid(grp(g, -1.25, 0, 0.2));
      box(cm, M(0xf0e8d6, { roughness: 0.5 }), 0.4, 0.55, 0.4, 0, 0, 0);
      cyl(cm, M(0x8aa37a, { roughness: 0.3 }), 0.06, 0.08, 0.2, 0, 0.55, 0);
      cyl(cm, M(0xfff1d6, { emissive: 0xffe0b0, emissiveIntensity: 0.9, side: THREE.DoubleSide }), 0.08, 0.13, 0.16, 0, 0.78, 0, { open: true });
      const lp = new THREE.PointLight(0xffc98a, 1.5, 3, 2); lp.position.set(0, 0.85, 0); cm.add(lp);
      // mesinha em forma de nuvem e cadeirinhas de orelhas
      const mt = solid(grp(g, -0.05, 0, 0.45)), wd = woodM('#d1a66d', 0.4, 0.4);
      for (const [dx, dz, r] of [[0, 0, 0.26], [0.2, 0.08, 0.18], [-0.2, 0.08, 0.18], [0.1, -0.16, 0.16], [-0.12, -0.15, 0.16]]) cyl(mt, wd, r, r, 0.03, dx, 0.5, dz, { seg: 32 });
      for (const [dx, dz] of [[0.15, 0.15], [-0.15, 0.15], [0.15, -0.12], [-0.15, -0.12]]) cyl(mt, wd, 0.018, 0.018, 0.5, dx, 0, dz);
      for (const [cx, cz, ry] of [[-0.45, 0.55, Math.PI / 2], [0.38, 0.55, -Math.PI / 2]]) {
        const ch = grp(g, cx, 0, cz, ry);
        rbox(ch, wd, 0.3, 0.03, 0.3, 0.01, 0, 0.3, 0);
        for (const [lx, lz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) cyl(ch, wd, 0.014, 0.014, 0.3, lx, 0, lz);
        rbox(ch, wd, 0.28, 0.24, 0.03, 0.01, 0, 0.33, -0.14);
        for (const ex of [-0.07, 0.07]) sph(ch, wd, 0.05, ex, 0.68, -0.14, { s: [0.6, 1.6, 0.4] });
      }
      // móbile de balões e nuvens perto da parede
      const mb = grp(g, -1.25, 0, -0.75);
      const rg = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.008, 6, 40), brass()); rg.rotation.x = Math.PI / 2; rg.position.y = 2.0; mb.add(rg);
      [[0xe8774f, 0.15, 0.1, 1.55], [0x9fbf8f, -0.12, 0.12, 1.7], [0xd9a9c9, 0.05, -0.18, 1.45], [0x55585d, -0.15, -0.05, 1.25], [0xe8774f, 0.18, -0.1, 1.3]].forEach(([c, x, z, y]) => {
        cyl(mb, M(0xffffff), 0.002, 0.002, 2.0 - y, x, y, z, { cast: false });
        sph(mb, M(c, { roughness: 0.6 }), 0.08, x, y - 0.02, z, { s: [1, 1.3, 1] });
      });
      for (const [x, y, z] of [[0.05, 1.85, 0.2], [-0.2, 1.6, -0.2], [0.2, 1.75, -0.15]]) sph(mb, M(0xffffff, { roughness: 0.9 }), 0.07, x, y, z, { s: [1.6, 0.9, 0.6] });
      // armário com portas em arco de palhinha
      const ar = solid(grp(g, 1.2, 0, -0.3)), cream = M(0xece3d2, { roughness: 0.5 });
      box(ar, cream, 0.6, 2.5, 2.6, 0, 0, 0);
      const cane = M(0xc79a5e, { map: rep(TX.reed(), 3, 1), roughness: 0.8 });
      for (let i = 0; i < 4; i++) {
        const dz = -1.3 + 0.65 * (i + 0.5);
        plane(ar, cane, 0.48, 1.05, -0.302, 1.6, dz, { ry: -Math.PI / 2 });
        const arc = new THREE.Mesh(new THREE.CircleGeometry(0.24, 32, 0, Math.PI), cane); arc.position.set(-0.302, 2.125, dz); arc.rotation.y = -Math.PI / 2; ar.add(arc);
        for (const [h, y] of [[0.035, 0.25], [0.035, 0.95]]) box(ar, M(0xd9cfbd), 0.012, h, 0.5, -0.305, y, dz, { cast: false });
        box(ar, M(0x9b8f7c), 0.012, 2.45, 0.006, -0.305, 0.02, -1.3 + 0.65 * i, { cast: false });
        sph(ar, brass(), 0.018, -0.33, 1.08, dz + (i % 2 ? -0.26 : 0.26), { cast: false });
      }
      // sanca com LED
      for (const [w, d, x, z] of [[2.3, 0.02, -0.1, -1.2], [0.02, 2.3, -1.1, -0.1], [0.02, 2.3, 0.8, -0.1]]) box(g, glow(0xffe1b0, 3), w, 0.008, d, x, H - 0.01, z, { cast: false });
      spots(g, [[0, 0.2]], H);
      door(g, { x: 0.3, z: 1.59, ry: Math.PI });
    },
    pois: [
      { p: [0, 0.9, -1.5], t: 'Painéis estofados', d: 'Cabeceira em painéis de topo arredondado, macia e lúdica.' },
      { p: [0.9, 1.6, -0.3], t: 'Armário com palhinha', d: 'Portas em arco com palhinha natural. ' + FEAT.person },
      { p: [-1.25, 1.7, -0.75], t: 'Decoração infantil', d: 'Móbile de balões, mesinha em forma de nuvem e cadeirinhas.' },
    ],
  },
  /* ------------------------------------------------ Áreas sociais */
  salao: {
    name: 'Salão de festas', group: 'Áreas sociais', h: 2.85,
    bounds: [-2.95, 2.95, -1.35, 3.25], sun: [7, 5, 1],
    build(g) {
      const W = 6.4, D = 7, H = 2.85;
      shell(g, { w: W, d: D, h: H, floor: porcelainFloor(W, D, '#ddd8cf'), walls: paint(0xf4f1ec) });
      brickWall(g, { w: 3.6, h: H, x: -1.4, z: -3.45 });
      // churrasqueira em alvenaria de tijolos
      const ch = solid(grp(g, -1.6, 0, -3.1));
      const bm = M(0xffffff, { map: rep(TX.brick(), 1, 2.4), roughness: 0.95 });
      box(ch, bm, 1.2, 0.95, 0.65, 0, 0, 0);
      box(ch, M(0x111111, { roughness: 0.9 }), 0.85, 0.55, 0.5, 0, 0.95, 0.02);
      for (const s of [-1, 1]) box(ch, bm, 0.18, 0.55, 0.65, s * 0.51, 0.95, 0);
      box(ch, bm, 1.2, H - 1.5, 0.65, 0, 1.5, 0);
      box(ch, glow(0xff6a20, 2.2), 0.7, 0.04, 0.35, 0, 0.97, 0.02, { cast: false });
      box(ch, metal(0x8a8c8e, 0.4), 0.8, 0.01, 0.4, 0, 1.12, 0.05, { cast: false });
      const fire = new THREE.PointLight(0xff7a30, 2.5, 3.5, 2); fire.position.set(0, 1.15, 0.45); ch.add(fire);
      box(g, M(0x1c1c1f, { roughness: 0.25 }), 3.4, 0.03, 0.6, -1.45, 0.9, -3.15);
      kitchenRun(g, { len: 2.2, x: 1.6, z: -3.2, upper: 'greige', base: 0xb5a998, counter: 0x1c1c1f, sinkAt: 0.3, h: H });
      fridge(g, { x: 3.05, z: -3.15, w: 0.6 });
      // balcão central com banquetas de couro
      const ilha = solid(grp(g, -1.2, 0, -1.9));
      box(ilha, M(0xffffff, { map: rep(TX.brick(), 2.5, 0.8), roughness: 0.95 }), 3.0, 0.92, 0.6, 0, 0, 0);
      box(ilha, M(0x16171a, { map: rep(TX.granite(), 2, 0.5), roughness: 0.2 }), 3.1, 0.04, 0.7, 0, 0.92, 0.03);
      for (const x of [-2.3, -1.6, -0.9, -0.2]) barStool(g, { x, z: -1.3, ry: Math.PI, seat: 0xb3693a, h: 0.68 });
      for (const x of [-2.2, -1.2, -0.2]) pendant(g, { x, z: -1.9, y: 1.75, ceil: H });
      // mesas
      for (const [x, z] of [[-1.7, 1.0], [1.2, 0.2], [0.3, 2.4]]) {
        roundTable(g, { x, z, r: 0.5, top: '#b98c5e' });
        around(x, z, 0.72, 4, 0.3, (o) => shellChair(g, o));
        pendant(g, { x, z, y: 1.9, ceil: H, light: 1.4 });
      }
      plant(g, { x: -2.85, z: -0.2, h: 1.6, potR: 0.24, seed: 5 });
      plant(g, { x: 2.8, z: 3.1, h: 1.3, potR: 0.2, pot: 0x2f2f30, seed: 7 });
      windowUnit(g, { x: 3.2, z: -0.6, ry: -Math.PI / 2, w: 1.4, h: 1.7, sill: 0.8, ceil: H });
      windowUnit(g, { x: 3.2, z: 1.9, ry: -Math.PI / 2, w: 1.4, h: 1.7, sill: 0.8, ceil: H });
      const sp = [];
      for (const x of [-2.2, -0.7, 0.8, 2.3]) for (const z of [-2.6, -0.4, 1.6, 3.0]) sp.push([x, z]);
      spots(g, sp, H);
      door(g, { x: -2.2, z: 3.49, ry: Math.PI });
    },
    pois: [
      { p: [-1.6, 1.7, -2.8], t: 'Churrasqueira', d: 'Churrasqueira em tijolinho com balcão gourmet.' },
      { p: [-1.2, 1.3, -1.9], t: 'Balcão gourmet', d: 'Balcão com banquetas para receber os convidados.', go: 'salao-a' },
      { p: [-2.2, 1.6, 3.4], t: 'Ir para o hall', d: 'Hall de entrada com elevador.', go: 'hall-a' },
    ],
  },
  hall: {
    name: 'Hall de entrada', group: 'Áreas sociais', h: 3.0, outdoor: 'sky', lightK: 0.45,
    bounds: [-0.75, 1.75, -1.95, 3.3], sun: [3, 6, 6],
    build(g) {
      const W = 4, H = 3.0;
      const inner = grp(g, 0, 0, -0.5);
      shell(inner, { w: W, d: 4, h: H, floor: M(0xffffff, { map: rep(TX.encaustic(), W / 0.8, 4 / 0.8), roughness: 0.35 }), walls: { n: null, s: null, e: paint(0xf2eee7), w: paint(0xf2eee7) } });
      // parede norte com o vão do elevador
      const nw = paint(0xf2eee7);
      plane(g, nw, 2.35, H, -0.825, H / 2, -2.5);
      plane(g, nw, 0.55, H, 1.725, H / 2, -2.5);
      plane(g, nw, 1.1, H - 2.2, 0.9, 2.2 + (H - 2.2) / 2, -2.5);
      ground(g, { w: W + 2, d: 2.4, z: 2.7, kind: 'pavers' });
      // escada
      const st = solid(grp(g, -1.45, 0, 0.6)), stone = M(0xf3f1ec, { roughness: 0.35 }), rise = 0.175, run = 0.28;
      for (let i = 0; i < 11; i++) {
        box(st, stone, 1.1, rise * (i + 1), run, 0, 0, -i * run);
        box(st, M(0xd8d3ca), 1.1, 0.006, 0.01, 0, rise * (i + 1) - 0.004, -i * run + run / 2, { cast: false });
      }
      const rl = [];
      for (let i = 0; i < 11; i += 1) rl.push([0.02, 0.9, 0.02, 0.56, rise * (i + 1), -i * run]);
      boxes(st, blackMetal(), rl);
      const hr = box(st, blackMetal(), 0.04, 0.04, 11 * run * 1.17, 0.56, 0, -5 * run, { cast: false });
      hr.position.y = 0.9 + rise * 6; hr.rotation.x = Math.atan2(rise, run);
      // elevador
      const ev = grp(g, 0.9, 0, -2.5), frame = woodM('#a97a50', 1, 2.5), steel = metal(0xc9cbcd, 0.25);
      box(ev, frame, 0.35, H, 0.3, -0.72, 0, 0.15);
      box(ev, frame, 0.35, H, 0.3, 0.72, 0, 0.15);
      box(ev, frame, 1.8, H - 2.2, 0.3, 0, 2.2, 0.15);
      box(ev, M(0xd9c7a8, { roughness: 0.5 }), 1.1, 2.2, 0.02, 0, 0, -0.95);
      box(ev, steel, 0.02, 2.2, 1.0, -0.54, 0, -0.45);
      box(ev, steel, 0.02, 2.2, 1.0, 0.54, 0, -0.45);
      box(ev, glow(0xfff0d8, 2.5), 0.9, 0.02, 0.8, 0, 2.18, -0.45, { cast: false });
      box(ev, M(0x8c8579, { roughness: 0.4 }), 1.1, 0.01, 1.0, 0, 0.001, -0.45, { cast: false });
      for (const s of [-1, 1]) box(ev, steel, 0.4, 2.2, 0.03, s * 0.52, 0, 0.24);
      box(ev, M(0x111111), 0.06, 0.12, 0.01, 0.7, 1.1, 0.305, { cast: false });
      const cab = new THREE.PointLight(0xfff0d8, 3, 3, 2); cab.position.set(0, 1.9, -0.4); ev.add(cab);
      // fachada de vidro com arcos
      const fr = blackMetal(), arch = grp(g, 0, 0, 1.5);
      for (const x of [-2, -0.67, 0.67, 2]) box(arch, fr, 0.07, H, 0.08, x, 0, 0);
      box(arch, fr, 4.1, 0.08, 0.08, 0, H - 0.08, 0);
      for (const cx of [-1.335, 0, 1.335]) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.635, 0.035, 8, 40, Math.PI), fr);
        t.position.set(cx, 2.2, 0); arch.add(t);
        if (cx !== 0) {
          plane(arch, glass(), 1.27, 2.2, cx, 1.1, 0);
          box(arch, fr, 1.27, 0.06, 0.06, cx, 1.0, 0);
          const s = new THREE.Mesh(new THREE.CircleGeometry(0.635, 40, 0, Math.PI), glass()); s.position.set(cx, 2.2, 0); arch.add(s);
        }
      }
      // lustre de cristal
      const lus = grp(g, 0.3, 0, 0.2), cr = M(0xffffff, { metalness: 0.2, roughness: 0.02, transparent: true, opacity: 0.6, emissive: 0xfff2dc, emissiveIntensity: 0.25 });
      cyl(lus, brass(), 0.006, 0.006, 0.6, 0, H - 0.6, 0, { cast: false });
      const cl = [];
      for (let ring = 0; ring < 5; ring++) for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2 + ring * 0.12, r = 0.34 - ring * 0.055; cl.push([0.01, 0.07, 0.01, Math.cos(a) * r, H - 0.8 - ring * 0.1 - (i % 3) * 0.025, Math.sin(a) * r]); }
      boxes(lus, cr, cl, { cast: false });
      const ll = new THREE.PointLight(0xffe2b0, 4, 6, 2); ll.position.set(0, H - 1.0, 0); lus.add(ll);
      frameArt(g, { x: 1.97, y: 1.85, z: -0.4, ry: -Math.PI / 2, seed: 2 });
      frameArt(g, { x: 1.97, y: 1.85, z: 0.4, ry: -Math.PI / 2, seed: 5 });
      plant(g, { x: 1.7, z: 1.15, h: 1.2, potR: 0.2, pot: 0x2f2f30, seed: 11 });
      spots(g, [[0.9, -1.6], [1.2, 0.8]], H);
    },
    pois: [
      { p: [0.9, 1.6, -2.4], t: 'Elevador', d: FEAT.elev },
      { p: [-1.45, 1.4, -0.6], t: 'Escada', d: 'Escada com guarda-corpo em metal preto.' },
      { p: [0.0, 2.2, 1.5], t: 'Fachada em arcos', d: 'Portas de vidro em arco com caixilhos pretos e piso em ladrilho hidráulico.', go: 'hall-b' },
      { p: [1.2, 1.5, 3.0], t: 'Ir para o salão de festas', d: 'Salão com churrasqueira e mesas.', go: 'salao-b' },
    ],
  },
  pet: {
    name: 'Área pet', group: 'Áreas sociais', h: 2.4, outdoor: 'sky',
    bounds: [-2.2, 2.0, -2.6, 2.7], sun: [-6, 9, 4],
    build(g) {
      ground(g, { w: 3.6, d: 6, x: -0.7, z: 0, kind: 'grass' });
      ground(g, { w: 1.4, d: 6, x: 1.8, z: 0, kind: 'conc' });
      ground(g, { w: 30, d: 30, z: 0, x: 0, kind: 'conc' }).position.y = -0.002;
      wallBlock(g, { w: 5, h: 2.4, x: 0, z: -3.0 });
      wallBlock(g, { w: 6, h: 2.4, x: -2.5, z: 0, ry: Math.PI / 2 });
      box(g, M(0xffffff, { map: rep(TX.concrete('#d9d5ce'), 3, 2), roughness: 0.9 }), 0.2, 3.5, 6, 2.6, 0, 0);
      windowUnit(g, { x: 2.49, z: -1.6, ry: -Math.PI / 2, w: 1.0, h: 1.2, sill: 1.1, curtains: false, view: 'city', lightK: 0 });
      wallLamp(g, { x: 0.3, z: -2.92 });
      wallLamp(g, { x: -2.42, z: 0.6, ry: Math.PI / 2 });
      bamboo(g, { x: 1.6, z: -2.5, n: 8, h: 2.8, seed: 3 });
      bamboo(g, { x: -2.1, z: -2.5, n: 5, h: 2.4, seed: 4 });
      bench(g, { x: 2.15, z: -0.2, ry: -Math.PI / 2, w: 1.6 });
      // circuito de agility: rampa e cone
      const ramp = solid(grp(g, -1.6, 0, 1.2, 0.25));
      rbox(ramp, M(0x3e7cc4, { roughness: 0.5 }), 0.7, 0.38, 1.1, 0.08, 0, 0, 0);
      const board = rbox(ramp, M(0x9a5038, { roughness: 0.7 }), 0.55, 0.06, 1.3, 0.02, 0, 0.3, -0.25); board.rotation.x = 0.35;
      cyl(g, M(0xf2c12e, { roughness: 0.5 }), 0.02, 0.14, 0.42, 0.1, 0, -1.1);
      box(g, M(0xf2c12e), 0.3, 0.02, 0.3, 0.1, 0, -1.1);
      sph(g, M(0xd9433a, { roughness: 0.4 }), 0.1, -0.5, 0.1, -0.6);
      sph(g, M(0xffffff), 0.101, -0.5, 0.1, -0.6, { s: [1, 0.3, 1] });
    },
    pois: [
      { p: [-1.6, 0.9, 1.2], t: 'Circuito pet', d: 'Gramado com rampa e brinquedos para os pets.' },
      { p: [2.1, 0.9, -0.2], t: 'Banco de descanso', d: 'Banco em madeira e concreto.' },
      { p: [1.5, 1.5, 2.4], t: 'Pet banho', d: 'Espaço para dar banho no seu pet.', go: 'pet-banho' },
      { p: [-0.5, 1.5, 2.6], t: 'Área kids', d: 'Playground com brinquedos.', go: 'kids-a' },
    ],
  },
  'pet-banho': {
    name: 'Pet banho', group: 'Áreas sociais', h: 2.6,
    bounds: [-0.9, 0.9, -0.3, 0.95], sun: [2, 5, 4],
    build(g) {
      const W = 2.4, D = 2.4, H = 2.6;
      shell(g, { w: W, d: D, h: H, floor: M(0xffffff, { map: rep(TX.concrete('#cfcac2'), 2), roughness: 0.6 }), walls: { n: M(0xffffff, { map: rep(TX.hex(), 2.4 / 0.6, 2.6 / 0.52), roughness: 0.3 }), s: paint(0xe9e5de), w: paint(0xe9e5de), e: M(0xd9d5ce, { roughness: 0.9 }) } });
      const tub = solid(grp(g, 0, 0, -0.85)), gr = M(0xffffff, { map: rep(TX.granite(), 1.5, 0.6), roughness: 0.25 });
      box(tub, gr, 1.2, 0.85, 0.65, 0, 0, 0);
      box(tub, M(0x0f1012, { roughness: 0.3 }), 1.0, 0.02, 0.45, 0, 0.85, 0.02, { cast: false });
      for (const [w, d, x, z] of [[1.2, 0.1, 0, -0.28], [1.2, 0.1, 0, 0.28], [0.1, 0.65, -0.55, 0], [0.1, 0.65, 0.55, 0]]) box(tub, gr, w, 0.06, d, x, 0.85, z);
      box(g, M(0x2b2d31, { roughness: 0.1, metalness: 0.4 }), 0.95, 0.55, 0.02, 0.05, 1.3, -1.19);
      const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.5, 1.15, -1.17), new THREE.Vector3(-0.62, 0.95, -1.1), new THREE.Vector3(-0.5, 1.2, -1.1), new THREE.Vector3(-0.45, 1.45, -1.12)]), 30, 0.012, 8), M(0x1d1d1f, { roughness: 0.4 }));
      g.add(hose);
      cyl(g, metal(), 0.02, 0.02, 0.16, -0.45, 1.45, -1.12);
      for (const [x, c] of [[0.35, 0x8a5a2b], [0.45, 0xe9e2d6], [0.52, 0x8a5a2b]]) cyl(g, M(c, { roughness: 0.2 }), 0.03, 0.03, 0.2, x, 0.91, -1.1);
      plane(g, M(0xffffff, { map: TX.paws(), transparent: true, roughness: 0.6 }), 0.5, 1.0, 1.19, 1.4, -0.2, { ry: -Math.PI / 2 });
      plane(g, M(0xffffff, { map: TX.paws(), transparent: true, roughness: 0.6 }), 0.5, 1.0, 1.19, 1.0, 0.6, { ry: -Math.PI / 2 });
      wallLamp(g, { x: -0.9, y: 1.95, z: -1.18 });
      plant(g, { x: 0.95, z: -0.95, h: 0.55, potR: 0.12, pot: 0x2f2f30, seed: 31 });
      spots(g, [[0, 0], [0, -0.8]], H);
      door(g, { x: 0.4, z: 1.19, ry: Math.PI });
    },
    pois: [
      { p: [0, 1.1, -0.85], t: 'Cuba de banho', d: 'Cuba em granito preto com ducha para o banho do pet.' },
      { p: [0.4, 1.6, 1.1], t: 'Voltar para a área pet', d: 'Gramado com circuito para os pets.', go: 'pet' },
    ],
  },
  kids: {
    name: 'Área kids', group: 'Áreas sociais', h: 2.6, outdoor: 'sky',
    bounds: [-1.75, 1.6, -3.0, 3.8], sun: [-5, 9, 3],
    build(g) {
      ground(g, { w: 1.6, d: 8, x: -1.2, z: 0, kind: 'grass' });
      ground(g, { w: 2.4, d: 8, x: 0.8, z: 0, kind: 'pavers' });
      ground(g, { w: 30, d: 30, kind: 'conc' }).position.y = -0.002;
      ivyWall(g, { w: 8, h: 2.7, x: 2.05, z: 0, ry: -Math.PI / 2 });
      wallBlock(g, { w: 8, h: 2.5, x: -2.0, z: 0, ry: Math.PI / 2, color: '#c9c5bd' });
      wallBlock(g, { w: 4.2, h: 2.5, x: 0, z: -4.0, color: '#c9c5bd' });
      box(g, M(0xffffff, { map: rep(TX.concrete('#d5d1c9'), 1, 2), roughness: 0.9 }), 0.4, 3.2, 0.4, -1.3, 0, -3.3);
      bamboo(g, { x: -1.6, z: -2.6, n: 9, h: 2.8, seed: 6 });
      bamboo(g, { x: -1.6, z: 1.2, n: 6, h: 2.3, seed: 7 });
      // gira-gira
      const gg = solid(grp(g, 0.6, 0, -2.9));
      cyl(gg, M(0x8a8a8a, { roughness: 0.6 }), 0.9, 0.9, 0.05, 0, 0, 0, { seg: 48 });
      cyl(gg, M(0xc8302b, { roughness: 0.45 }), 0.75, 0.75, 0.06, 0, 0.12, 0, { seg: 48 });
      cyl(gg, M(0x777777, { metalness: 0.6, roughness: 0.4 }), 0.05, 0.05, 0.12, 0, 0, 0);
      const ringT = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.02, 8, 48), M(0xc8302b, { roughness: 0.45 })); ringT.rotation.x = Math.PI / 2; ringT.position.y = 0.75; gg.add(ringT);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2, x = Math.cos(a) * 0.45, z = Math.sin(a) * 0.45;
        cyl(gg, M(0xc8302b, { roughness: 0.45 }), 0.015, 0.015, 0.57, Math.cos(a) * 0.55, 0.18, Math.sin(a) * 0.55);
        const seat = rbox(gg, M([0x2e6fb7, 0xf0c22e, 0x2e6fb7, 0x3a9b55][i], { roughness: 0.45 }), 0.32, 0.05, 0.22, 0.02, x * 0.6, 0.3, z * 0.6); seat.rotation.y = -a;
      }
      // cavalinho de mola
      const hz = solid(grp(g, 0.5, 0, 0.9, -0.4));
      cyl(hz, M(0x777777), 0.15, 0.15, 0.04, 0, 0, 0);
      const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 60 }, (_, i) => new THREE.Vector3(Math.cos(i * 0.6) * 0.09, 0.04 + i * 0.0055, Math.sin(i * 0.6) * 0.09))), 200, 0.012, 6), metal(0x9a9c9e, 0.35));
      coil.castShadow = true; hz.add(coil);
      const red = M(0xd2312b, { roughness: 0.35 });
      rbox(hz, red, 0.7, 0.2, 0.22, 0.08, 0, 0.38, 0);
      const neck = rbox(hz, red, 0.16, 0.42, 0.18, 0.06, 0.32, 0.48, 0); neck.rotation.z = -0.35;
      rbox(hz, red, 0.32, 0.17, 0.17, 0.06, 0.46, 0.8, 0);
      rbox(hz, red, 0.1, 0.26, 0.04, 0.03, -0.38, 0.38, 0);
      rbox(hz, M(0xf2c12e, { roughness: 0.4 }), 0.26, 0.05, 0.24, 0.02, -0.05, 0.58, 0);
      cyl(hz, M(0x2e6fb7), 0.015, 0.015, 0.3, 0.33, 0.62, 0, { rx: Math.PI / 2 }).position.set(0.33, 0.7, 0);
      for (const s of [-1, 1]) { sph(hz, M(0x111111), 0.02, 0.55, 0.86, s * 0.08); rbox(hz, red, 0.05, 0.1, 0.04, 0.01, 0.38, 0.88, s * 0.05); }
      // árvores além dos muros
      for (const [x, z, s] of [[-4, -6, 1.3], [1, -7, 1.5], [4, -5, 1.2], [-5, 2, 1.4]]) {
        cyl(g, M(0x4a3626), 0.12 * s, 0.18 * s, 3 * s, x, 0, z);
        for (let k = 0; k < 6; k++) sph(g, M(0x3f6a33, { roughness: 1 }), 1.1 * s, x + Math.cos(k) * 0.9 * s, 3.4 * s + (k % 2) * 0.6, z + Math.sin(k) * 0.9 * s);
      }
    },
    pois: [
      { p: [0.5, 1.2, 0.9], t: 'Cavalinho de mola', d: 'Brinquedos coloridos para os pequenos.' },
      { p: [0.6, 1.1, -2.9], t: 'Gira-gira', d: 'Área kids com piso intertravado e jardim vertical.' },
      { p: [2.0, 1.8, 0], t: 'Jardim vertical', d: 'Muro com trepadeira para deixar o espaço mais verde.' },
      { p: [-1.0, 1.5, 3.6], t: 'Área pet', d: 'Gramado e circuito para os pets.', go: 'pet' },
    ],
  },
};

// uma entrada por foto de referência: ambiente, ponto de vista e textos do menu
export const SHOTS = [
  { id: 't01-sala', env: 't01-estar', photo: 'assets/tipo01-sala-cozinha.webp', title: 'Cozinha e sala', sub: 'Tipo 01 · ambientes integrados', pos: [-0.35, 1.5, 2.15], look: [0.2, 1.15, -2.3] },
  { id: 't01-cozinha', env: 't01-estar', photo: 'assets/tipo01-cozinha.webp', title: 'Cozinha', sub: 'Tipo 01 · aéreos em madeira e geladeira embutida', pos: [1.55, 1.4, -0.95], look: [-2, 1.25, -0.85] },
  { id: 't01-varanda', env: 't01-varanda', photo: 'assets/tipo01-varanda.webp', title: 'Varanda e área de serviço', sub: 'Tipo 01 · churrasqueira e lavanderia', pos: [-1.05, 1.5, 0.6], look: [1.5, 1.2, -0.25], fov: 72 },
  { id: 't01-quarto-1', env: 't01-quarto1', photo: 'assets/tipo01-quarto-1.webp', title: 'Quarto 01', sub: 'Tipo 01 · marcenaria em nogueira', pos: [-0.15, 1.45, 1.35], look: [-0.15, 1.15, -1.5] },
  { id: 't01-quarto-2', env: 't01-quarto2', photo: 'assets/tipo01-quarto-2.webp', title: 'Quarto 02', sub: 'Tipo 01 · armário espelhado e boiserie', pos: [0.5, 1.5, 1.6], look: [-0.3, 1.05, -1.8] },
  { id: 't02-sala', env: 't02-estar', photo: 'assets/tipo02-cozinha-sala.webp', title: 'Cozinha e sala', sub: 'Tipo 02 · treliça e painel de madeira', pos: [0.25, 1.5, 2.05], look: [-0.25, 1.25, -2.3] },
  { id: 't02-cozinha', env: 't02-estar', photo: 'assets/tipo02-cozinha-v2.webp', title: 'Cozinha', sub: 'Tipo 02 · vidro canelado e torre de fornos', pos: [-1.0, 1.45, -0.85], look: [2.1, 1.25, -0.75] },
  { id: 't02-varanda', env: 't02-varanda', photo: 'assets/tipo02-sacadas.webp', title: 'Sacada com área de serviço', sub: 'Tipo 02 · churrasqueira e lavanderia', pos: [1.05, 1.5, 0.6], look: [-1.5, 1.2, -0.25], fov: 72 },
  { id: 't02-sacada', env: 't02-sacada-q1', photo: 'assets/tipo02-sacadas.webp', title: 'Sacada do quarto 01', sub: 'Tipo 02 · tijolo de vidro e guarda-corpo de vidro', pos: [0.75, 1.45, 0.85], look: [-0.4, 1.1, -0.95], fov: 78 },
  { id: 't02-quarto-01', env: 't02-quarto1', photo: 'assets/tipo02-quarto-01.webp', title: 'Quarto 01', sub: 'Tipo 02 · painel de madeira e cabeceira estofada', pos: [0.05, 1.45, 1.4], look: [0.05, 1.2, -1.6] },
  { id: 't03-sala', env: 't03-estar', photo: 'assets/tipo03-sala-cozinha.webp', title: 'Estar e cozinha', sub: 'Tipo 03 e 05 · ripado e bancada', pos: [-1.55, 1.55, 2.7], look: [0.7, 1.2, -2.6] },
  { id: 't03-cozinha', env: 't03-estar', photo: 'assets/tipo03-cozinha.webp', title: 'Cozinha', sub: 'Tipo 03 e 05 · área de serviço integrada', pos: [-0.45, 1.6, 0.2], look: [-0.35, 1.05, -3.05] },
  { id: 't03-tv', env: 't03-estar', photo: 'assets/tipo03-sala-tv.webp', title: 'Sala de TV', sub: 'Tipo 03 e 05 · forro com LED', pos: [-1.6, 1.5, -0.55], look: [2.15, 1.1, 1.6] },
  { id: 't03-quarto1-a', env: 't03-quarto1', photo: 'assets/tipo03-quarto1-a.webp', title: 'Quarto 1', sub: 'Tipo 03 e 05 · painel com frisos curvos', pos: [0.55, 1.35, 1.5], look: [-0.15, 0.95, -1.8] },
  { id: 't03-quarto1-b', env: 't03-quarto1', photo: 'assets/tipo03-quarto1-b.webp', title: 'Quarto 1, armário', sub: 'Tipo 03 e 05 · guarda-roupa de 3 portas', pos: [0.95, 1.45, 1.5], look: [-0.7, 1.1, -1.5] },
  { id: 't03-quarto2-a', env: 't03-quarto2', photo: 'assets/tipo03-quarto2-a.webp', title: 'Quarto 2', sub: 'Tipo 03 e 05 · infantil com sacada', pos: [0.95, 1.35, 1.35], look: [-0.9, 0.9, -1.0] },
  { id: 't03-quarto2-b', env: 't03-quarto2', photo: 'assets/tipo03-quarto2-b.webp', title: 'Quarto 2, mural', sub: 'Tipo 03 e 05 · prateleira com LED', pos: [0.3, 1.3, 1.4], look: [0.3, 1.15, -1.7] },
  { id: 't03-infantil', env: 't03-infantil', photo: 'assets/tipo03-infantil.webp', title: 'Quarto infantil', sub: 'Tipos 03 e 04 · painéis estofados e armário de palhinha', pos: [0.35, 1.4, 1.35], look: [-0.3, 1.05, -1.6] },
  { id: 'salao-a', env: 'salao', photo: 'assets/social-salao-a.webp', title: 'Salão de festas', sub: 'Churrasqueira e balcão gourmet', pos: [-0.4, 1.5, 0.9], look: [-1.3, 1.15, -3.5] },
  { id: 'salao-b', env: 'salao', photo: 'assets/social-salao-b.webp', title: 'Salão, mesas', sub: 'Mesas para receber', pos: [-2.6, 1.5, 3.1], look: [0.3, 1.2, -2.8] },
  { id: 'hall-a', env: 'hall', photo: 'assets/social-hall-a.webp', title: 'Hall de entrada', sub: 'Escada e elevador', pos: [0.45, 1.55, 1.3], look: [-0.25, 1.3, -2.5] },
  { id: 'hall-b', env: 'hall', photo: 'assets/social-hall-b.webp', title: 'Hall, fachada em arcos', sub: 'Portas de vidro e ladrilho hidráulico', pos: [0.0, 1.6, 3.25], look: [-0.1, 1.45, -2.0] },
  { id: 'pet', env: 'pet', photo: 'assets/social-pet.webp', title: 'Área pet', sub: 'Gramado e circuito pet', pos: [0.7, 1.5, 2.5], look: [-0.5, 0.7, -3] },
  { id: 'pet-banho', env: 'pet-banho', photo: 'assets/social-pet-banho.webp', title: 'Pet banho', sub: 'Cuba em granito com ducha', pos: [0.35, 1.45, 0.9], look: [0, 1.0, -1.2] },
  { id: 'kids-a', env: 'kids', photo: 'assets/social-kids-a.webp', title: 'Área kids', sub: 'Cavalinho e gira-gira', pos: [-0.5, 1.3, 2.4], look: [0.6, 0.6, -3.5] },
  { id: 'kids-b', env: 'kids', photo: 'assets/social-kids-b.webp', title: 'Área kids, jardim', sub: 'Jardim vertical e piso intertravado', pos: [-0.9, 1.5, 3.6], look: [0.9, 0.9, -3.6] },
];
