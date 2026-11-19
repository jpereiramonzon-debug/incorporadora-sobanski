// Atendimento guiado: botão flutuante do WhatsApp que abre uma conversa curta
// e entrega a mensagem pronta no WhatsApp da Sobanski.
const WHATSAPP = '5542998063561'; // número do botão "Quero conhecer" do site oficial
const TYPING_MS = 400;

// troque por <img src="assets/logo-sobanski.svg" alt=""> quando tiver o arquivo da logo
const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#0e1014"/><circle cx="20" cy="20" r="17.5" fill="none" stroke="#c9a45c" stroke-width="1"/><text x="20" y="27.2" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="20" font-weight="500" fill="#e8cf9a">S</text></svg>';
const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';

const INTERESTS = [
  { id: 't01', label: 'Ap Tipo 01', sub: '60,60 m² · 2 quartos', text: 'no Apartamento Tipo 01' },
  { id: 't02', label: 'Ap Tipo 02', sub: '60,94 m² · 2 quartos', text: 'no Apartamento Tipo 02' },
  { id: 't03', label: 'Ap Tipo 03 e 05', sub: '57,00 m² · 2 quartos', text: 'no Apartamento Tipo 03 e 05' },
  { id: 't04', label: 'Ap Tipo 04', sub: '30,85 m² · 1 quarto', text: 'no Apartamento Tipo 04' },
  { id: 'social', label: 'Áreas sociais', sub: 'salão, kids, pet', text: 'nas áreas sociais' },
  { id: 'all', label: 'Ainda não sei', sub: 'quero ver as opções', text: 'em conhecer as opções de apartamentos' },
];
const GOALS = [{ id: 'morar', label: 'Para morar' }, { id: 'investir', label: 'Para investir' }];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let root, log, foot, fab, opened = false, running = 0;
let data = { name: '', goal: '', interest: null, where: '' };

function build() {
  root = document.createElement('div');
  root.className = 'wa';
  root.innerHTML = `
    <button type="button" class="wa-fab" aria-label="Falar com a Sobanski pelo WhatsApp" aria-expanded="false" aria-controls="waPanel">${WA}<span class="wa-dot" aria-hidden="true"></span></button>
    <section class="wa-panel" id="waPanel" role="dialog" aria-label="Atendimento Sobanski" hidden>
      <header class="wa-head">
        <span class="wa-avatar">${LOGO}</span>
        <span class="wa-who"><b>Sobanski Incorporadora</b><small><i aria-hidden="true"></i>Online agora</small></span>
        <button type="button" class="wa-close" aria-label="Fechar atendimento">&times;</button>
      </header>
      <div class="wa-log" role="log" aria-live="polite"></div>
      <div class="wa-foot"></div>
    </section>`;
  document.body.appendChild(root);
  fab = root.querySelector('.wa-fab');
  log = root.querySelector('.wa-log');
  foot = root.querySelector('.wa-foot');
  fab.addEventListener('click', () => (opened ? close() : open()));
  root.querySelector('.wa-close').addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && opened) close(); });
}

function scroll() { log.scrollTop = log.scrollHeight; }
function add(html, who = 'bot') {
  const el = document.createElement('div');
  el.className = `wa-msg wa-${who}`;
  el.innerHTML = html;
  log.appendChild(el);
  scroll();
  return el;
}
async function say(html, run) {
  const t = add('<span class="wa-typing" aria-label="digitando"><i></i><i></i><i></i></span>');
  await wait(TYPING_MS);
  if (run !== running) return false; // conversa reiniciada no meio
  t.innerHTML = html;
  scroll();
  return true;
}
const choose = (opts, cls = '') => new Promise((res) => {
  foot.innerHTML = `<div class="wa-quick ${cls}">${opts.map((o, i) => `<button type="button" data-i="${i}">${esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('')}</div>`;
  foot.querySelector('button')?.focus({ preventScroll: true });
  requestAnimationFrame(scroll);
  foot.querySelector('.wa-quick').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const o = opts[+b.dataset.i];
    foot.innerHTML = '';
    add(esc(o.label), 'me');
    res(o);
  });
});
const ask = (placeholder) => new Promise((res) => {
  foot.innerHTML = `<form class="wa-input"><input type="text" name="v" maxlength="40" autocomplete="given-name" placeholder="${placeholder}" aria-label="${placeholder}" required><button type="submit" aria-label="Enviar">&#10148;</button></form>`;
  const f = foot.querySelector('form'), input = f.querySelector('input');
  input.focus({ preventScroll: true });
  requestAnimationFrame(scroll);
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim().replace(/\s+/g, ' ');
    if (!v) return;
    foot.innerHTML = '';
    add(esc(v), 'me');
    res(v);
  });
});

