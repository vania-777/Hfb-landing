/* Choice & Reward («انتخاب و پاداش») — HFB Play Together prototype.
   Plain JS, no dependencies, works offline. Prototype — not a clinical tool. */
(function () {
  'use strict';

  var GOAL = 5; // stars needed for the celebration screen
  var root = document.documentElement;

  /* ---------- Content ---------- */
  var ITEMS = {
    food: [
      { id: 'apple', e: '🍎', fa: 'سیب', en: 'Apple', enS: 'the apple' },
      { id: 'cookie', e: '🍪', fa: 'کلوچه', en: 'Cookie', enS: 'the cookie' },
      { id: 'banana', e: '🍌', fa: 'موز', en: 'Banana', enS: 'the banana' },
      { id: 'grapes', e: '🍇', fa: 'انگور', en: 'Grapes', enS: 'the grapes' },
      { id: 'strawberry', e: '🍓', fa: 'توت‌فرنگی', en: 'Strawberry', enS: 'the strawberry' },
      { id: 'watermelon', e: '🍉', fa: 'هندوانه', en: 'Watermelon', enS: 'the watermelon' },
      { id: 'juice', e: '🧃', fa: 'آبمیوه', en: 'Juice', enS: 'juice' },
      { id: 'milk', e: '🥛', fa: 'شیر', en: 'Milk', enS: 'milk' }
    ],
    toys: [
      { id: 'teddy', e: '🧸', fa: 'خرس عروسکی', en: 'Teddy', enS: 'the teddy' },
      { id: 'car', e: '🚗', fa: 'ماشین', en: 'Car', enS: 'the car' },
      { id: 'ball', e: '⚽', fa: 'توپ', en: 'Ball', enS: 'the ball' },
      { id: 'puzzle', e: '🧩', fa: 'پازل', en: 'Puzzle', enS: 'the puzzle' },
      { id: 'blocks', e: '🧱', fa: 'بلوک‌ها', en: 'Blocks', enS: 'the blocks' },
      { id: 'kite', e: '🪁', fa: 'بادبادک', en: 'Kite', enS: 'the kite' },
      { id: 'robot', e: '🤖', fa: 'ربات', en: 'Robot', enS: 'the robot' },
      { id: 'train', e: '🚂', fa: 'قطار', en: 'Train', enS: 'the train' }
    ],
    activities: [
      { id: 'music', e: '🎵', fa: 'موسیقی', en: 'Music', enS: 'music' },
      { id: 'bubbles', e: '🫧', fa: 'حباب', en: 'Bubbles', enS: 'bubbles' },
      { id: 'drawing', e: '🎨', fa: 'نقاشی', en: 'Drawing', enS: 'drawing' },
      { id: 'book', e: '📖', fa: 'کتاب', en: 'Book', enS: 'a book' },
      { id: 'dance', e: '💃', fa: 'رقص', en: 'Dancing', enS: 'dancing' },
      { id: 'hug', e: '🤗', fa: 'بغل', en: 'Hug', enS: 'a hug' },
      { id: 'swing', e: '🌳', fa: 'پارک', en: 'Park', enS: 'the park' },
      { id: 'clap', e: '👏', fa: 'دست زدن', en: 'Clapping', enS: 'clapping' }
    ]
  };

  var STR = {
    fa: {
      skip: 'پرش به بازی',
      homeLink: 'صفحهٔ اصلی HFB',
      title: 'انتخاب و پاداش',
      prompt: 'کدوم رو می‌خوای؟',
      chose: function (x) { return 'تو ' + x + ' رو انتخاب کردی!'; },
      readAloud: 'بلند خواندن',
      readItem: function (x) { return 'بلند خواندن: ' + x; },
      next: 'بعدی',
      stars: 'ستاره‌های من',
      starCount: function (n) { return toFaDigits(n) + ' از ' + toFaDigits(GOAL); },
      starAria: function (i, filled) { return 'ستارهٔ ' + toFaDigits(i) + (filled ? '، گرفته شد' : '، خالی'); },
      celebrateTitle: 'آفرین! ۵ ستاره!',
      celebrateSub: 'انتخاب‌های خیلی خوبی کردی.',
      celebrateSay: 'آفرین! پنج ستاره گرفتی!',
      playAgain: 'دوباره بازی کنیم',
      adultTitle: 'پنل بزرگسال',
      adultBtn: 'پنل بزرگسال (تنظیمات)',
      close: 'بستن',
      optCount: 'تعداد گزینه‌ها',
      categories: 'دسته‌ها',
      cat_food: 'خوراکی',
      cat_toys: 'اسباب‌بازی',
      cat_activities: 'فعالیت',
      catHint: 'حداقل یک دسته باید روشن بماند.',
      comfort: 'صدا و حرکت',
      sound: 'صدا و بلندخوانی',
      motion: 'انیمیشن ملایم',
      starsLegend: 'ستاره‌ها',
      resetStars: 'صفر کردن ستاره‌ها',
      resetDone: 'ستاره‌ها صفر شد.',
      togetherTitle: 'حالت با هم',
      togetherText: 'برای بازی از راه دور، در تماس تصویری صفحه را به اشتراک بگذارید (همراه با صدای رایانه). کودک گزینه را نشان می‌دهد یا می‌گوید و شما برایش لمس می‌کنید؛ یا اگر ابزار تماس اجازه می‌دهد، کنترل را به او بدهید. اتصال آنلاین جداگانه لازم نیست.',
      noSpeech: 'این مرورگر بلندخوانی ندارد؛ متن روی صفحه نمایش داده می‌شود.',
      noVoice: 'صدای فارسی روی این دستگاه پیدا نشد؛ مرورگر ممکن است با صدای پیش‌فرض بخواند یا ساکت بماند.',
      voiceOk: function (n) { return 'صدای بلندخوانی: ' + n; },
      langBtn: 'Switch to English',
      langBtnText: 'EN',
      theme: { dark: 'پوسته: تیره (برای تغییر بزنید)', dim: 'پوسته: نیمه‌روشن (برای تغییر بزنید)', light: 'پوسته: روشن (برای تغییر بزنید)' },
      docTitle: 'انتخاب و پاداش · HFB Play Together'
    },
    en: {
      skip: 'Skip to game',
      homeLink: 'HFB home page',
      title: 'Choice & Reward',
      prompt: 'Which one do you want?',
      chose: function (x) { return 'You chose ' + x + '!'; },
      readAloud: 'Read aloud',
      readItem: function (x) { return 'Read aloud: ' + x; },
      next: 'Next',
      stars: 'My stars',
      starCount: function (n) { return n + ' of ' + GOAL; },
      starAria: function (i, filled) { return 'Star ' + i + (filled ? ', earned' : ', empty'); },
      celebrateTitle: 'Well done! 5 stars!',
      celebrateSub: 'You made great choices.',
      celebrateSay: 'Well done! You got five stars!',
      playAgain: 'Play again',
      adultTitle: 'Adult panel',
      adultBtn: 'Adult panel (settings)',
      close: 'Close',
      optCount: 'Number of options',
      categories: 'Categories',
      cat_food: 'Food',
      cat_toys: 'Toys',
      cat_activities: 'Activities',
      catHint: 'At least one category must stay on.',
      comfort: 'Sound & motion',
      sound: 'Sound & read-aloud',
      motion: 'Gentle animation',
      starsLegend: 'Stars',
      resetStars: 'Reset stars',
      resetDone: 'Stars reset.',
      togetherTitle: 'Together mode',
      togetherText: 'To play remotely, share this screen on a video call (include computer audio). The child points to or says their choice and you tap it — or hand over control if your call app allows it. No separate online connection is needed.',
      noSpeech: 'Read-aloud is not available in this browser; text stays on screen.',
      noVoice: 'No English voice found on this device; the browser may use a default voice or stay silent.',
      voiceOk: function (n) { return 'Read-aloud voice: ' + n; },
      langBtn: 'تغییر به فارسی',
      langBtnText: 'فا',
      theme: { dark: 'Theme: dark (tap to change)', dim: 'Theme: dim (tap to change)', light: 'Theme: light (tap to change)' },
      docTitle: 'Choice & Reward · HFB Play Together'
    }
  };

  function toFaDigits(n) {
    return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; });
  }

  /* ---------- Storage helpers ---------- */
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode etc. */ }
  }
  function loadRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function saveRaw(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var defaults = {
    count: 2,
    cats: ['food', 'toys', 'activities'],
    sound: true,
    motion: !(reduceMQ && reduceMQ.matches)
  };
  var settings = Object.assign({}, defaults, load('hfb-cr-settings', {}));
  if ([2, 3, 4].indexOf(settings.count) < 0) settings.count = 2;
  settings.cats = (settings.cats || []).filter(function (c) { return ITEMS[c]; });
  if (!settings.cats.length) settings.cats = defaults.cats.slice();

  var state = {
    lang: loadRaw('hfb-lang') === 'en' ? 'en' : 'fa',
    theme: (function () { var t = loadRaw('hfb-theme'); return (t === 'dark' || t === 'dim' || t === 'light') ? t : 'dark'; })(),
    stars: Math.max(0, Math.min(GOAL, parseInt(load('hfb-cr-stars', 0), 10) || 0)),
    current: [],
    chosen: null,
    lastIds: [],
    catIndex: 0,
    advanceTimer: null
  };

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    choices: $('choices'), feedback: $('feedback'), feedbackText: $('feedbackText'), feedbackEmoji: $('feedbackEmoji'),
    nextBtn: $('nextBtn'), stars: $('stars'), starCount: $('starCount'),
    celebrate: $('celebrate'), playAgain: $('playAgainBtn'),
    langBtn: $('langBtn'), langBtnText: $('langBtnText'), themeBtn: $('themeBtn'), themeIcon: $('themeIcon'),
    adultBtn: $('adultBtn'), panel: $('adultPanel'), form: $('adultForm'),
    sound: $('soundToggle'), motion: $('motionToggle'), reset: $('resetStars'), voiceStatus: $('voiceStatus'),
    catHint: $('catHint')
  };
  function t(key) { return STR[state.lang][key]; }

  /* ---------- Speech (Web Speech API) ---------- */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var voices = [];
  function refreshVoices() {
    if (!synth) return;
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
    updateVoiceStatus();
  }
  function pickVoice(lang) {
    var want = lang === 'fa' ? 'fa' : 'en';
    var exact = lang === 'fa' ? 'fa-ir' : 'en-us';
    var norm = function (v) { return (v.lang || '').toLowerCase().replace('_', '-'); };
    return voices.find(function (v) { return norm(v) === exact; }) ||
           voices.find(function (v) { return norm(v).indexOf(want) === 0; }) || null;
  }
  function updateVoiceStatus() {
    if (!el.voiceStatus) return;
    if (!synth) { el.voiceStatus.textContent = t('noSpeech'); return; }
    var v = pickVoice(state.lang);
    el.voiceStatus.textContent = v ? t('voiceOk')(v.name) : t('noVoice');
  }
  var speakingBtn = null;
  function speak(text, btn) {
    if (!synth || !settings.sound || !text) return;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = state.lang === 'fa' ? 'fa-IR' : 'en-US';
      var v = pickVoice(state.lang);
      if (v) u.voice = v;
      u.rate = 0.9;   // a little slower, calmer
      u.pitch = 1;
      u.volume = 1;
      if (speakingBtn) speakingBtn.classList.remove('speaking');
      if (btn) { speakingBtn = btn; btn.classList.add('speaking'); }
      var done = function () { if (btn) btn.classList.remove('speaking'); };
      u.onend = done; u.onerror = done;
      synth.speak(u);
    } catch (e) { /* fail silently: text is always on screen */ }
  }

  /* Soft two-note chime for the reward (Web Audio, generated — no files). */
  var audioCtx = null;
  function chime(big) {
    if (!settings.sound) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var notes = big ? [523.25, 659.25, 783.99] : [587.33, 783.99];
      notes.forEach(function (f, i) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        var t0 = audioCtx.currentTime + i * 0.18;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0); o.stop(t0 + 1);
      });
    } catch (e) {}
  }

  /* ---------- Rendering ---------- */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function itemName(item) { return item[state.lang === 'fa' ? 'fa' : 'en']; }

  function newRound() {
    clearTimeout(state.advanceTimer);
    var cats = settings.cats;
    var cat = cats[state.catIndex % cats.length];
    state.catIndex++;
    // Prefer items not shown last round so pairs feel fresh.
    var pool = ITEMS[cat].filter(function (it) { return state.lastIds.indexOf(it.id) < 0; });
    if (pool.length < settings.count) pool = ITEMS[cat].slice();
    state.current = shuffle(pool.slice()).slice(0, settings.count);
    state.lastIds = state.current.map(function (i) { return i.id; });
    state.chosen = null;
    el.feedback.hidden = true;
    renderChoices();
  }

  function renderChoices() {
    var box = el.choices;
    box.innerHTML = '';
    box.dataset.count = String(state.current.length);
    box.classList.toggle('answered', !!state.chosen);
    state.current.forEach(function (item, idx) {
      var name = itemName(item);
      var wrap = document.createElement('div');
      wrap.className = 'card';
      if (state.chosen) wrap.classList.add(state.chosen.id === item.id ? 'chosen' : 'not-chosen');

      var main = document.createElement('button');
      main.type = 'button';
      main.className = 'card-main';
      main.setAttribute('aria-label', name);
      main.setAttribute('aria-keyshortcuts', String(idx + 1));
      if (state.chosen) main.setAttribute('aria-pressed', state.chosen.id === item.id ? 'true' : 'false');
      main.innerHTML = '<span class="card-emoji" aria-hidden="true"></span><span class="card-label"></span>';
      main.firstChild.textContent = item.e;
      main.lastChild.textContent = name;
      main.addEventListener('click', function () { choose(item); });

      var num = document.createElement('span');
      num.className = 'card-num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = state.lang === 'fa' ? toFaDigits(idx + 1) : String(idx + 1);

      var sp = document.createElement('button');
      sp.type = 'button';
      sp.className = 'speak-btn';
      sp.setAttribute('aria-label', t('readItem')(name));
      sp.innerHTML = '<span aria-hidden="true">🔊</span>';
      sp.addEventListener('click', function (ev) { ev.stopPropagation(); speak(name, sp); });

      wrap.appendChild(main); wrap.appendChild(num); wrap.appendChild(sp);
      box.appendChild(wrap);
    });
  }

  function chosenSentence() {
    if (!state.chosen) return '';
    return t('chose')(state.lang === 'fa' ? state.chosen.fa : state.chosen.enS);
  }

  function choose(item) {
    if (state.chosen) return; // one choice per round, predictable
    state.chosen = item;
    renderChoices();
    el.feedbackEmoji.textContent = item.e;
    el.feedbackText.textContent = chosenSentence();
    el.feedback.hidden = false;
    speak(chosenSentence(), $('speakFeedback'));

    // Calm reward: add a star.
    state.stars = Math.min(GOAL, state.stars + 1);
    save('hfb-cr-stars', state.stars);
    renderStars(state.stars - 1);
    var reachedGoal = state.stars >= GOAL;
    setTimeout(function () { chime(false); }, 250);

    if (reachedGoal) {
      state.advanceTimer = setTimeout(showCelebration, 2600);
    } else {
      state.advanceTimer = setTimeout(newRound, 4200); // gentle auto-advance; "Next" skips the wait
    }
    el.nextBtn.focus({ preventScroll: true });
  }

  function renderStars(justIdx) {
    el.stars.innerHTML = '';
    for (var i = 0; i < GOAL; i++) {
      var li = document.createElement('li');
      var filled = i < state.stars;
      li.className = 'star' + (filled ? ' filled' : '') + (i === justIdx ? ' just-filled' : '');
      li.setAttribute('aria-label', t('starAria')(i + 1, filled));
      li.innerHTML = '<span class="star-glyph" aria-hidden="true">⭐</span>';
      el.stars.appendChild(li);
    }
    el.starCount.textContent = t('starCount')(state.stars);
  }

  var lastFocus = null;
  function showCelebration() {
    clearTimeout(state.advanceTimer);
    lastFocus = document.activeElement;
    el.celebrate.hidden = false;
    $('main').setAttribute('aria-hidden', 'true');
    chime(true);
    setTimeout(function () { speak(t('celebrateSay'), $('speakCelebrate')); }, 400);
    el.playAgain.focus({ preventScroll: true });
  }
  function hideCelebration() {
    el.celebrate.hidden = true;
    $('main').removeAttribute('aria-hidden');
    state.stars = 0;
    save('hfb-cr-stars', 0);
    renderStars(-1);
    newRound();
    var first = el.choices.querySelector('.card-main');
    if (first) first.focus({ preventScroll: true });
  }

  /* ---------- Language ---------- */
  function applyLang() {
    var L = state.lang;
    root.lang = L;
    root.dir = L === 'fa' ? 'rtl' : 'ltr';
    document.title = t('docTitle');
    document.querySelectorAll('[data-i18n]').forEach(function (n) {
      var v = STR[L][n.getAttribute('data-i18n')];
      if (typeof v === 'string') n.textContent = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) {
      var v = STR[L][n.getAttribute('data-i18n-aria')];
      if (typeof v === 'string') n.setAttribute('aria-label', v);
    });
    el.langBtn.setAttribute('aria-label', t('langBtn'));
    el.langBtn.setAttribute('lang', L === 'fa' ? 'en' : 'fa');
    el.langBtnText.textContent = t('langBtnText');
    el.adultBtn.setAttribute('aria-label', t('adultBtn'));
    applyTheme(); // refresh theme label in the new language
    renderChoices();
    renderStars(-1);
    if (state.chosen) el.feedbackText.textContent = chosenSentence();
    updateVoiceStatus();
  }

  /* ---------- Theme: DARK → DIM → LIGHT ---------- */
  var THEMES = ['dark', 'dim', 'light'];
  var THEME_ICON = { dark: '🌙', dim: '🌗', light: '☀️' };
  function applyTheme() {
    root.setAttribute('data-theme', state.theme);
    el.themeIcon.textContent = THEME_ICON[state.theme];
    el.themeBtn.setAttribute('aria-label', t('theme')[state.theme]);
    el.themeBtn.title = t('theme')[state.theme];
  }

  /* ---------- Settings ---------- */
  function applySettings() {
    root.classList.toggle('motion', !!settings.motion);
    root.classList.toggle('sound-off', !settings.sound);
    el.sound.checked = !!settings.sound;
    el.motion.checked = !!settings.motion;
    el.form.querySelectorAll('input[name="count"]').forEach(function (r) { r.checked = Number(r.value) === settings.count; });
    el.form.querySelectorAll('input[name="cat"]').forEach(function (c) { c.checked = settings.cats.indexOf(c.value) >= 0; });
  }
  function persist() { save('hfb-cr-settings', settings); }

  /* ---------- Events ---------- */
  el.langBtn.addEventListener('click', function () {
    state.lang = state.lang === 'fa' ? 'en' : 'fa';
    saveRaw('hfb-lang', state.lang);
    if (synth) synth.cancel();
    applyLang();
  });
  el.themeBtn.addEventListener('click', function () {
    state.theme = THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length];
    saveRaw('hfb-theme', state.theme);
    applyTheme();
  });
  $('speakPrompt').addEventListener('click', function () { speak(t('prompt'), this); });
  $('speakFeedback').addEventListener('click', function () { speak(chosenSentence(), this); });
  $('speakCelebrate').addEventListener('click', function () { speak(t('celebrateSay'), this); });
  el.nextBtn.addEventListener('click', function () {
    if (state.stars >= GOAL) { showCelebration(); return; }
    newRound();
    var first = el.choices.querySelector('.card-main');
    if (first) first.focus({ preventScroll: true });
  });
  el.playAgain.addEventListener('click', hideCelebration);

  el.adultBtn.addEventListener('click', function () {
    applySettings();
    updateVoiceStatus();
    if (typeof el.panel.showModal === 'function') el.panel.showModal();
    else el.panel.setAttribute('open', '');
  });
  el.panel.addEventListener('close', function () { el.adultBtn.focus({ preventScroll: true }); });
  // Click on the backdrop closes the panel.
  el.panel.addEventListener('click', function (e) { if (e.target === el.panel) el.panel.close(); });

  el.form.addEventListener('change', function (e) {
    var tg = e.target;
    if (tg.name === 'count') {
      settings.count = Number(tg.value);
      persist(); newRound();
    } else if (tg.name === 'cat') {
      var on = Array.prototype.filter.call(el.form.querySelectorAll('input[name="cat"]'), function (c) { return c.checked; })
        .map(function (c) { return c.value; });
      if (!on.length) { tg.checked = true; el.catHint.classList.add('warn'); return; }
      settings.cats = on; state.catIndex = 0;
      persist(); newRound();
    } else if (tg === el.sound) {
      settings.sound = tg.checked;
      if (!settings.sound && synth) synth.cancel();
      persist(); applySettings();
    } else if (tg === el.motion) {
      settings.motion = tg.checked;
      persist(); applySettings();
    }
  });
  el.reset.addEventListener('click', function () {
    state.stars = 0; save('hfb-cr-stars', 0); renderStars(-1);
    el.voiceStatus.textContent = t('resetDone');
  });

  // Keyboard: 1–4 (or Persian ۱–۴) pick a card; Escape closes the celebration.
  document.addEventListener('keydown', function (e) {
    if (el.panel.open || e.altKey || e.ctrlKey || e.metaKey) return;
    if (!el.celebrate.hidden) {
      if (e.key === 'Escape') hideCelebration();
      return;
    }
    var k = e.key.replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); });
    var n = parseInt(k, 10);
    if (n >= 1 && n <= state.current.length && !state.chosen) {
      e.preventDefault();
      choose(state.current[n - 1]);
    }
  });
  // Keep Tab focus inside the celebration overlay while it is open.
  el.celebrate.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(el.celebrate.querySelectorAll('button'), function (b) { return b.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  if (reduceMQ && reduceMQ.addEventListener) {
    reduceMQ.addEventListener('change', function (m) { if (m.matches) { settings.motion = false; applySettings(); } });
  }

  /* ---------- Init ---------- */
  if (!synth) root.classList.add('no-speech');
  else {
    refreshVoices();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
    else synth.onvoiceschanged = refreshVoices;
  }
  applySettings();
  newRound();
  applyLang();
  if (state.stars >= GOAL) showCelebration();
})();
