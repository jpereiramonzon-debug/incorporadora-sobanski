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

  const buildingSVG = `
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
  document.getElementById('building').innerHTML = buildingSVG;

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


  /* ---------- Visita por andar ---------- */
  // Edite aqui o que aparece em cada andar (título, texto e opção do formulário).
  const levels = [
    { k: '3', floor: '3º andar', title: 'Apartamento Tipo 03', tipo: 'o Apartamento Tipo 03', box: [142, 100, 316, 95],
      text: 'No último andar, com a vista mais aberta do edifício e a luz do entardecer entrando pela sala.' },
    { k: '2', floor: '2º andar', title: 'Apartamento Tipo 02', tipo: 'o Apartamento Tipo 02', box: [142, 195, 316, 95],
      text: 'No meio do edifício, com acesso pelo elevador e todo o conforto dos acabamentos do Santa Ana.' },
    { k: '1', floor: '1º andar', title: 'Apartamento Tipo 01', tipo: 'o Apartamento Tipo 01', box: [142, 290, 316, 106],
      text: 'Logo acima do térreo, pertinho da copa das árvores e a poucos passos da rua.' },
    { k: 'T', floor: 'Térreo', title: 'Acesso e áreas sociais', tipo: 'as áreas sociais', box: [40, 396, 520, 76],
      text: 'A chegada ao Edifício Santa Ana: fachada iluminada, portões de acesso e os espaços de convivência.' },
  ];
  const spots = [
    [50, 9, 'Forro de gesso', 'Acabamento moderno e ambientes ainda mais valorizados.'],
    [30.5, 25.5, 'Infraestrutura para ar-condicionado', 'Mais praticidade para o seu dia.'],
    [33, 41, 'Personalização durante a obra', 'Mais liberdade para deixar o seu apartamento com a sua cara.'],
  ];
  const interior = (n) => {
    const tree = 330 + n * 34; // quanto mais alto o andar, mais céu na janela
    let planks = '', rail = '';
    for (let i = 1; i < 9; i++) planks += `M${140 + i * 58} 410L${i * 89} 600`;
    for (let x = 408; x < 600; x += 12) rail += `M${x} 352v58`;
    return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração da sala do apartamento">
  <defs>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#31406f"/><stop offset=".6" stop-color="#b98a8f"/><stop offset="1" stop-color="#f3bd8b"/></linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c7650"/><stop offset="1" stop-color="#bd9468"/></linearGradient>
    <filter id="led" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
    <clipPath id="door"><rect x="404" y="164" width="192" height="246"/></clipPath>
  </defs>
  <path d="M0 0H800L660 110H140z" fill="#e9e2d5"/>
  <path d="M0 0L140 110V410L0 600z" fill="#c6bcab"/><path d="M800 0L660 110V410L800 600z" fill="#cdc3b3"/>
  <rect x="140" y="110" width="520" height="300" fill="#dad1c2"/>
  <path d="M0 600L140 410H660L800 600z" fill="url(#wood)"/><path d="${planks}" stroke="#8a6644" stroke-width="1.5"/>
  <path d="M112 24H688L612 92H188z" fill="none" stroke="#ffd596" stroke-width="12" opacity=".8" filter="url(#led)"/>
  <path d="M112 24H688L612 92H188z" fill="#f7f2e8" stroke="#ffe3b3" stroke-width="2.5"/>
  <circle cx="300" cy="58" r="5" fill="#fff3d6"/><circle cx="400" cy="58" r="5" fill="#fff3d6"/><circle cx="500" cy="58" r="5" fill="#fff3d6"/>
  <g clip-path="url(#door)">
    <rect x="404" y="164" width="192" height="246" fill="url(#dusk)"/>
    <ellipse cx="440" cy="${tree + 60}" rx="70" ry="80" fill="#22352a"/><ellipse cx="560" cy="${tree + 80}" rx="80" ry="84" fill="#2c4433"/>
    <path d="M404 352h192${rail}" stroke="#141416" stroke-width="2.5" fill="none"/>
  </g>
  <rect x="404" y="164" width="192" height="246" fill="none" stroke="#1b1b1e" stroke-width="7"/><path d="M500 164v246" stroke="#1b1b1e" stroke-width="5"/>
  <rect x="372" y="150" width="26" height="262" fill="#f1e9da"/><rect x="602" y="150" width="26" height="262" fill="#f1e9da"/>
  <rect x="180" y="134" width="132" height="36" rx="7" fill="#fbfaf6" stroke="#cfc8ba"/><path d="M192 160h108" stroke="#b9b2a4" stroke-width="2"/>
  <rect x="196" y="212" width="58" height="72" fill="#f6f0e4" stroke="#8f6f2f" stroke-width="3"/><rect x="270" y="212" width="58" height="72" fill="#f6f0e4" stroke="#8f6f2f" stroke-width="3"/>
  <path d="M206 268l14-22 12 14 8-8 6 16z" fill="#c9a45c"/><circle cx="299" cy="246" r="14" fill="none" stroke="#c9a45c" stroke-width="3"/>
  <ellipse cx="400" cy="510" rx="250" ry="52" fill="#ebe2d2"/>
  <rect x="166" y="312" width="200" height="76" rx="12" fill="#66736a"/><rect x="154" y="358" width="224" height="50" rx="10" fill="#75837a"/>
  <rect x="150" y="344" width="26" height="66" rx="9" fill="#5c6960"/><rect x="356" y="344" width="26" height="66" rx="9" fill="#5c6960"/>
  <rect x="196" y="330" width="52" height="40" rx="8" fill="#d9b877"/><rect x="286" y="330" width="52" height="40" rx="8" fill="#efe7d8"/>
  <rect x="300" y="452" width="170" height="14" rx="4" fill="#5b432c"/><path d="M316 466v40M454 466v40" stroke="#5b432c" stroke-width="6"/>
  <path d="M640 420h44l-6 52h-32z" fill="#8a6a4a"/><path d="M662 420q-34-50-22-104M662 420q6-66 34-96M662 420q-4-70-2-124M662 420q30-34 52-40" stroke="#3f6a3d" stroke-width="7" fill="none" stroke-linecap="round"/>
</svg>`;
  };

  const exZoom = document.getElementById('exZoom');
  const lift = document.getElementById('lift');
  const apt = document.getElementById('apt');
  const aptView = document.getElementById('aptView');
  const aptTip = document.getElementById('aptTip');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pct = (v, total) => `${(v / total * 100).toFixed(2)}%`;

  exZoom.innerHTML = buildingSVG + levels.map((l) => {
    const [x, y, w, h] = l.box;
    return `<button class="floor-hit" data-k="${l.k}" style="left:${pct(x, 600)};top:${pct(y, 520)};width:${pct(w, 600)};height:${pct(h, 520)}" aria-label="${l.floor}: ver ${l.title}"><span>${l.floor} · entrar</span></button>`;
  }).join('');
  lift.innerHTML = levels.map((l) =>
    `<button data-k="${l.k}"><b>${l.k}</b><span><small>${l.floor}</small>${l.title}</span><i aria-hidden="true">&rarr;</i></button>`).join('');

  const triggers = [...document.querySelectorAll('#exZoom .floor-hit, #lift button')];
  const hot = (k) => triggers.forEach((t) => t.classList.toggle('is-hot', t.dataset.k === k));
  let level = 0;

  const render = (i) => {
    level = i;
    const l = levels[i];
    document.getElementById('aptFloor').textContent = l.floor;
    document.getElementById('aptTitle').textContent = l.title;
    document.getElementById('aptText').textContent = l.text;
    document.getElementById('aptCta').textContent = l.k === 'T' ? 'Quero conhecer as áreas sociais' : `Quero conhecer o ${l.title.replace('Apartamento', 'Ap')}`;
    document.getElementById('aptUp').disabled = i === 0;
    document.getElementById('aptDown').disabled = i === levels.length - 1;
    aptTip.textContent = l.k === 'T' ? '' : 'Toque nos pontos dourados para ver os detalhes.';
    document.getElementById('aptTags').innerHTML = (l.k === 'T'
      ? ['Fachada iluminada', 'Elevador', 'Áreas sociais']
      : ['Elevador', 'Forro de gesso', 'Infraestrutura para ar-condicionado', 'Piso aquecido nos banheiros', 'Personalização durante a obra']
    ).map((t) => `<li>${t}</li>`).join('');
    aptView.innerHTML = l.k === 'T'
      ? '<img src="assets/fachada.jpg" alt="Fachada e acesso do Edifício Santa Ana">'
      : interior(+l.k) + spots.map(([x, y, t], j) => `<button class="spot" data-j="${j}" style="left:${x}%;top:${y}%" aria-label="${t}"></button>`).join('');
    aptView.classList.remove('enter'); void aptView.offsetWidth; aptView.classList.add('enter');
    hot(l.k);
  };
  aptView.addEventListener('click', (e) => {
    const s = e.target.closest('.spot');
    if (!s) return;
    aptView.querySelectorAll('.spot').forEach((b) => b.classList.toggle('on', b === s));
    const [, , t, d] = spots[+s.dataset.j];
    aptTip.innerHTML = `<b>${t}.</b> ${d}`;
  });

  const enter = (i) => {
    const [x, y, w, h] = levels[i].box;
    render(i);
    exZoom.style.transformOrigin = `${pct(x + w / 2, 600)} ${pct(y + h / 2, 520)}`;
    exZoom.classList.add('zoom');
    setTimeout(() => apt.showModal(), calm ? 0 : 520);
  };
  triggers.forEach((t) => {
    const i = levels.findIndex((l) => l.k === t.dataset.k);
    t.addEventListener('click', () => enter(i));
    t.addEventListener('mouseenter', () => hot(t.dataset.k));
    t.addEventListener('focus', () => hot(t.dataset.k));
    t.addEventListener('mouseleave', () => hot(null));
  });
  apt.addEventListener('close', () => { exZoom.classList.remove('zoom'); hot(null); });
  apt.addEventListener('click', (e) => { if (e.target === apt) apt.close(); });
  document.getElementById('aptClose').addEventListener('click', () => apt.close());
  document.getElementById('aptUp').addEventListener('click', () => render(level - 1));
  document.getElementById('aptDown').addEventListener('click', () => render(level + 1));
  document.getElementById('aptCta').addEventListener('click', () => {
    const r = [...form.elements.tipo].find((el) => el.value === levels[level].tipo);
    if (r) { r.checked = true; compose(); }
    apt.close();
    document.getElementById('contato').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
