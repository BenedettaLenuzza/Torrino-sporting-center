# Torrino Sporting Center — sito web

Sito one-page per un centro sportivo premium a Roma. HTML5 + CSS3 + JavaScript vanilla,
nessun framework, nessuna dipendenza da installare.

---

## Avvio

Il sito è statico: basta aprire `index.html` in un browser.

Per far funzionare tutto correttamente (percorsi relativi, `fetch` futuri) è però
consigliato un server locale:

```bash
# Python 3
python -m http.server 8000

# oppure Node
npx http-server -p 8000
```

Poi apri <http://localhost:8000>.

---

## Struttura del progetto

```text
index.html          home: hero + un teaser per sezione
il-club.html        attivita.html    orari.html      eventi.html
convenzioni.html    merch.html       contatti.html
css/
  style.css         design system e tutti i componenti
js/
  data.js           ⭐ UNICO file da modificare per i contenuti
  layout.js         header, footer, CTA finale, chatbot e modale condivisi
  script.js         rendering e interazioni (nessun dato hardcoded)
assets/
  images/           placeholder fotografici (SVG)
  icons/logoTorrino.svg
tools/
  generate-placeholders.mjs    node tools/generate-placeholders.mjs
robots.txt
sitemap.xml
```

### Come funziona il multipagina

Non c'è build step: header, footer, CTA finale, chatbot e modale Area Clienti
vivono **solo** in `js/layout.js`. Ogni pagina dichiara i segnaposto

```html
<div data-layout="header"></div>
...
<div data-layout="cta"></div>     <!-- opzionale: CTA finale con i contatti -->
<div data-layout="footer"></div>
```

e chiude con i tre script **in quest'ordine**, che è obbligatorio:

```html
<script src="js/data.js"></script>
<script src="js/layout.js"></script>
<script src="js/script.js"></script>
```

Cambiare il footer o una voce di menu si fa in un punto solo.
`js/script.js` è lo stesso su tutte le pagine: ogni modulo monta solo le sezioni
che trova, quindi una pagina senza timetable semplicemente non la costruisce.

### Aggiungere una pagina

1. Duplica la pagina più simile e aggiorna `<title>`, meta description, canonical,
   Open Graph, il commento con la keyword primaria e il BreadcrumbList in fondo.
2. Aggiungi la rotta in `routes` e la voce in `navigation` dentro `js/data.js`.
3. Aggiungi la URL a `sitemap.xml`.

La voce di menu attiva è calcolata dal nome file: non va marcata a mano.

### Teaser in home

Alcuni moduli hanno una versione ridotta, controllata dal markup:

- `<div id="activity-grid" data-limit="4">` mostra solo le prime 4 schede;
- se mancano `#day-filters` e `#schedule-category`, la timetable rende solo il
  giorno corrente;
- se manca `#event-list`, viene reso solo l'evento in evidenza.

---

## Aggiornare i contenuti

Tutto quello che il cliente aggiorna spesso vive in **`js/data.js`**. La UI legge sempre da lì.

| Cosa | Dove in `js/data.js` |
| --- | --- |
| URL delle pagine e voci di menu | `routes`, `navigation` |
| Indirizzo, telefono, email, orari di apertura | `club` |
| Numeri della sezione "Il Club" | `club.stats` |
| Link social | `social` |
| Discipline e schede attività | `activities` |
| **Orari dei corsi** | `courses` |
| Eventi e posti disponibili | `events` |
| Aziende convenzionate | `partners`, `corporateBenefits` |
| Prodotti merch e link e-commerce | `merch`, `merchStoreUrl` |
| Risposte del chatbot | `chatbot` |

### Esempio: aggiungere un corso alla timetable

```javascript
{ day: 'Lunedì', time: '18:00', name: 'Functional Training', trainer: 'Marco De Santis',
  category: 'Functional', room: 'Functional Area', duration: 55, level: 'Intermedio' }
```

`day` deve essere uno dei valori in `days`. La timetable, i filtri per giorno,
il menu delle discipline e le risposte del chatbot si aggiornano da soli.

---

## Collegare API, CMS o gestionale

`js/data.js` espone `TSC.api`: è il contratto dati, già asincrono. Per passare a un
backend si sostituisce **solo** il corpo delle funzioni — la UI non va toccata:

```javascript
TSC.api.getCourses = async () => (await fetch('/api/courses')).json();
TSC.api.submitEventSignup = async (payload) =>
  (await fetch('/api/signup', { method: 'POST', body: JSON.stringify(payload) })).json();
```

Lo stesso vale per il chatbot: oggi è un motore a intenti locale, per collegare un LLM
(Azure OpenAI, chatbot proprietario, ecc.) basta riscrivere `TSC.api.askAssistant`:

```javascript
TSC.api.askAssistant = async (message) => {
  const r = await fetch('/api/assistant', { method: 'POST', body: JSON.stringify({ message }) });
  return (await r.json()).reply; // può contenere HTML semplice (link inclusi)
};
```

---

## Immagini

