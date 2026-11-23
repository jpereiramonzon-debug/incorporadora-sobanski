// Camada cinematográfica: rolagem suave (Lenis), revelações e parallax (GSAP + ScrollTrigger),
// expansão de imagem, galeria horizontal, cursor e botões magnéticos.
// Tudo usa apenas transform, opacity e clip-path; sem GSAP (ou com "reduzir movimento") o site
// continua completo e estático.
const gsap = window.gsap, ST = window.ScrollTrigger, Lenis = window.Lenis;
const root = document.documentElement;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- títulos: cada palavra entra por uma máscara ---------- */
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
}
document.querySelectorAll('[data-split]').forEach(splitWords);

// áreas com rolagem própria não devem ser capturadas pela rolagem suave
document.querySelectorAll('.panel-body, .nav-drawer').forEach((e) => e.setAttribute('data-lenis-prevent', ''));

if (!gsap || !ST || calm) {
  root.classList.add('cine-static');
} else {
  gsap.registerPlugin(ST);
  root.classList.add('cine-on');
  gsap.defaults({ ease: 'power3.out' });

  /* ---------- rolagem suave (só no computador; no toque a rolagem nativa é mais leve) ---------- */
  let lenis = null;
  if (fine && Lenis) {
    // suavização curta e responsiva: a página acompanha a roda quase na hora (antes 1,25 s de inércia
    // davam a sensação de site pesado/atrasado)
    lenis = new Lenis({ lerp: 0.16, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
    // pausa durante a abertura e libera quando ela termina
    const sync = () => (root.classList.contains('intro-on') ? lenis.stop() : lenis.start());
    sync();
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
    // âncoras internas com a mesma suavidade
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      const id = a.getAttribute('href');
      if (id === '#contato' || id.length < 2) return; // #contato abre o atendimento
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { duration: 1.6 });
    });
  }

  /* ---------- títulos com palavras revelando ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (el.closest('.cine')) return; // o título da expansão anda junto com a rolagem
    gsap.from(el.querySelectorAll('.wi'), {
      yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });

  /* ---------- 1. expansão: a vista do prédio abre até a tela cheia ---------- */
  const cine = document.querySelector('.cine');
  if (cine) {
    const narrow = innerWidth < 760;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: cine, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
    });
    // a vista de Mallet já entra grande e visível; termina de abrir e o título aparece no começo da
    // rolagem (antes a janela começava pequena e o título só surgia depois de ~60% da seção)
    tl.fromTo('.cine-frame', { clipPath: narrow ? 'inset(9% 5% 9% 5% round 16px)' : 'inset(9% 12% 9% 12% round 18px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.6 }, 0)
      .fromTo('.cine-frame img', { scale: 1.14 }, { scale: 1, duration: 1 }, 0)
      .fromTo('.cine-frame', { '--shade': 0.45 }, { '--shade': 1, duration: 0.4 }, 0)
      .fromTo('.cine-copy .eyebrow', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.2 }, 0.08)
      .fromTo('.cine-copy .wi', { yPercent: 115 }, { yPercent: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }, 0.12);
  }

  /* ---------- 2. camadas com profundidade ---------- */
  document.querySelectorAll('[data-speed]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -+el.dataset.speed }, {
      yPercent: +el.dataset.speed, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  document.querySelectorAll('.ly img').forEach((img) => {
    gsap.fromTo(img, { scale: 1.16 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom 40%', scrub: true } });
  });
  document.querySelectorAll('.ly').forEach((f) => {
    gsap.fromTo(f, { clipPath: 'inset(12% 0% 12% 0%)', opacity: 0 }, {
      clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: f, start: 'top 88%' },
    });
  });
  const hl = document.querySelectorAll('.hl li');
  if (hl.length) gsap.from(hl, { opacity: 0, y: 22, duration: 1.1, stagger: 0.06, scrollTrigger: { trigger: '.hl', start: 'top 85%' } });

  /* ---------- 3. interiores: galeria horizontal (computador) ou vertical (celular) ---------- */
  const gal = document.querySelector('.gallery-x');
  if (gal) {
    const track = gal.querySelector('.g-track'), bar = gal.querySelector('.g-progress i');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', () => {
      const dist = () => track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft);
      const move = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: gal, pin: '.g-pin', start: 'top top', end: () => `+=${dist()}`, scrub: 1, invalidateOnRefresh: true,
          onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }),
        },
      });
      gal.querySelectorAll('.g-slide').forEach((sl) => {
        gsap.fromTo(sl.querySelector('.g-media'), { scale: 0.84 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: sl, containerAnimation: move, start: 'left right', end: 'center 55%', scrub: true },
        });
        gsap.fromTo(sl.querySelector('img'), { xPercent: -6 }, {
          xPercent: 6, ease: 'none',
          scrollTrigger: { trigger: sl, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
        });
        gsap.from(sl.querySelector('.g-cap'), {
          opacity: 0, y: 30, duration: 1.2,
          scrollTrigger: { trigger: sl, containerAnimation: move, start: 'left 70%' },
        });
      });
    });
    mm.add('(max-width: 860px)', () => {
      gal.querySelectorAll('.g-slide').forEach((sl) => {
        gsap.fromTo(sl.querySelector('.g-media'), { clipPath: 'inset(0% 0% 100% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out',
          scrollTrigger: { trigger: sl, start: 'top 85%' },
        });
        gsap.fromTo(sl.querySelector('img'), { scale: 1.22 }, {
          scale: 1, ease: 'none', scrollTrigger: { trigger: sl, start: 'top bottom', end: 'bottom 30%', scrub: true },
        });
      });
    });
  }

  /* ---------- 4. imagem final: aproximação lenta ---------- */
  const still = document.querySelector('.still');
  if (still) {
    gsap.fromTo('.still-img img', { scale: 1.18 }, {
      scale: 1, ease: 'none', scrollTrigger: { trigger: still, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
    gsap.from('.still-copy .eyebrow, .still-copy .btn', { opacity: 0, y: 24, duration: 1.4, stagger: 0.2, delay: 0.3, scrollTrigger: { trigger: still, start: 'top 60%' } });
  }

  /* ---------- 5. cursor e botões magnéticos (somente mouse) ---------- */
  if (fine) {
    const cur = document.createElement('div');
    cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="cursor-ring"></span>';
    document.body.appendChild(cur);
    // anel sem texto, colado ao mouse (antes chegava 0,55 s atrasado e parecia lentidão)
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.12, ease: 'power2' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.12, ease: 'power2' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); cur.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    document.addEventListener('pointerover', (e) => {
      cur.classList.toggle('is-link', !!e.target.closest('a, button, [role="button"], label'));
    });
    window.SobanskiCursor = { set() {} }; // rótulos removidos

    const magnet = (el, k = 0.28) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * k); my((e.clientY - r.top - r.height / 2) * k);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    };
    document.querySelectorAll('[data-magnetic]').forEach((el) => magnet(el));
  }

  // medidas finais depois que fontes e imagens carregam
  const refresh = () => ST.refresh();
  addEventListener('load', refresh);
  document.fonts?.ready.then(refresh);
}
