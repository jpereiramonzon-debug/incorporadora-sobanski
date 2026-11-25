// Auditoria de z-fighting de todos os ambientes do Tour 3D.
// Uso: (na raiz) python3 -m http.server 8123 &  e então  node tests/zfight-audit.js
// Lista pares de faces coplanares (mesma direção, < 0,4 mm de distância, sobreposição > 0,2 cm²).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto((process.env.URL || 'http://localhost:8123/') + 'tests/zfight.html', { waitUntil: 'commit' });
  await p.waitForFunction(() => window.__zf, null, { timeout: 300000 });
  const r = await p.evaluate(() => window.__zf);
  // "visíveis": materiais diferentes (ou com textura) -> a cor muda conforme o lado que vence a
  // disputa de profundidade, e a superfície pisca. Pares com o mesmo material liso pintam a mesma cor.
  let total = 0, harmless = 0;
  for (const [env, list] of Object.entries(r)) {
    const vis = list.filter((x) => !x.same); total += vis.length; harmless += list.length - vis.length;
    console.log(`\n${env}: ${vis.length} visível(is), ${list.length - vis.length} sem efeito (mesmo material)`);
    for (const x of vis.slice(0, 30)) console.log(`  ${String(x.areaCm2).padStart(8)} cm²  plano ${x.plane}  gap ${x.gapMm} mm  n=${x.normal}  ${x.pair}`);
  }
  console.log(`\nTOTAL: ${total} par(es) coplanares visíveis; ${harmless} sem efeito visual`);
  await b.close();
  process.exit(total ? 1 : 0);
})();
