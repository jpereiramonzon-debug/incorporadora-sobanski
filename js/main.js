const $ = (id) => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Conteúdo: edite aqui andares e modelos ---------- */
const BUILDING_FEATURES = ['Elevador', 'Forro de gesso', 'Infraestrutura para ar-condicionado', 'Piso aquecido', 'Personalização durante a obra'];

const MODELS = {
  t02: {
    name: 'Apartamento Tipo 02',
    short: 'Tipo 02',
    form: 'o Apartamento Tipo 02',
    summary: '60,94 m² · 2 quartos · 1 vaga',
    tagline: 'Conforto e funcionalidade em cada detalhe.',
    specs: [['60,94 m²', 'área total'], ['78,63 m²', 'área equivalente'], ['2', 'quartos'], ['1', 'banheiro'], ['1', 'vaga de garagem']],
    features: ['1 quarto com sacada privativa', 'Sacada com churrasqueira e área de serviço', 'Piso aquecido no banheiro'],
    media: [
      ['assets/tipo02-planta.jpg', 'Planta', 'Planta do Apartamento Tipo 02'],
      ['assets/tipo02-sala-jantar.jpg', 'Estar e jantar', 'Sala de estar integrada à mesa de jantar e à cozinha'],
      ['assets/tipo02-sala-tv.jpg', 'Sala de TV', 'Sala com painel de madeira, TV e ar-condicionado'],
      ['assets/tipo02-cozinha.jpg', 'Cozinha', 'Cozinha com prateleiras iluminadas e mesa redonda'],
      ['assets/tipo02-quarto-1.jpg', 'Quarto', 'Quarto com cabeceira estofada e closet'],
      ['assets/tipo02-quarto-2.jpg', 'Quarto', 'Quarto com painel de madeira e ar-condicionado'],
    ],
  },
  t03: {
    name: 'Apartamento Tipo 03',
    short: 'Tipo 03',
    form: 'o Apartamento Tipo 03',
    summary: 'Planta e imagens com a equipe',
    tagline: 'Peça a planta e as imagens deste modelo à equipe Sobanski.',
  },
};

