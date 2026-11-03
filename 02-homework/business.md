# Homework — Business

*Course: The AI-Powered Professional*

For business development, strategy, sales operations, product and operations roles. Seven hands-on tasks. Required: 1, 2, 3 + any two of 4–7. Log each task using the template in [README.md](README.md).

---

## Task 1 — Catch the confident error

**Practises:** Discernment · **Feature:** two assistants, web search on/off · **Time:** ~30 min

**Scenario:** A manager asks you for a market size figure for a slide.

**Steps:**
1. Ask Claude **and** one other assistant, with web search **off**:
   > What is the market size and annual growth rate of [your market] in [your country/region]? Give numbers, year and sources.
2. Repeat with web search **on**, adding: *"Only use sources you can link to. State the year of each figure and say if regional data isn't available."*
3. Open every source. Mark each figure: ✅ confirmed · ⚠️ different / outdated / different scope (e.g. global instead of regional) · ❌ not found.

**Deliverable:** the claims table (claim · assistant · search on/off · source · verdict) and a rule you'll follow next time someone asks you for a market number.

**Done when:**
- [ ] Every figure is checked
- [ ] You noticed any scope mismatches (region, year, definition of the market)

---

## Task 2 — From one-liner to pro brief

**Practises:** Description · **Feature:** plain chat · **Time:** ~30 min

**Scenario:** Something you write regularly: a stakeholder update email, a meeting summary, a client follow-up, a weekly status report.

**Steps:**
1. Write your usual one-line prompt. Run it. Save the output.
2. In a **new chat**, write a full 6-part brief with at least one example of a good past version.
3. Give two rounds of specific feedback.
4. Score both versions 1–5 on: clarity, structure for the reader, accuracy, actionability, editing needed.

**Deliverable:** both prompts, both outputs (short), scores, and which of the 6 parts made the biggest difference.

---

## Task 3 — Build a Proposal / Account Project

**Practises:** Equip (Level 3) · **Feature:** Projects + instructions · **Time:** ~45 min

**Steps:**
1. Create a Project for a recurring area: e.g. "Proposals", "Client X", "Product knowledge", "Weekly pipeline review".
2. Add knowledge (allowed data only, or fictional versions):
   - Product/service descriptions and pricing logic (rounded or fictional if needed)
   - A proposal or report template
   - 1–2 examples of strong past proposals or reports (anonymised)
   - A glossary of internal terms and acronyms
3. Write Project instructions: role, audience, always, never, when unsure, output style.
4. In the Project, draft a proposal (or report) for a fictional client need. Start with: *"Ask me up to 5 questions first."*
5. In a new chat in the same Project: *"You are the client's procurement lead. Review this proposal: what is unclear, what is missing, what would make you say no?"*

**Deliverable:** instructions (full text), knowledge list, the draft, the critique, and what you'd change in the Project setup.

**Done when:**
- [ ] No re-explaining of company/product in chats
- [ ] Instructions updated at least once based on results

---

## Task 4 — Meeting notes to requirements

**Practises:** Discernment with documents · **Feature:** file upload / paste · **Time:** ~40 min

**Data:** real meeting notes (anonymised: roles instead of names, no confidential figures), or generate:
> Generate realistic, messy fictional meeting notes (about 600 words) from a kickoff meeting about [a new internal tool / client project / process change]. Include contradictions, vague requests and an unassigned action.

**Steps:**
1. *"From these notes, list: goals, functional requirements, non-functional requirements (time, budget, quality), constraints, decisions, action items with owner and date, and open questions. Quote the line each item came from."*
2. *"What is missing, ambiguous or contradictory? Rank by risk."*
3. Check every item against the notes. Mark anything the AI **invented** or **misread**.

**Deliverable:** the requirements table, the gap list, and your error count (invented / misread / correct).

**Done when:**
- [ ] Every item traced to a quoted line
- [ ] At least one gap you would take back to the stakeholders

---

## Task 5 — Build a decision tool

**Practises:** Building, not chatting · **Feature:** Artifacts / Canvas · **Time:** ~30 min

**Pick one:**
- **Vendor / option scoring matrix:** criteria, weights, scores, weighted total
- **Simple business case calculator:** investment, monthly savings or revenue, payback period, simple ROI
- **Stakeholder map:** stakeholder, interest, influence, position, engagement action

**Steps:**
1. Describe in detail what you want (users, inputs, outputs, layout).
2. Iterate at least 3 times.
3. Test any calculations with values where you **know the answer**.

**Deliverable:** screenshot/export, your test results, how you'd use it in a real decision.

---

## Task 6 — Market or competitor landscape

**Practises:** Research with sources · **Feature:** web search or Research mode · **Time:** ~40 min

**Steps:**
1. *"Research the competitive landscape for [product/service] in [region]: main players, target customers, pricing model (if public), differentiators, recent news in the last 12 months. Source table: claim · link · date."*
2. Verify at least **5** claims by opening sources.
3. *"Based only on verified information, write a SWOT for a company like ours, and 3 strategic options with pros, cons and the main assumption behind each."*
4. Run the assumption check: *"For each option, which assumption, if wrong, would make it fail? How could we test it cheaply?"*

**Deliverable:** landscape table with verification column, SWOT, options with assumptions, and your recommendation.

---

## Task 7 — Map and improve one process

**Practises:** Workflow thinking (Level 4) · **Feature:** interview-me + chain of chats · **Time:** ~45 min

**Steps:**
1. Pick a recurring process (weekly pipeline review, client onboarding, monthly KPI update…).
2. *"Interview me, one question at a time, about how I currently do [process], then draw it as numbered steps with inputs, outputs and time per step. Max 10 questions."*
3. Label each step: 🟢 AI does it · 🟡 AI drafts, I review · ⚪ I do it. Add a check for each AI step.
4. Actually run the improved version **once** on a real (or fictional) instance.
5. *"Act as a process improvement consultant. Review this workflow. Which step is the weakest, and should any step be removed?"*

**Deliverable:** before map, after map (with labels and checks), notes from the test run, and time before vs after.

This task is a good starting point for the individual project.
