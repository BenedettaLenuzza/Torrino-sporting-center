/* =============================================================================
   TORRINO SPORTING CENTER — LIVELLO DATI
   -----------------------------------------------------------------------------
   Questo è l'UNICO file da modificare per aggiornare contenuti dinamici:
   contatti, attività, orari dei corsi, eventi, convenzioni, merch, social,
   risposte del chatbot.

   L'intero file espone `window.TSC`. Nessun componente della UI contiene dati
   hardcoded: la UI legge sempre da qui.

   MIGRAZIONE FUTURA A API / CMS / GESTIONALE
   -----------------------------------------------------------------------------
   Le funzioni in `TSC.api` sono già asincrone e rappresentano il contratto dati.
   Per passare a un backend basta sostituirne il corpo, es.:

     TSC.api.getCourses = async () => (await fetch('/api/courses')).json();

   La UI non va toccata, purché lo shape degli oggetti resti invariato.
   ========================================================================== */

(function (window) {
  'use strict';

  /* ---------------------------------------------------------------------------
     0. ROTTE E NAVIGAZIONE
     Il sito è multipagina: qui vive la mappa sezione → URL, usata da
     js/layout.js (menu e footer), da js/script.js (CTA generate) e dalle
     risposte del chatbot. Rinominare una pagina si fa SOLO qui.
  --------------------------------------------------------------------------- */
  const routes = {
    home: 'index.html',
    club: 'il-club.html',
    attivita: 'attivita.html',
    orari: 'orari.html',
    eventi: 'eventi.html',
    iscrizione: 'eventi.html#iscrizione',
    convenzioni: 'convenzioni.html',
    merch: 'merch.html',
    contatti: 'contatti.html',
  };

  // Voci del menu principale, nell'ordine in cui compaiono.
  const navigation = [
    { label: 'Home', href: routes.home },
    { label: 'Il Club', href: routes.club },
    { label: 'Attività', href: routes.attivita },
    { label: 'Orari', href: routes.orari },
    { label: 'Eventi', href: routes.eventi },
    { label: 'Convenzioni', href: routes.convenzioni },
    { label: 'Merch', href: routes.merch },
    { label: 'Contatti', href: routes.contatti },
  ];

  /* ---------------------------------------------------------------------------
     1. CLUB — dati anagrafici, contatti, SEO
     NOTA: i valori sono PLACEHOLDER. Sostituirli con i dati reali del cliente
     (vengono usati anche nello Schema.org dentro index.html).
  --------------------------------------------------------------------------- */
  const club = {
    name: 'Torrino Sporting Center',
    claim: 'Sport. Energy. Community.',
    address: {
      street: 'Via del Torrino, 00 — Placeholder',
      city: 'Roma',
      zip: '00144',
      region: 'RM',
      country: 'IT',
      maps: 'https://maps.google.com/?q=Torrino+Roma',
    },
    phone: '+39 06 0000 0000',
    phoneHref: '+390600000000',
    email: 'info@torrinosportingcenter.it',
    whatsapp: 'https://wa.me/390600000000',
    opening: [
      { days: 'Lunedì — Venerdì', hours: '06:30 — 23:00' },
      { days: 'Sabato', hours: '08:00 — 21:00' },
      { days: 'Domenica', hours: '08:30 — 14:00' },
    ],
    // Statistiche della sezione "Il Club" — modificabili liberamente.
    stats: [
      { value: 20, suffix: '+', label: 'Discipline sportive', note: 'dal nuoto al functional' },
      { value: 50, suffix: '+', label: 'Corsi a settimana', note: 'dalle 6:30 alle 23:00' },
      { value: 4500, suffix: '', label: 'Metri quadri', note: 'indoor & outdoor' },
      { value: 7, suffix: '/7', label: 'Sport & wellness', note: 'aperti tutti i giorni' },
    ],
  };

  /* ---------------------------------------------------------------------------
     2. SOCIAL — basta cambiare gli url
  --------------------------------------------------------------------------- */
  const social = [
    { name: 'Instagram', handle: '@torrinosportingcenter', url: 'https://instagram.com/', icon: 'instagram' },
    { name: 'Facebook', handle: 'Torrino Sporting Center', url: 'https://facebook.com/', icon: 'facebook' },
    { name: 'TikTok', handle: '@torrinosporting', url: 'https://tiktok.com/', icon: 'tiktok' },
    { name: 'YouTube', handle: 'Torrino Sporting', url: 'https://youtube.com/', icon: 'youtube' },
    { name: 'LinkedIn', handle: 'Torrino Sporting Center', url: 'https://linkedin.com/', icon: 'linkedin' },
  ];

  // Griglia visuale ispirata al feed social.
  const feed = [
    { img: 'assets/images/social-01.svg', alt: 'Atleta durante una sessione di functional training al club', tag: 'Functional', likes: '1.2k' },
    { img: 'assets/images/social-02.svg', alt: 'Vasca semiolimpionica del centro sportivo', tag: 'Swimming', likes: '940' },
    { img: 'assets/images/social-03.svg', alt: 'Dettaglio della sala pesi con attrezzature premium', tag: 'Sala pesi', likes: '760' },
    { img: 'assets/images/social-04.svg', alt: 'Lezione di yoga nella sala panoramica', tag: 'Yoga', likes: '1.5k' },
    { img: 'assets/images/social-05.svg', alt: 'Torneo serale sui campi da tennis illuminati', tag: 'Tennis', likes: '2.1k' },
    { img: 'assets/images/social-06.svg', alt: 'Area wellness e spa del club', tag: 'Wellness', likes: '880' },
  ];

  /* ---------------------------------------------------------------------------
     3. ATTIVITÀ — categorie e schede disciplina
     `category` deve coincidere con il campo usato nei corsi (sezione Orari).
  --------------------------------------------------------------------------- */
  const activities = [
    {
      id: 'fitness',
      name: 'Fitness',
      category: 'Fitness',
      tagline: 'Cardio, tono, resistenza',
      description:
        'Classi di gruppo ad alta energia con musica dal vivo, luci e coaching costante. Zero noia, massimo ritmo.',
      level: 'Tutti i livelli',
      duration: '50 min',
      trainer: 'Giulia Ferri',
      img: 'assets/images/activity-fitness.svg',
      alt: 'Classe di fitness di gruppo in sala con luci scenografiche',
      size: 'lg',
    },
    {
      id: 'sala-pesi',
      name: 'Sala Pesi',
      category: 'Sala pesi',
      tagline: 'Forza, potenza, metodo',
      description:
        '900 mq di isotonico e aree libere, con assistenza tecnica in sala ad ogni fascia oraria.',
      level: 'Base → Avanzato',
      duration: 'Accesso libero',
      trainer: 'Staff tecnico',
      img: 'assets/images/activity-pesi.svg',
      alt: 'Sala pesi con attrezzature professionali e illuminazione calda',
      size: 'sm',
    },
    {
      id: 'functional',
      name: 'Functional',
      category: 'Functional',
      tagline: 'Movimento reale',
      description:
        'Circuiti metabolici su rig, kettlebell, sled e corde. Lavoro a stazioni con intensità progressiva.',
      level: 'Intermedio',
      duration: '55 min',
      trainer: 'Marco De Santis',
      img: 'assets/images/activity-functional.svg',
      alt: 'Atleti impegnati in un circuito di functional training',
      size: 'sm',
    },
    {
      id: 'pilates',
      name: 'Pilates',
      category: 'Pilates',
      tagline: 'Controllo e postura',
      description:
        'Matwork e reformer in piccoli gruppi, per mobilità articolare, core stability e postura.',
      level: 'Tutti i livelli',
      duration: '50 min',
      trainer: 'Sara Colombo',
      img: 'assets/images/activity-pilates.svg',
      alt: 'Lezione di pilates reformer in sala luminosa',
      size: 'md',
    },
    {
      id: 'yoga',
      name: 'Yoga',
      category: 'Yoga',
      tagline: 'Respiro e centro',
      description:
        'Vinyasa, Hatha e Yin nella sala panoramica. Pratica fluida con focus su respiro e consapevolezza.',
      level: 'Tutti i livelli',
      duration: '60 min',
      trainer: 'Elena Rizzo',
      img: 'assets/images/activity-yoga.svg',
      alt: 'Pratica di yoga al tramonto nella sala panoramica',
      size: 'md',
    },
    {
      id: 'swimming',
      name: 'Swimming',
      category: 'Swimming',
      tagline: 'Acqua tutto l’anno',
      description:
        'Vasca semiolimpionica 25 m, corsi di nuoto per adulti e bambini, acquafitness e nuoto libero.',
      level: 'Base → Agonismo',
      duration: '45 min',
      trainer: 'Luca Bernardi',
      img: 'assets/images/activity-swimming.svg',
      alt: 'Nuotatore in vasca semiolimpionica da 25 metri',
      size: 'lg',
    },
    {
      id: 'tennis',
      name: 'Tennis',
      category: 'Tennis',
      tagline: 'Campi in terra e resina',
      description:
        'Quattro campi illuminati, scuola tennis federale, tornei sociali e maestri certificati.',
      level: 'Tutti i livelli',
      duration: '60 min',
      trainer: 'Andrea Pallotta',
      img: 'assets/images/activity-tennis.svg',
      alt: 'Campi da tennis illuminati durante una partita serale',
      size: 'md',
    },
    {
      id: 'personal',
      name: 'Personal Training',
      category: 'Personal Training',
      tagline: 'Uno a uno',
      description:
        'Percorso costruito su valutazione funzionale, obiettivi e tempi reali. Follow-up mensile incluso.',
      level: 'Personalizzato',
      duration: '55 min',
      trainer: 'Team PT',
      img: 'assets/images/activity-personal.svg',
      alt: 'Personal trainer che segue un atleta durante un esercizio',
      size: 'sm',
    },
    {
      id: 'kids',
      name: 'Kids',
      category: 'Kids',
      tagline: 'Sport dai 3 anni',
      description:
        'Avviamento motorio, minitennis, nuoto baby e multisport, con istruttori specializzati.',
      level: '3 — 13 anni',
      duration: '45 min',
      trainer: 'Chiara Neri',
      img: 'assets/images/activity-kids.svg',
      alt: 'Bambini durante una lezione di avviamento motorio',
      size: 'sm',
    },
    {
      id: 'wellness',
      name: 'Wellness',
      category: 'Wellness',
      tagline: 'Recupero e rigenerazione',
      description:
        'Sauna, bagno turco, area relax e massaggi sportivi. Il recupero è parte dell’allenamento.',
      level: 'Accesso libero',
      duration: 'Su prenotazione',
      trainer: 'Spa team',
      img: 'assets/images/activity-wellness.svg',
      alt: 'Area wellness con sauna e zona relax',
      size: 'md',
    },
  ];

  /* ---------------------------------------------------------------------------
     4. ORARI CORSI — la sezione aggiornata più di frequente
     Lo `shape` è volutamente piatto e identico a quello che restituirebbe una API.
     `day` deve essere uno dei valori in `days`.
  --------------------------------------------------------------------------- */
  const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  const courses = [
    // --- Lunedì ---
    { day: 'Lunedì', time: '07:00', name: 'Functional Wake Up', trainer: 'Marco De Santis', category: 'Functional', room: 'Functional Area', duration: 50, level: 'Intermedio' },
    { day: 'Lunedì', time: '09:30', name: 'Pilates Matwork', trainer: 'Sara Colombo', category: 'Pilates', room: 'Studio 2', duration: 50, level: 'Base' },
    { day: 'Lunedì', time: '12:30', name: 'Nuoto Libero Assistito', trainer: 'Luca Bernardi', category: 'Swimming', room: 'Vasca 25m', duration: 45, level: 'Tutti' },
    { day: 'Lunedì', time: '18:00', name: 'Functional Training', trainer: 'Marco De Santis', category: 'Functional', room: 'Functional Area', duration: 55, level: 'Intermedio' },
    { day: 'Lunedì', time: '19:00', name: 'Total Body', trainer: 'Giulia Ferri', category: 'Fitness', room: 'Sala Grande', duration: 50, level: 'Tutti' },
    { day: 'Lunedì', time: '20:00', name: 'Vinyasa Flow', trainer: 'Elena Rizzo', category: 'Yoga', room: 'Sala Panoramica', duration: 60, level: 'Tutti' },

    // --- Martedì ---
    { day: 'Martedì', time: '07:00', name: 'Swim Performance', trainer: 'Luca Bernardi', category: 'Swimming', room: 'Vasca 25m', duration: 45, level: 'Avanzato' },
    { day: 'Martedì', time: '10:00', name: 'Pilates Reformer', trainer: 'Sara Colombo', category: 'Pilates', room: 'Studio Reformer', duration: 50, level: 'Intermedio' },
    { day: 'Martedì', time: '17:00', name: 'Minitennis Kids', trainer: 'Chiara Neri', category: 'Kids', room: 'Campo 3', duration: 45, level: '6-10 anni' },
    { day: 'Martedì', time: '18:30', name: 'HIIT Express', trainer: 'Giulia Ferri', category: 'Fitness', room: 'Sala Grande', duration: 40, level: 'Avanzato' },
    { day: 'Martedì', time: '19:30', name: 'Tennis Adulti', trainer: 'Andrea Pallotta', category: 'Tennis', room: 'Campo 1', duration: 60, level: 'Intermedio' },
    { day: 'Martedì', time: '20:30', name: 'Yin Yoga', trainer: 'Elena Rizzo', category: 'Yoga', room: 'Sala Panoramica', duration: 60, level: 'Tutti' },

    // --- Mercoledì ---
    { day: 'Mercoledì', time: '07:00', name: 'Functional Wake Up', trainer: 'Marco De Santis', category: 'Functional', room: 'Functional Area', duration: 50, level: 'Intermedio' },
    { day: 'Mercoledì', time: '09:30', name: 'Postural Care', trainer: 'Sara Colombo', category: 'Pilates', room: 'Studio 2', duration: 50, level: 'Base' },
    { day: 'Mercoledì', time: '11:00', name: 'Acquafitness', trainer: 'Luca Bernardi', category: 'Swimming', room: 'Vasca 25m', duration: 45, level: 'Tutti' },
    { day: 'Mercoledì', time: '18:00', name: 'Cardio Boxing', trainer: 'Giulia Ferri', category: 'Fitness', room: 'Sala Grande', duration: 50, level: 'Intermedio' },
    { day: 'Mercoledì', time: '19:00', name: 'Strength Lab', trainer: 'Team PT', category: 'Sala pesi', room: 'Sala Pesi', duration: 60, level: 'Avanzato' },
    { day: 'Mercoledì', time: '20:00', name: 'Hatha Yoga', trainer: 'Elena Rizzo', category: 'Yoga', room: 'Sala Panoramica', duration: 60, level: 'Base' },

    // --- Giovedì ---
    { day: 'Giovedì', time: '07:30', name: 'Morning Strength', trainer: 'Team PT', category: 'Sala pesi', room: 'Sala Pesi', duration: 55, level: 'Intermedio' },
    { day: 'Giovedì', time: '10:00', name: 'Pilates Reformer', trainer: 'Sara Colombo', category: 'Pilates', room: 'Studio Reformer', duration: 50, level: 'Intermedio' },
    { day: 'Giovedì', time: '17:00', name: 'Nuoto Baby', trainer: 'Chiara Neri', category: 'Kids', room: 'Vasca Didattica', duration: 40, level: '3-6 anni' },
    { day: 'Giovedì', time: '18:30', name: 'Functional Circuit', trainer: 'Marco De Santis', category: 'Functional', room: 'Functional Area', duration: 55, level: 'Tutti' },
    { day: 'Giovedì', time: '19:30', name: 'Tennis Avanzato', trainer: 'Andrea Pallotta', category: 'Tennis', room: 'Campo 2', duration: 60, level: 'Avanzato' },
    { day: 'Giovedì', time: '20:30', name: 'Stretch & Release', trainer: 'Elena Rizzo', category: 'Wellness', room: 'Sala Panoramica', duration: 45, level: 'Tutti' },

    // --- Venerdì ---
    { day: 'Venerdì', time: '07:00', name: 'Swim Performance', trainer: 'Luca Bernardi', category: 'Swimming', room: 'Vasca 25m', duration: 45, level: 'Avanzato' },
    { day: 'Venerdì', time: '09:30', name: 'Total Body', trainer: 'Giulia Ferri', category: 'Fitness', room: 'Sala Grande', duration: 50, level: 'Tutti' },
    { day: 'Venerdì', time: '13:00', name: 'Express Lunch Workout', trainer: 'Team PT', category: 'Functional', room: 'Functional Area', duration: 30, level: 'Tutti' },
    { day: 'Venerdì', time: '18:00', name: 'Friday Beats', trainer: 'Giulia Ferri', category: 'Fitness', room: 'Sala Grande', duration: 55, level: 'Tutti' },
    { day: 'Venerdì', time: '19:00', name: 'Functional Advanced', trainer: 'Marco De Santis', category: 'Functional', room: 'Functional Area', duration: 55, level: 'Avanzato' },
    { day: 'Venerdì', time: '20:00', name: 'Yoga Restorative', trainer: 'Elena Rizzo', category: 'Yoga', room: 'Sala Panoramica', duration: 60, level: 'Tutti' },

    // --- Sabato ---
    { day: 'Sabato', time: '09:00', name: 'Weekend Functional', trainer: 'Marco De Santis', category: 'Functional', room: 'Functional Area', duration: 60, level: 'Tutti' },
    { day: 'Sabato', time: '10:00', name: 'Scuola Tennis Kids', trainer: 'Chiara Neri', category: 'Kids', room: 'Campo 3', duration: 60, level: '7-13 anni' },
    { day: 'Sabato', time: '11:00', name: 'Pilates Matwork', trainer: 'Sara Colombo', category: 'Pilates', room: 'Studio 2', duration: 50, level: 'Base' },
    { day: 'Sabato', time: '12:00', name: 'Nuoto Libero', trainer: 'Staff vasca', category: 'Swimming', room: 'Vasca 25m', duration: 60, level: 'Tutti' },
    { day: 'Sabato', time: '17:00', name: 'Tennis Social Match', trainer: 'Andrea Pallotta', category: 'Tennis', room: 'Campo 1', duration: 90, level: 'Tutti' },

    // --- Domenica ---
    { day: 'Domenica', time: '09:30', name: 'Sunday Flow', trainer: 'Elena Rizzo', category: 'Yoga', room: 'Sala Panoramica', duration: 60, level: 'Tutti' },
    { day: 'Domenica', time: '10:30', name: 'Family Swim', trainer: 'Luca Bernardi', category: 'Kids', room: 'Vasca Didattica', duration: 50, level: 'Family' },
    { day: 'Domenica', time: '11:30', name: 'Recovery & Sauna', trainer: 'Spa team', category: 'Wellness', room: 'Area Wellness', duration: 60, level: 'Tutti' },
  ];

  /* ---------------------------------------------------------------------------
     5. EVENTI
  --------------------------------------------------------------------------- */
  const events = [
    {
      id: 'open-day',
      featured: true,
      title: 'Open Day — Stagione 2026',
      date: '2026-10-11',
      dateLabel: '11 Ottobre 2026',
      time: '10:00 — 19:00',
      location: 'Tutte le aree del club',
      seats: 120,
      seatsLeft: 34,
      category: 'Open Day',
      excerpt:
        'Una giornata intera con tutte le sale aperte: prova gratuitamente functional, pilates, nuoto e tennis, incontra i trainer e scopri le formule di abbonamento della nuova stagione.',
      img: 'assets/images/event-01.svg',
      alt: 'Open day del centro sportivo con aree aperte al pubblico',
    },
    {
      id: 'notte-tennis',
      featured: false,
      title: 'La Notte del Tennis',
      date: '2026-10-25',
      dateLabel: '25 Ottobre 2026',
      time: '18:30 — 24:00',
      location: 'Campi 1 — 4',
      seats: 64,
      seatsLeft: 12,
      category: 'Torneo',
      excerpt: 'Torneo sociale di doppio a eliminazione diretta, luci accese fino a mezzanotte e after match nel lounge.',
      img: 'assets/images/event-02.svg',
      alt: 'Torneo di tennis notturno sui campi illuminati',
    },
    {
      id: 'masterclass-functional',
      featured: false,
      title: 'Masterclass Functional',
      date: '2026-11-08',
      dateLabel: '8 Novembre 2026',
      time: '10:00 — 13:00',
      location: 'Functional Area',
      seats: 40,
      seatsLeft: 9,
      category: 'Masterclass',
      excerpt: 'Tre ore di tecnica con coach ospite: pattern di movimento, programmazione e prevenzione infortuni.',
      img: 'assets/images/event-03.svg',
      alt: 'Masterclass di functional training con coach ospite',
    },
    {
      id: 'wellness-weekend',
      featured: false,
      title: 'Wellness Weekend',
      date: '2026-11-22',
      dateLabel: '22 Novembre 2026',
      time: '09:00 — 20:00',
      location: 'Area Wellness & Spa',
      seats: 50,
      seatsLeft: 21,
      category: 'Wellness',
      excerpt: 'Percorso spa guidato, sessioni di respirazione, yin yoga e consulenze nutrizionali individuali.',
      img: 'assets/images/event-04.svg',
      alt: 'Weekend dedicato al wellness nella spa del club',
    },
  ];

  /* ---------------------------------------------------------------------------
     6. CONVENZIONI AZIENDALI
     `logo` è un wordmark testuale: la UI lo rende tipograficamente.
     Per usare loghi reali aggiungere `logoImg: 'assets/images/partner-x.svg'`.
  --------------------------------------------------------------------------- */
  const partners = [
    { name: 'Nexora', sector: 'Tech & Software', discount: '-25%', benefit: 'Abbonamento full access per dipendenti e nucleo familiare.' },
    { name: 'Marelli Group', sector: 'Industria', discount: '-20%', benefit: 'Quota di iscrizione azzerata e personal training di ingresso.' },
    { name: 'Aureo Bank', sector: 'Banking', discount: '-30%', benefit: 'Formula corporate con accesso libero alla spa.' },
    { name: 'Vela Logistics', sector: 'Logistica', discount: '-15%', benefit: 'Fasce orarie dedicate ai turnisti, anche alle 6:30.' },
    { name: 'Studio Ferrante', sector: 'Professional', discount: '-20%', benefit: 'Pacchetti posturali e valutazione funzionale inclusa.' },
    { name: 'Orizzonte Energia', sector: 'Energy', discount: '-25%', benefit: 'Corporate wellness day in sede una volta l’anno.' },
    { name: 'Clinica San Paolo', sector: 'Healthcare', discount: '-20%', benefit: 'Percorsi di riatletizzazione con referto medico.' },
    { name: 'EUR Business Hub', sector: 'Coworking', discount: '-30%', benefit: 'Accesso lunch break con navetta dedicata.' },
  ];

  const corporateBenefits = [
    { n: '01', title: 'Tariffe dedicate', text: 'Sconti da -15% a -30% su tutte le formule, estesi ai familiari conviventi.' },
    { n: '02', title: 'Referente unico', text: 'Un account manager del club dedicato alla tua azienda, con reportistica adesioni.' },
    { n: '03', title: 'Wellness in sede', text: 'Screening posturali, workshop e classi outdoor direttamente nei vostri uffici.' },
    { n: '04', title: 'Onboarding express', text: 'Attivazione in 48 ore con link di iscrizione riservato ai dipendenti.' },
  ];

  /* ---------------------------------------------------------------------------
     7. MERCH — il CTA può puntare a un e-commerce esterno
  --------------------------------------------------------------------------- */
  const merchStoreUrl = '#merch'; // ← sostituire con l'URL dell'e-commerce
  const merch = [
    { name: 'Tee Performance', line: 'Capsule 01', price: '€ 32', img: 'assets/images/merch-01.svg', alt: 'T-shirt tecnica brandizzata del club' },
    { name: 'Hoodie Heritage', line: 'Capsule 01', price: '€ 79', img: 'assets/images/merch-02.svg', alt: 'Felpa con cappuccio con logo del club' },
    { name: 'Gym Bag Pro', line: 'Accessori', price: '€ 54', img: 'assets/images/merch-03.svg', alt: 'Borsone sportivo brandizzato' },
    { name: 'Cap & Bottle Set', line: 'Accessori', price: '€ 28', img: 'assets/images/merch-04.svg', alt: 'Set cappellino e borraccia del club' },
  ];

  /* ---------------------------------------------------------------------------
     8. CHATBOT — "Segretaria Virtuale"
     Versione demo a intenti: nessuna AI, solo pattern matching sulle keyword.
     La risposta può essere una stringa o una funzione (per dati dinamici).

     COLLEGAMENTO FUTURO A UN LLM / API:
     sovrascrivere `TSC.api.askAssistant(message)` con una fetch verso il proprio
     backend (Azure OpenAI, chatbot proprietario, ecc.). La UI resta identica.
  --------------------------------------------------------------------------- */
  const chatbot = {
    name: 'Segretaria Virtuale',
    greeting:
      'Ciao! Sono la Segretaria Virtuale del Torrino Sporting Center. Posso aiutarti con orari, corsi, eventi e iscrizioni. Da dove partiamo?',
    quickActions: [
      'Quali corsi ci sono oggi?',
      'A che ora apre il centro?',
      'Orari di Pilates',
      'Come posso iscrivermi?',
      'Dove si trova il centro?',
      'Eventi in programma',
    ],
    fallback:
      'Su questo non ho ancora la risposta pronta. Scrivi a <a href="mailto:info@torrinosportingcenter.it">info@torrinosportingcenter.it</a> o chiama la segreteria: ti rispondiamo in giornata.',
    intents: [
      {
        id: 'today',
        keywords: ['oggi', 'adesso', 'stasera', 'corsi di oggi'],
        answer: () => {
          const today = days[(new Date().getDay() + 6) % 7];
          const list = courses.filter((c) => c.day === today);
          if (!list.length) return `Oggi (${today}) non ci sono corsi a calendario, ma la sala pesi è aperta regolarmente.`;
          const rows = list.map((c) => `• <strong>${c.time}</strong> — ${c.name} <em>(${c.trainer})</em>`).join('<br>');
          return `Ecco i corsi di <strong>${today}</strong>:<br>${rows}<br>Trovi la timetable completa nella sezione <a href="${routes.orari}">Orari</a>.`;
        },
      },
      {
        id: 'opening',
        keywords: ['apre', 'chiude', 'orari di apertura', 'aperto', 'apertura', 'chiusura'],
        answer: () =>
          `Il club è aperto:<br>${club.opening
            .map((o) => `• <strong>${o.days}</strong>: ${o.hours}`)
            .join('<br>')}`,
      },
      {
        id: 'course-hours',
        keywords: ['pilates', 'yoga', 'functional', 'nuoto', 'swimming', 'tennis', 'fitness', 'kids', 'pesi', 'wellness'],
        answer: (msg) => {
          const map = { pilates: 'Pilates', yoga: 'Yoga', functional: 'Functional', nuoto: 'Swimming', swimming: 'Swimming', tennis: 'Tennis', fitness: 'Fitness', kids: 'Kids', pesi: 'Sala pesi', wellness: 'Wellness' };
          const key = Object.keys(map).find((k) => msg.includes(k));
          const cat = map[key];
          const list = courses.filter((c) => c.category === cat).slice(0, 6);
          if (!list.length) return `Al momento non ho corsi di ${cat} a calendario.`;
          const rows = list.map((c) => `• ${c.day} <strong>${c.time}</strong> — ${c.name}`).join('<br>');
          return `Orari <strong>${cat}</strong>:<br>${rows}<br>Filtra la <a href="${routes.orari}">timetable</a> per vedere tutto.`;
        },
      },
      {
        id: 'subscribe',
        keywords: ['iscriver', 'iscrizione', 'abbonarmi', 'come faccio a iscrivermi', 'tesseramento'],
        answer:
          'Iscriversi è semplice: prenota una visita dalla sezione <a href="${routes.contatti}">Contatti</a>, vieni in segreteria con un documento e il certificato medico sportivo. Completiamo tutto in circa 15 minuti.',
      },
      {
        id: 'price',
        keywords: ['costa', 'prezzo', 'prezzi', 'quanto', 'tariffe', 'abbonamento'],
        answer:
          'Le formule vanno dall’accesso mensile all’abbonamento annuale full access (sala, corsi, piscina e wellness). Il listino aggiornato lo consegna la segreteria: scrivici dai <a href="${routes.contatti}">Contatti</a> e te lo inviamo subito.',
      },
      {
        id: 'where',
        keywords: ['dove', 'indirizzo', 'come arrivo', 'mappa', 'sede'],
        answer: () =>
          `Siamo in <strong>${club.address.street}</strong>, ${club.address.zip} ${club.address.city}. <a href="${club.address.maps}" target="_blank" rel="noopener">Apri la mappa</a>.`,
      },
      {
        id: 'parking',
        keywords: ['parcheggio', 'parcheggi', 'auto', 'posto auto'],
        answer:
          'Sì: parcheggio interno gratuito riservato ai soci, più stalli esterni nelle immediate vicinanze. Per le due ruote c’è un’area coperta dedicata.',
      },
      {
        id: 'events',
        keywords: ['evento', 'eventi', 'open day', 'torneo', 'masterclass'],
        answer: () => {
          const rows = events
            .slice(0, 3)
            .map((e) => `• <strong>${e.title}</strong> — ${e.dateLabel}, ${e.time}`)
            .join('<br>');
          return `Prossimi appuntamenti:<br>${rows}<br>Puoi iscriverti dal form nella sezione <a href="${routes.eventi}">Eventi</a>.`;
        },
      },
      {
        id: 'corporate',
        keywords: ['convenzion', 'azienda', 'aziende', 'corporate', 'dipendenti'],
        answer: () =>
          `Abbiamo ${partners.length} aziende convenzionate con sconti dal 15% al 30%. Trovi l’elenco e i benefit nella sezione <a href="${routes.convenzioni}">Convenzioni</a>: se la tua azienda non c’è, attiviamo la convenzione in 48 ore.`,
      },
      {
        id: 'merch',
        keywords: ['merch', 'maglietta', 'felpa', 'shop', 'negozio', 'acquist'],
        answer:
          'Il merchandising del club è disponibile in reception e nella sezione <a href="${routes.merch}">Merch</a>: t-shirt tecniche, felpe, borsoni e accessori della capsule ufficiale.',
      },
      {
        id: 'contact',
        keywords: ['contatt', 'segreteria', 'telefono', 'email', 'parlare con'],
        answer: () =>
          `Puoi chiamarci al <a href="tel:${club.phoneHref}">${club.phone}</a>, scriverci a <a href="mailto:${club.email}">${club.email}</a> oppure passare in segreteria negli orari di apertura.`,
      },
      {
        id: 'account',
        keywords: ['area clienti', 'login', 'accedi', 'password', 'profilo'],
        answer:
          'L’<strong>Area Clienti</strong> (abbonamento, prenotazioni e rinnovi online) è in arrivo. Nel frattempo la segreteria gestisce prenotazioni e rinnovi: ti avvisiamo appena sarà attiva.',
      },
    ],
  };

  /* ---------------------------------------------------------------------------
     9. CONTRATTO DATI — punto unico di migrazione verso API/CMS/gestionale
  --------------------------------------------------------------------------- */
  const api = {
    getClub: async () => club,
    getActivities: async () => activities,
    getCourses: async () => courses,
    getEvents: async () => events,
    getPartners: async () => partners,
    getMerch: async () => merch,
    getFeed: async () => feed,

    /** Iscrizione evento — demo frontend. Sostituire con POST verso il backend. */
    submitEventSignup: async (payload) => {
      console.info('[TSC] Iscrizione evento (demo, nessun backend):', payload);
      await new Promise((r) => setTimeout(r, 700));
      return { ok: true, message: 'Iscrizione registrata. Ti contatteremo per la conferma.' };
    },

    /** Richiesta contatto — demo frontend. */
    submitContact: async (payload) => {
      console.info('[TSC] Richiesta contatto (demo, nessun backend):', payload);
      await new Promise((r) => setTimeout(r, 700));
      return { ok: true, message: 'Richiesta inviata. Ti rispondiamo entro 24 ore.' };
    },

    /**
     * Chatbot — motore demo a intenti.
     * Per collegare un LLM reale sostituire il corpo, es.:
     *   const r = await fetch('/api/assistant', {method:'POST', body: JSON.stringify({message})});
     *   return (await r.json()).reply;
     */
    askAssistant: async (message) => {
      const msg = (message || '').toLowerCase();
      await new Promise((r) => setTimeout(r, 450 + Math.random() * 350));
      const intent = chatbot.intents.find((i) => i.keywords.some((k) => msg.includes(k)));
      if (!intent) return chatbot.fallback;
      return typeof intent.answer === 'function' ? intent.answer(msg) : intent.answer;
    },
  };

  window.TSC = { routes, navigation, club, social, feed, activities, days, courses, events, partners, corporateBenefits, merch, merchStoreUrl, chatbot, api };
})(window);
