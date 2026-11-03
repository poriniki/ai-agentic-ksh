# Homework — Marketing

Seven hands-on tasks. Required: 1, 2, 3 + any two of 4–7. Log each task using the template in [README.md](README.md).

---

## Task 1 — Catch the confident error

**Practises:** Discernment · **Feature:** two assistants, web search on/off · **Time:** ~30 min

**Scenario:** You are preparing benchmarks for a channel review.

**Steps:**
1. Ask Claude **and** one other assistant (e.g. ChatGPT), with web search **off**:
   > What are typical benchmarks for email open rate, click-through rate and cost per lead for [your industry] in [your country/region]? Give numbers and sources.
2. Repeat with web search **on**, adding: *"Only use sources you can link to. Say clearly if data for my region isn't available."*
3. Open every source. For each number, mark it: ✅ confirmed · ⚠️ source exists but says something different / old · ❌ source not found.

**Deliverable:** a table of claims (claim · assistant · search on/off · source · verdict) and 3 sentences on what you'll do differently when using AI for benchmarks.

**Done when:**
- [ ] Every number is checked against a source you opened
- [ ] You can say which setup was most reliable and why

---

## Task 2 — From one-liner to pro brief

**Practises:** Description · **Feature:** plain chat · **Time:** ~30 min

**Scenario:** A piece of content you write regularly: social post, newsletter section, ad copy, product description.

**Steps:**
1. Write the one-line prompt you'd normally use. Run it. Save the output.
2. In a **new chat**, write a full 6-part brief (Who · Why · What · How · Like this · Not this). Include at least **one example** of past content that performed well.
3. Run it, then give two rounds of **specific** feedback.
4. Score both versions 1–5 on: on-brand tone, clarity, accuracy, CTA strength, editing needed.

**Deliverable:** both prompts, both outputs (short), the score table, and which of the 6 parts made the biggest difference.

**Done when:**
- [ ] The brief includes an example and a "Not this" section
- [ ] Your feedback rounds were specific (no "make it better")

---

## Task 3 — Build your Brand & Content Project

**Practises:** Equip (Level 3) · **Feature:** Projects + instructions · **Time:** ~45 min

**Steps:**
1. Create a Project called "Brand & Content — [your area]".
2. Add knowledge (only data allowed by the traffic light, or fictional versions):
   - Brand/tone of voice guide (if none exists, ask AI to draft one from 3–5 of your best past pieces, then edit it)
   - One product/service description
   - 2–3 examples of excellent past content
   - Target persona(s)
3. Write Project instructions: role, audience, always, never, when unsure, output style (see Slide 33).
4. In the Project, start 3 **separate** chats and create: a social post, an email, and a landing-page hero section.
5. In a 4th chat: *"Review the following 3 pieces against our brand guide. Score each 1–5 on tone, clarity, claims accuracy. List any violations."*

**Deliverable:** your Project instructions (full text), the list of knowledge files, the 3 assets, the review result, and what you'd change in the instructions after seeing the results.

**Done when:**
- [ ] You did not re-explain the brand in any chat
- [ ] You changed the instructions at least once based on results

---

## Task 4 — Analyse campaign performance data

**Practises:** Discernment with data · **Feature:** file upload + data analysis · **Time:** ~40 min

**Data:** an anonymised campaign export, or generate one:
> Generate a realistic fictional CSV of 3 months of paid campaign results for a [industry] company: date, channel, campaign, creative, impressions, clicks, leads, spend. About 200 rows. Include one channel that underperforms and one data issue.

**Steps:**
1. Upload. *"Describe the data first: columns, rows, date range, missing values, anything odd. Don't analyse yet."*
2. *"Calculate CTR, CPL and conversion rate by channel and by creative. Show the top and bottom 3 in a table and a chart. Show your method."*
3. Recalculate **two** numbers yourself in a spreadsheet.
4. *"What would you recommend we change in next month's budget split, and what evidence in this data supports each recommendation? What data would you need to be more confident?"*

**Deliverable:** the data description, the chart, your two recalculations (match or not), and the recommendations with your own judgment on each (agree / disagree / need more data).

**Done when:**
- [ ] You checked two numbers yourself
- [ ] You identified at least one recommendation you would *not* follow, with a reason

---

## Task 5 — Build a reusable tool

**Practises:** Building, not chatting · **Feature:** Artifacts (Claude) / Canvas (ChatGPT) · **Time:** ~30 min

**Pick one:**
- **Content calendar:** a 4-week calendar table for one channel, with theme, format, owner, status
- **Campaign ROI calculator:** inputs (spend, CTR, conversion rate, deal value) → outputs (leads, cost per lead, ROI)
- **Brief template:** a fill-in campaign brief template your team can reuse

**Steps:**
1. Describe what you want in detail (who uses it, inputs, outputs, layout).
2. Iterate at least 3 times on the result.
3. If it's a calculator: test with values where you **know the correct answer**.

**Deliverable:** a screenshot or export of the final version, your test (for calculators), and how a colleague would use it.

---

## Task 6 — Competitor messaging scan

**Practises:** Research with sources · **Feature:** web search or Research mode · **Time:** ~40 min

**Steps:**
1. *"Research how [3 competitors] position themselves to [target segment]: main message, key claims, proof points, tone, channels they appear most active on. Use their websites and recent public materials. Give a source table: claim · source link · date."*
2. Open and verify at least **5** claims.
3. *"Based only on the verified information, where is there white space in positioning that a company like ours could own? Give 3 options with pros and cons."*

**Deliverable:** the comparison table with your verification column, and the option you'd choose with your reasoning.

**Done when:**
- [ ] 5 claims verified, with any errors noted
- [ ] Your final choice is your own, not just the AI's first option

---

## Task 7 — Interview me, then critique

**Practises:** Flipped interaction + evaluator–optimiser · **Feature:** two separate chats · **Time:** ~40 min

**Steps:**
1. Pick a vague campaign or content idea you have.
2. Chat 1:
   > I want to plan [idea]. Before suggesting anything, ask me one question at a time until you have what you need to write a campaign brief. Stop after at most 8 questions, then write a one-page brief: objective, audience, key message, channels, budget range, success metrics, risks, open questions.
3. Chat 2 (new chat, fresh eyes):
   > You are a sceptical marketing director. Review this campaign brief. Score 1–5 on: clarity of objective, audience insight, measurability, feasibility. List the 3 biggest weaknesses and what to do about each.
4. Revise the brief (with AI or by hand) and do one more critique round.

**Deliverable:** the questions the AI asked (highlight the most useful), the brief v1 and v2, and the two critique results.
