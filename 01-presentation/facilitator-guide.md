# Facilitator Guide

This guide covers everything around the slides: preparation, the demo scripts, sample data, room logistics and backup plans. Read it together with `presentation-draft.md`.

## 1. Decisions to make before the session

| Decision | Why it matters | Where it shows up |
| --- | --- | --- |
| Which AI tool(s) and plan the company has approved | Features and data rules depend on it | Slides 7, 30, 53 |
| The company's data rules (or a draft of them) | Participants must know what they may paste | Slides 7, 53; `05-resources/ai-team-policy-template.md` |
| Assignment load: homework + individual project + team project, or fewer | ~13–18 h of work per person if all three are assigned | Slide 57 |
| Date of the next session and homework due date | Needed on Slides 57 and 61 and in every brief | All assignment files |
| How submissions are collected (shared folder, email, LMS) | Participants will ask on the day | Assignment files |

Recommended load if time is limited: homework + **one** project. The team project is the better choice if the goal is team-level AI adoption; the individual project is the better choice if the goal is personal productivity.

## 2. Preparation checklist

**One week before**
- [ ] Confirm participant list and their team (Marketing / Business / Finance)
- [ ] Confirm every participant can log in to the approved AI tool (and has Projects / file upload available on their plan)
- [ ] Adapt Slides 7, 30 and 53 to your company's tools and policy
- [ ] Fill dates and submission channel into the assignment files
- [ ] Send participants a short pre-read: "Bring one recurring task you do every week or month"

**Two days before**
- [ ] Create the demo accounts' Projects and sample files (Section 4)
- [ ] Run every demo end to end at least once; save screenshots as backup
- [ ] Prepare a shared folder with: the prompt library, the feature map, homework files, project briefs, templates

**On the day**
- [ ] Wi-Fi tested, screen sharing tested, font size large enough to read from the back
- [ ] Demo browser: logged in, previous chats cleared or hidden, notifications off
- [ ] Printed or shared: 6-part brief, Delegation Matrix, process-map template
- [ ] A sheet (or form) for team formation

## 3. Run of show

| Time | Block | Mode | Facilitator focus |
| --- | --- | --- | --- |
| 0:00–0:15 | Opening | Talk + poll | Energy, safety, the ladder |
| 0:15–0:45 | M1 How AI works | Talk + Demo 1 | Make "fluent ≠ correct" stick |
| 0:45–1:18 | M2 The 4Ds | Talk | Delegation Matrix, 6-part brief |
| 1:18–1:35 | Exercise 1 + debrief | Individual | Walk the room; push for examples |
| 1:35–1:45 | Break | | Prepare Module 3 demos |
| 1:45–2:11 | M3 Features | Talk | Projects first; keep the rest short |
| 2:11–2:25 | Demos 2–4 + wrap | Live demo | Narrate the 4Ds while demoing |
| 2:25–2:50 | M4 Workflows | Talk | Process map example, patterns |
| 2:50–3:05 | Exercise 2 + debrief | Individual | Push for concrete steps and checks |
| 3:05–3:15 | Break | | |
| 3:15–3:35 | M5 Discovery + Exercise 3 | Pairs | Mix teams in pairs |
| 3:35–3:50 | M6 Team management | Talk | Adapt to company policy |
| 3:50–4:00 | Close | Assignments + teams | Collect team names before people leave |

**If you run late:** shorten Slide 30 (point to the handout), do only the finance demo live (others as screenshots), and cut Slide 56 to a single sentence. Do not cut the exercises; they are where the learning happens.

**If you run early:** add a second round to Exercise 3 (swap roles) or run a live evaluator–optimiser loop (Slide 42) on a volunteer's draft.

## 4. Demo scripts

Create all sample data with AI beforehand so nothing confidential appears on screen. Save each sample file in the shared folder so participants can reuse it for homework.

### Demo 1 — Confident and wrong (Slide 12)

1. New chat, web search **off**. Prompt:
   > What is the average email open rate for [your industry] companies in [your country] in [last year]? Give the number and 3 sources.
