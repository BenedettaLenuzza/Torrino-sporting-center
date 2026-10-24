#!/usr/bin/env node
/* =============================================================================
   Test di /api/lead con un contatto di prova (scrive DAVVERO nel CRM).

   1. Avvia il sito con le funzioni:   npx wrangler pages dev .
   2. In un altro terminale:           node tools/test-lead.mjs
                                       node tools/test-lead.mjs https://<progetto>.pages.dev/api/lead

   Esegue tre richieste: un lead valido, uno con l'honeypot compilato (non
   deve arrivare al CRM) e uno con dati non validi (deve tornare 400).
   Il contatto di prova ha sempre gli stessi dati: rilanciando lo script il CRM
   deve AGGIORNARE lo stesso contatto, non crearne un secondo.
   ========================================================================== */

const url = process.argv[2] || 'http://localhost:8788/api/lead';

const testLead = {
  form: 'lead',
  name: 'Test SitoWeb',
  phone: '+39 333 000 0000',
  email: 'test-sito@example.com',
  message: ['Messaggio di prova dal sito.', 'Seconda riga.'].join('\n'),
  privacy: true,
  interest: 'nuoto',
  interestLabel: 'Nuoto (TEST — eliminare)',
  details: [{ label: 'Nota', value: 'Contatto di prova generato da tools/test-lead.mjs' }],
  page: '/test-lead',
  website: '',
};

async function send(label, body, expectStatus) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  const pass = res.status === expectStatus;
  console.log(`${pass ? 'OK ' : 'KO '} ${label.padEnd(26)} HTTP ${res.status} (atteso ${expectStatus})  ${JSON.stringify(data)}`);
  return pass;
}

console.log(`Endpoint: ${url}\n`);
const results = [
  await send('lead valido', testLead, 200),
  await send('honeypot compilato', { ...testLead, website: 'http://spam.example' }, 200),
  await send('dati non validi', { ...testLead, phone: '12', privacy: false }, 400),
];

console.log(`
Controlla nel CRM (location ${'cDZduH9ZjNIo2598PTt2'}):
  - in PIPELINE (fase LC_STAGE_ID) una card "Nuoto (TEST — eliminare) - Messaggio di prova dal sito.",
    fonte "Sito web", stato aperta,
    con il messaggio nel campo LC_MESSAGE_FIELD_ID della sezione "Additional Info"
  - aprendo il contatto dalla card: +393330000000, test-sito@example.com, fonte "Sito web",
    tag "sito-web" e "interesse-nuoto", una nota con il messaggio e il consenso privacy
  - rilanciando lo script: UNA sola card e UN solo contatto (si aggiunge solo una nota)
  - nessun contatto né card dalla richiesta honeypot
Se la risposta del lead valido contiene "fallback": true, il CRM ha rifiutato la richiesta:
guarda i log di wrangler (riga "[lead] upsert non riuscito") e la mail arrivata alla segreteria.
Alla fine elimina dal CRM la card e il contatto di prova.`);

process.exitCode = results.every(Boolean) ? 0 : 1;
