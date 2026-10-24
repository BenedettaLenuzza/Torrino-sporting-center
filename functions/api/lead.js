/* =============================================================================
   POST /api/lead — Cloudflare Pages Function
   -----------------------------------------------------------------------------
   Riceve i form del sito (modale lead delle pagine verticali e iscrizione
   eventi) e li scrive nel CRM (GoHighLevel white-label, API LeadConnector v2)
   come OPPORTUNITÀ in pipeline. Il token resta qui: il browser vede solo
   questo endpoint.

   Flusso
     1. Validazione + honeypot (un bot riceve 200 e non arriva al CRM)
     2. POST /contacts/upsert — il contatto serve comunque: un'opportunità
        esiste solo legata a un contactId. Senza tag: nell'upsert i tag
        SOVRASCRIVONO tutti quelli già presenti (documentazione ufficiale).
     3. In parallelo, sul contatto:
        a. opportunità nella pipeline: se ne ha già una "open" lì non se ne
           crea un'altra (GET /opportunities/search, poi POST /opportunities/).
           Il messaggio va anche nel campo personalizzato LC_MESSAGE_FIELD_ID
           dell'opportunità (sezione "Additional Info" della card), se impostato.
        b. POST /contacts/:id/tags  — "sito-web" + "interesse-<servizio>"
        c. POST /contacts/:id/notes — messaggio, dettagli e prova del consenso
           (l'opportunità non ha un campo note nell'API)
   Ogni chiamata ritenta una volta su errore di rete, 429 o 5xx. Se l'upsert
   fallisce comunque, il lead parte per email alla segreteria (Resend); se
   fallisce un passo del punto 3, la segreteria riceve un avviso.

   Variabili d'ambiente (.env in locale, "Variables and Secrets" su Pages):
     LC_TOKEN, LC_LOCATION_ID, LC_PIPELINE_ID, LC_STAGE_ID,
     LC_MESSAGE_FIELD_ID, LC_API_VERSION (facoltative),
     RESEND_API_KEY, MAIL_FROM, MAIL_TO
   ========================================================================== */

const LC_BASE = 'https://services.leadconnectorhq.com';
const LC_DEFAULT_VERSION = 'v3';
const RETRY_DELAY_MS = 1000;
const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 16_000;
const MAX_MESSAGE = 1000;
const PRIVACY_TEXT_VERSION = 'form-sito-2026-10';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const log = (level, message, extra = {}) => console[level](`[lead] ${message}`, JSON.stringify(extra));

/* --- Normalizzazione e validazione ------------------------------------------
   normalizePhone deve restare identica a quella in js/script.js. */
