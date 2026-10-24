#!/usr/bin/env node
/* =============================================================================
   Elenca pipeline e fasi del sub-account, con i relativi ID, per compilare
   LC_PIPELINE_ID e LC_STAGE_ID nel .env. Sola lettura: non modifica il CRM.

   Uso (dalla cartella del progetto):   node tools/list-pipelines.mjs
   Richiede nel .env: LC_TOKEN, LC_LOCATION_ID. L'integrazione privata deve
   avere il permesso di lettura sulle Opportunità.
   ========================================================================== */

try {
  process.loadEnvFile('.env');
} catch {
  console.error('File .env non trovato: lancia lo script dalla cartella del progetto.');
  process.exit(1);
}

const { LC_TOKEN, LC_LOCATION_ID, LC_API_VERSION = 'v3', LC_PIPELINE_ID, LC_STAGE_ID } = process.env;
if (!LC_TOKEN || !LC_LOCATION_ID) {
  console.error('Mancano LC_TOKEN o LC_LOCATION_ID nel .env.');
  process.exit(1);
}

const url = `https://services.leadconnectorhq.com/opportunities/pipelines?${new URLSearchParams({ locationId: LC_LOCATION_ID })}`;
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${LC_TOKEN}`, Version: LC_API_VERSION, Accept: 'application/json' },
});
const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`Errore HTTP ${res.status}: ${body.message || JSON.stringify(body)}`);
  if (res.status === 401 || res.status === 403) {
    console.error('→ Controlla che l\'integrazione privata abbia il permesso di LETTURA sulle Opportunità.');
  }
  process.exit(1);
}

const pipelines = body.pipelines || [];
if (!pipelines.length) {
  console.log('Nessuna pipeline in questo sub-account: creane una nel CRM e rilancia.');
  process.exit(0);
}

for (const p of pipelines) {
  const mark = p.id === LC_PIPELINE_ID ? '   ← LC_PIPELINE_ID attuale' : '';
  console.log(`\nPipeline: ${p.name}\n  LC_PIPELINE_ID=${p.id}${mark}`);
  (p.stages || []).forEach((s, i) => {
    const sMark = s.id === LC_STAGE_ID ? '   ← LC_STAGE_ID attuale' : '';
    console.log(`    ${String(i + 1).padStart(2)}. ${s.name.padEnd(28)} LC_STAGE_ID=${s.id}${sMark}`);
  });
}
console.log('\nCopia nel .env l\'ID della pipeline e quello della fase in cui devono entrare le richieste dal sito (di solito la prima).');

// Campi personalizzati dell'opportunità (sezione "Additional Info" della card)
const cfRes = await fetch(
  `https://services.leadconnectorhq.com/locations/${encodeURIComponent(LC_LOCATION_ID)}/customFields?model=opportunity`,
  { headers: { Authorization: `Bearer ${LC_TOKEN}`, Version: LC_API_VERSION, Accept: 'application/json' } },
);
const cfBody = await cfRes.json().catch(() => ({}));
console.log('\nCampi dell\'opportunità (Additional Info), per LC_MESSAGE_FIELD_ID:');
if (!cfRes.ok) {
  console.log(`  non leggibili (HTTP ${cfRes.status}: ${cfBody.message || '—'}).`);
  console.log('  → Aggiungi all\'integrazione privata il permesso di lettura sui Custom Fields e rilancia.');
} else {
  const fields = (cfBody.customFields || []).filter((f) => !f.model || f.model === 'opportunity');
  if (!fields.length) console.log('  nessuno: creane uno di tipo testo multiriga (es. "Messaggio dal sito") e rilancia.');
  for (const f of fields) {
    const mark = f.id === process.env.LC_MESSAGE_FIELD_ID ? '   ← attuale' : '';
    console.log(`  ${String(f.name).padEnd(30)} ${String(f.dataType).padEnd(14)} LC_MESSAGE_FIELD_ID=${f.id}${mark}`);
  }
}
