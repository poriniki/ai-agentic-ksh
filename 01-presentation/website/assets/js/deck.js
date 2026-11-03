/*
 * The projector deck (index.html). It renders the shared state; it does not own it.
 * Navigation sends commands through ns.sync, which applies them locally or on the server.
 */
(function (ns) {
  'use strict';

  var R = ns.render;
  var el = R.el;
  var core = ns.core;
  var sync = ns.sync;
  var L = ns.layouts;
  var deck = window.AIPRO_DECK;
  var N = deck.slides.length;
  var LAST = N - 1;
  var DESIGN_W = 1920;
  var DESIGN_H = 1080;

  ns.deckModules = deck.modules;

  function $(sel) { return document.querySelector(sel); }

  var stage = $('#stage');
  var progress = $('#progress');
  var conn = $('#conn');
  var toastEl = $('#toast');
  var overlay = $('#overlay');
  var overlayBody = $('#overlay-body');
  var blackout = $('#blackout');
  var reactionLayer = $('#reactions');
  var hint = $('#hint');

  var slides = [];          // one entry per slide: { n, data, section, body, frags, handles, joinBadge }
  var overviewGrid = null;
  var activeIndex = -1;
  var state = core.initialState();
  var snap = null;
  var lastReactionId = null; // null until the first snapshot, so old reactions are not replayed
  var lastJoinUrl = null;
  var overlayName = null;
  var cursorTimer = null;
  var navTimer = null;
  var toastTimer = null;

  // ---- Small helpers --------------------------------------------------------
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-shown'); }, 2600);
  }

  function canControl() {
    return sync.mode() === 'local' || sync.hasKey();
  }

  function qrSvg(text) {
    if (!window.qrcode) return null;
    var qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    var markup = qr.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
    var doc = new window.DOMParser().parseFromString(markup, 'image/svg+xml');
    return document.importNode(doc.documentElement, true);
  }

  function isTyping(target) {
    return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
  }

  // ---- Building the slides once -----------------------------------------
  function buildSlide(data) {
    var rendered = L.render(data);
    var head = null;
    if (data.layout !== 'title') {
      head = el('header', { cls: 'slide-head' }, [
        el('div', { cls: 'slide-kicker' }, [
          el('span', { cls: 'kicker-dot', attrs: { 'aria-hidden': 'true' } }),
          el('span', { text: data.moduleName })
        ]),
        el('h2', { cls: 'slide-title' + (data.title.length > 44 ? ' is-xlong' : data.title.length > 30 ? ' is-long' : ''), text: data.title }),
        el('span', { cls: 'slide-count', text: data.n + ' / ' + N })
      ]);
    }
    var fit = el('div', { cls: 'fit' }, [rendered.body]);
    var body = el('div', { cls: 'slide-body layout-' + data.layout }, [fit]);
    var joinBadge = data.interactions.length
      ? el('div', { cls: 'join-badge' }, [
        el('div', { cls: 'join-qr', attrs: { 'data-role': 'qr' } }),
        el('div', { cls: 'join-text' }, [
          el('span', { cls: 'join-label', text: 'Join on your phone' }),
          el('span', { cls: 'join-url', attrs: { 'data-role': 'url' }, text: '' })
        ])
      ])
      : null;
    var typeLabel = data.layout === 'title' ? data.moduleName : data.type + (data.typeDetail ? ' · ' + data.typeDetail : '');
    var foot = el('footer', { cls: 'slide-foot' }, [
      el('span', { cls: 'foot-type', text: typeLabel }),
      el('div', { cls: 'foot-right' }, [
        joinBadge,
        el('span', { cls: 'foot-time', text: data.time.start + '–' + data.time.end })
      ])
    ]);
    var inner = el('div', { cls: 'slide-inner' }, [head, body, foot]);
    var section = el('section', {
      cls: 'slide theme-' + data.theme + ' layout-' + data.layout,
      attrs: {
        'data-n': String(data.n),
        'aria-roledescription': 'slide',
        'aria-label': 'Slide ' + data.n + ' of ' + N + ': ' + data.title
      }
    }, [inner]);
    return {
      n: data.n,
      data: data,
      section: section,
      body: body,
      fit: fit,
      handles: rendered.handles,
      frags: [],
      joinBadge: joinBadge
    };
  }

  function buildStage() {
    slides = deck.slides.map(buildSlide);
    slides.forEach(function (s) {
      stage.appendChild(s.section);
      s.frags = Array.prototype.slice.call(s.section.querySelectorAll('.frag'));
      if (s.frags.length !== s.data.fragments) {
        console.warn('Slide ' + s.n + ': ' + s.frags.length + ' build steps in the DOM, ' + s.data.fragments + ' in the data.');
      }
    });
    deck.modules.forEach(function (m) {
      progress.appendChild(el('div', {
        cls: 'pg-seg tl-' + m.theme,
        style: { 'flex-grow': String(m.endMin - m.startMin) },
        attrs: { title: m.name }
      }, [el('span', { cls: 'pg-fill' })]));
    });
    buildOverview();
  }

  // ---- Applying the shared state -------------------------------------------
  function updateProgress() {
    deck.modules.forEach(function (m, i) {
      var indexes = [];
      deck.slides.forEach(function (s, k) { if (s.module === m.index) indexes.push(k); });
      var first = indexes[0];
      var count = indexes.length;
      var ratio;
      if (state.slide > indexes[count - 1]) ratio = 1;
      else if (state.slide < first) ratio = 0;
      else ratio = (state.slide - first + state.step / Math.max(1, deck.slides[state.slide].steps)) / count;
      progress.children[i].firstChild.style.width = Math.round(Math.min(1, ratio) * 100) + '%';
    });
  }

  // Shrinks a slide's content when it is taller than the space under the heading.
  // Scaling down also widens the box (width 100/k %) so the content still fills the
  // slide, and wider content wraps less, so the largest scale that fits is found by
  // a short binary search on the real, re-wrapped height.
  function fitBody(s) {
    var fit = s.fit;
    fit.style.transform = '';
    fit.style.width = '';
    fit.style.zoom = '';
    var avail = s.body.clientHeight;
    if (!avail || fit.offsetHeight <= avail) return;
    var lo = 0.5;
    var hi = 1;
    for (var i = 0; i < 7; i += 1) {
      var mid = (lo + hi) / 2;
      fit.style.width = (100 / mid).toFixed(3) + '%';
      if (fit.offsetHeight * mid <= avail) lo = mid;
      else hi = mid;
    }
    fit.style.width = (100 / lo).toFixed(3) + '%';
    fit.style.transformOrigin = document.documentElement.dir === 'rtl' ? 'top right' : 'top left';
    fit.style.transform = 'scale(' + lo.toFixed(3) + ')';
  }

  function showSlide(index, direction) {
    if (index === activeIndex) return;
    var back = direction < 0;
    if (activeIndex >= 0) {
      var prev = slides[activeIndex].section;
      prev.classList.toggle('dir-back', back);
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      setTimeout(function () { prev.classList.remove('is-leaving'); }, 650);
    }
    var next = slides[index];
    var section = next.section;
    // Put the slide at its start position without animating, then let it slide in.
    section.style.transition = 'none';
    section.classList.remove('is-leaving');
    section.classList.toggle('dir-back', back);
    void section.offsetWidth;
    section.style.transition = '';
    section.classList.add('is-active');
    activeIndex = index;
    fitBody(next);
  }

  // tick: a timer refresh only. Timers never change the height, so the fit is kept.
  function renderActive(tickOnly) {
    var s = slides[state.slide];
    var views = core.interactionViews(s.data, state.step);
    var byId = {};
    views.forEach(function (v) { byId[v.id] = v; });
    s.frags.forEach(function (f, i) { f.classList.toggle('is-shown', i < state.step); });
    s.section.classList.toggle('answers-revealed', views.some(function (v) { return v.answersRevealed; }));
    var results = (snap && snap.results) || {};
    s.handles.forEach(function (h) {
      h.handle.update({
        view: byId[h.def.id] || null,
        res: results[h.def.id] || null,
        timer: state.timers ? state.timers[h.def.id] : null,
        now: sync.now()
      });
    });
    if (!tickOnly) fitBody(s);
    updateProgress();
  }

  function apply(next) {
    var direction = next.slide >= Math.max(0, activeIndex) ? 1 : -1;
    showSlide(next.slide, direction);
    state = next;
    renderActive();
    var hash = '#/' + (state.slide + 1);
    if (window.location.hash !== hash) history.replaceState(null, '', hash);
  }

  // ---- Reactions -------------------------------------------------------------
  // The first snapshot only records where the reaction stream stands, so reactions
  // sent before this screen opened are not replayed. Later ones float up.
  function showReactions(recent) {
    recent = recent || [];
    var newest = recent.length ? recent[recent.length - 1].id : 0;
    if (lastReactionId === null) {
      lastReactionId = newest;
      return;
    }
    recent.filter(function (r) { return r.id > lastReactionId; }).forEach(function (r, i) {
      var node = el('span', {
        cls: 'float-reaction',
        text: r.emoji,
        style: { left: (12 + Math.random() * 76) + '%', 'animation-delay': (i * 90) + 'ms' }
      });
      reactionLayer.appendChild(node);
      setTimeout(function () { node.remove(); }, 3800);
    });
    lastReactionId = Math.max(lastReactionId, newest);
  }

  // ---- Connection status and join info ---------------------------------
  function updateConn(status) {
    var text = 'Connecting…';
    var cls = '';
    if (status === 'live') {
      var n = snap && snap.connections ? snap.connections : 1;
      text = '● Live · ' + n + ' screen' + (n === 1 ? '' : 's') + (sync.hasKey() ? '' : ' · view only');
      cls = 'is-live';
    } else if (status === 'reconnecting') {
      text = '○ Reconnecting to the server…';
      cls = 'is-warn';
    } else if (status === 'local') {
      text = 'Local mode · start the server for audience phones';
      cls = 'is-local';
    }
    conn.textContent = text;
    conn.className = 'conn ' + cls;
  }

  function refreshJoin() {
    var url = sync.joinUrl();
    if (url === lastJoinUrl) return;
    lastJoinUrl = url;
    slides.forEach(function (s) {
      if (!s.joinBadge) return;
      var urlEl = s.joinBadge.querySelector('[data-role="url"]');
      var qrEl = s.joinBadge.querySelector('[data-role="qr"]');
      qrEl.textContent = '';
      if (url) {
        urlEl.textContent = url.replace(/^https?:\/\//, '');
        var svg = qrSvg(url);
        if (svg) qrEl.appendChild(svg);
        s.joinBadge.classList.remove('is-offline');
      } else {
        urlEl.textContent = 'Needs the live server (npm start)';
        s.joinBadge.classList.add('is-offline');
      }
    });
    var cover = slides[0].section.querySelector('.cover-join');
    if (cover) {
      cover.textContent = '';
      if (url) {
        cover.appendChild(el('span', { cls: 'cover-join-label', text: 'Join the live polls on your phone' }));
        cover.appendChild(el('span', { cls: 'cover-join-url', text: url.replace(/^https?:\/\//, '') }));
        var coverQr = qrSvg(url);
        if (coverQr) cover.appendChild(el('span', { cls: 'cover-qr' }, [coverQr]));
      } else {
        cover.appendChild(el('span', { cls: 'cover-join-label', text: 'Live polls need the server: run npm start' }));
      }
    }
  }

  // ---- Navigation -------------------------------------------------------------
  function go(action) {
    if (!canControl()) {
      toast('View only. Open the presenter link to move the slides.');
      return;
    }
    sync.command(action).catch(function (err) {
      toast(err.message || 'Could not move the slides.');
    });
  }

  function gotoSlide(index) {
    go({ type: 'goto', slide: index, step: 0 });
  }

  function next() { go({ type: 'next' }); }
  function prev() { go({ type: 'prev' }); }

  // ---- Overlays -----------------------------------------------------------------
  function buildOverview() {
    overviewGrid = el('div', { cls: 'overview-grid' });
    deck.slides.forEach(function (s, i) {
      overviewGrid.appendChild(el('button', {
        cls: 'ov-tile theme-' + s.theme,
        attrs: { type: 'button', 'data-index': String(i) },
        on: {
          click: function () {
            closeOverlay();
            gotoSlide(i);
          }
        }
      }, [
        el('span', { cls: 'ov-num', text: String(s.n) }),
        el('span', { cls: 'ov-title', text: s.title }),
        el('span', { cls: 'ov-mod', text: s.moduleName })
      ]));
    });
  }

  function openOverlay(name) {
    overlayName = name;
    overlay.hidden = false;
    overlayBody.textContent = '';
    if (name === 'overview') {
      overlayBody.appendChild(el('h2', { cls: 'ov-heading', text: 'All slides' }));
      overlayBody.appendChild(overviewGrid);
      var current = overviewGrid.querySelector('[data-index="' + state.slide + '"]');
      if (current) {
        current.classList.add('is-current');
        current.focus();
      }
    } else if (name === 'goto') {
      var input = el('input', {
        cls: 'goto-input',
        attrs: { type: 'number', min: '1', max: String(N), value: String(state.slide + 1), 'aria-label': 'Slide number' }
      });
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var n = parseInt(input.value, 10);
        if (n >= 1 && n <= N) {
          closeOverlay();
          gotoSlide(n - 1);
        }
      });
      overlayBody.appendChild(el('h2', { cls: 'ov-heading', text: 'Go to slide' }));
      overlayBody.appendChild(el('div', { cls: 'goto-row' }, [input, el('span', { cls: 'goto-hint', text: 'Press Enter' })]));
      setTimeout(function () { input.focus(); input.select(); }, 0);
    } else if (name === 'help') {
      var rows = [
        ['→  Space  Enter', 'Next step or slide'],
        ['←  Backspace', 'Previous step or slide'],
        ['Home  End', 'First or last slide'],
        ['O', 'All slides'],
        ['G', 'Go to a slide number'],
        ['Q', 'Join QR code for the audience'],
        ['B  .', 'Blackout, for breaks'],
        ['T', 'Light or dark theme'],
        ['F', 'Full screen'],
        ['P', 'Presenter console (notes and timers)'],
        ['Esc', 'Close this panel']
      ];
      overlayBody.appendChild(el('h2', { cls: 'ov-heading', text: 'Keyboard' }));
      overlayBody.appendChild(el('dl', { cls: 'help-list' }, rows.map(function (r) {
        return el('div', { cls: 'help-row' }, [el('dt', { text: r[0] }), el('dd', { text: r[1] })]);
      })));
    } else if (name === 'join') {
      var url = sync.joinUrl();
      overlayBody.appendChild(el('h2', { cls: 'ov-heading', text: 'Join on your phone' }));
      if (url) {
        overlayBody.appendChild(el('div', { cls: 'join-big' }, [
          qrSvg(url),
          el('p', { cls: 'join-big-url', text: url })
        ]));
      } else {
        overlayBody.appendChild(el('p', {
          cls: 'ov-note',
          text: 'Audience phones need the live server. Run "npm start" in the website folder, then reload this page.'
        }));
      }
    }
  }

  function closeOverlay() {
    overlay.hidden = true;
    overlayName = null;
    overlayBody.textContent = '';
  }

  function setBlackout(on) {
    blackout.hidden = !on;
    document.documentElement.classList.toggle('is-blackout', !!on);
  }

  function toggleTheme() {
    var root = document.documentElement;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { window.localStorage.setItem('aipro:theme', next); } catch (err) { /* ignore */ }
  }

  function openPresenter() {
    var url = 'presenter.html' + (sync.hasKey() ? '?key=' + encodeURIComponent(sync.key()) : '');
    window.open(url, 'aipro-presenter');
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }

  // ---- Scaling to the window ---------------------------------------------------
  function scaleStage() {
    var s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
    if (activeIndex >= 0) fitBody(slides[activeIndex]);
  }

  // ---- Input ------------------------------------------------------------------
  function onKey(e) {
    if (isTyping(e.target)) return;
    var key = e.key;

    if (!overlay.hidden) {
      if (key === 'Escape' || (overlayName === 'overview' && (key === 'o' || key === 'O'))) {
        e.preventDefault();
        closeOverlay();
      }
      return;
    }
    if (!blackout.hidden) {
      if (key === 'b' || key === 'B' || key === '.' || key === 'Escape' || key === ' ') {
        e.preventDefault();
        setBlackout(false);
      }
      return;
    }

    if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Enter') {
      e.preventDefault();
      next();
    } else if (key === 'ArrowLeft' || key === 'PageUp' || key === 'Backspace') {
      e.preventDefault();
      prev();
    } else if (key === 'Home') {
      e.preventDefault();
      gotoSlide(0);
    } else if (key === 'End') {
      e.preventDefault();
      gotoSlide(LAST);
    } else if (key === 'o' || key === 'O') {
      openOverlay('overview');
    } else if (key === 'g' || key === 'G') {
      openOverlay('goto');
    } else if (key === '?' || key === 'h' || key === 'H') {
      openOverlay('help');
    } else if (key === 'q' || key === 'Q') {
      openOverlay('join');
    } else if (key === 'b' || key === 'B' || key === '.') {
      setBlackout(true);
    } else if (key === 't' || key === 'T') {
      toggleTheme();
    } else if (key === 'f' || key === 'F') {
      toggleFullscreen();
    } else if (key === 'p' || key === 'P') {
      openPresenter();
    }
  }

  function parseSlideHash() {
    var m = /^#\/(\d+)$/.exec(window.location.hash || '');
    if (!m) return null;
    var n = parseInt(m[1], 10) - 1;
    return n >= 0 && n <= LAST ? n : null;
  }

  function bindInput() {
    document.addEventListener('keydown', onKey);

    document.addEventListener('mousemove', function () {
      document.documentElement.classList.remove('hide-cursor');
      clearTimeout(cursorTimer);
      cursorTimer = setTimeout(function () { document.documentElement.classList.add('hide-cursor'); }, 2500);
      document.body.classList.add('show-nav');
      clearTimeout(navTimer);
      navTimer = setTimeout(function () { document.body.classList.remove('show-nav'); }, 1800);
    });

    $('#nav-prev').addEventListener('click', prev);
    $('#nav-next').addEventListener('click', next);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });
    overlay.querySelector('[data-action="close"]').addEventListener('click', closeOverlay);
    blackout.addEventListener('click', function () { setBlackout(false); });

    var startX = null;
    var startY = null;
    document.addEventListener('touchstart', function (e) {
      if (isTyping(e.target)) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) next();
        else prev();
      }
    }, { passive: true });

    window.addEventListener('resize', scaleStage);

    // Printing (or saving as PDF) shows every slide fully built, with the answers
    // collected so far, so the PDF works as a handout after the session.
    window.addEventListener('beforeprint', function () {
      var results = (snap && snap.results) || {};
      slides.forEach(function (s) {
        s.handles.forEach(function (h) {
          h.handle.update({
            view: { visibleItems: (h.def.items || []).length, answersRevealed: false },
            res: results[h.def.id] || null,
            timer: null,
            now: sync.now()
          });
        });
        fitBody(s);
        // Page breaks follow layout, and a transform only scales the paint, so a
        // shrunk slide would spill onto the next page. Zoom shrinks the layout itself.
        var m = /scale\(([\d.]+)\)/.exec(s.fit.style.transform || '');
        if (m) {
          s.fit.style.transform = '';
          s.fit.style.zoom = m[1];
        }
      });
    });
    window.addEventListener('afterprint', function () { renderActive(); });
    window.addEventListener('hashchange', function () {
      var n = parseSlideHash();
      if (n !== null && n !== state.slide && canControl()) gotoSlide(n);
    });
  }

  // ---- Timers, snapshots and boot ----------------------------------------------
  function tick() {
    var s = slides[state.slide];
    if (s && s.handles.some(function (h) { return h.def.kind === 'timer'; })) renderActive(true);
  }

  function onSnapshot(data, status) {
    updateConn(status);
    if (!data) return;
    snap = data;
    showReactions(data.reactions && data.reactions.recent);
    if (data.state) apply(data.state);
    else renderActive();
    refreshJoin();
  }

  function boot() {
    buildStage();
    scaleStage();
    try {
      var saved = window.localStorage.getItem('aipro:theme');
      if (saved) document.documentElement.setAttribute('data-theme', saved);
    } catch (err) { /* ignore */ }
    bindInput();
    // Read the deep link first: the first state rewrites the hash to the current slide.
    var wanted = parseSlideHash();
    sync.on(onSnapshot);
    updateConn(sync.status());
    showSlide(0, 1);
    fitBody(slides[0]);
    sync.init().then(function () {
      if (sync.mode() === 'local') onSnapshot(sync.snapshot(), 'local');
      refreshJoin();
      if (wanted !== null && wanted !== state.slide && canControl()) gotoSlide(wanted);
      if (sync.mode() === 'live' && !sync.hasKey()) toast('View only. Use the presenter link to move the slides.');
    });
    setInterval(tick, 250);
    setTimeout(function () { hint.classList.add('is-faded'); }, 7000);
  }

  ns.deck = { go: go, state: function () { return state; } };
  document.addEventListener('DOMContentLoaded', boot);
})(window.AIPro = window.AIPro || {});