function normalizePhone(raw) {
  let s = String(raw || '').trim().replace(/[\s.\-()/]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  if (!s.startsWith('+')) s = /^39\d{9,}$/.test(s) ? `+${s}` : `+39${s}`;
  if (!/^\+[1-9]\d{6,14}$/.test(s)) return '';
  if (s.startsWith('+39') && !/^\+39\d{6,11}$/.test(s)) return '';
  return s;
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
/** Una riga: spazi compattati. */
const clean = (v, max = 120) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
/** Testo libero: tiene gli a capo (max 2 consecutivi), toglie i caratteri di controllo. */
const cleanText = (v, max) =>
  String(v ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
const slug = (v) =>
  clean(v, 60)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function splitName(full) {
  const parts = clean(full).split(' ').filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

/** Restituisce { lead } se valido, altrimenti { errors: {campo: messaggio} }. */
function validate(input) {
  const errors = {};
  const form = input.form === 'event' ? 'event' : 'lead';

  const names = input.firstName
    ? { firstName: clean(input.firstName, 60), lastName: clean(input.lastName, 80) }
    : splitName(input.name);
  const email = clean(input.email, 160).toLowerCase();
  const phone = normalizePhone(input.phone);
  const interest = slug(input.interest);
  const rawMessage = String(input.message ?? '');

  if (names.firstName.length < 2) errors.firstName = 'Nome mancante.';
  if (form === 'event' && names.lastName.length < 2) errors.lastName = 'Cognome mancante.';
  if (!phone) errors.phone = 'Telefono non valido.';
  if (email ? !isEmail(email) : form === 'event') errors.email = 'Email non valida.';
  if (input.privacy !== true) errors.privacy = 'Consenso privacy mancante.';
  if (!interest) errors.interest = 'Servizio di interesse mancante.';
  if (rawMessage.trim().length > MAX_MESSAGE) errors.message = `Massimo ${MAX_MESSAGE} caratteri.`;

  if (Object.keys(errors).length) return { errors };

  return {
    lead: {
      form,
      ...names,
      email,
      phone,
      interest,
      interestLabel: clean(input.interestLabel) || interest,
      message: cleanText(rawMessage, MAX_MESSAGE),
      page: clean(input.page, 200),
      details: Array.isArray(input.details)
        ? input.details.slice(0, 12).map((d) => ({ label: clean(d && d.label), value: clean(d && d.value, 300) }))
        : [],
    },
  };
}

/* --- HTTP con timeout e un solo nuovo tentativo ------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isRetryable = (status) => status === 429 || status >= 500;

async function request(url, init, label) {
  for (let attempt = 1; ; attempt += 1) {
    const last = attempt === 2;

    let res;
    try {
      res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (netErr) {
      // Rete o timeout: sempre ritentabile
      if (last) throw new Error(`${label}: errore di rete (${netErr.message || netErr})`);
      log('warn', `${label}: errore di rete, nuovo tentativo`, { error: String(netErr.message || netErr) });
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 300) }; }
    if (res.ok) return body;

    const err = new Error(`${label}: HTTP ${res.status}`);
    Object.assign(err, { status: res.status, traceId: body && body.traceId, detail: body && (body.message || body.error) });
    if (last || !isRetryable(res.status)) throw err;
    log('warn', `${label}: HTTP ${res.status}, nuovo tentativo`, { traceId: err.traceId });
    await sleep(RETRY_DELAY_MS);
  }
}

const OPPORTUNITY_SOURCE = 'Sito web';
const NAME_MAX = 120;

/** "Nuoto - prendere lezioni": attività + prima riga del messaggio; senza messaggio solo l'attività. */
function opportunityName(lead) {
  const text = clean(lead.message.split('\n').find((l) => l.trim()) || '', NAME_MAX);
  const name = text ? `${lead.interestLabel} - ${text}` : lead.interestLabel;
  return name.length > NAME_MAX ? `${name.slice(0, NAME_MAX - 1).trimEnd()}…` : name;
}

function crm(env) {
  const headers = {
    Authorization: `Bearer ${env.LC_TOKEN}`,
    Version: env.LC_API_VERSION || LC_DEFAULT_VERSION,
    Accept: 'application/json',
  };
  const post = (path, body, label) =>
    request(`${LC_BASE}${path}`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, label);
  const get = (path, params, label) => request(`${LC_BASE}${path}?${new URLSearchParams(params)}`, { method: 'GET', headers }, label);

  return {
    upsert: (lead) =>
      post(
        '/contacts/upsert',
        {
          locationId: env.LC_LOCATION_ID,
          firstName: lead.firstName,
          lastName: lead.lastName || undefined,
          email: lead.email || undefined,
          phone: lead.phone,
          source: 'Sito web',
        },
        'upsert',
      ),
    addTags: (id, tags) => post(`/contacts/${encodeURIComponent(id)}/tags`, { tags }, 'tags'),
    addNote: (id, body) => post(`/contacts/${encodeURIComponent(id)}/notes`, { body }, 'note'),

    /** Opportunità "open" del contatto nella pipeline del sito, se esiste. */
    findOpenOpportunity: async (contactId) => {
      const res = await get(
        '/opportunities/search',
        { locationId: env.LC_LOCATION_ID, contactId, pipelineId: env.LC_PIPELINE_ID, status: 'open', limit: '20' },
        'ricerca opportunità',
      );
      // Filtro anche qui: se un filtro venisse ignorato non si aggancia la card sbagliata
      const list = (res && res.opportunities) || [];
      return (
        list.find(
          (o) =>
            (o.contactId || (o.contact && o.contact.id)) === contactId &&
            o.pipelineId === env.LC_PIPELINE_ID &&
            o.status === 'open',
        ) || null
      );
    },
    createOpportunity: (contactId, lead, customFields) =>
      post(
        '/opportunities/',
        {
          locationId: env.LC_LOCATION_ID,
          pipelineId: env.LC_PIPELINE_ID,
          pipelineStageId: env.LC_STAGE_ID,
          contactId,
          name: opportunityName(lead),
          source: OPPORTUNITY_SOURCE,
          status: 'open',
          ...(customFields ? { customFields } : {}),
        },
        'opportunità',
      ),
    updateOpportunity: (id, body) =>
      request(
        `${LC_BASE}/opportunities/${encodeURIComponent(id)}`,
        { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
        'messaggio sulla card',
      ),
  };
}

/** Campo personalizzato dell'opportunità ("Additional Info") col messaggio, se configurato. */
const messageFields = (env, lead) =>
  env.LC_MESSAGE_FIELD_ID && lead.message ? [{ id: env.LC_MESSAGE_FIELD_ID, field_value: lead.message }] : null;

/**
 * Passo 3a: niente doppioni. Restituisce { id, created, messageSaved }.
 * messageSaved: true/false se c'era un messaggio da scrivere sulla card, null altrimenti.
 */
async function ensureOpportunity(api, env, contactId, lead) {
  if (!env.LC_PIPELINE_ID || !env.LC_STAGE_ID) throw new Error('pipeline non configurata (LC_PIPELINE_ID / LC_STAGE_ID)');
  const fields = messageFields(env, lead);

  let existing = null;
  try {
    existing = await api.findOpenOpportunity(contactId);
  } catch (err) {
    // Meglio un doppione che una richiesta fuori dalla pipeline: si prosegue con la creazione
    log('warn', 'ricerca opportunità non riuscita, ne creo una nuova', { contactId, status: err.status, error: err.message });
  }

  if (existing) {
    if (!fields) return { id: existing.id, created: false, messageSaved: null };
    // Card già aperta: il messaggio nuovo sostituisce il precedente (lo storico resta nelle note)
    try {
      await api.updateOpportunity(existing.id, { customFields: fields });
      return { id: existing.id, created: false, messageSaved: true };
    } catch (err) {
      log('error', 'messaggio non scritto sulla card esistente', { opportunityId: existing.id, status: err.status, detail: err.detail });
      return { id: existing.id, created: false, messageSaved: false };
    }
  }

  let res;
  let messageSaved = fields ? true : null;
  try {
    res = await api.createOpportunity(contactId, lead, fields);
  } catch (err) {
    // Un ID di campo sbagliato non deve costare la card: si ricrea senza il campo
    if (!fields || err.status < 400 || err.status >= 500) throw err;
    log('error', 'campo messaggio rifiutato, creo la card senza', { contactId, status: err.status, detail: err.detail });
    res = await api.createOpportunity(contactId, lead, null);
    messageSaved = false;
  }
  const id = res && res.opportunity && res.opportunity.id;
  if (!id) throw new Error('opportunità: risposta senza opportunity.id');
  return { id, created: true, messageSaved };
}

/* --- Testi per CRM ed email -------------------------------------------------- */
function describe(lead, receivedAt) {
  const kind = lead.form === 'event' ? 'Iscrizione evento' : 'Richiesta informazioni';
  return [
    `${kind} dal sito — ${lead.interestLabel}`,
    '',
    `Nome: ${lead.firstName} ${lead.lastName}`.trim(),
    `Telefono: ${lead.phone}`,
    `Email: ${lead.email || '—'}`,
    ...lead.details.map((d) => `${d.label}: ${d.value}`),
    '',
    'Messaggio:',
    lead.message || '—',
    '',
    `Pagina: ${lead.page || '—'}`,
    `Consenso privacy: sì, ${receivedAt} (testo ${PRIVACY_TEXT_VERSION})`,
  ].join('\n');
}

async function mailFallback(env, lead, receivedAt, reason) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
    throw new Error('email di riserva non configurata (RESEND_API_KEY / MAIL_FROM / MAIL_TO)');
  }
  const text = `${describe(lead, receivedAt)}\n\n---\nProblema con il CRM: ${reason}.\nVerifica il contatto e la pipeline e completali (o inseriscili) a mano.`;
  return request(
    'https://api.resend.com/emails',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: env.MAIL_TO.split(',').map((s) => s.trim()).filter(Boolean),
        subject: `[Sito] Lead da verificare nel CRM — ${lead.interestLabel}`,
        text,
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
    },
    'email',
  );
}

/* --- Handler ----------------------------------------------------------------- */
export async function onRequestPost({ request: req, env }) {
  // Solo richieste dal sito stesso
  const origin = req.headers.get('Origin');
  if (origin && origin !== new URL(req.url).origin) return json({ ok: false }, 403);
  if (!(req.headers.get('Content-Type') || '').includes('application/json')) return json({ ok: false }, 415);
  if (Number(req.headers.get('Content-Length') || 0) > MAX_BODY_BYTES) return json({ ok: false }, 413);

  let input;
  try {
    input = await req.json();
  } catch {
    return json({ ok: false }, 400);
  }

  // Honeypot: un utente vero non vede né compila il campo "website"
  if (clean(input.website)) {
    log('info', 'honeypot compilato, richiesta scartata');
    return json({ ok: true });
  }

  const { lead, errors } = validate(input || {});
  if (errors) return json({ ok: false, errors }, 400);

  const receivedAt = new Date().toISOString();
  const api = crm(env);
  const tags = ['sito-web', `interesse-${lead.interest}`];

  // 1. Contatto: se fallisce, il lead non deve andare perso → email
  let contactId;
  try {
    if (!env.LC_TOKEN || !env.LC_LOCATION_ID) throw new Error('CRM non configurato');
    const res = await api.upsert(lead);
    contactId = res && res.contact && res.contact.id;
    if (!contactId) throw new Error('upsert: risposta senza contact.id');
    log('info', res.new ? 'contatto creato' : 'contatto aggiornato', { contactId, traceId: res.traceId });
  } catch (err) {
    log('error', 'upsert non riuscito', { status: err.status, traceId: err.traceId, detail: err.detail, error: err.message });
    try {
      await mailFallback(env, lead, receivedAt, err.message);
      log('warn', 'lead inoltrato alla segreteria via email');
      return json({ ok: true, fallback: true });
    } catch (mailErr) {
      // Ultima rete di sicurezza: il lead resta nei log di Cloudflare
      log('error', 'email di riserva non riuscita: LEAD DA RECUPERARE DAI LOG', {
        error: mailErr.message,
        lead: { ...lead, receivedAt },
      });
      return json({ ok: false }, 502);
    }
  }

  // 2. Opportunità, tag e nota in parallelo. Il contatto esiste già, quindi il
  // lead non è perso; ma senza card in pipeline o senza tag "sito-web" la
  // segreteria non lo vedrebbe: per qualunque passo mancante parte un avviso.
  const [oppRes, tagsRes, noteRes] = await Promise.allSettled([
    ensureOpportunity(api, env, contactId, lead),
    api.addTags(contactId, tags),
    api.addNote(contactId, describe(lead, receivedAt)),
  ]);

  const missing = [];
  if (oppRes.status === 'fulfilled') {
    const { id, created, messageSaved } = oppRes.value;
    log('info', created ? 'opportunità creata' : 'opportunità già aperta, aggiunta solo la nota', { contactId, opportunityId: id, messageSaved });
    if (messageSaved === false) missing.push('messaggio sulla card');
  }

  [['opportunità', oppRes], ['tag', tagsRes], ['nota', noteRes]].forEach(([what, r]) => {
    if (r.status === 'fulfilled') return;
    missing.push(what);
    log('error', `${what}: non salvata/i`, {
      contactId,
      status: r.reason.status,
      traceId: r.reason.traceId,
      detail: r.reason.detail,
      error: r.reason.message,
    });
  });
  if (missing.length) {
    try {
      await mailFallback(env, lead, receivedAt, `contatto ${contactId} salvato, ma ${missing.join(', ')} non salvati`);
    } catch (mailErr) {
      log('error', 'email di riserva non riuscita', { contactId, error: mailErr.message });
    }
  }

  return json({ ok: true });
}
