/* =============================================================================
   TORRINO SPORTING CENTER — UI
   -----------------------------------------------------------------------------
   Vanilla JS, nessuna dipendenza. Ogni blocco è un modulo indipendente
   registrato in `modules[]` e inizializzato al DOMContentLoaded: se un modulo
   fallisce, gli altri continuano a funzionare.

   Tutti i contenuti provengono da `window.TSC` (js/data.js). Qui non ci sono
   dati di business: solo rendering e interazione.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const TSC = window.TSC;
  if (!TSC) {
    console.error('[TSC] js/data.js non caricato: la UI non può essere popolata.');
    return;
  }

  /* ===========================================================================
     UTILITY
     ======================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Escape per ogni stringa proveniente dai dati o dall'utente. */
  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
    );

  /** Link wa.me con il messaggio già scritto nella chat. */
  const whatsappHref = (text) => `${TSC.club.whatsapp}?text=${encodeURIComponent(text)}`;

  /**
   * Telefono in formato internazionale E.164. Senza prefisso si assume l'Italia
   * (+39); restituisce '' se il numero non è valido. Deve restare identica a
   * normalizePhone in functions/api/lead.js, che rifà lo stesso controllo.
   */
  const normalizePhone = (raw) => {
    let s = String(raw || '').trim().replace(/[\s.\-()/]/g, '');
    if (s.startsWith('00')) s = `+${s.slice(2)}`;
    if (!s.startsWith('+')) s = /^39\d{9,}$/.test(s) ? `+${s}` : `+39${s}`;
    if (!/^\+[1-9]\d{6,14}$/.test(s)) return '';
    if (s.startsWith('+39') && !/^\+39\d{6,11}$/.test(s)) return '';
    return s;
  };
  const PHONE_ERROR = 'Numero non valido. Esempio: +39 333 123 4567 (il +39 lo aggiungiamo noi).';

  /** Messaggio libero dei form: stesso limite di MAX_MESSAGE in functions/api/lead.js. */
  const MAX_MESSAGE = 1000;
  const messageRule = (v) => (v.trim().length <= MAX_MESSAGE ? '' : `Massimo ${MAX_MESSAGE} caratteri.`);

  // Contatore "n / max" sotto ogni textarea con [data-count-for]: delegato, così
  // vale anche per i form creati dopo (modale lead) e si azzera con form.reset().
  const updateCounter = (el) => {
    const hint = document.querySelector(`[data-count-for="${el.id}"]`);
    if (hint) hint.textContent = `${el.value.length} / ${el.maxLength > 0 ? el.maxLength : MAX_MESSAGE}`;
  };
  document.addEventListener('input', (e) => {
    if (e.target.matches && e.target.matches('textarea')) updateCounter(e.target);
  });
  document.addEventListener('reset', (e) => {
    setTimeout(() => $$('textarea', e.target).forEach(updateCounter));
  });

  /** Campo trappola per i bot: invisibile, fuori dal tab e dagli screen reader. */
  const honeypot = (id) => `
    <div class="u-visually-hidden" aria-hidden="true">
      <label for="${id}">Lascia vuoto questo campo</label>
      <input id="${id}" name="website" type="text" tabindex="-1" autocomplete="off">
    </div>`;

  /** Testo con evidenziatore: `*parola*` → .u-mark. L'escape avviene PRIMA. */
  const rich = (str) => esc(str).replace(/\*(.+?)\*/g, '<span class="u-mark">$1</span>');

  /** Giorno corrente nel formato usato dai dati (settimana che inizia lunedì). */
  const todayName = () => TSC.days[(new Date().getDay() + 6) % 7];

  /** Icona a tratto 24×24 nello stile del sito. */
  const line = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  const ICONS = {
    // Icone delle pagine verticali (richiamate per nome da TSC.verticals)
    loop: line('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7"/>'),
    alert: line('<path d="M12 4 2.8 19.5h18.4L12 4Z"/><path d="M12 10v4.2M12 17v.1"/>'),
    ruler: line('<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6.5 8v3M10.5 8v4.5M14.5 8v3M18.5 8v4.5"/>'),
    clipboard: line('<rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="M9 4.5V3h6v1.5M8.8 10h6.4M8.8 13.5h6.4M8.8 17h3.6"/>'),
    users: line('<circle cx="9" cy="8.5" r="3.2"/><path d="M3.2 19.5a5.8 5.8 0 0 1 11.6 0M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.2a5.6 5.6 0 0 1 3.3 5.3"/>'),
    chart: line('<path d="M3.5 20.5h17M6.5 17v-4M10.5 17V9M14.5 17v-6M18.5 17V5"/>'),
    screen: line('<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>'),
    heartLine: line('<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/>'),
    smile: line('<circle cx="12" cy="12" r="8.6"/><path d="M8.3 14a4.3 4.3 0 0 0 7.4 0M9 9.6v.2M15 9.6v.2"/>'),
    compass: line('<circle cx="12" cy="12" r="8.6"/><path d="m15.4 8.6-2 4.8-4.8 2 2-4.8 4.8-2Z"/>'),
    sprout: line('<path d="M12 20.5V11M12 11C12 7.4 9.4 5 5.4 5c0 3.8 2.6 6 6.6 6ZM12 13.5c0-3.3 2.4-5.6 6.4-5.6 0 3.6-2.4 5.6-6.4 5.6Z"/>'),
    flame: line('<path d="M12 21a6.5 6.5 0 0 0 6.5-6.5c0-4.2-3.4-6.4-4.3-10.5C11.6 6 10 8.4 10 10.8 8.8 10.2 8.2 9 8.1 8 6.4 9.6 5.5 12 5.5 14.5A6.5 6.5 0 0 0 12 21Z"/>'),
    battery: line('<rect x="2.5" y="7.5" width="17" height="9" rx="2"/><path d="M21.5 11v2M6 11v2"/>'),
    target: line('<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>'),
    calendar: line('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h2M11 14h2M14.5 14h2M7.5 17.2h2"/>'),
    drop: line('<path d="M12 3.2S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3.2 12 3.2Z"/><path d="M9 15.2a3 3 0 0 0 2.6 2.6"/>'),
    wind: line('<path d="M3 9h11.5a3 3 0 1 0-3-3M3 13h15.5a3 3 0 1 1-3 3M3 17h7"/>'),
    moon: line('<path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z"/>'),
    check: line('<path d="m5 12.5 4.2 4.2L19 7"/>'),
    phone: line('<path d="M5 4.5h3.2l1.6 4-2 1.3a10 10 0 0 0 6.4 6.4l1.3-2 4 1.6V19a1.6 1.6 0 0 1-1.7 1.6A15.6 15.6 0 0 1 3.4 6.2 1.6 1.6 0 0 1 5 4.5Z"/>'),
    chat: line('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12Z"/>'),

    instagram:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 8.5V6.9c0-.8.3-1.2 1.2-1.2h1.6V2.8h-2.6c-2.6 0-3.6 1.7-3.6 3.8v1.9H9v3h2.1V21h3.4v-9.5h2.4l.4-3h-2.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 3v11.4a3.4 3.4 0 1 1-2.7-3.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 3c.4 2.6 2 4.2 4.6 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" fill="currentColor"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M7.5 10.5V17M7.5 7.6v.1M11.5 17v-3.6a2 2 0 0 1 4 0V17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.6V12l3 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.6" y="5" width="16.8" height="15" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M3.6 9.6h16.8M8.4 3v3.4M15.6 3v3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s6.4-5.3 6.4-10A6.4 6.4 0 0 0 5.6 11c0 4.7 6.4 10 6.4 10Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10.6" r="2.3" stroke="currentColor" stroke-width="1.6"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  /* ===========================================================================
     HEADER — stato sticky, auto-hide, menu mobile, scrollspy
     ======================================================================== */
  function initHeader() {
    const header = $('#site-header');
    const nav = $('#primary-nav');
    const burger = $('[data-burger]');
    if (!header || !nav || !burger) return;

    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (nav.classList.contains('is-open')) {
        header.dataset.state = 'scrolled';
      } else if (y < 40) {
        header.dataset.state = 'top';
      } else if (y > lastY && y > 320) {
        header.dataset.state = 'hidden'; // scroll giù: libera lo schermo
      } else {
        header.dataset.state = 'scrolled';
      }
      lastY = y;
    };

    const closeNav = () => {
      nav.classList.remove('is-open');
      header.classList.remove('is-nav-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Apri il menu');
      document.body.classList.remove('is-locked');
    };

    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      header.classList.toggle('is-nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
      document.body.classList.toggle('is-locked', open);
      if (open) header.dataset.state = 'scrolled';
    });

    nav.addEventListener('click', (e) => {
      if (e.target.closest('a, [data-lead-open]')) closeNav();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        burger.focus();
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Scrollspy: evidenzia la voce di menu della sezione a schermo
    const links = $$('.nav__link[href^="#"]', nav);
    const targets = links
      .map((a) => ({ link: a, section: document.getElementById(a.getAttribute('href').slice(1)) }))
      .filter((t) => t.section);

    if ('IntersectionObserver' in window && targets.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((l) => l.classList.remove('is-active'));
            const match = targets.find((t) => t.section === entry.target);
            if (match) match.link.classList.add('is-active');
          });
        },
        { rootMargin: '-45% 0px -50% 0px' },
      );
      targets.forEach((t) => spy.observe(t.section));
    }
  }

  /* ===========================================================================
     REVEAL ON SCROLL — un solo observer per tutta la pagina
     ======================================================================== */
  const revealObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-in');
              obs.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        )
      : null;

  function observeReveals(root = document) {
    $$('.reveal', root).forEach((el) => {
      if (el.dataset.delay) el.style.setProperty('--reveal-delay', `${el.dataset.delay}ms`);
      if (!revealObserver) return el.classList.add('is-in');
      revealObserver.observe(el);
    });
  }

  /* ===========================================================================
     PARALLAX — sfondo della hero, disattivato con reduced motion
     ======================================================================== */
  function initMotion() {
    if (prefersReducedMotion()) return;

    // Parallax leggero sugli sfondi marcati data-parallax
    const layers = $$('[data-parallax]');
    if (layers.length) {
      let ticking = false;
      const update = () => {
        const y = window.scrollY;
        layers.forEach((l) => {
          const speed = parseFloat(l.dataset.parallax) || 0.15;
          l.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
        });
        ticking = false;
      };
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
          }
        },
        { passive: true },
      );
      update();
    }
  }

  /* ===========================================================================
     STATISTICHE — contatori animati (TSC.club.stats)
     ======================================================================== */
  function initStats() {
    const list = $('#stats');
    if (!list) return;

    list.innerHTML = TSC.club.stats
      .map(
        (s, i) => `
      <li class="reveal" data-delay="${i * 80}">
        <span class="stats__value">
          <span data-count="${s.value}">0</span><span class="stats__suffix">${esc(s.suffix)}</span>
        </span>
        <span class="stats__label">${esc(s.label)}</span>
        <span class="stats__note">${esc(s.note)}</span>
      </li>`,
      )
      .join('');

    const run = (node) => {
      const target = Number(node.dataset.count);
      if (prefersReducedMotion() || !Number.isFinite(target)) {
        node.textContent = target.toLocaleString('it-IT');
        return;
      }
      const dur = 1500;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased).toLocaleString('it-IT');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const nodes = $$('[data-count]', list);
    if (!('IntersectionObserver' in window)) return nodes.forEach(run);

    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          run(e.target);
          o.unobserve(e.target);
        });
      },
      { threshold: 0.5 },
    );
    nodes.forEach((n) => obs.observe(n));
  }

  /* ===========================================================================
     ATTIVITÀ — griglia asimmetrica delle discipline (orari.html)
     Ogni scheda rimanda alla pagina verticale della disciplina, se esiste.
     ======================================================================== */
  async function initActivities() {
    const grid = $('#activity-grid');
    if (!grid) return;

    const all = await TSC.api.getActivities();
    // `data-limit` sulla griglia taglia le schede mostrate (versione teaser).
    const limit = parseInt(grid.dataset.limit, 10);
    const activities = Number.isFinite(limit) ? all.slice(0, limit) : all;

    grid.innerHTML = activities
      .map(
        (a, i) => `
      <article class="activity activity--${esc(a.size)} reveal" data-category="${esc(a.category)}" data-delay="${(i % 3) * 90}">
        <div class="activity__media"><img src="${esc(a.img)}" alt="${esc(a.alt)}" loading="lazy" width="1200" height="1500"></div>
        <div class="activity__body">
          <span class="activity__index">${String(i + 1).padStart(2, '0')}</span>
          <p class="activity__tagline">${esc(a.tagline)}</p>
          <h3 class="activity__name">${esc(a.name)}</h3>
          <div class="activity__reveal">
            <div>
              <p class="activity__desc">${esc(a.description)}</p>
              <ul class="activity__meta">
                <li>${esc(a.level)}</li>
                <li>${esc(a.duration)}</li>
                <li>${esc(a.trainer)}</li>
              </ul>
              ${
                a.vertical && TSC.routes[a.vertical]
                  ? `<a class="activity__cta" href="${TSC.routes[a.vertical]}">Scopri il percorso ${ICONS.arrow}</a>`
                  : `<a class="activity__cta" href="${TSC.routes.orari}">Vedi gli orari ${ICONS.arrow}</a>`
              }
            </div>
          </div>
        </div>
      </article>`,
      )
      .join('');

    observeReveals(grid);
  }

  /* ===========================================================================
     SCEGLI IL TUO MONDO — una scheda per pagina verticale (home + attivita.html)
     Ogni scheda parte dal bisogno (`card.hook`) e porta alla pagina dedicata;
     le discipline elencate sono le attività che puntano a quella verticale.
     ======================================================================== */
  async function initWorlds() {
    const grid = $('#world-grid');
    if (!grid) return;

    const [verticals, activities] = await Promise.all([TSC.api.getVerticals(), TSC.api.getActivities()]);

    grid.innerHTML = verticals
      .filter((v) => TSC.routes[v.id] && v.card)
      .map((v, i) => {
        const disciplines = activities.filter((a) => a.vertical === v.id).map((a) => a.name);
        return `
      <a class="world reveal" href="${TSC.routes[v.id]}" data-delay="${(i % 4) * 80}">
        <div class="world__media"><img src="${esc(v.hero.img)}" alt="" width="1200" height="1400" loading="lazy"></div>
        <div class="world__body">
          <p class="world__tagline">${esc(v.card.tagline)}</p>
          <h3 class="world__name">${esc(v.name)}</h3>
          <p class="world__hook">${esc(v.card.hook)}</p>
          ${
            disciplines.length > 1
              ? `<ul class="world__tags">${disciplines.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
              : ''
          }
          <span class="world__cta">Scopri il percorso ${ICONS.arrow}</span>
        </div>
      </a>`;
      })
      .join('');

    observeReveals(grid);
  }

  /* ===========================================================================
     PAGINE VERTICALI — percorso di comunicazione in 9 tappe (TSC.verticals)
     La pagina dichiara <body data-vertical="id"> e <div id="vertical">: qui si
     rendono tutte le sezioni, sempre nello stesso ordine. Le CTA portano
     `data-lead-open="<sorgente>"`, così il lead registra da quale punto arriva.
     ======================================================================== */
  const currentVerticalId = () => document.body.dataset.vertical || '';

  async function initVertical() {
    const root = $('#vertical');
    const id = currentVerticalId();
    if (!root || !id) return;

    const v = await TSC.api.getVertical(id);
    if (!v) {
      console.error(`[TSC] Verticale "${id}" non trovata in TSC.verticals.`);
      return;
    }
    const { club, routes } = TSC;
    const { hero, problem, solution, journey, stories, equipment, team, faq, final } = v;

    const cta = (source) => `
      <button class="btn btn--primary btn--lg v-cta" type="button" data-lead-open="${esc(source)}">
        ${esc(v.cta.label)} <span class="btn__icon" aria-hidden="true">${ICONS.arrow}</span>
      </button>`;

    const head = (block, note = block.lead) => `
      <div class="section__head">
        <div>
          <p class="eyebrow reveal">${esc(block.eyebrow)}</p>
          <h2 class="display display--sm reveal" data-delay="60">${rich(block.title)}</h2>
        </div>
        ${note ? `<p class="section__note reveal" data-delay="120">${esc(note)}</p>` : ''}
      </div>`;

    const initials = (name) => esc(name.trim().charAt(0).toUpperCase());

    root.innerHTML = `
      <!-- 1. Problema + prima CTA -->
      <section class="v-hero" id="v-hero">
        <div class="shell v-hero__inner">
          <div class="v-hero__copy">
            <nav class="crumbs" aria-label="Percorso di navigazione">
              <a href="${routes.home}">Home</a><span aria-hidden="true">/</span>
              <a href="${routes.attivita}">Attività</a><span aria-hidden="true">/</span>
              <span aria-current="page">${esc(v.name)}</span>
            </nav>
            ${
              v.logo
                ? `<img class="v-hero__logo" src="${esc(v.logo)}" alt="${esc(v.name)}" height="56">`
                : `<p class="eyebrow">${esc(hero.eyebrow)}</p>`
            }
            <h1 class="v-hero__title">${rich(hero.title)}</h1>
            <p class="v-hero__lead">${esc(hero.lead)}</p>
            <div class="v-hero__actions">
              ${cta('hero')}
              <a class="btn btn--outline btn--lg" href="#v-percorso">Scopri il percorso</a>
            </div>
            <ul class="v-trust">
              ${hero.trust.map((t) => `<li>${ICONS.check}${esc(t)}</li>`).join('')}
            </ul>
          </div>
          <div class="v-hero__visual">
            <img src="${esc(hero.img)}" alt="${esc(hero.alt)}" width="1200" height="1400" fetchpriority="high">
            <div class="v-proof surface-light">
              <p class="v-proof__value">${esc(hero.proof.value)} <span>${esc(hero.proof.unit)}</span></p>
              <p class="v-proof__label">${esc(hero.proof.label)}</p>
              <ul>${hero.proof.points.map((p) => `<li>${ICONS.check}${esc(p)}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Normalizzazione del problema -->
      <section class="section section--light v-problem" id="v-problema">
        <div class="shell">
          ${head(problem)}
          <div class="v-problem__grid">
            <ul class="v-pains">
              ${problem.pains
                .map(
                  (p, i) => `
                <li class="v-pain reveal" data-delay="${i * 90}">
                  <span class="v-icon">${ICONS[p.icon] || ICONS.check}</span>
                  <h3>${esc(p.title)}</h3>
                  <p>${esc(p.text)}</p>
                </li>`,
                )
                .join('')}
            </ul>
            <aside class="v-stat reveal" data-delay="270">
              <span class="v-stat__value">${esc(problem.stat.value)}</span>
              <p>${esc(problem.stat.text)}</p>
            </aside>
          </div>
        </div>
      </section>

      <!-- 3. La soluzione -->
      <section class="section section--light section--mist v-solution" id="v-soluzione">
        <div class="shell v-solution__inner">
          <div class="v-solution__copy">
            <p class="eyebrow reveal">${esc(solution.eyebrow)}</p>
            <h2 class="display display--sm reveal" data-delay="60">${rich(solution.title)}</h2>
            <p class="v-solution__lead reveal" data-delay="120">${esc(solution.lead)}</p>
            <div class="reveal" data-delay="180">${cta('soluzione')}</div>
          </div>
          <ul class="v-pillars">
            ${solution.pillars
              .map(
                (p, i) => `
              <li class="reveal" data-delay="${i * 80}">
                <span class="v-icon">${ICONS[p.icon] || ICONS.check}</span>
                <strong>${esc(p.title)}</strong>
                <span>${esc(p.text)}</span>
              </li>`,
              )
              .join('')}
          </ul>
        </div>
      </section>

      <!-- 4. Il percorso -->
      <section class="section v-journey" id="v-percorso">
        <div class="shell">
          ${head(journey)}
          <ol class="v-steps">
            ${journey.steps
              .map(
                (s, i) => `
              <li class="v-step reveal" data-delay="${i * 90}">
                <span class="v-step__n">${i + 1}</span>
                <p class="v-step__meta">${esc(s.meta)}</p>
                <h3>${esc(s.title)}</h3>
                <p>${esc(s.text)}</p>
              </li>`,
              )
              .join('')}
          </ol>
        </div>
      </section>

      <!-- 5. Testimonianze -->
      <section class="section section--light v-stories" id="v-storie">
        <div class="shell">
          ${head(stories)}
          <div class="v-stories__grid">
            ${stories.items
              .map(
                (s, i) => `
              <figure class="v-story reveal" data-delay="${i * 90}">
                <blockquote>${esc(s.quote)}</blockquote>
                <figcaption>
                  ${s.img ? `<img src="${esc(s.img)}" alt="" width="96" height="96" loading="lazy">` : `<span class="v-story__avatar" aria-hidden="true">${initials(s.name)}</span>`}
                  <span><strong>${esc(s.name)}</strong>${esc(s.detail)}</span>
                </figcaption>
                <p class="v-story__result"><strong>${esc(s.result)}</strong> ${esc(s.resultLabel)}</p>
              </figure>`,
              )
              .join('')}
          </div>
          <div class="section__cta reveal">
            ${cta('storie')}
            ${stories.note ? `<span class="u-muted u-small">${esc(stories.note)}</span>` : ''}
          </div>
        </div>
      </section>

      <!-- 6. Tecnologie e attrezzature -->
      <section class="section section--light section--mist v-equipment" id="v-attrezzature">
        <div class="shell">
          ${head(equipment)}
          <div class="v-equipment__grid">
            ${equipment.items
              .map(
                (t, i) => `
              <article class="v-tool reveal" data-delay="${i * 80}">
                <div class="v-tool__media"><img src="${esc(t.img)}" alt="${esc(t.alt)}" width="1200" height="900" loading="lazy"></div>
                <p class="v-tool__tag">${esc(t.tag)}</p>
                <h3>${esc(t.name)}</h3>
                <p>${esc(t.text)}</p>
              </article>`,
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- 7. Competenze dello staff -->
      <section class="section v-team" id="v-team">
        <div class="shell">
          ${head(team)}
          <div class="v-team__grid">
            ${team.members
              .map(
                (m, i) => `
              <article class="v-member reveal" data-delay="${i * 90}">
                <div class="v-member__media"><img src="${esc(m.img)}" alt="${esc(m.alt)}" width="1000" height="1250" loading="lazy"></div>
                <p class="v-member__role">${esc(m.role)}</p>
                <h3>${esc(m.name)}</h3>
                <p>${esc(m.bio)}</p>
                <ul class="v-member__creds">${m.creds.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
              </article>`,
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- 8. FAQ -->
      <section class="section section--light v-faq" id="v-faq">
        <div class="shell v-faq__inner">
          <div class="v-faq__head">
            <p class="eyebrow reveal">${esc(faq.eyebrow)}</p>
            <h2 class="display display--sm reveal" data-delay="60">${rich(faq.title)}</h2>
            <p class="u-muted reveal" data-delay="120">
              Non trovi la risposta? Chiedi all’assistente in basso a destra oppure chiama la segreteria al
              <a class="v-faq__phone" href="tel:${esc(club.phoneHref)}">${esc(club.phone)}</a>.
            </p>
          </div>
          <div class="v-faq__list">
            ${faq.items
              .map(
                (f, i) => `
              <details class="v-qa reveal" data-delay="${i * 50}">
                <summary>${esc(f.q)}<span class="v-qa__plus" aria-hidden="true"></span></summary>
                <p>${esc(f.a)}</p>
              </details>`,
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- 9. CTA finale -->
      <section class="final section v-final" id="v-prenota">
        <div class="shell v-final__inner">
          <p class="eyebrow reveal">${esc(final.eyebrow)}</p>
          <h2 class="display display--xl reveal" data-delay="60">${rich(final.title)}</h2>
          <p class="final__lead reveal" data-delay="120">${esc(final.lead)}</p>
          <div class="final__actions reveal" data-delay="180">
            ${cta('finale')}
            <a class="btn btn--outline btn--lg" href="tel:${esc(club.phoneHref)}"><span class="btn__icon" aria-hidden="true">${ICONS.phone}</span>${esc(club.phone)}</a>
            <a class="btn btn--ghost btn--lg" href="${esc(whatsappHref(club.whatsappText.vertical.replace('{attivita}', v.name)))}" target="_blank" rel="noopener noreferrer"><span class="btn__icon" aria-hidden="true">${ICONS.chat}</span>WhatsApp</a>
          </div>
          <ul class="v-trust reveal" data-delay="240">
            ${hero.trust.map((t) => `<li>${ICONS.check}${esc(t)}</li>`).join('')}
          </ul>
        </div>
      </section>`;

    observeReveals(root);
  }

  /* ===========================================================================
     LEAD — mini-quiz di qualificazione + contatti, aperto da ogni [data-lead-open]
     Domande, profili e testi arrivano da TSC.verticals[id].lead; l'invio passa
     da TSC.api.submitLead (oggi demo, domani CRM/webhook).
     ======================================================================== */
  async function initLeadModal() {
    const id = currentVerticalId();
    if (!id) return;
    const v = await TSC.api.getVertical(id);
    if (!v || !v.lead) return;
    const cfg = v.lead;
    const questions = cfg.questions || [];

    document.body.insertAdjacentHTML(
      'beforeend',
      `
<div class="modal lead" id="lead-modal" hidden>
  <div class="modal__backdrop" data-close-lead></div>
  <div class="modal__dialog lead__dialog" role="dialog" aria-modal="true" aria-labelledby="lead-title">
    <button class="modal__close" type="button" data-close-lead aria-label="Chiudi">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <p class="eyebrow" id="lead-title">${esc(cfg.title)}</p>
    <div class="lead__progress" aria-hidden="true"><span id="lead-bar"></span></div>
    <div class="lead__body" id="lead-body"></div>
  </div>
</div>`,
    );

    const modal = $('#lead-modal');
    const body = $('#lead-body');
    const bar = $('#lead-bar');
    const state = { step: 0, answers: [], source: '' };
    let lastFocused = null;

    const profile = () => {
      const key = state.answers[cfg.profileFrom || 0];
      return (key && cfg.profiles && cfg.profiles[key]) || (cfg.profiles && cfg.profiles.default) || null;
    };

    const setProgress = (ratio) => { bar.style.width = `${Math.round(ratio * 100)}%`; };

    const renderQuestion = () => {
      const q = questions[state.step];
      setProgress(state.step / (questions.length + 1));
      body.innerHTML = `
        ${state.step === 0 ? `<p class="lead__intro">${esc(cfg.intro)}</p>` : ''}
        <p class="lead__count">Domanda ${state.step + 1} di ${questions.length}</p>
        <h2 class="lead__q">${esc(q.q)}</h2>
        <div class="lead__answers">
          ${q.options.map((o, i) => `<button class="lead__answer" type="button" data-answer="${i}">${esc(o)}</button>`).join('')}
        </div>
        <div class="lead__nav">
          ${state.step > 0 ? '<button class="btn btn--ghost btn--sm" type="button" data-lead-back>← Indietro</button>' : '<span></span>'}
          <button class="btn btn--ghost btn--sm" type="button" data-lead-skip>Salta le domande</button>
        </div>`;
      $('.lead__answer', body).focus();
    };

    const renderForm = () => {
      setProgress(questions.length / (questions.length + 1));
      const p = state.answers.length ? profile() : null;
      body.innerHTML = `
        ${p ? `<div class="lead__profile"><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div>` : ''}
        <h2 class="lead__q">${esc(cfg.formTitle)}</h2>
        <form class="form lead__form" id="lead-form" novalidate>
          <div class="field">
            <label for="l-nome">Nome</label>
            <input id="l-nome" name="name" type="text" autocomplete="given-name" required>
            <span class="field__error" data-error-for="l-nome"></span>
          </div>
          <div class="field">
            <label for="l-tel">Telefono / WhatsApp</label>
            <input id="l-tel" name="phone" type="tel" autocomplete="tel" inputmode="tel" required>
            <span class="field__error" data-error-for="l-tel"></span>
          </div>
          <div class="field field--wide">
            <label for="l-email">Email (facoltativa)</label>
            <input id="l-email" name="email" type="email" autocomplete="email">
            <span class="field__error" data-error-for="l-email"></span>
          </div>
          <div class="field field--wide">
            <label for="l-messaggio">Messaggio (facoltativo)</label>
            <textarea id="l-messaggio" name="message" rows="3" maxlength="${MAX_MESSAGE}" placeholder="Raccontaci cosa cerchi o quando preferisci essere richiamato"></textarea>
            <span class="field__hint" data-count-for="l-messaggio">0 / ${MAX_MESSAGE}</span>
            <span class="field__error" data-error-for="l-messaggio"></span>
          </div>
          <div class="field field--wide">
            <label class="check">
              <input id="l-privacy" name="privacy" type="checkbox">
              <span class="check__box" aria-hidden="true"></span>
              <span>Ho letto l’<a href="#privacy">informativa privacy</a> e acconsento a essere ricontattato per questa richiesta.</span>
            </label>
            <span class="field__error" data-error-for="l-privacy"></span>
          </div>
          ${honeypot('l-website')}
          <div class="form__actions field--wide">
            <button class="btn btn--primary btn--lg" type="submit">${esc(cfg.submit)}</button>
            <p class="form__status" id="lead-status" role="status" aria-live="polite"></p>
          </div>
        </form>`;
      $('#l-nome').focus();
      $('#lead-form').addEventListener('submit', onSubmit);
    };

    const renderSuccess = (name) => {
      setProgress(1);
      body.innerHTML = `
        <div class="lead__done">
          <span class="v-icon v-icon--lg">${ICONS.check}</span>
          <h2 class="lead__q">Richiesta ricevuta, ${esc(name)}!</h2>
          <p class="u-muted">${esc(cfg.success)}</p>
          <button class="btn btn--outline" type="button" data-close-lead>Torna alla pagina</button>
        </div>`;
      $('[data-close-lead]', body).focus();
    };

    const render = () => (state.step < questions.length ? renderQuestion() : renderForm());

    const rules = {
      'l-nome': (el) => (el.value.trim().length >= 2 ? '' : 'Inserisci il tuo nome.'),
      'l-tel': (el) => (normalizePhone(el.value) ? '' : PHONE_ERROR),
      'l-messaggio': (el) => messageRule(el.value),
      'l-email': (el) => (!el.value.trim() || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(el.value.trim()) ? '' : 'Email non valida.'),
      'l-privacy': (el) => (el.checked ? '' : 'Per continuare serve il consenso privacy.'),
    };

    async function onSubmit(e) {
      e.preventDefault();
      const form = e.currentTarget;
      const status = $('#lead-status');
      let firstInvalid = null;
      Object.entries(rules).forEach(([fid, rule]) => {
        const el = document.getElementById(fid);
        const msg = rule(el);
        $(`[data-error-for="${fid}"]`, form).textContent = msg;
        if (el.type !== 'checkbox') el.setAttribute('aria-invalid', String(Boolean(msg)));
        if (msg && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const btn = $('button[type="submit"]', form);
      const label = btn.textContent;
      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Invio in corso…';
      status.textContent = '';
      status.className = 'form__status';
      const data = Object.fromEntries(new FormData(form).entries());
      const p = state.answers.length ? profile() : null;
      try {
        await TSC.api.submitLead({
          vertical: v.id,
          source: state.source,
          profile: p ? p.title : '',
          answers: state.answers.map((a, i) => ({ question: questions[i].q, answer: a })),
          name: data.name.trim(),
          phone: normalizePhone(data.phone),
          email: (data.email || '').trim(),
          message: (data.message || '').trim(),
          privacy: true,
          website: data.website || '',
        });
        renderSuccess(data.name.trim());
      } catch (err) {
        console.error('[TSC] Invio lead fallito:', err);
        // Messaggio generico: i dettagli restano nei log del server. I dati
        // restano compilati, così basta premere di nuovo il pulsante.
        status.textContent = 'Non siamo riusciti a inviare la richiesta. Riprova tra poco o chiamaci.';
        status.className = 'form__status is-error';
        btn.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
        btn.textContent = label;
      }
    }

    const open = (source) => {
      lastFocused = document.activeElement;
      Object.assign(state, { step: 0, answers: [], source });
      modal.hidden = false;
      document.body.classList.add('is-locked');
      render();
    };

    const close = () => {
      modal.hidden = true;
      document.body.classList.remove('is-locked');
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    };

    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-lead-open]');
      if (opener) {
        e.preventDefault();
        open(opener.dataset.leadOpen || 'cta');
        return;
      }
      if (modal.hidden) return;
      if (e.target.closest('[data-close-lead]')) return close();

      const answer = e.target.closest('[data-answer]');
      if (answer) {
        state.answers[state.step] = questions[state.step].options[Number(answer.dataset.answer)];
        state.step += 1;
        render();
      } else if (e.target.closest('[data-lead-back]')) {
        state.step = Math.max(0, state.step - 1);
        state.answers.length = state.step;
        render();
      } else if (e.target.closest('[data-lead-skip]')) {
        state.answers = [];
        state.step = questions.length;
        render();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  /* ===========================================================================
     ORARI — timetable generata dai dati, filtri giorno + disciplina
     ======================================================================== */
  async function initSchedule() {
    const board = $('#schedule-board');
    const dayBar = $('#day-filters');
    const catSelect = $('#schedule-category');
    if (!board) return;

    const courses = await TSC.api.getCourses();
    const today = todayName();
    const state = { day: today, category: 'Tutte' };

    const slotHTML = (c) => `
      <article class="slot">
        <span class="slot__time">${esc(c.time)}</span>
        <div class="slot__main">
          <p class="slot__name">${esc(c.name)}</p>
          <p class="slot__room">${esc(c.room)} · ${esc(c.level)}</p>
        </div>
        <p class="slot__trainer">Trainer <strong>${esc(c.trainer)}</strong></p>
        <span class="slot__tag">${esc(c.category)}</span>
        <span class="slot__dur">${esc(c.duration)}'</span>
      </article>`;

    const render = () => {
      const visibleDays = state.day === 'Tutti' ? TSC.days : [state.day];
      const html = visibleDays
        .map((day) => {
          const list = courses
            .filter((c) => c.day === day && (state.category === 'Tutte' || c.category === state.category))
            .sort((a, b) => a.time.localeCompare(b.time));
          if (!list.length && state.day === 'Tutti') return '';
          return `
            <section class="schedule__day${day === today ? ' schedule__day--today' : ''}">
              <header class="schedule__day-head">
                <h3 class="schedule__day-name">${esc(day)}</h3>
                <span class="schedule__day-count">${list.length} ${list.length === 1 ? 'corso' : 'corsi'}</span>
              </header>
              ${
                list.length
                  ? `<div class="slots">${list.map(slotHTML).join('')}</div>`
                  : '<p class="schedule__empty">Nessun corso con questi filtri. Prova un’altra disciplina.</p>'
              }
            </section>`;
        })
        .join('');

      board.innerHTML =
        html || '<p class="schedule__empty">Nessun corso con questi filtri. Prova un’altra disciplina.</p>';
    };

    render();

    // Senza barre di filtro (teaser in home) resta la sola giornata di oggi.
    if (!dayBar || !catSelect) return;

    // Filtro giorni ("Tutti" + i giorni presenti nei dati)
    dayBar.innerHTML = ['Tutti', ...TSC.days]
      .map(
        (d) =>
          `<button class="filter${d === today ? ' filter--today' : ''}" type="button" data-day="${esc(d)}" aria-pressed="${d === state.day}">${esc(d === 'Tutti' ? 'Tutta la settimana' : d)}</button>`,
      )
      .join('');

    const categories = ['Tutte', ...new Set(courses.map((c) => c.category))].sort((a, b) =>
      a === 'Tutte' ? -1 : b === 'Tutte' ? 1 : a.localeCompare(b, 'it'),
    );
    catSelect.innerHTML = categories
      .map((c) => `<option value="${esc(c)}">${esc(c === 'Tutte' ? 'Tutte le discipline' : c)}</option>`)
      .join('');

    dayBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');
      if (!btn) return;
      state.day = btn.dataset.day;
      $$('.filter', dayBar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      render();
    });

    catSelect.addEventListener('change', () => {
      state.category = catSelect.value;
      render();
    });
  }

  /* ===========================================================================
     EVENTI — evento in evidenza, lista, form di iscrizione (demo)
     ======================================================================== */
  async function initEvents() {
    const featuredEl = $('#event-featured');
    const listEl = $('#event-list');
    const select = $('#f-evento');
    const events = await TSC.api.getEvents();
    if (!events.length) return;

    const featured = events.find((e) => e.featured) || events[0];
    const rest = events.filter((e) => e !== featured);

    if (featuredEl) {
      const pct = Math.round(((featured.seats - featured.seatsLeft) / featured.seats) * 100);
      featuredEl.innerHTML = `
        <img src="${esc(featured.img)}" alt="${esc(featured.alt)}" loading="lazy" width="1600" height="1100">
        <span class="event-featured__badge">${ICONS.calendar} In evidenza</span>
        <div class="event-featured__date">
          <span>${ICONS.calendar} ${esc(featured.dateLabel)}</span>
          <span>${ICONS.clock} ${esc(featured.time)}</span>
          <span>${ICONS.pin} ${esc(featured.location)}</span>
        </div>
        <h3>${esc(featured.title)}</h3>
        <p>${esc(featured.excerpt)}</p>
        <div class="event-featured__foot">
          <a class="btn btn--primary" href="${TSC.routes.iscrizione}" data-event="${esc(featured.id)}">Iscriviti all’evento</a>
          <div class="seats">
            <span class="seats__bar"><span class="seats__fill" data-fill="${pct}"></span></span>
            <span class="seats__label">${featured.seatsLeft} posti disponibili su ${featured.seats}</span>
          </div>
        </div>`;

      // La barra si riempie quando entra in viewport
      const fill = $('.seats__fill', featuredEl);
      if (fill) {
        if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
          fill.style.width = `${pct}%`;
        } else {
          const obs = new IntersectionObserver(
            (entries, o) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                fill.style.width = `${pct}%`;
                o.disconnect();
              });
            },
            { threshold: 0.4 },
          );
          obs.observe(fill);
        }
      }
    }

    if (listEl) {
      listEl.innerHTML = rest
        .map(
          (ev, i) => `
        <article class="event-card reveal" data-delay="${i * 90}">
          <div class="event-card__thumb"><img src="${esc(ev.img)}" alt="${esc(ev.alt)}" loading="lazy" width="1200" height="900"></div>
          <div>
            <p class="event-card__cat">${esc(ev.category)}</p>
            <h4>${esc(ev.title)}</h4>
            <p class="event-card__meta">
              <span><strong>${esc(ev.dateLabel)}</strong></span>
              <span>${esc(ev.time)}</span>
              <span>${esc(ev.location)}</span>
            </p>
            <p class="event-card__seats">${ev.seatsLeft} posti rimasti</p>
          </div>
        </article>`,
        )
        .join('');
      observeReveals(listEl);
    }

    if (select) {
      select.innerHTML =
        '<option value="" disabled selected>Scegli un evento</option>' +
        events
          .map((ev) => `<option value="${esc(ev.id)}">${esc(ev.title)} — ${esc(ev.dateLabel)}</option>`)
          .join('');
    }

    // Il CTA dell'evento in evidenza preseleziona l'evento nel form
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-event]');
      if (!trigger || !select) return;
      select.value = trigger.dataset.event;
      select.dispatchEvent(new Event('change'));
    });
  }

  /* ===========================================================================
     FORM ISCRIZIONE — validazione client-side, invio al CRM via TSC.api
     ======================================================================== */
  function initEventForm() {
    const form = $('#event-form');
    const status = $('#event-form-status');
    if (!form) return;

    const rules = {
      'f-nome': (v) => (v.trim().length >= 2 ? '' : 'Inserisci il tuo nome.'),
      'f-cognome': (v) => (v.trim().length >= 2 ? '' : 'Inserisci il tuo cognome.'),
      'f-email': (v) => (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? '' : 'Inserisci un’email valida.'),
      'f-tel': (v) => (normalizePhone(v) ? '' : PHONE_ERROR),
      'f-messaggio': (v) => messageRule(v),
      'f-evento': (v) => (v ? '' : 'Seleziona l’evento.'),
      'f-partecipanti': (v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 10 ? '' : 'Indica da 1 a 10 partecipanti.';
      },
      'f-privacy': (_v, el) => (el.checked ? '' : 'È necessario accettare la privacy policy.'),
    };

    const showError = (id, message) => {
      const field = document.getElementById(id);
      const box = $(`[data-error-for="${id}"]`, form);
      if (box) box.textContent = message;
      if (field && field.type !== 'checkbox') field.setAttribute('aria-invalid', String(Boolean(message)));
      return !message;
    };

    const validateField = (id) => {
      const el = document.getElementById(id);
      if (!el) return true;
      return showError(id, rules[id](el.value, el));
    };

    Object.keys(rules).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', () => validateField(id));
      el.addEventListener('change', () => validateField(id));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const valid = Object.keys(rules).map(validateField).every(Boolean);

      if (!valid) {
        status.textContent = 'Controlla i campi evidenziati.';
        status.className = 'form__status is-error';
        const firstInvalid = Object.keys(rules).find((id) => $(`[data-error-for="${id}"]`, form).textContent);
        if (firstInvalid) document.getElementById(firstInvalid).focus();
        return;
      }

      const btn = $('button[type="submit"]', form);
      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Invio in corso…';
      status.textContent = '';
      status.className = 'form__status';

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.telefono = normalizePhone(payload.telefono);
      try {
        const res = await TSC.api.submitEventSignup(payload);
        status.textContent = res.message;
        status.className = 'form__status is-ok';
        form.reset();
        $$('[data-error-for]', form).forEach((n) => (n.textContent = ''));
      } catch (err) {
        console.error('[TSC] Invio iscrizione fallito:', err);
        // Messaggio generico; i dati restano nel form per un nuovo invio
        status.textContent = 'Non siamo riusciti a inviare l’iscrizione. Riprova tra poco o chiama la segreteria.';
        status.className = 'form__status is-error';
      } finally {
        btn.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
        btn.textContent = 'Iscriviti';
      }
    });
  }

  /* ===========================================================================
     CONVENZIONI — benefit + carousel partner (auto-scroll, drag, pausa hover)
     ======================================================================== */
  async function initCorporate() {
    const benefitsEl = $('#corporate-benefits');
    const track = $('#partners-track');
    const viewport = $('#partners-viewport');

    if (benefitsEl) {
      benefitsEl.innerHTML = TSC.corporateBenefits
        .map(
          (b, i) => `
        <li class="reveal" data-delay="${i * 70}">
          <span class="benefits__n">${esc(b.n)}</span>
          <div>
            <h3>${esc(b.title)}</h3>
            <p>${esc(b.text)}</p>
          </div>
        </li>`,
        )
        .join('');
      observeReveals(benefitsEl);
    }

    if (!track || !viewport) return;
    const partners = await TSC.api.getPartners();

    const card = (p) => `
      <li class="partner">
        <div class="partner__top">
          <span class="partner__name">${esc(p.name)}</span>
          <span class="partner__discount">${esc(p.discount)}</span>
        </div>
        <span class="partner__sector">${esc(p.sector)}</span>
        <p class="partner__benefit">${esc(p.benefit)}</p>
      </li>`;

    // Doppia serie: consente lo scorrimento continuo (marquee -50%)
    track.innerHTML = partners.map(card).join('') + partners.map(card).join('');

    // Drag/swipe manuale: mette in pausa l'animazione e sposta la viewport
    let down = false;
    let startX = 0;
    let startScroll = 0;
    viewport.style.overflowX = 'auto';
    viewport.style.scrollbarWidth = 'none';

    viewport.addEventListener('pointerdown', (e) => {
      down = true;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!down) return;
      viewport.scrollLeft = startScroll - (e.clientX - startX);
    });
    const release = (e) => {
      down = false;
      viewport.classList.remove('is-dragging');
      if (e.pointerId !== undefined && viewport.hasPointerCapture?.(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }
    };
    viewport.addEventListener('pointerup', release);
    viewport.addEventListener('pointercancel', release);
  }

  /* ===========================================================================
     MERCH
     ======================================================================== */
  async function initMerch() {
    const grid = $('#merch-grid');
    const link = $('#merch-store-link');
    if (link) link.setAttribute('href', TSC.merchStoreUrl);
    if (!grid) return;

    const merch = await TSC.api.getMerch();
    grid.innerHTML = merch
      .map(
        (p, i) => `
      <article class="product reveal" data-delay="${i * 80}">
        <a class="product__media" href="${esc(TSC.merchStoreUrl)}" aria-label="${esc(p.name)} — scopri il merch">
          <img src="${esc(p.img)}" alt="${esc(p.alt)}" loading="lazy" width="1000" height="1250">
          <span class="product__line">${esc(p.line)}</span>
          <span class="product__quick">Scopri il Merch</span>
        </a>
        <div class="product__info">
          <span class="product__name">${esc(p.name)}</span>
          <span class="product__price">${esc(p.price)}</span>
        </div>
      </article>`,
      )
      .join('');
    observeReveals(grid);
  }

  /* ===========================================================================
     SOCIAL — link (header sezione + footer) e griglia feed
     ======================================================================== */
  async function initSocial() {
    const linkHTML = (s) =>
      `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.name)} — ${esc(s.handle)}">${ICONS[s.icon] || ''}${esc(s.name)}</a></li>`;

    const lists = [$('#social-links'), $('#footer-social')].filter(Boolean);
    lists.forEach((ul) => (ul.innerHTML = TSC.social.map(linkHTML).join('')));

    const feedEl = $('#feed');
    if (!feedEl) return;
    const feed = await TSC.api.getFeed();
    const ig = TSC.social.find((s) => s.icon === 'instagram');

    feedEl.innerHTML = feed
      .map(
        (f, i) => `
      <a class="feed__item reveal" data-delay="${i * 70}" href="${esc(ig ? ig.url : '#')}" target="_blank" rel="noopener noreferrer" aria-label="Post: ${esc(f.tag)}">
        <img src="${esc(f.img)}" alt="${esc(f.alt)}" loading="lazy" width="900" height="900">
        <span class="feed__overlay">
          <span class="feed__tag">#${esc(f.tag.replace(/\s+/g, ''))}</span>
          <span class="feed__likes">${ICONS.heart} ${esc(f.likes)}</span>
        </span>
      </a>`,
      )
      .join('');
    observeReveals(feedEl);
  }

  /* ===========================================================================
     CONTATTI & FOOTER — popolati da TSC.club
     ======================================================================== */
  function initContacts() {
    const { club } = TSC;

    const finalContacts = $('#final-contacts');
    if (finalContacts) {
      finalContacts.innerHTML = `
        <div class="c-block">
          <span class="c-label">Dove siamo</span>
          <a class="c-value" href="${esc(club.address.maps)}" target="_blank" rel="noopener noreferrer">${esc(club.address.street)}</a>
          <span class="c-small">${esc(club.address.zip)} ${esc(club.address.city)} (${esc(club.address.region)})</span>
        </div>
        <div class="c-block">
          <span class="c-label">Segreteria</span>
          <a class="c-value" href="tel:${esc(club.phoneHref)}">${esc(club.phone)}</a>
          <a class="c-small" href="mailto:${esc(club.email)}">${esc(club.email)}</a>
        </div>
        <div class="c-block">
          <span class="c-label">Orari di apertura</span>
          ${club.opening.map((o) => `<span class="c-small">${esc(o.days)} · <strong>${esc(o.hours)}</strong></span>`).join('')}
        </div>`;
    }

    const phoneBtn = $('#final-phone');
    if (phoneBtn) phoneBtn.setAttribute('href', `tel:${club.phoneHref}`);
    const whatsappBtn = $('#final-whatsapp');
    if (whatsappBtn) whatsappBtn.setAttribute('href', whatsappHref(club.whatsappText.visit));

    const footerContacts = $('#footer-contacts');
    if (footerContacts) {
      footerContacts.innerHTML = `
        <li><a href="${esc(club.address.maps)}" target="_blank" rel="noopener noreferrer">${esc(club.address.street)}, ${esc(club.address.city)}</a></li>
        <li><a href="tel:${esc(club.phoneHref)}">${esc(club.phone)}</a></li>
        <li><a href="mailto:${esc(club.email)}">${esc(club.email)}</a></li>
        <li><a href="${esc(whatsappHref(club.whatsappText.info))}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>`;
    }

    const footerOpening = $('#footer-opening');
    if (footerOpening) {
      footerOpening.innerHTML = club.opening
        .map((o) => `<li>${esc(o.days)}<br><strong>${esc(o.hours)}</strong></li>`)
        .join('');
    }

    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ===========================================================================
     CHATBOT — "Segretaria Virtuale" (demo)
     Il motore risposte vive in TSC.api.askAssistant: sostituirlo per collegare
     un LLM reale non richiede modifiche a questo modulo.
     ======================================================================== */
  function initChat() {
    const root = $('#chat');
    const fab = $('#chat-fab');
    const panel = $('#chat-panel');
    const log = $('#chat-log');
    const quick = $('#chat-quick');
    const form = $('#chat-form');
    const input = $('#chat-input');
    const closeBtn = $('#chat-close');
    if (!root || !fab || !panel || !log || !form || !input) return;

    // Nelle pagine verticali l'assistente specializzato sostituisce nome,
    // saluto e domande rapide; il resto del motore resta quello del club.
    const vertical = TSC.verticals && TSC.verticals[currentVerticalId()];
    const bot = { ...TSC.chatbot, ...((vertical && vertical.assistant) || {}) };
    const context = vertical ? { vertical: vertical.id } : {};
    if (vertical && vertical.assistant) {
      $$('.chat__who strong, .chat__fab-label', root).forEach((n) => (n.textContent = bot.name));
      panel.setAttribute('aria-label', bot.name);
      fab.setAttribute('aria-label', `Apri la chat con ${bot.name}`);
    }

    let greeted = false;

    const scrollToEnd = () => { log.scrollTop = log.scrollHeight; };

    /** `html` è già markup per i messaggi bot (dai dati); l'input utente va escapato. */
    const push = (html, who) => {
      const msg = document.createElement('div');
      msg.className = `msg msg--${who}`;
      msg.innerHTML = html;
      log.appendChild(msg);
      scrollToEnd();
      return msg;
    };

    const typing = () => {
      const node = document.createElement('div');
      node.className = 'msg msg--bot typing';
      node.innerHTML = '<span></span><span></span><span></span>';
      node.setAttribute('aria-label', 'Sta scrivendo');
      log.appendChild(node);
      scrollToEnd();
      return node;
    };

    const ask = async (text) => {
      push(esc(text), 'user');
      const dots = typing();
      try {
        const reply = await TSC.api.askAssistant(text, context);
        dots.remove();
        push(reply, 'bot');
      } catch (err) {
        console.error('[TSC] Chatbot:', err);
        dots.remove();
        push('Ops, qualcosa è andato storto. Riprova tra poco.', 'bot');
      }
    };

    if (quick) {
      quick.innerHTML = bot.quickActions
        .map((q) => `<button type="button">${esc(q)}</button>`)
        .join('');
      quick.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) ask(btn.textContent);
      });
    }

    const open = () => {
      panel.hidden = false;
      root.classList.add('is-open');
      fab.setAttribute('aria-expanded', 'true');
      fab.setAttribute('aria-label', `Chiudi la chat con ${bot.name}`);
      if (!greeted) {
        greeted = true;
        push(esc(bot.greeting), 'bot');
      }
      setTimeout(() => input.focus(), 120);
    };

    const close = () => {
      panel.hidden = true;
      root.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      fab.setAttribute('aria-label', `Apri la chat con ${bot.name}`);
      fab.focus();
    };

    fab.addEventListener('click', () => (panel.hidden ? open() : close()));
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      ask(text);
    });
  }

  /* ===========================================================================
     MODALE AREA CLIENTI — placeholder UX, nessuna autenticazione
     ======================================================================== */
  function initAccountModal() {
    const modal = $('#account-modal');
    if (!modal) return;
    let lastFocused = null;

    const open = () => {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('is-locked');
      const focusable = $('.modal__dialog .btn, .modal__close', modal);
      if (focusable) focusable.focus();
    };

    const close = () => {
      modal.hidden = true;
      document.body.classList.remove('is-locked');
      if (lastFocused) lastFocused.focus();
    };

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-account]')) {
        e.preventDefault();
        open();
      } else if (e.target.closest('[data-close-account]')) {
        close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  /* ===========================================================================
     BOOTSTRAP
     ======================================================================== */
  const modules = [
    initHeader,
    initMotion,
    initStats,
    initActivities,
    initWorlds,
    initVertical,
    initLeadModal,
    initSchedule,
    initEvents,
    initEventForm,
    initCorporate,
    initMerch,
    initSocial,
    initContacts,
    initChat,
    initAccountModal,
  ];

  const boot = () => {
    modules.forEach((fn) => {
      try {
        const res = fn();
        if (res && typeof res.catch === 'function') {
          res.catch((err) => console.error(`[TSC] ${fn.name} ha fallito:`, err));
        }
      } catch (err) {
        console.error(`[TSC] ${fn.name} ha fallito:`, err);
      }
    });
    observeReveals();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
