const $ = (id) => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Conteúdo: edite aqui andares e modelos ---------- */
const BUILDING_FEATURES = ['Hall com elevador', 'Salão de festas', 'Área kids e área pet', 'Área técnica para ar-condicionado', 'Porcelanato e laminado', 'Personalização das unidades'];

const SOCIAL = [
  ['assets/social-salao-a.webp', 'Salão de festas', 'Salão de festas com churrasqueira e bancada'],
  ['assets/social-salao-b.webp', 'Salão de festas', 'Salão de festas com mesas e churrasqueira ao fundo'],
  ['assets/social-hall-a.webp', 'Hall de entrada com elevador', 'Hall de entrada com escada e elevador'],
  ['assets/social-hall-b.webp', 'Hall de entrada com elevador', 'Hall de entrada com portas de vidro em arco e elevador'],
  ['assets/social-pet.webp', 'Área pet', 'Área pet com gramado e brinquedos'],
  ['assets/social-pet-banho.webp', 'Pet banho', 'Espaço pet banho com cuba e ducha'],
  ['assets/social-kids-a.webp', 'Área kids', 'Área kids com brinquedos e gira-gira'],
  ['assets/social-kids-b.webp', 'Área kids', 'Área kids com jardim vertical'],
];
const SOCIAL_AREAS = ['Salão de festas', 'Hall de entrada com elevador', 'Área pet', 'Pet banho', 'Área kids'];

const MODELS = {
  t01: {
    plan: true,
    name: 'Apartamento Tipo 01',
    short: 'Tipo 01',
    tour: 't01-sala',
    form: 'o Apartamento Tipo 01',
    summary: '60,60 m² · 2 quartos · 1 vaga',
    tagline: 'Cozinha e sala integradas, com muita luz natural.',
    specs: [['60,60 m²', 'área total'], ['78,15 m²', 'área equivalente'], ['2', 'quartos'], ['1', 'banheiro'], ['1', 'vaga de garagem']],
    features: ['1 quarto com sacada privativa', 'Sacada com churrasqueira e área de serviço', 'Piso aquecido no banheiro'],
    media: [
      ['assets/planta-tipo01.webp', 'Planta', 'Planta oficial do Apartamento Tipo 01'],
      ['assets/tipo01-sala-cozinha.webp', 'Cozinha e sala', 'Cozinha e sala integradas, com mesa redonda e sofá branco'],
      ['assets/tipo01-cozinha.webp', 'Cozinha', 'Cozinha com aéreos de madeira e geladeira inox embutida'],
      ['assets/tipo01-varanda.webp', 'Varanda e área de serviço', 'Varanda com churrasqueira e área de serviço'],
      ['assets/tipo01-quarto-1.webp', 'Quarto 01', 'Quarto com painel de nogueira e ripado'],
      ['assets/tipo01-quarto-2.webp', 'Quarto 02', 'Quarto com boiserie e armário espelhado'],
    ],
  },
  t02: {
    plan: true,
    name: 'Apartamento Tipo 02',
    short: 'Tipo 02',
    tour: 't02-sala',
    form: 'o Apartamento Tipo 02',
    summary: '60,94 m² · 2 quartos · 1 vaga',
    tagline: 'Conforto e funcionalidade em cada detalhe.',
    specs: [['60,94 m²', 'área total'], ['78,63 m²', 'área equivalente'], ['2', 'quartos'], ['1', 'banheiro'], ['1', 'vaga de garagem']],
    features: ['1 quarto com sacada privativa', 'Sacada com churrasqueira e área de serviço', 'Piso aquecido no banheiro'],
    media: [
      ['assets/planta-tipo02.webp', 'Planta', 'Planta oficial do Apartamento Tipo 02'],
      ['assets/tipo02-cozinha-sala.webp', 'Cozinha e sala', 'Cozinha e sala integradas, com treliça de madeira e sofá curvo'],
      ['assets/tipo02-cozinha-v2.webp', 'Cozinha', 'Cozinha com nichos de vidro canelado, geladeira inox e dois fornos'],
      ['assets/tipo02-sacadas.webp', 'Sacadas', 'Sacada do quarto 01 e sacada com área de serviço e churrasqueira'],
      ['assets/tipo02-quarto-01.webp', 'Quarto 01', 'Quarto com painel de madeira e cabeceira estofada'],
    ],
  },
  t03: {
    plan: true,
    plans: [['t03', '3D 03'], ['t05', '3D 05']],
    name: 'Apartamento Tipo 03 e 05',
    short: 'Tipo 03 e 05',
    tour: 't03-sala',
    form: 'o Apartamento Tipo 03 e 05',
    summary: '57,00 m² · 2 quartos · 1 vaga',
    tagline: 'Conforto e funcionalidade em cada detalhe.',
    specs: [['57,00 m²', 'área total'], ['71,56 m²', 'área equivalente'], ['2', 'quartos'], ['1', 'banheiro'], ['1', 'vaga de garagem']],
    features: ['1 quarto com sacada privativa', 'Área de serviço integrada na cozinha', 'Piso aquecido no banheiro'],
    media: [
      ['assets/planta-tipo03-05.webp', 'Planta', 'Planta oficial dos Apartamentos Tipo 03 e 05'],
      ['assets/tipo03-sala-cozinha.webp', 'Estar e cozinha', 'Sala de estar integrada à cozinha com bancada'],
      ['assets/tipo03-cozinha.webp', 'Cozinha', 'Cozinha com área de serviço integrada'],
      ['assets/tipo03-sala-tv.webp', 'Sala de TV', 'Sala de TV com bancada de refeições'],
      ['assets/tipo03-quarto1-a.webp', 'Quarto 1', 'Quarto 1 com painel de madeira e janela'],
      ['assets/tipo03-quarto1-b.webp', 'Quarto 1', 'Quarto 1 com armário e cabeceira estofada'],
      ['assets/tipo03-quarto2-a.webp', 'Quarto 2', 'Quarto 2 infantil com acesso à sacada'],
      ['assets/tipo03-quarto2-b.webp', 'Quarto 2', 'Quarto 2 infantil com armários'],
      ['assets/tipo03-infantil.webp', 'Quarto infantil', 'Quarto infantil com painéis estofados e armário de palhinha (Tipos 03 e 04)'],
    ],
  },
  t04: {
    plan: true,
    name: 'Apartamento Tipo 04',
    short: 'Tipo 04',
    form: 'o Apartamento Tipo 04',
    summary: '30,85 m² · 1 quarto',
    tagline: 'Planta otimizada, com área de serviço integrada na cozinha.',
    specs: [['30,85 m²', 'área total'], ['43,50 m²', 'área equivalente'], ['1', 'quarto'], ['1', 'banheiro'], ['Otimizada', 'planta']],
    features: ['Área de serviço integrada na cozinha', 'Planta otimizada', '1 banheiro'],
    media: [['assets/planta-tipo04.webp', 'Planta', 'Planta oficial do Apartamento Tipo 04']],
  },
};

