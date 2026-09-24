/* =============================================================================
   TORRINO SPORTING CENTER — LAYOUT CONDIVISO
   -----------------------------------------------------------------------------
   Header, footer, chatbot e modale Area Clienti vivono SOLO qui: ogni pagina si
   limita a dichiarare i due segnaposto

     <div data-layout="header"></div>
     <div data-layout="footer"></div>

   e questo file li riempie. Chat e modale vengono appese al <body>.

   Ordine degli script obbligatorio in fondo a ogni pagina:
     js/data.js  →  js/layout.js  →  js/script.js
   layout.js scrive nel DOM in modo sincrono, così quando script.js parte
   (DOMContentLoaded) header e footer sono già presenti e i suoi moduli li trovano.

   La voce di menu attiva è calcolata dal nome file della pagina corrente.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const TSC = window.TSC;
  if (!TSC) {
    console.error('[TSC] js/data.js non caricato: layout non generabile.');
    return;
  }

  const { routes, navigation, club } = TSC;

  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
    );

  /** Nome file della pagina corrente ('index.html' anche per '/' e '/sottocartella/'). */
  const currentPage = () => {
    const file = window.location.pathname.split('/').pop();
    return file && file.length ? file : 'index.html';
  };

  const isActive = (href) => href.split('#')[0] === currentPage();

  const LOGO = `<svg viewBox="0 0 40 40" fill="none"><path d="M20 2 4 11v18l16 9 16-9V11L20 2Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M13 26V14l7 6 7-6v12" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const brand = (extraClass = '') => `
    <a class="brand ${extraClass}" href="${routes.home}" aria-label="${esc(club.name)} — home">
      <span class="brand__mark" aria-hidden="true">${LOGO}</span>
      <span class="brand__text"><strong>Torrino</strong><em>Sporting Center</em></span>
    </a>`;

  /* ---------------------------------------------------------------------------
     HEADER
  --------------------------------------------------------------------------- */
  function headerHTML() {
    const items = navigation
      .map(
        (item) =>
          `<li><a class="nav__link${isActive(item.href) ? ' is-active' : ''}" href="${esc(item.href)}"${
            isActive(item.href) ? ' aria-current="page"' : ''
          }>${esc(item.label)}</a></li>`,
      )
      .join('');

    return `
