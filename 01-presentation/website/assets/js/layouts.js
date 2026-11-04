/*
 * Slide bodies. Each renderer turns one slide's blocks and config into DOM.
 * Returns { body, handles } where handles = [{ def, handle }] for the interactions.
 *
 * Fragments: every top-level list item (and table row when buildRows is set)
 * gets the class "frag", in DOM order. The count must equal slide.fragments,
 * which tests/check verify for every slide.
 */
(function (ns) {
  'use strict';

  var R = ns.render;
  var el = R.el;
  var plainOf = R.plainOf;
  var I = ns.i18n;
  var NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  // Five rising rungs with the top one in the accent colour. Used as the brand mark.
  function ladderMark(cls) {
    var s = svg('svg', { viewBox: '0 0 120 120', 'aria-hidden': 'true', class: 'ladder-mark ' + (cls || '') });
    var heights = [22, 40, 58, 76, 94];
    heights.forEach(function (h, i) {
      var x = 8 + i * 22;
      s.appendChild(svg('rect', {
        x: x, y: 114 - h, width: 16, height: h, rx: 4,
        class: 'rung rung-' + (i + 1)
      }));
    });
    return s;
  }

  // "Module 1 · How AI really works" → "M1"; "ماژول ۱: …" → "ماژول ۱"; "Opening" stays.
  function shortModule(name) {
    var head = String(name).split(/ · |: /)[0];
    var m = /^(?:Module|ماژول)\s*([0-9۰-۹]+)$/.exec(head);
    return m ? I.t('timeline.module', { n: m[1] }) : head;
  }

  // ---- Visuals ----------------------------------------------------------------
  function nextWord(v) {
    var rows = v.candidates.map(function (c) {
      return el('div', { cls: 'nw-row' }, [
        el('span', { cls: 'nw-word', text: c.word }),
        el('span', { cls: 'nw-track' }, [el('span', { cls: 'nw-fill', style: { width: c.pct + '%' } })]),
        el('span', { cls: 'nw-pct', text: I.percent(c.pct) })
      ]);
    });
    return el('div', { cls: 'visual visual-next-word' }, [
      v.label ? el('p', { cls: 'nw-label', text: v.label }) : null,
      el('div', { cls: 'nw-sentence' }, [el('span', { text: v.sentence + ' ' }), el('span', { cls: 'nw-blank', text: '___' })]),
      el('div', { cls: 'nw-list' }, rows),
      v.note ? el('p', { cls: 'nw-note', text: v.note }) : null
    ]);
  }

  function desk(v) {
    return el('div', { cls: 'visual visual-desk' }, [
      el('div', { cls: 'desk desk-set' }, [
        el('p', { cls: 'desk-label', text: v.set }),
        el('div', { cls: 'papers' }, (v.papers || []).map(function (text, i) {
          return el('div', { cls: 'paper p' + (i + 1), text: text });
        }))
      ]),
      el('div', { cls: 'desk desk-empty' }, [
        el('p', { cls: 'desk-label', text: v.empty }),
        el('div', { cls: 'empty-area', text: v.emptyNote })
      ])
    ]);
  }

  function artifact(v) {
    return el('div', { cls: 'visual visual-artifact' }, [
      el('div', { cls: 'chat-bubble', text: v.prompt }),
      el('div', { cls: 'artifact-card' }, [
        el('div', { cls: 'artifact-title', text: v.title }),
        el('ul', { cls: 'artifact-lines' }, (v.lines || []).map(function (line) { return el('li', { text: line }); })),
        v.tag ? el('div', { cls: 'artifact-tag', text: v.tag }) : null
      ])
    ]);
  }

  function timeline(modules) {
    var segs = modules.map(function (m) {
      var width = m.endMin - m.startMin;
      return el('div', {
        cls: 'tl-seg tl-' + m.theme,
        style: { 'flex-grow': String(width) },
        attrs: { title: m.name + I.t('sep') + I.digits(m.start + '–' + m.end) }
      }, [
        width >= 15 ? el('span', { cls: 'tl-label', text: shortModule(m.name) }) : null,
        width >= 15 ? el('span', { cls: 'tl-time', text: I.digits(m.start) }) : null
      ]);
    });
    var first = modules.length ? modules[0].startMin : 0;
    var last = modules.length ? modules[modules.length - 1].endMin : 0;
    var hhmm = function (min) { return Math.floor(min / 60) + ':' + ('0' + (min % 60)).slice(-2); };
    return el('div', { cls: 'visual visual-timeline' }, [
      el('div', { cls: 'tl-track' }, segs),
      el('div', { cls: 'tl-axis' }, [first, Math.round((first + last) / 2), last].map(function (min) {
        return el('span', { text: I.digits(hhmm(min)) });
      }))
    ]);
  }

  function flowSteps(v) {
    var steps = v.steps.map(function (text, i) {
      return el('div', { cls: 'vf-step' }, [el('span', { cls: 'vf-num', text: I.digits(i + 1) }), el('span', { cls: 'vf-text', text: text })]);
    });
    var out = [];
    steps.forEach(function (s, i) {
      out.push(s);
      if (i < steps.length - 1) out.push(el('span', { cls: 'vf-arrow', attrs: { 'aria-hidden': 'true' }, text: '→' }));
    });
    var node = el('div', { cls: 'visual visual-flow' + (v.loop ? ' is-loop' : '') }, [el('div', { cls: 'vf-row' }, out)]);
    if (v.loop && v.loopNote) node.appendChild(el('p', { cls: 'vf-loop', text: '↺ ' + v.loopNote }));
    return node;
  }

  function visualFor(slide) {
    var v = slide.visual;
    if (!v) return null;
    if (v.kind === 'next-word') return { node: nextWord(v), place: 'right' };
    if (v.kind === 'desk') return { node: desk(v), place: 'right' };
    if (v.kind === 'artifact') return { node: artifact(v), place: 'right' };
    if (v.kind === 'timeline') return { node: timeline(ns.deckModules || []), place: 'bottom' };
    if (v.kind === 'flow') return { node: flowSteps(v), place: 'bottom' };
    return null;
  }

  // ---- Interactions -----------------------------------------------------------
  function stepsForLadder(slide) {
    var table = R.firstTable(slide.blocks);
    if (!table) return null;
    return table.rows.map(function (r, i) {
      return {
        level: plainOf(r[0]),
        name: plainOf(r[1]),
        desc: plainOf(r[2]),
        mark: slide.marks && slide.marks[String(i + 1)] ? slide.marks[String(i + 1)] : ''
      };
    });
  }

  function createHandles(slide, skipLadder) {
    return slide.interactions.map(function (def) {
      if (skipLadder && def.kind === 'choice' && def.variant === 'ladder') return null;
      var steps = def.variant === 'ladder' ? stepsForLadder(slide) : null;
      return { def: def, handle: ns.interactions.create(def, { mode: 'screen', steps: steps || undefined }) };
    }).filter(Boolean);
  }

  function placeOf(slide, fallback) {
    return slide.placement || fallback;
  }

  function sideColumn(items) {
    return items.length ? el('div', { cls: 'side' }, items) : null;
  }

  function ixBlock(entries) {
    if (!entries.length) return null;
    return el('div', { cls: 'ix-stack' + (entries.length > 1 ? ' is-multi' : '') }, entries.map(function (e) { return e.handle.el; }));
  }

  // ---- Frag-aware helpers ---------------------------------------------------
  function ordinal() {
    return { i: 0 };
  }

  // Splits a list item into a lead heading and the rest, but only when the item
  // starts with a bold label ("Facts:", "Fluent ≠ correct."). Bold words that run
  // on into the sentence ("**You** are accountable") stay inline.
  function leadOf(item, splitHeadings) {
    var spans = item.c;
    var first = spans[0];
    if (first && first.k === 'strong' && /[:.?!]\s*$/.test(plainOf(first.c))) {
      var label = plainOf(first.c).replace(/:\s*$/, '');
      return { lead: [{ k: 'text', v: label }], rest: spans.slice(1).map(function (s, i) {
        if (i === 0 && s.k === 'text') return { k: 'text', v: s.v.replace(/^[\s:–-]+/, '') };
        return s;
      }) };
    }
    if (splitHeadings) {
      var text = plainOf(spans);
      var cut = text.indexOf(':');
      if (cut > 0 && cut < 40) {
        var head = text.slice(0, cut);
        var tail = text.slice(cut + 1).trim();
        return { lead: [{ k: 'text', v: head }], rest: [{ k: 'text', v: tail }] };
      }
    }
    return { lead: null, rest: spans };
  }

  function cardFromItem(item, index, ordered, frag, splitHeadings) {
    var parts = leadOf(item, splitHeadings);
    var badge = null;
    if (item.checked !== null && item.checked !== undefined) {
      badge = el('span', { cls: 'card-check' + (item.checked ? ' is-checked' : ''), attrs: { 'aria-hidden': 'true' }, text: item.checked ? '✓' : '' });
    } else if (ordered) {
      badge = el('span', { cls: 'card-num', text: I.digits(index) });
    } else {
      badge = el('span', { cls: 'card-dot', attrs: { 'aria-hidden': 'true' } });
    }
    var body = el('div', { cls: 'card-body' }, [
      parts.lead ? el('div', { cls: 'card-lead' }, [R.inline(parts.lead)]) : null,
      el('div', { cls: 'card-text' }, [R.inline(parts.rest)]),
      item.children && item.children.length
        ? el('div', { cls: 'card-children' }, R.blocks(item.children, { frag: false }))
        : null
    ]);
    return el('div', { cls: 'card' + (frag ? ' frag' : '') }, [badge, body]);
  }

  function cardFromRow(row, head, frag) {
    var lead = row[0];
    var lines = [];
    for (var c = 1; c < row.length; c += 1) {
      lines.push(el('div', { cls: 'kv' }, [
        el('span', { cls: 'k', text: plainOf(head[c] || []) }),
        el('span', { cls: 'v' }, [R.inline(row[c])])
      ]));
    }
    return el('div', { cls: 'card card-row' + (frag ? ' frag' : '') }, [
      el('div', { cls: 'card-body' }, [
        el('div', { cls: 'card-lead' }, [R.inline(lead)]),
        el('div', { cls: 'card-lines' }, lines)
      ])
    ]);
  }

  function gridCols(n) {
    if (n <= 3) return n;
    if (n === 4) return 2;
    if (n === 5 || n === 6) return 3;
    return 4;
  }

  // ---- Layouts ----------------------------------------------------------------
  function title(slide) {
    var first = R.topLists(slide.blocks)[0];
    var lines = first
      ? first.items.map(function (it) { return it.c; })
      : slide.blocks.filter(function (b) { return b.t === 'p'; }).map(function (b) { return b.c; });
    var mark = slide.visual && slide.visual.kind === 'ladder-mark' ? ladderMark('cover-mark') : null;
    var body = el('div', { cls: 'cover' }, [
      mark,
      el('div', { cls: 'cover-copy' }, [
        el('h1', { cls: 'cover-title' }, [R.inline(lines[0] || [])]),
        el('p', { cls: 'cover-sub' }, [R.inline(lines[1] || [])]),
        el('p', { cls: 'cover-meta' }, [R.inline(lines[2] || [])]),
        el('div', { cls: 'cover-join', attrs: { 'data-role': 'join' } })
      ])
    ]);
    return { body: body, handles: [] };
  }

  function section(slide) {
    var handles = createHandles(slide, false);
    var ord = ordinal();
    var seenTable = false;
    var lead = [];
    var foot = [];
    var middle = [];
    var table = R.firstTable(slide.blocks);
    var split = !!(slide.revealWithAnswers && table && handles.length);
    slide.blocks.forEach(function (b) {
      if (b.t === 'table') seenTable = true;
      if (b.t === 'p') {
        (seenTable ? foot : lead).push(el('p', { cls: seenTable || lead.length ? 'lead-small' : 'lead-main' }, [R.inline(b.c)]));
        return;
      }
      if (b.t === 'table') {
        if (split) {
          // The answer key is shown stacked beside the poll once the answers are revealed.
          var key = columnsFromTable(slide, b);
          key.classList.add('is-stacked');
          middle.push(el('div', { cls: 'reveal-table' }, [key]));
        } else {
          middle.push(el('div', { cls: slide.revealWithAnswers ? 'reveal-table' : 'reveal-always' }, [R.table(b)]));
        }
        return;
      }
      R.blocks([b], { frag: slide.builds, styles: slide.listStyles, ord: ord }).forEach(function (n) { middle.push(n); });
    });
    var icon = slide.visual && slide.visual.kind === 'ladder-mark' ? ladderMark('section-mark') : null;
    var ix = ixBlock(handles);
    var main = el('div', { cls: 'section-main' }, [ix ? el('div', { cls: 'section-ix' }, [ix]) : null]);
    var extra = middle.length ? el('div', { cls: 'section-extra' }, middle) : null;
    var body = el('div', { cls: 'section' + (icon ? ' has-mark' : '') + (split ? ' is-split' : '') }, [
      icon,
      el('div', { cls: 'section-lead' }, lead),
      split ? el('div', { cls: 'section-split' }, [main, extra]) : main,
      split ? null : extra,
      foot.length ? el('div', { cls: 'section-foot' }, foot) : null
    ]);
    return { body: body, handles: handles };
  }

  function stack(slide) {
    var handles = createHandles(slide, false);
    var ord = ordinal();
    var nodes = R.blocks(slide.blocks, { frag: slide.builds, styles: slide.listStyles, ord: ord });
    if (slide.callout) {
      var last = nodes[nodes.length - 1];
      if (last && last.tagName === 'P') last.classList.add('callout');
    }
    var main = el('div', { cls: 'stack-main' }, nodes);
    var visual = visualFor(slide);
    var sideItems = [];
    var footItems = [];
    var place = placeOf(slide, 'right');
    handles.forEach(function (e) {
      if (place === 'right') sideItems.push(e.handle.el);
      else footItems.push(e.handle.el);
    });
    if (visual && visual.place === 'right') sideItems.unshift(visual.node);
    if (visual && visual.place === 'bottom') footItems.push(visual.node);
    var body = el('div', { cls: 'stack' + (sideItems.length ? ' has-side' : '') }, [
      main,
      sideItems.length ? el('div', { cls: 'side' }, sideItems) : null
    ]);
    if (footItems.length) body.appendChild(el('div', { cls: 'foot-row' }, footItems));
    return { body: body, handles: handles };
  }

  function cards(slide) {
    var handles = createHandles(slide, false);
    var intro = [];
    var outro = [];
    var grid = [];
    var started = false;
    var count = 0;
    var ord = ordinal();
    var table = R.firstTable(slide.blocks);
    slide.blocks.forEach(function (b) {
      if (b.t === 'p') {
        (started ? outro : intro).push(el('p', { cls: started ? 'outro' : 'intro' }, [R.inline(b.c)]));
        return;
      }
      if (b.t === 'ul' || b.t === 'ol') {
        started = true;
        var ordered = b.t === 'ol';
        b.items.forEach(function (it, i) {
          count += 1;
          grid.push(cardFromItem(it, ordered ? b.start + i : i + 1, ordered, slide.builds, false));
        });
        ord.i += 1;
        return;
      }
      if (b.t === 'table') {
        started = true;
        var head = b.head;
        b.rows.forEach(function (row) {
          count += 1;
          grid.push(cardFromRow(row, head, slide.buildRows));
        });
        return;
      }
      if (b.t === 'quote') {
        (started ? outro : intro).push(R.blocks([b], { frag: false })[0]);
      }
    });
    var cols = gridCols(grid.length);
    var body = el('div', { cls: 'cards-wrap' }, [
      intro.length ? el('div', { cls: 'intro-block' }, intro) : null,
      el('div', { cls: 'card-grid', style: { '--cols': String(cols) } }, grid),
      outro.length ? el('div', { cls: 'outro-block' }, outro) : null
    ]);
    var place = placeOf(slide, 'bottom');
    var side = [];
    var foot = [];
    handles.forEach(function (e) { (place === 'right' ? side : foot).push(e.handle.el); });
    var wrapped = el('div', { cls: 'cards' + (side.length ? ' has-side' : '') }, [
      el('div', { cls: 'cards-main' }, [body]),
      side.length ? el('div', { cls: 'side' }, side) : null
    ]);
    if (foot.length) wrapped.appendChild(el('div', { cls: 'foot-row' }, foot));
    return { body: wrapped, handles: handles };
  }

  function columnsFromTable(slide, table) {
    var n = table.head.length;
    var tones = slide.tones || [];
    var cols = table.head.map(function (h, j) {
      var tone = tones[j] || 'indigo';
      var items = table.rows.map(function (row) {
        var mark = tone === 'green' ? '✓' : tone === 'red' ? '✗' : '•';
        return el('li', { cls: 'col-item' }, [
          el('span', { cls: 'col-mark', attrs: { 'aria-hidden': 'true' }, text: mark }),
          el('span', { cls: 'col-text' }, [R.inline(row[j] || [])])
        ]);
      });
      return el('div', { cls: 'col tone-' + tone }, [
        el('h3', { cls: 'col-head' }, [R.inline(h)]),
        el('ul', { cls: 'col-list' }, items)
      ]);
    });
    var children = [];
    cols.forEach(function (c, j) {
      if (j === 1 && slide.divider === 'jagged') children.push(el('div', { cls: 'divider', attrs: { 'aria-hidden': 'true' } }, [zigzag()]));
      children.push(c);
    });
    return el('div', { cls: 'cols cols-' + n + (slide.divider ? ' has-divider' : '') }, children);
  }

  function zigzag() {
    var s = svg('svg', { viewBox: '0 0 40 400', preserveAspectRatio: 'none', class: 'zigzag' });
    var pts = [];
    for (var y = 0; y <= 400; y += 20) pts.push((y / 20) % 2 === 0 ? '6,' + y : '34,' + y);
    s.appendChild(svg('polyline', { points: pts.join(' '), fill: 'none' }));
    return s;
  }

  function columnsFromList(slide, list, restLists) {
    var n = slide.columns || 2;
    var first = list.items.slice(0, n);
    var rest = list.items.slice(n);
    var colEls = first.map(function (it, i) {
      var parts = leadOf(it, slide.splitHeadings);
      var tone = (slide.tones || [])[i] || ['indigo', 'teal', 'violet', 'sky'][i % 4];
      return el('div', { cls: 'col column-card tone-' + tone + (slide.builds ? ' frag' : '') }, [
        el('h3', { cls: 'col-head' }, [parts.lead ? R.inline(parts.lead) : el('span', { text: I.t('col.option', { n: i + 1 }) })]),
        el('div', { cls: 'col-text' }, [R.inline(parts.rest)])
      ]);
    });
    var restEl = rest.length
      ? R.list({ t: 'ul', start: 1, items: rest }, { frag: slide.builds, styles: [] })
      : null;
    return { cols: colEls, rest: restEl, restLists: restLists };
  }

  function columns(slide) {
    var handles = createHandles(slide, false);
    var table = R.firstTable(slide.blocks);
    var mainList = table ? null : R.topLists(slide.blocks)[0] || null;
    var ord = ordinal();
    var intro = [];
    var below = [];
    var body = null;
    var restEl = null;
    if (table) {
      body = columnsFromTable(slide, table);
    } else if (mainList) {
      var built = columnsFromList(slide, mainList, []);
      body = el('div', { cls: 'cols cols-' + built.cols.length }, built.cols);
      restEl = built.rest;
    }
    var placed = false;
    slide.blocks.forEach(function (b) {
      if (b === table || b === mainList) {
        placed = true;
        if (restEl) below.push(restEl);
        return;
      }
      if (b.t === 'p') {
        (placed ? below : intro).push(el('p', { cls: placed ? 'after-note' : 'intro' }, [R.inline(b.c)]));
      } else if (b.t === 'ul' || b.t === 'ol') {
        below.push(R.list(b, { frag: slide.builds, styles: slide.listStyles, ord: ord }));
      } else if (b.t === 'table') {
        below.push(R.table(b));
      } else if (b.t === 'quote') {
        below.push(R.blocks([b], { frag: false })[0]);
      }
    });
    var visual = visualFor(slide);
    var foot = handles.map(function (e) { return e.handle.el; });
    if (visual && visual.place === 'bottom') foot.push(visual.node);
    var columnsEl = el('div', { cls: 'columns' }, [
      intro.length ? el('div', { cls: 'intro-block' }, intro) : null,
      body,
      below.length ? el('div', { cls: 'below-block' }, below) : null,
      foot.length ? el('div', { cls: 'foot-row' }, foot) : null
    ]);
    return { body: columnsEl, handles: handles };
  }

  function ladder(slide) {
    var handles = createHandles(slide, false);
    var steps = stepsForLadder(slide) || [];
    var interactive = handles.length ? handles[0] : null;
    var staticSteps = el('div', { cls: 'lp-steps' }, steps.map(function (s, i) {
      return el('div', { cls: 'lp-step' }, [
        el('div', { cls: 'lp-level', text: s.level }),
        el('div', { cls: 'lp-name', text: s.name }),
        el('div', { cls: 'lp-desc', text: s.desc }),
        s.mark ? el('div', { cls: 'lp-mark', text: s.mark }) : null
      ]);
    }));
    var nodes = [];
    slide.blocks.forEach(function (b) {
      if (b.t === 'p') nodes.push(el('p', { cls: 'goal-line' }, [R.inline(b.c)]));
    });
    var body = el('div', { cls: 'ladder' }, [
      interactive ? interactive.handle.el : staticSteps,
      nodes.length ? el('div', { cls: 'ladder-foot' }, nodes) : null
    ]);
    return { body: body, handles: interactive ? [interactive] : [] };
  }

  function flow(slide) {
    var handles = createHandles(slide, false);
    var table = R.firstTable(slide.blocks);
    var cols = slide.flowCols || { title: 1, who: 2, detail: 3 };
    var intro = [];
    slide.blocks.forEach(function (b) {
      if (b.t === 'p') intro.push(el('p', { cls: 'flow-intro' }, [R.inline(b.c)]));
    });
    // Tones come from the config (flowTones) so they do not depend on the language.
    var tone = function (who, i) {
      if (slide.flowTones && slide.flowTones[i]) return slide.flowTones[i];
      if (/^AI does/i.test(who)) return 'green';
      if (/draft/i.test(who)) return 'amber';
      return 'grey';
    };
    var steps = table ? table.rows.map(function (row, i) {
      var who = plainOf(row[cols.who] || []);
      return el('div', { cls: 'flow-step tone-' + tone(who, i) + (slide.buildRows ? ' frag' : '') }, [
        el('div', { cls: 'flow-num', text: plainOf(row[0] || []) }),
        el('div', { cls: 'flow-title' }, [R.inline(row[cols.title] || [])]),
        el('div', { cls: 'flow-who', text: who }),
        el('div', { cls: 'flow-detail' }, [R.inline(row[cols.detail] || [])])
      ]);
    }) : [];
    var legend = el('div', { cls: 'flow-legend' }, [
      el('span', { cls: 'lg tone-green', text: I.t('flow.green') }),
      el('span', { cls: 'lg tone-amber', text: I.t('flow.amber') }),
      el('span', { cls: 'lg tone-grey', text: I.t('flow.grey') })
    ]);
    var foot = handles.map(function (e) { return e.handle.el; });
    var body = el('div', { cls: 'flow' }, [
      intro.length ? el('div', { cls: 'intro-block' }, intro) : null,
      el('div', { cls: 'flow-row' }, steps),
      legend,
      foot.length ? el('div', { cls: 'foot-row' }, foot) : null
    ]);
    return { body: body, handles: handles };
  }

  function pairs(slide) {
    var handles = createHandles(slide, false);
    var lines = [];
    slide.blocks.forEach(function (b) {
      if (b.t === 'p') R.splitLines(b.c).forEach(function (spans) { lines.push({ kind: 'line', spans: spans }); });
      else if (b.t === 'quote') lines.push({ kind: 'quote', block: b });
      else lines.push({ kind: 'other', block: b });
    });
    var groups = {};
    var order = [];
    var other = [];
    for (var i = 0; i < lines.length; i += 1) {
      var ln = lines[i];
      var first = ln.kind === 'line' ? ln.spans[0] : null;
      var label = first && first.k === 'strong' ? plainOf(first.c) : '';
      var m = /^(.*?)[\s,،]*(before|after|قبل|بعد)\s*[:：]?\s*$/i.exec(label);
      if (!m) {
        if (ln.kind === 'line') other.push(el('p', { cls: 'intro' }, [R.inline(ln.spans)]));
        else if (ln.kind === 'other') R.blocks([ln.block], { frag: slide.builds }).forEach(function (n) { other.push(n); });
        continue;
      }
      var group = m[1].replace(/[\s,،:-]+$/, '').trim();
      var side = /^(after|بعد)$/i.test(m[2]) ? 'after' : 'before';
      if (!groups[group]) {
        groups[group] = { name: group, before: null, after: null };
        order.push(group);
      }
      var rest = ln.spans.slice(1);
      var hasRest = rest.some(function (s) { return s.k !== 'text' || s.v.trim() !== ''; });
      if (hasRest) {
        groups[group][side] = { spans: rest.map(function (s, idx) {
          if (idx === 0 && s.k === 'text') return { k: 'text', v: s.v.replace(/^\s+/, '') };
          return s;
        }) };
      } else if (lines[i + 1] && lines[i + 1].kind === 'quote') {
        groups[group][side] = { block: lines[i + 1].block };
        i += 1;
      }
    }
    var rows = order.map(function (name) {
      var g = groups[name];
      function content(c) {
        if (!c) return el('p', { cls: 'pair-empty', text: '—' });
        if (c.block) return el('div', { cls: 'pair-quote' }, R.blocks([c.block], { frag: false }));
        return el('p', { cls: 'pair-text' }, [R.inline(c.spans)]);
      }
      return el('div', { cls: 'pair-row' }, [
        name ? el('h3', { cls: 'pair-name', text: name }) : null,
        el('div', { cls: 'pair-cols' }, [
          el('div', { cls: 'pair-card is-before' }, [el('span', { cls: 'pair-tag', text: I.t('pairs.before') }), content(g.before)]),
          el('div', { cls: 'pair-card is-after' }, [el('span', { cls: 'pair-tag', text: I.t('pairs.after') }), content(g.after)])
        ])
      ]);
    });
    var side = handles.map(function (e) { return e.handle.el; });
    var body = el('div', { cls: 'pairs' }, [
      other.length ? el('div', { cls: 'intro-block' }, other) : null,
      el('div', { cls: 'pair-rows' }, rows),
      side.length ? el('div', { cls: 'foot-row' }, side) : null
    ]);
    return { body: body, handles: handles };
  }

  var LAYOUTS = {
    title: title,
    section: section,
    stack: stack,
    cards: cards,
    columns: columns,
    ladder: ladder,
    flow: flow,
    pairs: pairs
  };

  function render(slide) {
    var fn = LAYOUTS[slide.layout] || stack;
    return fn(slide);
  }

  ns.layouts = {
    render: render,
    ladderMark: ladderMark,
    shortModule: shortModule
  };
})(window.AIPro = window.AIPro || {});