const FLOORS = [
  { k: '3', name: '3º andar', models: ['t01', 't02', 't03', 't04'] },
  { k: '2', name: '2º andar', models: ['t01', 't02', 't03', 't04'] },
  { k: '1', name: '1º andar', models: ['t01', 't02', 't03', 't04'] },
  { k: 'T', name: 'Térreo', models: [] },
];
const floorOf = (k) => FLOORS.find((f) => f.k === k);

/* ---------- Unidades de cada andar (final do apartamento) ----------
   Mesma ordem e posição dos "slots" da fachada em building.js. Apto = andar + final (ex.: 201).
   Numeração e posições ilustrativas: confirme com a incorporadora e ajuste aqui. */
const UNIT_SLOTS = [
  { fin: '01', model: 't01', tipo: 'Tipo 01', pos: 'Frente, à esquerda' },
  { fin: '02', model: 't02', tipo: 'Tipo 02', pos: 'Frente, à direita' },
  { fin: '03', model: 't03', tipo: 'Tipo 03', pos: 'Lateral esquerda' },
  { fin: '05', model: 't03', tipo: 'Tipo 05', pos: 'Lateral direita' },
  { fin: '04', model: 't04', tipo: 'Tipo 04', pos: 'Fundos' },
];
const unitInfo = (id) => {
  const sl = UNIT_SLOTS.find((u) => u.fin === id.slice(1)), m = MODELS[sl.model];
  const spec = Object.fromEntries(m.specs.map(([v, l]) => [l, v]));
  const beds = spec.quartos || spec.quarto || '';
  return { id, floor: id[0], floorName: floorOf(id[0]).name, ...sl, m, spec, beds, bedsTxt: beds ? `${beds} ${beds === '1' ? 'quarto' : 'quartos'}` : '' };
};

/* ---------- Painel: andar -> modelo -> explicações ---------- */
const hero = $('topo'), panel = $('panel'), body = $('panelBody'), back = $('panelBack'), tip = $('tip');
const state = { floor: null, model: null };
let viewer = null;

const thumb = (src) => src.replace('assets/', 'assets/thumbs/');
const chips = (list) => `<ul class="chips">${list.map((t) => `<li>${t}</li>`).join('')}</ul>`;

