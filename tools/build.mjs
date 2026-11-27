// Build de produção (esbuild): gera dist/ com
//  - JS empacotado, minificado e com tree-shaking (Three.js, GSAP e Lenis vindos do npm, versões fixas);
//  - code splitting: entrada do site, maquete 3D, camada cinematográfica e Tour 3D em pedaços
//    independentes; o que é comum (Three.js) fica num pedaço compartilhado entre site e tour;
//  - nomes com hash de conteúdo -> cache imutável de 1 ano (o HTML continua sempre revalidado);
//  - CSS minificado e com hash; HTML com os preloads certos para cada página.
// Uso: npm run build            (gera dist/)
//      npm run dev              (gera e serve dist/ em http://localhost:8080, recompilando ao salvar)
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { brotliCompressSync, constants } from 'node:zlib';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'dist');
const serve = process.argv.includes('--serve');
const hash = (buf) => createHash('sha256').update(buf).digest('base64url').slice(0, 10);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const brSize = (buf) => brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

async function build() {
  const t0 = performance.now();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  // ---------- JavaScript ----------
  const js = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: { site: 'js/main.js', tour: 'js/tour/player.js' },
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    target: ['chrome100', 'safari15', 'firefox100', 'edge100'],
    outdir: join(OUT, 'js'),
    entryNames: '[name]-[hash]',
    chunkNames: '[name]-[hash]',
    legalComments: 'eof',
    // imagens que têm versão AVIF (geradas por tools/avif.py); o resto segue em WebP
    define: { __AVIF__: JSON.stringify(readdirSync(join(ROOT, 'assets')).filter((f) => f.endsWith('.avif')).map((f) => f.slice(0, -5)).sort()) },
    metafile: true,
    logLevel: 'warning',
  });
  const outputs = js.metafile.outputs;
  const rel = (p) => relative(OUT, join(ROOT, p)).split('\\').join('/');
  const entryOf = (src) => Object.keys(outputs).find((o) => outputs[o].entryPoint === src);
  // imports estáticos (recursivos) de um pedaço: viram modulepreload, baixados em paralelo
  const staticDeps = (o, seen = new Set()) => {
    for (const i of outputs[o].imports) if (i.kind === 'import-statement' && !seen.has(i.path)) { seen.add(i.path); staticDeps(i.path, seen); }
    return seen;
  };
  const dynDeps = (o) => outputs[o].imports.filter((i) => i.kind === 'dynamic-import').map((i) => i.path);
  const site = entryOf('js/main.js'), tour = entryOf('js/tour/player.js');
  // o pedaço da maquete 3D (import dinâmico de building.js) é pré-carregado logo no início
  const building = Object.keys(outputs).find((o) => outputs[o].entryPoint === 'js/building.js') || dynDeps(site).find((p) => /building/.test(p));
  const sitePre = [...staticDeps(site)];
  const buildingPre = building ? [building, ...staticDeps(building)] : [];
  const tourPre = [tour, ...staticDeps(tour)];

  // ---------- CSS (minificado, mantém os caminhos de fontes/imagens) ----------
  const css = {};
  for (const f of ['styles.css', 'tour.css']) {
    const { code } = await esbuild.transform(readFileSync(join(ROOT, f), 'utf8'), { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] });
    const name = f.replace('.css', `-${hash(code)}.css`);
    writeFileSync(join(OUT, name), code);
    css[f] = name;
  }

  // ---------- arquivos estáticos ----------
  cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true });

  // ---------- HTML ----------
  const pre = (list, extra = '') => list.map((p) => `<link rel="modulepreload" href="${rel(p)}"${extra}>`).join('\n');
  const page = (file, { entry, preloads, meta = '' }) => {
    let h = readFileSync(join(ROOT, file), 'utf8');
    h = h.replace(/<script type="importmap">[\s\S]*?<\/script>\n?/g, '')
      .replace(/<!--[^>]*baixa o 3D[^>]*-->\n?/g, '')
      .replace(/<link rel="modulepreload"[^>]*>\n?/g, '')
      .replace(/<script[^>]*src="(vendor|js)\/[^"]*"[^>]*><\/script>\n?/g, '')
      .replace(/<link rel="stylesheet" href="(styles|tour)\.css[^"]*">/g, (_, n) => `<link rel="stylesheet" href="${css[`${n}.css`]}">`);
    const head = `${meta}${preloads}\n<script type="module" src="${rel(entry)}"></script>\n`;
    h = h.replace('</head>', `${head}</head>`);
    writeFileSync(join(OUT, file), h);
    return h;
  };
  page('index.html', {
    entry: site,
    // só a entrada é pré-carregada no HTML: as fontes e ela chegam primeiro e as letras da abertura
    // começam o quanto antes. A maquete 3D (lista abaixo) é pedida pela entrada assim que as fontes
    // chegam, com todos os pedaços em paralelo (sem cascata); o Tour 3D, na intenção de clique.
    preloads: pre([site, ...sitePre]),
    meta: `<meta name="sb-3d" content="${buildingPre.map(rel).join(',')}">\n<meta name="sb-tour" content="${tourPre.map(rel).join(',')}">\n`,
  });
  page('tour.html', { entry: tour, preloads: pre(tourPre) });

  // ---------- cabeçalhos de cache para Cloudflare Pages (mesmas regras do vercel.json) ----------
  writeFileSync(join(OUT, '_headers'), [
    '/js/*', '  Cache-Control: public, max-age=31536000, immutable',
    '/styles-*', '  Cache-Control: public, max-age=31536000, immutable',
    '/tour-*', '  Cache-Control: public, max-age=31536000, immutable',
    '/assets/*', '  Cache-Control: public, max-age=0, must-revalidate',
    '/assets/fonts/*', '  ! Cache-Control', '  Cache-Control: public, max-age=31536000, immutable', '',
  ].join('\n'));

  // ---------- relatório ----------
  const size = (o) => statSync(join(ROOT, o)).size;
  const br = (o) => brSize(readFileSync(join(ROOT, o)));
  console.log(`\nbuild em ${Math.round(performance.now() - t0)} ms`);
  for (const o of Object.keys(outputs).filter((o) => o.endsWith('.js')).sort((a, b) => size(b) - size(a))) {
    const tag = o === site ? 'entrada do site' : o === tour ? 'entrada do tour' : o === building ? 'maquete 3D' : outputs[o].entryPoint ? outputs[o].entryPoint : 'compartilhado';
    console.log(`  ${rel(o).padEnd(34)} ${kb(size(o)).padStart(10)}  ${kb(br(o)).padStart(9)} br  ${tag}`);
  }
  for (const [f, n] of Object.entries(css)) console.log(`  ${n.padEnd(34)} ${kb(statSync(join(OUT, n)).size).padStart(10)}  ${kb(brSize(readFileSync(join(OUT, n)))).padStart(9)} br`);
}
await build();

if (serve) {
  const { createServer } = await import('node:http');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.bin': 'application/octet-stream' };
  createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = join(OUT, p);
    if (!f.startsWith(OUT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': types[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
    res.end(readFileSync(f));
  }).listen(8080, () => console.log('\nservindo dist/ em http://localhost:8080'));
  let timer = 0;
  const { watch } = await import('node:fs');
  for (const d of ['js', 'assets']) watch(join(ROOT, d), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => build().catch((e) => console.error(e.message)), 150); });
  for (const f of ['index.html', 'tour.html', 'styles.css', 'tour.css']) watch(join(ROOT, f), () => { clearTimeout(timer); timer = setTimeout(() => build().catch((e) => console.error(e.message)), 150); });
}
