const $ = (id) => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Conteúdo: edite aqui andares e modelos ---------- */
const BUILDING_FEATURES = ['Hall com elevador', 'Salão de festas', 'Área kids e área pet', 'Área técnica para ar-condicionado', 'Porcelanato e laminado', 'Personalização das unidades'];

const SOCIAL = [
  ['assets/social-salao-a.jpg', 'Salão de festas', 'Salão de festas com churrasqueira e bancada'],
  ['assets/social-salao-b.jpg', 'Salão de festas', 'Salão de festas com mesas e churrasqueira ao fundo'],
  ['assets/social-hall-a.jpg', 'Hall de entrada com elevador', 'Hall de entrada com escada e elevador'],
  ['assets/social-hall-b.jpg', 'Hall de entrada com elevador', 'Hall de entrada com portas de vidro em arco e elevador'],
  ['assets/social-pet.jpg', 'Área pet', 'Área pet com gramado e brinquedos'],
  ['assets/social-pet-banho.jpg', 'Pet banho', 'Espaço pet banho com cuba e ducha'],
  ['assets/social-kids-a.jpg', 'Área kids', 'Área kids com brinquedos e gira-gira'],
  ['assets/social-kids-b.jpg', 'Área kids', 'Área kids com jardim vertical'],
];
const SOCIAL_AREAS = ['Salão de festas', 'Hall de entrada com elevador', 'Área pet', 'Pet banho', 'Área kids'];

const MODELS = {
  t01: {
    name: 'Apartamento Tipo 01',
    short: 'Tipo 01',
    tour: 't01-sala',
    form: 'o Apartamento Tipo 01',
    summary: '60,60 m² · 2 quartos · 1 vaga',
    tagline: 'Cozinha e sala integradas, com muita luz natural.',
    specs: [['60,60 m²', 'área total'], ['78,15 m²', 'área equivalente'], ['2', 'quartos'], ['1', 'banheiro'], ['1', 'vaga de garagem']],
    features: ['1 quarto com sacada privativa', 'Sacada com churrasqueira e área de serviço', 'Piso aquecido no banheiro'],
    media: [
      ['assets/tipo01-planta.jpg', 'Planta', 'Planta oficial do Apartamento Tipo 01'],
      ['assets/tipo01-sala-cozinha.jpg', 'Cozinha e sala', 'Cozinha e sala integradas, com mesa redonda e sofá branco'],
      ['assets/tipo01-cozinha.jpg', 'Cozinha', 'Cozinha com aéreos de madeira e geladeira inox embutida'],
      ['assets/tipo01-varanda.jpg', 'Varanda e área de serviço', 'Varanda com churrasqueira e área de serviço'],
      ['assets/tipo01-quarto-1.jpg', 'Quarto 01', 'Quarto com painel de nogueira e ripado'],
      ['assets/tipo01-quarto-2.jpg', 'Quarto 02', 'Quarto com boiserie e armário espelhado'],
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
      ['assets/tipo02-planta-oficial.jpg', 'Planta', 'Planta oficial do Apartamento Tipo 02'],
      ['assets/tipo02-cozinha-sala.jpg', 'Cozinha e sala', 'Cozinha e sala integradas, com treliça de madeira e sofá curvo'],
      ['assets/tipo02-cozinha-v2.jpg', 'Cozinha', 'Cozinha com nichos de vidro canelado, geladeira inox e dois fornos'],
      ['assets/tipo02-sacadas.jpg', 'Sacadas', 'Sacada do quarto 01 e sacada com área de serviço e churrasqueira'],
      ['assets/tipo02-quarto-01.jpg', 'Quarto 01', 'Quarto com painel de madeira e cabeceira estofada'],
    ],
  },
  t03: {
    plan: true,
    name: 'Apartamento Tipo 03 e 05',
    short: 'Tipo 03 e 05',
    tour: 't03-sala',
    form: 'o Apartamento Tipo 03 e 05',
    summary: '57,00 m² · 2 quartos · 1 vaga',
    tagline: 'Conforto e funcionalidade em cada detalhe.',
    specs: [['57,00 m²', 'área total'], ['71,56 m²', 'área equivalente'], ['2', 'quartos'], ['1', 'banheiro'], ['1', 'vaga de garagem']],
    features: ['1 quarto com sacada privativa', 'Área de serviço integrada na cozinha', 'Piso aquecido no banheiro'],
    media: [
      ['assets/tipo03-05-planta.jpg', 'Planta', 'Planta oficial dos Apartamentos Tipo 03 e 05'],
      ['assets/tipo03-sala-cozinha.jpg', 'Estar e cozinha', 'Sala de estar integrada à cozinha com bancada'],
      ['assets/tipo03-cozinha.jpg', 'Cozinha', 'Cozinha com área de serviço integrada'],
      ['assets/tipo03-sala-tv.jpg', 'Sala de TV', 'Sala de TV com bancada de refeições'],
      ['assets/tipo03-quarto1-a.jpg', 'Quarto 1', 'Quarto 1 com painel de madeira e janela'],
      ['assets/tipo03-quarto1-b.jpg', 'Quarto 1', 'Quarto 1 com armário e cabeceira estofada'],
      ['assets/tipo03-quarto2-a.jpg', 'Quarto 2', 'Quarto 2 infantil com acesso à sacada'],
      ['assets/tipo03-quarto2-b.jpg', 'Quarto 2', 'Quarto 2 infantil com armários'],
      ['assets/tipo03-infantil.jpg', 'Quarto infantil', 'Quarto infantil com painéis estofados e armário de palhinha (Tipos 03 e 04)'],
    ],
  },
  t04: {
    name: 'Apartamento Tipo 04',
    short: 'Tipo 04',
    form: 'o Apartamento Tipo 04',
    summary: '30,85 m² · 1 quarto',
    tagline: 'Planta otimizada, com área de serviço integrada na cozinha.',
    specs: [['30,85 m²', 'área total'], ['43,50 m²', 'área equivalente'], ['1', 'quarto'], ['1', 'banheiro'], ['Otimizada', 'planta']],
    features: ['Área de serviço integrada na cozinha', 'Planta otimizada', '1 banheiro'],
    media: [['assets/tipo04-planta.jpg', 'Planta', 'Planta oficial do Apartamento Tipo 04']],
  },
};