const viewFloor = (f) => `
  <p class="eyebrow">${f.name}</p>
  <h2>Escolha o modelo</h2>
  <p class="muted">Modelos de apartamento do Edifício Santa Ana.</p>
  <div class="models">${f.models.map((id) => {
    const m = MODELS[id];
    return `<button type="button" class="model" data-model="${id}">
      <img src="${thumb(m.media[0][0])}" alt="" loading="lazy">
      <span><b>${m.name}</b><small>${m.summary}</small></span><i aria-hidden="true">&rarr;</i>
    </button>`;
  }).join('')}</div>`;

const viewGround = (f) => `
  <p class="eyebrow">${f.name}</p>
  <h2>Áreas sociais</h2>
  <p class="lead">Espaços para receber, brincar e cuidar de quem você ama.</p>
  <figure class="media cover" id="media"></figure>
  <div class="thumbs" role="group" aria-label="Fotos das áreas sociais">${SOCIAL.map(([src, cap], i) =>
    `<button type="button" data-i="${i}" aria-label="${cap}" aria-pressed="${i === 0}"><img src="${thumb(src)}" alt="" loading="lazy"></button>`).join('')}</div>
  <h3>Áreas do edifício</h3>
  <div class="areas">${SOCIAL_AREAS.map((a) => `<button type="button" data-area="${a}">${a}</button>`).join('')}</div>
  <h3>No edifício</h3>${chips(BUILDING_FEATURES)}
  <p class="muted">No térreo também ficam o acesso e as vagas de garagem.</p>
  <div class="actions"><button type="button" class="btn" data-cta>Quero conhecer as áreas sociais</button>
    <a class="btn btn-ghost" href="tour.html#salao-a">Visitar em 3D</a></div>
  <small class="muted">Imagens ilustrativas.</small>`;

