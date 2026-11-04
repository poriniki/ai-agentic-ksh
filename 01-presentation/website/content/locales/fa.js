'use strict';
/*
 * Persian text for the parts of ../site-config.js that hold words: poll questions
 * and options, open-question prompts, timer labels and cues, and the text inside
 * slide visuals. Layout, timing, answers and ids stay in site-config.js, so both
 * languages always run the same session.
 *
 * Slide text comes from ../../../presentation-draft.fa.md.
 *
 * The build stops with "Translation incomplete" when a string here is missing,
 * when a list has a different length from the English one, or when an id or key
 * is not in site-config.js. Run `npm run build` after editing.
 *
 * Avoid "·" next to Persian digits: it looks like the digit ۰. Use "،" instead.
 */

const LEVELS = ['پرسش', 'بریف', 'تجهیز', 'زنجیره', 'واگذاری'];
const BREAK = { label: 'استراحت', cues: ['یک دقیقه‌ی دیگر برمی‌گردیم'] };

module.exports = {
  slides: {
    4: {
      visual: { steps: ['بریف', 'پیش‌نویس', 'بازبینی', 'بهبود', 'استفاده‌ی دوباره'] }
    },

    5: {
      marks: { 1: 'جایگاه بیشتر افراد امروز', 3: 'هدف', 4: 'هدف' }
    },

    8: {
      visual: {
        label: 'کلمه‌ی بعدی چیست؟',
        sentence: 'گزارش فصلی نشان می‌دهد که فروش',
        candidates: [{ word: 'رشد', pct: 46 }, { word: 'افت', pct: 31 }, { word: 'رکورد', pct: 12 }],
        note: 'احتمال‌ها نمایشی‌اند. مدل کلمه‌ی بعدی را رتبه‌بندی می‌کند، نه اینکه پاسخ را جست‌وجو کند.'
      }
    },

    10: {
      visual: {
        set: 'پروژه: میزی که از قبل آماده است',
        papers: ['پرامپت', 'فایل‌ها', 'دستورالعمل‌ها'],
        empty: 'چت جدید: میز خالی',
        emptyNote: 'هنوز چیزی اینجا نیست'
      }
    },

    23: {
      visual: {
        steps: ['بریف', 'پیش‌نویس', 'بازخورد مشخص', 'پیش‌نویس بهتر'],
        loopNote: 'با بازخورد تکرار کنید تا به اندازه‌ی کافی خوب شود'
      }
    },

    35: {
      visual: {
        prompt: 'یک ماشین‌حساب نقطه‌ی سربه‌سر برایم بساز که بتوانم تغییرش دهم.',
        tag: 'Artifact · کنار چت',
        title: 'ماشین‌حساب نقطه‌ی سربه‌سر',
        lines: ['قیمت هر واحد: ۴۰', 'هزینه‌ی متغیر هر واحد: ۱۶', 'هزینه‌ی ثابت ماهانه: ۱۲٬۰۰۰', 'نقطه‌ی سربه‌سر: ۵۰۰ واحد']
      }
    }
  },

  interactions: {
    's03-hands': { options: ['✋ بله', 'نه'] },

    's05-level': {
      items: ['امروز کجای نردبان هستید؟'],
      options: LEVELS
    },

    's12-predict': {
      items: ['پیش‌بینی کنید: وقتی منابع پاسخِ بدون ابزار را بررسی کنیم، درست از آب درمی‌آید؟'],
      options: [
        'همه‌ی عددها و منابع درست است',
        'بیشترش درست است، با چند ایراد',
        'بخشی یا همه‌اش ساختگی است',
        'بدون بررسی نمی‌توانم بگویم'
      ],
      explain: 'درس همین است: از بیرون، «با اطمینان و غلط» درست مثل «با اطمینان و درست» به نظر می‌رسد.'
    },

    's13-frontier': { prompt: 'یک کار درون مرز و یک کار بیرون از مرز نام ببرید.' },

    's15-pairs': { label: 'گفت‌وگوی دونفره' },

    's18-sort': {
      question: 'هر کار را در یک ستون قرار دهید. بعد با هم بررسی می‌کنیم.',
      items: [
        'خلاصه کردن ۴۰ نظر نظرسنجی در قالب چند موضوع',
        'نوشتن خلاصه‌ی مدیریتی یک پیشنهاد',
        'توافق بر سر قیمت نهایی با مشتری'
      ],
      // Short enough for one line on the poll; the matrix on slide 17 has the full wording.
      options: ['هوش مصنوعی انجام می‌دهد', 'هوش مصنوعی + بازبینی من', 'خودم انجام می‌دهم'],
      explain: 'هر کدام را با سه پرسش بسنجید: اگر غلط باشد چه می‌شود، آیا سریع می‌توانم بررسی‌اش کنم، و آیا دانشی لازم دارد که فقط من دارم؟'
    },

    's26-timer': {
      label: 'تمرین ۱، ۱۲ دقیقه',
      cues: ['۲ دقیقه مانده: بریفتان را جمع‌بندی کنید']
    },

    's27-parts': {
      items: ['کدام‌یک از ۶ بخش برای شما بیشترین تفاوت را ایجاد کرد؟'],
      options: ['چه کسی', 'چرا', 'چه چیزی', 'چگونه', 'مثل این', 'نه این']
    },

    's28-break': BREAK,

    's38-prompts': {
      prompt: 'یک پرامپت، دستورالعمل یا چک‌لیست کوتاه که به نظرتان تیم باید داشته باشد، اینجا بنویسید.'
    },

    's41-patterns': {
      question: 'کدام‌یک از این‌ها را بدون اینکه اسمی رویش بگذارید، همین حالا انجام می‌دهید؟',
      options: ['همین حالا انجامش می‌دهم', 'هنوز نه']
    },

    's45-timer': {
      label: 'تمرین ۲، ۱۲ دقیقه',
      cues: ['۲ دقیقه مانده']
    },

    's46-saving': { prompt: 'بزرگ‌ترین صرفه‌جویی زمانی شما، در چند کلمه' },

    's47-break': BREAK,

    's50-pairs': {
      label: 'تمرین ۳، دونفره، ۸ دقیقه',
      cues: ['حالا نقش‌ها را عوض کنید', 'یک دقیقه مانده']
    },

    's51-question': { prompt: 'هوش مصنوعی چه پرسشی از شما کرد که به فکرتان نرسیده بود؟' },

    's53-light': {
      question: 'سبز، زرد یا قرمز؟ برای هر مورد تصمیم بگیرید.',
      items: [
        'برنامه‌ی پیش‌نویس فصل آینده، بدون نام مشتری‌ها',
        'فهرست مشتریان ما همراه با نشانی ایمیل',
        'یک مجموعه‌داده‌ی نمونه‌ی ساختگی یک‌صفحه‌ای برای آموزش',
        'ارقام ماهانه، تجمیع‌شده و بی‌نام‌شده',
        'نتایج مالی منتشرنشده‌ی همین فصل',
        'بروشوری که قبلاً منتشر کرده‌ایم'
      ],
      options: ['🟢 سبز', '🟡 زرد', '🔴 قرمز']
    },

    's56-pitfalls': {
      question: 'کدام‌یک از این‌ها را در تیم خود می‌بینید؟ (بدون نام بردن از کسی)',
      options: ['بله، در تیم ما هست', 'تا جایی که می‌بینم، نه']
    },

    's58-teams': { prompt: 'نام تیم و نام کوچک اعضای آن' },

    's59-start': {
      items: ['این هفته از کدام شروع می‌کنید؟'],
      // A Persian word first keeps each English name in one piece in right-to-left text.
      options: [
        'دوره‌ی AI Fluency',
        'دوره‌ی Generative AI for Everyone',
        'دوره‌ی Prompt Engineering for ChatGPT',
        'مقاله‌ی Building effective agents',
        'خبرنامه‌ی One Useful Thing'
      ]
    },

    's60-commit': { prompt: 'هفته‌ی آینده از هوش مصنوعی برای ___ در سطح ___ استفاده می‌کنم.' },

    's61-now': {
      items: ['الان کجای نردبان هستید، در مقایسه با شروع کارگاه؟'],
      options: LEVELS
    },

    's61-questions': { prompt: 'پرسش شما از جمع' }
  }
};