const FLOORS = [
  { k: '3', name: '3º andar', models: ['t01', 't02', 't03', 't04'] },
  { k: '2', name: '2º andar', models: ['t01', 't02', 't03', 't04'] },
  { k: '1', name: '1º andar', models: ['t01', 't02', 't03', 't04'] },
  { k: 'T', name: 'Térreo', models: [] },
];
const floorOf = (k) => FLOORS.find((f) => f.k === k);

/* ---------- Painel: andar -> modelo -> explicações ---------- */
const hero = $('topo'), panel = $('panel'), body = $('panelBody'), back = $('panelBack'), tip = $('tip');
const state = { floor: null, model: null };
let viewer = null;
let chosen = null; // { floor, model } levado para a mensagem de contato

const chips = (list) => `<ul class="chips">${list.map((t) => `<li>${t}</li>`).join('')}</ul>`;

const viewFloor = (f) => `
  <p class="eyebrow">${f.name}</p>
  <h2>Escolha o modelo</h2>
  <p class="muted">Modelos de apartamento do Edifício Santa Ana.</p>
  <div class="models">${f.models.map((id) => {
    const m = MODELS[id];
    return `<button type="button" class="model" data-model="${id}">
      <img src="${m.media[0][0]}" alt="">
      <span><b>${m.name}</b><small>${m.summary}</small></span><i aria-hidden="true">&rarr;</i>
    </button>`;
  }).join('')}</div>`;