function message() {
  const first = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  const it = data.interest;
  const what = it.id === 'all' ? it.text : `${it.text}${data.where ? ` no ${data.where}` : ''}`;
  return `Olá, Sobanski! Meu nome é ${first} e tenho interesse ${what} do Edifício Santa Ana, ${data.goal === 'investir' ? 'para investir' : 'para morar'}. Podem me enviar mais informações?`;
}

async function flow() {
  const run = ++running;
  log.innerHTML = ''; foot.innerHTML = '';
  if (!(await say('Olá! Que bom ter você por aqui. Sou da equipe <b>Sobanski</b> e vou te ajudar a conhecer o <b>Edifício Santa Ana</b>.', run))) return;
  if (!(await say('Para começar, como posso te chamar?', run))) return;
  data.name = await ask('Seu nome');
  if (run !== running) return;
  if (!(await say(`Prazer, ${esc(data.name)}! Você procura um apartamento…`, run))) return;
  data.goal = (await choose(GOALS)).id;
  if (run !== running) return;
  if (data.interest) {
    if (!(await say(`Vi que você estava olhando <b>${esc(data.interest.label.replace('Ap ', 'o Apartamento '))}</b>${data.where ? ` no ${esc(data.where)}` : ''}. Vou incluir na mensagem.`, run))) return;
  } else {
    if (!(await say('E qual opção mais te interessa?', run))) return;
    data.interest = await choose(INTERESTS, 'wa-grid');
    if (run !== running) return;
  }
  if (!(await say(`Perfeito, ${esc(data.name)}! Sua mensagem já está pronta. É só tocar no botão abaixo para falar com a nossa equipe no WhatsApp.`, run))) return;
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message())}`;
  foot.innerHTML = `
    <a class="wa-go" href="${url}" target="_blank" rel="noopener"><span class="wa-go-logo">${LOGO}</span><span>Iniciar conversa no WhatsApp</span>${WA}</a>
    <button type="button" class="wa-restart">Recomeçar</button>`;
  foot.querySelector('.wa-restart').addEventListener('click', () => { data = { name: '', goal: '', interest: null, where: '' }; flow(); });
  foot.querySelector('.wa-go').focus({ preventScroll: true });
  requestAnimationFrame(scroll); // mantém a confirmação visível acima do botão
}

export function open(preset = {}) {
  if (!root) build();
  const fresh = !opened && (!log.childElementCount || preset.interest);
  if (preset.interest) {
    data.interest = INTERESTS.find((i) => i.id === preset.interest) || null;
    data.where = preset.where || '';
  }
  opened = true;
  root.classList.add('open');
  root.querySelector('.wa-panel').hidden = false;
  fab.setAttribute('aria-expanded', 'true');
  if (fresh) { if (!preset.interest) { data.interest = null; data.where = ''; } flow(); }
}
export function close() {
  if (!root) return;
  opened = false;
  root.classList.remove('open');
  root.querySelector('.wa-panel').hidden = true;
  fab.setAttribute('aria-expanded', 'false');
  fab.focus({ preventScroll: true });
}

build();
// links do site que apontam para o contato abrem o atendimento
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href$="#contato"]');
  if (!a) return;
  e.preventDefault();
  open();
});
window.SobanskiChat = { open, close };
