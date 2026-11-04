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
  var I = ns.i18n;
  var deck = window.AIPRO_DECK;
  var N = deck.slides.length;
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

  function errorText(err) {
    return ns.interactions.errorText(err);
  }

  function canControl() {
    return sync.mode() === 'local' || sync.hasKey();
  }

  function clockText(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
    return I.digits(parts.map(function (x) { return (x < 10 ? '0' : '') + x; }).join(':'));
  }

  function minutesText(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return I.digits(Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2));
  }

  function hhmm(totalMinutes) {
    return I.digits(Math.floor(totalMinutes / 60) + ':' + ('0' + (totalMinutes % 60)).slice(-2));
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
      toast(I.t('pc.toastControl'));
      return;
    }
    sync.command(action).catch(function (err) { toast(errorText(err)); });
  }

  // ---- Current slide, notes and schedule -----------------------------------
  function renderCurrent() {
    var s = deck.slides[state.slide];
    var box = $('#pc-current');
    box.textContent = '';
    box.appendChild(el('div', { cls: 'pc-meta' }, [
      el('span', { cls: 'pc-chip theme-' + s.theme, text: s.moduleName }),
      el('span', { cls: 'pc-muted', text: I.t('pc.slideOf', { n: s.n, total: N }) })
    ]));
    box.appendChild(el('h2', { cls: 'pc-title', text: s.title }));
    box.appendChild(el('p', {
      cls: 'pc-muted',
      text: s.type + (s.typeDetail ? I.t('sep') + s.typeDetail : '') + I.t('sep') + I.digits(s.time.start + '–' + s.time.end)
    }));
    box.appendChild(el('p', {
      cls: 'pc-step',
      text: s.steps ? I.t('pc.step', { k: Math.min(state.step, s.steps), n: s.steps }) : I.t('pc.noSteps')
    }));

    var notesBox = $('#pc-notes');
    notesBox.textContent = '';
    var notes = R.blocks(s.notes, { frag: false });
    if (notes.length) notes.forEach(function (n) { notesBox.appendChild(n); });
    else notesBox.appendChild(el('p', { cls: 'pc-muted', text: I.t('pc.noNotes') }));

    $('#pc-brief').textContent = s.visualBrief || I.t('pc.noBrief');

    var fills = $('#pc-fill');
    fills.textContent = '';
    s.placeholders.forEach(function (p) { fills.appendChild(el('li', { text: p })); });
    $('#pc-fill-card').hidden = !s.placeholders.length;

    var nextSlide = deck.slides[state.slide + 1];
    var nextBox = $('#pc-next-slide');
    nextBox.textContent = '';
    if (nextSlide) {
      nextBox.appendChild(el('p', { cls: 'pc-next-title', text: I.digits(nextSlide.n) + '. ' + nextSlide.title }));
      var preview = [];
      nextSlide.blocks.forEach(function (b) {
        if (preview.length >= 4) return;
        if (b.t === 'p') preview.push(R.plainOf(b.c));
        else if (b.t === 'ul' || b.t === 'ol') {
          b.items.forEach(function (it) { if (preview.length < 4) preview.push('• ' + R.plainOf(it.c)); });
        } else if (b.t === 'table') preview.push(I.t('pc.tableRows', { n: b.rows.length }));
      });
      preview.forEach(function (line) { nextBox.appendChild(el('p', { cls: 'pc-muted pc-line', text: line })); });
    } else {
      nextBox.appendChild(el('p', { cls: 'pc-muted', text: I.t('pc.last') }));
    }

    Array.prototype.forEach.call($('#pc-slides').children, function (li, i) {
      li.classList.toggle('is-current', i === state.slide);
    });
  }

  function renderSchedule() {
    var start = sessionStart();
    var cur = deck.slides[state.slide];
    $('#pc-plan').textContent = I.t('pc.planned', { time: hhmm(cur.time.startMin), block: cur.moduleName });
    var btn = $('#pc-clock-btn');
    var variance = $('#pc-variance');
    if (start === null) {
      btn.textContent = I.t('pc.clockStart');
      $('#pc-clock').textContent = clockText(0);
      variance.textContent = '';
      return;
    }
    var elapsedMs = Date.now() - start;
    btn.textContent = I.t('pc.clockReset');
    $('#pc-clock').textContent = clockText(elapsedMs);
    var nowMin = Math.floor(elapsedMs / 60000) + deck.slides[0].time.startMin;
    var diff = nowMin - cur.time.startMin;
    var text = I.t('pc.onPlan');
    var cls = 'is-on';
    if (diff > 1) {
      text = I.t('pc.behind', { n: diff });
      cls = 'is-behind';
    } else if (diff < -1) {
      text = I.t('pc.ahead', { n: Math.abs(diff) });
      cls = 'is-ahead';
    }
    variance.textContent = text;
    variance.className = 'pc-variance ' + cls;
  }

  // ---- Timers --------------------------------------------------------------
  function renderTimers() {
    var box = $('#pc-timers');
    box.textContent = '';
    var timers = deck.slides[state.slide].interactions.filter(function (it) { return it.kind === 'timer'; });
    if (!timers.length) {
      box.appendChild(el('p', { cls: 'pc-muted', text: I.t('pc.noTimer') }));
      return;
    }
    timers.forEach(function (def) {
      var view = core.timerView((state.timers || {})[def.id], { durationMs: def.durationMs }, sync.now());
      var running = view.status === 'running' && !view.done;
      var stateText = view.done ? I.t('timer.done')
        : I.t(view.status === 'running' ? 'timer.running' : view.status === 'paused' ? 'timer.paused' : 'timer.ready');
      var button = function (op, label, primary) {
        return el('button', {
          cls: 'pc-btn' + (primary ? ' primary' : ''),
          attrs: { type: 'button' },
          text: label,
          on: { click: function () { go({ type: 'timer', id: def.id, op: op }); } }
        });
      };
      box.appendChild(el('div', { cls: 'pc-timer' }, [
        el('p', { cls: 'pc-timer-label', text: I.t('pc.timerTotal', { label: def.label, time: minutesText(def.durationMs) }) }),
        el('p', { cls: 'pc-timer-time', text: minutesText(view.done ? 0 : view.remainingMs) }),
        el('p', { cls: 'pc-muted', text: stateText }),
        el('div', { cls: 'pc-row' }, [
          running
            ? button('pause', I.t('pc.pause'), false)
            : button('start', I.t(view.status === 'paused' ? 'pc.resume' : 'pc.start'), true),
          button('reset', I.t('pc.reset'), false)
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
      if (!liveHandles.length) box.appendChild(el('p', { cls: 'pc-muted', text: I.t('pc.noQuestions') }));
      liveSlide = state.slide;
    }
    var byId = {};
    core.interactionViews(s, state.step).forEach(function (v) { byId[v.id] = v; });
    var results = (snap && snap.results) || {};
    liveHandles.forEach(function (h) {
      h.handle.update({ view: byId[h.def.id] || null, res: results[h.def.id] || null, timer: null, now: sync.now() });
    });
  }

  function renderResponses() {
    var box = $('#pc-responses');
    box.textContent = '';
    var opens = deck.slides[state.slide].interactions.filter(function (it) { return it.kind === 'open'; });
    if (!opens.length) {
      box.appendChild(el('p', { cls: 'pc-muted', text: I.t('pc.nothingToModerate') }));
      return;
    }
    opens.forEach(function (def) {
      var res = ((snap && snap.results) || {})[def.id] || { responses: [], count: 0 };
      box.appendChild(el('p', { cls: 'pc-muted', text: def.prompt }));
      if (!res.responses.length) {
        box.appendChild(el('p', { cls: 'pc-muted', text: I.t('pc.noAnswers') }));
        return;
      }
      res.responses.slice().reverse().slice(0, 40).forEach(function (r) {
        box.appendChild(el('div', { cls: 'pc-response' }, [
          el('span', { cls: 'pc-response-text', text: r.text }),
          el('button', {
            cls: 'pc-btn small',
            attrs: { type: 'button' },
            text: I.t('pc.hide'),
            on: {
              click: function () {
                sync.moderate(def.id, r.id, true).catch(function (err) { toast(errorText(err)); });
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
        el('strong', { text: I.digits(totals[emoji] || 0) })
      ]));
    });
    var conns = snap && snap.connections ? snap.connections : 0;
    $('#pc-connections').textContent = sync.mode() === 'live' ? I.tn('pc.screens', conns) : I.t('pc.localPhones');
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
          el('span', { cls: 'pc-slide-num', text: I.digits(s.n) }),
          el('span', { cls: 'pc-slide-title', text: s.title }),
          el('span', { cls: 'pc-slide-time', text: I.digits(s.time.start) })
        ])
      ]));
    });
  }

  // ---- Status and links ------------------------------------------------------
  function renderStatus(status) {
    var text = I.t('status.connecting');
    var cls = '';
    if (status === 'live') {
      text = I.t('pc.statusLive');
      cls = 'is-live';
    } else if (status === 'reconnecting') {
      text = I.t('pc.statusReconnecting');
      cls = 'is-warn';
    } else if (status === 'local') {
      text = I.t('pc.statusLocal');
      cls = 'is-local';
    }
    if (sync.mode() === 'live' && !sync.hasKey()) {
      text += I.t('pc.statusViewOnly');
      cls += ' is-warn';
    }
    $('#pc-status').textContent = text;
    $('#pc-status').className = 'pc-status ' + cls;
    var disabled = !canControl();
    ['#pc-prev', '#pc-next', '#pc-go'].forEach(function (sel) { $(sel).disabled = disabled; });
  }

  function renderLinks() {
    var key = sync.key();
    var query = key ? '?key=' + encodeURIComponent(key) : '';
    $('#pc-open-deck').href = 'index.html' + query;
    var join = sync.joinUrl();
    var joinLink = $('#pc-open-join');
    if (join) {
      joinLink.href = join;
      // U+2066…U+2069 isolate the address so it reads left to right in Persian text.
      joinLink.textContent = I.t('pc.audiencePage', { url: '⁦' + join.replace(/^https?:\/\//, '') + '⁩' });
    } else {
      joinLink.href = 'join.html';
      joinLink.textContent = I.t('pc.audienceNeedsServer');
    }
    $('#pc-export').href = sync.exportUrl();
    $('#pc-export').hidden = sync.mode() !== 'live';
    $('#pc-lang').href = (I.lang() === 'fa' ? '../presenter.html' : 'fa/presenter.html') + query;
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
      else toast(I.t('pc.gotoRange', { n: N }));
    });
    $('#pc-goto').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') $('#pc-go').click();
    });
    $('#pc-clock-btn').addEventListener('click', function () {
      if (sessionStart() === null || window.confirm(I.t('pc.confirmClock'))) setSessionStart(Date.now());
      renderSchedule();
    });
    $('#pc-clock-stop').addEventListener('click', function () {
      setSessionStart(null);
      renderSchedule();
    });

    function resetScope(scope, confirmKey) {
      if (!canControl()) {
        toast(I.t('pc.resetNeedsKey'));
        return;
      }
      if (!window.confirm(I.t(confirmKey))) return;
      sync.reset(scope, null).then(function () { toast(I.t('pc.cleared')); }).catch(function (err) { toast(errorText(err)); });
    }
    $('#pc-reset-votes').addEventListener('click', function () { resetScope('votes', 'pc.confirmVotes'); });
    $('#pc-reset-responses').addEventListener('click', function () { resetScope('responses', 'pc.confirmResponses'); });
    $('#pc-reset-all').addEventListener('click', function () { resetScope('all', 'pc.confirmAll'); });

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
