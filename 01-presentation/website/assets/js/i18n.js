/*
 * Interface strings for every page, in English and Persian (Farsi).
 *
 * The language comes from the deck data (window.AIPRO_DECK.lang), so the same
 * scripts serve /index.html (English) and /fa/index.html (Persian).
 * tools/build-pages.js also uses this file to write the static text of the
 * Persian pages. Slide content is not here: it comes from the drafts.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.AIPro = root.AIPro || {};
    root.AIPro.i18n = api;
    if (root.AIPRO_DECK && root.AIPRO_DECK.lang) api.setLang(root.AIPRO_DECK.lang);
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var STRINGS = {
    en: {
      'page.deckTitle': 'The AI-Powered Professional',
      'page.deckDescription': 'Interactive workshop deck: practical AI for Marketing, Business and Finance teams, with live audience polls.',
      'page.presenterTitle': 'Presenter console · AI-Powered Professional',
      'page.joinTitle': 'Join · AI-Powered Professional',

      // Separates short facts: "Exercise · 12 min", "12 · 46%".
      'sep': ' · ',

      'status.connecting': 'Connecting…',
      'status.live.one': '● Live · {n} screen',
      'status.live.many': '● Live · {n} screens',
      'status.viewOnly': ' · view only',
      'status.reconnecting': '○ Reconnecting to the server…',
      'status.local': 'Local mode · start the server for audience phones',

      'toast.viewOnly': 'View only. Open the presenter link to move the slides.',
      'toast.viewOnlyStart': 'View only. Use the presenter link to move the slides.',
      'toast.moveFailed': 'Could not move the slides.',

      'join.label': 'Join on your phone',
      'join.needsServer': 'Needs the live server (npm start)',
      'join.cover': 'Join the live polls on your phone',
      'join.coverOffline': 'Live polls need the server: run npm start',
      'join.offlineNote': 'Audience phones need the live server. Run "npm start" in the website folder, then reload this page.',

      'overview.title': 'All slides',
      'goto.title': 'Go to slide',
      'goto.hint': 'Press Enter',
      'goto.label': 'Slide number',
      'help.title': 'Keyboard',
      'help.rows': [
        ['→  Space  Enter', 'Next step or slide'],
        ['←  Backspace', 'Previous step or slide'],
        ['Home  End', 'First or last slide'],
        ['O', 'All slides'],
        ['G', 'Go to a slide number'],
        ['Q', 'Join QR code for the audience'],
        ['B  .', 'Blackout, for breaks'],
        ['T', 'Light or dark theme'],
        ['F', 'Full screen'],
        ['P', 'Presenter console (notes and timers)'],
        ['Esc', 'Close this panel']
      ],
      'help.otherLanguage': 'Persian version',
      'slide.aria': 'Slide {n} of {total}: {title}',
      'slide.count': '{n} / {total}',
      'blackout.text': 'Back soon',
      'hint.keys': '← → move · O all slides · G go to · Q join QR · P presenter · ? keys',
      'nav.prev': 'Previous slide',
      'nav.next': 'Next slide',
      'nav.prevGlyph': '‹',
      'nav.nextGlyph': '›',
      'panel.label': 'Deck panel',
      'panel.close': 'Close',

      'ix.livePoll': 'Live poll',
      'ix.yourAnswers': 'Your answers',
      'ix.answers.one': '{n} answer',
      'ix.answers.many': '{n} answers',
      'ix.waiting': 'Press → to reveal the first one',
      'ix.wallEmpty': 'Answers will appear here as the room writes them.',
      'ix.cloudEmpty': 'Answers will gather here.',
      'ix.saving': 'Saving…',
      'ix.saved': 'Thanks. Your answer is in.',
      'ix.answer': 'Answer: {option}.',
      'ix.tooShort': 'Please write a few words.',
      'ix.sending': 'Sending…',
      'ix.sent': 'Sent. Thank you!',
      'ix.soFar.one': '{n} answer so far',
      'ix.soFar.many': '{n} answers so far',
      'ix.send': 'Send',
      'ix.placeholder': 'Type your answer',
      'timer.done': 'Time is up',
      'timer.running': 'Running',
      'timer.paused': 'Paused',
      'timer.ready': 'Ready',

      'err.not_on_screen': 'This question is not on screen any more.',
      'err.not_open': 'This item is not open yet.',
      'err.closed': 'Voting is closed for this question.',
      'err.too_short': 'Please write a few words.',
      'err.limit': 'You have sent the maximum number of answers here.',
      'err.rate': 'Too many answers. Slow down a little.',
      'err.key': 'Presenter key missing or wrong.',
      'err.network': 'Could not reach the presenter. Check the Wi-Fi.',
      'err.generic': 'Something went wrong. Try again.',

      'pairs.before': 'Before',
      'pairs.after': 'After',
      'flow.green': 'AI does it',
      'flow.amber': 'AI drafts, you review',
      'flow.grey': 'You do it',
      'col.option': 'Option {n}',
      'timeline.module': 'M{n}',

      'pc.title': 'Presenter console',
      'pc.toastControl': 'Open this console with the presenter link (it ends with ?key=…) to control the slides.',
      'pc.step': 'Step {k} of {n}',
      'pc.noSteps': 'No build steps',
      'pc.slideOf': 'Slide {n} of {total}',
      'pc.noNotes': 'No speaker notes for this slide.',
      'pc.noBrief': 'No design brief.',
      'pc.last': 'Last slide.',
      'pc.tableRows': 'Table: {n} rows',
      'pc.planned': 'Planned start {time} ({block})',
      'pc.clockStart': 'Start session clock',
      'pc.clockReset': 'Reset clock',
      'pc.clockStop': 'Stop',
      'pc.behind': '{n} min behind the plan',
      'pc.ahead': '{n} min ahead of the plan',
      'pc.onPlan': 'On plan',
      'pc.noTimer': 'No timer on this slide.',
      'pc.timerTotal': '{label} · {time} total',
      'pc.pause': 'Pause',
      'pc.resume': 'Resume',
      'pc.start': 'Start',
      'pc.reset': 'Reset',
      'pc.noQuestions': 'No questions for the audience on this slide.',
      'pc.nothingToModerate': 'Nothing to moderate on this slide.',
      'pc.noAnswers': 'No answers yet.',
      'pc.hide': 'Hide',
      'pc.screens.one': '{n} screen connected',
      'pc.screens.many': '{n} screens connected',
      'pc.localPhones': 'Local mode: audience phones are not connected',
      'pc.statusLive': '● Live server',
      'pc.statusReconnecting': '○ Reconnecting…',
      'pc.statusLocal': 'Local mode (this browser only)',
      'pc.statusViewOnly': ' · view only (open with the presenter link)',
      'pc.audiencePage': 'Audience page: {url}',
      'pc.audienceNeedsServer': 'Audience page (needs the live server)',
      'pc.gotoRange': 'Enter a slide number from 1 to {n}.',
      'pc.confirmClock': 'Reset the session clock to 0:00?',
      'pc.resetNeedsKey': 'Open with the presenter link to reset.',
      'pc.cleared': 'Cleared.',
      'pc.confirmVotes': 'Clear all poll answers?',
      'pc.confirmResponses': 'Clear all open answers?',
      'pc.confirmAll': 'Reset everything: slide back to 1, all answers and timers cleared?',
      'pc.openDeck': 'Open deck',
      'pc.audience': 'Audience page',
      'pc.export': 'Export results',
      'pc.notes': 'Speaker notes',
      'pc.fillins': 'Fill-ins on this slide',
      'pc.brief': 'Design brief from the draft',
      'pc.backBtn': '← Back',
      'pc.nextBtn': 'Next →',
      'pc.navHint': 'Next reveals the next bullet, poll item or answer, then the next slide. Keys: ← → Space.',
      'pc.goto': 'Go to slide',
      'pc.go': 'Go',
      'pc.timers': 'Timers on this slide',
      'pc.live': 'Live on this slide',
      'pc.open': 'Open answers (hide any you do not want shown)',
      'pc.upNext': 'Up next',
      'pc.reactions': 'Audience reactions',
      'pc.resetTitle': 'Reset',
      'pc.clearVotes': 'Clear poll answers',
      'pc.clearOpen': 'Clear open answers',
      'pc.resetAll': 'Reset everything',
      'pc.allSlides': 'All slides',
      'pc.otherLanguage': 'فارسی',
      'pc.otherLanguageHref': 'fa/presenter.html',
      'pc.ariaCurrent': 'Current slide',
      'pc.ariaControls': 'Controls',
      'pc.ariaUpcoming': 'Upcoming and all slides',
      'pc.ariaLinks': 'Links',
      'lang.otherCode': 'fa',

      'ph.live': 'Live with the presenter',
      'ph.reconnecting': 'Reconnecting…',
      'ph.local': 'Not connected to a live session',
      'ph.connecting': 'Connecting…',
      'ph.slideLine': 'Slide {n} of {total} · {title}',
      'ph.quiet': 'No question on this slide. Follow along on the screen.',
      'ph.noText': 'This slide is a picture or a break.',
      'ph.offline': 'Answers need the live session. Ask the presenter to start it, then reload this page.',
      'ph.readText': 'Read the slide text',
      'ph.reactionsLabel': 'Quick reactions',
      'ph.otherLanguage': 'فارسی',
      'ph.otherLanguageHref': 'fa/join',
      'react.got': 'Got it',
      'react.question': 'Question',
      'react.insight': 'Insight',
      'react.slow': 'Slow down'
    },

    fa: {
      'page.deckTitle': 'حرفه‌ای توانمند با هوش مصنوعی',
      'page.deckDescription': 'ارائه‌ی تعاملی کارگاه: هوش مصنوعی کاربردی برای تیم‌های بازاریابی، کسب‌وکار و مالی، با نظرسنجی زنده.',
      'page.presenterTitle': 'میز ارائه‌دهنده · حرفه‌ای توانمند با هوش مصنوعی',
      'page.joinTitle': 'ورود · حرفه‌ای توانمند با هوش مصنوعی',

      // A comma, not "·": next to Persian digits the dot reads as the digit ۰.
      'sep': '، ',

      'status.connecting': 'در حال اتصال…',
      'status.live.one': '● زنده، {n} صفحه',
      'status.live.many': '● زنده، {n} صفحه',
      'status.viewOnly': ' · فقط نمایش',
      'status.reconnecting': '○ در حال اتصال دوباره به سرور…',
      'status.local': 'حالت محلی · برای گوشی‌های حاضران، سرور را اجرا کنید',

      'toast.viewOnly': 'فقط نمایش. برای جابه‌جا کردن اسلایدها، پیوند ارائه‌دهنده را باز کنید.',
      'toast.viewOnlyStart': 'فقط نمایش. برای جابه‌جا کردن اسلایدها از پیوند ارائه‌دهنده استفاده کنید.',
      'toast.moveFailed': 'جابه‌جا کردن اسلایدها انجام نشد.',

      'join.label': 'با گوشی وارد شوید',
      'join.needsServer': 'به سرور زنده نیاز دارد (npm start)',
      'join.cover': 'با گوشی در نظرسنجی‌های زنده شرکت کنید',
      'join.coverOffline': 'نظرسنجی زنده به سرور نیاز دارد: npm start را اجرا کنید',
      'join.offlineNote': 'گوشی‌های حاضران به سرور زنده نیاز دارند. در پوشه‌ی website دستور «npm start» را اجرا کنید و این صفحه را دوباره بارگذاری کنید.',

      'overview.title': 'همه‌ی اسلایدها',
      'goto.title': 'رفتن به اسلاید',
      'goto.hint': 'Enter را بزنید',
      'goto.label': 'شماره‌ی اسلاید',
      'help.title': 'صفحه‌کلید',
      'help.rows': [
        ['→  Space  Enter', 'گام یا اسلاید بعدی'],
        ['←  Backspace', 'گام یا اسلاید قبلی'],
        ['Home  End', 'اسلاید اول یا آخر'],
        ['O', 'همه‌ی اسلایدها'],
        ['G', 'رفتن به شماره‌ی اسلاید'],
        ['Q', 'کد QR ورود حاضران'],
        ['B  .', 'صفحه‌ی سیاه، برای استراحت'],
        ['T', 'پوسته‌ی روشن یا تیره'],
        ['F', 'تمام‌صفحه'],
        ['P', 'میز ارائه‌دهنده (یادداشت‌ها و زمان‌سنج‌ها)'],
        ['Esc', 'بستن این پنجره']
      ],
      'help.otherLanguage': 'English version',
      'slide.aria': 'اسلاید {n} از {total}: {title}',
      'slide.count': '{n} / {total}',
      'blackout.text': 'به‌زودی برمی‌گردیم',
      'hint.keys': '← → جابه‌جایی · O همه‌ی اسلایدها · G رفتن · Q کد ورود · P میز ارائه‌دهنده · ? کلیدها',
      'nav.prev': 'اسلاید قبلی',
      'nav.next': 'اسلاید بعدی',
      'nav.prevGlyph': '›',
      'nav.nextGlyph': '‹',
      'panel.label': 'پنجره‌ی ارائه',
      'panel.close': 'بستن',

      'ix.livePoll': 'نظرسنجی زنده',
      'ix.yourAnswers': 'پاسخ‌های شما',
      'ix.answers.one': '{n} پاسخ',
      'ix.answers.many': '{n} پاسخ',
      'ix.waiting': 'برای نمایش اولین مورد، «بعدی» را بزنید',
      'ix.wallEmpty': 'پاسخ‌ها هم‌زمان با نوشتنِ حاضران همین‌جا نمایش داده می‌شوند.',
      'ix.cloudEmpty': 'پاسخ‌ها اینجا جمع می‌شوند.',
      'ix.saving': 'در حال ثبت…',
      'ix.saved': 'ممنون. پاسخ شما ثبت شد.',
      'ix.answer': 'پاسخ: {option}.',
      'ix.tooShort': 'لطفاً چند کلمه بنویسید.',
      'ix.sending': 'در حال ارسال…',
      'ix.sent': 'ارسال شد. ممنون!',
      'ix.soFar.one': 'تا اینجا {n} پاسخ',
      'ix.soFar.many': 'تا اینجا {n} پاسخ',
      'ix.send': 'ارسال',
      'ix.placeholder': 'پاسخ خود را بنویسید',
      'timer.done': 'زمان تمام شد',
      'timer.running': 'در حال اجرا',
      'timer.paused': 'متوقف',
      'timer.ready': 'آماده',

      'err.not_on_screen': 'این پرسش دیگر روی صفحه نیست.',
      'err.not_open': 'این مورد هنوز باز نشده است.',
      'err.closed': 'رأی‌گیری این پرسش بسته شده است.',
      'err.too_short': 'لطفاً چند کلمه بنویسید.',
      'err.limit': 'به سقف تعداد پاسخ‌ها برای این پرسش رسیده‌اید.',
      'err.rate': 'پاسخ‌ها خیلی پشت سر هم است. کمی آهسته‌تر.',
      'err.key': 'کلید ارائه‌دهنده وارد نشده یا نادرست است.',
      'err.network': 'اتصال به ارائه‌دهنده برقرار نشد. وای‌فای را بررسی کنید.',
      'err.generic': 'مشکلی پیش آمد. دوباره امتحان کنید.',

      'pairs.before': 'قبل',
      'pairs.after': 'بعد',
      'flow.green': 'هوش مصنوعی انجام می‌دهد',
      'flow.amber': 'هوش مصنوعی پیش‌نویس می‌کند، شما بازبینی می‌کنید',
      'flow.grey': 'خودتان انجام می‌دهید',
      'col.option': 'گزینه‌ی {n}',
      'timeline.module': 'ماژول {n}',

      'pc.title': 'میز ارائه‌دهنده',
      'pc.toastControl': 'برای کنترل اسلایدها، این صفحه را با پیوند ارائه‌دهنده (که با ?key=… تمام می‌شود) باز کنید.',
      'pc.step': 'گام {k} از {n}',
      'pc.noSteps': 'بدون گام',
      'pc.slideOf': 'اسلاید {n} از {total}',
      'pc.noNotes': 'این اسلاید یادداشتی ندارد.',
      'pc.noBrief': 'شرح طراحی ندارد.',
      'pc.last': 'آخرین اسلاید.',
      'pc.tableRows': 'جدول: {n} ردیف',
      'pc.planned': 'شروع طبق برنامه {time} ({block})',
      'pc.clockStart': 'شروع ساعت جلسه',
      'pc.clockReset': 'از نو',
      'pc.clockStop': 'توقف',
      'pc.behind': '{n} دقیقه عقب‌تر از برنامه',
      'pc.ahead': '{n} دقیقه جلوتر از برنامه',
      'pc.onPlan': 'طبق برنامه',
      'pc.noTimer': 'این اسلاید زمان‌سنج ندارد.',
      'pc.timerTotal': '{label}، در مجموع {time}',
      'pc.pause': 'توقف',
      'pc.resume': 'ادامه',
      'pc.start': 'شروع',
      'pc.reset': 'از نو',
      'pc.noQuestions': 'این اسلاید پرسشی برای حاضران ندارد.',
      'pc.nothingToModerate': 'در این اسلاید چیزی برای بازبینی نیست.',
      'pc.noAnswers': 'هنوز پاسخی نیامده است.',
      'pc.hide': 'پنهان کن',
      'pc.screens.one': '{n} صفحه متصل است',
      'pc.screens.many': '{n} صفحه متصل است',
      'pc.localPhones': 'حالت محلی: گوشی‌های حاضران متصل نیستند',
      'pc.statusLive': '● سرور زنده',
      'pc.statusReconnecting': '○ در حال اتصال دوباره…',
      'pc.statusLocal': 'حالت محلی (فقط همین مرورگر)',
      'pc.statusViewOnly': ' · فقط نمایش (با پیوند ارائه‌دهنده باز کنید)',
      'pc.audiencePage': 'صفحه‌ی حاضران: {url}',
      'pc.audienceNeedsServer': 'صفحه‌ی حاضران (به سرور زنده نیاز دارد)',
      'pc.gotoRange': 'شماره‌ی اسلایدی بین ۱ تا {n} وارد کنید.',
      'pc.confirmClock': 'ساعت جلسه از صفر شروع شود؟',
      'pc.resetNeedsKey': 'برای پاک کردن، صفحه را با پیوند ارائه‌دهنده باز کنید.',
      'pc.cleared': 'پاک شد.',
      'pc.confirmVotes': 'همه‌ی پاسخ‌های نظرسنجی پاک شود؟',
      'pc.confirmResponses': 'همه‌ی پاسخ‌های تشریحی پاک شود؟',
      'pc.confirmAll': 'همه‌چیز از نو شروع شود؟ (بازگشت به اسلاید ۱ و پاک شدن همه‌ی پاسخ‌ها و زمان‌سنج‌ها)',
      'pc.openDeck': 'باز کردن ارائه',
      'pc.audience': 'صفحه‌ی حاضران',
      'pc.export': 'خروجی نتایج',
      'pc.notes': 'یادداشت‌های ارائه‌دهنده',
      'pc.fillins': 'جاهای خالی این اسلاید',
      'pc.brief': 'شرح طراحی از پیش‌نویس',
      'pc.backBtn': '→ قبلی',
      'pc.nextBtn': 'بعدی ←',
      'pc.navHint': '«بعدی» مورد بعدی، گزینه‌ی بعدی نظرسنجی یا پاسخ را نشان می‌دهد و بعد به اسلاید بعد می‌رود. کلیدها: ← → Space.',
      'pc.goto': 'رفتن به اسلاید',
      'pc.go': 'برو',
      'pc.timers': 'زمان‌سنج‌های این اسلاید',
      'pc.live': 'زنده در این اسلاید',
      'pc.open': 'پاسخ‌های تشریحی (هر پاسخی را که نباید نمایش داده شود پنهان کنید)',
      'pc.upNext': 'اسلاید بعد',
      'pc.reactions': 'واکنش‌های حاضران',
      'pc.resetTitle': 'پاک کردن',
      'pc.clearVotes': 'پاک کردن پاسخ‌های نظرسنجی',
      'pc.clearOpen': 'پاک کردن پاسخ‌های تشریحی',
      'pc.resetAll': 'شروع دوباره‌ی همه‌چیز',
      'pc.allSlides': 'همه‌ی اسلایدها',
      'pc.otherLanguage': 'English',
      'pc.otherLanguageHref': '../presenter.html',
      'pc.ariaCurrent': 'اسلاید فعلی',
      'pc.ariaControls': 'کنترل‌ها',
      'pc.ariaUpcoming': 'اسلاید بعد و همه‌ی اسلایدها',
      'pc.ariaLinks': 'پیوندها',
      'lang.otherCode': 'en',

      'ph.live': 'هم‌زمان با ارائه‌دهنده',
      'ph.reconnecting': 'در حال اتصال دوباره…',
      'ph.local': 'به جلسه‌ی زنده وصل نیست',
      'ph.connecting': 'در حال اتصال…',
      'ph.slideLine': 'اسلاید {n} از {total}: {title}',
      'ph.quiet': 'این اسلاید پرسشی ندارد. روی صفحه همراه باشید.',
      'ph.noText': 'این اسلاید تصویر یا زمان استراحت است.',
      'ph.offline': 'برای پاسخ دادن، جلسه‌ی زنده لازم است. از ارائه‌دهنده بخواهید آن را اجرا کند و بعد این صفحه را دوباره بارگذاری کنید.',
      'ph.readText': 'خواندن متن اسلاید',
      'ph.reactionsLabel': 'واکنش سریع',
      'ph.otherLanguage': 'English',
      'ph.otherLanguageHref': '../join',
      'react.got': 'فهمیدم',
      'react.question': 'سؤال دارم',
      'react.insight': 'نکته‌ی جالب',
      'react.slow': 'آهسته‌تر'
    }
  };

  // Words left out of the word cloud.
  var STOPWORDS = {
    en: ('the and for with that this from into your you our are was but not all can will just its it a an of to in ' +
      'on at by or is be as if my me we they them their about more than then there these those have has had do ' +
      'does so up out no yes what when how who which where i don\'t isn\'t it\'s we\'re very also one').split(' '),
    fa: ('و در به از که این آن را با برای است هست بود شد شود می نمی یک هم تا یا اما اگر بر هر چه ها های ای ' +
      'کرد کردن کنم کند کنیم کنید کنند داریم دارد دارند باشد باشیم خود ما من شما او آنها همه خیلی بسیار دیگر روی ' +
      'پیش پس بین همین همان چون باید نیز وقتی زمان یعنی ولی بله نه چی چیزی کار').split(' ')
  };

  var PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  var lang = 'en';

  function setLang(next) {
    lang = STRINGS[next] ? next : 'en';
  }

  // Persian pages show Persian digits; machine data (times, ids, URLs) stays Latin underneath.
  function digits(value) {
    var s = String(value);
    if (lang !== 'fa') return s;
    return s.replace(/[0-9]/g, function (d) { return PERSIAN_DIGITS[+d]; });
  }

  function t(key, vars) {
    var table = STRINGS[lang] || STRINGS.en;
    var s = table[key] !== undefined ? table[key] : STRINGS.en[key];
    if (s === undefined) return key;
    if (typeof s !== 'string') return s;
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      if (vars[k] === undefined) return m;
      return typeof vars[k] === 'number' ? digits(vars[k]) : String(vars[k]);
    });
  }

  // tn('ix.answers', 3) uses 'ix.answers.one' or 'ix.answers.many'.
  function tn(base, n, vars) {
    return t(base + (n === 1 ? '.one' : '.many'), Object.assign({ n: n }, vars || {}));
  }

  function percent(p) {
    return lang === 'fa' ? digits(p) + '٪' : p + '%';
  }

  return {
    STRINGS: STRINGS,
    setLang: setLang,
    lang: function () { return lang; },
    dir: function () { return lang === 'fa' ? 'rtl' : 'ltr'; },
    t: t,
    tn: tn,
    digits: digits,
    percent: percent,
    stopwords: function () {
      var set = {};
      (STOPWORDS[lang] || STOPWORDS.en).forEach(function (w) { set[w] = true; });
      return set;
    }
  };
});
