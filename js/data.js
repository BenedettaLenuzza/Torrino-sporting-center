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
    // Pagine verticali: la chiave coincide con l'id in `verticals`.
    fitness: 'fitness.html',
    personal: 'personal-training.html',
    nuoto: 'nuoto.html',
    tennis: 'tennis.html',
    mindbody: 'pilates-yoga.html',
    kids: 'kids.html',
    wellness: 'wellness.html',
  };

  // Voci del menu principale, nell'ordine in cui compaiono.
  // Il menu è corto di proposito: porta verso le attività (e da lì alle pagine
  // verticali). Convenzioni e Merch restano raggiungibili dal footer.
  const navigation = [
    { label: 'Home', href: routes.home },
    { label: 'Il Club', href: routes.club },
    { label: 'Attività', href: routes.attivita },
    { label: 'Orari', href: routes.orari },
    { label: 'Eventi', href: routes.eventi },
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
      vertical: 'fitness',
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
      vertical: 'fitness',
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
      vertical: 'fitness',
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
      vertical: 'mindbody',
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
      vertical: 'mindbody',
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
      vertical: 'nuoto',
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
      vertical: 'tennis',
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
      vertical: 'personal',
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
      vertical: 'kids',
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
      vertical: 'wellness',
      img: 'assets/images/activity-wellness.svg',
      alt: 'Area wellness con sauna e zona relax',
      size: 'md',
    },
  ];

  /* ---------------------------------------------------------------------------
     3b. PAGINE VERTICALI — un "mondo" per attività
     Ogni pagina verticale è un percorso di comunicazione in 9 tappe, sempre
     nello stesso ordine (la struttura è comune, contenuti e tono no):

       1. hero       problema + prima CTA        6. equipment  tecnologie/attrezzature
       2. problem    normalizzazione             7. team       competenze dello staff
       3. solution   la nostra risposta          8. faq        dubbi anticipati
       4. journey    il percorso concreto        9. final      CTA finale
       5. stories    testimonianze

     `lead` descrive il mini-quiz + form contatti aperto da tutte le CTA della
     pagina (`[data-lead-open]`); l'invio passa da `TSC.api.submitLead`.
     `assistant` è l'aggancio per l'agente AI verticale: personalizza la chat
     (nome, saluto, domande rapide) e aggiunge intenti valutati per primi.
     `card` è la scheda "Scegli il tuo mondo" (home e attivita.html): il bisogno
     in una riga, per portare l'utente dalla vetrina alla pagina verticale.
     L'ordine delle chiavi qui sotto è l'ordine delle schede.

     Nei testi `*parola*` diventa l'evidenziatore Tiffany (dopo l'escape).
     `logo` è facoltativo: se valorizzato sostituisce il wordmark testuale.
     Icone disponibili: vedi ICONS in js/script.js.

     PLACEHOLDER: statistiche, testimonianze, nomi e risultati sono di esempio.
     Prima della pubblicazione vanno sostituiti con dati reali, verificabili e
     con il consenso scritto delle persone citate.
  --------------------------------------------------------------------------- */
  const verticals = {
    fitness: {
      id: 'fitness',
      name: 'Fitness & Sala Pesi',
      logo: '',
      cta: { label: 'Prenota la settimana di prova', short: 'Prova gratuita' },
      card: { tagline: 'Rimettersi in forma', hook: 'Vuoi dire addio alla pancia e ritrovare energia?' },

      hero: {
        eyebrow: 'Fitness & Sala Pesi · Rimettersi in forma',
        title: 'Vuoi dire *addio alla pancia?*',
        lead:
          'Diete lampo e abbonamenti mai usati non funzionano. Funziona un piano chiaro: corsi che ti tengono il ritmo, una sala pesi con un tecnico sempre presente e un obiettivo verificato ogni mese.',
        trust: ['7 giorni gratis', 'Scheda d’ingresso inclusa', 'Senza impegno'],
        proof: { value: '50+', unit: 'corsi', label: 'a settimana, dalle 6:30 alle 23:00', points: ['Meno girovita', 'Più energia', 'Sempre seguito'] },
        img: 'assets/images/fitness-hero.svg',
        alt: 'Classe di fitness di gruppo ad alta energia in sala corsi',
      },

      problem: {
        eyebrow: 'Ti riconosci?',
        title: 'Capita *a quasi tutti.*',
        lead: 'Lavoro, famiglia, poco tempo: rimettersi in forma sembra sempre un progetto per “il prossimo lunedì”. Non sei tu il problema.',
        pains: [
          { icon: 'flame', title: '“La pancia non va via”', text: 'Dieta, qualche corsa, poi si molla. Senza un piano il grasso addominale è il primo ad arrivare e l’ultimo ad andare.' },
          { icon: 'battery', title: '“Sono sempre stanco”', text: 'Scrivania, divano, poco sonno. Paradossalmente è proprio il movimento a restituire energia.' },
          { icon: 'loop', title: '“Mi iscrivo e poi smetto”', text: 'A febbraio la palestra si svuota: da soli, senza gruppo e senza guida, la motivazione dura poche settimane.' },
        ],
        stat: { value: '8 su 10', text: 'dei nuovi iscritti ci dice di aver già provato a rimettersi in forma da solo.' },
      },

      solution: {
        eyebrow: 'La nostra risposta',
        title: 'Non un abbonamento. *Un piano.*',
        lead:
          'Al primo ingresso un tecnico misura il tuo punto di partenza e ti costruisce la settimana tipo: sala pesi per la forza, corsi e functional per bruciare, un check mensile per non perdere la rotta.',
        pillars: [
          { icon: 'target', title: 'Obiettivo', text: 'chiaro, misurato dal primo giorno' },
          { icon: 'calendar', title: 'Settimana tipo', text: 'costruita sui tuoi orari reali' },
          { icon: 'users', title: 'Gruppo', text: 'che ti trascina anche nei giorni no' },
          { icon: 'chart', title: 'Check mensile', text: 'numeri alla mano, non impressioni' },
        ],
      },

      journey: {
        eyebrow: 'Come funziona',
        title: 'Da zero a costante *in 5 step*',
        steps: [
          { meta: 'Giorno 1', title: 'Check d’ingresso', text: 'Peso, girovita, composizione corporea e colloquio sugli obiettivi.' },
          { meta: 'Giorno 1', title: 'La tua scheda', text: 'Sala pesi e corsi combinati in una settimana tipo realistica.' },
          { meta: 'Settimane 1–2', title: 'Inserimento', text: 'Un tecnico ti affianca in sala finché la tecnica è sicura.' },
          { meta: 'Tutto il mese', title: 'Corsi a scelta', text: 'Più di 50 lezioni: functional, cardio, tono, dalle 6:30 alle 23.' },
          { meta: 'Ogni 4 settimane', title: 'Check-up', text: 'Rimisuriamo e aggiorniamo la scheda sui risultati.' },
        ],
      },

      stories: {
        eyebrow: 'Persone come te',
        title: 'Hanno detto *addio alla pancia*',
        lead: 'Soci che sono partiti con poco tempo e tanti dubbi. I risultati li abbiamo misurati insieme.',
        items: [
          { quote: 'Tre corsi a settimana in pausa pranzo e la scheda il sabato. Dopo quattro mesi ho ricomprato i jeans di una taglia in meno.', name: 'Paola', detail: '45 anni · commercialista', result: '−9 cm', resultLabel: 'di girovita in 16 settimane' },
          { quote: 'Non ero mai entrato in una sala pesi. Il tecnico mi ha seguito le prime settimane, ora mi alleno da solo con sicurezza.', name: 'Giorgio', detail: '52 anni · ingegnere', result: '−7 kg', resultLabel: 'in 5 mesi, senza diete estreme' },
          { quote: 'Il gruppo del functional delle 7 è il motivo per cui non salto un allenamento da un anno.', name: 'Serena', detail: '33 anni · infermiera', result: '140', resultLabel: 'allenamenti nell’ultimo anno' },
        ],
        note: 'I risultati variano da persona a persona: per questo li misuriamo.',
      },

      equipment: {
        eyebrow: 'Spazi e attrezzature',
        title: 'Tutto quello che serve, *in un posto solo*',
        lead: 'Sala pesi, studi corsi e area functional sotto lo stesso tetto: allenamenti vari, mai noiosi.',
        items: [
          { name: 'Sala pesi', tag: '900 mq', text: 'Isotonici di ultima generazione, rack, pedane e manubri fino a 50 kg.', img: 'assets/images/fitness-tech-01.svg', alt: 'Sala pesi con isotonici e area manubri' },
          { name: 'Area functional', tag: 'Rig, sled, kettlebell', text: 'Circuiti metabolici che bruciano calorie e costruiscono forza utile.', img: 'assets/images/fitness-tech-02.svg', alt: 'Area functional con rig e kettlebell' },
          { name: 'Studi corsi', tag: 'Luci e sound system', text: 'Tre sale dedicate alle lezioni di gruppo, climatizzate e insonorizzate.', img: 'assets/images/fitness-tech-03.svg', alt: 'Studio corsi con illuminazione scenografica' },
          { name: 'Composizione corporea', tag: 'Bioimpedenza', text: 'Massa grassa e massa magra misurate a ogni check-up mensile.', img: 'assets/images/fitness-tech-04.svg', alt: 'Misurazione della composizione corporea' },
        ],
      },

      team: {
        eyebrow: 'Il team',
        title: 'Tecnici *sempre in sala*',
        lead: 'Laureati in Scienze Motorie, presenti in ogni fascia oraria: non sei mai solo davanti a un attrezzo.',
        members: [
          { name: 'Giulia Ferri', role: 'Coordinatrice corsi fitness', bio: 'Costruisce il palinsesto dei corsi perché ogni fascia oraria abbia la sua lezione.', creds: ['Scienze Motorie', 'Group fitness'], img: 'assets/images/fitness-staff-01.svg', alt: 'Ritratto di Giulia Ferri' },
          { name: 'Paolo Serra', role: 'Responsabile sala pesi', bio: 'Imposta le schede d’ingresso e segue i check-up mensili dei soci.', creds: ['Scienze Motorie', 'Istruttore pesistica'], img: 'assets/images/fitness-staff-02.svg', alt: 'Ritratto di Paolo Serra' },
          { name: 'Marco De Santis', role: 'Functional training', bio: 'Circuiti ad alta intensità calibrati su ogni livello, dal principiante all’atleta.', creds: ['Scienze Motorie', 'Istruttore functional'], img: 'assets/images/fitness-staff-03.svg', alt: 'Ritratto di Marco De Santis' },
        ],
      },

      faq: {
        eyebrow: 'Domande frequenti',
        title: 'Hai ancora *qualche dubbio?*',
        items: [
          { q: 'Sono fuori allenamento da anni: da dove parto?', a: 'Dal check d’ingresso: misuriamo il tuo punto di partenza e costruiamo una scheda proporzionata. Nelle prime settimane un tecnico ti affianca in sala.' },
          { q: 'Quante volte a settimana devo venire?', a: 'Tre allenamenti a settimana sono l’obiettivo ideale, ma si parte anche da due. La settimana tipo la costruiamo sui tuoi orari reali.' },
          { q: 'Si perde peso solo facendo cardio?', a: 'No: la combinazione più efficace è forza in sala pesi più lavoro metabolico nei corsi. Per questo il piano le unisce.' },
          { q: 'Posso seguire tutti i corsi?', a: 'Sì, con la formula full access accedi a sala pesi e a tutti i corsi di gruppo, prenotando il posto dall’app o in segreteria.' },
          { q: 'Mi date anche indicazioni sull’alimentazione?', a: 'Al check d’ingresso diamo indicazioni generali; per un piano alimentare personalizzato ti mettiamo in contatto con il nutrizionista che collabora con il club.' },
          { q: 'Quanto costa?', a: 'La settimana di prova è gratuita. Dopo scegli tra formula mensile, trimestrale o annuale: il listino te lo presentiamo in trasparenza al primo ingresso.' },
        ],
      },

      final: {
        eyebrow: 'Il primo passo',
        title: 'Una settimana. *Gratis.*',
        lead: 'Sette giorni per provare sala pesi e corsi, con il check d’ingresso incluso. Se non fa per te, nessun impegno.',
      },

      lead: {
        title: 'Settimana di prova Fitness',
        intro: 'Tre domande per preparare il tuo check d’ingresso. Poi ti richiamiamo per fissare il primo giorno.',
        questions: [
          { q: 'Qual è il tuo obiettivo principale?', options: ['Perdere peso e girovita', 'Tonificare', 'Avere più energia', 'Aumentare la forza'] },
          { q: 'Come ti alleni oggi?', options: ['Non mi alleno', 'Ogni tanto, senza costanza', 'Da solo, con regolarità', 'Vengo da un’altra palestra'] },
          { q: 'Quando preferisci allenarti?', options: ['Mattina presto', 'Pausa pranzo', 'Sera', 'Nel weekend'] },
        ],
        profileFrom: 0,
        profiles: {
          'Perdere peso e girovita': { title: 'Piano “Addio pancia”', text: 'Forza in sala due volte a settimana e un corso metabolico: il mix più efficace per bruciare grasso senza perdere muscolo.' },
          'Tonificare': { title: 'Piano “Tono e forma”', text: 'Scheda di tonificazione con carichi progressivi e corsi di tono muscolare, per risultati visibili in poche settimane.' },
          'Avere più energia': { title: 'Piano “Energia”', text: 'Corsi di gruppo e cardio dosato: si parte leggeri, si costruisce l’abitudine, l’energia arriva.' },
          'Aumentare la forza': { title: 'Piano “Forza”', text: 'Programmazione in sala pesi con progressioni misurate e tecnica curata dal primo giorno.' },
          default: { title: 'Il tuo piano su misura', text: 'Al check d’ingresso misuriamo il punto di partenza e costruiamo la tua settimana tipo.' },
        },
        formTitle: 'Iniziamo la settimana di prova?',
        submit: 'Voglio la settimana gratuita',
        success: 'Ti richiamiamo entro 24 ore lavorative per fissare il check d’ingresso. Porta scarpe pulite e un asciugamano: al resto pensiamo noi.',
      },

      assistant: {
        name: 'Coach Fitness',
        greeting: 'Ciao! Sono il Coach Fitness del Torrino. Posso spiegarti come funziona la settimana di prova, consigliarti i corsi giusti e aiutarti a prenotare.',
        quickActions: ['Come funziona la prova?', 'Voglio perdere la pancia', 'Orari fitness', 'Prenota la prova'],
        intents: [
          { keywords: ['prenot', 'prova', 'iniziare'], answer: 'Ottimo! Lasciami due dati e ti richiamiamo per fissare il primo giorno. <button type="button" class="msg__cta" data-lead-open>Prenota la settimana gratuita</button>' },
          { keywords: ['pancia', 'dimagr', 'peso', 'girovita', 'grasso'], answer: 'La strada più efficace è unire forza in sala pesi e corsi metabolici, con un check mensile per verificare i progressi. È esattamente il piano “Addio pancia”. <button type="button" class="msg__cta" data-lead-open>Inizia con la prova</button>' },
          { keywords: ['alimentaz', 'dieta', 'nutrizion'], answer: 'Al check d’ingresso ti diamo indicazioni generali; per un piano alimentare vero ti mettiamo in contatto con il nutrizionista che collabora con il club.' },
        ],
      },
    },

    personal: {
      id: 'personal',
      name: 'Personal Training',
      logo: '',
      cta: { label: 'Prenota la valutazione gratuita', short: 'Valutazione gratuita' },
      card: { tagline: 'Uno a uno', hook: 'Ti alleni da mesi ma il corpo non cambia?' },

      hero: {
        eyebrow: 'Personal Training · Metodo su misura',
        title: 'Ti alleni da mesi ma *il corpo non cambia?*',
        lead:
          'Non è mancanza di impegno: è mancanza di metodo. Partiamo da una valutazione funzionale completa e costruiamo il programma sui tuoi obiettivi, sui tuoi tempi e sul tuo corpo. Con i numeri alla mano.',
        trust: ['Valutazione gratuita', '45 minuti', 'Senza impegno'],
        proof: { value: '12', unit: 'settimane', label: 'durata media del primo ciclo', points: ['Più forza', 'Postura migliore', 'Progressi misurati'] },
        img: 'assets/images/personal-hero.svg',
        alt: 'Personal trainer che corregge la tecnica di un cliente in sala pesi',
      },

      problem: {
        eyebrow: 'Ti riconosci?',
        title: 'Non sei l’unico. *Anzi.*',
        lead: 'Sono le tre frasi che sentiamo più spesso al primo colloquio. Hanno tutte una spiegazione, e una soluzione.',
        pains: [
          { icon: 'loop', title: '“Mi alleno, ma sono fermo”', text: 'Stessa scheda, stessi carichi, stessi risultati. Il corpo si è adattato e smette di rispondere.' },
          { icon: 'clock', title: '“Non ho abbastanza tempo”', text: 'Tre ore a settimana spese male valgono meno di due ore programmate bene.' },
          { icon: 'alert', title: '“Ho sempre qualche dolore”', text: 'Schiena, spalle, ginocchia: spesso è tecnica o squilibrio muscolare, non l’età.' },
        ],
        stat: { value: '7 su 10', text: 'dei nostri clienti PT avevano già provato ad allenarsi da soli, senza risultati duraturi.' },
      },

      solution: {
        eyebrow: 'La nostra risposta',
        title: 'Non è una scheda. *È un metodo.*',
        lead:
          'Il personal training del Torrino parte da dati oggettivi, non da un programma uguale per tutti. Il tuo trainer ti misura, programma, ti segue in sala e verifica i progressi ogni quattro settimane.',
        pillars: [
          { icon: 'ruler', title: 'Misuriamo', text: 'il tuo punto di partenza' },
          { icon: 'clipboard', title: 'Programmiamo', text: 'l’allenamento su di te' },
          { icon: 'users', title: 'Ti seguiamo', text: 'in ogni sessione, uno a uno' },
          { icon: 'chart', title: 'Verifichiamo', text: 'i risultati, numeri alla mano' },
        ],
      },

      journey: {
        eyebrow: 'Come funziona',
        title: 'Il tuo percorso in *5 step*',
        steps: [
          { meta: 'Giorno 1', title: 'Valutazione gratuita', text: 'Colloquio, analisi posturale e test funzionali.' },
          { meta: 'Giorno 1', title: 'Obiettivo', text: 'Trasformiamo un desiderio in un traguardo misurabile.' },
          { meta: 'Settimana 1', title: 'Programma su misura', text: 'Esercizi, carichi e frequenza costruiti su di te.' },
          { meta: 'Settimane 1–12', title: 'Allenamento guidato', text: 'Sessioni uno a uno con correzione tecnica costante.' },
          { meta: 'Ogni 4 settimane', title: 'Check-up', text: 'Nuove misurazioni: numeri, non impressioni.' },
        ],
      },

      stories: {
        eyebrow: 'Persone come te',
        title: 'Risultati *reali*',
        lead: 'Storie di soci che sono partiti dagli stessi dubbi. Ogni risultato è misurato, non stimato.',
        items: [
          { quote: 'Avevo mal di schiena da anni. Dopo tre mesi faccio stacchi da terra senza paura e il dolore è sparito.', name: 'Francesca', detail: '42 anni · impiegata', result: '−6 cm', resultLabel: 'di girovita in 12 settimane' },
          { quote: 'Pensavo di non avere tempo. Due sessioni a settimana in pausa pranzo sono bastate.', name: 'Davide', detail: '37 anni · avvocato', result: '+18 kg', resultLabel: 'sullo squat in 10 settimane' },
          { quote: 'A 61 anni volevo tornare a sciare. Ci sono tornato, e senza fiatone.', name: 'Roberto', detail: '61 anni · in pensione', result: '+35%', resultLabel: 'di resistenza al test cardio' },
        ],
        note: 'I risultati variano da persona a persona: per questo li misuriamo.',
      },

      equipment: {
        eyebrow: 'Tecnologie e attrezzature',
        title: 'Gli strumenti *che fanno la differenza*',
        lead: 'Misurare è il primo passo per migliorare. Usiamo strumenti professionali per valutare, allenare e verificare.',
        items: [
          { name: 'Composizione corporea', tag: 'Bioimpedenza', text: 'Massa magra, massa grassa e acqua: sai cosa stai perdendo e cosa stai costruendo.', img: 'assets/images/personal-tech-01.svg', alt: 'Analisi della composizione corporea con bioimpedenziometro' },
          { name: 'Valutazione funzionale', tag: 'Test di movimento', text: 'Mobilità, stabilità e asimmetrie: troviamo i punti deboli prima che diventino infortuni.', img: 'assets/images/personal-tech-02.svg', alt: 'Trainer che esegue un test di mobilità su un cliente' },
          { name: 'Sala pesi premium', tag: '900 mq', text: 'Isotonici di ultima generazione, rack, pedane e manubri fino a 50 kg.', img: 'assets/images/personal-tech-03.svg', alt: 'Area rack e pedane della sala pesi' },
          { name: 'App di monitoraggio', tag: 'Progressi in tempo reale', text: 'Programma, carichi e misurazioni sul tuo smartphone, condivisi con il tuo trainer.', img: 'assets/images/personal-tech-04.svg', alt: 'Smartphone con i grafici dei progressi di allenamento' },
        ],
      },

      team: {
        eyebrow: 'Il team',
        title: 'Persone, *prima che trainer*',
        lead: 'Laureati in Scienze Motorie e certificati, lavorano in squadra: il tuo trainer si confronta con i colleghi quando serve una competenza specifica.',
        members: [
          { name: 'Alessandro Vitale', role: 'Head Coach Personal Training', bio: '12 anni di esperienza tra ricomposizione corporea e preparazione atletica.', creds: ['Scienze Motorie', 'Preparatore atletico'], img: 'assets/images/personal-staff-01.svg', alt: 'Ritratto di Alessandro Vitale' },
          { name: 'Martina Greco', role: 'Postura & rieducazione', bio: 'Segue chi riparte dopo un infortunio o convive con dolori ricorrenti.', creds: ['Chinesiologa', 'Pilates clinico'], img: 'assets/images/personal-staff-02.svg', alt: 'Ritratto di Martina Greco' },
          { name: 'Marco De Santis', role: 'Strength & conditioning', bio: 'Forza, potenza e performance per chi prepara uno sport o una gara.', creds: ['Scienze Motorie', 'Istruttore functional'], img: 'assets/images/personal-staff-03.svg', alt: 'Ritratto di Marco De Santis' },
        ],
      },

      faq: {
        eyebrow: 'Domande frequenti',
        title: 'Hai ancora *qualche dubbio?*',
        items: [
          { q: 'Devo essere già allenato per iniziare?', a: 'No. Il programma parte dal tuo livello reale, misurato alla valutazione: molti dei nostri clienti non si allenavano da anni.' },
          { q: 'Quante sessioni a settimana servono?', a: 'Di solito due sessioni guidate a settimana sono sufficienti, integrate da allenamenti autonomi che trovi nell’app. Il ritmo lo decidiamo insieme sui tuoi tempi.' },
          { q: 'Ho un infortunio o mal di schiena: posso allenarmi?', a: 'Sì, anzi è spesso il motivo migliore per farlo con un professionista. Alla valutazione verifichiamo la situazione e, se serve, ci coordiniamo con il tuo fisioterapista o medico.' },
          { q: 'Qual è la differenza rispetto a una scheda in sala?', a: 'La scheda è uguale per tutti e non cambia. Il personal training misura, corregge la tecnica in ogni sessione e adatta il programma ai risultati dei check-up.' },
          { q: 'Posso scegliere il trainer?', a: 'Sì. Alla valutazione ti proponiamo il professionista più adatto al tuo obiettivo, ma puoi sempre chiedere un cambio.' },
          { q: 'Quanto costa?', a: 'La valutazione iniziale è gratuita e senza impegno. I pacchetti partono da 5 sessioni: il listino completo te lo presentiamo in trasparenza dopo la valutazione, e decidi con calma.' },
        ],
      },

      final: {
        eyebrow: 'Il primo passo',
        title: 'La valutazione è *gratuita.*',
        lead: '45 minuti per capire da dove parti e dove puoi arrivare. Se il percorso non fa per te, te lo diciamo noi.',
      },

      lead: {
        title: 'Valutazione Personal Training',
        intro: 'Tre domande per preparare la tua valutazione. Poi ti richiamiamo noi per fissare giorno e ora.',
        questions: [
          { q: 'Qual è il tuo obiettivo principale?', options: ['Perdere peso', 'Aumentare forza e massa', 'Stare meglio con schiena e postura', 'Preparare uno sport o una gara'] },
          { q: 'Da quanto ti alleni con continuità?', options: ['Non mi alleno', 'Da meno di 6 mesi', 'Da più di 6 mesi', 'Da anni, ma sono fermo'] },
          { q: 'Quanto tempo puoi dedicarci a settimana?', options: ['Una sessione', 'Due sessioni', 'Tre o più', 'Consigliami tu'] },
        ],
        profileFrom: 0,
        profiles: {
          'Perdere peso': { title: 'Profilo “Ricomposizione corporea”', text: 'Lavoreremo su forza e metabolismo insieme: si perde grasso senza perdere muscolo. La bioimpedenza ci dirà da dove partire.' },
          'Aumentare forza e massa': { title: 'Profilo “Forza progressiva”', text: 'Programmazione a cicli con carichi misurati e tecnica curata: la strada più rapida e sicura per crescere.' },
          'Stare meglio con schiena e postura': { title: 'Profilo “Postura e benessere”', text: 'Si parte dalla valutazione funzionale: mobilità, stabilità e rinforzo mirato sui punti deboli.' },
          'Preparare uno sport o una gara': { title: 'Profilo “Performance”', text: 'Test atletici, periodizzazione verso la data obiettivo e lavoro specifico per il tuo sport.' },
          default: { title: 'Il tuo percorso su misura', text: 'Alla valutazione misuriamo il punto di partenza e costruiamo il piano sul tuo obiettivo.' },
        },
        formTitle: 'Vuoi la tua valutazione gratuita?',
        submit: 'Voglio la valutazione gratuita',
        success: 'Ti richiamiamo entro 24 ore lavorative per fissare la valutazione. Porta abiti comodi: al resto pensiamo noi.',
      },

      assistant: {
        name: 'Coach Virtuale',
        greeting: 'Ciao! Sono il Coach Virtuale del Personal Training. Posso spiegarti come funziona il metodo, cosa succede alla valutazione e aiutarti a prenotarla.',
        quickActions: ['Come funziona la valutazione?', 'Quanto costa?', 'Posso allenarmi con un infortunio?', 'Prenota la valutazione'],
        intents: [
          { keywords: ['prenot', 'fissare', 'appuntamento'], answer: 'Perfetto! Lasciami due dati e ti richiamiamo entro 24 ore. <button type="button" class="msg__cta" data-lead-open>Prenota la valutazione</button>' },
          { keywords: ['valutazione', 'primo incontro', 'come funziona'], answer: 'La valutazione dura circa 45 minuti: colloquio sugli obiettivi, analisi della composizione corporea e test di mobilità e forza. È gratuita e senza impegno. <button type="button" class="msg__cta" data-lead-open>Prenotala ora</button>' },
          { keywords: ['infortun', 'dolore', 'schiena', 'ginocchio', 'spalla'], answer: 'Sì: alla valutazione verifichiamo la situazione e, se serve, ci coordiniamo con il tuo fisioterapista. Per molti è proprio il motivo per scegliere il personal training.' },
          { keywords: ['costa', 'prezzo', 'prezzi', 'quanto', 'pacchett'], answer: 'La valutazione è gratuita. I pacchetti partono da 5 sessioni: il listino te lo presentiamo dopo la valutazione, quando sappiamo cosa ti serve davvero.' },
        ],
      },
    },

    nuoto: {
      id: 'nuoto',
      name: 'Nuoto',
      logo: '',
      cta: { label: 'Prenota la lezione di prova', short: 'Lezione di prova' },
      card: { tagline: 'Acqua tutto l’anno', hook: 'Hai sempre rimandato il momento di imparare davvero a nuotare?' },

      hero: {
        eyebrow: 'Nuoto · Adulti e master',
        title: 'In acqua *ti senti a disagio?*',
        lead:
          'Non è mai troppo tardi per imparare, o per nuotare meglio. Corsi per adulti in piccoli gruppi, divisi per livello, in una vasca da 25 metri riscaldata tutto l’anno.',
        trust: ['Lezione di prova gratuita', 'Gruppi per livello', 'Vasca riscaldata'],
        proof: { value: '25', unit: 'metri', label: 'vasca semiolimpionica a 28°C', points: ['Più fiato', 'Schiena più libera', 'Zero paura'] },
        img: 'assets/images/nuoto-hero.svg',
        alt: 'Nuotatore adulto in vasca semiolimpionica durante una lezione',
      },

      problem: {
        eyebrow: 'Ti riconosci?',
        title: 'Succede *a tantissimi adulti.*',
        lead: 'Più di quanti immagini arrivano in vasca con gli stessi pensieri. Nessuno qui ti giudica: si parte da dove sei.',
        pains: [
          { icon: 'drop', title: '“Non ho mai imparato bene”', text: 'Stai a galla, ma dopo una vasca sei senza fiato e la testa fuori dall’acqua ti stanca il collo.' },
          { icon: 'alert', title: '“L’acqua alta mi mette ansia”', text: 'Una brutta esperienza da piccolo basta a far rimandare per anni.' },
          { icon: 'heartLine', title: '“Il medico mi ha detto: nuoto”', text: 'Schiena, articolazioni, peso: il nuoto è la prescrizione più comune, ma da soli non si sa da dove iniziare.' },
        ],
        stat: { value: '1 su 3', text: 'dei nostri allievi adulti è partito senza saper nuotare a stile libero.' },
      },

      solution: {
        eyebrow: 'La nostra risposta',
        title: 'Si impara *a ogni età.*',
        lead:
          'Gruppi piccoli e omogenei, un istruttore sempre in acqua o a bordo vasca e una progressione chiara: dall’acquaticità alla tecnica, fino al nuoto libero in autonomia o al gruppo master.',
        pillars: [
          { icon: 'compass', title: 'Livello', text: 'test in acqua e gruppo giusto' },
          { icon: 'users', title: 'Piccoli gruppi', text: 'massimo 6 allievi per corsia' },
          { icon: 'drop', title: 'Tecnica', text: 'respirazione, bracciata, virate' },
          { icon: 'chart', title: 'Progressi', text: 'obiettivi a ogni fine ciclo' },
        ],
      },

      journey: {
        eyebrow: 'Come funziona',
        title: 'Dalla prima vasca *in 5 step*',
        steps: [
          { meta: 'Prima settimana', title: 'Lezione di prova', text: 'Proviamo insieme in acqua bassa: nessuna pressione.' },
          { meta: 'Stesso giorno', title: 'Test di livello', text: 'L’istruttore valuta galleggiamento, respirazione e stili.' },
          { meta: 'Ciclo di 10 lezioni', title: 'Il tuo gruppo', text: 'Base, intermedio o perfezionamento, due volte a settimana.' },
          { meta: 'Fine ciclo', title: 'Obiettivo raggiunto', text: 'Una vasca in più, un nuovo stile, meno fatica.' },
          { meta: 'Quando vuoi', title: 'Master o nuoto libero', text: 'Allenamenti master o vasca libera in autonomia.' },
        ],
      },

      stories: {
        eyebrow: 'Persone come te',
        title: 'Hanno fatto *pace con l’acqua*',
        lead: 'Adulti che sono partiti dal bordo vasca. Oggi nuotano per piacere.',
        items: [
          { quote: 'A 48 anni non mettevo la testa sott’acqua. Oggi faccio 1.500 metri il sabato mattina, e mi rilassa più di qualunque altra cosa.', name: 'Claudia', detail: '48 anni · insegnante', result: '1.500 m', resultLabel: 'di fila dopo una stagione' },
          { quote: 'Me l’aveva consigliato l’ortopedico per la schiena. Dopo tre mesi di corso il dolore è quasi sparito.', name: 'Massimo', detail: '56 anni · geometra', result: '2 volte', resultLabel: 'a settimana, da un anno' },
          { quote: 'Nuotavo “a modo mio”. Con il perfezionamento ho imparato la virata e ora mi alleno con il gruppo master.', name: 'Elisa', detail: '31 anni · architetta', result: '−40 s', resultLabel: 'sui 400 metri in un ciclo' },
        ],
        note: 'I risultati variano da persona a persona: per questo li misuriamo.',
      },

      equipment: {
        eyebrow: 'Spazi e attrezzature',
        title: 'Una piscina *pensata per imparare*',
        lead: 'Acqua trattata con sistemi di ultima generazione, corsie dedicate ai corsi e spogliatoi riscaldati.',
        items: [
          { name: 'Vasca semiolimpionica', tag: '25 m · 6 corsie', text: 'Corsie separate per corsi, master e nuoto libero: mai affollate.', img: 'assets/images/nuoto-tech-01.svg', alt: 'Vasca semiolimpionica con corsie separate' },
          { name: 'Vasca didattica', tag: 'Acqua bassa', text: 'Si tocca sempre il fondo: il luogo ideale per le prime lezioni.', img: 'assets/images/nuoto-tech-02.svg', alt: 'Vasca didattica con acqua bassa' },
          { name: 'Trattamento acqua', tag: 'Basso cloro', text: 'Sistema a raggi UV che riduce il cloro: niente occhi rossi, pelle più rispettata.', img: 'assets/images/nuoto-tech-03.svg', alt: 'Impianto di trattamento dell’acqua della piscina' },
          { name: 'Video-analisi', tag: 'Tecnica di bracciata', text: 'Riprese subacquee per vedere, e correggere, il proprio stile.', img: 'assets/images/nuoto-tech-04.svg', alt: 'Istruttore che mostra la video-analisi della bracciata' },
        ],
      },

      team: {
        eyebrow: 'Gli istruttori',
        title: 'Istruttori *pazienti, e preparati*',
        lead: 'Brevettati FIN e abituati a lavorare con gli adulti: sanno che ogni paura ha i suoi tempi.',
        members: [
          { name: 'Luca Bernardi', role: 'Responsabile scuola nuoto', bio: 'Vent’anni a bordo vasca, specializzato nell’insegnamento agli adulti.', creds: ['Istruttore FIN', 'Brevetto salvamento'], img: 'assets/images/nuoto-staff-01.svg', alt: 'Ritratto di Luca Bernardi' },
          { name: 'Federica Galli', role: 'Acquaticità e acquafitness', bio: 'Accompagna chi ha paura dell’acqua dalle prime immersioni al nuoto autonomo.', creds: ['Istruttrice FIN', 'Acquafitness'], img: 'assets/images/nuoto-staff-02.svg', alt: 'Ritratto di Federica Galli' },
          { name: 'Simone Ricci', role: 'Allenatore master', bio: 'Ex nuotatore agonista, allena il gruppo master e i corsi di perfezionamento.', creds: ['Allenatore FIN', 'Scienze Motorie'], img: 'assets/images/nuoto-staff-03.svg', alt: 'Ritratto di Simone Ricci' },
        ],
      },

      faq: {
        eyebrow: 'Domande frequenti',
        title: 'Hai ancora *qualche dubbio?*',
        items: [
          { q: 'Non so nuotare per niente: posso iscrivermi?', a: 'Certo. I corsi base partono dall’acquaticità in vasca didattica, dove si tocca sempre il fondo.' },
          { q: 'Quante persone ci sono in corsia?', a: 'Al massimo sei allievi per corsia, divisi per livello, con l’istruttore dedicato.' },
          { q: 'Che attrezzatura serve?', a: 'Costume, cuffia, occhialini e ciabatte. Tavolette, pull-buoy e pinne li forniamo noi.' },
          { q: 'Posso nuotare anche fuori dai corsi?', a: 'Sì, con la formula nuoto libero o full access hai accesso alle corsie libere negli orari indicati in timetable.' },
          { q: 'Serve il certificato medico?', a: 'Sì, il certificato di idoneità all’attività sportiva non agonistica. La segreteria ti indica come ottenerlo.' },
          { q: 'Quanto costa?', a: 'La lezione di prova è gratuita. I corsi sono a cicli di 10 lezioni o in abbonamento: il listino te lo presentiamo dopo la prova.' },
        ],
      },

      final: {
        eyebrow: 'Il primo passo',
        title: 'La prima lezione *è gratis.*',
        lead: 'Vieni a provare in acqua bassa, con calma. Ti diciamo noi qual è il gruppo giusto.',
      },

      lead: {
        title: 'Lezione di prova Nuoto',
        intro: 'Tre domande per trovare il gruppo giusto. Poi ti richiamiamo per fissare la prova.',
        questions: [
          { q: 'Come te la cavi in acqua?', options: ['Non so nuotare', 'Sto a galla, ma fatico', 'Nuoto, voglio migliorare la tecnica', 'Nuoto bene, cerco allenamento'] },
          { q: 'Cosa cerchi soprattutto?', options: ['Superare la paura', 'Stare meglio con la schiena', 'Tenermi in forma', 'Allenarmi con un gruppo'] },
          { q: 'Quando preferisci venire?', options: ['Mattina', 'Pausa pranzo', 'Sera', 'Weekend'] },
        ],
        profileFrom: 0,
        profiles: {
          'Non so nuotare': { title: 'Corso “Acquaticità”', text: 'Si parte in vasca didattica, dalla respirazione al galleggiamento, fino alle prime vasche in autonomia.' },
          'Sto a galla, ma fatico': { title: 'Corso “Base”', text: 'Respirazione e stile libero: l’obiettivo è nuotare 100 metri senza fermarsi, senza fatica.' },
          'Nuoto, voglio migliorare la tecnica': { title: 'Corso “Perfezionamento”', text: 'Video-analisi, nuovi stili e virate per nuotare meglio consumando meno energia.' },
          'Nuoto bene, cerco allenamento': { title: 'Gruppo “Master”', text: 'Allenamenti strutturati con il gruppo master, con obiettivi e test cronometrati.' },
          default: { title: 'Il corso giusto per te', text: 'Alla lezione di prova facciamo un test in acqua e scegliamo insieme il gruppo.' },
        },
        formTitle: 'Prenotiamo la lezione di prova?',
        submit: 'Prenota la prova gratuita',
        success: 'Ti richiamiamo entro 24 ore lavorative per fissare la lezione di prova. Servono costume, cuffia, occhialini e ciabatte.',
      },

      assistant: {
        name: 'Assistente Nuoto',
        greeting: 'Ciao! Sono l’assistente della scuola nuoto. Posso aiutarti a capire il corso giusto per il tuo livello e prenotare la lezione di prova gratuita.',
        quickActions: ['Non so nuotare, posso iniziare?', 'Orari del nuoto', 'Cosa devo portare?', 'Prenota la prova'],
        intents: [
          { keywords: ['prenot', 'prova', 'provare'], answer: 'Volentieri! Lasciami due dati e ti richiamiamo per fissare la lezione di prova. <button type="button" class="msg__cta" data-lead-open>Prenota la prova</button>' },
          { keywords: ['non so nuotare', 'paura', 'principiant', 'iniziare'], answer: 'Certo che puoi: il corso Acquaticità parte in vasca didattica, dove si tocca sempre. Tanti nostri allievi adulti sono partiti da lì. <button type="button" class="msg__cta" data-lead-open>Prova gratis</button>' },
          { keywords: ['portare', 'serve', 'attrezzatura', 'cuffia'], answer: 'Costume, cuffia, occhialini e ciabatte. Tavolette, pinne e pull-buoy li mettiamo noi.' },
        ],
      },
    },

    tennis: {
      id: 'tennis',
      name: 'Tennis',
      logo: '',
      cta: { label: 'Prenota la lezione di prova', short: 'Lezione di prova' },
      card: { tagline: 'Scuola tennis e campi', hook: 'Vorresti giocare, ma non sai da dove ripartire o con chi?' },

      hero: {
        eyebrow: 'Tennis · Scuola adulti e agonisti',
        title: 'Vorresti giocare, *ma con chi?*',
        lead:
          'Che tu non abbia mai preso in mano una racchetta o voglia tornare in campo dopo anni, qui trovi maestri federali, quattro campi illuminati e una community di giocatori del tuo livello.',
        trust: ['Lezione di prova gratuita', 'Racchetta in prestito', 'Gruppi per livello'],
        proof: { value: '4', unit: 'campi', label: 'in terra e resina, illuminati', points: ['Tecnica solida', 'Compagni di gioco', 'Tornei sociali'] },
        img: 'assets/images/tennis-hero.svg',
        alt: 'Giocatori su un campo da tennis illuminato la sera',
      },

      problem: {
        eyebrow: 'Ti riconosci?',
        title: 'Lo pensano *in tanti.*',
        lead: 'Sono i motivi per cui la racchetta resta nell’armadio. Tutti risolvibili.',
        pains: [
          { icon: 'users', title: '“Non trovo con chi giocare”', text: 'Gli amici hanno smesso, o giocano a un livello troppo diverso dal tuo.' },
          { icon: 'loop', title: '“Ho giocato da ragazzo, poi basta”', text: 'La voglia c’è, ma rientrare in campo dopo anni mette un po’ di soggezione.' },
          { icon: 'alert', title: '“Il gomito mi fa male”', text: 'Spesso è tecnica sbagliata o attrezzatura non adatta, non uno sport sbagliato.' },
        ],
        stat: { value: '6 su 10', text: 'dei nostri allievi adulti sono tornati al tennis dopo più di dieci anni di stop.' },
      },

      solution: {
        eyebrow: 'La nostra risposta',
        title: 'Un maestro, un gruppo, *un campo.*',
        lead:
          'Lezioni in piccoli gruppi omogenei o individuali, un programma tecnico chiaro e tante occasioni per giocare: partite organizzate, ladder e tornei sociali.',
        pillars: [
          { icon: 'target', title: 'Tecnica', text: 'impostata da maestri federali' },
          { icon: 'users', title: 'Gruppi', text: 'di 4 giocatori, stesso livello' },
          { icon: 'calendar', title: 'Partite', text: 'organizzate ogni settimana' },
          { icon: 'chart', title: 'Classifica', text: 'ladder e tornei sociali' },
        ],
      },

      journey: {
        eyebrow: 'Come funziona',
        title: 'Di nuovo in campo *in 5 step*',
        steps: [
          { meta: 'Prima settimana', title: 'Lezione di prova', text: 'Un’ora con il maestro, racchetta inclusa.' },
          { meta: 'Stesso giorno', title: 'Valutazione', text: 'Colpi, spostamenti e obiettivi: definiamo il tuo livello.' },
          { meta: 'Da ottobre a giugno', title: 'Corso', text: 'Gruppi di quattro, una o due volte a settimana.' },
          { meta: 'Ogni settimana', title: 'Partite', text: 'Ti abbiniamo a giocatori del tuo livello.' },
          { meta: 'Durante l’anno', title: 'Tornei sociali', text: 'Ladder, doppi del venerdì e torneo di fine stagione.' },
        ],
      },

      stories: {
        eyebrow: 'Persone come te',
        title: 'Sono tornati *in campo*',
        lead: 'Giocatori partiti dagli stessi dubbi. Oggi hanno un gruppo con cui giocare ogni settimana.',
        items: [
          { quote: 'Non giocavo da vent’anni. Dopo una stagione di corso gioco il doppio del giovedì sera con un gruppo fisso.', name: 'Stefano', detail: '50 anni · manager', result: '1 gruppo', resultLabel: 'fisso ogni settimana' },
          { quote: 'Ho iniziato da zero a 38 anni. Il maestro ha avuto una pazienza infinita, ora gioco il torneo sociale.', name: 'Valeria', detail: '38 anni · avvocata', result: '1° torneo', resultLabel: 'giocato dopo una stagione' },
          { quote: 'Avevo un’epicondilite cronica. Corretto il rovescio e cambiata la racchetta, il dolore è sparito.', name: 'Fabio', detail: '44 anni · medico', result: '0 dolori', resultLabel: 'dopo 3 mesi di corso' },
        ],
        note: 'Testimonianze raccolte con il consenso dei soci.',
      },

      equipment: {
        eyebrow: 'Campi e attrezzature',
        title: 'Campi *curati ogni giorno*',
        lead: 'Superfici diverse, illuminazione per giocare la sera e tutto il necessario per allenarsi bene.',
        items: [
          { name: 'Campi in terra rossa', tag: '2 campi', text: 'La superficie più rispettosa delle articolazioni, manutenuta ogni giorno.', img: 'assets/images/tennis-tech-01.svg', alt: 'Campo da tennis in terra rossa' },
          { name: 'Campi in resina', tag: '2 campi coperti d’inverno', text: 'Si gioca tutto l’anno, anche con la pioggia.', img: 'assets/images/tennis-tech-02.svg', alt: 'Campo da tennis in resina con copertura' },
          { name: 'Illuminazione LED', tag: 'Fino alle 23', text: 'Luce uniforme senza abbagliamento per le partite serali.', img: 'assets/images/tennis-tech-03.svg', alt: 'Campo da tennis illuminato di sera' },
          { name: 'Sparapalline', tag: 'Allenamento tecnico', text: 'Per ripetere il colpo finché non diventa naturale.', img: 'assets/images/tennis-tech-04.svg', alt: 'Macchina sparapalline a bordo campo' },
        ],
      },

      team: {
        eyebrow: 'I maestri',
        title: 'Maestri *federali*',
        lead: 'Certificati FITP, con esperienza dai principianti adulti agli agonisti di categoria.',
        members: [
          { name: 'Andrea Pallotta', role: 'Direttore scuola tennis', bio: 'Guida la scuola federale e costruisce i gruppi per livello.', creds: ['Maestro FITP', 'Preparatore fisico'], img: 'assets/images/tennis-staff-01.svg', alt: 'Ritratto di Andrea Pallotta' },
          { name: 'Giorgia Leone', role: 'Istruttrice adulti', bio: 'Specializzata in chi parte da zero o rientra dopo anni di pausa.', creds: ['Istruttrice FITP', 'Ex agonista'], img: 'assets/images/tennis-staff-02.svg', alt: 'Ritratto di Giorgia Leone' },
          { name: 'Matteo Fabbri', role: 'Agonistica e match play', bio: 'Allena i giocatori di torneo su tattica, preparazione e gestione della partita.', creds: ['Maestro FITP', 'Scienze Motorie'], img: 'assets/images/tennis-staff-03.svg', alt: 'Ritratto di Matteo Fabbri' },
        ],
      },

      faq: {
        eyebrow: 'Domande frequenti',
        title: 'Hai ancora *qualche dubbio?*',
        items: [
          { q: 'Non ho mai giocato: è troppo tardi?', a: 'No, abbiamo gruppi per principianti adulti di tutte le età. Si parte con palline più lente per giocare da subito.' },
          { q: 'Devo avere la racchetta?', a: 'Per la lezione di prova te la prestiamo noi. Poi il maestro ti consiglia quella adatta al tuo gioco.' },
          { q: 'Posso prenotare i campi senza fare il corso?', a: 'Sì, i soci prenotano i campi dall’app o in segreteria. Chi non ha compagni può chiedere di essere abbinato.' },
          { q: 'Ci sono lezioni individuali?', a: 'Sì, individuali o in coppia, a pacchetti da 5 o 10 lezioni.' },
          { q: 'Organizzate tornei?', a: 'Tornei sociali durante l’anno, una ladder permanente e il doppio del venerdì sera, aperti a tutti i livelli.' },
          { q: 'Quanto costa?', a: 'La lezione di prova è gratuita. I corsi sono stagionali o trimestrali: il listino te lo presentiamo dopo la prova.' },
        ],
      },

      final: {
        eyebrow: 'Il primo passo',
        title: 'Torna in campo. *La prima è gratis.*',
        lead: 'Un’ora con un maestro, racchetta inclusa. Alla fine sai già in che gruppo giocare.',
      },

      lead: {
        title: 'Lezione di prova Tennis',
        intro: 'Tre domande per trovare il gruppo giusto. Poi ti richiamiamo per fissare la prova.',
        questions: [
          { q: 'Qual è il tuo livello?', options: ['Mai giocato', 'Ho giocato anni fa', 'Gioco ogni tanto', 'Gioco con regolarità'] },
          { q: 'Cosa preferisci?', options: ['Corso in gruppo', 'Lezioni individuali', 'Trovare compagni per giocare', 'Prepararmi per i tornei'] },
          { q: 'Quando preferisci giocare?', options: ['Mattina', 'Pausa pranzo', 'Sera', 'Weekend'] },
        ],
        profileFrom: 0,
        profiles: {
          'Mai giocato': { title: 'Corso “Primi colpi”', text: 'Palline lente e gruppi di principianti: si gioca da subito, la tecnica arriva lezione dopo lezione.' },
          'Ho giocato anni fa': { title: 'Corso “Rientro in campo”', text: 'Riprendiamo i fondamentali e aggiorniamo la tecnica, senza fretta e senza infortuni.' },
          'Gioco ogni tanto': { title: 'Corso “Intermedio”', text: 'Consolidiamo i colpi e iniziamo a lavorare su tattica e partite organizzate.' },
          'Gioco con regolarità': { title: 'Gruppo “Match play”', text: 'Tattica, preparazione e partite: il passo verso tornei sociali e categorie.' },
          default: { title: 'Il gruppo giusto per te', text: 'Alla lezione di prova il maestro valuta il tuo gioco e sceglie con te il gruppo.' },
        },
        formTitle: 'Prenotiamo la lezione di prova?',
        submit: 'Prenota la prova gratuita',
        success: 'Ti richiamiamo entro 24 ore lavorative per fissare la lezione di prova. Servono solo scarpe da tennis: la racchetta te la prestiamo noi.',
      },

      assistant: {
        name: 'Assistente Tennis',
        greeting: 'Ciao! Sono l’assistente della scuola tennis. Posso aiutarti a trovare il corso del tuo livello, spiegarti come prenotare i campi e fissare la lezione di prova.',
        quickActions: ['Non ho mai giocato', 'Come prenoto un campo?', 'Orari tennis', 'Prenota la prova'],
        intents: [
          { keywords: ['prenota la prova', 'prova', 'provare', 'lezione'], answer: 'Perfetto! Lasciami due dati e ti richiamiamo per fissare la lezione di prova. <button type="button" class="msg__cta" data-lead-open>Prenota la prova</button>' },
          { keywords: ['campo', 'campi'], answer: 'I soci prenotano i campi dall’app o in segreteria. Se non hai un compagno, chiedici di abbinarti a un giocatore del tuo livello.' },
          { keywords: ['mai giocato', 'principiant', 'iniziare', 'zero'], answer: 'Abbiamo gruppi per principianti adulti: palline lente e si gioca da subito. <button type="button" class="msg__cta" data-lead-open>Prova gratis</button>' },
        ],
      },
    },

    mindbody: {
      id: 'mindbody',
      name: 'Pilates & Yoga',
      logo: '',
      cta: { label: 'Prenota la lezione di prova', short: 'Lezione di prova' },
      card: { tagline: 'Postura, respiro, equilibrio', hook: 'Schiena rigida e testa sempre piena di pensieri?' },

      hero: {
        eyebrow: 'Pilates & Yoga · Corpo e mente',
        title: 'Schiena rigida, *testa che non si spegne?*',
        lead:
          'Ore alla scrivania e ritmi serrati si pagano nel corpo e nella mente. Pilates e yoga in piccoli gruppi, per ritrovare mobilità, postura e un’ora tutta per te.',
        trust: ['Lezione di prova gratuita', 'Max 10 persone', 'Tutti i livelli'],
        proof: { value: '10', unit: 'persone', label: 'al massimo per lezione', points: ['Postura migliore', 'Meno tensioni', 'Più calma'] },
        img: 'assets/images/mindbody-hero.svg',
        alt: 'Lezione di yoga nella sala panoramica con luce naturale',
      },

      problem: {
        eyebrow: 'Ti riconosci?',
        title: 'È il male *del nostro tempo.*',
        lead: 'Non sei l’unico a sentirti così: sono le prime cose che ci raccontano i nuovi allievi.',
        pains: [
          { icon: 'screen', title: '“Otto ore al computer”', text: 'Collo, spalle e zona lombare rigidi: la postura da scrivania lascia il segno.' },
          { icon: 'battery', title: '“Non riesco a staccare”', text: 'Pensieri che girano anche la sera, sonno leggero, poca energia al risveglio.' },
          { icon: 'alert', title: '“Non sono per niente flessibile”', text: 'È il motivo più comune per iniziare, non per rinunciare.' },
        ],
        stat: { value: '7 su 10', text: 'dei nostri allievi arrivano per mal di schiena o tensioni legate al lavoro.' },
      },

      solution: {
        eyebrow: 'La nostra risposta',
        title: 'Muoversi meglio. *Respirare meglio.*',
        lead:
          'Il pilates rinforza il core e corregge la postura; lo yoga scioglie le tensioni e insegna a respirare. Insieme, in piccoli gruppi e con un insegnante che ti corregge, lavorano su corpo e mente.',
        pillars: [
          { icon: 'target', title: 'Core', text: 'addominali profondi e schiena forte' },
          { icon: 'sprout', title: 'Mobilità', text: 'articolazioni più libere, meno rigidità' },
          { icon: 'wind', title: 'Respiro', text: 'per gestire stress e tensioni' },
          { icon: 'users', title: 'Piccoli gruppi', text: 'correzioni individuali in ogni lezione' },
        ],
      },

      journey: {
        eyebrow: 'Come funziona',
        title: 'Il tuo equilibrio *in 5 step*',
        steps: [
          { meta: 'Prima settimana', title: 'Lezione di prova', text: 'Scegli pilates o yoga: la prima è gratuita.' },
          { meta: 'Stesso giorno', title: 'Colloquio', text: 'Tensioni, dolori, obiettivi: l’insegnante ti conosce.' },
          { meta: 'Settimane 1–4', title: 'Livello base', text: 'Fondamentali, respirazione e controllo del movimento.' },
          { meta: 'Dal secondo mese', title: 'Reformer e stili', text: 'Pilates reformer, vinyasa, hatha o yin, a tua scelta.' },
          { meta: 'Ogni trimestre', title: 'Check posturale', text: 'Rivediamo postura e mobilità insieme.' },
        ],
      },

      stories: {
        eyebrow: 'Persone come te',
        title: 'Hanno ritrovato *il loro equilibrio*',
        lead: 'Allievi che sono entrati rigidi e stressati. Ecco cosa è cambiato.',
        items: [
          { quote: 'Lavoro dieci ore al giorno al computer. Con due lezioni di pilates a settimana il mal di schiena è diventato un ricordo.', name: 'Chiara', detail: '39 anni · sviluppatrice', result: '2 lezioni', resultLabel: 'a settimana, zero antidolorifici' },
          { quote: 'Pensavo che lo yoga non facesse per me, “troppo rigido”. Dopo sei mesi tocco terra con le mani e dormo meglio.', name: 'Luca', detail: '46 anni · consulente', result: '+15 cm', resultLabel: 'al test di flessibilità' },
          { quote: 'Lo yin del giovedì sera è il mio momento. Esco dalla lezione con la testa leggera.', name: 'Anna', detail: '58 anni · dirigente', result: '3 anni', resultLabel: 'di pratica continua' },
        ],
        note: 'I risultati variano da persona a persona.',
      },

      equipment: {
        eyebrow: 'Spazi e attrezzature',
        title: 'Spazi *che fanno respirare*',
        lead: 'Sale luminose e silenziose, lontane dal rumore della sala pesi, con attrezzature professionali.',
        items: [
          { name: 'Sala panoramica', tag: 'Luce naturale', text: 'Vetrate sul verde, parquet e temperatura controllata per yoga e matwork.', img: 'assets/images/mindbody-tech-01.svg', alt: 'Sala panoramica per lo yoga con vetrate' },
          { name: 'Studio reformer', tag: '8 macchine', text: 'Pilates reformer in piccoli gruppi: resistenza guidata, precisione assoluta.', img: 'assets/images/mindbody-tech-02.svg', alt: 'Studio di pilates con macchine reformer' },
          { name: 'Piccoli attrezzi', tag: 'Props professionali', text: 'Blocchi, cinghie, fitball, magic circle: ogni esercizio adattato a te.', img: 'assets/images/mindbody-tech-03.svg', alt: 'Attrezzi per pilates e yoga' },
          { name: 'Analisi posturale', tag: 'Check trimestrale', text: 'Fotografia posturale per vedere i progressi, non solo sentirli.', img: 'assets/images/mindbody-tech-04.svg', alt: 'Analisi posturale con griglia di riferimento' },
        ],
      },

      team: {
        eyebrow: 'Le insegnanti',
        title: 'Insegnanti *certificate*',
        lead: 'Formazione internazionale e anni di pratica: sanno adattare ogni posizione al tuo corpo.',
        members: [
          { name: 'Sara Colombo', role: 'Pilates matwork e reformer', bio: 'Porta il pilates a chi ha la schiena “bloccata” e a chi vuole performare meglio.', creds: ['Pilates certificato', 'Scienze Motorie'], img: 'assets/images/mindbody-staff-01.svg', alt: 'Ritratto di Sara Colombo' },
          { name: 'Elena Rizzo', role: 'Yoga vinyasa, hatha e yin', bio: 'Insegna a respirare prima ancora che a entrare in una posizione.', creds: ['Yoga Alliance 500h', 'Meditazione'], img: 'assets/images/mindbody-staff-02.svg', alt: 'Ritratto di Elena Rizzo' },
          { name: 'Martina Greco', role: 'Pilates clinico', bio: 'Lavora con chi ha dolori ricorrenti, in coordinamento con fisioterapisti.', creds: ['Chinesiologa', 'Pilates clinico'], img: 'assets/images/mindbody-staff-03.svg', alt: 'Ritratto di Martina Greco' },
        ],
      },

      faq: {
        eyebrow: 'Domande frequenti',
        title: 'Hai ancora *qualche dubbio?*',
        items: [
          { q: 'Meglio pilates o yoga?', a: 'Il pilates è più indicato per postura e core; lo yoga per mobilità e gestione dello stress. Molti allievi li alternano: alla prova ti consigliamo il mix giusto.' },
          { q: 'Non sono flessibile: posso partecipare?', a: 'Sì, è proprio il punto di partenza. Ogni posizione ha varianti per ogni livello.' },
          { q: 'Ho mal di schiena: posso fare pilates?', a: 'Spesso è consigliato. Al colloquio verifichiamo la situazione e, se serve, ti indirizziamo al pilates clinico.' },
          { q: 'Quante persone ci sono a lezione?', a: 'Al massimo 10 per il matwork e lo yoga, 8 per il reformer.' },
          { q: 'Cosa devo portare?', a: 'Abbigliamento comodo e calzini antiscivolo. Tappetini e attrezzi li mettiamo noi.' },
          { q: 'Quanto costa?', a: 'La lezione di prova è gratuita. Sono disponibili abbonamenti mensili o carnet da 10 lezioni: il listino te lo presentiamo dopo la prova.' },
        ],
      },

      final: {
        eyebrow: 'Il primo passo',
        title: 'Un’ora per te. *La prima è gratis.*',
        lead: 'Scegli pilates o yoga e prova una lezione in piccolo gruppo. Esci più leggero, promesso.',
      },

      lead: {
        title: 'Lezione di prova Pilates & Yoga',
        intro: 'Tre domande per consigliarti la lezione giusta. Poi ti richiamiamo per fissare la prova.',
        questions: [
          { q: 'Cosa ti porta qui?', options: ['Mal di schiena o postura', 'Stress e tensione', 'Più flessibilità', 'Rinforzare il core'] },
          { q: 'Hai già praticato pilates o yoga?', options: ['Mai', 'Qualche volta', 'Sì, con regolarità'] },
          { q: 'Quando preferisci venire?', options: ['Mattina', 'Pausa pranzo', 'Sera', 'Weekend'] },
        ],
        profileFrom: 0,
        profiles: {
          'Mal di schiena o postura': { title: 'Percorso “Schiena libera”', text: 'Pilates matwork e reformer per rinforzare il core e riequilibrare la postura.' },
          'Stress e tensione': { title: 'Percorso “Respiro”', text: 'Hatha e yin yoga per sciogliere le tensioni e imparare a gestire il respiro.' },
          'Più flessibilità': { title: 'Percorso “Mobilità”', text: 'Vinyasa e stretching attivo per articolazioni più libere, lezione dopo lezione.' },
          'Rinforzare il core': { title: 'Percorso “Core”', text: 'Pilates reformer in piccolo gruppo: controllo, forza profonda e precisione.' },
          default: { title: 'La lezione giusta per te', text: 'Alla prova ti conosciamo e scegliamo insieme tra pilates e yoga.' },
        },
        formTitle: 'Prenotiamo la lezione di prova?',
        submit: 'Prenota la prova gratuita',
        success: 'Ti richiamiamo entro 24 ore lavorative per fissare la lezione di prova. Porta abiti comodi e calzini antiscivolo.',
      },

      assistant: {
        name: 'Assistente Mind & Body',
        greeting: 'Ciao! Sono l’assistente di Pilates & Yoga. Posso aiutarti a scegliere tra pilates e yoga, raccontarti le lezioni e prenotare la prova gratuita.',
        quickActions: ['Meglio pilates o yoga?', 'Ho mal di schiena', 'Orari pilates', 'Prenota la prova'],
        intents: [
          { keywords: ['prenot', 'prova', 'provare'], answer: 'Volentieri! Lasciami due dati e ti richiamiamo per fissare la lezione di prova. <button type="button" class="msg__cta" data-lead-open>Prenota la prova</button>' },
          { keywords: ['meglio', 'differenza', 'quale'], answer: 'Il pilates lavora su postura e core, lo yoga su mobilità e respiro. Per il mal di schiena partiamo di solito dal pilates, per lo stress dallo yoga, ma molti li alternano.' },
          { keywords: ['schiena', 'postura', 'cervical', 'lombar'], answer: 'Il pilates è spesso il punto di partenza ideale. Al colloquio valutiamo se serve il pilates clinico con la nostra chinesiologa. <button type="button" class="msg__cta" data-lead-open>Prova gratis</button>' },
        ],
      },
    },

    kids: {
      id: 'kids',
      name: 'TSC Kids',
      logo: '',
      cta: { label: 'Prenota la lezione di prova', short: 'Lezione di prova' },
      card: { tagline: 'Sport dai 3 ai 13 anni', hook: 'Troppo schermo e poco movimento per i tuoi figli?' },

      hero: {
        eyebrow: 'TSC Kids · Sport dai 3 ai 13 anni',
        title: 'Troppo schermo, *poco movimento?*',
        lead:
          'Il gioco è il modo più naturale per crescere forti, sicuri e sereni. Nei nostri corsi i bambini scoprono lo sport divertendosi, seguiti da istruttori specializzati nell’età evolutiva.',
        trust: ['Prova gratuita', 'Gruppi per età', 'Istruttori qualificati'],
        proof: { value: '8', unit: 'bambini', label: 'al massimo per istruttore', points: ['Coordinazione', 'Autostima', 'Nuovi amici'] },
        img: 'assets/images/kids-hero.svg',
        alt: 'Bambini che giocano durante una lezione di avviamento motorio',
      },

      problem: {
        eyebrow: 'Ti riconosci?',
        title: 'Succede *in tante famiglie.*',
        lead: 'Sono i dubbi che i genitori ci raccontano più spesso al primo incontro. Sono normali, e c’è un modo semplice per affrontarli.',
        pains: [
          { icon: 'screen', title: 'Sempre davanti a uno schermo', text: 'Tablet, TV e videogiochi riempiono i pomeriggi e il movimento finisce in fondo alla lista.' },
          { icon: 'loop', title: '“Non trova lo sport giusto”', text: 'Ha provato calcio, danza, nuoto… e dopo un mese vuole già smettere.' },
          { icon: 'heartLine', title: 'Timido o insicuro', text: 'Fa fatica a stare in gruppo o si scoraggia quando qualcosa non gli riesce subito.' },
        ],
        stat: { value: '1 su 2', text: 'dei genitori che ci contattano cerca uno sport da provare prima di scegliere.' },
      },

      solution: {
        eyebrow: 'La nostra risposta',
        title: 'Non un corso. *Un percorso di crescita.*',
        lead:
          'Con il multisport i bambini provano più discipline nella stessa stagione: sviluppano le capacità motorie di base e scoprono con calma cosa li appassiona. Ognuno con il suo ritmo.',
        pillars: [
          { icon: 'smile', title: 'Giochiamo', text: 'il movimento parte dal divertimento' },
          { icon: 'compass', title: 'Scopriamo', text: 'nuoto, minitennis e giochi di squadra' },
          { icon: 'sprout', title: 'Cresciamo', text: 'coordinazione, equilibrio, fiducia' },
          { icon: 'clipboard', title: 'Vi raccontiamo', text: 'i progressi a ogni trimestre' },
        ],
      },

      journey: {
        eyebrow: 'Come funziona',
        title: 'Un anno di sport *in 5 tappe*',
        steps: [
          { meta: 'Prima settimana', title: 'Lezione di prova', text: 'Il bambino prova gratis, tu conosci istruttori e spazi.' },
          { meta: 'Inserimento', title: 'Il gruppo giusto', text: 'Gruppi piccoli per età e livello, mai più di 8 bambini.' },
          { meta: 'Tutto l’anno', title: 'Multisport', text: 'Nuoto, minitennis e avviamento motorio a rotazione.' },
          { meta: 'Ogni trimestre', title: 'Colloquio', text: 'Ti raccontiamo i progressi e cosa lo appassiona di più.' },
          { meta: 'A giugno', title: 'Festa finale', text: 'Mini-olimpiadi: i bambini mostrano cosa hanno imparato.' },
        ],
      },

      stories: {
        eyebrow: 'Parola ai genitori',
        title: 'Famiglie *come la tua*',
        lead: 'I progressi dei bambini si vedono in vasca e in campo, ma soprattutto a casa.',
        items: [
          { quote: 'Giulia era timidissima. Ora non vede l’ora che arrivi il martedì per ritrovare i suoi amici del minitennis.', name: 'Laura', detail: 'mamma di Giulia, 7 anni', result: '2 anni', resultLabel: 'con noi, senza mai smettere' },
          { quote: 'Tommaso aveva paura dell’acqua. A fine stagione nuotava a stile libero da solo.', name: 'Andrea', detail: 'papà di Tommaso, 6 anni', result: '25 m', resultLabel: 'a stile libero in una stagione' },
          { quote: 'Il multisport ci ha fatto capire che la sua passione è il tennis. Ora gioca nella scuola federale.', name: 'Silvia', detail: 'mamma di Leo, 10 anni', result: '3 sport', resultLabel: 'provati prima di scegliere' },
        ],
        note: 'Testimonianze raccolte con il consenso delle famiglie.',
      },

      equipment: {
        eyebrow: 'Spazi e attrezzature',
        title: 'Spazi pensati *per i più piccoli*',
        lead: 'Ambienti sicuri, attrezzi a misura di bambino e una zona dove i genitori possono aspettare in tranquillità.',
        items: [
          { name: 'Vasca didattica', tag: 'Acqua bassa e riscaldata', text: 'Profondità ridotta e temperatura controllata per imparare a nuotare in sicurezza.', img: 'assets/images/kids-tech-01.svg', alt: 'Vasca didattica con acqua bassa per bambini' },
          { name: 'Campi da minitennis', tag: 'Reti e palline ridotte', text: 'Racchette leggere e palline a bassa pressione: si gioca da subito, a ogni età.', img: 'assets/images/kids-tech-02.svg', alt: 'Campo da minitennis con reti ridotte' },
          { name: 'Palestra kids', tag: 'Materiali morbidi', text: 'Percorsi motori, tappeti e piccoli attrezzi colorati per l’avviamento motorio.', img: 'assets/images/kids-tech-03.svg', alt: 'Palestra per bambini con percorso motorio e tappeti' },
          { name: 'Area genitori', tag: 'Vista vasca e Wi-Fi', text: 'Guarda la lezione dalla vetrata oppure lavora in tranquillità mentre aspetti.', img: 'assets/images/kids-tech-04.svg', alt: 'Area d’attesa per i genitori con vetrata sulla piscina' },
        ],
      },

      team: {
        eyebrow: 'Gli istruttori',
        title: 'Istruttori *che amano il loro lavoro*',
        lead: 'Professionisti formati sull’età evolutiva: sanno quando spingere, quando giocare e quando rassicurare.',
        members: [
          { name: 'Chiara Neri', role: 'Coordinatrice TSC Kids', bio: 'Costruisce i gruppi e segue il percorso di ogni bambino durante l’anno.', creds: ['Scienze Motorie', 'Psicomotricità'], img: 'assets/images/kids-staff-01.svg', alt: 'Ritratto di Chiara Neri' },
          { name: 'Luca Bernardi', role: 'Scuola nuoto', bio: 'Insegna ai più piccoli a stare in acqua con fiducia, prima ancora che a nuotare.', creds: ['Istruttore FIN', 'Brevetto salvamento'], img: 'assets/images/kids-staff-02.svg', alt: 'Ritratto di Luca Bernardi' },
          { name: 'Andrea Pallotta', role: 'Minitennis', bio: 'Maestro della scuola tennis federale, porta i bambini dal gioco alla tecnica.', creds: ['Maestro FITP', 'Settore giovanile'], img: 'assets/images/kids-staff-03.svg', alt: 'Ritratto di Andrea Pallotta' },
        ],
      },

      faq: {
        eyebrow: 'Domande frequenti',
        title: 'Le domande *dei genitori*',
        items: [
          { q: 'Da che età si può iniziare?', a: 'Dai 3 anni con l’avviamento motorio e il nuoto baby. I gruppi sono divisi per fasce d’età fino ai 13 anni.' },
          { q: 'Mio figlio non sa nuotare: può partecipare?', a: 'Certo. In vasca didattica l’acqua è bassa e l’istruttore lavora prima sulla confidenza con l’acqua, poi sulla tecnica.' },
          { q: 'E se dopo un mese si stanca?', a: 'È proprio il motivo del multisport: le discipline ruotano durante l’anno, così il bambino resta motivato e scopre cosa gli piace davvero.' },
          { q: 'I genitori possono assistere?', a: 'Sì, dall’area genitori con vetrata sulla vasca e sui campi. Durante la lezione chiediamo di non entrare in acqua o in campo, per non distrarre il gruppo.' },
          { q: 'Serve il certificato medico?', a: 'Per i corsi continuativi è richiesto il certificato di idoneità all’attività sportiva non agonistica. La segreteria ti indica i requisiti per l’età di tuo figlio.' },
          { q: 'Quanto costa?', a: 'La lezione di prova è gratuita. Sono disponibili quote trimestrali e annuali, con sconto per i fratelli: te le presentiamo dopo la prova.' },
        ],
      },

      final: {
        eyebrow: 'Il primo passo',
        title: 'La prima lezione *è gratis.*',
        lead: 'Porta tuo figlio a provare: se si diverte lo vedrai subito. Altrimenti, nessun impegno.',
      },

      lead: {
        title: 'Lezione di prova TSC Kids',
        intro: 'Tre domande per trovare il gruppo giusto. Poi ti richiamiamo per fissare la prova.',
        questions: [
          { q: 'Quanti anni ha tuo figlio?', options: ['3–5 anni', '6–8 anni', '9–11 anni', '12–13 anni'] },
          { q: 'Cosa ti interessa di più?', options: ['Che si muova e si diverta', 'Che impari a nuotare', 'Che inizi a giocare a tennis', 'Trovare lo sport giusto per lui'] },
          { q: 'Quali giorni preferisci?', options: ['Lunedì e mercoledì', 'Martedì e giovedì', 'Sabato mattina', 'Indifferente'] },
        ],
        profileFrom: 1,
        profiles: {
          'Che si muova e si diverta': { title: 'Percorso “Gioco e movimento”', text: 'Avviamento motorio in piccoli gruppi: equilibrio, coordinazione e tanto divertimento.' },
          'Che impari a nuotare': { title: 'Percorso “Acquaticità”', text: 'Si parte in vasca didattica, dalla confidenza con l’acqua fino alle prime nuotate in autonomia.' },
          'Che inizi a giocare a tennis': { title: 'Percorso “Minitennis”', text: 'Racchette leggere e campi ridotti: si gioca da subito, poi arriva la tecnica.' },
          'Trovare lo sport giusto per lui': { title: 'Percorso “Multisport”', text: 'Nuoto, minitennis e giochi di squadra a rotazione, per scoprire cosa lo appassiona davvero.' },
          default: { title: 'Il percorso giusto per tuo figlio', text: 'Alla lezione di prova lo conosciamo e scegliamo insieme il gruppo più adatto.' },
        },
        formTitle: 'Prenotiamo la lezione di prova?',
        submit: 'Prenota la prova gratuita',
        success: 'Ti richiamiamo entro 24 ore lavorative per fissare la lezione di prova. Servono solo costume, scarpe da ginnastica e tanta voglia di giocare.',
      },

      assistant: {
        name: 'Assistente Kids',
        greeting: 'Ciao! Sono l’assistente di TSC Kids. Posso aiutarti a scegliere il corso giusto per tuo figlio e prenotare la lezione di prova gratuita.',
        quickActions: ['Da che età si può iniziare?', 'Orari dei corsi kids', 'Quanto costa?', 'Prenota la prova'],
        intents: [
          { keywords: ['prenot', 'prova', 'provare'], answer: 'Volentieri! Lasciami due dati e ti richiamiamo per fissare la lezione di prova gratuita. <button type="button" class="msg__cta" data-lead-open>Prenota la prova</button>' },
          { keywords: ['età', 'eta', 'anni', 'piccol'], answer: 'Si parte dai 3 anni con avviamento motorio e nuoto baby. I gruppi sono divisi per età fino ai 13 anni, mai più di 8 bambini per istruttore.' },
          { keywords: ['costa', 'prezzo', 'prezzi', 'quanto', 'quota'], answer: 'La prova è gratuita. Ci sono quote trimestrali e annuali, con sconto fratelli: te le presentiamo dopo la lezione di prova.' },
        ],
      },
    },

    wellness: {
      id: 'wellness',
      name: 'Wellness & Spa',
      logo: '',
      cta: { label: 'Prenota l’ingresso omaggio', short: 'Ingresso omaggio' },
      card: { tagline: 'Recupero e rigenerazione', hook: 'Stanchezza accumulata e muscoli che non recuperano?' },

      hero: {
        eyebrow: 'Wellness & Spa · Recupero',
        title: 'Hai bisogno *di staccare davvero?*',
        lead:
          'Il recupero è la parte dell’allenamento che tutti saltano. Sauna, bagno turco, area relax e massaggi sportivi: il tuo tempo per rigenerarti, a pochi passi dall’ufficio.',
        trust: ['Ingresso omaggio', 'Aperto 7 giorni su 7', 'Accappatoio incluso'],
        proof: { value: '90', unit: 'minuti', label: 'il percorso benessere consigliato', points: ['Muscoli sciolti', 'Sonno migliore', 'Mente libera'] },
        img: 'assets/images/wellness-hero.svg',
        alt: 'Area relax della spa con luci soffuse',
      },

      problem: {
        eyebrow: 'Ti riconosci?',
        title: 'Non sei *l’unico a essere stanco.*',
        lead: 'Ritmi serrati e allenamenti senza recupero: il corpo lo fa notare, prima o poi.',
        pains: [
          { icon: 'battery', title: '“Sono sempre scarico”', text: 'Arrivi al venerdì senza energie e il weekend non basta a ricaricarti.' },
          { icon: 'alert', title: '“I muscoli non recuperano”', text: 'Indolenzimenti che durano giorni e allenamenti che peggiorano invece di migliorare.' },
          { icon: 'moon', title: '“Dormo male”', text: 'Tensione accumulata e testa che non si ferma: il sonno è il primo a risentirne.' },
        ],
        stat: { value: '1 su 2', text: 'dei soci che usano la spa lo fa per recuperare dopo l’allenamento.' },
      },

      solution: {
        eyebrow: 'La nostra risposta',
        title: 'Il recupero *è allenamento.*',
        lead:
          'Un percorso benessere pensato per chi fa sport e per chi lavora tanto: calore per sciogliere, freddo per riattivare, massaggio per liberare le tensioni, relax per ricaricare.',
        pillars: [
          { icon: 'flame', title: 'Calore', text: 'sauna finlandese e bagno turco' },
          { icon: 'drop', title: 'Contrasto', text: 'docce emozionali e percorso freddo' },
          { icon: 'heartLine', title: 'Massaggio', text: 'sportivo e decontratturante' },
          { icon: 'moon', title: 'Relax', text: 'area silenzio e tisaneria' },
        ],
      },

      journey: {
        eyebrow: 'Come funziona',
        title: 'Il percorso benessere *in 5 tappe*',
        steps: [
          { meta: '10 minuti', title: 'Accoglienza', text: 'Kit con accappatoio, telo e ciabattine.' },
          { meta: '15 minuti', title: 'Sauna', text: 'Calore secco per sciogliere muscoli e tensioni.' },
          { meta: '10 minuti', title: 'Doccia fredda', text: 'Il contrasto riattiva la circolazione.' },
          { meta: '15 minuti', title: 'Bagno turco', text: 'Vapore per respirare e rilassarsi.' },
          { meta: '40 minuti', title: 'Relax o massaggio', text: 'Area silenzio, tisana, o massaggio su prenotazione.' },
        ],
      },

      stories: {
        eyebrow: 'Persone come te',
        title: 'Il loro *momento per sé*',
        lead: 'Soci che hanno inserito il recupero nella settimana. Ecco cosa è cambiato.',
        items: [
          { quote: 'Il giovedì sera sauna e bagno turco dopo il lavoro. È l’unico momento della settimana in cui spengo il telefono.', name: 'Roberta', detail: '47 anni · imprenditrice', result: '1 sera', resultLabel: 'a settimana, tutta per sé' },
          { quote: 'Corro le maratone. Da quando alterno massaggio sportivo e sauna recupero molto più in fretta dai lunghi.', name: 'Gianluca', detail: '41 anni · runner amatoriale', result: '−2 giorni', resultLabel: 'di indolenzimento dopo i lunghi' },
          { quote: 'Dormivo male da mesi. Il percorso della domenica mattina mi ha rimesso in pari.', name: 'Maria', detail: '63 anni · in pensione', result: '4 domeniche', resultLabel: 'al mese, da due anni' },
        ],
        note: 'Testimonianze raccolte con il consenso dei soci.',
      },

      equipment: {
        eyebrow: 'Spazi e servizi',
        title: 'Un’area *tutta dedicata al recupero*',
        lead: 'Separata dalle zone sportive, silenziosa e curata ogni giorno.',
        items: [
          { name: 'Sauna finlandese', tag: '80–90 °C', text: 'Calore secco in legno di abete, per sciogliere muscoli e tensioni.', img: 'assets/images/wellness-tech-01.svg', alt: 'Sauna finlandese in legno' },
          { name: 'Bagno turco', tag: 'Aromaterapia', text: 'Vapore caldo e umido con essenze naturali per respirare meglio.', img: 'assets/images/wellness-tech-02.svg', alt: 'Bagno turco con vapore' },
          { name: 'Docce emozionali', tag: 'Caldo e freddo', text: 'Getti, nebbia fredda e luci per il percorso di contrasto.', img: 'assets/images/wellness-tech-03.svg', alt: 'Docce emozionali con luci colorate' },
          { name: 'Cabine massaggi', tag: 'Su prenotazione', text: 'Massaggio sportivo, decontratturante o rilassante con operatori qualificati.', img: 'assets/images/wellness-tech-04.svg', alt: 'Cabina per massaggi con lettino' },
        ],
      },

      team: {
        eyebrow: 'Il team',
        title: 'Mani *esperte*',
        lead: 'Massoterapisti e operatori del benessere che conoscono le esigenze di chi fa sport.',
        members: [
          { name: 'Stefano Conti', role: 'Responsabile area wellness', bio: 'Costruisce i percorsi benessere e consiglia la frequenza giusta per ogni socio.', creds: ['Operatore benessere', 'Scienze Motorie'], img: 'assets/images/wellness-staff-01.svg', alt: 'Ritratto di Stefano Conti' },
          { name: 'Valentina Moretti', role: 'Massaggio sportivo', bio: 'Tratta atleti amatoriali e agonisti prima e dopo gare e allenamenti intensi.', creds: ['Massoterapista MCB', 'Linfodrenaggio'], img: 'assets/images/wellness-staff-02.svg', alt: 'Ritratto di Valentina Moretti' },
          { name: 'Irene Marchetti', role: 'Massaggio decontratturante', bio: 'Specializzata in tensioni cervicali e lombari da lavoro sedentario.', creds: ['Massoterapista MCB', 'Riflessologia'], img: 'assets/images/wellness-staff-03.svg', alt: 'Ritratto di Irene Marchetti' },
        ],
      },

      faq: {
        eyebrow: 'Domande frequenti',
        title: 'Hai ancora *qualche dubbio?*',
        items: [
          { q: 'Posso accedere alla spa senza abbonamento in palestra?', a: 'Sì, esistono ingressi singoli e carnet dedicati alla sola area wellness.' },
          { q: 'Quanto tempo serve per il percorso?', a: 'Consigliamo circa 90 minuti per un percorso completo, ma puoi fermarti anche solo per la sauna dopo l’allenamento.' },
          { q: 'Ci sono controindicazioni?', a: 'Sauna e bagno turco sono sconsigliati in gravidanza, con pressione alta non controllata o problemi cardiaci. Nel dubbio chiedi al tuo medico.' },
          { q: 'Cosa devo portare?', a: 'Solo il costume: accappatoio, telo e ciabattine sono inclusi nel kit.' },
          { q: 'Come prenoto un massaggio?', a: 'In segreteria, dall’app o direttamente dal form di questa pagina: ti richiamiamo per fissare giorno e operatore.' },
          { q: 'Quanto costa?', a: 'Il primo ingresso è in omaggio. Poi ingressi singoli, carnet da 10 o accesso incluso nella formula full access.' },
        ],
      },

      final: {
        eyebrow: 'Il primo passo',
        title: 'Il primo ingresso *te lo offriamo noi.*',
        lead: 'Un percorso benessere completo, kit incluso. Ti basta portare il costume.',
      },

      lead: {
        title: 'Ingresso omaggio Wellness',
        intro: 'Due domande per preparare il tuo percorso. Poi ti richiamiamo per fissare il giorno.',
        questions: [
          { q: 'Cosa cerchi soprattutto?', options: ['Recuperare dopo lo sport', 'Staccare dallo stress', 'Dormire meglio', 'Un massaggio'] },
          { q: 'Quando preferisci venire?', options: ['In settimana, di giorno', 'In settimana, la sera', 'Nel weekend'] },
        ],
        profileFrom: 0,
        profiles: {
          'Recuperare dopo lo sport': { title: 'Percorso “Recovery”', text: 'Sauna e contrasto caldo-freddo subito dopo l’allenamento, più un massaggio sportivo a settimana.' },
          'Staccare dallo stress': { title: 'Percorso “Stacco”', text: 'Bagno turco, docce emozionali e area silenzio: 90 minuti senza telefono.' },
          'Dormire meglio': { title: 'Percorso “Sera”', text: 'Calore dolce e relax nel tardo pomeriggio, per arrivare a letto già rilassati.' },
          'Un massaggio': { title: 'Percorso “Massaggio”', text: 'Scegli tra sportivo, decontratturante o rilassante: ti abbiniamo l’operatore giusto.' },
          default: { title: 'Il tuo percorso benessere', text: 'Ti accogliamo e costruiamo insieme il percorso più adatto a te.' },
        },
        formTitle: 'Prenotiamo il tuo ingresso omaggio?',
        submit: 'Voglio l’ingresso omaggio',
        success: 'Ti richiamiamo entro 24 ore lavorative per fissare il tuo ingresso. Ti basta il costume: il resto è incluso.',
      },

      assistant: {
        name: 'Assistente Wellness',
        greeting: 'Ciao! Sono l’assistente dell’area Wellness. Posso raccontarti il percorso benessere, i massaggi disponibili e prenotarti l’ingresso omaggio.',
        quickActions: ['Com’è il percorso?', 'Posso prenotare un massaggio?', 'Cosa devo portare?', 'Prenota l’ingresso'],
        intents: [
          { keywords: ['prenot', 'ingresso', 'omaggio'], answer: 'Con piacere! Lasciami due dati e ti richiamiamo per fissare il tuo ingresso omaggio. <button type="button" class="msg__cta" data-lead-open>Prenota l’ingresso</button>' },
          { keywords: ['massagg'], answer: 'Abbiamo massaggio sportivo, decontratturante e rilassante, su prenotazione. <button type="button" class="msg__cta" data-lead-open>Richiedi un massaggio</button>' },
          { keywords: ['percorso', 'sauna', 'turco'], answer: 'Il percorso consigliato dura circa 90 minuti: sauna, doccia fredda, bagno turco e relax con tisana. Kit con accappatoio incluso.' },
          { keywords: ['portare', 'serve', 'costume'], answer: 'Solo il costume: accappatoio, telo e ciabattine li trovi nel kit.' },
        ],
      },
    },
  };

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
          // Se la disciplina ha una pagina verticale, la risposta ci porta anche lì.
          const activity = activities.find((a) => a.category === cat);
          const world = activity && verticals[activity.vertical];
          const more = world ? `<br>Scopri il percorso <a href="${routes[world.id]}">${world.name}</a>.` : '';
          if (!list.length) return `Al momento non ho corsi di ${cat} a calendario.${more}`;
          const rows = list.map((c) => `• ${c.day} <strong>${c.time}</strong> — ${c.name}`).join('<br>');
          return `Orari <strong>${cat}</strong>:<br>${rows}<br>Filtra la <a href="${routes.orari}">timetable</a> per vedere tutto.${more}`;
        },
      },
      {
        id: 'subscribe',
        keywords: ['iscriver', 'iscrizione', 'abbonarmi', 'come faccio a iscrivermi', 'tesseramento'],
        answer:
          `Iscriversi è semplice: prenota una visita dalla sezione <a href="${routes.contatti}">Contatti</a>, vieni in segreteria con un documento e il certificato medico sportivo. Completiamo tutto in circa 15 minuti.`,
      },
      {
        id: 'price',
        keywords: ['costa', 'prezzo', 'prezzi', 'quanto', 'tariffe', 'abbonamento'],
        answer:
          `Le formule vanno dall’accesso mensile all’abbonamento annuale full access (sala, corsi, piscina e wellness). Il listino aggiornato lo consegna la segreteria: scrivici dai <a href="${routes.contatti}">Contatti</a> e te lo inviamo subito.`,
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
          `Il merchandising del club è disponibile in reception e nella sezione <a href="${routes.merch}">Merch</a>: t-shirt tecniche, felpe, borsoni e accessori della capsule ufficiale.`,
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
    getVerticals: async () => Object.values(verticals),
    getVertical: async (id) => verticals[id] || null,
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
     * Lead dalle pagine verticali (quiz + contatti) — demo frontend.
     * Punto di aggancio per CRM / webhook / gestionale. Payload:
     *   { vertical, source, profile, answers: [{question, answer}], name, phone, email, privacy }
     */
    submitLead: async (payload) => {
      console.info('[TSC] Nuovo lead (demo, nessun backend):', payload);
      await new Promise((r) => setTimeout(r, 700));
      return { ok: true };
    },

    /**
     * Chatbot — motore demo a intenti.
     * `context.vertical` (id della pagina verticale) fa valutare per primi gli
     * intenti dell'assistente specializzato, poi quelli generali del club.
     * Per collegare un LLM reale sostituire il corpo, es.:
     *   const r = await fetch('/api/assistant', {method:'POST', body: JSON.stringify({message, ...context})});
     *   return (await r.json()).reply;
     */
    askAssistant: async (message, context = {}) => {
      const msg = (message || '').toLowerCase();
      await new Promise((r) => setTimeout(r, 450 + Math.random() * 350));
      const vertical = verticals[context.vertical];
      const pool = [...((vertical && vertical.assistant && vertical.assistant.intents) || []), ...chatbot.intents];
      const intent = pool.find((i) => i.keywords.some((k) => msg.includes(k)));
      if (!intent) return chatbot.fallback;
      return typeof intent.answer === 'function' ? intent.answer(msg) : intent.answer;
    },
  };

  window.TSC = { routes, navigation, club, social, feed, activities, verticals, days, courses, events, partners, corporateBenefits, merch, merchStoreUrl, chatbot, api };
})(window);