const viewGround = (f) => `
  <p class="eyebrow">${f.name}</p>
  <h2>Áreas sociais</h2>
  <p class="lead">Espaços para receber, brincar e cuidar de quem você ama.</p>
  <figure class="media cover" id="media"></figure>
  <div class="thumbs" role="group" aria-label="Fotos das áreas sociais">${SOCIAL.map(([src, cap], i) =>
    `<button type="button" data-i="${i}" aria-label="${cap}" aria-pressed="${i === 0}"><img src="${src}" alt="" loading="lazy"></button>`).join('')}</div>
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
    ${m.plan ? '<button type="button" data-i="3d" aria-label="Planta em 3D" aria-pressed="true"><b>3D</b></button>' : ''}${m.media.map(([src, cap], i) =>
    `<button type="button" data-i="${i}" aria-label="${cap}" aria-pressed="${!m.plan && i === 0}"><img src="${src}" alt="" loading="lazy"></button>`).join('')}</div>
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
  if (i !== '3d') return image(media[+i]);
  const id = state.model;
  try {
    const { createPlan, PLANS } = await import('./plan3d.js');
    if (state.model !== id || !fig.isConnected) return;
    fig.className = 'media is3d';
    fig.innerHTML = '<figcaption>Planta em 3D · arraste para girar</figcaption>';
    plan3d = createPlan(fig, PLANS[id]);
  } catch (err) {
    console.warn('Planta 3D indisponível:', err);
    image(media[0]);
  }
};

const render = () => {
  const f = floorOf(state.floor);
  const open = !!f;
  hero.classList.toggle('has-panel', open);
  panel.hidden = !open;
  viewer?.setPanel(open);
  viewer?.select(state.floor);
  plan3d?.dispose(); plan3d = null;
  document.querySelectorAll('#floors button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === state.floor));
  if (!open) return;
  const m = MODELS[state.model];
  back.hidden = !m;
  back.textContent = m ? `‹ ${f.name}` : '';
  body.innerHTML = m ? viewModel(f, m) : f.models.length ? viewFloor(f) : viewGround(f);
  body.scrollTop = 0;
  body.classList.remove('enter'); void body.offsetWidth; body.classList.add('enter');
  if (m?.media) showMedia(m.plan ? '3d' : 0); else if (!m && !f.models.length) showMedia(0);
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
    chosen = { floor: floorOf(state.floor), model: MODELS[state.model] };
    const value = chosen.model?.form ?? (state.floor === 'T' ? 'as áreas sociais' : 'todas as plantas disponíveis');
    const radio = [...form.elements.tipo].find((r) => r.value === value);
    if (radio) radio.checked = true;
    compose();
    $('contato').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
  }
});
back.addEventListener('click', () => { state.model = null; render(); });
$('panelClose').addEventListener('click', closePanel);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.floor) closePanel(); });

$('floors').innerHTML = FLOORS.map((f) => `<button type="button" data-k="${f.k}" aria-pressed="false" aria-label="${f.name}"><b>${f.k}</b><span>${f.name}</span></button>`).join('');
$('floors').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) openFloor(b.dataset.k); });
$('floors').addEventListener('pointerover', (e) => viewer?.highlight(e.target.closest('button')?.dataset.k ?? null));
$('floors').addEventListener('pointerleave', () => viewer?.highlight(null));

/* ---------- Maquete 3D ---------- */
import('./building.js').then(({ createViewer }) => {
  viewer = createViewer($('viewer'), {
    onSelect: openFloor,
    onHover: (k, e) => {
      tip.classList.toggle('on', !!k);
      if (!k) return;
      const r = hero.getBoundingClientRect();
      tip.textContent = `${floorOf(k).name} · clique para entrar`;
      tip.style.transform = `translate(${e.clientX - r.left + 16}px, ${e.clientY - r.top + 16}px)`;
    },
  });
  hero.classList.add('ready');
}).catch((err) => {
  console.warn('Maquete 3D indisponível:', err);
  hero.classList.add('no3d');
});

/* ---------- Rolagem: menu e etapas do investimento ---------- */
const nav = $('nav');
const pillars = $('investimento');
const plSteps = [...pillars.querySelectorAll('.pl-step')];
const plDots = [...pillars.querySelectorAll('.pl-dots a')];
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
let ticking = false;
const update = () => {
  ticking = false;
  const vh = innerHeight;
  nav.classList.toggle('solid', hero.getBoundingClientRect().bottom < 80);
  // cada etapa: a palavra cresce, sobe e preenche; depois o texto aparece
  let active = -1;
  plSteps.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const q = clamp(-r.top / Math.max(1, r.height - vh));
    el.style.setProperty('--g', ease(q / 0.3).toFixed(3));
    el.style.setProperty('--m', ease((q - 0.3) / 0.28).toFixed(3));
    el.style.setProperty('--t', ease((q - 0.5) / 0.22).toFixed(3));
    if (r.top < vh * 0.5 && r.bottom > vh * 0.5) active = i;
  });
  const pr = pillars.getBoundingClientRect();
  pillars.classList.toggle('dots-on', pr.top < vh * 0.4 && pr.bottom > vh * 0.6 && active >= 0);
  plDots.forEach((d, i) => d.setAttribute('aria-current', i === active ? 'step' : 'false'));
};
// atalhos levam ao ponto em que a etapa já está com o texto visível
pillars.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  const step = a && plSteps.find((s) => `#${s.id}` === a.getAttribute('href'));
  if (!step) return;
  e.preventDefault();
  const top = step.getBoundingClientRect().top + scrollY + (step.offsetHeight - innerHeight) * (calm ? 0 : 0.8);
  scrollTo({ top: Math.round(top), behavior: calm ? 'auto' : 'smooth' });
});
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
update();

const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

/* ---------- Mensagem guiada ---------- */
// Número de WhatsApp da Sobanski com DDI e DDD, só dígitos (ex.: '5542999999999').
// Enquanto estiver vazio, o WhatsApp abre com a mensagem pronta para escolher o contato.
const WHATSAPP = '5542998063561'; // número do botão 'Quero conhecer' do site oficial da Sobanski
const form = $('builder'), hint = $('hint2');
let message = '';
function compose() {
  const f = new FormData(form);
  const vals = f.getAll('val');
  const where = chosen?.floor && chosen.model && f.get('tipo') === chosen.model.form ? ` no ${chosen.floor.name}` : '';
  const liked = vals.length ? ` O que mais valorizo: ${vals.length > 1 ? `${vals.slice(0, -1).join(', ')} e ${vals.at(-1)}` : vals[0]}.` : '';
  message = `Olá! Conheci o Edifício Santa Ana pelo site. Tenho interesse em ${f.get('obj')} e gostaria de conhecer ${f.get('tipo')}${where}.${liked} Podem me enviar mais informações?`;
}
form.addEventListener('change', compose);
compose();
$('send').addEventListener('click', () => {
  compose();
  const text = encodeURIComponent(message);
  const url = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
  window.open(url, '_blank', 'noopener');
  hint.textContent = 'Abrindo o WhatsApp com a sua mensagem…';
});

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