<header class="site-header" id="site-header" data-state="top">
  <div class="shell site-header__inner">
    ${brand()}

    <nav class="nav" id="primary-nav" aria-label="Navigazione principale">
      <ul class="nav__list">${items}</ul>

      <div class="nav__account">
        <button class="btn btn--ghost btn--sm" type="button" data-open-account>
          <span class="btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.7"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </span>
          Area Clienti · Accedi
        </button>
        <a class="btn btn--primary btn--sm" href="${routes.contatti}">Scopri il Club</a>
      </div>
    </nav>

    <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="primary-nav" data-burger>
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
  }

  /* ---------------------------------------------------------------------------
     FOOTER
  --------------------------------------------------------------------------- */
  function footerHTML() {
    return `
<footer class="site-footer" id="footer">
  <div class="shell">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        ${brand('brand--lg')}
        <p class="site-footer__claim">${esc(club.claim)}<br>Roma · Torrino</p>
        <ul class="social__links social__links--footer" id="footer-social"></ul>
      </div>

      <nav class="site-footer__nav" aria-label="Link rapidi">
        <div>
          <h3>Il Club</h3>
          <ul>
            <li><a href="${routes.club}">Chi siamo</a></li>
            <li><a href="${routes.attivita}">Attività</a></li>
            <li><a href="${routes.orari}">Orari corsi</a></li>
            <li><a href="${routes.eventi}">Eventi</a></li>
          </ul>
        </div>
        <div>
          <h3>Servizi</h3>
          <ul>
            <li><a href="${routes.convenzioni}">Convenzioni aziendali</a></li>
            <li><a href="${routes.merch}">Merch</a></li>
            <li><a href="${routes.iscrizione}">Iscrizione eventi</a></li>
            <li><a href="#" data-open-account>Area Clienti</a></li>
          </ul>
        </div>
        <div>
          <h3>Contatti</h3>
          <ul id="footer-contacts"></ul>
        </div>
        <div>
          <h3>Orari</h3>
          <ul id="footer-opening"></ul>
        </div>
      </nav>
    </div>

    <div class="site-footer__bottom">
      <p>© <span id="year"></span> ${esc(club.name)} — Centro sportivo e palestra a Roma. P.IVA 00000000000</p>
      <ul class="legal">
        <li><a href="#privacy">Privacy Policy</a></li>
        <li><a href="#cookie">Cookie Policy</a></li>
        <li><a href="#termini">Termini e condizioni</a></li>
      </ul>
    </div>
  </div>
</footer>`;
  }

  /* ---------------------------------------------------------------------------
     CTA FINALE — opzionale, si monta su <div data-layout="cta"></div>
     Contiene gli id che initContacts() popola: va inclusa UNA volta per pagina.
     contatti.html non la usa, perché quei contenuti sono il suo corpo principale.
  --------------------------------------------------------------------------- */
  function ctaHTML() {
    return `
<section class="final section" id="contatti">
  <div class="shell final__inner">
    <div class="final__copy">
      <p class="eyebrow reveal">Inizia adesso</p>
      <h2 class="display display--xl reveal" data-delay="60">
        Il primo allenamento<br>è <span class="u-mark">gratuito</span>.
      </h2>
      <p class="final__lead reveal" data-delay="120">
        Prenota una visita: ti facciamo vedere il club, capiamo i tuoi obiettivi
        e ti facciamo provare una classe a scelta. Senza impegno.
      </p>
      <div class="final__actions reveal" data-delay="180">
        <a class="btn btn--primary btn--lg" href="${routes.iscrizione}">Prenota la visita</a>
        <a class="btn btn--outline btn--lg" id="final-phone" href="#">Chiama la segreteria</a>
      </div>
    </div>
    <address class="final__contacts reveal" data-delay="240" id="final-contacts"></address>
  </div>
</section>`;
  }

  /* ---------------------------------------------------------------------------
     CHATBOT + MODALE AREA CLIENTI (appesi al body)
  --------------------------------------------------------------------------- */
  function chatHTML() {
    return `
<div class="chat" id="chat">
  <button class="chat__fab" type="button" id="chat-fab" aria-expanded="false" aria-controls="chat-panel" aria-label="Apri la chat con la Segretaria Virtuale">
    <span class="chat__fab-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="12" r="1.1" fill="currentColor"/><circle cx="12.5" cy="12" r="1.1" fill="currentColor"/><circle cx="16" cy="12" r="1.1" fill="currentColor"/></svg>
    </span>
    <span class="chat__fab-close" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </span>
    <span class="chat__fab-label">Segretaria Virtuale</span>
    <span class="chat__fab-dot" aria-hidden="true"></span>
  </button>

  <section class="chat__panel" id="chat-panel" role="dialog" aria-modal="false" aria-label="Segretaria Virtuale del club" hidden>
    <header class="chat__head">
      <div class="chat__who">
        <span class="chat__avatar" aria-hidden="true">TS</span>
        <span>
          <strong>Segretaria Virtuale</strong>
          <em><span class="pulse pulse--sm" aria-hidden="true"></span> Online · risposta immediata</em>
        </span>
      </div>
      <button class="chat__close" type="button" id="chat-close" aria-label="Chiudi la chat">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </header>

    <div class="chat__log" id="chat-log" role="log" aria-live="polite" aria-label="Conversazione"></div>
    <div class="chat__quick" id="chat-quick" aria-label="Domande frequenti"></div>

    <form class="chat__form" id="chat-form">
      <label class="u-visually-hidden" for="chat-input">Scrivi un messaggio</label>
      <input id="chat-input" type="text" placeholder="Scrivi un messaggio…" autocomplete="off">
      <button class="chat__send" type="submit" aria-label="Invia messaggio">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12 20 4l-8 16-2-6-6-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      </button>
    </form>
    <p class="chat__disclaimer">Assistente demo. Per pratiche e pagamenti contatta la segreteria.</p>
  </section>
</div>`;
  }

  /**
   * Modale Area Clienti — placeholder UX.
   * Qui andrà innestato il login verso il gestionale del centro: in questa fase
   * non c'è autenticazione, né database, né gestione utenti.
   */
  function accountModalHTML() {
    return `
<div class="modal" id="account-modal" hidden>
  <div class="modal__backdrop" data-close-account></div>
  <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
    <button class="modal__close" type="button" data-close-account aria-label="Chiudi">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <p class="eyebrow">Area Clienti</p>
    <h2 class="display display--sm" id="account-title">In arrivo.</h2>
    <p class="u-muted">Stiamo collegando il portale al gestionale del centro. Dalla tua area personale potrai:</p>
    <ul class="modal__list">
      <li>Gestire abbonamento e scadenza</li>
      <li>Prenotare corsi e campi</li>
      <li>Consultare lo storico allenamenti</li>
      <li>Rinnovare e pagare online</li>
    </ul>
    <p class="u-muted u-small">Nel frattempo prenotazioni e rinnovi si gestiscono in segreteria o tramite la Segretaria Virtuale.</p>
    <div class="modal__actions">
      <a class="btn btn--primary" href="${routes.contatti}" data-close-account>Contatta la segreteria</a>
      <button class="btn btn--ghost" type="button" data-close-account>Chiudi</button>
    </div>
  </div>
</div>`;
  }

  /* ---------------------------------------------------------------------------
     MONTAGGIO
  --------------------------------------------------------------------------- */
  const mount = (slot, html) => {
    const el = document.querySelector(`[data-layout="${slot}"]`);
    if (el) el.outerHTML = html;
  };

  mount('header', headerHTML());
  mount('cta', ctaHTML());
  mount('footer', footerHTML());

  document.body.insertAdjacentHTML('beforeend', chatHTML() + accountModalHTML());
})(window, document);
