/*
 * Audience interactions: polls, open questions and timers.
 * Each definition renders in three modes:
 *   screen   the projected deck
 *   compact  the same, sized for the presenter console
 *   phone    the audience page (tap to answer)
 *
 * create(def, options) returns a handle { el, update(ctx) } where
 *   ctx = { view, res, timer, now }
 *   view   from core.interactionViews (how far the question has been revealed)
 *   res    this question's results (from core.resultsFor)
 *   timer  this timer's stored state (timers only)
 *   now    server-aligned clock in ms (timers only)
 */
(function (ns) {
  'use strict';

  var R = ns.render;
  var el = R.el;
  var core = ns.core;
  var sync = ns.sync;
  var I = ns.i18n;

  function pct(n, total) {
    return total ? Math.round((n / total) * 100) : 0;
  }

  function clock(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return I.digits(m + ':' + (r < 10 ? '0' + r : String(r)));
  }

  // A server error carries a code; show it in the reader's language.
  function errorText(err) {
    if (err && err.code) return I.t('err.' + err.code);
    if (err && err.status === 0) return I.t('err.network');
    return (err && err.message) || I.t('err.generic');
  }

  // ---- Word cloud (short answers) -------------------------------------------
  // Unicode letters and digits, plus the zero-width non-joiner Persian words use.
  var WORD_BREAK = /[^\p{L}\p{N}‌'-]+/gu;

  function wordCounts(texts) {
    var stop = I.stopwords();
    var counts = {};
    texts.forEach(function (text) {
      String(text).toLowerCase().split(WORD_BREAK).forEach(function (raw) {
        var w = raw.replace(/^['‌-]+|['‌-]+$/g, '');
        if (w.length < 3 || stop[w]) return;
        counts[w] = (counts[w] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .map(function (w) { return { word: w, count: counts[w] }; })
      .sort(function (a, b) { return b.count - a.count || a.word.localeCompare(b.word); })
      .slice(0, 36);
  }

  function renderCloud(container, responses) {
    var words = wordCounts(responses.map(function (r) { return r.text; }));
    var max = words.length ? words[0].count : 1;
    container.textContent = '';
    if (!words.length) {
      container.appendChild(el('p', { cls: 'ix-empty', text: I.t('ix.cloudEmpty') }));
      return;
    }
    words.forEach(function (w, i) {
      var size = 26 + Math.round((w.count / max) * 74);
      container.appendChild(el('span', {
        cls: 'cloud-word c' + (i % 5),
        text: w.word,
        style: { 'font-size': size + 'px' }
      }));
    });
  }

  function renderWall(container, responses, seen) {
    container.textContent = '';
    if (!responses.length) {
      container.appendChild(el('p', { cls: 'ix-empty', text: I.t('ix.wallEmpty') }));
      return;
    }
    responses.slice(-30).forEach(function (r) {
      var isNew = !seen[r.id];
      seen[r.id] = true;
      container.appendChild(el('div', { cls: 'wall-card' + (isNew ? ' is-new' : '') }, [el('p', { text: r.text })]));
    });
  }

  // ---- Choice, screen -------------------------------------------------------
  function ladderScreen(def, opts, compact) {
    var steps = (opts && opts.steps) || def.options.map(function (label) { return { name: label }; });
    var count = el('span', { cls: 'ix-count' });
    var question = def.question || (def.items[0] && def.items[0].text) || '';
    var cols = steps.map(function (step, j) {
      var fill = el('span', { cls: 'lp-fill' });
      var val = el('span', { cls: 'lp-val', text: '–' });
      var node = el('div', { cls: 'lp-step' }, [
        el('div', { cls: 'lp-rise' }, [fill, val]),
        el('div', { cls: 'lp-level', text: I.digits(j + 1) }),
        el('div', { cls: 'lp-name', text: step.name }),
        step.desc ? el('div', { cls: 'lp-desc', text: step.desc }) : null,
        step.mark ? el('div', { cls: 'lp-mark', text: step.mark }) : null
      ]);
      return { node: node, fill: fill, val: val };
    });
    var root = el('section', { cls: 'ix ix-ladder' + (compact ? ' is-compact' : '') }, [
      el('header', { cls: 'ix-head' }, [el('span', { cls: 'ix-tag', text: I.t('ix.livePoll') }), count]),
      question ? el('h3', { cls: 'ix-q', text: question }) : null,
      el('div', { cls: 'lp-steps' }, cols.map(function (c) { return c.node; }))
    ]);
    return {
      el: root,
      update: function (ctx) {
        var r = (ctx.res && ctx.res.items && ctx.res.items[0]) || { counts: [], total: 0 };
        count.textContent = I.tn('ix.answers', ctx.res ? ctx.res.respondents || 0 : 0);
        cols.forEach(function (c, j) {
          var n = r.counts[j] || 0;
          var p = pct(n, r.total);
          c.fill.style.height = p + '%';
          c.val.textContent = r.total ? I.digits(n) + I.t('sep') + I.percent(p) : '–';
        });
      }
    };
  }

  function choiceScreen(def, opts, compact) {
    if (def.variant === 'ladder') return ladderScreen(def, opts, compact);
    var count = el('span', { cls: 'ix-count' });
    var explain = el('p', { cls: 'ix-explain', text: def.explain });
    explain.hidden = true;
    // Two or three options read best side by side; more options stack as bars.
    var horizontal = def.options.length <= 3;
    var waiting = el('p', { cls: 'ix-waiting', text: I.t('ix.waiting') });
    waiting.hidden = true;
    var items = def.items.map(function (item) {
      var optEls = def.options.map(function (label) {
        var fill = el('span', { cls: 'ix-fill' });
        var val = el('span', { cls: 'ix-val', text: '–' });
        var node = el('div', { cls: 'ix-opt' + (horizontal ? ' is-h' : '') }, [
          el('span', { cls: 'ix-opt-label', text: label }),
          el('span', { cls: 'ix-track' }, [fill]),
          val,
          el('span', { cls: 'ix-mark', attrs: { 'aria-hidden': 'true' }, text: '✓' })
        ]);
        return { node: node, fill: fill, val: val };
      });
      var optsEl = el('div', {
        cls: 'ix-opts' + (horizontal ? ' is-h' : ''),
        style: horizontal ? { '--k': String(def.options.length) } : null
      }, optEls.map(function (o) { return o.node; }));
      var node = el('div', { cls: 'ix-item' + (horizontal ? ' is-row' : '') }, [
        item.text ? el('div', { cls: 'ix-item-text', text: item.text }) : null,
        optsEl
      ]);
      return { node: node, opts: optEls, answer: item.answer };
    });
    var root = el('section', { cls: 'ix ix-choice' + (compact ? ' is-compact' : '') }, [
      el('header', { cls: 'ix-head' }, [el('span', { cls: 'ix-tag', text: I.t('ix.livePoll') }), count]),
      def.question ? el('h3', { cls: 'ix-q', text: def.question }) : null,
      waiting,
      el('div', { cls: 'ix-items' + (horizontal ? ' is-rows' : '') }, items.map(function (it) { return it.node; })),
      explain
    ]);
    return {
      el: root,
      update: function (ctx) {
        var view = ctx.view || {};
        var res = ctx.res || { items: [], respondents: 0 };
        count.textContent = I.tn('ix.answers', res.respondents || 0);
        var visible = view.visibleItems === undefined ? def.items.length : view.visibleItems;
        waiting.hidden = !def.progressive || visible > 0;
        items.forEach(function (it, i) {
          var show = i < visible;
          it.node.hidden = !show;
          if (!show) return;
          var r = (res.items && res.items[i]) || { counts: [], total: 0 };
          var revealed = !!view.answersRevealed;
          it.opts.forEach(function (o, j) {
            var p = pct(r.counts[j] || 0, r.total);
            o.fill.style.width = p + '%';
            o.val.textContent = r.total ? I.percent(p) : '–';
            o.node.classList.toggle('is-answer', revealed && it.answer === j);
            o.node.classList.toggle('is-dim', revealed && typeof it.answer === 'number' && it.answer !== j);
          });
        });
        explain.hidden = !(view.answersRevealed && def.explain);
      }
    };
  }

  // ---- Choice, phone --------------------------------------------------------
  function choicePhone(def) {
    var status = el('p', { cls: 'ph-status', attrs: { role: 'status' } });
    var items = def.items.map(function (item, i) {
      var buttons = def.options.map(function (label, j) {
        var btn = el('button', { cls: 'ph-opt', attrs: { type: 'button', 'aria-pressed': 'false' }, text: label });
        btn.addEventListener('click', function () { pick(i, j); });
        return btn;
      });
      var bars = def.options.map(function (label) {
        var fill = el('span', { cls: 'ph-fill' });
        var val = el('span', { cls: 'ph-bar-val', text: '' });
        return {
          node: el('div', { cls: 'ph-bar' }, [el('span', { cls: 'ph-bar-label', text: label }), el('span', { cls: 'ph-track' }, [fill]), val]),
          fill: fill,
          val: val
        };
      });
      var results = el('div', { cls: 'ph-results' }, bars.map(function (b) { return b.node; }));
      results.hidden = true;
      var answer = el('p', { cls: 'ph-answer' });
      answer.hidden = true;
      var node = el('div', { cls: 'ph-item' }, [
        item.text ? el('p', { cls: 'ph-item-text', text: item.text }) : null,
        el('div', { cls: 'ph-opts' }, buttons),
        results,
        answer
      ]);
      return { node: node, buttons: buttons, bars: bars, results: results, answer: answer, index: i, data: item };
    });
    var root = el('section', { cls: 'ph-card ph-choice' }, [
      def.question ? el('h2', { cls: 'ph-q', text: def.question }) : null,
      el('div', { cls: 'ph-items' }, items.map(function (it) { return it.node; })),
      status
    ]);

    function paint(it) {
      var mine = (sync.mine()[def.id] || {})[it.index];
      it.buttons.forEach(function (b, j) {
        var picked = mine === j;
        b.classList.toggle('is-picked', picked);
        b.setAttribute('aria-pressed', picked ? 'true' : 'false');
      });
    }

    function pick(i, j) {
      var map = sync.mine();
      map[def.id] = map[def.id] || {};
      map[def.id][i] = j;
      sync.setMine(map);
      status.textContent = I.t('ix.saving');
      sync.vote({ id: def.id, item: i, choice: j }).then(function () {
        status.textContent = I.t('ix.saved');
      }).catch(function (err) {
        status.textContent = errorText(err);
      });
      items.forEach(paint);
    }

    return {
      el: root,
      update: function (ctx) {
        var view = ctx.view || {};
        var res = ctx.res || { items: [] };
        var revealed = !!view.answersRevealed;
        items.forEach(function (it) {
          var show = it.index < (view.visibleItems === undefined ? def.items.length : view.visibleItems);
          it.node.hidden = !show;
          if (!show) return;
          paint(it);
          var r = (res.items && res.items[it.index]) || { counts: [], total: 0 };
          var voted = (sync.mine()[def.id] || {})[it.index] !== undefined;
          var answer = it.data.answer;
          it.buttons.forEach(function (b, j) {
            b.disabled = revealed;
            b.classList.toggle('is-answer', revealed && answer === j);
            b.classList.toggle('is-dim', revealed && typeof answer === 'number' && answer !== j);
          });
          it.bars.forEach(function (bar, j) {
            var p = pct(r.counts[j] || 0, r.total);
            bar.fill.style.width = p + '%';
            bar.val.textContent = r.total ? I.percent(p) : '';
          });
          it.results.hidden = !(voted || revealed);
          if (revealed && typeof answer === 'number') {
            it.answer.hidden = false;
            it.answer.textContent = I.t('ix.answer', { option: def.options[answer] }) + (def.explain ? ' ' + def.explain : '');
          } else {
            it.answer.hidden = true;
          }
        });
      }
    };
  }

  // ---- Open question, screen ------------------------------------------------
  function openScreen(def, compact) {
    var count = el('span', { cls: 'ix-count' });
    var body = el('div', { cls: def.display === 'cloud' ? 'ix-cloud' : 'ix-wall' });
    var seen = {};
    var root = el('section', { cls: 'ix ix-open' + (compact ? ' is-compact' : '') }, [
      el('header', { cls: 'ix-head' }, [el('span', { cls: 'ix-tag', text: I.t('ix.yourAnswers') }), count]),
      el('h3', { cls: 'ix-q', text: def.prompt }),
      body
    ]);
    return {
      el: root,
      update: function (ctx) {
        var res = ctx.res || { count: 0, responses: [] };
        count.textContent = I.tn('ix.answers', res.count || 0);
        if (def.display === 'cloud') renderCloud(body, res.responses || []);
        else renderWall(body, res.responses || [], seen);
      }
    };
  }

  // ---- Open question, phone -------------------------------------------------
  function openPhone(def) {
    var textarea = el('textarea', {
      attrs: {
        rows: '3',
        maxlength: String(def.maxLength),
        placeholder: def.placeholder || I.t('ix.placeholder'),
        'aria-label': def.prompt
      }
    });
    var counter = el('span', { cls: 'ph-chars', text: I.digits('0/' + def.maxLength) });
    var status = el('p', { cls: 'ph-status', attrs: { role: 'status' } });
    var total = el('p', { cls: 'ph-total' });
    var send = el('button', { cls: 'ph-send', attrs: { type: 'submit' }, text: I.t('ix.send') });
    textarea.addEventListener('input', function () {
      counter.textContent = I.digits(textarea.value.length + '/' + def.maxLength);
    });
    var form = el('form', { cls: 'ph-form' }, [
      textarea,
      el('div', { cls: 'ph-row' }, [counter, send])
    ]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = textarea.value.trim();
      if (text.length < 2) {
        status.textContent = I.t('ix.tooShort');
        return;
      }
      send.disabled = true;
      status.textContent = I.t('ix.sending');
      sync.vote({ id: def.id, text: text }).then(function () {
        textarea.value = '';
        counter.textContent = I.digits('0/' + def.maxLength);
        status.textContent = I.t('ix.sent');
      }).catch(function (err) {
        status.textContent = errorText(err);
      }).then(function () {
        send.disabled = false;
      });
    });
    var root = el('section', { cls: 'ph-card ph-open' }, [
      el('h2', { cls: 'ph-q', text: def.prompt }),
      form,
      status,
      total
    ]);
    return {
      el: root,
      update: function (ctx) {
        var res = ctx.res || { count: 0 };
        total.textContent = I.tn('ix.soFar', res.count || 0);
      }
    };
  }

  // ---- Timer (screen and phone) --------------------------------------------
  function timer(def, mode) {
    var phone = mode === 'phone';
    var pre = phone ? 'ph-timer' : 'ix-timer';
    var label = el('div', { cls: pre + '-label', text: def.label });
    var time = el('div', { cls: pre + '-time', text: clock(def.durationMs) });
    var fill = el('span', { cls: pre + '-fill' });
    var bar = el('div', { cls: pre + '-bar' }, [fill]);
    var cue = el('div', { cls: pre + '-cue' });
    var state = el('div', { cls: pre + '-state' });
    var root = el('section', { cls: phone ? 'ph-card ph-timer' : 'ix ix-timer' }, [label, time, bar, cue, state]);
    return {
      el: root,
      update: function (ctx) {
        var v = core.timerView(ctx.timer, { durationMs: def.durationMs }, ctx.now);
        var left = v.remainingMs;
        var done = v.done || v.status === 'done';
        var ratio = Math.max(0, Math.min(1, left / def.durationMs));
        time.textContent = clock(done ? 0 : left);
        fill.style.transform = 'scaleX(' + ratio + ')';
        root.classList.toggle('is-running', v.status === 'running' && !done);
        root.classList.toggle('is-paused', v.status === 'paused');
        root.classList.toggle('is-done', done);
        root.classList.toggle('is-warning', !done && ratio < 0.2 && v.status !== 'idle');
        var active = null;
        def.cues.forEach(function (c) {
          if (c.atMs >= left && (!active || c.atMs < active.atMs)) active = c;
        });
        cue.textContent = done ? I.t('timer.done') : (active && v.status !== 'idle' ? active.text : '');
        state.textContent = done ? '' : I.t(v.status === 'running' ? 'timer.running' : v.status === 'paused' ? 'timer.paused' : 'timer.ready');
      }
    };
  }

  // ---- Factory --------------------------------------------------------------
  function create(def, options) {
    var mode = (options && options.mode) || 'screen';
    var compact = mode === 'compact';
    if (def.kind === 'timer') return timer(def, mode === 'phone' ? 'phone' : 'screen');
    if (mode === 'phone') return def.kind === 'choice' ? choicePhone(def) : openPhone(def);
    return def.kind === 'choice'
      ? choiceScreen(def, { steps: options && options.steps }, compact)
      : openScreen(def, compact);
  }

  ns.interactions = {
    create: create,
    clock: clock,
    errorText: errorText,
    wordCounts: wordCounts
  };
})(window.AIPro = window.AIPro || {});