2. Read the answer aloud. Then search for one of its sources live. Is it real? Does it say that?
3. New chat, web search **on**. Prompt:
   > Same question. Only use sources you can link to. If reliable data for this country and industry is not available, say so and give the closest available data, clearly labelled.
4. Compare. Ask the room which one they'd put in a board deck.

If your tool searches the web automatically and can't be switched off, add to step 1: *"Don't search the web; answer only from your own knowledge."*

Tip: test 2–3 candidate questions beforehand and pick the one with the clearest contrast. Niche + local + specific year tends to work best.

### Demo 2 — Marketing: Brand Project (Slide 37)

**Prepare:** a Project called "Demo — Brand & Content" with:
- A one-page fictional brand guide (generate: "Create a one-page brand voice guide for a fictional mid-size [industry] company called [Name]: values, tone, words we use, words we avoid, 2 example sentences.")
- A fictional product sheet
- Project instructions using the template on Slide 33 adapted for marketing

**Live:**
1. "Using the product sheet, write a campaign brief for a launch aimed at [audience]. Ask me up to 3 questions first." (Answer them.)
2. "Write 3 ad variants for LinkedIn following the brief."
3. New chat in the same Project: "You are the brand manager. Review these 3 variants against our brand guide. Score each 1–5 on tone, clarity and claims, and list violations." Paste the variants.

Point out: you never re-explained the brand. The Project did it.

### Demo 3 — Finance: Variance analysis (Slide 37)

**Prepare:** a fictional CSV:
> Generate a realistic fictional CSV of monthly budget vs actual for a mid-size company for 6 months: columns month, department, cost_category, budget, actual. About 120 rows. Include 3 notable variances and one data-quality issue (a missing value or duplicated row). Output the file.

**Live:**
1. Upload the CSV: "Describe this data first: columns, row count, date range, missing values, duplicates, anything odd. Don't analyse yet."
2. Note that it finds the data-quality issue (this is why you ask first).
3. "Calculate budget vs actual variance by department and category, absolute and %. Show the top 5 by absolute variance in a table and a bar chart. Show the calculation method."
4. Pick one number and check it in a spreadsheet on screen (or a calculator).
5. "Draft a 5-bullet commentary for the executive team. Mark anything you can't explain from the data as 'needs input'."

### Demo 4 — Business: Competitor scan (Slide 37)

**Live:**
1. Research or web search on: "Compare the 3–4 main providers of [a public product category relevant to your company] in [region]: target customers, pricing model (if public), key strengths, recent news. Give a source table: claim, source link, date."
2. Open one source and check one claim.
3. "Turn this into a one-page comparison as a document/artifact: a table plus 3 implications for a company like ours." (Artifact / Canvas.)

Research mode can take several minutes. Start it before you explain, or have a completed run ready in another tab.

## 5. Handling common questions

**"Which tool is best, ChatGPT or Claude?"** Both are strong; the skills today transfer. Use the one your company approves. Mollick's "which AI to use" guides (One Useful Thing) are a good neutral reference.

**"Will AI replace my job?"** Be honest: tasks will change, and the people who can brief, check and manage AI will be the ones doing the more valuable work. That's the point of today.

**"Can I use my personal account for work?"** Follow the company policy. Without one: no amber or red data in personal accounts.

**"It gave a different answer when I asked again."** That's normal: the output is generated, not looked up. This is why you use examples, clear formats and checks for anything that must be consistent.

**"Is it safe to upload Excel files?"** Depends on the content (traffic light) and the tool/plan. The mechanics are safe; the question is the data.

## 6. After the session

- Share the slide deck, prompt library, feature map and learning path within 24 hours
- Post a reminder of due dates halfway through
- Open a team channel for questions; answer common ones publicly
- Collect the team list and scenario choices by the stated date
- For the next session, plan time for presentations: individual projects 5 min each (or a gallery walk if many participants), team projects 10 min + 5 min Q&A