Le immagini in `assets/images/` sono **placeholder SVG art-directed**, generati da
`tools/generate-placeholders.mjs`. Servono a mostrare il layout con una direzione
cromatica coerente in assenza di fotografie reali.

Per usare le foto definitive: sostituisci i file mantenendo lo stesso nome
(anche in `.jpg`/`.webp`, aggiornando l'estensione nei percorsi di `js/data.js` e
nei pochi `<img>` statici dell'hero e della sezione Club).

Formati consigliati: hero 2400×1400, attività 1200×1500, eventi 1600×1100,
merch 1000×1250, feed social 900×900. Aggiorna anche gli `alt` con descrizioni reali.

---

## SEO

- Ogni pagina ha `<title>`, meta description, canonical e Open Graph propri.
- Gerarchia heading: un solo `<h1>` per pagina, `<h2>` per sezione, `<h3>/<h4>` nei componenti.
- Schema.org: l'entità principale (`SportsActivityLocation` + `HealthClub` +
  `Organization`, `WebSite`, `FAQPage`) sta **solo in `index.html`**; le altre pagine
  hanno un `BreadcrumbList`.
- `robots.txt` e `sitemap.xml` allineati alle pagine reali (dominio da aggiornare).

### Keyword: una primaria per pagina

In testa a ogni file c'è un commento con la keyword primaria di quella pagina:

```text
index.html        [centro sportivo Roma]
il-club.html      [palestra Torrino]
attivita.html     [corsi fitness Roma]
orari.html        [orari corsi palestra Roma]
eventi.html       [eventi sportivi Roma]
convenzioni.html  [convenzioni aziendali palestra Roma]
merch.html        [abbigliamento sportivo club Roma]
contatti.html     [centro sportivo Torrino Roma contatti]
```

Vanno sostituite con quelle concordate con il cliente. Una sola keyword primaria per
pagina: niente keyword stuffing e niente due pagine sulla stessa query, che
competerebbero tra loro.

### Da aggiornare prima del go-live

I dati di contatto sono **placeholder** e vanno sostituiti in tre punti coerenti tra loro:
`js/data.js` (`club`), lo Schema.org in `index.html` e i meta `canonical`/`og:url` di
ogni pagina. Anche P.IVA e coordinate geo sono da compilare. I link legali (`#privacy`,
`#cookie`, `#termini`) puntano ad anchor non ancora esistenti: vanno collegati alle
pagine reali.

---

## Area Clienti

In questa fase è **solo UX predisposta**: il pulsante "Area Clienti · Accedi" in header e
footer apre una modale "In arrivo". Non c'è autenticazione, database né gestione utenti.

Il punto di innesto per il login verso il gestionale è la modale `#account-modal` in
`index.html` e `initAccountModal()` in `js/script.js`.

---

## Form ed e-commerce

Il form di iscrizione eventi è **demo frontend**: valida i campi e simula l'invio
(`console.info`), senza backend né salvataggio dati. La sezione Merch non è un
e-commerce: il CTA punta a `merchStoreUrl`, da sostituire con l'URL dello shop.

---

## Note tecniche

- **Design system**: tutti i token (palette, tipografia, spaziature, raggi, easing) sono
  CSS custom properties in `:root`. Le sezioni chiare si ottengono con la sola classe
  `.section--light` (bianco) o `.section--light .section--mist` (bianco freddo), che
  ridefiniscono le variabili di superficie: nessun componente va riscritto.
- **Palette**: tre colori sociali in testa a `:root` (`--color-tiffany`, `--color-navy`,
  `--color-white`); le scale `--navy-*` e `--tiffany-*` ne derivano. Il Navy è la superficie
  immersiva, il Bianco lo spazio editoriale, il Tiffany solo accent (CTA, hover, indicatori).
  Su bianco il testo accent usa `--tiffany-700` (contrasto AA); i componenti leggono sempre
  i token di superficie `--accent-text`, `--accent-line`, `--cta-*`, mai le scale direttamente.
- **Tipografia**: Archivo 800/900 (display) + Inter (testo) da Google Fonts. Archivo è una
  grottesca solida e leggibile, d'impatto ma non futuristica: le scale `--t-3xl`/`--t-4xl` sono tarate sulle righe più lunghe dei titoli, quindi
  vanno riviste se si cambia font o copy dei titoli.
- **Responsive**: breakpoint a 1280px (griglie editoriali), 1024px (navigazione hamburger,
  layout a colonna singola) e 720px (timetable a schede, chat full width). C'è anche una
  regola per schermi bassi (`max-height: 900px`) perché l'hero resti dentro una schermata.
- **Animazioni**: un solo `IntersectionObserver` per i reveal, contatori animati,
  parallax e tilt attivi solo con mouse. Tutto disattivato con `prefers-reduced-motion`.
- **Accessibilità**: skip link, focus visibile, `aria-label`/`aria-pressed`/`aria-live`
  dove servono, chiusura con `Esc` di menu, chat e modale, HTML semantico.
- **Sicurezza**: ogni valore proveniente dai dati o dall'utente passa da `esc()` prima
  di finire in `innerHTML`.
