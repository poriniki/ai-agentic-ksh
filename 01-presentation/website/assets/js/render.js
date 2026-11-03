/*
 * DOM helpers and the block renderer shared by every page.
 * Browser only. Text is always set with textContent or as text nodes, never as HTML.
 */
(function (ns) {
  'use strict';

  function append(node, kids) {
    (Array.isArray(kids) ? kids : [kids]).forEach(function (kid) {
      if (kid === null || kid === undefined || kid === false) return;
      if (Array.isArray(kid)) append(node, kid);
      else node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    });
    return node;
  }

  // el('p', { cls, text, attrs, style, data, on }, [children])
  function el(tag, opts, kids) {
    var node = document.createElement(tag);
    if (opts) {
      if (opts.cls) node.className = opts.cls;
      if (opts.text !== undefined && opts.text !== null) node.textContent = String(opts.text);
      if (opts.attrs) Object.keys(opts.attrs).forEach(function (k) { node.setAttribute(k, opts.attrs[k]); });
      if (opts.style) Object.keys(opts.style).forEach(function (k) { node.style.setProperty(k, opts.style[k]); });
      if (opts.data) Object.keys(opts.data).forEach(function (k) { node.dataset[k] = opts.data[k]; });
      if (opts.on) Object.keys(opts.on).forEach(function (k) { node.addEventListener(k, opts.on[k]); });
    }
    return append(node, kids);
  }

  function plainOf(spans) {
    return (spans || []).map(function (s) {
      if (s.k === 'text' || s.k === 'code') return s.v;
      if (s.k === 'br') return ' ';
      return plainOf(s.c);
    }).join('');
  }

  // Bracketed fill-ins such as [date] get a marker class so they can be styled.
  var FILL = /(\[[^\[\]]{2,60}\])/g;
  function textNode(str) {
    var frag = document.createDocumentFragment();
    str.split(FILL).forEach(function (part, i) {
      if (!part) return;
      if (i % 2 === 1) frag.appendChild(el('span', { cls: 'fill', text: part }));
      else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }

  function inline(spans) {
    var frag = document.createDocumentFragment();
    (spans || []).forEach(function (s) {
      if (s.k === 'text') frag.appendChild(textNode(s.v));
      else if (s.k === 'code') frag.appendChild(el('code', { text: s.v }));
      else if (s.k === 'strong') frag.appendChild(el('strong', null, [inline(s.c)]));
      else if (s.k === 'em') frag.appendChild(el('em', null, [inline(s.c)]));
      else if (s.k === 'a') frag.appendChild(el('a', { attrs: { href: s.href, target: '_blank', rel: 'noopener' } }, [inline(s.c)]));
      else if (s.k === 'br') frag.appendChild(document.createElement('br'));
    });
    return frag;
  }

  // Splits spans at line breaks. The draft writes some labelled lines without a blank line between them.
  function splitLines(spans) {
    var lines = [[]];
    (spans || []).forEach(function (s) {
      if (s.k === 'br') lines.push([]);
      else lines[lines.length - 1].push(s);
    });
    return lines.filter(function (line) { return line.length; });
  }

  function chips(labels, cls) {
    return el('div', { cls: 'chips ' + (cls || '') }, labels.map(function (label) {
      return el('span', { cls: 'chip', text: label });
    }));
  }

  // "Projects · Instructions · Files" in bold reads as a row of chips.
  function isChipLine(spans) {
    return spans.length === 1 && spans[0].k === 'strong' && plainOf(spans[0].c).split(' · ').length >= 3;
  }

  // A line that starts with a bold label ending in a colon becomes a labelled row.
  function lineRow(spans) {
    var first = spans[0];
    if (first && first.k === 'strong' && /:\s*$/.test(plainOf(first.c))) {
      return el('div', { cls: 'kv' }, [
        el('span', { cls: 'k', text: plainOf(first.c).replace(/:\s*$/, '') }),
        el('span', { cls: 'v' }, [inline(spans.slice(1))])
      ]);
    }
    return el('p', { cls: 'line' }, [inline(spans)]);
  }

  function paragraph(b) {
    if (isChipLine(b.c)) return chips(plainOf(b.c[0].c).split(' · '));
    return el('p', { cls: 'para' }, [inline(b.c)]);
  }

  function table(b) {
    return el('div', { cls: 'table-wrap' }, [
      el('table', { cls: 'table' }, [
        el('thead', null, [el('tr', null, b.head.map(function (h) { return el('th', null, [inline(h)]); }))]),
        el('tbody', null, b.rows.map(function (r) {
          return el('tr', null, r.map(function (c) { return el('td', null, [inline(c)]); }));
        }))
      ])
    ]);
  }

  function quote(b) {
    var node = el('blockquote', { cls: 'prompt' });
    b.c.forEach(function (child) {
      if (child.t === 'p') {
        splitLines(child.c).forEach(function (line) { node.appendChild(lineRow(line)); });
      } else {
        append(node, blocks([child], { frag: false }));
      }
    });
    return node;
  }

  // One list item. Used for top-level lists (which may be fragments) and nested lists.
  function listItem(it, opts) {
    var cls = 'item';
    if (it.checked !== null && it.checked !== undefined) cls += ' check' + (it.checked ? ' is-checked' : '');
    var li = el('li', { cls: cls });
    if (it.checked !== null && it.checked !== undefined) {
      li.appendChild(el('span', { cls: 'box', attrs: { 'aria-hidden': 'true' }, text: it.checked ? '✓' : '' }));
    }
    li.appendChild(el('div', { cls: 'item-body' }, [inline(it.c)]));
    if (it.children && it.children.length) {
      li.appendChild(el('div', { cls: 'item-children' }, blocks(it.children, { frag: false })));
    }
    if (opts && opts.frag) li.classList.add('frag');
    return li;
  }

  // opts.frag: top-level list items become build fragments.
  // opts.styles: list style per top-level list, in order (opts.ord counts them).
  function list(b, opts) {
    var ordered = b.t === 'ol';
    var style = 'bullets';
    if (opts && opts.styles && opts.ord) {
      style = opts.styles[opts.ord.i] || 'bullets';
      opts.ord.i += 1;
    }
    if (style === 'chips') {
      return el('div', { cls: 'chip-rows' }, b.items.map(function (it) {
        return chips(plainOf(it.c).split(' · '), 'frag-wrap' + (opts && opts.frag ? ' frag' : ''));
      }));
    }
    var node = el(ordered ? 'ol' : 'ul', { cls: 'list list-' + style });
    if (ordered && b.start !== 1) node.setAttribute('start', String(b.start));
    b.items.forEach(function (it) { node.appendChild(listItem(it, opts)); });
    return node;
  }

  function blocks(list_, opts) {
    opts = opts || {};
    var out = [];
    (list_ || []).forEach(function (b) {
      if (b.t === 'p') out.push(paragraph(b));
      else if (b.t === 'ul' || b.t === 'ol') out.push(list(b, opts));
      else if (b.t === 'table') out.push(table(b));
      else if (b.t === 'quote') out.push(quote(b));
    });
    return out;
  }

  // Top-level lists in a block tree, in order.
  function topLists(list_) {
    return (list_ || []).filter(function (b) { return b.t === 'ul' || b.t === 'ol'; });
  }

  function firstTable(list_) {
    return (list_ || []).filter(function (b) { return b.t === 'table'; })[0] || null;
  }

  ns.render = {
    el: el,
    append: append,
    plainOf: plainOf,
    inline: inline,
    splitLines: splitLines,
    chips: chips,
    blocks: blocks,
    list: list,
    table: table,
    topLists: topLists,
    firstTable: firstTable
  };
})(window.AIPro = window.AIPro || {});
