#!/usr/bin/env node
'use strict';
/*
 * Fails (exit code 1) when the committed deck data no longer matches the draft
 * and the site config, so a stale build cannot slip through.
 *
 *   npm run check
 */
const fs = require('fs');
const { buildDeck, serialise, wrapJs, OUT_JSON, OUT_JS } = require('./build-deck.js');

const problems = [];
let deck;
try {
  deck = buildDeck();
} catch (err) {
  console.error(`Build failed: ${err.message}`);
  process.exit(1);
}

const json = serialise(deck);
const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
if (read(OUT_JSON) !== json) problems.push('data/deck.json is out of date');
if (read(OUT_JS) !== wrapJs(json)) problems.push('data/deck.js is out of date');

if (problems.length) {
  problems.forEach((p) => console.error(`✗ ${p}`));
  console.error('Run "npm run build" and commit the result.');
  process.exit(1);
}

const interactive = deck.slides.filter((s) => s.interactions.length).length;
console.log(`✓ Deck data is current: ${deck.slides.length} slides, ${interactive} with audience interactions.`);
