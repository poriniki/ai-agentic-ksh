#!/usr/bin/env node
'use strict';
/*
 * Live layer for the workshop deck. Zero dependencies (Node 18+).
 *
 *   npm start                      serve on port 3000 (PORT=8080 npm start to change it)
 *   AIPRO_KEY=mykey npm start      use a fixed presenter key instead of a random one
 *   npm start -- --fresh           ignore and archive the saved session
 *
 * What it does:
 *   - serves index.html (projector deck), presenter.html and join.html (audience)
 *   - holds the shared state (slide, step, timers) and applies commands with the
 *     same reducer the browsers use (assets/js/core.js)
 *   - collects audience answers, reactions and questions, validated against
 *     what is currently on screen
 *   - pushes every change to all open screens over Server-Sent Events
 *   - saves the session to .session/ (git-ignored) so a restart does not lose answers
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const core = require('./assets/js/core.js');

const WEB = __dirname;
const DECK_FILE = path.join(WEB, 'data', 'deck.json');
const DRAFT = path.join(WEB, '..', 'presentation-draft.md');
const SESSION_DIR = path.join(WEB, '.session');
const SESSION_FILE = path.join(SESSION_DIR, 'session.json');
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const FRESH = process.argv.includes('--fresh');
const MAX_BODY = 16 * 1024;
const MAX_OWN_RESPONSES = 5;
const REACTIONS = { '👍': 'Got it', '❓': 'Question', '💡': 'Insight', '🐢': 'Slow down' };

const PAGES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/presenter': 'presenter.html',
  '/presenter.html': 'presenter.html',
  '/join': 'join.html',
  '/join.html': 'join.html'
};
const PUBLIC_PREFIXES = ['/assets/', '/data/'];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// ---------------------------------------------------------------------------
// Deck data and content fingerprint
// ---------------------------------------------------------------------------
if (!fs.existsSync(DECK_FILE)) {
  console.error('data/deck.json is missing. Run "npm run build" first.');
  process.exit(1);
}
const deck = JSON.parse(fs.readFileSync(DECK_FILE, 'utf8'));
const contentHash = `${deck.meta.sourceHash}.${deck.meta.configHash}`;
const defs = {};
deck.slides.forEach((slide) => slide.interactions.forEach((it) => { defs[it.id] = it; }));

function currentDraftHash() {
  try {
    return crypto.createHash('sha256').update(fs.readFileSync(DRAFT, 'utf8')).digest('hex').slice(0, 16);
  } catch (err) {
    return null;
  }
}
if (currentDraftHash() && currentDraftHash() !== deck.meta.sourceHash) {
  console.warn('Warning: presentation-draft.md changed since the last build. Run "npm run build".');
}

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------
const KEY = process.env.AIPRO_KEY || crypto.randomBytes(3).toString('hex');

let state = core.initialState();
let votes = {};
let responses = {};
let reactions = { totals: {}, recent: [] };
let seq = 0;

function keyOk(candidate) {
  if (typeof candidate !== 'string' || candidate.length !== KEY.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(KEY));
}

function archiveSession(reason) {
  if (!fs.existsSync(SESSION_FILE)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.renameSync(SESSION_FILE, path.join(SESSION_DIR, `session-${stamp}.json`));
  console.log(`Previous session archived (${reason}).`);
}

function loadSession() {
  if (!fs.existsSync(SESSION_FILE)) return;
  if (FRESH) {
    archiveSession('--fresh');
    return;
  }
  try {
    const saved = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    if (saved.contentHash !== contentHash) {
      archiveSession('the deck content changed');
      return;
    }
    state = saved.state;
    votes = saved.votes || {};
    responses = saved.responses || {};
    reactions = saved.reactions || { totals: {}, recent: [] };
    seq = saved.seq || 0;
    console.log('Restored the saved session from .session/session.json');
  } catch (err) {
    archiveSession('unreadable');
  }
}

let saveTimer = null;
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 250);
}
function saveNow() {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  const tmp = `${SESSION_FILE}.tmp`;
  const payload = { contentHash, savedAt: new Date().toISOString(), state, votes, responses, reactions, seq };
  fs.writeFileSync(tmp, JSON.stringify(payload));
  fs.renameSync(tmp, SESSION_FILE);
}

// Per-client rate limit: at most `max` requests per minute.
const hits = new Map();
function allow(clientId, max) {
  const now = Date.now();
  const recent = (hits.get(clientId) || []).filter((t) => now - t < 60000);
  if (recent.length >= max) return false;
  recent.push(now);
  hits.set(clientId, recent);
  return true;
}

// ---------------------------------------------------------------------------
// Snapshots and live push
// ---------------------------------------------------------------------------
function resultsSnapshot() {
  return core.resultsFor(defs, votes, responses);
}

function snapshot() {
  return {
    state,
    results: resultsSnapshot(),
    reactions: { totals: reactions.totals, recent: reactions.recent.slice(-20) },
    connections: streams.size,
    serverNow: Date.now()
  };
}

const streams = new Set();
let pendingBroadcast = null;

function broadcastNow() {
  pendingBroadcast = null;
  if (!streams.size) return;
  const payload = `event: snapshot\ndata: ${JSON.stringify(snapshot())}\n\n`;
  streams.forEach((res) => res.write(payload));
}

// Batch bursts of changes into one push.
function notify() {
  if (!pendingBroadcast) pendingBroadcast = setTimeout(broadcastNow, 30);
}

// A change that must survive a restart: save it and push it.
function changed() {
  saveSoon();
  notify();
}

setInterval(() => {
  streams.forEach((res) => res.write(': ping\n\n'));
}, 20000).unref();

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function sendFile(res, abs) {
  fs.stat(abs, (err, stat) => {
    if (err || !stat.isFile()) return notFound(res);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(abs)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(abs).pipe(res);
    return undefined;
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('request too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (err) {
        reject(new Error('invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function lanUrls() {
  const urls = [];
  Object.values(os.networkInterfaces()).forEach((list) => {
    (list || []).forEach((addr) => {
      if (addr.family === 'IPv4' && !addr.internal) urls.push(addr.address);
    });
  });
  return urls;
}

// ---------------------------------------------------------------------------
// Commands and audience input
// ---------------------------------------------------------------------------
function validClientId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(id);
}

function command(body, res) {
  if (!keyOk(body.key)) return sendJson(res, 403, { error: 'Presenter key missing or wrong.' });
  const action = body.action || {};
  if (!['goto', 'next', 'prev', 'timer'].includes(action.type)) {
    return sendJson(res, 400, { error: 'Unknown action.' });
  }
  if (action.type === 'timer') {
    if (!deck.timers[action.id]) return sendJson(res, 400, { error: 'Unknown timer.' });
    if (!['start', 'pause', 'reset'].includes(action.op)) return sendJson(res, 400, { error: 'Unknown timer operation.' });
  }
  state = core.reduce(state, action, { slides: deck.slides, timers: deck.timers, now: Date.now() });
  changed();
  return sendJson(res, 200, { ok: true, state });
}

function vote(body, res) {
  if (!validClientId(body.clientId)) return sendJson(res, 400, { error: 'Bad client id.' });
  if (!allow(body.clientId, 120)) return sendJson(res, 429, { error: 'Too many answers. Slow down a little.' });

  const def = defs[body.id];
  if (!def) return sendJson(res, 400, { error: 'Unknown question.' });
  const info = deck.interactions[body.id];
  const slide = deck.slides[state.slide];
  if (!slide || slide.n !== info.slide) return sendJson(res, 409, { error: 'This question is not on screen.' });

  if (def.kind === 'choice') {
    const view = core.interactionViews(slide, state.step).find((v) => v.id === def.id);
    const item = body.item;
    const choice = body.choice;
    if (!Number.isInteger(item) || item < 0 || item >= def.items.length) {
      return sendJson(res, 400, { error: 'Bad item.' });
    }
    if (!Number.isInteger(choice) || choice < 0 || choice >= def.options.length) {
      return sendJson(res, 400, { error: 'Bad option.' });
    }
    if (item >= view.visibleItems) return sendJson(res, 409, { error: 'This item is not open yet.' });
    if (view.answersRevealed) return sendJson(res, 409, { error: 'Voting is closed for this question.' });
    votes[def.id] = votes[def.id] || {};
    votes[def.id][body.clientId] = votes[def.id][body.clientId] || {};
    votes[def.id][body.clientId][item] = choice;
    changed();
    return sendJson(res, 200, { ok: true });
  }

  if (def.kind === 'open') {
    const text = core.cleanText(body.text, def.maxLength);
    if (text.length < 2) return sendJson(res, 400, { error: 'Please write a few words.' });
    const list = responses[def.id] || [];
    const mine = list.filter((r) => r.client === body.clientId).length;
    if (mine >= MAX_OWN_RESPONSES) return sendJson(res, 429, { error: `You can send up to ${MAX_OWN_RESPONSES} answers here.` });
    responses[def.id] = list;
    list.push({ id: ++seq, text, at: Date.now(), hidden: false, client: body.clientId });
    changed();
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 400, { error: 'This question does not take answers.' });
}

function react(body, res) {
  if (!validClientId(body.clientId)) return sendJson(res, 400, { error: 'Bad client id.' });
  if (!REACTIONS[body.emoji]) return sendJson(res, 400, { error: 'Unknown reaction.' });
  if (!allow(body.clientId, 60)) return sendJson(res, 429, { error: 'Slow down a little.' });
  reactions.totals[body.emoji] = (reactions.totals[body.emoji] || 0) + 1;
  reactions.recent.push({ id: ++seq, emoji: body.emoji, at: Date.now() });
  if (reactions.recent.length > 40) reactions.recent = reactions.recent.slice(-40);
  changed();
  return sendJson(res, 200, { ok: true });
}

function moderate(body, res) {
  if (!keyOk(body.key)) return sendJson(res, 403, { error: 'Presenter key missing or wrong.' });
  const list = responses[body.id] || [];
  const hit = list.find((r) => r.id === body.responseId);
  if (!hit) return sendJson(res, 404, { error: 'Response not found.' });
  hit.hidden = body.hidden !== false;
  changed();
  return sendJson(res, 200, { ok: true });
}

function reset(body, res) {
  if (!keyOk(body.key)) return sendJson(res, 403, { error: 'Presenter key missing or wrong.' });
  const scope = body.scope;
  if (!['votes', 'responses', 'reactions', 'all'].includes(scope)) return sendJson(res, 400, { error: 'Unknown scope.' });
  if (scope === 'votes' || scope === 'all') {
    if (body.id) delete votes[body.id];
    else votes = {};
  }
  if (scope === 'responses' || scope === 'all') {
    if (body.id) delete responses[body.id];
    else responses = {};
  }
  if (scope === 'reactions' || scope === 'all') {
    reactions = { totals: {}, recent: [] };
  }
  if (scope === 'all') state = core.initialState();
  changed();
  return sendJson(res, 200, { ok: true });
}

function exportResults(res) {
  const out = {
    exportedAt: new Date().toISOString(),
    deck: deck.title,
    state: { slide: state.slide + 1, step: state.step },
    questions: {}
  };
  Object.keys(defs).forEach((id) => {
    const def = defs[id];
    if (def.kind === 'choice') {
      const r = core.choiceResults(def, votes[id] || {});
      out.questions[id] = {
        kind: 'choice',
        slide: deck.interactions[id].slide,
        options: def.options,
        respondents: r.respondents,
        items: def.items.map((item, i) => ({
          text: item.text,
          counts: r.items[i].counts,
          total: r.items[i].total
        }))
      };
    } else if (def.kind === 'open') {
      out.questions[id] = {
        kind: 'open',
        slide: deck.interactions[id].slide,
        prompt: def.prompt,
        responses: (responses[id] || []).map((r) => ({ text: r.text, at: new Date(r.at).toISOString(), hidden: r.hidden }))
      };
    }
  });
  out.reactions = reactions.totals;
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': 'attachment; filename="aipro-results.json"',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(out, null, 2));
}

function stream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write('retry: 2000\n\n');
  streams.add(res);
  res.write(`event: snapshot\ndata: ${JSON.stringify(snapshot())}\n\n`);
  notify();
  req.on('close', () => {
    streams.delete(res);
    notify();
  });
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------
function handleGet(url, req, res) {
  const p = url.pathname;
  if (p === '/api/info') {
    return sendJson(res, 200, {
      title: deck.title,
      slideCount: deck.slides.length,
      live: true,
      joinUrls: lanUrls().map((ip) => `http://${ip}:${PORT}/join`).concat([`http://localhost:${PORT}/join`])
    });
  }
  if (p === '/api/snapshot') return sendJson(res, 200, snapshot());
  if (p === '/api/stream') return stream(req, res);
  if (p === '/api/export') {
    if (!keyOk(url.searchParams.get('key'))) return sendJson(res, 403, { error: 'Presenter key missing or wrong.' });
    return exportResults(res);
  }
  if (PAGES[p]) return sendFile(res, path.join(WEB, PAGES[p]));
  if (PUBLIC_PREFIXES.some((prefix) => p.startsWith(prefix))) {
    const abs = path.normalize(path.join(WEB, p));
    if (!abs.startsWith(WEB + path.sep)) return notFound(res);
    if (path.basename(abs).startsWith('.')) return notFound(res);
    return sendFile(res, abs);
  }
  return notFound(res);
}

async function handlePost(url, req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }
  switch (url.pathname) {
    case '/api/command': return command(body, res);
    case '/api/vote': return vote(body, res);
    case '/api/react': return react(body, res);
    case '/api/moderate': return moderate(body, res);
    case '/api/reset': return reset(body, res);
    default: return notFound(res);
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' || req.method === 'HEAD') return handleGet(url, req, res);
    if (req.method === 'POST') return handlePost(url, req, res).catch(() => sendJson(res, 500, { error: 'server error' }));
    return sendJson(res, 405, { error: 'method not allowed' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { error: 'server error' });
  }
});

loadSession();

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Start on another port, for example: PORT=${PORT + 1} npm start`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  const ips = lanUrls();
  const host = ips[0] || 'localhost';
  const base = `http://${host}:${PORT}`;
  console.log('');
  console.log(`  ${deck.title}: live server running`);
  console.log('');
  console.log(`  Projector deck    ${base}/?key=${KEY}`);
  console.log(`  Presenter console ${base}/presenter.html?key=${KEY}`);
  console.log(`  Audience (phones) ${base}/join`);
  console.log('');
  console.log(`  Presenter key: ${KEY}  (anyone with it can move the slides; keep it private)`);
  if (ips.length > 1) console.log(`  Other addresses: ${ips.slice(1).map((ip) => `http://${ip}:${PORT}`).join(', ')}`);
  console.log('');
});

function shutdown() {
  try {
    saveNow();
  } finally {
    process.exit(0);
  }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { server };
