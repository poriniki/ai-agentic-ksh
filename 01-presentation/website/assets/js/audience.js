/*
 * Audience page (join.html): follows the presenter's slide on a phone and
 * lets people answer the questions that are on screen. Answers are anonymous.
 */
(function (ns) {
  'use strict';

  var R = ns.render;
  var el = R.el;
  var core = ns.core;
  var sync = ns.sync;
  var I = ns.i18n;
  var deck = window.AIPRO_DECK;
  var N = deck.slides.length;
  var REACTIONS = [
    ['👍', 'react.got'],
    ['❓', 'react.question'],
    ['💡', 'react.insight'],
    ['🐢', 'react.slow']
  ];

  function $(sel) { return document.querySelector(sel); }

  var currentIndex = -1;
  var handles = [];
  var lastState = null;
  var lastResults = {};

  function renderStatus(status) {
    var keys = { live: 'ph.live', reconnecting: 'ph.reconnecting', local: 'ph.local' };
    var dots = { live: 'is-live', reconnecting: 'is-warn', local: 'is-local' };
    $('#ph-dot').className = 'ph-dot ' + (dots[status] || '');
    $('#ph-status').textContent = I.t(keys[status] || 'ph.connecting');
  }

  function buildFor(index) {
    var slide = deck.slides[index];
    currentIndex = index;
    handles = slide.interactions.map(function (def) {
      return { def: def, handle: ns.interactions.create(def, { mode: 'phone' }) };
    });

    var box = $('#ph-slide');
    box.textContent = '';
    box.appendChild(el('div', { cls: 'ph-chip theme-' + slide.theme, text: slide.moduleName }));
    box.appendChild(el('h2', { cls: 'ph-slide-title', text: I.t('ph.slideLine', { n: slide.n, total: N, title: slide.title }) }));

    var qs = $('#ph-questions');
    qs.textContent = '';
    if (handles.length) {
      handles.forEach(function (h) { qs.appendChild(h.handle.el); });
    } else {
      qs.appendChild(el('div', { cls: 'ph-card ph-quiet' }, [el('p', { text: I.t('ph.quiet') })]));
    }

    var text = $('#ph-text');
    text.textContent = '';
    R.blocks(slide.blocks, { frag: false }).forEach(function (n) { text.appendChild(n); });
    if (!text.childNodes.length) text.appendChild(el('p', { cls: 'ph-muted', text: I.t('ph.noText') }));
    $('#ph-text-wrap').open = !handles.length;
  }

  function refresh() {
    if (!lastState) return;
    var slide = deck.slides[lastState.slide];
    if (lastState.slide !== currentIndex) buildFor(lastState.slide);
    var byId = {};
    core.interactionViews(slide, lastState.step).forEach(function (v) { byId[v.id] = v; });
    handles.forEach(function (h) {
      h.handle.update({
        view: byId[h.def.id] || null,
        res: lastResults[h.def.id] || null,
        timer: lastState.timers ? lastState.timers[h.def.id] : null,
        now: sync.now()
      });
    });
  }

  function onSnapshot(data, status) {
    renderStatus(status);
    if (!data) return;
    if (data.state) lastState = data.state;
    lastResults = data.results || {};
    var totals = (data.reactions && data.reactions.totals) || {};
    REACTIONS.forEach(function (r) {
      var node = document.querySelector('[data-count="' + r[0] + '"]');
      if (node) node.textContent = totals[r[0]] ? I.digits(totals[r[0]]) : '';
    });
    $('#ph-offline').hidden = sync.mode() !== 'local';
    if (lastState) refresh();
  }

  function bindReactions() {
    var bar = $('#ph-reactions');
    REACTIONS.forEach(function (r) {
      var label = I.t(r[1]);
      var btn = el('button', { cls: 'ph-react', attrs: { type: 'button', 'aria-label': label } }, [
        el('span', { cls: 'ph-react-emoji', text: r[0] }),
        el('span', { cls: 'ph-react-label', text: label }),
        el('span', { cls: 'ph-react-count', attrs: { 'data-count': r[0] } })
      ]);
      btn.addEventListener('click', function () {
        btn.classList.add('is-pressed');
        setTimeout(function () { btn.classList.remove('is-pressed'); }, 260);
        sync.react(r[0]).catch(function (err) {
          $('#ph-hint').textContent = ns.interactions.errorText(err);
        });
      });
      bar.appendChild(btn);
    });
  }

  function boot() {
    bindReactions();
    sync.on(onSnapshot);
    sync.init();
    setInterval(function () {
      if (!lastState) return;
      var slide = deck.slides[lastState.slide];
      if (slide.interactions.some(function (it) { return it.kind === 'timer'; })) refresh();
    }, 250);
  }

  document.addEventListener('DOMContentLoaded', boot);
  ns.audience = { refresh: refresh };
})(window.AIPro = window.AIPro || {});
