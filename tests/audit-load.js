// Auditoria de carregamento: celular (Pixel 7) com rede 4G lenta (1,6 Mbps, 150 ms) e CPU 4x mais lenta.
// Uso: node tests/audit-load.js [URL]   (padrão: site publicado). Mede bytes por tipo, cascata de rede,
// tempos da abertura (letras, prédio pronto, prédio revelado) e tarefas longas na thread principal.
const { chromium, devices } = require('playwright');
const URL = process.argv[2] || 'https://incorporadora-sobanski.vercel.app/';
const TOUR = URL.replace(/\/?(index\.html)?(\?.*)?$/, '/tour.html');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const run = async (url, ready) => {
    const ctx = await b.newContext({ ...devices['Pixel 7'] });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
    await p.addInitScript(() => {
      window.__lt = []; window.__m = {};
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__m[e.name] = e.startTime; })).observe({ type: 'paint', buffered: true });
      const mark = (k, sel) => { const t = setInterval(() => { if (document.querySelector(sel)) { window.__m[k] = performance.now(); clearInterval(t); } }, 16); };
      addEventListener('DOMContentLoaded', () => { mark('intro letters', '.intro.go'); mark('3d module ready', '.hero.ready'); mark('building revealed', '.hero.intro-reveal'); mark('tour first scene', 'body.tour #loading:not(.on)'); });
    });
    await p.goto(url, { waitUntil: 'load', timeout: 180000 });
    await p.waitForFunction(ready, null, { timeout: 180000 }).catch(() => {});
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => ({
      m: window.__m,
      lt: window.__lt,
      res: performance.getEntriesByType('resource').map((e) => ({ n: e.name.replace(location.origin + '/', ''), t: e.initiatorType, s: Math.round(e.startTime), e: Math.round(e.responseEnd), tx: e.transferSize, enc: e.encodedBodySize, dec: e.decodedBodySize })),
      nav: (() => { const n = performance.getEntriesByType('navigation')[0]; return { ttfb: Math.round(n.responseStart), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), html: n.encodedBodySize }; })(),
      heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
    }));
    await ctx.close();
    return { ...r, errs };
  };
  for (const [name, url, ready] of [['site', URL, () => document.querySelector('.hero.intro-reveal')], ['tour', TOUR, () => document.querySelector('#loading:not(.on)')]]) {
    const r = await run(url, ready);
    const kind = (n) => /\.(js)(\?|$)/.test(n) ? 'js' : /\.css/.test(n) ? 'css' : /\.woff2/.test(n) ? 'font' : /\.(webp|avif|jpg|png)/.test(n) ? 'img' : 'other';
    const by = {}; for (const x of r.res) { const k = kind(x.n); by[k] = by[k] || { n: 0, tx: 0, dec: 0 }; by[k].n++; by[k].tx += x.tx; by[k].dec += x.dec; }
    const until = r.m['building revealed'] || r.m['tour first scene'] || 1e9;
    const lt = r.lt.filter(([s]) => s < until);
    console.log(`\n===== ${name}: ${url}`);
    console.log('nav', r.nav, 'heap MB', r.heap);
    console.log('marcos (ms):', Object.fromEntries(Object.entries(r.m).map(([k, v]) => [k, Math.round(v)])));
    console.log('bytes por tipo (transferido / descomprimido, KB):', Object.fromEntries(Object.entries(by).map(([k, v]) => [k, `${v.n} arq · ${(v.tx / 1024).toFixed(0)} / ${(v.dec / 1024).toFixed(0)}`])));
    console.log(`tarefas longas até o marco final: ${lt.length}, soma ${Math.round(lt.reduce((a, [, d]) => a + d, 0))} ms, maior ${Math.round(Math.max(0, ...lt.map(([, d]) => d)))} ms`);
    console.log('recursos (início→fim ms, KB transferidos):');
    for (const x of r.res.sort((a, b) => a.s - b.s)) console.log(`  ${String(x.s).padStart(6)}→${String(x.e).padStart(6)} ${(x.tx / 1024).toFixed(1).padStart(7)} KB  ${x.n.slice(0, 90)}`);
    console.log('erros', r.errs);
  }
  await b.close();
})();
