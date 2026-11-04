#!/usr/bin/env node
'use strict';
/*
 * Fails (exit code 1) when committed output no longer matches its sources, so a
 * stale build cannot slip through:
 *   - data/deck.json and data/deck.js against the English draft and the config
 *   - data/deck.fa.json and data/deck.fa.js against the Persian draft and locale,
 *     including the structural match with the English deck
 *   - fa/*.html against the English pages and the interface strings
 *
 *   npm run check
 */
const fs = require('fs');
const path = require('path');
const { LANGS, buildAll, serialise, wrapJs } = require('./build-deck.js');
const pages = require('./build-pages.js');

const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
const rel = (file) => path.relative(path.resolve(__dirname, '..'), file);
const problems = [];

let decks;
try {
  decks = buildAll();
} catch (err) {
  console.error(`Build failed: ${err.message}`);
  process.exit(1);
}

Object.keys(decks).forEach((lang) => {
  const json = serialise(decks[lang]);
  if (read(LANGS[lang].outJson) !== json) problems.push(`${rel(LANGS[lang].outJson)} is out of date`);
  if (read(LANGS[lang].outJs) !== wrapJs(json)) problems.push(`${rel(LANGS[lang].outJs)} is out of date`);
});

if (decks.fa) {
  const expected = pages.render();
  Object.keys(expected).forEach((name) => {
    const file = path.join(pages.OUT_DIR, name);
    if (read(file) !== expected[name]) problems.push(`${rel(file)} is out of date`);
  });
}

if (problems.length) {
  problems.forEach((p) => console.error(`✗ ${p}`));
  console.error('Run "npm run build" and commit the result.');
  process.exit(1);
}

Object.keys(decks).forEach((lang) => {
  const deck = decks[lang];
  const interactive = deck.slides.filter((s) => s.interactions.length).length;
  console.log(`✓ [${lang}] Deck data is current: ${deck.slides.length} slides, ${interactive} with audience interactions.`);
});
if (decks.fa) console.log('✓ [fa] Matches the English deck step for step; pages are current.');
