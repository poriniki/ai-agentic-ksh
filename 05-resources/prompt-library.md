# Prompt Library (participant handout)

*Course: The AI-Powered Professional*

Copy, fill the `[brackets]`, and adapt. These templates work in Claude, ChatGPT and other assistants. Put pasted material between `"""` or in tags like `<notes>…</notes>` so the AI doesn't confuse it with your instructions.

## 1. The 6-part brief

```
[Who] You are a [role]. The audience is [who will read/use this].
[Why] The goal is [outcome]. Success means [measurable or observable result].
[What] Your task: [task], using the input below.
[How] Format: [structure, length, tone, language].
[Like this] Here is an example of what good looks like: """[example]"""
[Not this] Avoid: [things to avoid]. Don't invent [facts/numbers/features]; if something is missing, say so.

Input: """[material]"""
```

## 2. Quality boosters (add to any prompt)

| Purpose | Add this |
| --- | --- |
| Plan first | "Before writing, outline your approach in 3–5 bullets and wait for my OK." |
| Allow uncertainty | "If you're not sure or information is missing, say so instead of guessing." |
| Options | "Give 3 different approaches, each with pros, cons and when it's the best choice." |
| Stay grounded | "Only use the information I provided. Mark anything else as [ASSUMPTION]." |
| Traceability | "For each point, quote the line from the input it's based on." |
| Self-check | "Review your answer against my requirements and list any gaps or weaknesses." |
| Verification list | "List the claims in your answer I should verify, ranked by risk if wrong." |

## 3. Discovery and requirements (Module 5)

**Interview me first**
```
I want to [goal]. Before answering, ask me one question at a time until you have what
you need. Stop after at most [8] questions, then summarise what you learned and
[produce the output].
```

**Assumption check**
```
List the assumptions you're making about my situation, and for each: how much it matters
(high/medium/low) and the question that would confirm or break it.
```

**Notes to requirements**
```
From the meeting notes below, list: goals, requirements, constraints, decisions,
action items (owner, date), and open questions. Quote the line each item came from.
Mark anything ambiguous with [?].
Notes: """[notes]"""
```

**Gap hunt**
```
What is missing, ambiguous or contradictory in this [plan / brief / requirements]?
Rank by risk and suggest the question I should ask to resolve each.
```

## 4. Working with files and data

**Describe before analysing**
```
Describe this file first: structure, columns, row count, period covered, totals,
missing values, duplicates, and anything odd. Don't analyse yet.
```

**Analysis with method**
```
Calculate [metrics] by [dimensions]. Show the results in a table and a [chart type].
Show the method / formulas you used, and list any rows you excluded and why.
```

**Export**
```
Export the results as an Excel file with one sheet per table and formulas visible
where possible.
```

## 5. Critique and improvement (evaluator–optimiser)

Use in a **new chat** for fresh eyes.

```
You are a [sceptical CFO / busy customer / competitor / brand manager / auditor].
Review the [document] below against these criteria: [criteria].
Score each 1–5, list the 3 biggest weaknesses, and suggest a concrete fix for each.
Be direct; don't be polite at the expense of being useful.
Document: """[draft]"""
```

## 6. Research with sources

```
Research [topic] for [region / period]. Prefer [official / primary / recent] sources.
Return a source table: claim · source link · publication date · confidence.
If good data isn't available, say so and give the closest alternative, clearly labelled.
```

## 7. Process mapping (Module 4)

```
Interview me, one question at a time (max 10), about how I currently do [process].
Then write it as numbered steps with input, output and time per step.
Then suggest for each step: AI does it / AI drafts and I review / I do it,
with a check for every AI step and the reason for each choice.
```

## 8. Project instructions template

```
Role: You support [team] at [company] with [area of work].
Audience: [who reads the outputs].
Always: [use the templates in the knowledge files; use our glossary; show calculations; ...]
Never: [invent numbers; use data not provided; give legal/tax conclusions; ...]
When unsure: ask me before proceeding.
Output style: [short bullets first, detail after; tables for numbers; language/tone].
```

## 9. Housekeeping prompts

| Situation | Prompt |
| --- | --- |
| Long chat, starting fresh | "Summarise everything we've agreed so far as a brief I can paste into a new chat." |
| Turn a good chat into a template | "Turn what worked in this conversation into a reusable prompt template with [placeholders]." |
| Create sample data | "Generate a realistic but fictional [CSV/document] for a [company type] with [columns/sections]. Include a few realistic issues." |
| Improve your own prompt | "Here's my prompt and the output I got. What should I change in the prompt to get [desired result]?" |
