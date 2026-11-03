# The AI-Powered Professional: interactive web deck

The workshop deck as a website. The projector shows the slides, you get a private presenter console, and the room joins on their phones to vote, write answers and react. See [PLAN.md](PLAN.md) for the design decisions and the full interaction map.

Requires **Node.js 18 or newer**. There are no packages to install.

## Quick start

In this folder:

```bash
npm start
```

The server prints three links:

| Link | Open it on |
| --- | --- |
| `http://<laptop-ip>:3000/?key=…` | The projector (the deck). The key lets this window move the slides. |
| `http://<laptop-ip>:3000/presenter.html?key=…` | Your laptop screen or a tablet (notes, timers, answers). |
| `http://<laptop-ip>:3000/join` | Everyone's phone. The deck shows it as a QR code. |

Keep the key private: anyone with it can move the slides. Use `AIPRO_KEY=yourkey npm start` for a fixed key and `PORT=8080 npm start` for another port. Answers are saved in `.session/` (not committed), so a restart continues where you were. Start a clean session with:

```bash
npm run start:fresh
```

## Presenting

**On the deck**

| Key | Action |
| --- | --- |
| → Space Enter PageDown | Next build step (bullet, poll item, answer reveal), then the next slide |
| ← Backspace PageUp | Back |
| Home / End | First or last slide |
| O | All slides |
| G | Go to a slide number |
| Q | Large join QR code |
| B or . | Blackout (breaks) |
| P | Open the presenter console |
| T | Light or dark theme |
| F | Full screen |
| ? | Keyboard help |

Swipe left or right on a touch screen. Presentation clickers that send PageDown and PageUp work as they do in PowerPoint.

**In the console:** speaker notes and the visual brief from the draft, the next slide, a session clock that compares your pace with the draft's planned timings, Start, Pause and Reset for exercise and break timers, live answers for the current slide, Hide for any open answer, reaction counts, Reset buttons, a jump list of all slides, and **Export results** (a JSON file with every poll and answer).

**On phones:** the current question appears automatically. Answers are anonymous. People can change their vote until you reveal the answer. Four reactions (👍 ❓ 💡 🐢) are always available, and "Read the slide text" helps people far from the screen.

## Without the server

Open `index.html` directly in a browser. The deck, the speaker notes (press **P**) and the timers all work. Windows on the same laptop stay in sync. Phones cannot join, and the deck says so on the interactive slides.

## Editing

1. Change the words in [`../presentation-draft.md`](../presentation-draft.md). Keep its structure: `## Slide N — Title`, the `**Time:** … · **Type:** …` line, then `**On slide:**`, `**Visual:**` and `**Speaker notes:**`.
2. Change a layout or an interaction in [`content/site-config.js`](content/site-config.js). The comment at the top lists the layouts and interaction types.
3. Rebuild and verify:

```bash
npm run build
```

```bash
npm run check
```

`npm run build` stops with a clear message if the draft or the config has a problem (for example a poll answer that points at a missing option). Commit `data/deck.json` and `data/deck.js` together with your change. Text in square brackets, such as `[date]`, is highlighted on the slides and listed in the console under "Fill-ins on this slide" so nothing is left unfilled.

## Networks

- **Venue Wi-Fi:** works when devices on the network can reach each other. Many guest networks block this ("client isolation").
- **Phone hotspot:** the reliable fallback. Connect the laptop and the audience to it.
- **Firewall:** allow incoming connections to Node on the port you use.
- A static host (for example GitHub Pages) can serve the deck for reading after the session, but not live polls.

## Printing and PDF

Open the deck in Chrome or Edge, print, and choose **Save as PDF** with background graphics on. Each slide prints on its own page with every build step shown.

## Files

| Path | What it is |
| --- | --- |
| `index.html`, `presenter.html`, `join.html` | The three pages |
| `assets/js/core.js` | Shared state rules used by the browsers and the server |
| `assets/js/render.js`, `layouts.js`, `interactions.js` | Slide rendering, layouts, polls, walls and timers |
| `assets/js/sync.js` | Connection to the server, or the same-browser fallback |
| `assets/js/deck.js`, `presenter.js`, `audience.js` | Page logic |
| `assets/css/site.css` | All styles |
| `content/site-config.js` | Layouts and interactions per slide |
| `data/deck.json`, `data/deck.js` | Generated deck data (do not edit by hand) |
| `tools/build-deck.js`, `tools/check-deck.js` | Build and check |
| `server.js` | Live server |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Phones cannot open the join link | Check that the phone is on the same network as the laptop; try a hotspot; allow Node through the firewall. |
| The deck says "view only" | Open the projector link that includes `?key=`. |
| "Port 3000 is in use" | `PORT=3001 npm start` |
| The server warns that the draft changed | Run `npm run build`. |
| The slides look unstyled | Make sure you opened `index.html` from this folder, not a copy elsewhere. |

## Third-party code

- QR codes: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase, MIT licence (`assets/vendor/qrcode.js`).
- Font: [Inter](https://rsms.me/inter/), SIL Open Font License, loaded from Google Fonts when online; system fonts are used offline.
