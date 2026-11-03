/*
 * AI-Powered Professional: shared deck logic.
 *
 * One file, two consumers:
 *   - the browser (classic <script>; exposes window.AIPro.core)
 *   - server.js (require); the server and every open page therefore agree on
 *     the slide, the step and the timers.
 *
 * Pure functions only: no DOM, no timers, no I/O. The current time is always
 * passed in, so the same inputs give the same outputs everywhere.
 *
 * Step model: a slide has `fragments` (bullets that appear one per press)
 * followed by the steps of each interaction (progressive poll items, then the
 * answer reveal). A single integer `step` counts through all of them.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.AIPro = root.AIPro || {};
    root.AIPro.core = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  function isChoice(it) {
    return !!it && it.kind === 'choice';
  }

  function hasAnswers(it) {
    return isChoice(it) && (it.items || []).some(function (x) {
      return typeof x.answer === 'number';
    });
  }

  // Steps one interaction adds to its slide.
  function interactionSteps(it) {
    if (!isChoice(it)) return 0;
    return (it.progressive ? (it.items || []).length : 0) + (hasAnswers(it) ? 1 : 0);
  }

  // Total number of steps on a slide: fragments, then each interaction in order.
  function slideSteps(slide) {
    var total = slide.fragments || 0;
    (slide.interactions || []).forEach(function (it) {
      total += interactionSteps(it);
    });
    return total;
  }

  // What each interaction on a slide should show at a given global step.
  function interactionViews(slide, step) {
    var local = Math.max(0, (step || 0) - (slide.fragments || 0));
    var offset = 0;
    return (slide.interactions || []).map(function (it) {
      var steps = interactionSteps(it);
      var k = clamp(local - offset, 0, steps);
      offset += steps;
      var n = (it.items || []).length;
      var view = {
        id: it.id,
        kind: it.kind,
        steps: steps,
        step: k,
        visibleItems: n,
        answersRevealed: false
      };
      if (isChoice(it)) {
        view.visibleItems = it.progressive ? Math.min(n, k) : n;
        view.answersRevealed = hasAnswers(it) && k >= steps;
      }
      return view;
    });
  }

  function initialState() {
    return { slide: 0, step: 0, timers: {}, rev: 0 };
  }

  // ---- Timers -------------------------------------------------------------
  // status: 'idle' | 'running' | 'paused'. A running timer whose endAt has
  // passed is shown as 'done' by timerView; it is not a stored status.

  function timerNext(t, def, op, now) {
    var full = def.durationMs;
    var cur = t || { status: 'idle', remainingMs: full, endAt: null };
    if (op === 'start') {
      if (cur.status === 'running' && cur.endAt > now) return cur;
      var left = cur.status === 'paused' && cur.remainingMs > 0 ? cur.remainingMs : full;
      return { status: 'running', remainingMs: left, endAt: now + left };
    }
    if (op === 'pause') {
      if (cur.status !== 'running') return cur;
      return { status: 'paused', remainingMs: Math.max(0, cur.endAt - now), endAt: null };
    }
    if (op === 'reset') {
      return { status: 'idle', remainingMs: full, endAt: null };
    }
    return cur;
  }

  function timerView(t, def, now) {
    var full = def.durationMs;
    if (!t) {
      return { status: 'idle', remainingMs: full, done: false };
    }
    if (t.status === 'running') {
      var left = Math.max(0, t.endAt - now);
      return {
        status: left > 0 ? 'running' : 'done',
        remainingMs: left,
        endAt: t.endAt,
        done: left === 0
      };
    }
    return {
      status: t.status,
      remainingMs: t.remainingMs,
      done: false
    };
  }

  // ---- State reducer -------------------------------------------------------
  // ctx = { slides: [...], timers: { id: { durationMs } }, now: ms }

  function reduce(state, action, ctx) {
    var slides = ctx.slides;
    var last = slides.length - 1;
    var s = state.slide;
    var k = state.step;
    var timers = state.timers || {};

    switch (action && action.type) {
      case 'goto': {
        s = clamp(parseInt(action.slide, 10) || 0, 0, last);
        var wanted = action.step == null ? 0 : parseInt(action.step, 10) || 0;
        k = clamp(wanted, 0, slideSteps(slides[s]));
        break;
      }
      case 'next':
        if (k < slideSteps(slides[s])) {
          k += 1;
        } else if (s < last) {
          s += 1;
          k = 0;
        }
        break;
      case 'prev':
        if (k > 0) {
          k -= 1;
        } else if (s > 0) {
          s -= 1;
          k = slideSteps(slides[s]);
        }
        break;
      case 'timer': {
        var def = ctx.timers && ctx.timers[action.id];
        if (!def) return state;
        timers = Object.assign({}, timers);
        timers[action.id] = timerNext(timers[action.id], def, action.op, ctx.now);
        break;
      }
      default:
        return state;
    }

    return { slide: s, step: k, timers: timers, rev: (state.rev || 0) + 1 };
  }

  // ---- Aggregation ---------------------------------------------------------
  // votes: { clientId: { itemIndex: optionIndex } }

  function choiceResults(def, votes) {
    var optionCount = (def.options || []).length;
    var items = (def.items || []).map(function () {
      var counts = [];
      for (var c = 0; c < optionCount; c += 1) counts.push(0);
      return { counts: counts, total: 0 };
    });
    var respondents = 0;
    Object.keys(votes || {}).forEach(function (clientId) {
      var mine = votes[clientId] || {};
      var answered = false;
      Object.keys(mine).forEach(function (key) {
        var i = parseInt(key, 10);
        var choice = mine[key];
        if (!items[i] || typeof choice !== 'number') return;
        if (choice < 0 || choice >= optionCount) return;
        items[i].counts[choice] += 1;
        items[i].total += 1;
        answered = true;
      });
      if (answered) respondents += 1;
    });
    return { items: items, respondents: respondents };
  }

  // responses: [{ id, text, at, hidden }]
  function openResults(responses) {
    var visible = (responses || []).filter(function (r) {
      return !r.hidden;
    });
    return {
      count: visible.length,
      responses: visible.map(function (r) {
        return { id: r.id, text: r.text, at: r.at };
      })
    };
  }

  // Everything a screen needs about answers, keyed by question id.
  // defs: { id: interactionDef }, votes: { id: {...} }, responses: { id: [...] }
  function resultsFor(defs, votes, responses) {
    var out = {};
    Object.keys(defs).forEach(function (id) {
      var def = defs[id];
      if (def.kind === 'choice') {
        out[id] = Object.assign({ kind: 'choice' }, choiceResults(def, (votes || {})[id] || {}));
      } else if (def.kind === 'open') {
        var r = openResults((responses || {})[id] || []);
        out[id] = { kind: 'open', count: r.count, responses: r.responses.slice(-120) };
      }
    });
    return out;
  }

  // Collapse whitespace, strip control characters, cap the length.
  function cleanText(value, max) {
    var t = String(value == null ? '' : value)
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return max && t.length > max ? t.slice(0, max) : t;
  }

  return {
    clamp: clamp,
    hasAnswers: hasAnswers,
    interactionSteps: interactionSteps,
    slideSteps: slideSteps,
    interactionViews: interactionViews,
    initialState: initialState,
    timerNext: timerNext,
    timerView: timerView,
    reduce: reduce,
    choiceResults: choiceResults,
    openResults: openResults,
    resultsFor: resultsFor,
    cleanText: cleanText
  };
});
