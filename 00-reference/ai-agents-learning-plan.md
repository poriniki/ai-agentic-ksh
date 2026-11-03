# AI & Agents Learning Plan

Nov 3, 2026 · @Pouria

## How to use this plan

Work through four phases in order over about 6–8 weeks at 3–5 hours a week; every resource below is free, in English, and needs no coding.

1. **Phase 1 — AI fundamentals** (week 1–2): how these models work and where they fail.
2. **Phase 2 — Using Claude well** (week 2–3): prompting and Claude's features.
3. **Phase 3 — Problem solving and process design with agents** (week 4–5).
4. **Phase 4 — Q&A and requirements discovery with AI** (week 6–7).

Spend at least half your time on the practice exercises near the end, using your own real tasks. Coursera courses are listed as "free to audit"; if a course no longer shows an audit option for you, use the free alternative given next to it.

## Phase 1 — AI fundamentals

Goal: understand what generative AI is, how it produces answers, and where it is unreliable, so you know when to trust it.

| Order | Resource | Provider | Time | Why |
| --- | --- | --- | --- | --- |
| 1 | [AI Capabilities and Limitations](https://anthropic.skilljar.com/ai-capabilities-and-limitations) | Anthropic Academy | \~1–2 h | Short intro to how AI works and where it breaks |
| 2 | [Generative AI for Everyone](https://www.deeplearning.ai/courses/generative-ai-for-everyone) | DeepLearning.AI (Andrew Ng) | \~5 h | Best non-technical mental model of LLMs; free to watch on DeepLearning.AI, also auditable on [Coursera](https://www.coursera.org/learn/generative-ai-for-everyone) |
| 3 | [Elements of AI — Introduction to AI](https://www.elementsofai.com/) | University of Helsinki & MinnaLearn | \~6 weeks, self-paced | Vendor-neutral AI basics (machine learning, neural networks, ethics), no maths or code; free certificate |

Optional: Andrew Ng's *AI for Everyone* on Coursera (free to audit) if you want the business side of AI beyond generative tools.

## Phase 2 — Using Claude and other assistants well

Goal: get reliably good results by giving clear context, delegating the right tasks, and checking output critically.

| Order | Resource | Provider | Time | Why |
| --- | --- | --- | --- | --- |
| 1 | [AI Fluency: Framework & Foundations](https://anthropic.skilljar.com/ai-fluency-framework-foundations) | Anthropic Academy | a few hours | Core skill course: the "4 Ds" — Delegation, Description, Discernment, Diligence. Applies to any AI tool. Free certificate |
| 2 | [Claude 101](https://anthropic.skilljar.com/claude-101) | Anthropic Academy | \~1–2 h | Claude's features (projects, files, artifacts, research) and everyday workflows |
| 3 | [Prompt engineering guide](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview) | Anthropic docs | read over a week | Official techniques: clear instructions, examples, XML tags, letting Claude think. Read the concepts; skip API code |
| 4 | [Prompt Engineering for ChatGPT](https://www.coursera.org/learn/prompt-engineering) | Vanderbilt (Jules White), Coursera | \~2 weeks | Reusable "prompt patterns" that work in any assistant; essential for Phase 4. Free to audit |
| 5 | [OpenAI Academy: AI Foundations](https://academy.openai.com/) | OpenAI | \~1 h | Optional, for a second vendor's perspective; free with a ChatGPT account |

All Anthropic Academy courses are free and need only a free Skilljar sign-up, not a paid Claude plan.

## Phase 3 — Problem solving and process design with AI and agents

Goal: break a messy problem into steps, decide which steps AI should do, and design a repeatable workflow with human checkpoints.

| Order | Resource | Provider | Time | Why |
| --- | --- | --- | --- | --- |
| 1 | [Building effective agents](https://www.anthropic.com/research/building-effective-agents) | Anthropic | \~30 min | The standard vocabulary: workflows vs. agents, and five patterns (chaining, routing, parallelization, orchestrator–workers, evaluator–optimizer). Skim the code; the diagrams are the point |
| 2 | [How We Build Effective Agents — Barry Zhang](https://ai.engineer/talks/effective-ai-agents) | AI Engineer talk (Anthropic) | \~15 min | When *not* to use an agent; keep it simple |
| 3 | [Introduction to Claude Cowork](https://anthropic.skilljar.com/introduction-to-claude-cowork) | Anthropic Academy | a few hours | Hands-on: giving Claude multi-step tasks on real files, skills, and steering long work responsibly |
| 4 | OpenAI Academy: *Applied AI Foundations*, then *Agents and Workflows* | [OpenAI Academy](https://academy.openai.com/) | \~75–90 min each | Turning recurring tasks into steps with review points; same ideas from another vendor |
| 5 | [AI Fluency for Builders](https://anthropic.skilljar.com/ai-fluency-for-builders) | Anthropic Academy | a few hours | Optional: owning the full arc from problem to shipped solution with AI |

Key idea to carry forward: start with the simplest workflow that works, and add autonomy only where a step is valuable and hard to script.

## Phase 4 — Q&A and requirements discovery with AI

Goal: use AI to ask *you* (or stakeholders) the right questions, surface hidden assumptions, and turn messy notes into clear requirements.

Free, dedicated courses on this are rare; most are paid business-analysis trainings. The strongest free route is to combine prompt patterns with deliberate practice:

| Order | Resource | Provider | Focus |
| --- | --- | --- | --- |
| 1 | [Prompt Engineering for ChatGPT](https://www.coursera.org/learn/prompt-engineering), weeks 3 and 6 | Vanderbilt, Coursera | The **Flipped Interaction**, **Question Refinement**, **Cognitive Verifier** and **Ask for Input** patterns — the core of AI-led questioning |
| 2 | [A Prompt Pattern Catalog](https://arxiv.org/abs/2302.11382) | Vanderbilt paper | Reference for those patterns with templates; read the pattern descriptions only |
| 3 | AI Fluency course, *Description* and *Discernment* modules | [Anthropic Academy](https://anthropic.skilljar.com/ai-fluency-framework-foundations) | Stating goals and context clearly; judging whether answers hold up |
| 4 | [Requirement Gathering and Analysis with GenAI](https://www.coursera.org/learn/requirement-gathering-and-analysis-with-genai-training) | Simplilearn, Coursera | Elicitation, user stories, prioritization with AI; check whether audit is available, otherwise skip |

Core techniques to practise:

- **Interview me first:** "Before answering, ask me one question at a time until you have what you need to \[goal\]. Stop after at most 8 questions."
- **Assumption check:** "List the assumptions you're making about my situation, and the questions that would confirm or break each."
- **Notes to requirements:** paste raw meeting notes and ask for user stories, functional and non-functional requirements, constraints, and open questions, each traced to the line it came from.
- **Gap hunt:** "What's missing, ambiguous or contradictory in these requirements? Rank by risk."

## Practice exercises

Do one exercise per phase on a real problem from your work or life; tick it off when done.

- [ ] **Phase 1:** Ask Claude and one other assistant the same factual question in your field, then verify every claim. Note where each was wrong or overconfident.
- [ ] **Phase 2:** Take a task you do weekly. Write a bad one-line prompt, then rewrite it with role, context, an example and output format. Compare results side by side.
- [ ] **Phase 2:** Set up a Claude Project with background documents and standing instructions for one recurring area of your work.
- [ ] **Phase 3:** Map a process you repeat (e.g. weekly report) as numbered steps. Mark each step: AI does it, AI drafts + you review, or you do it. Run it twice and fix the weakest step.
- [ ] **Phase 3:** Hand Claude a multi-step task on real files (research → draft → self-check) and practise steering it mid-way.
- [ ] **Phase 4:** Pick a vague idea you have. Use the "interview me first" prompt, then have Claude write a one-page brief with goals, users, requirements and open questions.
- [ ] **Phase 4:** Paste notes from a real meeting and run the notes-to-requirements and gap-hunt prompts. Check every item against the notes.

## Staying current

Tools change monthly, so keep one or two vendor-neutral sources after the courses end.

- [One Useful Thing](https://www.oneusefulthing.org/) — Ethan Mollick's free newsletter (Wharton); practical, research-based, and his periodic "which AI to use" guides are the best non-technical overview.
- [Anthropic Academy](https://www.anthropic.com/learn) — check every couple of months; new courses appear regularly.
- [OpenAI Academy](https://academy.openai.com/) — free live and on-demand sessions.

## Sources

- [Anthropic Academy course catalogue](https://anthropic.skilljar.com/)
- [Building effective agents — Anthropic](https://www.anthropic.com/research/building-effective-agents)
- [Elements of AI](https://www.elementsofai.com/)
- [Generative AI for Everyone — DeepLearning.AI](https://www.deeplearning.ai/courses/generative-ai-for-everyone)
- [Prompt Engineering for ChatGPT — Coursera](https://www.coursera.org/learn/prompt-engineering)
- [Course review listing its prompt patterns by week — Bridged](https://www.getbridged.co/course-review/prompt-engineering-for-chatgpt-vanderbilt)
- [OpenAI Academy courses — OpenAI Help Center](https://help.openai.com/en/articles/20001270-openai-academy-courses)
- [Free AI and ChatGPT courses overview — iTechGuides](https://www.itechguides.com/?p=417166)
- [Requirement Gathering and Analysis with GenAI — Coursera](https://www.coursera.org/learn/requirement-gathering-and-analysis-with-genai-training)
