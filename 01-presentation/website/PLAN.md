# Plan: the workshop as an interactive website

*The AI-Powered Professional* runs as a website instead of a slide file. The projector shows the deck, the presenter has a private console, and everyone in the room joins on their phone to vote, write and react. This document records what was built and why.

## Goals

1. **Keep one source of truth.** The words stay in `../presentation-draft.md`. The website is generated from it, so the draft and the deck cannot drift apart.
2. **Make the room part of the talk.** The draft already asks the audience to raise hands, talk in pairs, debrief and commit. Each of those moments becomes something people do on their phone, with results on the big screen.
3. **Be safe to present live.** It must work with bad Wi-Fi, no internet, a laptop restart or no server at all.
4. **Give the presenter more than slides.** Speaker notes, timers, a schedule check and moderation sit in one console.

## Decisions

| Area | Decision | Why |
| --- | --- | --- |
| Format | A presenter-driven deck on a fixed 1920 × 1080 canvas that scales to any screen, not a scrolling web page | It is a live, 4-hour, projector-first workshop. A fixed canvas keeps the type large and every slide predictable on any projector. |
| Content | The draft markdown is parsed into deck data by `tools/build-deck.js`. Layout and interactions live in `content/site-config.js` | Editors change words in the draft and design in one config file; neither has to touch code. `npm run check` fails if the data is stale. |
| Layouts | Eight layouts (title, section, stack, cards, columns, ladder, flow, pairs) plus small visuals taken from each slide's "Visual" brief | The draft's visual notes (the ladder, the jagged frontier, the traffic light, the desk, before/after panels, the process map) become real layouts, not bullet lists. |
| Joining | Phones scan a QR code (on the cover and on every interactive slide). No app, no login, no names | Fastest possible join. Anonymous answers make the honest questions ("pasted something you shouldn't have") safe to answer. |
| Live layer | A zero-dependency Node server on the presenter's laptop, with Server-Sent Events | Works on the venue Wi-Fi or a phone hotspot, needs no cloud account, and keeps all answers on the presenter's machine. SSE is simpler and more robust than WebSockets for one-way push. |
| State | One shared reducer (`assets/js/core.js`) runs in the browser and on the server | The projector, the console and every phone compute the same slide, step, poll reveal and timer from the same function. |
| No server | The deck also opens directly from the file system. Windows on the same laptop stay in sync through localStorage | If the server cannot run, the talk still runs with notes and timers. Only the phones are lost. |
| Pacing | Bullets and poll items build one per press. Answers are revealed on a separate press | The presenter controls attention: the room votes first, then sees the answer. |
| Shrink-to-fit | Dense slides scale down to fit the space, with re-wrapped text | Long draft slides (feature map, before/after prompts) stay readable without editing the content. |
| Design | Warm off-white canvas, Inter, one accent colour per module, traffic-light colours only where they carry meaning, light and dark themes, reduced-motion support | A calm, professional look for business teams, with module colours as wayfinding through a long day. |

## Architecture

```
presentation-draft.md ─┐
content/site-config.js ─┼─ tools/build-deck.js ─► data/deck.json (server) + data/deck.js (browsers)
                        │
index.html (projector) ─┤
presenter.html ─────────┼─ assets/js: core (state) · render · layouts · interactions · sync
join.html (phones) ─────┘                                       │
                                                                ▼
                      server.js: shared state, answers, reactions, SSE push, .session/ save
```

Every action (next, goto, start timer) is a command sent to the server, applied by the shared reducer, saved and pushed to all screens. Votes are checked against what is actually on screen, so nobody can answer a poll item that has not been revealed yet.

## Interaction map

| Slide | Moment in the draft | Interaction |
| --- | --- | --- |
| 3 Quick poll | "Hands up if you have…" | The six statements appear one by one; phones answer Yes or No; bars show the room |
| 5 The AI Work Ladder | "Ask: where are you today?" | The ladder itself is the poll: each rung fills with the share of the room |
| 12 Live demo | "Would you have put run 1 in a board deck?" | Predict first, then reveal: "I can't tell without checking" is the lesson |
| 13 The jagged frontier | "Name one task inside the frontier and one outside" | Answer wall |
| 15 Check-in | Pair talk, 1 minute | Shared countdown on screen and phones |
| 18 Delegation by team | "Anything you would move to a different column?" | Sort three tasks into the matrix, then reveal the suggested column |
| 26 Exercise 1 | 12 minutes, 2-minute warning | Timer with cue |
| 27 Debrief | "Which of the 6 parts made the most difference?" | Poll |
| 28, 47 Breaks | "Back at [time]" | 10-minute break countdown |
| 38 Context is your team's asset | "A great prompt nobody else knows about" | Wall of prompts to share |
| 41 Five workflow patterns | "Which of these do you already do?" | Poll per pattern |
| 45 Exercise 2 | 12 minutes | Timer with cue |
| 46 Debrief | "Where is your biggest time saving?" | Word cloud |
| 50 Exercise 3 | 8 minutes in pairs | Timer with "swap roles" cue |
| 51 Debrief | "What question did the AI ask that you hadn't thought of?" | Answer wall |
| 53 The data traffic light | The policy table | Classify six examples green, amber or red; the answer key slides in after the vote |
| 56 Five ways teams get AI wrong | "Show of hands, no names" | Anonymous Yes or No per pitfall |
| 58 Form your teams | "Collect team names before people leave" | Wall of team names |
| 59 Keep learning | "Recommend one thing to start this week" | Poll |
| 60 Recap and commitment | "Next week I will use AI for ___ at Level ___" | Commitment wall |
| 61 Questions | Close | "Where are you now?" on the ladder (compare with slide 5) and a questions wall |

On every slide, phones also have four reactions (👍 got it, ❓ question, 💡 insight, 🐢 slow down) that float up on the screen and are counted in the console, and a "read the slide text" panel for people far from the screen.

## What changes for the facilitator

- Start the server 15 minutes early and join from your own phone on the venue Wi-Fi. If the phone cannot reach the laptop, switch to a phone hotspot.
- Use the console (press **P** on the deck): notes, the session clock against the planned timings, timers, live answers and moderation.
- Polls build: press **Next** to reveal each statement, then again to reveal answers.
- Start exercise and break timers from the console. Everyone's phone shows the same countdown.
- Hide any open answer from the console before it stays on screen.
- After the session, **Export results** gives a JSON file with every poll and answer for the follow-up.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Venue Wi-Fi blocks devices from reaching each other | Phone hotspot. The deck itself keeps working without the server. |
| Laptop or server restarts mid-session | State, answers and timers are saved to `.session/` and restored on start. |
| No internet | Everything is local. Fonts fall back to system fonts; the QR code is generated in the browser. |
| Inappropriate open answer | Moderation in the console; the wall shows only the latest answers. |
| Someone moves the slides from their phone | Control needs the presenter key printed by the server. Phones and screens without it are view only. |
| Personal data in answers | Answers are anonymous, stored only on the presenter's laptop, and the workshop's own rule (no confidential data) applies. |

## Verification

- Build check: 61 slides parsed, structure validated, data current (`npm run check`).
- Browser tests (headless Chromium) with three windows: projector, console and a phone. Navigation sync, progressive reveal, live tallies, shared timers, answer wall, moderation, reactions, reload persistence, overview, help and blackout all passed.
- No-server mode: the deck opens from a file, honours `#/9` deep links, and the console drives it.
- A screenshot review of all 61 slides at full reveal, plus the console and phone pages.
