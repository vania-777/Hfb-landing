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
      stars: 'ستاره‌های تیم ما',
      teamAria: 'تیم ما: بزرگسال و کودک، با هم',
      teamStar: 'آفرین به تیم ما! یه ستاره گرفتیم.',
      starCount: function (n) { return toFaDigits(n) + ' از ' + toFaDigits(GOAL); },
      starAria: function (i, filled) { return 'ستارهٔ ' + toFaDigits(i) + (filled ? '، گرفته شد' : '، خالی'); },
      celebrateTitle: 'آفرین به تیم ما! ۵ ستاره!',
      celebrateSub: 'با هم انتخاب‌های خیلی خوبی کردیم.',
      celebrateSay: 'هورا! تیم ما با هم پنج ستاره گرفت!',
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
      togetherText: 'بازی دونفره با صدا: دکمهٔ زیر را بزنید و لینک را برای دستگاه کودک بفرستید. شما و کودک یک تیم هستید: صدای همدیگر را می‌شنوید، کارت‌ها یکی است و ستاره‌ها مال تیم است. (یا در تماس تصویری صفحه را با صدای رایانه به اشتراک بگذارید.)',
      liveStart: 'شروع بازی دونفره با صدا',
      liveEnd: 'پایان بازی دونفره',
      shareLabel: 'این لینک را روی دستگاه کودک باز کنید:',
      copy: 'کپی لینک',
      copied: 'کپی شد ✓',
      st_connecting: 'در حال وصل شدن…',
      st_waiting: 'منتظر هم‌تیمی… لینک را برای کودک بفرستید.',
      st_waitHost: 'منتظر بزرگسال… (صفحهٔ بزرگسال باید باز باشد)',
      st_connected: 'هم‌تیمی وصل شد! با هم بازی می‌کنیم.',
      st_reconnecting: 'اتصال قطع شد؛ دوباره وصل می‌شویم…',
      st_failed: 'وصل نشد. اینترنت را بررسی کنید و دوباره امتحان کنید.',
      st_noPeer: 'بازی دونفره بارگذاری نشد (اینترنت لازم است). بازی تنها ادامه دارد.',
      micDenied: 'میکروفون در دسترس نیست؛ بازی بدون صدای زنده ادامه دارد. 🙂',
      micMute: 'میکروفون روشن است — بزنید تا قطع شود',
      micUnmute: 'میکروفون قطع است — بزنید تا روشن شود',
      micOnShort: 'میکروفون روشن',
      micOffShort: 'میکروفون قطع',
      hearBtn: 'بزن تا صدای هم‌تیمی را بشنوی',
      tapStart: 'بزن تا شروع کنیم',
      tapStartTitle: 'بازی تیمی با صدا',
      tapStartHint: 'برای صحبت با هم‌تیمی، اجازهٔ میکروفون را بدهید. بدون میکروفون هم می‌شود بازی کرد.',
      adultName: 'بزرگسال',
      childName: 'کودک',
      noSpeech: 'این مرورگر بلندخوانی ندارد؛ متن روی صفحه نمایش داده می‌شود.',
      noVoice: 'صدای فارسی روی این دستگاه پیدا نشد؛ مرورگر ممکن است با صدای پیش‌فرض بخواند یا ساکت بماند.',
      voiceOk: function (n) { return 'صدای بلندخوانی: ' + n; },
      voiceClips: 'صدای بلندخوانی: فایل‌های صوتی ضبط‌شده (روی همهٔ دستگاه‌ها، از جمله آیفون).',
      audioErr: 'خطای پخش صدا: ',
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
      stars: 'Our team stars',
      teamAria: 'Our team: adult and child, together',
      teamStar: 'Great teamwork! We got a star!',
      starCount: function (n) { return n + ' of ' + GOAL; },
      starAria: function (i, filled) { return 'Star ' + i + (filled ? ', earned' : ', empty'); },
      celebrateTitle: 'Great teamwork! 5 stars!',
      celebrateSub: 'We made great choices together.',
      celebrateSay: 'Hooray! Our team got five stars together!',
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
      togetherText: 'Live two-player mode with voice: tap the button below and open the link on the child\'s device. You and the child are one team: you hear each other, see the same cards, and share the team stars. (Or share this screen on a video call, including computer audio.)',
      liveStart: 'Start live two-player session (voice)',
      liveEnd: 'End two-player session',
      shareLabel: 'Open this link on the child\'s device:',
      copy: 'Copy link',
      copied: 'Copied ✓',
      st_connecting: 'Connecting…',
      st_waiting: 'Waiting for your teammate… Send the link to the child.',
      st_waitHost: 'Waiting for the adult… (the adult\'s page must be open)',
      st_connected: 'Teammate connected! We\'re playing together.',
      st_reconnecting: 'Connection lost; reconnecting…',
      st_failed: 'Couldn\'t connect. Check the internet and try again.',
      st_noPeer: 'Two-player mode could not load (needs internet). Solo play still works.',
      micDenied: 'Microphone not available, so we\'ll play without live voice. 🙂',
      micMute: 'Mic is on — tap to mute',
      micUnmute: 'Mic is muted — tap to unmute',
      micOnShort: 'Mic on',
      micOffShort: 'Mic muted',
      hearBtn: 'Tap to hear your teammate',
      tapStart: 'Tap to start',
      tapStartTitle: 'Team game with voice',
      tapStartHint: 'Allow the microphone to talk with your teammate. You can also play without it.',
      adultName: 'Adult',
      childName: 'Child',
      noSpeech: 'Read-aloud is not available in this browser; text stays on screen.',
      noVoice: 'No English voice found on this device; the browser may use a default voice or stay silent.',
      voiceOk: function (n) { return 'Read-aloud voice: ' + n; },
      voiceClips: 'Read-aloud voice: recorded audio clips (works on all devices, including iPhone).',
      audioErr: 'Audio playback error: ',
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
    advanceTimer: null,
    roundNo: 0
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
    catHint: $('catHint'), feedbackTeam: $('feedbackTeam')
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
  var lastAudioErr = '';
  function updateVoiceStatus() {
    if (!el.voiceStatus) return;
    var err = lastAudioErr ? ' ' + t('audioErr') + lastAudioErr : '';
    if (player) { el.voiceStatus.textContent = t('voiceClips') + err; return; }
    if (!synth) { el.voiceStatus.textContent = t('noSpeech'); return; }
    var v = pickVoice(state.lang);
    el.voiceStatus.textContent = v ? t('voiceOk')(v.name) : t('noVoice');
  }

  /* ---------- Read-aloud: pre-recorded MP3 clips (fa + en) ----------
     iOS has no fa-IR speechSynthesis voice and its English voices sound robotic, so every
     phrase the game speaks is a clip in audio/<lang>/<key>.mp3:
       item_<id>, chose_<id>, team_star, prompt, celebrate.
     Dead-simple path, run synchronously inside the tap handler (iOS autoplay rule):
       player.src = url; player.play();
     One shared <audio> element, so a new clip always stops the previous one; once it has
     played from a tap, iOS also lets it play the (delayed) celebration line.
     speechSynthesis is only a fallback when a clip fails to load. */
  var ASSET_VER = '20261004-3'; // bump when clips change (cache-busting)
  var player = null;
  try { if (typeof Audio !== 'undefined') { player = new Audio(); player.preload = 'auto'; } } catch (e) { player = null; }
  var playToken = 0;
  function clipUrl(key) { return 'audio/' + state.lang + '/' + key + '.mp3?v=' + ASSET_VER; }

  var speakingBtn = null;
  function setSpeaking(btn) {
    if (speakingBtn) speakingBtn.classList.remove('speaking');
    speakingBtn = btn || null;
    if (btn) btn.classList.add('speaking');
  }
  // Live voice chat: lower the teammate's voice while a game clip plays so the clip stays clear.
  // (iOS ignores media.volume; there both play together and the clip is still audible.)
  function duck(on) {
    var ra = document.getElementById('remoteAudio');
    if (ra) { try { ra.volume = on ? 0.3 : 1; } catch (e) {} }
  }
  function stopSpeech() {
    playToken++;
    duck(false);
    if (player) { try { player.pause(); } catch (e) {} }
    if (synth && (synth.speaking || synth.pending)) { try { synth.cancel(); } catch (e) {} }
    if (speakingBtn) { speakingBtn.classList.remove('speaking'); speakingBtn = null; }
  }
  function audioFailed(msg) {
    lastAudioErr = msg;
    updateVoiceStatus();
    try { console.warn('[choice-reward] audio: ' + msg); } catch (e) {}
  }
  function playClip(key, text, btn, next) {
    var my = ++playToken;
    var url = clipUrl(key);
    setSpeaking(btn);
    duck(true);
    var fallback = function (why) {
      if (my !== playToken) return; // a newer clip took over
      playToken++;
      duck(false);
      audioFailed(why + ' (' + url + ')');
      speakSynth(next ? text + ' ' + next.text : text, btn);
    };
    player.onended = function () {
      if (my !== playToken) return;
      if (next) { playClip(next.key, next.text, btn, null); return; } // same element: allowed on iOS
      duck(false);
      if (btn) btn.classList.remove('speaking');
    };
    player.onerror = function () { fallback('load error ' + ((player.error && player.error.code) || '')); };
    player.src = url;
    var p;
    try { p = player.play(); } catch (e) { fallback(e && e.name || 'play() threw'); return; }
    if (p && p.then) p.then(function () { if (lastAudioErr) { lastAudioErr = ''; updateVoiceStatus(); } }, function (e) {
      if (my !== playToken) return; // superseded: expected
      var n = (e && e.name) || 'play() rejected';
      if (n === 'NotAllowedError') { audioFailed(n); duck(false); if (btn) btn.classList.remove('speaking'); return; } // tap 🔊 to hear it
      fallback(n);
    });
  }
  function speakSynth(text, btn) {
    if (!synth) { if (btn) btn.classList.remove('speaking'); return; }
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = state.lang === 'fa' ? 'fa-IR' : 'en-US';
      var v = pickVoice(state.lang);
      if (v) u.voice = v;
      u.rate = 0.9;   // a little slower, calmer
      u.pitch = 1;
      u.volume = 1;
      setSpeaking(btn);
      var done = function () { if (btn) btn.classList.remove('speaking'); };
      u.onend = done; u.onerror = done;
      synth.speak(u);
    } catch (e) { /* fail silently: text is always on screen */ }
  }
  // Call directly from a tap/click handler (no await / setTimeout before it).
  function speak(text, btn, key, next) {
    if (!settings.sound || !text) return;
    stopSpeech(); // a new line always stops the previous one
    if (player && key) { playClip(key, text, btn, next || null); return; }
    speakSynth(next ? text + ' ' + next.text : text, btn);
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
    if (isLiveChild()) return; // in live mode the adult's device deals the cards
    var cats = settings.cats;
    var cat = cats[state.catIndex % cats.length];
    state.catIndex++;
    // Prefer items not shown last round so pairs feel fresh.
    var pool = ITEMS[cat].filter(function (it) { return state.lastIds.indexOf(it.id) < 0; });
    if (pool.length < settings.count) pool = ITEMS[cat].slice();
    state.current = shuffle(pool.slice()).slice(0, settings.count);
    state.lastIds = state.current.map(function (i) { return i.id; });
    state.chosen = null;
    state.roundNo++;
    el.feedback.hidden = true;
    renderChoices();
    sendState();
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
      sp.addEventListener('click', function (ev) { ev.stopPropagation(); speak(name, sp, 'item_' + item.id); });

      wrap.appendChild(main); wrap.appendChild(num); wrap.appendChild(sp);
      box.appendChild(wrap);
    });
  }

  function chosenSentence() {
    if (!state.chosen) return '';
    return t('chose')(state.lang === 'fa' ? state.chosen.fa : state.chosen.enS);
  }

  function chosenKey() { return state.chosen ? 'chose_' + state.chosen.id : ''; }

  // Show the choice, say "You chose X!" + the team praise line, chime. (No star logic here.)
  function showChoice(item) {
    state.chosen = item;
    renderChoices();
    el.feedbackEmoji.textContent = item.e;
    el.feedbackText.textContent = chosenSentence();
    el.feedback.hidden = false;
    speak(chosenSentence(), $('speakFeedback'), chosenKey(), { text: t('teamStar'), key: 'team_star' }); // synchronous, inside the tap
    setTimeout(function () { chime(false); }, 250);
  }

  function choose(item) {
    if (state.chosen) return; // one choice per round, predictable
    showChoice(item);

    // Calm reward: one more star for the team.
    state.stars = Math.min(GOAL, state.stars + 1);
    if (!isLiveChild()) save('hfb-cr-stars', state.stars);
    renderStars(state.stars - 1);
    el.nextBtn.focus({ preventScroll: true });

    if (isLiveChild()) { send({ t: 'choose', id: item.id }); return; } // the adult's device keeps score and moves on

    var reachedGoal = state.stars >= GOAL;
    if (reachedGoal) {
      state.advanceTimer = setTimeout(showCelebration, 2600);
    } else {
      state.advanceTimer = setTimeout(newRound, 6000); // gentle auto-advance (after the praise line); "Next" skips the wait
    }
    sendState();
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
    setTimeout(function () { speak(t('celebrateSay'), $('speakCelebrate'), 'celebrate'); }, 400);
    el.playAgain.focus({ preventScroll: true });
    sendState();
  }
  function closeCelebration() {
    el.celebrate.hidden = true;
    $('main').removeAttribute('aria-hidden');
  }
  function hideCelebration() {
    if (isLiveChild()) { send({ t: 'again' }); return; }
    closeCelebration();
    state.stars = 0;
    save('hfb-cr-stars', 0);
    renderStars(-1);
    newRound();
    var first = el.choices.querySelector('.card-main');
    if (first) first.focus({ preventScroll: true });
  }

  /* ---------- Live two-player team mode (PeerJS: game data + voice) ----------
     Adult ("host") taps "Start live two-player session" in the Adult panel → gets a link.
     Child's device opens the link (?join=CODE) → "Tap to start" → mic permission + connect.
     The adult's device deals the cards and keeps the team stars; both devices show the same
     round and either player can tap. Voice: one PeerJS media call, audio only.
     Signalling uses the free PeerJS cloud server (0.peerjs.com) + its STUN/TURN defaults. */
  var PEER_PREFIX = 'hfb-cr-';
  var live = {
    role: null,          // 'host' | 'child' | null (solo)
    code: null, peer: null, conn: null, call: null,
    connected: false, localStream: null, micMuted: false,
    peerMic: null,       // teammate mic: null unknown, true on, false off/none
    statusKey: '', retryTimer: null, levelTimer: null, analyser: null, talking: false,
    lastSeen: 0, lost: null
  };
  var joinCode = (function () {
    var m = /[?&]join=([a-z0-9]{4,24})/i.exec(location.search || '');
    return m ? m[1].toLowerCase() : null;
  })();
  var remoteAudio = $('remoteAudio');
  var tb = {
    bar: $('teamBar'), status: $('teamStatus'), share: $('shareBox'), link: $('shareLink'), copy: $('copyLink'),
    note: $('micNote'), hear: $('hearBtn'), mic: $('micBtn'), micIcon: $('micIcon'), micText: $('micText'),
    avAdult: $('avatarAdult'), avChild: $('avatarChild'), dotAdult: $('micDotAdult'), dotChild: $('micDotChild'),
    start: $('startOverlay'), startBtn: $('startBtn'), liveStart: $('liveStartBtn'), liveEnd: $('liveEndBtn')
  };

  function isLiveChild() { return live.role === 'child' && live.connected; }
  function send(msg) {
    if (live.conn && live.conn.open) { try { live.conn.send(msg); } catch (e) {} }
  }
  function findItem(id) {
    var found = null;
    Object.keys(ITEMS).forEach(function (c) { ITEMS[c].forEach(function (it) { if (it.id === id) found = it; }); });
    return found;
  }
  function sendState() {
    if (live.role !== 'host' || !live.connected) return;
    send({
      t: 'state', round: state.roundNo,
      ids: state.current.map(function (i) { return i.id; }),
      chosen: state.chosen ? state.chosen.id : null,
      stars: state.stars, celebrate: !el.celebrate.hidden
    });
  }
  // Child: mirror the adult's game state.
  function applyRemoteState(m) {
    if (!m || !Array.isArray(m.ids)) return;
    clearTimeout(state.advanceTimer);
    if (m.round !== state.roundNo) {
      state.roundNo = m.round;
      state.current = m.ids.map(findItem).filter(Boolean);
      state.lastIds = m.ids.slice();
      state.chosen = null;
      el.feedback.hidden = true;
      renderChoices();
    }
    var before = state.stars;
    state.stars = Math.max(0, Math.min(GOAL, m.stars | 0));
    if (m.chosen && (!state.chosen || state.chosen.id !== m.chosen)) {
      var it = findItem(m.chosen);
      if (it) showChoice(it); // the teammate chose: show + say it here too
    }
    renderStars(state.stars > before ? state.stars - 1 : -1);
    if (m.celebrate && el.celebrate.hidden) showCelebration();
    if (!m.celebrate && !el.celebrate.hidden) closeCelebration();
  }

  function setStatus(key) {
    live.statusKey = key;
    if (tb.status) tb.status.textContent = key ? t('st_' + key) : '';
  }
  function showMicNote(show) {
    tb.note.hidden = !show;
    if (show) tb.note.textContent = t('micDenied');
  }
  function updateTeamUI() {
    if (!live.role) { tb.bar.hidden = true; tb.liveEnd.hidden = true; tb.liveStart.hidden = false; return; }
    tb.bar.hidden = false;
    var meAdult = live.role === 'host';
    var me = meAdult ? tb.avAdult : tb.avChild, mate = meAdult ? tb.avChild : tb.avAdult;
    var myDot = meAdult ? tb.dotAdult : tb.dotChild, mateDot = meAdult ? tb.dotChild : tb.dotAdult;
    me.classList.add('me'); mate.classList.remove('me');
    me.classList.remove('away');
    mate.classList.toggle('away', !live.connected);
    me.title = meAdult ? t('adultName') : t('childName');
    mate.title = meAdult ? t('childName') : t('adultName');
    var hasMic = !!live.localStream;
    myDot.className = 'mic-dot ' + (!hasMic || live.micMuted ? 'off' : (live.talking ? 'talking' : 'on'));
    mateDot.className = 'mic-dot' + (!live.connected || live.peerMic === null ? '' : (live.peerMic ? ' on' : ' off'));
    tb.mic.hidden = !hasMic;
    tb.mic.setAttribute('aria-pressed', live.micMuted ? 'true' : 'false');
    tb.micIcon.textContent = live.micMuted ? '🔇' : '🎙️';
    var long = meAdult ? (live.micMuted ? t('micUnmute') : t('micMute')) : (live.micMuted ? t('micOffShort') : t('micOnShort'));
    tb.micText.textContent = long;
    tb.mic.setAttribute('aria-label', live.micMuted ? t('micUnmute') : t('micMute'));
    tb.share.hidden = !(meAdult && tb.link.value && !live.connected);
    tb.liveStart.hidden = true;
    tb.liveEnd.hidden = !meAdult;
    setStatus(live.statusKey);
    if (!tb.note.hidden) tb.note.textContent = t('micDenied');
  }

  function loadPeerJS(cb) {
    if (window.Peer) { cb(null); return; }
    var sc = document.createElement('script');
    sc.src = 'vendor/peerjs.min.js?v=' + ASSET_VER;
    sc.onload = function () { cb(window.Peer ? null : 'missing'); };
    sc.onerror = function () { cb('load'); };
    document.head.appendChild(sc);
  }
  function randomCode() {
    var abc = 'abcdefghjkmnpqrstuvwxyz23456789', out = '', r;
    try { r = crypto.getRandomValues(new Uint8Array(10)); } catch (e) { r = []; for (var j = 0; j < 10; j++) r.push(Math.floor(Math.random() * 256)); }
    for (var i = 0; i < 10; i++) out += abc[r[i] % abc.length];
    return out;
  }
  // Must be called synchronously inside a tap (permission prompt + iOS audio rules).
  function askMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(null);
    try {
      return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false })
        .then(function (s) { return s; }, function (e) { try { console.warn('[choice-reward] mic: ' + (e && e.name)); } catch (x) {} return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  // Inside the tap: let the remote <audio> and Web Audio start later without another tap (iOS).
  function primeAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { audioCtx = audioCtx || new AC(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
    } catch (e) {}
    try { remoteAudio.muted = false; var p = remoteAudio.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function setLocalStream(stream) {
    live.localStream = stream;
    showMicNote(!stream);
    if (stream) {
      live.micMuted = false;
      try {
        if (audioCtx) {
          var src = audioCtx.createMediaStreamSource(stream);
          live.analyser = audioCtx.createAnalyser();
          live.analyser.fftSize = 512;
          src.connect(live.analyser);
          var buf = new Uint8Array(live.analyser.fftSize);
          live.levelTimer = setInterval(function () {
            live.analyser.getByteTimeDomainData(buf);
            var sum = 0;
            for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
            var talking = !live.micMuted && Math.sqrt(sum / buf.length) > 0.035;
            if (talking !== live.talking) { live.talking = talking; updateTeamUI(); }
          }, 150);
        }
      } catch (e) {}
    }
    updateTeamUI();
  }
  function toggleMic() {
    if (!live.localStream) return;
    live.micMuted = !live.micMuted;
    live.localStream.getAudioTracks().forEach(function (tr) { tr.enabled = !live.micMuted; });
    if (live.micMuted) live.talking = false;
    send({ t: 'mic', on: !live.micMuted });
    updateTeamUI();
  }

  function playRemote(stream) {
    remoteAudio.srcObject = stream;
    remoteAudio.muted = false;
    var p;
    try { p = remoteAudio.play(); } catch (e) { tb.hear.hidden = false; return; }
    if (p && p.then) p.then(function () { tb.hear.hidden = true; }, function (e) {
      if (e && e.name === 'NotAllowedError') tb.hear.hidden = false; // one more tap needed
    });
  }
  function attachCall(call) {
    if (live.call && live.call !== call) { try { live.call.close(); } catch (e) {} }
    live.call = call;
    call.on('stream', playRemote);
    call.on('close', function () { if (live.call === call) live.call = null; });
    call.on('error', function () {});
  }
  function maybeCall() {
    // The side with a microphone starts the voice call (the adult first); the other side answers.
    if (!live.connected || live.call || !live.peer) return;
    var target = live.role === 'host' ? live.conn.peer : PEER_PREFIX + live.code;
    var iCall = live.role === 'host' ? !!live.localStream : (!!live.localStream && live.peerMic === false);
    if (iCall) { try { attachCall(live.peer.call(target, live.localStream)); } catch (e) {} }
  }
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    live.lastSeen = Date.now();
    if (m.t === 'ping') return;
    if (m.t === 'bye') { if (live.lost) live.lost(); return; }
    if (m.t === 'hello') { live.peerMic = !!m.mic; updateTeamUI(); maybeCall(); return; }
    if (m.t === 'mic') { live.peerMic = !!m.on; updateTeamUI(); return; }
    if (live.role === 'child') { if (m.t === 'state') applyRemoteState(m); return; }
    // Host: the child's actions.
    if (m.t === 'choose') {
      var it = state.current.filter(function (x) { return x.id === m.id; })[0];
      if (it && !state.chosen && el.celebrate.hidden) choose(it); else sendState();
    } else if (m.t === 'next') { goNext(); }
    else if (m.t === 'again') { if (!el.celebrate.hidden) hideCelebration(); }
    else if (m.t === 'reset') { resetStars(); }
  }
  function attachConn(conn) {
    if (live.conn && live.conn !== conn) { try { live.conn.close(); } catch (e) {} }
    live.conn = conn;
    conn.on('open', function () {
      if (live.conn !== conn) return;
      live.connected = true;
      live.lastSeen = Date.now();
      clearTimeout(live.retryTimer);
      if (live.role === 'child') state.roundNo = -1; // always take the adult's current round
      setStatus('connected');
      send({ t: 'hello', mic: !!live.localStream && !live.micMuted });
      if (live.role === 'host') sendState();
      updateTeamUI();
    });
    conn.on('data', onData);
    var lost = function () {
      if (live.conn !== conn) return;
      live.connected = false; live.peerMic = null; live.conn = null; live.lost = null;
      if (live.call) { try { live.call.close(); } catch (e) {} live.call = null; }
      if (live.role === 'host') setStatus('waiting');
      else { setStatus('reconnecting'); scheduleChildRetry(); }
      updateTeamUI();
    };
    live.lost = lost;
    conn.on('close', lost);
    conn.on('error', lost);
  }
  // Heartbeat: notice a teammate who closed the page or lost the network within ~10 s.
  setInterval(function () {
    if (!live.connected) return;
    send({ t: 'ping' });
    if (Date.now() - live.lastSeen > 10000 && live.lost) {
      var c = live.conn; live.lost();
      try { if (c) c.close(); } catch (e) {}
    }
  }, 3000);
  window.addEventListener('pagehide', function () { send({ t: 'bye' }); });
  function watchPeer(peer) {
    peer.on('disconnected', function () {
      if (peer.destroyed) return;
      setTimeout(function () { if (!peer.destroyed && peer.disconnected) { try { peer.reconnect(); } catch (e) {} } }, 1500);
    });
  }

  function openHostPeer() {
    if (!live.code) live.code = randomCode();
    var peer = live.peer = new window.Peer(PEER_PREFIX + live.code, { debug: 1 });
    watchPeer(peer);
    peer.on('open', function () {
      tb.link.value = location.origin + location.pathname + '?join=' + live.code;
      if (!live.connected) setStatus('waiting');
      updateTeamUI();
    });
    peer.on('connection', function (conn) { attachConn(conn); });
    peer.on('call', function (call) { call.answer(live.localStream || undefined); attachCall(call); });
    peer.on('error', function (e) {
      var type = e && e.type;
      if (type === 'unavailable-id') { try { peer.destroy(); } catch (x) {} live.code = null; openHostPeer(); return; }
      if (type === 'peer-unavailable') return;
      if (!live.connected) setStatus('failed');
    });
  }
  function startHost() {
    if (live.role) return;
    live.role = 'host';
    root.classList.add('live', 'role-host');
    primeAudio();
    var micP = askMic(); // inside the tap
    try { el.panel.close(); } catch (e) {}
    setStatus('connecting');
    updateTeamUI();
    loadPeerJS(function (err) {
      if (err) { setStatus('noPeer'); return; }
      micP.then(function (stream) { setLocalStream(stream); openHostPeer(); });
    });
  }
  function endLive() {
    clearTimeout(live.retryTimer); clearInterval(live.levelTimer);
    try { if (live.call) live.call.close(); } catch (e) {}
    try { if (live.conn) live.conn.close(); } catch (e) {}
    try { if (live.peer) live.peer.destroy(); } catch (e) {}
    if (live.localStream) live.localStream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} });
    try { remoteAudio.pause(); remoteAudio.srcObject = null; } catch (e) {}
    tb.link.value = '';
    live.role = null; live.code = null; live.peer = null; live.conn = null; live.call = null;
    live.connected = false; live.localStream = null; live.peerMic = null; live.talking = false; live.statusKey = '';
    root.classList.remove('live', 'role-host', 'role-child');
    tb.hear.hidden = true; showMicNote(false);
    updateTeamUI();
  }

  function connectToHost() {
    if (!live.peer || live.peer.destroyed || live.connected) return;
    try { attachConn(live.peer.connect(PEER_PREFIX + live.code, { reliable: true })); } catch (e) { scheduleChildRetry(); }
  }
  function scheduleChildRetry() {
    clearTimeout(live.retryTimer);
    live.retryTimer = setTimeout(connectToHost, 3000);
  }
  function openChildPeer() {
    var peer = live.peer = new window.Peer({ debug: 1 });
    watchPeer(peer);
    peer.on('open', connectToHost);
    peer.on('call', function (call) { call.answer(live.localStream || undefined); attachCall(call); });
    peer.on('error', function (e) {
      var type = e && e.type;
      if (type === 'peer-unavailable') { setStatus('waitHost'); scheduleChildRetry(); return; }
      if (!live.connected) { setStatus('failed'); scheduleChildRetry(); }
    });
  }
  function startChild() {
    tb.start.hidden = true;
    $('main').removeAttribute('aria-hidden');
    primeAudio();
    speak(t('prompt'), $('speakPrompt'), 'prompt'); // also unlocks game audio on iOS
    var micP = askMic(); // inside the tap
    setStatus('connecting');
    updateTeamUI();
    loadPeerJS(function (err) {
      if (err) { setStatus('noPeer'); return; }
      micP.then(function (stream) { setLocalStream(stream); openChildPeer(); });
    });
  }
  if (joinCode) {
    live.role = 'child'; live.code = joinCode;
    root.classList.add('live', 'role-child');
  }

  tb.liveStart.addEventListener('click', startHost);
  tb.liveEnd.addEventListener('click', function () { endLive(); try { el.panel.close(); } catch (e) {} });
  tb.startBtn.addEventListener('click', startChild);
  tb.mic.addEventListener('click', toggleMic);
  tb.hear.addEventListener('click', function () {
    var p = remoteAudio.play();
    if (p && p.then) p.then(function () { tb.hear.hidden = true; }, function () {});
  });
  tb.copy.addEventListener('click', function () {
    var v = tb.link.value, btnText = tb.copy.querySelector('span');
    var ok = function () { btnText.textContent = t('copied'); setTimeout(function () { btnText.textContent = t('copy'); }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok, function () { tb.link.select(); });
    else { tb.link.select(); try { document.execCommand('copy'); ok(); } catch (e) {} }
  });

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
    root.classList.toggle('no-speech', !synth && !player);
    updateVoiceStatus();
    updateTeamUI();
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
    stopSpeech();
    applyLang();
  });
  el.themeBtn.addEventListener('click', function () {
    state.theme = THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length];
    saveRaw('hfb-theme', state.theme);
    applyTheme();
  });
  $('speakPrompt').addEventListener('click', function () { speak(t('prompt'), this, 'prompt'); });
  $('speakFeedback').addEventListener('click', function () { speak(chosenSentence(), this, chosenKey()); });
  $('speakCelebrate').addEventListener('click', function () { speak(t('celebrateSay'), this, 'celebrate'); });
  function goNext() {
    if (state.stars >= GOAL) { showCelebration(); return; }
    newRound();
    var first = el.choices.querySelector('.card-main');
    if (first) first.focus({ preventScroll: true });
  }
  el.nextBtn.addEventListener('click', function () {
    if (isLiveChild()) { send({ t: 'next' }); return; }
    goNext();
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
      if (!settings.sound) stopSpeech();
      persist(); applySettings();
    } else if (tg === el.motion) {
      settings.motion = tg.checked;
      persist(); applySettings();
    }
  });
  function resetStars() {
    state.stars = 0; save('hfb-cr-stars', 0); renderStars(-1);
    el.voiceStatus.textContent = t('resetDone');
    sendState();
  }
  el.reset.addEventListener('click', function () {
    if (isLiveChild()) { send({ t: 'reset' }); el.voiceStatus.textContent = t('resetDone'); return; }
    resetStars();
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
  if (synth) {
    refreshVoices();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
    else synth.onvoiceschanged = refreshVoices;
  }
  applySettings();
  if (live.role === 'child') state.stars = 0; // team stars come from the adult's device
  newRound();
  applyLang();
  if (live.role === 'child') {
    tb.start.hidden = false; // "Tap to start": the gesture that unlocks audio and asks for the mic
    $('main').setAttribute('aria-hidden', 'true');
    tb.startBtn.focus({ preventScroll: true });
  } else if (state.stars >= GOAL) showCelebration();
})();
