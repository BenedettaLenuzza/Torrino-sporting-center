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

  /** Giorno corrente nel formato usato dai dati (settimana che inizia lunedì). */
  const todayName = () => TSC.days[(new Date().getDay() + 6) % 7];

  const ICONS = {
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
      if (e.target.closest('a')) closeNav();
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
     PARALLAX & TILT — micro-interazioni, disattivate se reduced motion o touch
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

    // Tilt: l'elemento segue leggermente il puntatore (solo mouse)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-tilt]').forEach((el) => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform 0.18s linear';
        el.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform = '';
      });
    });
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
     ATTIVITÀ — griglia asimmetrica + filtri per categoria
     ======================================================================== */
  async function initActivities() {
    const grid = $('#activity-grid');
    const filterBar = $('#activity-filters');
    const empty = $('#activity-empty');
    if (!grid) return;

    const all = await TSC.api.getActivities();
    // In home la griglia è un teaser: `data-limit` taglia le schede mostrate.
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
              <a class="activity__cta" href="${TSC.routes.orari}">Vedi gli orari ${ICONS.arrow}</a>
            </div>
          </div>
        </div>
      </article>`,
      )
      .join('');

    observeReveals(grid);

    // Senza barra filtri (home) il modulo finisce qui.
    if (!filterBar) return;

    const categories = ['Tutte', ...new Set(activities.map((a) => a.category))];
    filterBar.innerHTML = categories
      .map(
        (c, i) =>
          `<button class="filter" type="button" data-filter="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`,
      )
      .join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');
      if (!btn) return;
      $$('.filter', filterBar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

      const value = btn.dataset.filter;
      let visible = 0;
      $$('.activity', grid).forEach((card) => {
        const show = value === 'Tutte' || card.dataset.category === value;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (empty) empty.hidden = visible > 0;
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
     FORM ISCRIZIONE — validazione client-side + submit demo (nessun backend)
     ======================================================================== */
  function initEventForm() {
    const form = $('#event-form');
    const status = $('#event-form-status');
    if (!form) return;

    const rules = {
      'f-nome': (v) => (v.trim().length >= 2 ? '' : 'Inserisci il tuo nome.'),
      'f-cognome': (v) => (v.trim().length >= 2 ? '' : 'Inserisci il tuo cognome.'),
      'f-email': (v) => (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? '' : 'Inserisci un’email valida.'),
      'f-tel': (v) => (v.replace(/\D/g, '').length >= 8 ? '' : 'Inserisci un numero di telefono valido.'),
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
      btn.textContent = 'Invio in corso…';
      status.textContent = '';
      status.className = 'form__status';

      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await TSC.api.submitEventSignup(payload);
        status.textContent = res.message;
        status.className = 'form__status is-ok';
        form.reset();
        $$('[data-error-for]', form).forEach((n) => (n.textContent = ''));
      } catch (err) {
        console.error('[TSC] Invio iscrizione fallito:', err);
        status.textContent = 'Invio non riuscito. Riprova o chiama la segreteria.';
        status.className = 'form__status is-error';
      } finally {
        btn.classList.remove('is-loading');
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

    const footerContacts = $('#footer-contacts');
    if (footerContacts) {
      footerContacts.innerHTML = `
        <li><a href="${esc(club.address.maps)}" target="_blank" rel="noopener noreferrer">${esc(club.address.street)}, ${esc(club.address.city)}</a></li>
        <li><a href="tel:${esc(club.phoneHref)}">${esc(club.phone)}</a></li>
        <li><a href="mailto:${esc(club.email)}">${esc(club.email)}</a></li>
        <li><a href="${esc(club.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>`;
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
        const reply = await TSC.api.askAssistant(text);
        dots.remove();
        push(reply, 'bot');
      } catch (err) {
        console.error('[TSC] Chatbot:', err);
        dots.remove();
        push('Ops, qualcosa è andato storto. Riprova tra poco.', 'bot');
      }
    };

    if (quick) {
      quick.innerHTML = TSC.chatbot.quickActions
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
      fab.setAttribute('aria-label', 'Chiudi la chat con la Segretaria Virtuale');
      if (!greeted) {
        greeted = true;
        push(TSC.chatbot.greeting, 'bot');
      }
      setTimeout(() => input.focus(), 120);
    };

    const close = () => {
      panel.hidden = true;
      root.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      fab.setAttribute('aria-label', 'Apri la chat con la Segretaria Virtuale');
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
