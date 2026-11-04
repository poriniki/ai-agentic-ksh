/*
 * Connection to the live server, or a same-browser fallback.
 *
 *   live   server.js is running. State and answers come from the server over
 *          Server-Sent Events, and every change goes through the server.
 *   local  no server (opened from a file or a static host). State and answers
 *          live in localStorage, so the deck, the presenter console and any
 *          other window on this machine stay in step. Audience phones cannot
 *          join in this mode.
 */
(function (ns) {
  'use strict';

  var core = ns.core;
  var deck = window.AIPRO_DECK;
  var KEYS = {
    state: 'aipro:state:v1',
    votes: 'aipro:votes:v1',
    responses: 'aipro:responses:v1',
    reactions: 'aipro:reactions:v1',
    client: 'aipro:client:v1',
    mine: 'aipro:mine:v1',
    key: 'aipro:key:v1'
  };
  var defs = {};
  deck.slides.forEach(function (slide) {
    slide.interactions.forEach(function (it) { defs[it.id] = it; });
  });

  // Pages in a sub-folder (the Persian pages in fa/) reach the API at the site root.
  var BASE = document.documentElement.getAttribute('data-base') || '';
  // Each language has its own audience page; the QR codes point to it.
  var JOIN_PATH = document.documentElement.getAttribute('data-join') || 'join';

  var listeners = [];
  var mode = 'connecting';   // 'live' | 'local' | 'connecting'
  var status = 'connecting'; // 'live' | 'reconnecting' | 'local' | 'connecting'
  var snap = null;           // { state, results, reactions, connections, serverNow }
  var info = { live: false, origins: [] };
  var offset = 0;            // server clock minus this clock, in ms
  var source = null;
  var key = readKey();

  function readKey() {
    var fromUrl = '';
    try {
      fromUrl = new URLSearchParams(window.location.search).get('key') || '';
      if (fromUrl) window.sessionStorage.setItem(KEYS.key, fromUrl);
      return fromUrl || window.sessionStorage.getItem(KEYS.key) || '';
    } catch (err) {
      return fromUrl;
    }
  }

  function notify() {
    listeners.forEach(function (fn) {
      try { fn(snap, status); } catch (err) { console.error(err); }
    });
  }

  function setStatus(next) {
    if (status !== next) {
      status = next;
      notify();
    }
  }

  function applySnapshot(data) {
    if (!data || !data.state) return;
    offset = (data.serverNow || Date.now()) - Date.now();
    snap = data;
    notify();
  }

  // ---- localStorage helpers (the local mode) -------------------------------
  function read(k, fallback) {
    try {
      var raw = window.localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(k, value) {
    try {
      window.localStorage.setItem(k, JSON.stringify(value));
    } catch (err) {
      /* storage full or blocked: the screen still works for this session */
    }
  }

  function localSnapshot() {
    var reactions = read(KEYS.reactions, { totals: {}, recent: [] });
    return {
      state: read(KEYS.state, null) || core.initialState(),
      results: core.resultsFor(defs, read(KEYS.votes, {}), read(KEYS.responses, {})),
      reactions: { totals: reactions.totals || {}, recent: (reactions.recent || []).slice(-20) },
      connections: 1,
      serverNow: Date.now()
    };
  }

  function localRefresh() {
    snap = localSnapshot();
    notify();
  }

  // ---- Clients --------------------------------------------------------------
  function clientId() {
    try {
      var id = window.localStorage.getItem(KEYS.client);
      if (!id) {
        id = 'c' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        window.localStorage.setItem(KEYS.client, id);
      }
      return id;
    } catch (err) {
      return 'c' + Math.random().toString(36).slice(2, 10) + 'fallback';
    }
  }

  // Errors carry the server's code (for messages in the reader's language);
  // a network failure has status 0.
  function post(path, body) {
    return window.fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.error || 'Request failed');
          err.status = res.status;
          err.code = data.code || null;
          throw err;
        }
        return data;
      });
    }, function () {
      var err = new Error('Network error');
      err.status = 0;
      throw err;
    });
  }

  // ---- Start-up -------------------------------------------------------------
  function startLocal() {
    mode = 'local';
    info = { live: false, origins: [] };
    window.addEventListener('storage', function (e) {
      if (Object.keys(KEYS).some(function (name) { return KEYS[name] === e.key; })) localRefresh();
    });
    snap = localSnapshot();
    setStatus('local');
    notify();
  }

  function startLive() {
    mode = 'live';
    source = new window.EventSource(BASE + 'api/stream');
    source.addEventListener('snapshot', function (e) {
      setStatus('live');
      applySnapshot(JSON.parse(e.data));
    });
    source.onopen = function () { setStatus('live'); };
    source.onerror = function () { setStatus('reconnecting'); };
  }

  function init() {
    if (window.location.protocol === 'file:') {
      startLocal();
      return Promise.resolve(mode);
    }
    return window.fetch(BASE + 'api/info', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('no live server');
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.live) throw new Error('not live');
        info = data;
        startLive();
        return mode;
      })
      .catch(function () {
        startLocal();
        return mode;
      });
  }

  // ---- Commands and answers -------------------------------------------------
  function command(action) {
    if (mode === 'live') {
      return post('api/command', { key: key, action: action }).then(function (data) {
        snap = Object.assign({}, snap, { state: data.state, serverNow: Date.now() });
        notify();
        return data;
      });
    }
    var next = core.reduce(read(KEYS.state, null) || core.initialState(), action, {
      slides: deck.slides,
      timers: deck.timers,
      now: Date.now()
    });
    write(KEYS.state, next);
    localRefresh();
    return Promise.resolve({ ok: true, state: next });
  }

  function vote(payload) {
    var body = Object.assign({ clientId: clientId() }, payload);
    if (mode === 'live') return post('api/vote', body);
    return new Promise(function (resolve, reject) {
      var def = defs[body.id];
      if (!def) return reject(new Error('Unknown question.'));
      if (def.kind === 'choice') {
        var votes = read(KEYS.votes, {});
        votes[def.id] = votes[def.id] || {};
        votes[def.id][body.clientId] = votes[def.id][body.clientId] || {};
        votes[def.id][body.clientId][body.item] = body.choice;
        write(KEYS.votes, votes);
      } else if (def.kind === 'open') {
        var text = core.cleanText(body.text, def.maxLength);
        if (text.length < 2) return reject(new Error('Please write a few words.'));
        var responses = read(KEYS.responses, {});
        responses[def.id] = responses[def.id] || [];
        responses[def.id].push({ id: Date.now(), text: text, at: Date.now(), hidden: false, client: body.clientId });
        write(KEYS.responses, responses);
      }
      localRefresh();
      resolve({ ok: true });
    });
  }

  function react(emoji) {
    if (mode === 'live') return post('api/react', { clientId: clientId(), emoji: emoji });
    var store = read(KEYS.reactions, { totals: {}, recent: [] });
    store.totals[emoji] = (store.totals[emoji] || 0) + 1;
    store.recent = (store.recent || []).concat([{ id: Date.now(), emoji: emoji, at: Date.now() }]).slice(-40);
    write(KEYS.reactions, store);
    localRefresh();
    return Promise.resolve({ ok: true });
  }

  function moderate(id, responseId, hidden) {
    if (mode === 'live') return post('api/moderate', { key: key, id: id, responseId: responseId, hidden: hidden });
    var responses = read(KEYS.responses, {});
    (responses[id] || []).forEach(function (r) { if (r.id === responseId) r.hidden = hidden; });
    write(KEYS.responses, responses);
    localRefresh();
    return Promise.resolve({ ok: true });
  }

  function reset(scope, id) {
    if (mode === 'live') return post('api/reset', { key: key, scope: scope, id: id || null });
    if (scope === 'votes' || scope === 'all') write(KEYS.votes, {});
    if (scope === 'responses' || scope === 'all') write(KEYS.responses, {});
    if (scope === 'reactions' || scope === 'all') write(KEYS.reactions, { totals: {}, recent: [] });
    if (scope === 'all') write(KEYS.state, core.initialState());
    localRefresh();
    return Promise.resolve({ ok: true });
  }

  // The audience's own answers, so the phone can show what it chose.
  function mine() {
    return read(KEYS.mine, {});
  }

  function setMine(map) {
    write(KEYS.mine, map);
  }

  ns.sync = {
    init: init,
    on: function (fn) { listeners.push(fn); },
    snapshot: function () { return snap; },
    status: function () { return status; },
    mode: function () { return mode; },
    info: function () { return info; },
    key: function () { return key; },
    hasKey: function () { return !!key; },
    now: function () { return Date.now() + offset; },
    clientId: clientId,
    command: command,
    vote: vote,
    react: react,
    moderate: moderate,
    reset: reset,
    mine: mine,
    setMine: setMine,
    exportUrl: function () { return BASE + 'api/export?key=' + encodeURIComponent(key); },
    joinUrl: function () {
      var origin = info.origins && info.origins[0];
      return origin ? origin + '/' + JOIN_PATH : null;
    }
  };
})(window.AIPro = window.AIPro || {});
