#!/usr/bin/env node
'use strict';
/*
 * Builds data/deck.json and data/deck.js from ../presentation-draft.md and
 * content/site-config.js. Zero dependencies.
 *
 *   node tools/build-deck.js     write the two data files
 *   node tools/check-deck.js     fail if the committed files are out of date
 *
 * The draft stays the single source of content. The config only adds how a
 * slide is laid out and which audience interactions it has.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WEB = path.resolve(__dirname, '..');
const DRAFT = path.resolve(WEB, '..', 'presentation-draft.md');
const CONFIG = path.join(WEB, 'content', 'site-config.js');
const OUT_JSON = path.join(WEB, 'data', 'deck.json');
const OUT_JS = path.join(WEB, 'data', 'deck.js');
const core = require(path.join(WEB, 'assets', 'js', 'core.js'));

const LAYOUTS = ['title', 'section', 'stack', 'cards', 'columns', 'ladder', 'flow', 'pairs'];
const PLACEMENTS = ['right', 'bottom', 'full', 'embedded'];
const VISUALS = ['ladder-mark', 'next-word', 'desk', 'artifact', 'timeline', 'flow'];
const LIST_STYLES = ['bullets', 'steps', 'cards', 'checklist', 'chips'];
const TONES = ['green', 'amber', 'red', 'grey', 'indigo', 'teal', 'rose'];
const KINDS = ['choice', 'open', 'timer'];
const SLIDE_KEYS = [
  'layout', 'placement', 'visual', 'listAs', 'columns', 'tones', 'divider', 'buildRows',
  'build', 'revealWithAnswers', 'callout', 'splitHeadings', 'flowCols', 'marks', 'interactions'
];
const EXPECTED_SLIDES = 61;

// ---------------------------------------------------------------------------
// Inline markdown: **strong**, *em*, `code`, [text](url), line breaks.
// ---------------------------------------------------------------------------
function parseInline(src) {
  const out = [];
  let buf = '';
  const flush = () => {
    if (buf) {
      out.push({ k: 'text', v: buf });
      buf = '';
    }
  };
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '`') {
      const j = src.indexOf('`', i + 1);
      if (j > i) {
        flush();
        out.push({ k: 'code', v: src.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
    }
    if (ch === '*' && src[i + 1] === '*') {
      const j = src.indexOf('**', i + 2);
      if (j > i + 2) {
        flush();
        out.push({ k: 'strong', c: parseInline(src.slice(i + 2, j)) });
        i = j + 2;
        continue;
      }
    }
    if (ch === '*' && src[i + 1] !== '*' && src[i + 1] !== ' ' && src[i + 1] !== undefined) {
      const j = src.indexOf('*', i + 1);
      if (j > i + 1 && src[j + 1] !== '*') {
        flush();
        out.push({ k: 'em', c: parseInline(src.slice(i + 1, j)) });
        i = j + 1;
        continue;
      }
    }
    if (ch === '[') {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(src.slice(i));
      if (m) {
        flush();
        out.push({ k: 'a', href: m[2], c: parseInline(m[1]) });
        i += m[0].length;
        continue;
      }
    }
    if (ch === '\n') {
      flush();
      out.push({ k: 'br' });
      i += 1;
      continue;
    }
    buf += ch;
    i += 1;
  }
  flush();
  return out;
}

function plain(spans) {
  return spans
    .map((s) => {
      if (s.k === 'text' || s.k === 'code') return s.v;
      if (s.k === 'br') return ' ';
      return plain(s.c);
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Block markdown: paragraphs, lists (nested), tables, blockquotes.
// Blocks: {t:'p', c}, {t:'ul'|'ol', start, items:[{c, checked, children}]},
//         {t:'table', head:[cell], rows:[[cell]]}, {t:'quote', c:[blocks]}
// ---------------------------------------------------------------------------
const RE_LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_QUOTE = /^\s*>\s?(.*)$/;
const RE_TABLE_SEP = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

const isBlank = (s) => s.trim() === '';
const indentOf = (s) => s.length - s.replace(/^\s+/, '').length;

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((cell) => cell.trim());
}

function isTableStart(lines, i) {
  return (
    i + 1 < lines.length &&
    /^\s*\|/.test(lines[i]) &&
    /-/.test(lines[i + 1]) &&
    RE_TABLE_SEP.test(lines[i + 1])
  );
}

function startsBlock(lines, i) {
  return RE_LIST.test(lines[i]) || RE_QUOTE.test(lines[i]) || isTableStart(lines, i);
}

function parseBlocks(lines) {
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      i += 1;
      continue;
    }

    if (isTableStart(lines, i)) {
      const head = splitRow(line).map(parseInline);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(splitRow(lines[i]).map(parseInline));
        i += 1;
      }
      blocks.push({ t: 'table', head, rows });
      continue;
    }

    if (RE_QUOTE.test(line)) {
      const inner = [];
      while (i < lines.length && RE_QUOTE.test(lines[i])) {
        inner.push(RE_QUOTE.exec(lines[i])[1]);
        i += 1;
      }
      blocks.push({ t: 'quote', c: parseBlocks(inner) });
      continue;
    }

    const lm = RE_LIST.exec(line);
    if (lm) {
      const ordered = /\d/.test(lm[2]);
      const baseIndent = lm[1].length;
      const start = ordered ? parseInt(lm[2], 10) : 1;
      const items = [];
      while (i < lines.length) {
        // Blank lines are allowed between items of the same list.
        let j = i;
        while (j < lines.length && isBlank(lines[j])) j += 1;
        const m = j < lines.length ? RE_LIST.exec(lines[j]) : null;
        if (!m || m[1].length !== baseIndent || /\d/.test(m[2]) !== ordered) break;
        i = j + 1;

        let text = m[3];
        let checked = null;
        const cm = /^\[( |x|X)\]\s+(.*)$/.exec(text);
        if (cm) {
          checked = cm[1].toLowerCase() === 'x';
          text = cm[2];
        }
        const contentIndent = m[0].length - m[3].length;

        const child = [];
        while (i < lines.length) {
          const l = lines[i];
          if (isBlank(l)) {
            let k = i;
            while (k < lines.length && isBlank(lines[k])) k += 1;
            if (k < lines.length && indentOf(lines[k]) > baseIndent) {
              for (; i < k; i += 1) child.push('');
              continue;
            }
            break;
          }
          if (indentOf(l) > baseIndent) {
            child.push(l.slice(Math.min(indentOf(l), contentIndent)));
            i += 1;
            continue;
          }
          break;
        }
        items.push({ c: parseInline(text), checked, children: parseBlocks(child) });
      }
      blocks.push({ t: ordered ? 'ol' : 'ul', start, items });
      continue;
    }

    // Paragraph: consecutive lines that do not start another block.
    // Single newlines are kept as line breaks, because the draft means them.
    const para = [];
    while (i < lines.length && !isBlank(lines[i]) && !startsBlock(lines, i)) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ t: 'p', c: parseInline(para.join('\n')) });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Draft structure
// ---------------------------------------------------------------------------
function parseTimeRange(text) {
  const m = /^\s*(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*$/.exec(text || '');
  if (!m) throw new Error(`Bad time range: "${text}"`);
  return { start: m[1], end: m[2], startMin: toMinutes(m[1]), endMin: toMinutes(m[2]) };
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}

function parseSlideRange(text) {
  const m = /^\s*(\d+)(?:\s*[–-]\s*(\d+))?\s*$/.exec(text || '');
  if (!m) throw new Error(`Bad slide range: "${text}"`);
  return { from: parseInt(m[1], 10), to: parseInt(m[2] || m[1], 10) };
}

function themeOf(name) {
  if (/^Opening/i.test(name)) return 'opening';
  const m = /^Module (\d+)/i.exec(name);
  if (m) return `m${m[1]}`;
  if (/^Break/i.test(name)) return 'break';
  if (/^Close/i.test(name)) return 'close';
  return 'other';
}

function parseDraft(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');

  const h1 = lines.find((l) => /^# /.test(l)) || '';
  const title = h1.replace(/^# /, '').replace(/\s*—\s*Presentation Draft\s*$/, '').trim();
  const subtitleLine = lines.find((l) => /^\*[^*].*[^*]\*$/.test(l)) || '';
  const subtitle = subtitleLine.replace(/^\*|\*$/g, '').trim();

  const smIdx = lines.findIndex((l) => /^## Session map\s*$/.test(l));
  if (smIdx < 0) throw new Error('"## Session map" not found in the draft');
  let k = smIdx + 1;
  while (k < lines.length && !/^\|/.test(lines[k])) k += 1;
  k += 2; // header row and separator row
  const sessionRows = [];
  for (; k < lines.length && /^\|/.test(lines[k]); k += 1) {
    sessionRows.push(splitRow(lines[k]));
  }

  const modules = sessionRows.map((row, index) => {
    const [block, time, slideRange, goal] = row;
    const t = parseTimeRange(time);
    const r = parseSlideRange(slideRange);
    const name = plain(parseInline(block)).replace(' — ', ' · ');
    return {
      index,
      name,
      theme: themeOf(name),
      start: t.start,
      end: t.end,
      startMin: t.startMin,
      endMin: t.endMin,
      from: r.from,
      to: r.to,
      goal: plain(parseInline(goal || ''))
    };
  });

  const raw = [];
  let cur = null;
  for (const line of lines) {
    const h = /^## Slide (\d+) — (.+)$/.exec(line);
    if (h) {
      cur = { n: parseInt(h[1], 10), title: h[2].trim(), body: [] };
      raw.push(cur);
      continue;
    }
    if (/^#{1,2} /.test(line)) {
      cur = null;
      continue;
    }
    if (cur) cur.body.push(line);
  }

  return { title, subtitle, modules, slides: raw };
}

function parseSlideBody(body) {
  const sec = { onSlide: [], visual: [], notes: [] };
  let meta = null;
  let current = null;
  for (const line of body) {
    const mm = /^\*\*Time:\*\*\s*(.+?)\s*·\s*\*\*Type:\*\*\s*(.+?)\s*$/.exec(line);
    if (mm) {
      meta = { time: mm[1], type: mm[2] };
      current = null;
      continue;
    }
    const lab = /^\*\*(On slide|Visual|Speaker notes):\*\*\s*(.*)$/.exec(line);
    if (lab) {
      current = lab[1] === 'On slide' ? 'onSlide' : lab[1] === 'Visual' ? 'visual' : 'notes';
      if (lab[2].trim()) sec[current].push(lab[2]);
      continue;
    }
    if (current && line.trim() !== '---') sec[current].push(line);
  }
  if (!meta) throw new Error('slide has no Time/Type line');
  return {
    meta,
    onSlide: parseBlocks(sec.onSlide),
    notes: parseBlocks(sec.notes),
    visual: plain(parseInline(sec.visual.filter((l) => !isBlank(l)).join(' ')))
  };
}

// ---------------------------------------------------------------------------
// Interactions and fragments
// ---------------------------------------------------------------------------
function topLevelLists(blocks) {
  return blocks.filter((b) => b.t === 'ul' || b.t === 'ol');
}

function firstTable(blocks) {
  return blocks.find((b) => b.t === 'table') || null;
}

function fail(n, msg) {
  throw new Error(`slide ${n}: ${msg}`);
}

function normaliseInteraction(n, def, blocks, ids) {
  if (!def || typeof def !== 'object') fail(n, 'interaction must be an object');
  if (!def.id || typeof def.id !== 'string') fail(n, 'interaction needs an id');
  if (ids.has(def.id)) fail(n, `duplicate interaction id "${def.id}"`);
  ids.add(def.id);
  if (!KINDS.includes(def.kind)) fail(n, `unknown interaction kind "${def.kind}"`);

  if (def.kind === 'timer') {
    if (!(def.durationSec > 0)) fail(n, `timer "${def.id}" needs durationSec > 0`);
    return {
      id: def.id,
      kind: 'timer',
      label: def.label || 'Timer',
      durationMs: Math.round(def.durationSec * 1000),
      cues: (def.cues || []).map((c) => ({ atMs: Math.round(c.atSec * 1000), text: c.text }))
    };
  }

  if (def.kind === 'open') {
    if (!def.prompt) fail(n, `open question "${def.id}" needs a prompt`);
    return {
      id: def.id,
      kind: 'open',
      prompt: def.prompt,
      display: def.display === 'cloud' ? 'cloud' : 'wall',
      maxLength: def.maxLength || 200,
      placeholder: def.placeholder || 'Type your answer'
    };
  }

  // choice
  if (!Array.isArray(def.options) || def.options.length < 2 || def.options.length > 6) {
    fail(n, `choice "${def.id}" needs 2 to 6 options`);
  }
  let items;
  if (def.items === 'list') {
    const list = topLevelLists(blocks)[0];
    if (!list) fail(n, `choice "${def.id}" wants items from a list, but the slide has none`);
    items = list.items.map((it) => ({ text: plain(it.c) }));
    blocks.splice(blocks.indexOf(list), 1);
  } else if (def.items === 'table:0') {
    const table = firstTable(blocks);
    if (!table) fail(n, `choice "${def.id}" wants items from a table, but the slide has none`);
    items = table.rows.map((r) => ({ text: plain(r[0]) }));
  } else if (Array.isArray(def.items)) {
    items = def.items.map((it) => (typeof it === 'string' ? { text: it } : { text: it.text, answer: it.answer }));
  } else {
    fail(n, `choice "${def.id}" needs items`);
  }
  if (items.length < 1) fail(n, `choice "${def.id}" has no items`);
  items.forEach((it, i) => {
    if (typeof it.answer === 'number' && (it.answer < 0 || it.answer >= def.options.length)) {
      fail(n, `choice "${def.id}" item ${i + 1} answer is out of range`);
    }
    if (it.answer === undefined) delete it.answer;
  });
  return {
    id: def.id,
    kind: 'choice',
    question: def.question || '',
    options: def.options.map(String),
    items,
    progressive: !!def.progressive,
    variant: def.variant === 'ladder' ? 'ladder' : 'bars',
    explain: def.explain || ''
  };
}

// Plain text of a block tree, one line per block, for scanning.
function blocksText(blocks) {
  return blocks
    .map((b) => {
      if (b.t === 'p') return plain(b.c);
      if (b.t === 'ul' || b.t === 'ol') {
        return b.items.map((it) => [plain(it.c), blocksText(it.children)].join('\n')).join('\n');
      }
      if (b.t === 'table') return [b.head, ...b.rows].map((r) => r.map(plain).join(' | ')).join('\n');
      if (b.t === 'quote') return blocksText(b.c);
      return '';
    })
    .join('\n');
}

function countFragments(cfg, blocks) {
  if (cfg.build === false) return 0;
  const listItems = topLevelLists(blocks).reduce((sum, l) => sum + l.items.length, 0);
  const table = firstTable(blocks);
  const rows = cfg.buildRows && table ? table.rows.length : 0;
  return listItems + rows;
}

// ---------------------------------------------------------------------------
// Assembly and validation
// ---------------------------------------------------------------------------
function assertKnown(n, cfg) {
  Object.keys(cfg).forEach((key) => {
    if (!SLIDE_KEYS.includes(key)) fail(n, `unknown config key "${key}"`);
  });
  if (cfg.layout && !LAYOUTS.includes(cfg.layout)) fail(n, `unknown layout "${cfg.layout}"`);
  if (cfg.placement && !PLACEMENTS.includes(cfg.placement)) fail(n, `unknown placement "${cfg.placement}"`);
  if (cfg.visual && !VISUALS.includes(cfg.visual.kind || cfg.visual)) {
    fail(n, `unknown visual "${cfg.visual.kind || cfg.visual}"`);
  }
  (Array.isArray(cfg.listAs) ? cfg.listAs : [cfg.listAs]).forEach((style) => {
    if (style && !LIST_STYLES.includes(style)) fail(n, `unknown list style "${style}"`);
  });
  (cfg.tones || []).forEach((t) => {
    if (!TONES.includes(t)) fail(n, `unknown tone "${t}"`);
  });
  if (cfg.buildRows && !['cards', 'flow', 'ladder'].includes(cfg.layout)) {
    fail(n, 'buildRows only applies to the cards, flow and ladder layouts');
  }
}

function listStylesFor(cfg, count) {
  const given = cfg.listAs;
  const styles = [];
  for (let i = 0; i < count; i += 1) {
    if (Array.isArray(given)) styles.push(given[i] || 'bullets');
    else styles.push(given || 'bullets');
  }
  return styles;
}

function buildSlide(s, modules, configSlides, ids, timers) {
  const cfg = configSlides[s.n] || {};
  assertKnown(s.n, cfg);

  const body = parseSlideBody(s.body);
  const blocks = body.onSlide;
  const mod = modules.find((m) => s.n >= m.from && s.n <= m.to);
  if (!mod) fail(s.n, 'not covered by the session map');
  const time = parseTimeRange(body.meta.time);

  const typeMatch = /^(.*?)\s*\((.+)\)\s*$/.exec(body.meta.type);
  const type = typeMatch ? typeMatch[1].trim() : body.meta.type.trim();
  const typeDetail = typeMatch ? typeMatch[2].trim() : '';

  const interactions = (cfg.interactions || []).map((def) => {
    const norm = normaliseInteraction(s.n, def, blocks, ids);
    if (norm.kind === 'timer') {
      if (timers[norm.id]) fail(s.n, `duplicate timer "${norm.id}"`);
      timers[norm.id] = { durationMs: norm.durationMs, label: norm.label, slide: s.n };
    }
    return norm;
  });

  const listCount = topLevelLists(blocks).length;
  const fragments = countFragments(cfg, blocks);
  const steps = interactions.reduce((sum, it) => sum + core.interactionSteps(it), fragments);

  // Bracketed fill-ins such as [Presenter name] or [date], listed for the presenter.
  const placeholders = [];
  const fillIn = /\[[^\[\]]{2,60}\]/g;
  const text = blocksText(blocks) + '\n' + blocksText(body.notes);
  (text.match(fillIn) || []).forEach((token) => {
    if (token !== '[ASSUMPTION]' && !placeholders.includes(token)) placeholders.push(token);
  });

  return {
    n: s.n,
    index: s.n - 1,
    title: s.title,
    module: mod.index,
    moduleName: mod.name,
    theme: mod.theme,
    time: { start: time.start, end: time.end, startMin: time.startMin, endMin: time.endMin },
    type,
    typeDetail,
    layout: cfg.layout || 'stack',
    placement: cfg.placement || null,
    visual: cfg.visual ? (typeof cfg.visual === 'string' ? { kind: cfg.visual } : cfg.visual) : null,
    listStyles: listStylesFor(cfg, listCount),
    columns: cfg.columns || 2,
    tones: cfg.tones || [],
    divider: cfg.divider || null,
    buildRows: !!cfg.buildRows,
    revealWithAnswers: !!cfg.revealWithAnswers,
    callout: !!cfg.callout,
    splitHeadings: !!cfg.splitHeadings,
    flowCols: cfg.flowCols || null,
    marks: cfg.marks || {},
    builds: cfg.build !== false,
    blocks,
    notes: body.notes,
    visualBrief: body.visual,
    placeholders,
    fragments,
    steps,
    interactions
  };
}

function buildDeck() {
  const draftText = fs.readFileSync(DRAFT, 'utf8');
  const configText = fs.readFileSync(CONFIG, 'utf8');
  delete require.cache[require.resolve(CONFIG)];
  const config = require(CONFIG);
  const parsed = parseDraft(draftText);

  Object.keys(config.slides || {}).forEach((key) => {
    if (!parsed.slides.some((s) => String(s.n) === key)) {
      throw new Error(`config refers to slide ${key}, which the draft does not have`);
    }
  });

  const nums = parsed.slides.map((s) => s.n);
  if (nums.length !== EXPECTED_SLIDES) {
    throw new Error(`expected ${EXPECTED_SLIDES} slides, found ${nums.length}`);
  }
  nums.forEach((n, i) => {
    if (n !== i + 1) throw new Error(`slide numbers must run 1..${EXPECTED_SLIDES}; found ${n} at position ${i + 1}`);
  });

  const ids = new Set();
  const timers = {};
  const slides = parsed.slides.map((s) => buildSlide(s, parsed.modules, config.slides || {}, ids, timers));

  const interactions = {};
  slides.forEach((s) => {
    s.interactions.forEach((it) => {
      interactions[it.id] = { slide: s.n, kind: it.kind };
    });
  });

  return {
    version: 1,
    title: parsed.title,
    subtitle: parsed.subtitle,
    source: 'presentation-draft.md',
    meta: {
      slideCount: slides.length,
      sourceHash: crypto.createHash('sha256').update(draftText).digest('hex').slice(0, 16),
      configHash: crypto.createHash('sha256').update(configText).digest('hex').slice(0, 16)
    },
    modules: parsed.modules,
    slides,
    timers,
    interactions
  };
}

function serialise(deck) {
  return JSON.stringify(deck, null, 1) + '\n';
}

// The browser loads the deck as a classic script so the site also works from file://.
function wrapJs(json) {
  return `/* Generated by tools/build-deck.js. Do not edit by hand. */\nwindow.AIPRO_DECK = ${json};\n`;
}

function writeOutputs(deck) {
  const json = serialise(deck);
  fs.writeFileSync(OUT_JSON, json);
  fs.writeFileSync(OUT_JS, wrapJs(json));
}

module.exports = { buildDeck, serialise, wrapJs, parseInline, parseBlocks, OUT_JSON, OUT_JS };

if (require.main === module) {
  const deck = buildDeck();
  writeOutputs(deck);
  const counts = deck.slides.reduce(
    (acc, s) => {
      acc.interactive += s.interactions.length ? 1 : 0;
      acc.interactions += s.interactions.length;
      acc.fragments += s.fragments;
      return acc;
    },
    { interactive: 0, interactions: 0, fragments: 0 }
  );
  console.log(
    `Built ${deck.slides.length} slides, ${deck.modules.length} blocks, ` +
      `${counts.interactions} interactions on ${counts.interactive} slides, ` +
      `${counts.fragments} build steps.`
  );
}
