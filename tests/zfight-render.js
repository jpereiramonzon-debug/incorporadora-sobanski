// Auditoria de z-fighting por renderização (verdade de campo, considera visibilidade).
// Uso: python3 -m http.server 8123 &   e então   node tests/zfight-render.js [near] [far]
const { chromium } = require('playwright');
(async () => {
  const [near = '0.05', far = '100', extra = ''] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto(`${process.env.URL || 'http://localhost:8123/'}tests/zfight-render.html?near=${near}&far=${far}${extra ? '&' + extra : ''}`, { waitUntil: 'commit' });
  await p.waitForFunction(() => window.__zr, null, { timeout: 1800000, polling: 2000 });
  const r = await p.evaluate(() => window.__zr);
  let bad = 0;
  if (r.__dbg?.length) console.log(r.__dbg.join('\n'));
  for (const [env, x] of Object.entries(r).filter(([k]) => !k.startsWith('__'))) {
    bad += x.badPixels;
    console.log(`\n${env}: ${x.views} vistas, ${x.badPixels} px de z-fighting em área (${x.ppm} por milhão); ${x.seamPixels} px em linhas de contato`);
    for (const [k, n] of x.pairs.slice(0, 12)) console.log(`  ${String(n).padStart(7)} px  ${k}`);
  }
  console.log(`\nTOTAL: ${bad} pixels com z-fighting`);
  await b.close();
  process.exit(bad ? 1 : 0);
})();
