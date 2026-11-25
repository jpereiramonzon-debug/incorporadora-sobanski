// Gera imagens de cima das plantas 3D ao lado da planta oficial. Uso: python3 -m http.server 8123 & ; node tests/plantas-topo.js PASTA
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2] || '.';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const id of ['t01', 't02', 't03', 't04', 't05']) {
    const p = await b.newPage(); p.on('pageerror', (e) => console.log(id, e.message));
    await p.goto(`http://localhost:8123/tests/plantas-topo.html?p=${id}`);
    await p.waitForFunction(() => window.__ok, null, { timeout: 120000 });
    await (await p.$('canvas')).screenshot({ path: `${out}/topo_${id}.png` });
    await p.close();
  }
  await b.close();
})();