const FLOORS = [
  { k: '3', name: '3º andar', models: ['t02', 't03'] },
  { k: '2', name: '2º andar', models: ['t02', 't03'] },
  { k: '1', name: '1º andar', models: ['t02', 't03'] },
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
      ${m.media ? `<img src="${m.media[0][0]}" alt="">` : '<span class="model-ph" aria-hidden="true">03</span>'}
      <span><b>${m.name}</b><small>${m.summary}</small></span><i aria-hidden="true">&rarr;</i>
    </button>`;
  }).join('')}</div>`;

const viewGround = (f) => `
  <p class="eyebrow">${f.name}</p>
  <h2>Acesso e garagem</h2>
  <figure class="media"><img src="assets/fachada.jpg" alt="Fachada do Edifício Santa Ana com muro iluminado e letreiro"></figure>
  <p>A chegada ao Santa Ana: fachada iluminada ao entardecer, portões de acesso e as vagas de garagem sob o edifício.</p>
  <h3>No edifício</h3>${chips(BUILDING_FEATURES)}
  <div class="actions"><button type="button" class="btn" data-cta>Quero conhecer o edifício</button></div>`;

const viewModel = (f, m) => `
  <p class="eyebrow">${f.name}</p>
  <h2>${m.name}</h2>
  <p class="lead">${m.tagline}</p>
  ${m.media ? `
  <figure class="media" id="media"><img src="${m.media[0][0]}" alt="${m.media[0][2]}"><figcaption>${m.media[0][1]}</figcaption></figure>
  <div class="thumbs" role="group" aria-label="Planta e fotos">${m.media.map(([src, cap], i) =>
    `<button type="button" data-i="${i}" aria-label="${cap}" aria-pressed="${i === 0}"><img src="${src}" alt="" loading="lazy"></button>`).join('')}</div>
  <dl class="specs">${m.specs.map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>
  <h3>Neste apartamento</h3><ul class="feats">${m.features.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
  <h3>No edifício</h3>${chips(BUILDING_FEATURES)}
  <div class="actions"><button type="button" class="btn" data-cta>Tenho interesse no ${m.short}</button></div>
  ${m.media ? '<small class="muted">Imagens ilustrativas. Medidas conforme material de divulgação.</small>' : ''}`;

const render = () => {
  const f = floorOf(state.floor);
  const open = !!f;
  hero.classList.toggle('has-panel', open);
  panel.hidden = !open;
  viewer?.setPanel(open);
  viewer?.select(state.floor);
  document.querySelectorAll('#floors button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === state.floor));
  if (!open) return;
  const m = MODELS[state.model];
  back.hidden = !m;
  back.textContent = m ? `‹ ${f.name}` : '';
  body.innerHTML = m ? viewModel(f, m) : f.models.length ? viewFloor(f) : viewGround(f);
  body.scrollTop = 0;
  body.classList.remove('enter'); void body.offsetWidth; body.classList.add('enter');
};
const openFloor = (k) => { state.floor = k; state.model = null; render(); };
const closePanel = () => { state.floor = state.model = null; render(); };

body.addEventListener('click', (e) => {
  const model = e.target.closest('[data-model]');
  const thumb = e.target.closest('.thumbs button');
  if (model) { state.model = model.dataset.model; render(); }
  else if (thumb) {
    const [src, cap, alt] = MODELS[state.model].media[+thumb.dataset.i];
    $('media').innerHTML = `<img src="${src}" alt="${alt}"><figcaption>${cap}</figcaption>`;
    thumb.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === thumb));
  } else if (e.target.closest('[data-cta]')) {
    chosen = { floor: floorOf(state.floor), model: MODELS[state.model] };
    const value = chosen.model?.form ?? 'todas as plantas disponíveis';
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
$('rotL').addEventListener('click', () => viewer?.rotate(-0.6));
$('rotR').addEventListener('click', () => viewer?.rotate(0.6));

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

/* ---------- Rolagem: menu e linha do tempo ---------- */
const nav = $('nav'), timeline = $('timeline');
const steps = [...timeline.querySelectorAll('.tl-step')];
let ticking = false;
const update = () => {
  ticking = false;
  const vh = innerHeight;
  nav.classList.toggle('solid', hero.getBoundingClientRect().bottom < 80);
  const t = timeline.getBoundingClientRect();
  const tp = clamp((vh * 0.7 - t.top) / (t.height * 0.75));
  timeline.style.setProperty('--t', tp.toFixed(3));
  steps.forEach((s, i) => s.classList.toggle('on', tp >= i * 0.42 + 0.02));
};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
update();

const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

/* ---------- Mensagem guiada ---------- */
const form = $('builder'), msg = $('msg'), hint = $('hint2');
function compose() {
  const f = new FormData(form);
  const vals = f.getAll('val');
  const where = chosen?.floor && chosen.model && f.get('tipo') === chosen.model.form ? ` no ${chosen.floor.name}` : '';
  const liked = vals.length ? ` O que mais valorizo: ${vals.length > 1 ? `${vals.slice(0, -1).join(', ')} e ${vals.at(-1)}` : vals[0]}.` : '';
  msg.textContent = `Olá! Conheci o Edifício Santa Ana pelo site. Tenho interesse em ${f.get('obj')} e gostaria de conhecer ${f.get('tipo')}${where}.${liked} Podem me enviar mais informações?`;
}
form.addEventListener('change', compose);
compose();
$('send').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(msg.textContent);
    hint.textContent = 'Mensagem copiada. É só colar na conversa do Instagram.';
  } catch {
    hint.textContent = 'Copie a mensagem acima e cole na conversa do Instagram.';
  }
  window.open('https://ig.me/m/sobanski.incorporadora', '_blank', 'noopener');
});

$('year').textContent = new Date().getFullYear();