const viewModel = (f, m) => `
  <p class="eyebrow">${f.name}</p>
  <h2>${m.name}</h2>
  <p class="lead">${m.tagline}</p>
  ${m.media ? `
  <figure class="media" id="media"></figure>
  <div class="thumbs" role="group" aria-label="Planta em 3D, planta e fotos">
    ${m.plan ? (m.plans || [[null, '3D']]).map(([pid, lb], k) => `<button type="button" data-i="3d${pid ? ':' + pid : ''}" aria-label="Planta em 3D${pid ? ' do ' + lb.replace('3D ', 'Tipo ') : ''}" aria-pressed="${k === 0}"><b>${lb}</b></button>`).join('') : ''}${m.media.map(([src, cap], i) =>
    `<button type="button" data-i="${i}" aria-label="${cap}" aria-pressed="${!m.plan && i === 0}"><img src="${thumb(src)}" alt="" loading="lazy"></button>`).join('')}</div>
  <dl class="specs">${m.specs.map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>
  <h3>Neste apartamento</h3><ul class="feats">${m.features.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
  <h3>No edifício</h3>${chips(BUILDING_FEATURES)}
  <div class="actions"><button type="button" class="btn" data-cta>Tenho interesse no ${m.short}</button>
    ${m.tour ? `<a class="btn btn-ghost" href="tour.html#${m.tour}">Visitar em 3D</a>` : ''}</div>
  <small class="muted">Imagens e planta 3D ilustrativas. Medidas conforme material de divulgação.</small>`;

// área de mídia do modelo: planta giratória em 3D, planta e fotos
let plan3d = null;
const showMedia = async (i) => {
  const fig = $('media');
  plan3d?.dispose(); plan3d = null;
  if (!fig) return;
  fig.parentElement.querySelectorAll('.thumbs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.i === String(i)));
  const media = state.model ? MODELS[state.model].media : SOCIAL;
  const image = ([src, cap, alt]) => { fig.className = state.model ? 'media' : 'media cover'; fig.innerHTML = `<img src="${src}" alt="${alt}"><figcaption>${cap}</figcaption>`; };
  if (!String(i).startsWith('3d')) return image(media[+i]);
  const id = state.model, planId = String(i).split(':')[1] || id;
  try {
    const { createPlan, PLANS } = await import('./plan3d.js?v=20261124');
    if (state.model !== id || !fig.isConnected) return;
    fig.className = 'media is3d';
    fig.innerHTML = '<figcaption>Planta em 3D · arraste para girar</figcaption>';
    plan3d = createPlan(fig, PLANS[planId]);
  } catch (err) {
    console.warn('Planta 3D indisponível:', err);
    image(media[0]);
  }
};

const render = () => {
  const f = floorOf(state.floor);
  const open = !!f;
  hero.classList.toggle('has-panel', open);
  document.body.classList.toggle('panel-open', open);
  panel.hidden = !open;
  viewer?.setPanel(open);
  viewer?.select(state.floor);
  unitCard.classList.toggle('under', open && !!unitId); // fotos e planta oficial por cima do cartão da unidade
  plan3d?.dispose(); plan3d = null;
  document.querySelectorAll('#floors button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === state.floor));
  if (!open) return;
  const m = MODELS[state.model];
  back.hidden = !m;
  back.textContent = m ? `‹ ${f.name}` : '';
  body.innerHTML = m ? viewModel(f, m) : f.models.length ? viewFloor(f) : viewGround(f);
  body.scrollTop = 0;
  body.classList.remove('enter'); void body.offsetWidth; body.classList.add('enter');
  if (m?.media) showMedia(m.plan ? (m.plans ? `3d:${m.plans[0][0]}` : '3d') : 0); else if (!m && !f.models.length) showMedia(0);
};
const openFloor = (k) => { state.floor = k; state.model = null; render(); };
const closePanel = () => { state.floor = state.model = null; render(); };

body.addEventListener('click', (e) => {
  const model = e.target.closest('[data-model]');
  const thumb = e.target.closest('.thumbs button');
  if (model) { state.model = model.dataset.model; render(); }
  else if (thumb) showMedia(thumb.dataset.i);
  else if (e.target.closest('[data-area]')) {
    const i = SOCIAL.findIndex(([, cap]) => cap.toLowerCase() === e.target.closest('[data-area]').dataset.area.toLowerCase());
    if (i >= 0) showMedia(i);
  } else if (e.target.closest('[data-cta]')) {
    // abre o atendimento já com o apartamento e o andar escolhidos
    const f = floorOf(state.floor);
    window.SobanskiChat?.open({ interest: state.model || (state.floor === 'T' ? 'social' : 'all'), where: state.model && f ? f.name : '' });
  }
});
back.addEventListener('click', () => { state.model = null; render(); });
$('panelClose').addEventListener('click', closePanel);
addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (state.floor) closePanel(); else if (unitId) exitUnit(); });

/* ---------- Vista da unidade: voo até o apartamento, planta 3D isolada e cartão lateral ---------- */
const unitBack = $('unitBack'), unitCard = $('unitCard'), unitSwitch = $('unitSwitch'), usUnits = $('usUnits'), usFloor = $('usFloor'), unitZoom = $('unitZoom');
let unitId = null;
const root = document.documentElement;
const lockScroll = (on) => { root.classList.toggle('no-scroll', on); if (on) window.__lenis?.stop(); else window.__lenis?.start(); };

const tipHTML = (k) => {
  if (k === 'T') return '<small>Térreo</small><b>Áreas sociais</b><span>Hall, salão de festas, pet e kids</span><em>Clique para ver</em>';
  const u = unitInfo(k);
  return `<small>${u.floorName} · Final ${u.fin}</small><b>Apartamento ${k}</b><span>${u.tipo} · ${u.spec['área total']}${u.bedsTxt ? ` · ${u.bedsTxt}` : ''}</span><em>Clique para ver a planta 3D</em>`;
};
// cartão do hover ancorado na unidade, ligado a ela por uma linha fina (como no vídeo de referência)
let tipSize = null;
const showTip = (k, at) => {
  tip.classList.toggle('on', !!k && !unitId);
  if (!k || !at) return;
  if (tip.dataset.k !== k) { tip.dataset.k = k; tip.innerHTML = tipHTML(k); tipSize = null; }
  tipSize ??= [tip.offsetWidth, tip.offsetHeight];
  const [w, h] = tipSize, gap = 48;
  const right = at.x - w - gap < 12;
  tip.classList.toggle('right', right);
  const x = right ? at.x + gap : at.x - w - gap, y = Math.max(70, Math.min(hero.clientHeight - h - 12, at.y - h / 2));
  tip.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
};

function renderCard(id) {
  const u = unitInfo(id), m = u.m, sp = u.spec, plan = m.media[0][0].replace(/\.webp$/, ''); // planta oficial completa
  const rows = [['Andar', u.floorName], ['Quartos', u.beds], ['Banheiro', sp.banheiro], ['Vaga', sp['vaga de garagem']], ['Posição', u.pos], ['Planta', sp.planta || u.tipo]].filter(([, v]) => v);
  unitCard.innerHTML = `<div class="uc-body">
    <p class="uc-status"><i aria-hidden="true"></i>${u.floorName} de 3 · Final ${u.fin}</p>
    <h2>Apartamento ${id}</h2>
    <p class="uc-sub">${u.tipo}${u.bedsTxt ? ` · ${u.bedsTxt}` : ''} · ${sp['área total']}</p>
    <button type="button" class="uc-plan" data-uc="plan" aria-label="Ampliar a planta oficial do ${m.name}">
      <img src="${plan}-800.webp" srcset="${plan}-800.webp 800w, ${plan}.webp 2828w" sizes="(max-width:860px) 92vw, 360px" width="2828" height="2000" alt="Planta oficial do ${m.name}" decoding="async">
      <span>Planta oficial · toque para ampliar</span>
    </button>
    <div class="uc-area"><b>${sp['área total']}</b><span>área total · ${sp['área equivalente']} de área equivalente</span></div>
    <dl class="uc-grid">${rows.map(([l, v]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <ul class="uc-feats">${m.features.map((t) => `<li>${t}</li>`).join('')}</ul>
    <div class="uc-actions"><button type="button" class="btn" data-uc="interest">Tenho interesse</button>${m.tour ? `<a class="btn btn-ghost" href="tour.html#${m.tour}">Tour 3D</a>` : ''}</div>
    <small>Planta 3D ilustrativa, montada a partir da planta de divulgação. Numeração e posição das unidades ilustrativas.</small>
  </div>`;
}
function renderSwitch(id) {
  usFloor.textContent = floorOf(id[0]).name;
  usUnits.innerHTML = UNIT_SLOTS.map((s) => `<button type="button" data-unit="${id[0]}${s.fin}" aria-pressed="${s.fin === id.slice(1)}" aria-label="Apartamento ${id[0]}${s.fin}, ${s.tipo}"><b>${id[0]}${s.fin}</b><small>${s.tipo}</small></button>`).join('');
  unitSwitch.querySelector('[data-step="-1"]').disabled = id[0] === '1';
  unitSwitch.querySelector('[data-step="1"]').disabled = id[0] === '3';
}
const reveal = (el) => { el.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on'))); };
const UNIT_UI = [unitCard, unitSwitch, unitZoom];
// mede o espaço que sobra entre o botão de voltar, as pílulas e o cartão e avisa a maquete:
// ela se centraliza e cabe inteira nessa área (no celular, entre as pílulas e o cartão de baixo)
function measureSafe() {
  if (!unitId || !viewer) return;
  const W = hero.clientWidth, H = hero.clientHeight;
  // celular: os botões de zoom vão para a linha do andar, fora da faixa da planta
  const zoomHome = W > 860 ? hero : unitSwitch;
  if (unitZoom.parentElement !== zoomHome) zoomHome.insertBefore(unitZoom, W > 860 ? unitCard : usUnits);
  if (W > 860) viewer.setSafe({ t: unitBack.offsetTop + unitBack.offsetHeight + 16, r: W - unitCard.offsetLeft + 24, b: H - unitSwitch.offsetTop + 16, l: unitZoom.offsetLeft + unitZoom.offsetWidth + 8 });
  else viewer.setSafe({ t: unitSwitch.offsetTop + unitSwitch.offsetHeight + 12, r: 0, b: H - unitCard.offsetTop + 14, l: 0 });
}
new ResizeObserver(() => measureSafe()).observe(hero);
function enterUnit(id) {
  if (!viewer) return;
  if (unitId) return goUnit(id);
  closePanel();
  // cartão e pílulas já entram no layout (invisíveis) para a câmera saber onde enquadrar
  unitId = id;
  renderCard(id); renderSwitch(id);
  UNIT_UI.forEach((el) => { el.hidden = false; });
  measureSafe();
  // voo até a unidade; o cartão entra quando a câmera assenta no estúdio
  if (!viewer.focusUnit(id, { onStudio: () => UNIT_UI.forEach(reveal) })) { unitId = null; UNIT_UI.forEach((el) => { el.hidden = true; }); return; }
  tip.classList.remove('on'); tip.dataset.cur = ''; window.SobanskiCursor?.set('Girar');
  if (scrollY > 2) (window.__lenis ? window.__lenis.scrollTo(0, { duration: 0.8 }) : scrollTo({ top: 0, behavior: 'smooth' }));
  lockScroll(true);
  unitBack.hidden = false;
  root.classList.add('unit-mode'); // textos da hero somem; fica só "Voltar ao prédio"
}
// troca entre unidades sem voltar à vista externa: cross-fade da planta e do cartão
function goUnit(id) {
  if (!unitId || id === unitId) return;
  if (!viewer.switchUnit(id)) return;
  unitId = id;
  unitCard.classList.add('swap');
  setTimeout(() => { renderCard(id); unitCard.scrollTop = 0; unitCard.classList.remove('swap'); measureSafe(); }, 260);
  renderSwitch(id);
}
function exitUnit() {
  if (!unitId) return;
  if (!viewer.exitUnit({
    onLanding: () => root.classList.remove('unit-mode'),
    onDone: () => { unitBack.hidden = true; unitId = null; lockScroll(false); },
  })) return;
  closePanel();
  for (const el of UNIT_UI) { el.classList.remove('on'); setTimeout(() => { if (!el.classList.contains('on')) el.hidden = true; }, 600); }
}
unitBack.addEventListener('click', exitUnit);
unitZoom.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoom]')?.dataset.zoom;
  if (z === 'in') viewer?.zoomBy(0.75); else if (z === 'out') viewer?.zoomBy(1 / 0.75); else if (z === 'fit') viewer?.zoomReset();
});
unitSwitch.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || !unitId) return;
  if (b.dataset.unit) goUnit(b.dataset.unit);
  else if (b.dataset.step) { const f = Math.min(3, Math.max(1, +unitId[0] + +b.dataset.step)); goUnit(`${f}${unitId.slice(1)}`); }
});
unitCard.addEventListener('click', (e) => {
  const a = e.target.closest('[data-uc]');
  if (!a || !unitId) return;
  const u = unitInfo(unitId);
  if (a.dataset.uc === 'interest') window.SobanskiChat?.open({ interest: u.model, where: `${u.floorName}, apartamento ${unitId}` });
  else if (a.dataset.uc === 'plan') openPlan(a.querySelector('img'));
});
// planta oficial em tela cheia, inteira (sem corte), com a versão em alta definição
const planView = $('planView'), planImg = planView.querySelector('img'), hint = planView.querySelector('.pv-hint');
const tapWord = matchMedia('(pointer: fine)').matches ? 'Clique' : 'Toque', dragWord = matchMedia('(pointer: fine)').matches ? 'Role' : 'Arraste';
let planReturn = null;
function openPlan(img) {
  planReturn = document.activeElement;
  planImg.alt = img.alt; planImg.src = img.src.replace(/-800\.webp$/, '.webp');
  planView.classList.remove('zoom'); hint.textContent = `${tapWord} na planta para ampliar`;
  planView.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => planView.classList.add('on')));
  planView.querySelector('button').focus();
}
function closePlan() {
  if (planView.hidden) return;
  planView.classList.remove('on');
  setTimeout(() => { planView.hidden = true; planView.classList.remove('zoom'); }, 300);
  planReturn?.focus?.();
}
planView.addEventListener('click', (e) => {
  if (e.target.closest('.pv-close') || (e.target === planView && !planView.classList.contains('zoom'))) return closePlan();
  if (e.target !== planImg) return;
  // amplia no ponto tocado (ou volta a caber inteira na tela)
  const r = planImg.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  const zoom = planView.classList.toggle('zoom');
  hint.textContent = zoom ? `${dragWord} para ver · ${tapWord.toLowerCase()} para reduzir` : `${tapWord} na planta para ampliar`;
  if (zoom) { planView.scrollLeft = fx * planImg.offsetWidth - innerWidth / 2; planView.scrollTop = fy * planImg.offsetHeight - innerHeight / 2; }
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !planView.hidden) { e.stopImmediatePropagation(); closePlan(); } }, true);
const selectFromBuilding = (k) => (k === 'T' ? openFloor('T') : enterUnit(k));

$('floors').innerHTML = FLOORS.map((f) => `<button type="button" data-k="${f.k}" aria-pressed="false" aria-label="${f.name}"><b>${f.k}</b><span>${f.name}</span></button>`).join('');
$('floors').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) selectFromBuilding(b.dataset.k === 'T' ? 'T' : `${b.dataset.k}01`); });
$('floors').addEventListener('pointerover', (e) => viewer?.highlight(e.target.closest('button')?.dataset.k ?? null));
$('floors').addEventListener('pointerleave', () => viewer?.highlight(null));

/* ---------- Abertura: SOBANSKI / INCORPORADORA — APRESENTA, depois o edifício ---------- */
const intro = $('intro'), introMsg = $('introMsg'), introTitle = $('introTitle');
let introState = 'off', introTimer = 0, introBuildingReady = false, introGo;
const introStarted = new Promise((r) => { introGo = r; });
const wantContact = location.hash === '#contato'; // vindo do "Tenho interesse" do tour
(() => {
  // toca sempre que o site é aberto ou atualizado (exceto para quem pede menos movimento)
  if (calm) { introGo(); if (wantContact) setTimeout(() => window.SobanskiChat?.open(), 600); return; }
  if (location.hash) { history.replaceState(null, '', location.pathname + location.search); scrollTo(0, 0); }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  introState = 'playing';
  intro.hidden = false;
  document.documentElement.classList.add('intro-on');
  // segura 2 s depois que APRESENTA termina de surgir (com limite de segurança)
  intro.querySelector('.intro-pre').addEventListener('animationend', () => { clearTimeout(introTimer); introTimer = setTimeout(endIntro, 2000); }, { once: true });
  // as letras só começam a entrar com as fontes prontas (no máximo 1,2 s de espera na tela preta):
  // sem isso a fonte trocava no meio da animação e as letras davam um salto
  const go = () => { if (intro.classList.contains('go')) return; intro.classList.add('go'); introTimer = setTimeout(endIntro, 9000); introGo(); };
  const fonts = document.fonts ? Promise.all(['500 48px Cinzel', '500 16px Cinzel', '400 14px Jost'].map((f) => document.fonts.load(f))) : Promise.resolve();
  fonts.then(go, go);
  setTimeout(go, 1200);
})();
function introReady() { introBuildingReady = true; if (introState === 'waiting') revealBuilding(); }
function endIntro(skipped = false) {
  if (introState !== 'playing') return;
  clearTimeout(introTimer);
  introState = skipped ? 'skipped' : 'waiting';
  intro.classList.add('out');
  setTimeout(() => { intro.hidden = true; }, 900);
  if (skipped) { document.documentElement.classList.remove('intro-on'); return; }
  if (introBuildingReady || hero.classList.contains('no3d')) revealBuilding();
}
function revealBuilding() {
  introState = 'done';
  viewer?.intro(3600);
  document.documentElement.classList.remove('intro-on');
  hero.classList.add('intro-reveal');
  // cada etapa conta o tempo a partir de quando a anterior de fato apareceu
  // título e mensagem só aparecem com o topo à vista e somem se a pessoa rolar a página
  const away = () => scrollY > innerHeight * 0.25;
  const titleIn = () => hero.classList.add('title-in');
  const hideNow = () => { if (!away()) return; for (const el of [introTitle, introMsg]) { el.classList.remove('on'); el.hidden = true; } titleIn(); removeEventListener('scroll', hideNow); };
  addEventListener('scroll', hideNow, { passive: true });
  if (wantContact) { titleIn(); setTimeout(() => window.SobanskiChat?.open(), 900); return; }
  const show = (el, delay, dur, next) => setTimeout(() => {
    if (away()) return;
    el.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add('on');
      setTimeout(() => { el.classList.remove('on'); setTimeout(() => { el.hidden = true; next?.(); }, 900); }, dur);
    }));
  }, delay);
  // SANTA ANA em destaque; quando ele sai, entra o título do topo e então a mensagem
  show(introTitle, 300, 3000, () => { titleIn(); show(introMsg, 500, 3200); });
}

/* ---------- Maquete 3D ----------
   O módulo já vem baixando em paralelo (modulepreload); só a montagem da cena (trabalho pesado de
   CPU) espera as letras da abertura começarem. As letras animam no compositor da GPU, então seguem
   fluidas mesmo enquanto o prédio é montado; antes, a montagem segurava a tela preta por segundos. */
introStarted.then(() => new Promise((r) => setTimeout(r, 150))).then(() => import('./building.js?v=20261124')).then(({ createViewer }) => {
  viewer = createViewer($('viewer'), {
    onSelect: selectFromBuilding,
    onHover: (k, e, at) => {
      if (e && e.type === 'pointermove' && tip.dataset.cur !== String(k)) { tip.dataset.cur = String(k); window.SobanskiCursor?.set(k ? 'Ver' : 'Girar'); }
      showTip(k, at);
    },
  });
  hero.classList.add('ready');
  if (introState === 'playing' || introState === 'waiting') viewer.prime();
  viewer.whenReady.then(introReady); // só revela quando o primeiro quadro do prédio já foi desenhado
  // plantas 3D e shaders do estúdio preparados em segundo plano, depois que a abertura terminou
  viewer.whenReady.then(() => setTimeout(() => viewer.preload(), 4500));
}).catch((err) => {
  console.warn('Maquete 3D indisponível:', err);
  hero.classList.add('no3d');
  introReady();
});

/* ---------- Rolagem: menu e etapas do investimento ---------- */
const nav = $('nav');
const pillars = $('investimento');
const plSteps = [...pillars.querySelectorAll('.pl-step')];
const plDots = [...pillars.querySelectorAll('.pl-dots a')];
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
// monta cada palavra como uma obra: linhas-guia, letras penduradas no cabo e preenchimento
plSteps.forEach((el) => {
  const word = el.querySelector('.pl-word');
  let i = 0;
  const rows = word.dataset.text.split('|');
  word.innerHTML = rows.map((row) => `<span class="pl-line"><i class="pl-guide" aria-hidden="true"></i>${[...row].map((c) => (c === ' '
    ? '<span class="pl-sp"> </span>'
    : `<span class="pl-l" style="--i:${i++};--r:${((i * 37) % 7) - 3}deg"><span class="pl-ghost">${c}</span><span class="pl-solid">${c}</span></span>`)).join('')}</span>`).join('');
  word.style.setProperty('--n', i);
});
let ticking = false;
// rolagem: primeiro TODAS as leituras de layout, depois as escritas, e só o que mudou. Antes cada
// etapa era medida e escrita no mesmo laço (layout forçado várias vezes por quadro) e atributos e
// classes eram regravados a cada quadro mesmo sem mudança (centenas de recálculos de estilo).
const plState = plSteps.map(() => ({ m: '', t: '', b: false }));
let navSolid = null, dotsOn = null, lastActive = null;
const update = () => {
  ticking = false;
  const vh = innerHeight;
  const heroBottom = hero.getBoundingClientRect().bottom;
  const pr = pillars.getBoundingClientRect();
  const near = pr.bottom > -vh && pr.top < vh * 2; // etapas longe da tela: nada a calcular
  const rects = near ? plSteps.map((el) => el.getBoundingClientRect()) : null;
  // escritas
  const solid = heroBottom < 80;
  if (solid !== navSolid) { navSolid = solid; nav.classList.toggle('solid', solid); }
  if (!near) return;
  let active = -1;
  plSteps.forEach((el, i) => {
    const r = rects[i], st = plState[i];
    const q = clamp(-r.top / Math.max(1, r.height - vh));
    // constrói quando a etapa ocupa a tela, descendo ou subindo; reinicia quando ela sai da tela
    const inView = r.top < vh * 0.35 && r.bottom > vh * 0.65;
    const gone = r.top > vh * 0.95 || r.bottom < vh * 0.05;
    if (inView && !st.b) { st.b = true; el.classList.add('build'); }
    else if (gone && st.b) { st.b = false; el.classList.remove('build'); }
    const m = ease((q - 0.3) / 0.28).toFixed(3), t = ease((q - 0.5) / 0.22).toFixed(3);
    if (m !== st.m) { st.m = m; el.style.setProperty('--m', m); }
    if (t !== st.t) { st.t = t; el.style.setProperty('--t', t); }
    if (r.top < vh * 0.5 && r.bottom > vh * 0.5) active = i;
  });
  const on = pr.top < vh * 0.4 && pr.bottom > vh * 0.6 && active >= 0;
  if (on !== dotsOn) { dotsOn = on; pillars.classList.toggle('dots-on', on); }
  if (active !== lastActive) { lastActive = active; plDots.forEach((d, i) => d.setAttribute('aria-current', i === active ? 'step' : 'false')); }
};
// atalhos levam ao ponto em que a etapa já está com o texto visível
pillars.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  const step = a && plSteps.find((s) => `#${s.id}` === a.getAttribute('href'));
  if (!step) return;
  e.preventDefault();
  const top = step.getBoundingClientRect().top + scrollY + (step.offsetHeight - innerHeight) * (calm ? 0 : 0.8);
  if (window.__lenis) window.__lenis.scrollTo(Math.round(top), { duration: 1.6 }); else scrollTo({ top: Math.round(top), behavior: calm ? 'auto' : 'smooth' });
});
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
update();

const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

/* ---------- Menu ---------- */
const navMenu = $('navMenu'), navShade = $('navShade'), navToggle = $('navToggle');
const setNav = (open) => {
  navMenu.hidden = navShade.hidden = !open;
  navToggle.setAttribute('aria-expanded', open);
  if (open) navMenu.querySelector('a')?.focus(); else navToggle.focus({ preventScroll: true });
};
navToggle.addEventListener('click', () => setNav(true));
$('navClose').addEventListener('click', () => setNav(false));
navShade.addEventListener('click', () => setNav(false));
navMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !navMenu.hidden) setNav(false); });

$('year').textContent = new Date().getFullYear();

/* ---------- Tour 3D: pré-carrega os módulos na intenção (mouse em cima, foco ou toque) ---------- */
let tourWarm = false;
const warmTour = (e) => {
  if (tourWarm || !e.target.closest?.('a[href^="tour.html"]')) return;
  tourWarm = true;
  for (const href of ['js/tour/player.js?v=20261124', 'js/tour/scenes.js?v=20261124', 'js/tour/kit.js?v=20261124']) {
    const l = document.createElement('link'); l.rel = 'modulepreload'; l.href = href; document.head.appendChild(l);
  }
};
for (const ev of ['pointerover', 'focusin', 'touchstart']) document.addEventListener(ev, warmTour, { passive: true });
