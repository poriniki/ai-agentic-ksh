'use strict';
/*
 * Site configuration: how each slide looks and which audience interactions it has.
 *
 * The words on the slides come from ../presentation-draft.md. Edit the draft to
 * change content, and edit this file to change layout or interaction. Then run
 * `npm run build` in this folder.
 *
 * Layouts
 *   title     cover slide
 *   section   a big statement with interactions (breaks, questions, polls)
 *   stack     heading and blocks; interactions sit beside them (placement right) or below
 *   cards     each list item or table row becomes a card
 *   columns   two or three columns from a table, or from the first list items
 *   ladder    the table rows become rising steps, and the poll sits on the steps
 *   flow      table rows become a left-to-right process
 *   pairs     "Before" and "After" panels
 *
 * Interactions (kind)
 *   choice  audience picks one option per item. progressive: items appear one by one.
 *           An item with `answer` (option index) makes an extra reveal step.
 *   open    audience writes a short answer shown as a wall or a word cloud.
 *   timer   a countdown shared by all screens, with optional cues.
 *
 * `items: 'list'` turns the slide's first bullet list into the poll items.
 * `items: 'table:0'` uses the first column of the first table.
 */

module.exports = {
  slides: {
    1: { layout: 'title', visual: 'ladder-mark', build: false },

    2: { layout: 'cards' },

    3: {
      layout: 'section',
      interactions: [
        {
          id: 's03-hands',
          kind: 'choice',
          items: 'list',
          options: ['✋ Yes', 'No'],
          progressive: true
        }
      ]
    },

    4: {
      layout: 'columns',
      columns: 2,
      splitHeadings: true,
      visual: { kind: 'flow', steps: ['Brief', 'Draft', 'Review', 'Improve', 'Reuse'] }
    },

    5: {
      layout: 'ladder',
      marks: { 1: 'Most people today', 3: 'Goal', 4: 'Goal' },
      interactions: [
        {
          id: 's05-level',
          kind: 'choice',
          items: [{ text: 'Where are you today?' }],
          options: ['Ask', 'Brief', 'Equip', 'Chain', 'Delegate'],
          variant: 'ladder'
        }
      ]
    },

    6: { layout: 'stack', listAs: 'steps', visual: { kind: 'timeline' } },

    7: { layout: 'cards' },

    8: { layout: 'stack', visual: { kind: 'next-word', sentence: 'The quarterly results show a', candidates: [{ word: 'strong', pct: 46 }, { word: 'mixed', pct: 31 }, { word: 'record', pct: 12 }], note: 'Illustrative probabilities. A model ranks the next word, it does not look up the answer.' } },

    9: { layout: 'cards' },

    10: { layout: 'stack', visual: { kind: 'desk' } },

    11: { layout: 'stack' },

    12: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's12-predict',
          kind: 'choice',
          items: [{ text: 'Predict: will the answer without tools hold up when we check its sources?', answer: 3 }],
          options: [
            'Every number and source is right',
            'Mostly right, with a few gaps',
            'Some or all of it is invented',
            "I can't tell without checking"
          ],
          explain: "That is the lesson. From the outside, confident and wrong looks the same as confident and right."
        }
      ]
    },

    13: {
      layout: 'columns',
      tones: ['green', 'red'],
      divider: 'jagged',
      placement: 'bottom',
      interactions: [
        {
          id: 's13-frontier',
          kind: 'open',
          prompt: 'Name one task inside the frontier, and one task outside it.',
          display: 'wall'
        }
      ]
    },

    14: { layout: 'cards' },

    15: {
      layout: 'section',
      interactions: [{ id: 's15-pairs', kind: 'timer', label: 'Pair talk', durationSec: 60 }]
    },

    16: { layout: 'cards' },

    17: { layout: 'columns', tones: ['green', 'amber', 'grey'] },

    18: {
      layout: 'cards',
      placement: 'bottom',
      interactions: [
        {
          id: 's18-sort',
          kind: 'choice',
          question: 'Sort each task into a column. Then we check together.',
          items: [
            { text: 'Summarise 40 survey comments into themes', answer: 0 },
            { text: 'Write the executive summary of a proposal', answer: 1 },
            { text: 'Agree the final price with a client', answer: 2 }
          ],
          options: ['AI does it', 'AI drafts, I review', 'I do it'],
          progressive: true,
          explain: 'Test each one with the three questions: what if it is wrong, can I check it quickly, and does it need knowledge only I have?'
        }
      ]
    },

    19: { layout: 'cards' },

    20: { layout: 'pairs' },

    21: { layout: 'pairs' },

    22: { layout: 'cards' },

    23: { layout: 'stack', visual: { kind: 'flow', steps: ['Brief', 'Draft', 'Specific feedback', 'Better draft'], loop: true } },

    24: { layout: 'cards' },

    25: { layout: 'cards' },

    26: {
      layout: 'stack',
      listAs: 'steps',
      placement: 'right',
      interactions: [
        {
          id: 's26-timer',
          kind: 'timer',
          label: 'Exercise 1 · 12 minutes',
          durationSec: 720,
          cues: [{ atSec: 120, text: '2 minutes left: wrap up your brief' }]
        }
      ]
    },

    27: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's27-parts',
          kind: 'choice',
          items: [{ text: 'Which of the 6 parts made the most difference for you?' }],
          options: ['Who', 'Why', 'What', 'How', 'Like this', 'Not this']
        }
      ]
    },

    28: {
      layout: 'section',
      visual: 'ladder-mark',
      interactions: [
        {
          id: 's28-break',
          kind: 'timer',
          label: 'Break',
          durationSec: 600,
          cues: [{ atSec: 60, text: 'Back in 1 minute' }]
        }
      ]
    },

    29: { layout: 'stack' },

    30: { layout: 'stack' },

    31: { layout: 'stack', listAs: ['bullets', 'chips'] },

    32: { layout: 'columns', tones: ['green', 'red'] },

    33: { layout: 'stack' },

    34: { layout: 'stack' },

    35: {
      layout: 'stack',
      visual: {
        kind: 'artifact',
        title: 'Break-even calculator',
        lines: ['Price per unit: 40', 'Variable cost per unit: 16', 'Fixed cost per month: 12,000', 'Break-even: 500 units']
      }
    },

    36: { layout: 'stack' },

    37: { layout: 'cards' },

    38: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's38-prompts',
          kind: 'open',
          prompt: 'Paste one short prompt, instruction or checklist you think the team should share.',
          display: 'wall',
          maxLength: 240
        }
      ]
    },

    39: { layout: 'columns', columns: 2, splitHeadings: true },

    40: { layout: 'flow', buildRows: true, flowCols: { title: 1, who: 2, detail: 3 } },

    41: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's41-patterns',
          kind: 'choice',
          question: 'Which of these do you already do without naming it?',
          items: 'table:0',
          options: ['I already do this', 'Not yet']
        }
      ]
    },

    42: { layout: 'stack', listAs: 'steps' },

    43: { layout: 'columns', columns: 2, splitHeadings: true },

    44: { layout: 'cards' },

    45: {
      layout: 'stack',
      listAs: 'steps',
      placement: 'right',
      interactions: [
        {
          id: 's45-timer',
          kind: 'timer',
          label: 'Exercise 2 · 12 minutes',
          durationSec: 720,
          cues: [{ atSec: 120, text: '2 minutes left' }]
        }
      ]
    },

    46: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's46-saving',
          kind: 'open',
          prompt: 'Your biggest time saving, in a few words',
          display: 'cloud',
          maxLength: 60
        }
      ]
    },

    47: {
      layout: 'section',
      visual: 'ladder-mark',
      interactions: [
        {
          id: 's47-break',
          kind: 'timer',
          label: 'Break',
          durationSec: 600,
          cues: [{ atSec: 60, text: 'Back in 1 minute' }]
        }
      ]
    },

    48: { layout: 'stack' },

    49: { layout: 'cards' },

    50: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's50-pairs',
          kind: 'timer',
          label: 'Exercise 3 · pairs · 8 minutes',
          durationSec: 480,
          cues: [
            { atSec: 240, text: 'Swap roles now' },
            { atSec: 60, text: '1 minute left' }
          ]
        }
      ]
    },

    51: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's51-question',
          kind: 'open',
          prompt: "What question did the AI ask that you hadn't thought of?",
          display: 'wall'
        }
      ]
    },

    52: { layout: 'stack', callout: true },

    53: {
      layout: 'section',
      tones: ['green', 'amber', 'red'],
      revealWithAnswers: true,
      interactions: [
        {
          id: 's53-light',
          kind: 'choice',
          question: 'Green, amber or red? Decide for each one.',
          items: [
            { text: 'A draft plan for next quarter, with no client names', answer: 1 },
            { text: 'Our customer list with email addresses', answer: 2 },
            { text: 'A one-page fictional sample dataset for training', answer: 0 },
            { text: 'Monthly figures, aggregated and anonymised', answer: 1 },
            { text: 'Unreleased financial results for this quarter', answer: 2 },
            { text: 'A brochure we have already published', answer: 0 }
          ],
          options: ['🟢 Green', '🟡 Amber', '🔴 Red'],
          progressive: false
        }
      ]
    },

    54: { layout: 'cards' },

    55: { layout: 'cards' },

    56: {
      layout: 'section',
      interactions: [
        {
          id: 's56-pitfalls',
          kind: 'choice',
          question: 'Which of these do you recognise in your team? (show of hands, no names)',
          items: 'list',
          options: ['Yes, we do this', 'Not that I can see']
        }
      ]
    },

    57: { layout: 'cards' },

    58: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's58-teams',
          kind: 'open',
          prompt: 'Team name, and the first names of your members',
          display: 'wall',
          maxLength: 120
        }
      ]
    },

    59: {
      layout: 'stack',
      placement: 'right',
      interactions: [
        {
          id: 's59-start',
          kind: 'choice',
          items: [{ text: 'Which one will you start with this week?' }],
          options: [
            'AI Fluency (Anthropic Academy)',
            'Generative AI for Everyone',
            'Prompt Engineering for ChatGPT',
            'Building effective agents',
            'One Useful Thing (newsletter)'
          ]
        }
      ]
    },

    60: {
      layout: 'cards',
      placement: 'bottom',
      interactions: [
        {
          id: 's60-commit',
          kind: 'open',
          prompt: 'Next week I will use AI for ___ at Level ___.',
          display: 'wall',
          maxLength: 140
        }
      ]
    },

    61: {
      layout: 'section',
      interactions: [
        {
          id: 's61-now',
          kind: 'choice',
          items: [{ text: 'Where are you now, compared with the start?' }],
          options: ['Ask', 'Brief', 'Equip', 'Chain', 'Delegate'],
          variant: 'ladder'
        },
        {
          id: 's61-questions',
          kind: 'open',
          prompt: 'Your question for the room',
          display: 'wall',
          maxLength: 200
        }
      ]
    }
  }
};
