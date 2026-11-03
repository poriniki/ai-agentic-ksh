/*
 * Presenter console (presenter.html). Private to the presenter: notes, timers,
 * the schedule and moderation. It drives the same shared state as the deck.
 */
(function (ns) {
  'use strict';

  var R = ns.render;
  var el = R.el;
  var sync = ns.sync;
  var core = ns.core;
  var deck = window.AIPRO_DECK;
  var N = deck.slides.length;
  var LAST = N - 1;
  var CLOCK_KEY = 'aipro:session-start';

  function $(sel) { return document.querySelector(sel); }

  var state = core.initialState();
  var snap = null;
  var liveHandles = [];
  var liveSlide = -1;
  var toastTimer = null;

  function toast(message) {
    var t = $('#pc-toast');
    t.textContent = message;
    t.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-shown'); }, 3000);
  }

  function canControl() {
    return sync.mode() === 'local' || sync.hasKey();
  }

  function clockText(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    return [h, m, r].map(function (x) { return (x < 10 ? '0' : '') + x; }).join(':');
  }

  function hhmm(totalMinutes) {
    var h = Math.floor(totalMinutes / 60);
    var m = totalMinutes % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  function sessionStart() {
    try {
      var v = window.sessionStorage.getItem(CLOCK_KEY);
      return v ? parseInt(v, 10) : null;
    } catch (err) {
      return null;
    }
  }

  function setSessionStart(value) {
    try {
      if (value === null) window.sessionStorage.removeItem(CLOCK_KEY);
      else window.sessionStorage.setItem(CLOCK_KEY, String(value));
    } catch (err) { /* ignore */ }
  }

  function go(action) {
    if (!canControl()) {
      toast('Open this console with the presenter link (it ends with ?key=…) to control the slides.');
      return;
    }
    sync.command(action).catch(function (err) { toast(err.message); });
  }

  // ---- Current slide, notes and schedule -----------------------------------
  function renderCurrent() {
    var s = deck.slides[state.slide];
    var steps = s.steps;
    var stepLabel = steps ? 'Step ' + Math.min(state.step, steps) + ' of ' + steps : 'No build steps';
    $('#pc-current').textContent = '';
    $('#pc-current').appendChild(el('div', { cls: 'pc-meta' }, [
      el('span', { cls: 'pc-chip theme-' + s.theme, text: s.moduleName }),
      el('span', { cls: 'pc-muted', text: 'Slide ' + s.n + ' of ' + N })
    ]));
    $('#pc-current').appendChild(el('h2', { cls: 'pc-title', text: s.title }));
    $('#pc-current').appendChild(el('p', { cls: 'pc-muted', text: s.type + (s.typeDetail ? ' · ' + s.typeDetail : '') + ' · ' + s.time.start + '–' + s.time.end }));
    $('#pc-current').appendChild(el('p', { cls: 'pc-step', text: stepLabel }));

    $('#pc-notes').textContent = '';
    var notes = R.blocks(s.notes, { frag: false });
    if (notes.length) notes.forEach(function (n) { $('#pc-notes').appendChild(n); });
    else $('#pc-notes').appendChild(el('p', { cls: 'pc-muted', text: 'No speaker notes for this slide.' }));

    $('#pc-brief').textContent = s.visualBrief || 'No design brief.';

    var fills = $('#pc-fill');
    fills.textContent = '';
    if (s.placeholders.length) {
      s.placeholders.forEach(function (p) { fills.appendChild(el('li', { text: p })); });
      $('#pc-fill-card').hidden = false;
    } else {
      $('#pc-fill-card').hidden = true;
    }

    var nextSlide = deck.slides[state.slide + 1];
    var nextBox = $('#pc-next-slide');
    nextBox.textContent = '';
    if (nextSlide) {
      nextBox.appendChild(el('p', { cls: 'pc-next-title', text: nextSlide.n + '. ' + nextSlide.title }));
      var preview = [];
      nextSlide.blocks.forEach(function (b) {
        if (preview.length >= 4) return;
        if (b.t === 'p') preview.push(R.plainOf(b.c));
        else if (b.t === 'ul' || b.t === 'ol') b.items.forEach(function (it) { if (preview.length < 4) preview.push('• ' + R.plainOf(it.c)); });
        else if (b.t === 'table') preview.push('Table: ' + b.rows.length + ' rows');
      });
      preview.forEach(function (line) { nextBox.appendChild(el('p', { cls: 'pc-muted pc-line', text: line })); });
    } else {
      nextBox.appendChild(el('p', { cls: 'pc-muted', text: 'Last slide.' }));
    }

    var rowsWrap = $('#pc-slides');
    Array.prototype.forEach.call(rowsWrap.children, function (li, i) {
      li.classList.toggle('is-current', i === state.slide);
    });
  }

  function renderSchedule() {
    var start = sessionStart();
    var cur = deck.slides[state.slide];
    var planned = 'Planned start ' + hhmm(cur.time.startMin) + ' (block ' + cur.moduleName + ')';
    $('#pc-plan').textContent = planned;
    var btn = $('#pc-clock-btn');
    var clock = $('#pc-clock');
    if (start === null) {
      btn.textContent = 'Start session clock';
      clock.textContent = '00:00:00';
      $('#pc-variance').textContent = '';
      return;
    }
    var elapsedMs = Date.now() - start;
    btn.textContent = 'Reset clock';
    clock.textContent = clockText(elapsedMs);
    var nowMin = Math.floor(elapsedMs / 60000) + deck.slides[0].time.startMin;
    var diff = nowMin - cur.time.startMin;
    var text;
    var cls;
    if (diff > 1) { text = diff + ' min behind the plan'; cls = 'is-behind'; }
    else if (diff < -1) { text = Math.abs(diff) + ' min ahead of the plan'; cls = 'is-ahead'; }
    else { text = 'On plan'; cls = 'is-on'; }
    $('#pc-variance').textContent = text;
    $('#pc-variance').className = 'pc-variance ' + cls;
  }

  // ---- Timers --------------------------------------------------------------
  function renderTimers() {
    var box = $('#pc-timers');
    box.textContent = '';
    var s = deck.slides[state.slide];
    var timers = s.interactions.filter(function (it) { return it.kind === 'timer'; });
    if (!timers.length) {
      box.appendChild(el('p', { cls: 'pc-muted', text: 'No timer on this slide.' }));
      return;
    }
    timers.forEach(function (def) {
      var t = (state.timers || {})[def.id];
      var view = core.timerView(t, { durationMs: def.durationMs }, sync.now());
      var label = el('p', { cls: 'pc-timer-label', text: def.label + ' · ' + clockText(def.durationMs).slice(3) + ' total' });
      var time = el('p', { cls: 'pc-timer-time', text: clockText(view.done ? 0 : view.remainingMs).slice(3) });
      var state_ = el('p', { cls: 'pc-muted', text: view.done ? 'Time is up' : view.status === 'running' ? 'Running' : view.status === 'paused' ? 'Paused' : 'Ready' });
      var mk = function (op, label2, primary) {
        return el('button', {
          cls: 'pc-btn' + (primary ? ' primary' : ''),
          attrs: { type: 'button' },
          text: label2,
          on: { click: function () { go({ type: 'timer', id: def.id, op: op }); } }
        });
      };
      var running = view.status === 'running' && !view.done;
      box.appendChild(el('div', { cls: 'pc-timer' }, [
        label,
        time,
        state_,
        el('div', { cls: 'pc-row' }, [
          running ? mk('pause', 'Pause', false) : mk('start', view.status === 'paused' ? 'Resume' : 'Start', true),
          mk('reset', 'Reset', false)
        ])
      ]));
    });
  }

  // ---- Live answers on this slide ---------------------------------------------
  function renderLive() {
    var s = deck.slides[state.slide];
    var box = $('#pc-results');
    if (liveSlide !== state.slide) {
      box.textContent = '';
      liveHandles = [];
      s.interactions.forEach(function (def) {
        if (def.kind === 'timer') return;
        var h = ns.interactions.create(def, { mode: 'compact' });
        liveHandles.push({ def: def, handle: h });
        box.appendChild(h.el);
      });
      if (!s.interactions.some(function (it) { return it.kind !== 'timer'; })) {
        box.appendChild(el('p', { cls: 'pc-muted', text: 'No questions for the audience on this slide.' }));
      }
      liveSlide = state.slide;
    }
    var views = core.interactionViews(s, state.step);
    var byId = {};
    views.forEach(function (v) { byId[v.id] = v; });
    var results = (snap && snap.results) || {};
    liveHandles.forEach(function (h) {
      h.handle.update({ view: byId[h.def.id] || null, res: results[h.def.id] || null, timer: null, now: sync.now() });
    });
  }

  function renderResponses() {
    var box = $('#pc-responses');
    box.textContent = '';
    var s = deck.slides[state.slide];
    var opens = s.interactions.filter(function (it) { return it.kind === 'open'; });
    if (!opens.length) {
      box.appendChild(el('p', { cls: 'pc-muted', text: 'Nothing to moderate on this slide.' }));
      return;
    }
    opens.forEach(function (def) {
      var res = ((snap && snap.results) || {})[def.id] || { responses: [], count: 0 };
      box.appendChild(el('p', { cls: 'pc-muted', text: def.prompt }));
      if (!res.responses.length) {
        box.appendChild(el('p', { cls: 'pc-muted', text: 'No answers yet.' }));
        return;
      }
      res.responses.slice().reverse().slice(0, 40).forEach(function (r) {
        box.appendChild(el('div', { cls: 'pc-response' }, [
          el('span', { cls: 'pc-response-text', text: r.text }),
          el('button', {
            cls: 'pc-btn small',
            attrs: { type: 'button' },
            text: 'Hide',
            on: {
              click: function () {
                sync.moderate(def.id, r.id, true).catch(function (err) { toast(err.message); });
              }
            }
          })
        ]));
      });
    });
  }

  function renderReactions() {
    var totals = (snap && snap.reactions && snap.reactions.totals) || {};
    var box = $('#pc-react');
    box.textContent = '';
    ['👍', '❓', '💡', '🐢'].forEach(function (emoji) {
      box.appendChild(el('span', { cls: 'pc-react' }, [
        el('span', { text: emoji }),
        el('strong', { text: String(totals[emoji] || 0) })
      ]));
    });
    var conns = snap && snap.connections ? snap.connections : 0;
    $('#pc-connections').textContent = sync.mode() === 'live'
      ? conns + ' screen' + (conns === 1 ? '' : 's') + ' connected'
      : 'Local mode: audience phones are not connected';
  }

  // ---- Slide list ------------------------------------------------------------
  function buildSlideList() {
    var list = $('#pc-slides');
    deck.slides.forEach(function (s, i) {
      list.appendChild(el('li', null, [
        el('button', {
          cls: 'pc-slide-link theme-' + s.theme,
          attrs: { type: 'button', 'data-index': String(i) },
          on: { click: function () { go({ type: 'goto', slide: i, step: 0 }); } }
        }, [
          el('span', { cls: 'pc-slide-num', text: String(s.n) }),
          el('span', { cls: 'pc-slide-title', text: s.title }),
          el('span', { cls: 'pc-slide-time', text: s.time.start })
        ])
      ]));
    });
  }

  // ---- Status and controls ------------------------------------------------
  function renderStatus(status) {
    var text;
    var cls = '';
    if (status === 'live') {
      text = '● Live server';
      cls = 'is-live';
    } else if (status === 'reconnecting') {
      text = '○ Reconnecting…';
      cls = 'is-warn';
    } else if (status === 'local') {
      text = 'Local mode (this browser only)';
      cls = 'is-local';
    } else {
      text = 'Connecting…';
    }
    if (sync.mode() === 'live' && !sync.hasKey()) {
      text += ' · view only (open with the presenter link)';
      cls += ' is-warn';
    }
    $('#pc-status').textContent = text;
    $('#pc-status').className = 'pc-status ' + cls;
    var disabled = !canControl();
    ['#pc-prev', '#pc-next', '#pc-go', '#pc-clock-btn'].forEach(function (sel) {
      var b = $(sel);
      if (b) b.disabled = disabled && sel !== '#pc-clock-btn';
    });
  }

  function renderLinks() {
    var key = sync.key();
    var base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    $('#pc-open-deck').href = 'index.html' + (key ? '?key=' + encodeURIComponent(key) : '');
    var join = sync.joinUrl();
    var joinLink = $('#pc-open-join');
    if (join) {
      joinLink.href = join;
      joinLink.textContent = 'Audience page: ' + join.replace(/^https?:\/\//, '');
    } else {
      joinLink.href = 'join.html';
      joinLink.textContent = 'Audience page (needs the live server)';
    }
    $('#pc-export').href = sync.mode() === 'live' ? sync.exportUrl() : '#';
    $('#pc-export').hidden = sync.mode() !== 'live';
    $('#pc-base').textContent = base;
  }

  function renderAll() {
    renderStatus(sync.status());
    renderCurrent();
    renderSchedule();
    renderTimers();
    renderLive();
    renderResponses();
    renderReactions();
    var goInput = $('#pc-goto');
    if (document.activeElement !== goInput) goInput.value = String(state.slide + 1);
  }

  function onSnapshot(data, status) {
    if (data && data.state) state = data.state;
    snap = data || snap;
    renderStatus(status || sync.status());
    renderAll();
  }

  function bindControls() {
    $('#pc-prev').addEventListener('click', function () { go({ type: 'prev' }); });
    $('#pc-next').addEventListener('click', function () { go({ type: 'next' }); });
    $('#pc-go').addEventListener('click', function () {
      var n = parseInt($('#pc-goto').value, 10);
      if (n >= 1 && n <= N) go({ type: 'goto', slide: n - 1, step: 0 });
      else toast('Enter a slide number from 1 to ' + N + '.');
    });
    $('#pc-goto').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') $('#pc-go').click();
    });
    $('#pc-clock-btn').addEventListener('click', function () {
      if (sessionStart() === null) setSessionStart(Date.now());
      else if (window.confirm('Reset the session clock to 0:00?')) setSessionStart(Date.now());
      renderSchedule();
    });
    $('#pc-clock-stop').addEventListener('click', function () {
      setSessionStart(null);
      renderSchedule();
    });
    function resetScope(scope, text) {
      if (!canControl()) return toast('Open with the presenter link to reset.');
      if (!window.confirm(text)) return undefined;
      return sync.reset(scope, null).then(function () { toast('Cleared.'); }).catch(function (err) { toast(err.message); });
    }
    $('#pc-reset-votes').addEventListener('click', function () { resetScope('votes', 'Clear all poll answers?'); });
    $('#pc-reset-responses').addEventListener('click', function () { resetScope('responses', 'Clear all open answers?'); });
    $('#pc-reset-all').addEventListener('click', function () {
      resetScope('all', 'Reset everything: slide back to 1, all answers and timers cleared?');
    });
    $('#pc-export').addEventListener('click', function (e) {
      if (sync.mode() === 'live') return;
      e.preventDefault();
      var blob = new window.Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
      var url = window.URL.createObjectURL(blob);
      var a = el('a', { attrs: { href: url, download: 'aipro-results-local.json' } });
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    document.addEventListener('keydown', function (e) {
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        go({ type: 'next' });
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go({ type: 'prev' });
      }
    });
  }

  function boot() {
    buildSlideList();
    bindControls();
    var link = $('#pc-open-deck');
    void link;
    sync.on(onSnapshot);
    sync.init().then(function () {
      if (sync.mode() === 'local') onSnapshot(sync.snapshot(), 'local');
      renderLinks();
      renderAll();
    });
    setInterval(function () {
      renderSchedule();
      renderTimers();
    }, 500);
    renderStatus(sync.status());
  }

  document.addEventListener('DOMContentLoaded', boot);
  ns.presenter = { go: go };
})(window.AIPro = window.AIPro || {});
