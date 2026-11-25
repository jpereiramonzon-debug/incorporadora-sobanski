// Uso: node tests/qa-site.js [d|m]   (d = desktop 1366x768, m = celular Pixel 7). Requer Playwright.
// URL=http://localhost:8765/ node tests/qa-site.js d  para testar uma cópia local.
// Roteiro de testes do site publicado: cada transição medida do gatilho até o estado final.
const { chromium, devices } = require('playwright');
const URL = process.env.URL || 'https://incorporadora-sobanski.vercel.app/';
(async () => {
  const mob = process.argv[2] === 'm';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext(mob ? { ...devices['Pixel 7'], deviceScaleFactor: 1 } : { viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(240000);
  const errors = [], failed = [], results = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  p.on('pageerror', (e) => errors.push('PAGEERR ' + e.message));
  p.on('requestfailed', (r) => failed.push(r.url().replace(URL, '') + ' ' + r.failure()?.errorText));
  p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(URL)) failed.push(r.status() + ' ' + r.url().replace(URL, '')); });
  await p.addInitScript(() => {
    window.__f = []; window.__lt = [];
    const loop = (t) => { window.__f.push(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true });
    window.__fcp = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.name === 'first-contentful-paint') window.__fcp = e.startTime; })).observe({ type: 'paint', buffered: true });
  });
  const now = () => p.evaluate(() => performance.now());
  async function step(name, action, doneFn, arg) {
    const t0 = await now();
    try {
      await action();
      await p.waitForFunction(doneFn, arg, { timeout: 60000 });
      const t1 = await now();
      const m = await p.evaluate(([a, z]) => {
        const f = window.__f.filter((t) => t >= a && t <= z); const g = [];
        for (let i = 1; i < f.length; i++) g.push(f[i] - f[i - 1]);
        g.sort((x, y) => x - y);
        const lt = window.__lt.filter(([s]) => s >= a && s <= z);
        return { frames: f.length, worstFrame: Math.round(g[g.length - 1] || 0), jank50: g.filter((x) => x > 50).length, longTasks: lt.length, longTaskMs: Math.round(lt.reduce((s, [, d]) => s + d, 0)) };
      }, [t0, t1]);
      results.push({ name, ms: Math.round(t1 - t0), ...m });
    } catch (e) { results.push({ name, FAIL: e.message.split('\n')[0].slice(0, 120) }); }
  }
  const tl = await now();
  await p.goto(URL, { waitUntil: 'load' });
  results.push({ name: 'carregamento (load)', ms: Math.round((await now()) - tl), fcp: Math.round(await p.evaluate(() => window.__fcp)) });
  await step('abertura: letras começam', async () => {}, () => document.querySelector('#intro.go'));
  await step('abertura: até o prédio aparecer', async () => {}, () => document.querySelector('#intro.out'));
  await step('abertura: título SANTA ANA', async () => {}, () => document.querySelector('#introTitle.on'));
  await step('abertura: título do topo + controles', async () => {}, () => document.querySelector('.hero.title-in'));
  await p.waitForTimeout(6000); // pré-carregamento em segundo plano
  await step('unidade: clicar andar 2 → cartão aberto', () => p.click('#floors button[data-k="2"]'), () => document.getElementById('unitCard').classList.contains('on'));
  await step('unidade: voo termina (estúdio parado)', async () => {}, () => !document.documentElement.classList.contains('x') && document.querySelector('#unitSwitch.on'));
  await p.waitForTimeout(800);
  await step('unidade: trocar 201 → 203', () => p.click('#usUnits button[data-unit="203"]'), () => /203/.test(document.querySelector('#unitCard h2')?.textContent || ''));
  await p.waitForTimeout(1200);
  await step('unidade: andar ↑ (303)', () => p.click('#unitSwitch [data-step="1"]'), () => /303/.test(document.querySelector('#unitCard h2')?.textContent || ''));
  await p.waitForTimeout(1200);
  await step('planta: abrir tela cheia', () => p.click('.uc-plan'), () => document.getElementById('planView').classList.contains('on'));
  await step('planta: fechar (Esc)', () => p.keyboard.press('Escape'), () => document.getElementById('planView').hidden);
  await step('unidade: voltar ao prédio', () => p.click('#unitBack'), () => document.getElementById('unitBack').hidden);
  await step('chat: abrir WhatsApp guiado', () => p.click('.wa-fab'), () => !document.querySelector('.wa-panel')?.hidden);
  await p.keyboard.press('Escape'); await p.click('.wa-fab').catch(() => {});
  await p.waitForTimeout(600);
  // rolagem pelo site inteiro
  const scrollStart = await now();
  if (mob) { for (let i = 0; i < 40; i++) { await p.evaluate(() => scrollBy(0, 420)); await p.waitForTimeout(90); } }
  else { await p.mouse.move(600, 400); for (let i = 0; i < 80; i++) { await p.mouse.wheel(0, 220); await p.waitForTimeout(60); } }
  await p.waitForTimeout(800);
  const sc = await p.evaluate(([a]) => { const f = window.__f.filter((t) => t >= a); const g = []; for (let i = 1; i < f.length; i++) g.push(f[i] - f[i - 1]); g.sort((x, y) => x - y); const lt = window.__lt.filter(([s]) => s >= a); return { frames: f.length, p95: Math.round(g[Math.floor(g.length * 0.95)] || 0), worstFrame: Math.round(g[g.length - 1] || 0), jank50: g.filter((x) => x > 50).length, longTasks: lt.length, reached: Math.round(scrollY) }; }, [scrollStart]);
  results.push({ name: 'rolagem pelo site', ms: Math.round((await now()) - scrollStart), ...sc });
  // tour 3D
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  await step('tour: abrir a partir do site', () => p.click('.tour-cta'), () => location.pathname.includes('tour') && document.getElementById('welcome') && !document.getElementById('welcome').hidden);
  await step('tour: primeiro ambiente pronto', async () => {}, () => !document.getElementById('loading').classList.contains('on'));
  await step('tour: escolher Tipo 02', () => p.click('[data-go="t02-sala"]'), () => !document.getElementById('loading').classList.contains('on'));
  await step('tour: próxima foto (mesmo ambiente)', () => p.click('#nextShot'), () => location.hash === '#t02-cozinha' && !document.getElementById('loading').classList.contains('on'));
  await step('tour: trocar de ambiente (quarto)', () => p.evaluate(() => { location.hash = 't02-quarto-01'; }), () => !document.getElementById('loading').classList.contains('on') && location.hash === '#t02-quarto-01');
  console.log(JSON.stringify({ mode: mob ? 'celular (Pixel 7)' : 'desktop 1366x768', results, errors: errors.slice(0, 10), failed: failed.slice(0, 10) }, null, 1));
  await b.close();
})();
