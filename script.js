(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Fachada ilustrada (SVG) ---------- */
  const floors = [100, 195, 290];
  const P = 'var(--p)';

  const trees = (dark) => {
    const c = dark ? ['#06080f', '#06080f', '#06080f'] : ['#2f4a33', '#3d5c3c', '#4b3a2a'];
    const blob = (x, y, r, f) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${f}"/>`;
    return `<rect x="52" y="330" width="7" height="80" fill="${c[2]}"/><rect x="545" y="320" width="7" height="90" fill="${c[2]}"/>` +
      blob(20, 330, 62, c[0]) + blob(78, 300, 58, c[1]) + blob(110, 350, 44, c[0]) +
      blob(585, 310, 66, c[0]) + blob(520, 290, 54, c[1]) + blob(488, 350, 40, c[0]);
  };
  const palm = (dark) => {
    const g = dark ? '#06080f' : '#3f6a3d', t = dark ? '#06080f' : '#6b5238';
    const frond = (dx, dy) => `<path d="M262 338 q${dx / 2} ${dy - 22} ${dx} ${dy}" stroke="${g}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    return `<path d="M259 400 q2 -32 3 -62" stroke="${t}" stroke-width="7" fill="none"/>` +
      frond(-52, 10) + frond(-40, -14) + frond(-14, -30) + frond(18, -28) + frond(44, -10) + frond(54, 14) + frond(-30, 26) + frond(32, 28);
  };
  const win = (x, y, w, h, lit) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${lit ? 'url(#warm)' : '#27303a'}" stroke="#17171a" stroke-width="2.5"/>` +
    `<path d="M${x + w / 2} ${y}v${h}M${x} ${y + h * 0.3}h${w}" stroke="#17171a" stroke-width="1.6"/>`;
  const windows = (lit) => floors.map((fy, i) =>
    win(176, fy + 18, 48, 74, lit) +
    (lit && i === 1 ? '' : win(290, fy + 20, 48, 60, lit)) +
    win(372, fy + 20, 48, 60, lit)).join('');
  const railings = floors.map((fy) => {
    let bars = '';
    for (let x = 164; x <= 236; x += 6) bars += `M${x} ${fy + 68}v24`;
    return `<rect x="158" y="${fy + 92}" width="84" height="4" fill="#3d3a36"/><path d="M160 ${fy + 68}h80${bars}" stroke="#121214" stroke-width="1.5" fill="none"/>`;
  }).join('');
  const strips = (w, extra = '') => [195, 290, 385].map((y) => `<path d="M150 ${y}h300" stroke="#ffdca6" stroke-width="${w}" ${extra}/>`).join('') +
    `<path d="M150 104h92" stroke="#ffdca6" stroke-width="${w}" ${extra}/>`;
  let blocks = '';
  for (let y = 112; y < 380; y += 9) blocks += `M244 ${y}h16`;

  document.getElementById('building').innerHTML = `
<svg viewBox="0 0 600 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c9"/><stop offset="1" stop-color="#f0a850"/></linearGradient>
    <linearGradient id="cone" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd596" stop-opacity=".85"/><stop offset="1" stop-color="#ffd596" stop-opacity="0"/></linearGradient>
    <filter id="glow" x="-20%" y="-400%" width="140%" height="900%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>

  ${trees(false)}
  <rect x="150" y="100" width="300" height="300" fill="#bdb5a8"/>
  <rect x="150" y="100" width="92" height="300" fill="#a39b8f"/>
  ${floors.map((fy) => `<rect x="160" y="${fy + 8}" width="80" height="87" fill="#8e877c"/>`).join('')}
  <rect x="142" y="82" width="316" height="20" fill="#57524c"/><rect x="146" y="102" width="308" height="5" fill="#6f6961"/>
  <rect x="244" y="108" width="16" height="277" fill="#8f9793"/><path d="${blocks}M252 108v277" stroke="#737b78" stroke-width="1"/>
  ${windows(false)}
  <rect x="40" y="400" width="520" height="72" fill="#c9c0b2"/><rect x="40" y="396" width="520" height="6" fill="#9c9488"/>
  <rect x="62" y="412" width="84" height="60" fill="#2a2a2d"/><rect x="154" y="412" width="42" height="60" fill="#2a2a2d"/>
  <rect x="212" y="410" width="176" height="52" fill="#e3dbcd"/>
  <text x="300" y="443" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="19" fill="#3a332a">Edifício Santa Ana</text>
  <rect x="468" y="408" width="62" height="64" fill="#35322e"/><rect x="476" y="416" width="46" height="56" fill="#8e877c"/>
  <path d="M480 416v56M490 416v56M500 416v56M510 416v56" stroke="#2a2a2d" stroke-width="2"/>
  ${palm(false)}
  <rect x="0" y="472" width="600" height="48" fill="#8f8a82"/><rect x="0" y="472" width="600" height="3" fill="#6f6a63"/>

  <g style="opacity:calc(${P}*.74)">
    ${trees(true)}
    <rect x="142" y="82" width="316" height="320" fill="#06080f"/><rect x="40" y="396" width="520" height="76" fill="#06080f"/>
    ${palm(true)}<rect x="0" y="472" width="600" height="48" fill="#06080f"/>
  </g>

  <g style="opacity:${P}">
    <ellipse cx="300" cy="250" rx="190" ry="150" fill="#ffb960" opacity=".16" filter="url(#soft)"/>
    ${floors.map((fy) => `<rect x="160" y="${fy + 8}" width="80" height="87" fill="#d9a260" opacity=".45"/>`).join('')}
    ${windows(true)}
    <rect x="244" y="108" width="16" height="277" fill="#ffe2b0"/><path d="${blocks}M252 108v277" stroke="#c99753" stroke-width="1"/>
    <rect x="240" y="108" width="24" height="277" fill="#ffd596" opacity=".5" filter="url(#glow)"/>
    ${strips(8, 'opacity=".7" filter="url(#glow)"')}${strips(2.5)}
    <rect x="212" y="410" width="176" height="52" fill="#f3dfbd" opacity=".9"/>
    <text x="300" y="443" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-style="italic" font-size="19" fill="#3a2a12">Edifício Santa Ana</text>
    ${[52, 150, 200, 400, 455, 542].map((x) => `<path d="M${x} 472l-11 -58h22z" fill="url(#cone)"/>`).join('')}
    <ellipse cx="80" cy="330" rx="40" ry="50" fill="#ffc77a" opacity=".2" filter="url(#soft)"/>
    <ellipse cx="530" cy="320" rx="40" ry="50" fill="#ffc77a" opacity=".2" filter="url(#soft)"/>
    <path d="M0 474h600" stroke="#ffd596" stroke-width="1.5" opacity=".5"/>
  </g>
  ${railings}
</svg>`;

  /* ---------- Rolagem: entardecer, menu e linha do tempo ---------- */
  const wrap = document.getElementById('cena');
  const scene = wrap.querySelector('.scene');
  const clock = document.getElementById('clock');
  const nav = document.getElementById('nav');
  const timeline = document.getElementById('timeline');
  const steps = [...timeline.querySelectorAll('.tl-step')];
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const r = wrap.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    const eased = clamp((p - 0.08) / 0.8);
    scene.style.setProperty('--p', eased.toFixed(3));
    const mins = 16 * 60 + 30 + Math.round(eased * 180);
    clock.textContent = `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
    nav.classList.toggle('solid', r.bottom < 80);

    const t = timeline.getBoundingClientRect();
    const tp = clamp((vh * 0.7 - t.top) / (t.height * 0.75));
    timeline.style.setProperty('--t', tp.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle('on', tp >= i * 0.42 + 0.02));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  /* ---------- Revelar ao rolar ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  /* ---------- Diferenciais ---------- */
  const icon = (d) => `<svg viewBox="0 0 32 32" aria-hidden="true">${d}</svg>`;
  const details = [
    ['Elevador', 'Mais comodidade no dia a dia.',
      '<rect x="7" y="4" width="18" height="24" rx="1.5"/><path d="M16 4v24M10.5 14l2-3 2 3M17.5 18l2 3 2-3"/>'],
    ['Forro de gesso', 'Acabamento moderno e ambientes ainda mais valorizados.',
      '<path d="M4 7h24M7 7v5h18V7M11 12v4h10v-4M16 16v5M12 25a4 4 0 0 1 8 0z"/>'],
    ['Infraestrutura para ar-condicionado', 'Mais praticidade para o seu dia.',
      '<rect x="4" y="7" width="24" height="10" rx="2"/><path d="M8 13h16M10 21c0 2-1 2-1 4M16 21c0 2-1 2-1 4M22 21c0 2-1 2-1 4"/>'],
    ['Piso aquecido', 'Mais conforto nos banheiros.',
      '<path d="M4 26h24M4 22h24M10 17c-2-3 2-4 0-8M16 17c-2-3 2-4 0-8M22 17c-2-3 2-4 0-8"/>'],
    ['Personalização durante a obra', 'Mais liberdade para deixar o seu apartamento com a sua cara.',
      '<path d="M6 26l3-8L22 5l5 5-13 13zM19 8l5 5M6 6l8 8M22 22l4 4"/>'],
  ];
  const list = document.getElementById('detailList');
  const stage = document.getElementById('detailStage');
  list.innerHTML = details.map(([t, d], i) =>
    `<li role="presentation"><button role="tab" aria-selected="${i === 0}" aria-controls="detailStage" data-i="${i}"><small>0${i + 1}</small><span>${t}</span><p>${d}</p></button></li>`).join('');
  const tabs = [...list.querySelectorAll('button')];
  let current = -1;
  const select = (i) => {
    if (i === current) return;
    current = i;
    tabs.forEach((b, j) => b.setAttribute('aria-selected', j === i));
    document.getElementById('stageNum').textContent = `0${i + 1}`;
    document.getElementById('stageIcon').innerHTML = icon(details[i][2]);
    document.getElementById('stageTitle').textContent = details[i][0];
    document.getElementById('stageText').textContent = details[i][1];
    stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap');
  };
  tabs.forEach((b) => {
    const i = +b.dataset.i;
    b.addEventListener('click', () => select(i));
    b.addEventListener('mouseenter', () => select(i));
    b.addEventListener('focus', () => select(i));
  });
  select(0);

  /* ---------- Mensagem guiada ---------- */
  const form = document.getElementById('builder');
  const msg = document.getElementById('msg');
  const hint = document.getElementById('hint');
  const compose = () => {
    const f = new FormData(form);
    const vals = f.getAll('val');
    const liked = vals.length
      ? ` O que mais valorizo: ${vals.length > 1 ? `${vals.slice(0, -1).join(', ')} e ${vals.at(-1)}` : vals[0]}.`
      : '';
    msg.textContent = `Olá! Conheci o Edifício Santa Ana pelo site. Tenho interesse em ${f.get('obj')} e gostaria de conhecer ${f.get('tipo')}.${liked} Podem me enviar mais informações?`;
  };
  form.addEventListener('change', compose);
  compose();
  document.getElementById('send').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(msg.textContent);
      hint.textContent = 'Mensagem copiada. É só colar na conversa do Instagram.';
    } catch {
      hint.textContent = 'Copie a mensagem acima e cole na conversa do Instagram.';
    }
    window.open('https://ig.me/m/sobanski.incorporadora', '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
