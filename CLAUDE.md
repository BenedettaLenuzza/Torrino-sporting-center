# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contesto

Sito **multipagina** (8 pagine statiche) per il Torrino Sporting Center (centro sportivo
premium, Roma). HTML5 + CSS3 + JavaScript vanilla, **nessun framework, nessuna build,
nessuna dipendenza**. Contenuti, commenti e copy sono in italiano: mantenere la lingua.

## Comandi

Non esistono build, lint o test: il sito è statico e si serve così com'è.

```bash
python -m http.server 8000                      # server locale (consigliato)
node --check js/data.js && node --check js/layout.js && node --check js/script.js
node tools/generate-placeholders.mjs            # rigenera i placeholder SVG
```

Dopo ogni modifica a CSS/JS il browser tende a servire la versione in cache:
ricaricare con **Ctrl+F5**, oppure aggiungere un query string all'URL. Vale anche per
le pagine caricate in un iframe di test: il query string sull'iframe non invalida la
cache di `js/*.js`.

## Architettura

Quattro livelli separati, da rispettare quando si aggiunge una feature:

1. **`js/data.js`** — livello dati. Espone `window.TSC` con `routes`, `navigation`,
   `club`, `activities`, `courses`, `events`, `partners`, `merch`, `social`, `chatbot`
   e il contratto `TSC.api`. È l'**unico** posto dove stanno i contenuti.
2. **`js/layout.js`** — chrome condiviso: header, footer, CTA finale, chatbot e modale
   Area Clienti. Le pagine dichiarano solo `<div data-layout="header|cta|footer">`.
3. **`js/script.js`** — UI. Moduli indipendenti (`initHeader`, `initSchedule`, `initEvents`,
   `initChat`, …) registrati in `modules[]` e avviati da `boot()` dentro un `try/catch`
   per modulo: se uno fallisce gli altri continuano. **Nessun dato di business qui.**
4. **`css/style.css`** — design system con indice numerato in testa al file.

### Multipagina senza build

Ordine degli script obbligatorio in fondo a **ogni** pagina:
`js/data.js` → `js/layout.js` → `js/script.js`. layout.js scrive nel DOM in modo
sincrono, così quando script.js parte (DOMContentLoaded) header e footer esistono già.

Lo stesso `script.js` gira su tutte le pagine: ogni modulo monta solo le sezioni che
trova. Le versioni teaser della home si pilotano dal markup, non con flag JS:
`data-limit` sulla griglia attività, assenza di `#day-filters`/`#schedule-category`
per la timetable del solo giorno corrente, assenza di `#event-list` per il solo evento
in evidenza.

Non scrivere URL di pagina a mano nel JS: usare `TSC.routes`. Rinominare una pagina
deve restare un'operazione su un file solo.

Ogni id usato dai moduli (`#stats`, `#activity-grid`, `#schedule-board`,
`#final-contacts`, …) deve comparire **una sola volta per pagina**: per questo
`contatti.html` non usa `data-layout="cta"`, che conterrebbe un secondo
`#final-contacts`. Un id duplicato non dà errori: il modulo popola silenziosamente
solo il primo. Controllarlo esplicitamente dopo ogni modifica al markup.

### Aggiungere o rinominare una pagina

1. Duplicare la pagina più simile; aggiornare `<title>`, meta description, canonical,
   Open Graph, il commento con la keyword primaria e il `BreadcrumbList` in fondo.
2. Aggiungere la rotta in `routes` e la voce in `navigation` (`js/data.js`).
3. Aggiungere la URL a `sitemap.xml`.

La voce di menu attiva è calcolata da `layout.js` sul nome file: non va marcata a mano.

### Anatomia di una pagina interna

Dopo l'header ogni pagina interna apre con `.page-hero`, che contiene il breadcrumb
(`.crumbs`), l'eyebrow, l'unico `<h1>` e un lead. È il sostituto compatto della hero
cinematografica, che resta esclusiva della home.

Le intestazioni a due voci (`.page-hero__inner`, `.section__head`, `.club__head`) stanno
su una griglia a 12 colonne con passo `--grid-gap`: titolo nelle colonne 1-7, testo nelle
8-12; `.section__head` assegna le colonne al **primo e all'ultimo figlio**, quindi va
tenuto a due figli. Gallerie e righe di numeri riusano lo stesso passo perché i bordi
coincidano; sotto i 1280px tutto passa a colonna singola.

### Regola non negoziabile: nessun dato hardcoded nella UI

Orari, eventi, attività, contatti e risposte del chatbot vanno letti da `TSC`.
`TSC.api` è già asincrono apposta: per collegare API/CMS/gestionale si sostituisce solo
il corpo delle sue funzioni (`getCourses`, `submitEventSignup`, `askAssistant`) senza
toccare la UI. Lo stesso vale per il chatbot: è un motore a intenti locale, non una AI.

