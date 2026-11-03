# Homework — Finance

*Course: The AI-Powered Professional*

For FP&A, accounting, controlling and treasury roles. Seven hands-on tasks. Required: 1, 2, 3 + any two of 4–7. Log each task using the template in [README.md](README.md).

Finance work is high-stakes and numbers must be exact, so every task here includes a verification step. That isn't extra work; it's the main skill.

---

## Task 1 — Catch the confident error

**Practises:** Discernment · **Feature:** two assistants, web search on/off · **Time:** ~30 min

**Scenario:** A colleague asks a quick question about a rule.

**Steps:**
1. Pick a specific rule relevant to your work: e.g. a VAT/sales tax rate or threshold in your country, a depreciation rule, a reporting deadline, a specific IFRS/local GAAP requirement.
2. Ask Claude **and** one other assistant, web search **off**:
   > [Your specific question]. Cite the exact regulation or standard and paragraph.
3. Repeat with web search **on**, adding: *"Only use official sources (tax authority, standard setter, regulator). Give links and the effective date. Say if it has changed recently."*
4. Check against the official source yourself.

**Deliverable:** a table (claim · assistant · search on/off · cited source · correct? · current?) and a personal rule for using AI on regulatory questions.

**Done when:**
- [ ] Verified against an official source, not another website
- [ ] You checked whether the answer was out of date

---

## Task 2 — From one-liner to pro brief

**Practises:** Description · **Feature:** plain chat · **Time:** ~30 min

**Scenario:** Variance commentary, a management summary, or an explanation of a financial result to non-finance colleagues.

**Steps:**
1. Use fictional or approved figures. Write your usual one-line prompt. Run it.
2. In a **new chat**, write a full 6-part brief. Include:
   - an example of good past commentary (anonymised)
   - *"Only use the figures provided"* and *"Mark anything you cannot explain as 'needs input'"*
   - *"Show calculations"*
3. Give two rounds of specific feedback.
4. Score both 1–5 on: accuracy, clarity for non-finance readers, actionability, editing needed.

**Deliverable:** both prompts, outputs, scores, and every numerical error you found in either version.

---

## Task 3 — Build a Monthly Reporting Project

**Practises:** Equip (Level 3) · **Feature:** Projects + instructions · **Time:** ~45 min

**Steps:**
1. Create a Project, e.g. "Monthly Management Report" or "Budget Process".
2. Add knowledge (allowed data only, or fictional versions):
   - Report template / structure
   - A simplified chart of accounts or KPI definitions
   - A glossary of finance terms as used in your company
   - 1–2 examples of good past commentary (anonymised)
3. Write Project instructions using Slide 33 as a starting point. Must include: *never invent numbers; show calculations; mark assumptions; ask when unsure.*
4. In the Project, produce a commentary for a month of fictional data (from Task 4 or newly generated).
5. In a new chat in the same Project: *"You are the CFO. Review this commentary. What would you challenge? What is unclear to a non-finance executive?"*

**Deliverable:** instructions (full text), knowledge list, the commentary, the CFO critique, and your changes to the instructions.

---

## Task 4 — Budget vs actual analysis

**Practises:** Discernment with data · **Feature:** file upload + data analysis · **Time:** ~45 min

**Data:** anonymised/approved data, or generate:
> Generate a realistic fictional CSV of monthly budget vs actual for a mid-size company over 12 months: month, department, cost_category, budget, actual. About 250 rows. Include 3 meaningful variances, one seasonal pattern, one duplicated row and one missing value.

**Steps:**
1. *"Describe the data first: columns, rows, period, totals by department, missing values, duplicates, anything odd. Don't analyse yet."* Did it find the planted issues?
2. *"Calculate variance (absolute and %) by department and category. Top 10 by absolute variance in a table. Chart the monthly trend for the 3 largest. Show the code/formulas."*
3. Rebuild **three** of the numbers yourself in Excel. Do they match? If not, find out why.
4. *"Draft a one-page commentary for the executive team. Only use what's in the data. Mark unexplained variances 'needs input'."*
5. Ask it to export the results as an Excel file. Open it and check the formulas or values.

**Deliverable:** data description (and whether issues were found), your 3 reconciliations, the chart, the commentary, and your list of anything wrong.

**Done when:**
- [ ] 3 numbers reconciled in your own spreadsheet
- [ ] Data issues handled explicitly (removed, flagged or explained)

---

## Task 5 — Build a scenario model or calculator

**Practises:** Building, not chatting · **Feature:** Artifacts / Canvas, or a generated Excel file · **Time:** ~40 min

**Pick one:**
- **Break-even calculator:** fixed costs, unit price, variable cost → break-even units and revenue, with a chart
- **Three-scenario model:** base / optimistic / pessimistic with 4–5 driver assumptions → revenue, costs, margin
- **Loan / lease comparison:** two financing options → total cost, monthly payments, NPV at a given rate

**Steps:**
1. Describe inputs, outputs, formulas you expect, and layout.
2. Iterate at least 3 times.
3. Test with **at least 3 cases where you know the correct answer** (calculate them by hand or in Excel first). Include an edge case (zero, negative, very large).

**Deliverable:** screenshot/export, your test table (input · expected · AI tool result · match?), and fixes you had to make.

---

## Task 6 — Explain finance to non-finance colleagues

**Practises:** Description + evaluator loop · **Feature:** two separate chats · **Time:** ~30 min

**Steps:**
1. Take a fictional or public financial statement (e.g. a listed company's annual report summary).
2. Chat 1: *"Explain the key messages of this [P&L / cash flow / balance sheet] for the marketing team, who are smart but not finance specialists. Max 250 words, no jargon, 3 takeaways, one simple analogy."*
3. Chat 2 (new chat): *"You are a strict auditor. Compare this plain-language summary with the original figures. List any statement that is inaccurate, misleading or oversimplified."* Paste both.
4. Revise. Then check it yourself.

**Deliverable:** the summary v1 and v2, the auditor's findings, and your own judgment on whether v2 is safe to send.

---

## Task 7 — Assumption check on a forecast

**Practises:** Flipped interaction + discovery · **Feature:** interview-me, assumption check · **Time:** ~40 min

**Steps:**
1. Take a forecast or budget assumption set (fictional or approved).
2. *"I'm preparing a forecast for [area]. Interview me one question at a time about the drivers and assumptions, max 8 questions. Then list every assumption, how sensitive the result is to each (high/medium/low), and the evidence that would confirm or break it."*
3. *"Which 3 assumptions would a sceptical board member challenge first? Draft the question they'd ask and a strong answer."*
4. Decide yourself which assumptions you'd change.

**Deliverable:** the assumption table, the board questions and answers, and your changes.