### Sistema di superfici CSS

Ogni sezione dichiara le proprie variabili (`--bg`, `--fg`, `--fg-soft`, `--line`,
`--card`, `--accent`, `--accent-text`, `--accent-line`, `--cta-*`) e **i componenti
usano solo quelle**. Aggiungere `.section--light` a una sezione la inverte da navy a
bianco (`.section--light .section--mist` per il bianco freddo) senza riscrivere un solo
componente. Non introdurre colori letterali nei componenti: rompe l'inversione.

Palette del brand: tre colori sociali in testa a `:root` (`--color-tiffany`,
`--color-navy`, `--color-white`) e scale derivate `--navy-*` / `--tiffany-*`. Il Tiffany
è **solo accent** (CTA, hover, indicatori): su navy si usa `--tiffany-300`, su bianco il
testo accent deve essere `--tiffany-700` (il Tiffany pieno su bianco ha contrasto 1.6:1).
I token `--cta-*` fanno sì che la CTA primaria sia Tiffany su navy e navy su bianco; un
blocco navy dentro una sezione chiara (`.corporate__cta`) deve ridichiararli.

### Linguaggio visivo: sobrietà

Forme e movimento sono volutamente asciutti (revisione con la skill `ui-ux-pro-max`):
raggi solo da token (`--r-control` per bottoni, filtri, campi e chip; `--r-pill` solo per
punti, barre e avatar), ombre solo `--shadow-sm|md|lg` e mai colorate, hover dei controlli
= cambio di colore senza sollevamenti o scale (zoom delle foto max `1.03`), sezioni a filo
senza raccordi arrotondati. Niente tilt, grana o animazioni infinite decorative: il
`.pulse` indica solo uno stato live (chat online). Tutto ciò che si rivela all'hover deve
restare visibile con `(hover: none), (pointer: coarse)`.

### Sicurezza del rendering

Tutta la UI è costruita con `innerHTML` da template string: ogni valore proveniente dai
dati o dall'utente **deve** passare da `esc()`. Uniche eccezioni volute: le risposte del
chatbot, che contengono HTML semplice (link) e arrivano da `TSC.api.askAssistant`.

## Trappole già incontrate

- **Display: Archivo 800/900** (hero in 900, maiuscolo). Le scale `--t-3xl`, `--t-4xl`,
  e `.display--xl` sono tarate sulle righe più lunghe dei titoli
  (`"COMMUNITY."` ≈ 6.6em, `"Il primo allenamento"` ≈ 9.5em): quest'ultima a 390px occupa
  ~333px su 353 disponibili, quindi non alzare il minimo di `--t-3xl`. Se si cambia font o
  copy dei titoli, **rimisurare** con `Range.getBoundingClientRect()` invece di stimare.
  Archivo è già compatta: tracking dei titoli fra -0.025em e -0.035em, non oltre.
- **`backdrop-filter` crea un containing block** per i discendenti `position: fixed`.
  Per questo `.site-header.is-nav-open` lo disattiva: senza, il menu mobile a tutto
  schermo viene ritagliato dentro l'header. Stessa attenzione con `transform` e `filter`.
- **`min-width: 0`** serve su figli di flex/grid che scrollano orizzontalmente
  (`.schedule__toolbar > *`, `.partner > *`, `.field`): senza, il contenuto in
  `max-content` allarga tutta la pagina su mobile.
- **`.reveal` rimuove il proprio `transform` a fine animazione**, distruggendo lo stacking
  context: non usare `z-index: -1` dentro elementi rivelati (l'evidenziatore `.u-mark`
  usa un `background-image` per questo motivo).
- Verificare sempre l'assenza di overflow orizzontale a 390 / 768 / 1280 / 1920px.
  Un iframe di larghezza fissa è il modo più rapido per testare i breakpoint.

## Ambito volutamente escluso

Non implementare in questa fase, se non esplicitamente richiesto: backend, database,
autenticazione, Area Clienti (solo modale "In arrivo"), pagamenti, e-commerce del merch
(il CTA punta a `merchStoreUrl`). Il form eventi è demo frontend e logga su console.

## SEO

Una keyword primaria per pagina, dichiarata nel commento in testa a ogni file HTML.
Non creare due pagine sulla stessa query: competerebbero tra loro. Lo Schema.org
dell'attività (`SportsActivityLocation`/`HealthClub`/`Organization` + `FAQPage`) sta
**solo in `index.html`**; le altre pagine hanno un `BreadcrumbList`.

## Dati placeholder

Contatti, indirizzo, P.IVA e coordinate geo sono fittizi e vivono in **tre punti che
devono restare coerenti**: `js/data.js` (`club`), lo Schema.org in fondo a `index.html`
e i meta `canonical`/`og:url` di ogni pagina. Le immagini in `assets/images/` sono
placeholder SVG generati, sostituibili mantenendo gli stessi nomi file.
