/* Opposites («برعکس‌ها») — HFB Play Together prototype.
   A picture-only concept game for children who don't read yet: hot/cold, big/small, day/night…
   Levels (5 stars each, then the surprise egg, then Next / Repeat):
     1 Match       one focus pair, the clearest picture of each side; 2 answer symbols
     2 More pictures  the same pair with several different pictures (generalisation)
     3 Sort        drag 4 pictures, one at a time, into the two boxes (one star per finished round)
     4 What helps? everyday situations (a shivering child: hot soup or ice cream?)
     5 All mixed   every active pair; 3 answer symbols
   Errorless help (Adult panel: Auto / Always / Off): the right answer gets a slow, soft gold ring —
   right away on the first tries of a pair, after a few seconds on the next tries, then only after a
   mistake (a progressive time delay). A wrong answer never shows red or an X: the card slides back,
   a soft note plays, the answer is named and gently ringed. Plain JS, no dependencies, works offline.
   Architecture as in Match It: one serializable `state`, actions → render(), emit() for a future live mode. */
(function () {
  'use strict';

  var GOAL = 5, MAX_LEVEL = 5;
  var root = document.documentElement;
  var ART = window.HFBOppArt, WORDS = window.HFBOppWords;
  var PAIRS = ART.PAIRS, POLE = ART.POLE, EX = ART.EX, SITS = ART.SITS;
  var PAIR = {}, EXI = {}, SIT = {};
  PAIRS.forEach(function (p) { PAIR[p.id] = p; });
  EX.forEach(function (e) { EXI[e.id] = e; });
  SITS.forEach(function (s) { SIT[s.id] = s; });
  var ALL_PAIRS = PAIRS.map(function (p) { return p.id; });

  function toFaDigits(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
  var STR = {
    fa: {
      skip: 'پرش به بازی', homeLink: 'صفحهٔ اصلی HFB', title: 'برعکس‌ها',
      modes: ['', 'جور کردن', 'عکس‌های بیشتر', 'دسته‌بندی', 'چی کمک می‌کنه؟', 'همه با هم'],
      dragHint: 'کارت درست رو بکش روی عکس، یا روش بزن.',
      sitHint: 'کارت درست رو بکش روی بچه، یا روش بزن.',
      sortHint: 'عکس رو بکش توی جعبهٔ درست، یا روی جعبه بزن.',
      targetBtn: function (q) { return 'عکس. ' + q + ' برای شنیدن دوباره بزنید.'; },
      cardBtn: function (w) { return w + '. بزنید یا روی عکس بکشید.'; },
      binBtn: function (w) { return 'جعبهٔ ' + w + '. بزنید تا عکس اینجا برود.'; },
      sortItemBtn: function (q) { return 'عکس برای دسته‌بندی. ' + q + ' آن را به یکی از جعبه‌ها بکشید.'; },
      levelUp: 'مرحلهٔ بعد!', allDone: 'همهٔ مرحله‌ها تمام شد!', nextLevel: 'مرحلهٔ بعد', repeatLevel: 'دوباره همین مرحله',
      nextPair: function (p) { return 'جفت بعدی: ' + p; }, playAgain: 'دوباره بازی کنیم',
      levelLabel: function (n) { return 'مرحلهٔ ' + toFaDigits(n); },
      levelLegend: 'مرحله',
      levelHint: '۱: یک جفت، یک عکس روشن · ۲: همان جفت با عکس‌های بیشتر · ۳: دسته‌بندی در دو جعبه · ۴: چی کمک می‌کنه؟ (موقعیت‌ها) · ۵: همهٔ جفت‌ها با هم (۳ کارت). با ۵ ستاره، مرحلهٔ بعد باز می‌شود.',
      pairsLegend: 'جفت‌های فعال', pairsMin: 'حداقل یک جفت باید روشن بماند.',
      focusLegend: 'جفت اصلی (مرحلهٔ ۱ تا ۳)', focusAuto: 'خودکار: بعد از مرحلهٔ ۳ جفت بعدی',
      focusHint: 'مرحله‌های ۱ تا ۳ هر بار فقط یک جفت را تمرین می‌کنند. مرحلهٔ ۴ و ۵ از همهٔ جفت‌های فعال استفاده می‌کنند.',
      helpLegend: 'کمک (یادگیری بدون خطا)', helpAuto: 'خودکار', helpAlways: 'همیشه', helpOff: 'خاموش',
      helpHint: 'خودکار: در ۲ بار اول هر جفت، جواب درست فوراً یک حلقهٔ طلایی آرام می‌گیرد؛ در ۳ بار بعد، بعد از ۴ ثانیه؛ بعد از آن فقط بعد از اشتباه. بعد از اشتباه، دفعهٔ بعد دوباره فوراً کمک می‌شود. همیشه: هر بار. خاموش: فقط تکان آرام بعد از ۲ اشتباه.',
      resetHelp: 'شروع دوبارهٔ مراحل کمک', resetHelpDone: 'مراحل کمک از اول شروع می‌شود.',
      readAloud: 'بلند خواندن', next: 'بعدی', stars: 'ستاره‌های من',
      starCount: function (n) { return toFaDigits(n) + ' از ' + toFaDigits(GOAL); },
      starAria: function (i, filled) { return 'ستارهٔ ' + toFaDigits(i) + (filled ? '، گرفته شد' : '، خالی'); },
      celebrateTitle: 'آفرین! ۵ ستاره!', celebrateSub: 'برعکس‌ها رو خوب پیدا کردی.',
      adultTitle: 'پنل بزرگسال', adultBtn: 'پنل بزرگسال (تنظیمات)', close: 'بستن',
      comfort: 'صدا و حرکت', sound: 'صدا، جلوه‌های صوتی و بلندخوانی', motion: 'انیمیشن', egg: 'تخم‌مرغ سورپرایز بعد از هر ۵ ستاره',
      starsLegend: 'ستاره‌ها', resetStars: 'صفر کردن ستاره‌ها', resetDone: 'ستاره‌ها صفر شد.',
      howLegend: 'روش بازی',
      howText: 'یک عکس نشان داده می‌شود (مثلاً لیوان بخاردار) با صدای مخصوصش؛ کودک کارت درست را روی عکس می‌کشد یا رویش می‌زند. در مرحلهٔ ۳ عکس‌ها را یکی‌یکی در دو جعبه می‌گذارد. با زدن روی عکس، سؤال دوباره پخش می‌شود. صفحه‌کلید: عدد ۱ تا ۳ برای انتخاب.',
      aboutTitle: 'دربارهٔ این بازی',
      aboutText: 'طراحی بر پایهٔ روش‌های رایج آموزشی برای کودکان اوتیستیک: دو انتخاب و یک جفت در هر بار، عکس‌های ساده و روشن، چند عکس متفاوت برای هر مفهوم، کمک بدون خطا که کم‌کم کم می‌شود، و تکرار موارد اشتباه. ابزار درمانی یا تشخیصی نیست و اثربخشی آن آزموده نشده است.',
      togetherTitle: 'حالت با هم',
      togetherText: 'کنار کودک بنشینید، اسم مفهوم را بگویید و روی عکس درست اشاره کنید. برای بازی از راه دور، در تماس تصویری صفحه را با صدای رایانه به اشتراک بگذارید؛ کودک اشاره می‌کند و شما برایش می‌کشید.',
      noSpeech: 'این مرورگر بلندخوانی ندارد؛ متن روی صفحه نمایش داده می‌شود.',
      noVoice: 'صدای فارسی روی این دستگاه پیدا نشد.',
      voiceOk: function (n) { return 'صدای بلندخوانی: ' + n; },
      voiceClips: 'صدای بلندخوانی: فایل‌های صوتی ضبط‌شده (روی همهٔ دستگاه‌ها، از جمله آیفون).',
      audioErr: 'خطای پخش صدا: ', langBtn: 'Switch to English', langBtnText: 'EN',
      theme: { dark: 'پوسته: تیره (برای تغییر بزنید)', dim: 'پوسته: نیمه‌روشن (برای تغییر بزنید)', light: 'پوسته: روشن (برای تغییر بزنید)' },
      docTitle: 'برعکس‌ها · HFB Play Together'
    },
    en: {
      skip: 'Skip to game', homeLink: 'HFB home page', title: 'Opposites',
      modes: ['', 'Match', 'More pictures', 'Sort', 'What helps?', 'All mixed'],
      dragHint: 'Drag the right card onto the picture, or tap it.',
      sitHint: 'Drag the right card to the child, or tap it.',
      sortHint: 'Drag the picture into the right box, or tap a box.',
      targetBtn: function (q) { return 'Picture. ' + q + ' Tap to hear it again.'; },
      cardBtn: function (w) { return w + '. Tap it or drag it onto the picture.'; },
      binBtn: function (w) { return w + ' box. Tap to put the picture here.'; },
      sortItemBtn: function (q) { return 'Picture to sort. ' + q + ' Drag it into one of the boxes.'; },
      levelUp: 'Level up!', allDone: 'All levels done!', nextLevel: 'Next level', repeatLevel: 'Repeat this level',
      nextPair: function (p) { return 'Next pair: ' + p; }, playAgain: 'Play again',
      levelLabel: function (n) { return 'Level ' + n; },
      levelLegend: 'Level',
      levelHint: '1: one pair, one clear picture each · 2: the same pair, more pictures · 3: sort into two boxes · 4: what helps? (situations) · 5: all pairs mixed (3 cards). 5 stars opens the next level.',
      pairsLegend: 'Active pairs', pairsMin: 'At least one pair stays on.',
      focusLegend: 'Focus pair (levels 1–3)', focusAuto: 'Auto: next pair after level 3',
      focusHint: 'Levels 1–3 practise one pair at a time. Levels 4 and 5 use all active pairs.',
      helpLegend: 'Help (errorless prompts)', helpAuto: 'Auto', helpAlways: 'Always', helpOff: 'Off',
      helpHint: 'Auto: for the first 2 tries of each pair the right answer gets a soft gold ring right away; for the next 3, after 4 seconds; after that only after a mistake. After a mistake the next try is helped right away again. Always: every time. Off: only a gentle wiggle after 2 mistakes.',
      resetHelp: 'Restart help steps', resetHelpDone: 'Help steps start from the beginning.',
      readAloud: 'Read aloud', next: 'Next', stars: 'My stars',
      starCount: function (n) { return n + ' of ' + GOAL; },
      starAria: function (i, filled) { return 'Star ' + i + (filled ? ', earned' : ', empty'); },
      celebrateTitle: 'Well done! 5 stars!', celebrateSub: 'You found the opposites.',
      adultTitle: 'Adult panel', adultBtn: 'Adult panel (settings)', close: 'Close',
      comfort: 'Sound and motion', sound: 'Sound, sound effects and read-aloud', motion: 'Animation', egg: 'Surprise egg after every 5 stars',
      starsLegend: 'Stars', resetStars: 'Reset stars', resetDone: 'Stars reset.',
      howLegend: 'How to play',
      howText: 'A picture appears (for example a steaming mug) with its own sound; the child drags the right card onto it or taps the card. In level 3 the pictures go one by one into two boxes. Tap the picture to hear the question again. Keyboard: 1–3 to choose.',
      aboutTitle: 'About this game',
      aboutText: 'Based on common teaching methods for autistic children: two choices and one pair at a time, simple clear pictures, several different pictures for each concept, errorless help that fades, and missed items coming back. It is not a therapy or diagnostic tool and has not been tested for effectiveness.',
      togetherTitle: 'Together mode',
      togetherText: 'Sit with the child, say the concept word and point to the right picture. To play remotely, share your screen on a video call (with computer audio); the child points and you drag for them.',
      noSpeech: 'This browser has no read-aloud; the text stays on screen.',
      noVoice: 'No English voice found on this device.',
      voiceOk: function (n) { return 'Read-aloud voice: ' + n; },
      voiceClips: 'Read-aloud: recorded audio clips (works on all devices, including iPhone).',
      audioErr: 'Audio playback error: ', langBtn: 'تغییر به فارسی', langBtnText: 'فا',
      theme: { dark: 'Theme: dark (tap to change)', dim: 'Theme: dim (tap to change)', light: 'Theme: light (tap to change)' },
      docTitle: 'Opposites · HFB Play Together'
    }
  };
  function t(key) { return STR[state.lang][key]; }
  function w() { return WORDS[state.lang]; }
  function word(pole) { return w().word[pole]; }
  function pairName(id, lang) { var L = lang || state.lang, p = PAIR[id], a = WORDS[L].word[p.a], b = WORDS[L].word[p.b]; return a + ' / ' + (L === 'en' ? b.toLowerCase() : b); }

  /* ---------- Storage ---------- */
  function load(key, fallback) { try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function loadRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function saveRaw(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var DEFAULTS = { level: 1, sound: true, motion: !(reduceMQ && reduceMQ.matches), pairs: ALL_PAIRS.slice(), focus: 'auto', help: 'auto' };
  function cleanSettings(s) {
    s = Object.assign({}, DEFAULTS, s || {});
    s.level = Math.max(1, Math.min(MAX_LEVEL, parseInt(s.level, 10) || 1));
    s.sound = !!s.sound; s.motion = !!s.motion;
    s.pairs = Array.isArray(s.pairs) ? ALL_PAIRS.filter(function (id) { return s.pairs.indexOf(id) >= 0; }) : ALL_PAIRS.slice();
    if (!s.pairs.length) s.pairs = ALL_PAIRS.slice();
    if (s.focus !== 'auto' && !PAIR[s.focus]) s.focus = 'auto';
    if (['auto', 'always', 'off'].indexOf(s.help) < 0) s.help = 'auto';
    return s;
  }

  /* ---------- THE state ---------- */
  var state = {
    lang: loadRaw('hfb-lang') === 'en' ? 'en' : 'fa',
    theme: (function () { var x = loadRaw('hfb-theme'); return (x === 'dark' || x === 'dim' || x === 'light') ? x : 'dark'; })(),
    settings: cleanSettings(load('hfb-op-settings', {})),
    focusIdx: Math.max(0, parseInt(load('hfb-op-focus', 0), 10) || 0),
    stars: Math.max(0, Math.min(GOAL, parseInt(load('hfb-op-stars', 0), 10) || 0)),
    round: null,     // pick: {n, kind:'pick', pair, ex, pole, options[poles], retry}
                     // sit:  {n, kind:'sit', sit, answer, options[item ids], retry}
                     // sort: {n, kind:'sort', pair, bins[poles], queue[ex ids], idx, placed[{ex,bin}]}
    phase: 'ask',    // 'ask' | 'anim' (correct, animating) | 'done' (star + praise) — sort also: 'placing'
    misses: 0,       // wrong answers for the current trial (sort: current picture)
    prompt: false,   // errorless gold ring on the right answer
    hint: false,     // after 2 misses: gentle wiggle
    celebrating: false,
    justFilled: -1
  };
  var listeners = [];
  function emit(type, payload) { listeners.forEach(function (fn) { try { fn(type, payload, state); } catch (e) {} }); }

  function activePairs() { return state.settings.pairs.slice(); }
  function focusPair() {
    var act = activePairs(), f = state.settings.focus;
    if (f !== 'auto' && act.indexOf(f) >= 0) return f;
    return act[state.focusIdx % act.length];
  }
  function nextFocusId() { var act = activePairs(), i = act.indexOf(focusPair()); return act[(i + 1) % act.length]; }

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    main: $('main'), promptText: $('promptText'), target: $('target'), scene: $('scene'), dropHint: $('dropHint'),
    cards: $('cards'), sortArea: $('sortArea'), sortItem: $('sortItem'), sortScene: $('sortScene'), sortDots: $('sortDots'), sortHint: $('sortHint'), bins: $('bins'),
    feedback: $('feedback'), feedbackText: $('feedbackText'), nextBtn: $('nextBtn'),
    stars: $('stars'), starCount: $('starCount'), levelNum: $('levelNum'), levelMode: $('levelMode'), levelPair: $('levelPair'), levelPairWrap: $('levelPairWrap'),
    celebrate: $('celebrate'), levelUpText: $('levelUpText'), nextLevel: $('nextLevelBtn'), nextLevelText: $('nextLevelText'),
    nextPair: $('nextPairBtn'), nextPairText: $('nextPairText'), playAgain: $('playAgainBtn'), playAgainText: $('playAgainText'),
    langBtn: $('langBtn'), langBtnText: $('langBtnText'), themeBtn: $('themeBtn'), themeIcon: $('themeIcon'),
    adultBtn: $('adultBtn'), panel: $('adultPanel'), form: $('adultForm'), pairChecks: $('pairChecks'), pairsStatus: $('pairsStatus'), focusSel: $('focusSel'),
    sound: $('soundToggle'), motion: $('motionToggle'), egg: $('eggToggle'), reset: $('resetStars'), resetStatus: $('resetStatus'), voiceStatus: $('voiceStatus'),
    resetHelp: $('resetHelp'), resetHelpStatus: $('resetHelpStatus')
  };

  /* ---------- Read-aloud: recorded clips (same voices and audio path as the other games) ---------- */
  var ASSET_VER = '20261007-2';
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var voices = [];
  function refreshVoices() { if (!synth) return; try { voices = synth.getVoices() || []; } catch (e) { voices = []; } updateVoiceStatus(); }
  function pickVoice(lang) {
    var want = lang === 'fa' ? 'fa' : 'en', exact = lang === 'fa' ? 'fa-ir' : 'en-us';
    var norm = function (v) { return (v.lang || '').toLowerCase().replace('_', '-'); };
    return voices.find(function (v) { return norm(v) === exact; }) || voices.find(function (v) { return norm(v).indexOf(want) === 0; }) || null;
  }
  var lastAudioErr = '';
  var player = null;
  try { if (typeof Audio !== 'undefined') { player = new Audio(); player.preload = 'auto'; } } catch (e) { player = null; }
  function updateVoiceStatus() {
    if (!el.voiceStatus) return;
    var err = lastAudioErr ? ' ' + t('audioErr') + lastAudioErr : '';
    if (player) { el.voiceStatus.textContent = t('voiceClips') + err; return; }
    if (!synth) { el.voiceStatus.textContent = t('noSpeech'); return; }
    var v = pickVoice(state.lang);
    el.voiceStatus.textContent = v ? t('voiceOk')(v.name) : t('noVoice');
  }
  var playToken = 0, unlocked = false, speakingBtn = null;
  function clipUrl(key) { return 'audio/' + state.lang + '/' + key + '.mp3?v=' + ASSET_VER; }
  function setSpeaking(btn) { if (speakingBtn) speakingBtn.classList.remove('speaking'); speakingBtn = btn || null; if (btn) btn.classList.add('speaking'); }
  function stopSpeech() {
    playToken++;
    if (player) { try { player.pause(); } catch (e) {} }
    if (synth && (synth.speaking || synth.pending)) { try { synth.cancel(); } catch (e) {} }
    if (speakingBtn) { speakingBtn.classList.remove('speaking'); speakingBtn = null; }
  }
  function audioFailed(msg) { lastAudioErr = msg; updateVoiceStatus(); try { console.warn('[opposites] audio: ' + msg); } catch (e) {} }
  function playClip(key, text, btn, next) {
    var my = ++playToken, url = clipUrl(key);
    setSpeaking(btn);
    var fallback = function (why) { if (my !== playToken) return; playToken++; audioFailed(why + ' (' + url + ')'); speakSynth(text, btn, next); };
    player.onended = function () { if (my !== playToken) return; if (next) { next(); return; } if (btn) btn.classList.remove('speaking'); };
    player.onerror = function () { fallback('load error ' + ((player.error && player.error.code) || '')); };
    player.src = url;
    var p;
    try { p = player.play(); } catch (e) { fallback(e && e.name || 'play() threw'); return; }
    if (p && p.then) p.then(function () { unlocked = true; if (lastAudioErr) { lastAudioErr = ''; updateVoiceStatus(); } }, function (e) {
      if (my !== playToken) return;
      var n = (e && e.name) || 'play() rejected';
      if (n === 'NotAllowedError') { audioFailed(n); if (btn) btn.classList.remove('speaking'); return; }
      fallback(n);
    });
  }
  function speakSynth(text, btn, next) {
    if (!synth) { if (btn) btn.classList.remove('speaking'); return; }
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = state.lang === 'fa' ? 'fa-IR' : 'en-US';
      var v = pickVoice(state.lang); if (v) u.voice = v;
      u.rate = 0.9;
      setSpeaking(btn);
      var done = function () { if (btn) btn.classList.remove('speaking'); };
      u.onend = function () { if (next) next(); else done(); }; u.onerror = done;
      synth.speak(u);
    } catch (e) {}
  }
  function speak(text, btn, key, next) {
    if (!state.settings.sound || !text) return;
    stopSpeech();
    if (player && key) { playClip(key, text, btn, next); return; }
    speakSynth(text, btn, next);
  }
  function chain(text, btn, key) { return function () { if (!state.settings.sound) return; if (player && key) { playClip(key, text, btn); return; } speakSynth(text, btn); }; }
  function unlockAudio() {
    if (!state.settings.sound) return;
    ctx();
    if (unlocked || !player) return;
    unlocked = true;
    try { player.src = 'audio/silence.mp3?v=' + ASSET_VER; var p = player.play(); if (p && p.catch) p.catch(function () { unlocked = false; }); } catch (e) { unlocked = false; }
  }

  /* ---------- Sound effects (WebAudio synth, no files; soft and short, never harsh) ---------- */
  var actx = null;
  function ctx() {
    if (!state.settings.sound) return null;
    try {
      if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; actx = new AC(); }
      if (actx.state === 'suspended') actx.resume();
    } catch (e) { return null; }
    return actx;
  }
  function tone(freq, start, dur, opt) {
    var c = ctx(); if (!c) return;
    opt = opt || {};
    var t0 = c.currentTime + (start || 0), o = c.createOscillator(), g = c.createGain();
    o.type = opt.type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, t0 + dur);
    if (opt.vib) { var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = opt.vib; lg.gain.value = opt.vibDepth || 12; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + 0.05); }
    var gain = Math.min(opt.gain || 0.12, 0.2);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + (opt.attack || 0.015));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  var noiseBuf = null;
  function noise(start, dur, opt) {
    var c = ctx(); if (!c) return;
    opt = opt || {};
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var t0 = c.currentTime + (start || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf;
    f.type = opt.filter || 'bandpass';
    f.frequency.setValueAtTime(opt.freq || 1000, t0);
    if (opt.to) f.frequency.exponentialRampToValueAtTime(opt.to, t0 + dur);
    f.Q.value = opt.q || 1;
    var gain = Math.min(opt.gain || 0.08, 0.17);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + (opt.attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(c.destination);
    s.start(t0, Math.random() * 1.5); s.stop(t0 + dur + 0.05);
  }
  var SFX = {
    hot: function () { noise(0, 1.1, { filter: 'highpass', freq: 3000, gain: 0.05, attack: 0.1 }); for (var i = 0; i < 6; i++) noise(0.1 + i * 0.15 + Math.random() * 0.06, 0.04, { freq: 1800 + Math.random() * 1500, q: 3, gain: 0.09 }); },
    cold: function () { noise(0, 1.2, { freq: 500, to: 1100, q: 2, gain: 0.07, attack: 0.3 }); tone(300, 0.75, 0.45, { type: 'triangle', vib: 18, vibDepth: 25, gain: 0.07 }); },
    big: function () { tone(110, 0, 0.32, { to: 60, gain: 0.18 }); tone(100, 0.42, 0.32, { to: 55, gain: 0.18 }); },
    small: function () { tone(1400, 0, 0.09, { to: 1900, gain: 0.07 }); tone(1500, 0.16, 0.09, { to: 2100, gain: 0.07 }); },
    day: function () { [0, 0.28, 0.62].forEach(function (s, i) { tone(2300 + i * 200, s, 0.1, { to: 3100, gain: 0.05 }); tone(2700 + i * 150, s + 0.12, 0.08, { to: 2200, gain: 0.05 }); }); },
    night: function () { for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) tone(4200, i * 0.4 + j * 0.05, 0.035, { type: 'triangle', gain: 0.035 }); },
    light: function () { noise(0, 0.03, { freq: 2500, q: 2, gain: 0.12 }); tone(1046, 0.08, 0.5, { gain: 0.06 }); tone(1568, 0.16, 0.6, { gain: 0.05 }); },
    dark: function () { noise(0, 0.03, { freq: 1800, q: 2, gain: 0.12 }); tone(440, 0.08, 0.5, { to: 180, gain: 0.07 }); },
    wet: function () { [0, 0.25, 0.42, 0.7].forEach(function (s) { tone(900 + Math.random() * 300, s, 0.08, { to: 1700, gain: 0.08 }); }); },
    dry: function () { noise(0, 0.25, { freq: 1200, q: 0.8, gain: 0.06, attack: 0.08 }); noise(0.32, 0.25, { freq: 1400, q: 0.8, gain: 0.06, attack: 0.08 }); },
    full: function () { [0, 0.18, 0.36, 0.54].forEach(function (s, i) { tone(260 + i * 60, s, 0.13, { to: 420 + i * 70, gain: 0.09 }); }); },
    empty: function () { tone(240, 0, 0.45, { type: 'triangle', gain: 0.09 }); tone(240, 0.32, 0.45, { type: 'triangle', gain: 0.07 }); },
    open: function () { tone(180, 0, 0.8, { type: 'sawtooth', to: 320, vib: 9, vibDepth: 20, gain: 0.03, attack: 0.1 }); },
    closed: function () { tone(300, 0, 0.45, { type: 'sawtooth', to: 190, vib: 9, vibDepth: 20, gain: 0.03, attack: 0.08 }); tone(90, 0.5, 0.25, { to: 55, gain: 0.17 }); noise(0.5, 0.08, { freq: 400, gain: 0.08 }); },
    fast: function () { noise(0, 0.6, { freq: 400, to: 2600, q: 2, gain: 0.09, attack: 0.05 }); tone(300, 0, 0.55, { type: 'triangle', to: 900, gain: 0.05 }); },
    slow: function () { [0, 0.5, 1.0].forEach(function (s) { tone(160, s, 0.3, { type: 'triangle', to: 130, gain: 0.08 }); }); },
    loud: function () { [0, 0.22, 0.44].forEach(function (s) { tone(140, s, 0.2, { to: 70, gain: 0.17 }); noise(s, 0.1, { freq: 300, gain: 0.09 }); }); },
    quiet: function () { noise(0, 0.9, { filter: 'highpass', freq: 2500, gain: 0.04, attack: 0.25 }); },
    up: function () { tone(400, 0, 0.6, { to: 1300, gain: 0.08 }); },
    down: function () { tone(1200, 0, 0.6, { to: 350, gain: 0.08 }); tone(200, 0.62, 0.25, { to: 330, gain: 0.08 }); },
    soft: function () { noise(0, 0.35, { filter: 'lowpass', freq: 700, gain: 0.08, attack: 0.06 }); },
    hard: function () { [0, 0.2].forEach(function (s) { tone(800, s, 0.06, { type: 'square', to: 500, gain: 0.04 }); noise(s, 0.04, { freq: 2000, q: 2, gain: 0.1 }); }); }
  };
  var SIT_CUE = {
    cold: 'cold', hot: 'hot', wet: 'wet', dark: 'dark', thirsty: 'empty', door: 'hard',
    hungry: function () { tone(110, 0, 0.5, { type: 'triangle', vib: 7, vibDepth: 30, gain: 0.09 }); tone(95, 0.45, 0.5, { type: 'triangle', vib: 6, vibDepth: 25, gain: 0.08 }); },
    baby: function () { tone(520, 0, 0.5, { type: 'triangle', to: 700, vib: 6, vibDepth: 30, gain: 0.04 }); tone(600, 0.6, 0.5, { type: 'triangle', to: 450, vib: 6, vibDepth: 30, gain: 0.04 }); }
  };
  function sfx(pole) { if (!state.settings.sound) return; var f = SFX[pole]; if (f) try { f(); } catch (e) {} }
  function sitCue(id) { if (!state.settings.sound) return; var c = SIT_CUE[id]; try { if (typeof c === 'function') c(); else if (c) SFX[c](); } catch (e) {} }
  function chime() { tone(784, 0, 0.25, { gain: 0.09 }); tone(988, 0.1, 0.25, { gain: 0.09 }); tone(1318, 0.2, 0.45, { gain: 0.08 }); }
  function softCue() { tone(392, 0, 0.18, { type: 'triangle', gain: 0.06 }); tone(330, 0.16, 0.22, { type: 'triangle', gain: 0.05 }); }
  function popSound() { tone(660, 0, 0.08, { to: 990, gain: 0.07 }); }
  function fanfare() { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, i * 0.13, 0.32, { gain: 0.09 }); }); }

  /* ---------- Randomness (crypto) ---------- */
  function rnd(n) {
    if (n <= 1) return 0;
    try { var b = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do { crypto.getRandomValues(b); } while (b[0] >= lim); return b[0] % n; } catch (e) { return Math.floor(Math.random() * n); }
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  var slotHist = {};
  /* Put `correct` among `options` so the right answer is never in the same slot more than 2 times in a row,
     and over time each slot is used about equally. */
  function placeTarget(correct, others, key) {
    var n = others.length + 1, h = slotHist[key] || (slotHist[key] = { last: [], count: [] });
    var slots = []; for (var i = 0; i < n; i++) { h.count[i] = h.count[i] || 0; slots.push(i); }
    var L = h.last, banned = (L.length >= 2 && L[L.length - 1] === L[L.length - 2]) ? L[L.length - 1] : -1;
    slots = slots.filter(function (s) { return s !== banned; });
    var min = Math.min.apply(null, slots.map(function (s) { return h.count[s]; }));
    var pool = slots.filter(function (s) { return h.count[s] <= min + 1; });
    var slot = pool[rnd(pool.length)];
    h.count[slot]++; L.push(slot); if (L.length > 6) L.shift();
    var out = shuffle(others); out.splice(slot, 0, correct);
    return out;
  }

  /* ---------- Rounds ---------- */
  // Distractor pairs for level 5 avoid pairs whose pictures could also fit (a hot mug also looks full, etc.).
  var EXTRA_AVOID = { hotcold: ['fullempty', 'wetdry'], fullempty: ['hotcold'], wetdry: ['hotcold'], updown: ['fastslow'], fastslow: ['updown'] };
  function clashes(a, b) {
    return a === b || (PAIR[a].avoid || []).indexOf(b) >= 0 || (PAIR[b].avoid || []).indexOf(a) >= 0 ||
      (EXTRA_AVOID[a] || []).indexOf(b) >= 0 || (EXTRA_AVOID[b] || []).indexOf(a) >= 0;
  }
  var missed = {};                 // key (exemplar id or 'sit:'+id) -> {due: round number, step: 1|2}
  var asked = {};                  // key -> times asked (balance)
  var hist = { key: '', poles: [] };
  var helpData = load('hfb-op-help', {}); // help key -> {n: answered trials, miss: last trial had a miss}
  var roundNo = 0;
  function poleOfKey(key) { return key.indexOf('sit:') === 0 ? ART.ITEM_POLE[SIT[key.slice(4)].answer] : EXI[key].pole; }
  function pickItem(keys) {
    var n = roundNo, noRepeat = keys.length > 2;
    var due = keys.filter(function (k) { return missed[k] && missed[k].due <= n && !(noRepeat && k === hist.key); })
      .sort(function (a, b) { return missed[a].due - missed[b].due; });
    if (due.length) return { key: due[0], retry: true };
    var pool = keys.filter(function (k) { return !(noRepeat && k === hist.key); });
    var P = hist.poles, L = P.length;
    if (L >= 2 && P[L - 1] === P[L - 2]) { // the same answer at most 2 times in a row
      var alt = pool.filter(function (k) { return poleOfKey(k) !== P[L - 1]; });
      if (alt.length) pool = alt;
    }
    var notMissed = pool.filter(function (k) { return !missed[k]; }); // missed items wait for their retry turn
    if (notMissed.length) pool = notMissed;
    var min = Math.min.apply(null, pool.map(function (k) { return asked[k] || 0; }));
    var fresh = pool.filter(function (k) { return (asked[k] || 0) <= min + 1; });
    return { key: fresh[rnd(fresh.length)], retry: false };
  }
  function noteAsked(key) {
    asked[key] = (asked[key] || 0) + 1;
    hist.key = key; hist.poles.push(poleOfKey(key)); if (hist.poles.length > 6) hist.poles.shift();
  }
  function makeRound() {
    var lv = state.settings.level, act = activePairs(), f = focusPair(), r, pick, keys;
    roundNo++;
    if (lv === 3) return makeSortRound(f);
    if (lv === 4) {
      var sits = SITS.filter(function (s) { return act.indexOf(s.pair) >= 0; });
      if (!sits.length) sits = SITS.slice();
      pick = pickItem(sits.map(function (s) { return 'sit:' + s.id; }));
      noteAsked(pick.key);
      var s = SIT[pick.key.slice(4)];
      return { n: roundNo, kind: 'sit', sit: s.id, pair: s.pair, answer: s.answer, options: placeTarget(s.answer, [s.wrong], 's2'), retry: pick.retry, key: pick.key };
    }
    keys = EX.filter(function (e) {
      if (lv === 5) return act.indexOf(e.pair) >= 0;
      return e.pair === f && (lv === 2 || e.proto);
    }).map(function (e) { return e.id; });
    pick = pickItem(keys);
    noteAsked(pick.key);
    var ex = EXI[pick.key], others = [POLE[ex.pole].opp];
    if (lv === 5) {
      var cand = act.filter(function (p) { return !clashes(p, ex.pair); });
      if (!cand.length) cand = ALL_PAIRS.filter(function (p) { return !clashes(p, ex.pair); });
      var dp = PAIR[cand[rnd(cand.length)]];
      others.push(rnd(2) ? dp.a : dp.b);
    }
    r = { n: roundNo, kind: 'pick', pair: ex.pair, ex: ex.id, pole: ex.pole, options: placeTarget(ex.pole, others, 'p' + (others.length + 1)), retry: pick.retry, key: pick.key };
    return r;
  }
  function makeSortRound(pairId) {
    var p = PAIR[pairId], queue = [];
    [p.a, p.b].forEach(function (pole) {
      var ids = EX.filter(function (e) { return e.pole === pole; }).map(function (e) { return e.id; });
      var due = shuffle(ids.filter(function (id) { return missed[id]; }));
      var rest = shuffle(ids.filter(function (id) { return !missed[id]; }));
      queue = queue.concat(due.concat(rest).slice(0, 2));
    });
    queue = shuffle(queue);
    var bins = placeTarget(p.a, [p.b], 'b');
    return { n: roundNo, kind: 'sort', pair: pairId, bins: bins, queue: queue, idx: 0, placed: [], retry: false, key: 'sort:' + pairId };
  }
  function curSortEx() { var r = state.round; return r && r.kind === 'sort' ? EXI[r.queue[Math.min(r.idx, r.queue.length - 1)]] : null; }
  function rightAnswer() { // pole (pick/sort) or item id (sit) that is correct right now
    var r = state.round; if (!r) return null;
    if (r.kind === 'pick') return r.pole;
    if (r.kind === 'sit') return r.answer;
    var e = curSortEx(); return e ? e.pole : null;
  }
  function helpKey() { var r = state.round; return !r ? '' : r.kind === 'sit' ? 'sit:' + r.sit : r.pair; }

  /* ---------- Errorless help: progressive time delay ---------- */
  function promptDelay() {
    var mode = state.settings.help;
    if (mode === 'always') return 0;
    if (mode === 'off') return -1;
    var h = helpData[helpKey()] || { n: 0, miss: false };
    if (h.miss || h.n < 2) return 0;
    if (h.n < 5) return 4000;
    return -1;
  }
  function noteHelp(hadMiss) {
    var k = helpKey(), h = helpData[k] || { n: 0, miss: false };
    h.n++; h.miss = !!hadMiss; helpData[k] = h;
    save('hfb-op-help', helpData);
  }
  var promptTimer = null;
  function schedulePrompt() {
    clearTimeout(promptTimer); promptTimer = null;
    var d = promptDelay();
    if (d === 0) state.prompt = true;
    else if (d > 0) promptTimer = setTimeout(function () { if (state.phase === 'ask' && !state.celebrating) { state.prompt = true; render(); emit('prompt', null); } }, d);
  }
  function noteMissed(key, hadMiss, wasRetry) {
    if (hadMiss) { missed[key] = { due: roundNo + 2 + rnd(3), step: 1 }; return; }
    if (wasRetry && missed[key]) {
      if (missed[key].step === 1) missed[key] = { due: roundNo + 4 + rnd(3), step: 2 };
      else delete missed[key];
    }
  }

  /* ---------- Actions ---------- */
  var timer = null;
  function clearTimer() { clearTimeout(timer); timer = null; clearTimeout(promptTimer); promptTimer = null; clearTimeout(cueTimer); cueTimer = null; }
  function persistSettings() { save('hfb-op-settings', state.settings); }
  function persistStars() { save('hfb-op-stars', state.stars); }
  function askText() { var r = state.round; return r.kind === 'sit' ? w().sit[r.sit] : w().ask[r.pair]; }
  function askKey() { var r = state.round; return r.kind === 'sit' ? 'sit_' + r.sit : 'ask_' + r.pair; }
  var cueTimer = null;
  function playCue() {
    var r = state.round; if (!r) return;
    if (r.kind === 'sit') sitCue(r.sit);
    else { var e = r.kind === 'sort' ? curSortEx() : EXI[r.ex]; if (e) sfx(e.pole); }
  }
  /* The picture's own sound first (sizzle, wind, birds…), then the question. */
  function present(btn, opts) {
    opts = opts || {};
    var r = state.round; if (!r || !state.settings.sound) return;
    stopSpeech(); clearTimeout(cueTimer);
    playCue();
    var pre = null;
    if (r.retry && opts.first) pre = 'try_again';
    else if (r.kind === 'sort' && r.idx === 0 && opts.first) pre = 'sort_intro';
    cueTimer = setTimeout(function () {
      if (state.round !== r || state.celebrating) return;
      if (pre) speak(w().ui[pre], btn, pre, chain(askText(), btn, askKey()));
      else speak(askText(), btn, askKey());
    }, 900);
  }
  function newRound(opts) {
    opts = opts || {};
    clearTimer();
    state.round = makeRound();
    state.phase = 'ask'; state.misses = 0; state.prompt = false; state.hint = false; state.justFilled = -1;
    schedulePrompt();
    render();
    emit('round', state.round);
    if (opts.say) present(null, { first: true });
  }
  function choose(id) {
    var r = state.round;
    if (!r || r.kind === 'sort' || state.phase !== 'ask' || state.celebrating) return false;
    var right = rightAnswer();
    if (id === right) {
      clearTimer(); stopSpeech();
      state.phase = 'anim'; state.prompt = false; state.hint = false;
      noteHelp(state.misses > 0); noteMissed(r.key, state.misses > 0, r.retry);
      if (r.kind === 'sit') sfx(ART.ITEM_POLE[id]); else sfx(r.pole);
      popSound();
      render(); emit('correct', id);
      timer = setTimeout(award, state.settings.motion ? 1500 : 600);
      return true;
    }
    state.misses++;
    state.hint = state.misses >= 2;
    if (state.settings.help !== 'off') { state.prompt = true; clearTimeout(promptTimer); }
    missed[r.key] = { due: roundNo + 2 + rnd(3), step: 1 };
    softCue();
    var pole = r.kind === 'sit' ? null : r.pole;
    setTimeout(function () {
      if (state.round !== r || state.phase !== 'ask') return;
      if (pole) speak(w().is[pole], null, 'is_' + pole); else speak(askText(), null, askKey());
    }, 350);
    render(); emit('wrong', id);
    return false;
  }
  function sortDrop(pole) {
    var r = state.round;
    if (!r || r.kind !== 'sort' || state.phase !== 'ask' || state.celebrating) return false;
    var e = curSortEx();
    if (pole === e.pole) {
      clearTimer(); stopSpeech();
      state.phase = 'placing'; state.prompt = false; state.hint = false;
      noteHelp(state.misses > 0);
      if (state.misses > 0) missed[e.id] = { due: 0, step: 1 }; else delete missed[e.id];
      r.placed.push({ ex: e.id, bin: pole });
      popSound();
      speak(w().word[pole], null, 'word_' + pole);
      render(); emit('sorted', { ex: e.id, bin: pole });
      timer = setTimeout(function () {
        r.idx++; state.misses = 0;
        if (r.idx >= r.queue.length) { award(); return; }
        state.phase = 'ask';
        schedulePrompt(); render();
        present(null, {});
      }, state.settings.motion ? 1300 : 900);
      return true;
    }
    state.misses++;
    state.hint = state.misses >= 2;
    if (state.settings.help !== 'off') { state.prompt = true; clearTimeout(promptTimer); }
    softCue();
    setTimeout(function () { if (state.round === r && state.phase === 'ask') speak(w().is[e.pole], null, 'is_' + e.pole); }, 350);
    render(); emit('wrong', pole);
    return false;
  }
  function feedbackSay(btn) {
    var r = state.round; if (!r || state.phase !== 'done') return;
    if (r.kind === 'sort') speak(w().ui.sort_done, btn, 'sort_done');
    else if (r.kind === 'sit') speak(w().sityes[r.sit], btn, 'sityes_' + r.sit);
    else speak(w().yes[r.pole], btn, 'yes_' + r.pole);
  }
  function award() {
    clearTimer();
    if (!state.round || state.phase === 'done') return;
    state.phase = 'done';
    state.stars = Math.min(GOAL, state.stars + 1);
    state.justFilled = state.stars - 1;
    persistStars();
    render();
    emit('star', state.stars);
    chime();
    feedbackSay($('speakFeedback'));
    if (state.stars >= GOAL) { eggPending = true; timer = setTimeout(celebrateWithEgg, 2800); }
    else timer = setTimeout(function () { newRound({ say: true }); }, 4000);
  }
  function finish() { // tests / live mode: complete the current trial correctly
    if (state.celebrating) return;
    if (state.phase === 'done') newRound();
    var r = state.round; if (!r) return;
    if (r.kind === 'sort') { while (state.round === r && r.idx < r.queue.length && state.phase === 'ask') { sortDrop(curSortEx().pole); clearTimer(); r.idx++; state.phase = 'ask'; state.misses = 0; } award(); }
    else { if (state.phase === 'ask') choose(rightAnswer()); award(); }
  }
  function next() { if (state.celebrating) return; if (state.stars >= GOAL) { celebrateWithEgg(); return; } newRound({ say: true }); }

  /* ---------- Surprise egg (shared: ../shared/egg.js) ---------- */
  var eggPending = false;
  function eggOn() { return !!(window.HFBEgg && window.HFBEgg.enabled()); }
  function celebrateWithEgg() {
    if (window.HFBEgg && window.HFBEgg.isOpen()) return;
    if (eggPending && eggOn()) {
      eggPending = false; clearTimer();
      window.HFBEgg.show({
        lang: state.lang, sound: state.settings.sound, motion: state.settings.motion,
        speak: function (text, key) { speak(text, null, key); },
        onClose: showCelebration
      });
      return;
    }
    eggPending = false;
    showCelebration();
  }
  function showCelebration() {
    clearTimer();
    state.celebrating = true;
    render();
    emit('celebrate', null);
    fanfare();
    setTimeout(function () { if (state.celebrating) celebrateSay($('speakCelebrate')); }, 400);
    (state.settings.level < MAX_LEVEL ? el.nextLevel : el.playAgain).focus({ preventScroll: true });
  }
  function celebrateSay(btn) {
    if (state.settings.level < MAX_LEVEL) speak(w().ui.level_up, btn, 'level_up');
    else speak(w().ui.celebrate, btn, 'celebrate');
  }
  function advanceFocus() {
    if (state.settings.focus === 'auto') { state.focusIdx = (activePairs().indexOf(focusPair()) + 1) % activePairs().length; save('hfb-op-focus', state.focusIdx); }
    else { state.settings.focus = nextFocusId(); }
  }
  function nextLevel() {
    var lv = state.settings.level;
    state.celebrating = false;
    state.stars = 0; persistStars();
    if (lv === 3 && state.settings.focus === 'auto') advanceFocus(); // levels 1–3 done for this pair; the next pair is ready for next time
    state.settings.level = Math.min(MAX_LEVEL, lv + 1);
    persistSettings();
    emit('level', state.settings.level);
    newRound({ say: true });
  }
  function nextPair() {
    state.celebrating = false;
    state.stars = 0; persistStars();
    advanceFocus();
    state.settings.level = 1;
    persistSettings();
    emit('pair', focusPair());
    newRound({ say: true });
  }
  function closeCelebration() { // = repeat this level
    state.celebrating = false;
    state.stars = 0; persistStars();
    emit('playAgain', null);
    newRound({ say: true });
  }
  function resetStars() { state.stars = 0; persistStars(); render(); emit('resetStars', null); }
  function resetHelp() { helpData = {}; save('hfb-op-help', helpData); emit('resetHelp', null); if (state.phase === 'ask') { state.prompt = false; schedulePrompt(); } render(); }
  function setSetting(key, value) {
    if (key === 'level' && Number(value) !== state.settings.level) { state.stars = 0; persistStars(); }
    state.settings[key] = value;
    state.settings = cleanSettings(state.settings);
    persistSettings();
    if (key === 'sound' && !value) stopSpeech();
    emit('setting', { key: key, value: value });
    if (key === 'level' || key === 'pairs' || key === 'focus') newRound();
    else if (key === 'help') { if (state.phase === 'ask') { state.prompt = false; state.hint = state.misses >= 2; schedulePrompt(); if (state.misses && value !== 'off') state.prompt = true; } render(); }
    else render();
  }

  /* ---------- Dragging (pointer events: touch, pen and mouse) ---------- */
  function hit(x, y, src, zoneEl) {
    var tr = zoneEl.getBoundingClientRect(), m = 18;
    if (x >= tr.left - m && x <= tr.right + m && y >= tr.top - m && y <= tr.bottom + m) return true;
    var cr = src.getBoundingClientRect(), cx = (cr.left + cr.right) / 2, cy = (cr.top + cr.bottom) / 2;
    return cx >= tr.left && cx <= tr.right && cy >= tr.top && cy <= tr.bottom;
  }
  function slideBack(src) {
    src.classList.remove('dragging');
    src.classList.add('returning');
    src.style.transform = '';
    setTimeout(function () { src.classList.remove('returning'); }, 450);
  }
  function flyTo(src, zoneEl) {
    var tr = zoneEl.getBoundingClientRect(), cr = src.getBoundingClientRect();
    var cur = (src.style.transform.match(/translate\(([-\d.]+)px, ?([-\d.]+)px\)/) || [0, 0, 0]);
    var dx = (tr.left + tr.width / 2) - (cr.left + cr.width / 2) + Number(cur[1]);
    var dy = (tr.top + tr.height / 2) - (cr.top + cr.height / 2) + Number(cur[2]);
    src.classList.remove('dragging');
    src.classList.add('flying');
    src.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.3)';
  }
  function nudge(n) { if (!n) return; n.classList.remove('nudge'); void n.offsetWidth; n.classList.add('nudge'); setTimeout(function () { n.classList.remove('nudge'); }, 500); }
  /* opts: container, find(e) -> source element, zones() -> [{el, id}], drop(src, id) -> bool, tap(src) */
  function attachDrag(o) {
    var d = null;
    o.container.addEventListener('pointerdown', function (e) {
      var src = o.find(e);
      if (!src || d || state.phase !== 'ask' || state.celebrating) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      try { src.setPointerCapture(e.pointerId); } catch (err) {}
      d = { src: src, pid: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, over: null };
    });
    o.container.addEventListener('pointermove', function (e) {
      if (!d || e.pointerId !== d.pid) return;
      var dx = e.clientX - d.x0, dy = e.clientY - d.y0;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      if (!d.moved) { d.moved = true; d.src.classList.add('dragging'); emit('dragStart', d.src.dataset.id || 'item'); }
      e.preventDefault();
      d.src.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.06)';
      var zs = o.zones(), over = null;
      for (var i = 0; i < zs.length; i++) if (hit(e.clientX, e.clientY, d.src, zs[i].el)) { over = zs[i]; break; }
      zs.forEach(function (z) { z.el.classList.toggle('over', z === over); });
    });
    function end(e, cancelled) {
      if (!d || e.pointerId !== d.pid) return;
      var x = d; d = null;
      var zs = o.zones();
      zs.forEach(function (z) { z.el.classList.remove('over'); });
      try { x.src.releasePointerCapture(e.pointerId); } catch (err) {}
      if (!x.moved) { if (!cancelled) { x.src.dataset.tapped = '1'; o.tap(x.src); } return; }
      if (!cancelled) {
        for (var i = 0; i < zs.length; i++) {
          if (hit(e.clientX, e.clientY, x.src, zs[i].el)) {
            if (o.drop(x.src, zs[i].id)) { flyTo(x.src, o.zoneEl ? (o.zoneEl(zs[i].id) || zs[i].el) : zs[i].el); return; }
            break;
          }
        }
      }
      slideBack(x.src);
    }
    o.container.addEventListener('pointerup', function (e) { end(e, false); });
    o.container.addEventListener('pointercancel', function (e) { end(e, true); });
    o.container.addEventListener('click', function (e) { // keyboard Enter/Space; taps are handled on pointerup
      var src = o.find(e); if (!src) return;
      if (src.dataset.tapped) { delete src.dataset.tapped; return; }
      if (e.detail === 0) o.tap(src);
    });
    o.container.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  function chooseCard(card) { // tap or key: the card flies into the picture if right, wiggles back if not
    if (!card || state.phase !== 'ask') return;
    if (choose(card.dataset.id)) flyTo(card, el.target); else nudge(card);
  }
  attachDrag({
    container: el.cards,
    find: function (e) { return e.target.closest('.card'); },
    zones: function () { return [{ el: el.target, id: 'target' }]; },
    drop: function (src) { return choose(src.dataset.id); },
    tap: chooseCard
  });
  function binEl(pole) { return el.bins.querySelector('.bin[data-pole="' + pole + '"]'); }
  attachDrag({
    container: el.sortItem.parentNode,
    find: function (e) { return e.target.closest('#sortItem'); },
    zones: function () { return Array.prototype.map.call(el.bins.querySelectorAll('.bin'), function (b) { return { el: b, id: b.dataset.pole }; }); },
    drop: function (src, pole) { return sortDrop(pole); },
    zoneEl: function (pole) { return binEl(pole); },
    tap: function () { present(el.sortItem, {}); }
  });
  function sortTo(pole) {
    if (sortDrop(pole)) { var b = binEl(pole); if (b) flyTo(el.sortItem, b); } else nudge(binEl(pole));
  }
  el.bins.addEventListener('click', function (e) { var b = e.target.closest('.bin'); if (b) sortTo(b.dataset.pole); });
  el.target.addEventListener('click', function () { if (state.phase === 'ask') present(el.target, {}); });
  document.addEventListener('pointerup', unlockAudio, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') unlockAudio(); }, true);

  /* ---------- Render: everything from `state` ---------- */
  var THEMES = ['dark', 'dim', 'light'];
  var THEME_ICON = { dark: '🌙', dim: '🌗', light: '☀️' };
  var drawn = { scene: '', cards: '', sort: '', bins: '', adult: '' };
  function num(i) { return state.lang === 'fa' ? toFaDigits(i) : String(i); }
  function render() {
    var L = state.lang, r = state.round, s = state.settings;
    root.lang = L; root.dir = L === 'fa' ? 'rtl' : 'ltr';
    root.setAttribute('data-theme', state.theme);
    root.classList.toggle('motion', !!s.motion);
    root.classList.toggle('sound-off', !s.sound);
    root.classList.toggle('no-speech', !synth && !player);
    document.title = t('docTitle');
    document.querySelectorAll('[data-i18n]').forEach(function (n) {
      var v = STR[L][n.getAttribute('data-i18n')];
      if (typeof v === 'string' && n.textContent !== v) n.textContent = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) {
      var v = STR[L][n.getAttribute('data-i18n-aria')];
      if (typeof v === 'string') n.setAttribute('aria-label', v);
    });
    el.langBtn.setAttribute('aria-label', t('langBtn'));
    el.langBtn.setAttribute('lang', L === 'fa' ? 'en' : 'fa');
    el.langBtnText.textContent = t('langBtnText');
    el.adultBtn.setAttribute('aria-label', t('adultBtn'));
    el.themeIcon.textContent = THEME_ICON[state.theme];
    el.themeBtn.setAttribute('aria-label', t('theme')[state.theme]);
    el.themeBtn.title = t('theme')[state.theme];
    el.levelNum.textContent = t('levelLabel')(s.level);
    el.levelMode.textContent = t('modes')[s.level];
    el.levelPairWrap.hidden = s.level > 3;
    el.levelPair.textContent = s.level <= 3 ? pairName(focusPair()) : '';

    if (r) {
      el.main.dataset.kind = r.kind;
      el.sortArea.hidden = r.kind !== 'sort';
      el.promptText.textContent = askText();
      if (r.kind === 'sort') renderSort(r, L); else renderPick(r, L);
      if (state.phase === 'done') {
        el.feedback.hidden = false;
        el.feedbackText.textContent = r.kind === 'sort' ? w().ui.sort_done : r.kind === 'sit' ? w().sityes[r.sit] : w().yes[r.pole];
      } else el.feedback.hidden = true;
    }

    el.stars.innerHTML = '';
    for (var i = 0; i < GOAL; i++) {
      var li = document.createElement('li'), filled = i < state.stars;
      li.className = 'star' + (filled ? ' filled' : '') + (i === state.justFilled ? ' just-filled' : '');
      li.setAttribute('aria-label', t('starAria')(i + 1, filled));
      li.innerHTML = '<span class="star-glyph" aria-hidden="true">⭐</span>';
      el.stars.appendChild(li);
    }
    el.starCount.textContent = t('starCount')(state.stars);

    el.celebrate.hidden = !state.celebrating;
    if (state.celebrating) el.main.setAttribute('aria-hidden', 'true'); else el.main.removeAttribute('aria-hidden');
    var more = s.level < MAX_LEVEL;
    el.levelUpText.textContent = more ? t('levelUp') + ' ' + t('levelLabel')(s.level + 1) + ' · ' + t('modes')[s.level + 1] : t('allDone');
    el.nextLevel.hidden = !more;
    el.nextLevelText.textContent = t('nextLevel');
    el.nextPair.hidden = !(s.level <= 3 && activePairs().length > 1);
    el.nextPairText.textContent = t('nextPair')(pairName(nextFocusId()));
    el.playAgainText.textContent = more ? t('repeatLevel') : t('playAgain');
    el.playAgain.classList.toggle('primary', !more);

    renderSettings();
    updateVoiceStatus();
  }
  function renderPick(r, L) {
    var playing = state.phase !== 'ask', right = rightAnswer();
    if (drawn.scene !== String(r.n)) {
      el.scene.innerHTML = r.kind === 'sit' ? ART.sitSVG(SIT[r.sit]) : ART.exSVG(EXI[r.ex], true);
      drawn.scene = String(r.n);
    }
    el.target.classList.toggle('yes', playing && r.kind === 'pick');
    el.target.classList.toggle('solved', playing && r.kind === 'sit');
    el.target.classList.toggle('glow', state.phase === 'done');
    el.target.dataset.ex = r.ex || ''; el.target.dataset.sit = r.sit || '';
    el.target.setAttribute('aria-label', t('targetBtn')(askText()));
    el.dropHint.textContent = playing ? '' : (r.kind === 'sit' ? t('sitHint') : t('dragHint'));
    var ck = r.n + ':' + L;
    if (drawn.cards !== ck) {
      el.cards.innerHTML = '';
      el.cards.dataset.count = String(r.options.length);
      r.options.forEach(function (id, idx) {
        var b = document.createElement('button'), label = r.kind === 'sit' ? w().item[id] : word(id);
        b.type = 'button'; b.className = 'card'; b.dataset.id = id;
        b.setAttribute('aria-keyshortcuts', String(idx + 1));
        b.setAttribute('aria-label', t('cardBtn')(label));
        b.innerHTML = '<span class="card-num" aria-hidden="true"></span><span class="card-art" aria-hidden="true"></span><span class="card-label" aria-hidden="true"></span>';
        b.children[0].textContent = num(idx + 1);
        b.children[1].innerHTML = r.kind === 'sit' ? ART.itemSVG(id) : ART.symbolSVG(id);
        b.children[2].textContent = label;
        el.cards.appendChild(b);
      });
      drawn.cards = ck;
    }
    Array.prototype.forEach.call(el.cards.children, function (b) {
      var ok = b.dataset.id === right;
      b.classList.toggle('used', playing && ok);
      b.classList.toggle('dim', playing && !ok);
      b.classList.toggle('prompt', !playing && state.prompt && ok);
      b.classList.toggle('hint', !playing && state.hint && ok);
      b.setAttribute('aria-disabled', playing ? 'true' : 'false');
      if (playing && !ok) b.style.transform = '';
    });
  }
  function renderSort(r, L) {
    var e = curSortEx(), placing = state.phase !== 'ask';
    var sk = r.n + ':' + r.idx;
    if (drawn.sort !== sk) {
      el.sortScene.innerHTML = ART.exSVG(e, true);
      el.sortItem.classList.remove('flying', 'returning', 'dragging', 'yes');
      el.sortItem.style.transform = '';
      drawn.sort = sk;
    }
    el.sortItem.classList.toggle('gone', state.phase === 'done');
    el.sortItem.dataset.ex = e.id;
    el.sortItem.setAttribute('aria-label', t('sortItemBtn')(askText()));
    el.sortHint.textContent = placing ? '' : t('sortHint');
    el.sortDots.innerHTML = r.queue.map(function (x, i) { return '<li class="' + (i < r.placed.length ? 'done' : (i === r.idx && !placing ? 'now' : '')) + '"></li>'; }).join('');
    var bk = r.n + ':' + L + ':' + r.placed.length;
    if (drawn.bins !== bk) {
      var last = r.placed.length ? r.placed[r.placed.length - 1].bin : '';
      el.bins.innerHTML = '';
      r.bins.forEach(function (pole, idx) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'bin' + (pole === last && drawn.bins.split(':')[0] === String(r.n) ? ' got' : ''); b.dataset.pole = pole;
        b.setAttribute('aria-keyshortcuts', String(idx + 1));
        b.setAttribute('aria-label', t('binBtn')(word(pole)));
        var tray = r.placed.filter(function (p) { return p.bin === pole; }).map(function (p) { return '<span>' + ART.exSVG(EXI[p.ex], false) + '</span>'; }).join('');
        b.innerHTML = '<span class="card-num" aria-hidden="true">' + num(idx + 1) + '</span><span class="bin-sym" aria-hidden="true">' + ART.symbolSVG(pole) + '</span><span class="bin-label" aria-hidden="true"></span><span class="bin-tray" aria-hidden="true">' + tray + '</span>';
        b.querySelector('.bin-label').textContent = word(pole);
        el.bins.appendChild(b);
      });
      drawn.bins = bk;
    }
    Array.prototype.forEach.call(el.bins.children, function (b) {
      var ok = e && b.dataset.pole === e.pole;
      b.classList.toggle('prompt', !placing && state.prompt && ok);
      b.classList.toggle('hint', !placing && state.hint && ok);
      b.setAttribute('aria-disabled', placing ? 'true' : 'false');
    });
  }
  function renderSettings() {
    var s = state.settings, L = state.lang;
    el.sound.checked = !!s.sound;
    el.motion.checked = !!s.motion;
    if (el.egg) el.egg.checked = eggOn();
    el.form.querySelectorAll('input[name="level"]').forEach(function (x) { x.checked = Number(x.value) === s.level; });
    el.form.querySelectorAll('input[name="help"]').forEach(function (x) { x.checked = x.value === s.help; });
    var ak = L + ':' + s.pairs.join(',') + ':' + s.focus + ':' + focusPair();
    if (drawn.adult !== ak) {
      el.pairChecks.innerHTML = '';
      PAIRS.forEach(function (p) {
        var lab = document.createElement('label');
        lab.innerHTML = '<input type="checkbox" name="pair"> <span class="pair-syms" aria-hidden="true">' + ART.symbolSVG(p.a) + ART.symbolSVG(p.b) + '</span> <span class="pair-name"></span>';
        var inp = lab.querySelector('input'); inp.value = p.id; inp.checked = s.pairs.indexOf(p.id) >= 0;
        lab.querySelector('.pair-name').textContent = pairName(p.id);
        el.pairChecks.appendChild(lab);
      });
      el.focusSel.innerHTML = '';
      var o = document.createElement('option'); o.value = 'auto'; o.textContent = t('focusAuto') + ' (' + pairName(focusPair()) + ')'; el.focusSel.appendChild(o);
      s.pairs.forEach(function (id) { var op = document.createElement('option'); op.value = id; op.textContent = pairName(id); el.focusSel.appendChild(op); });
      el.focusSel.value = s.focus;
      drawn.adult = ak;
    }
  }

  /* ---------- Events ---------- */
  el.langBtn.addEventListener('click', function () {
    state.lang = state.lang === 'fa' ? 'en' : 'fa';
    saveRaw('hfb-lang', state.lang);
    stopSpeech(); render(); emit('lang', state.lang);
  });
  el.themeBtn.addEventListener('click', function () {
    state.theme = THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length];
    saveRaw('hfb-theme', state.theme);
    render();
  });
  $('speakPrompt').addEventListener('click', function () { present(this, {}); });
  $('speakFeedback').addEventListener('click', function () { feedbackSay(this); });
  $('speakCelebrate').addEventListener('click', function () { celebrateSay(this); });
  el.nextBtn.addEventListener('click', next);
  el.nextLevel.addEventListener('click', nextLevel);
  el.nextPair.addEventListener('click', nextPair);
  el.playAgain.addEventListener('click', closeCelebration);
  el.adultBtn.addEventListener('click', function () {
    renderSettings(); updateVoiceStatus();
    el.resetStatus.textContent = ''; el.resetHelpStatus.textContent = ''; el.pairsStatus.textContent = '';
    if (typeof el.panel.showModal === 'function') el.panel.showModal(); else el.panel.setAttribute('open', '');
  });
  el.panel.addEventListener('close', function () { el.adultBtn.focus({ preventScroll: true }); });
  el.panel.addEventListener('click', function (e) { if (e.target === el.panel) el.panel.close(); });
  el.form.addEventListener('change', function (e) {
    var tg = e.target;
    if (tg.name === 'level') setSetting('level', Number(tg.value));
    else if (tg.name === 'help') setSetting('help', tg.value);
    else if (tg.name === 'pair') {
      var on = Array.prototype.filter.call(el.pairChecks.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; });
      if (!on.length) { tg.checked = true; el.pairsStatus.textContent = t('pairsMin'); return; }
      el.pairsStatus.textContent = '';
      setSetting('pairs', on);
    }
    else if (tg === el.focusSel) setSetting('focus', tg.value);
    else if (tg === el.sound) setSetting('sound', tg.checked);
    else if (tg === el.motion) setSetting('motion', tg.checked);
    else if (tg === el.egg) { if (window.HFBEgg) window.HFBEgg.setEnabled(tg.checked); emit('setting', { key: 'egg', value: tg.checked }); }
  });
  el.reset.addEventListener('click', function () { resetStars(); el.resetStatus.textContent = t('resetDone'); });
  el.resetHelp.addEventListener('click', function () { resetHelp(); el.resetHelpStatus.textContent = t('resetHelpDone'); });
  document.addEventListener('keydown', function (e) {
    if (el.panel.open || e.altKey || e.ctrlKey || e.metaKey) return;
    if (window.HFBEgg && window.HFBEgg.isOpen()) return;
    if (state.celebrating) { if (e.key === 'Escape') closeCelebration(); return; }
    var k = e.key.replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); });
    var n = parseInt(k, 10), r = state.round;
    if (!r || state.phase !== 'ask' || !(n >= 1)) return;
    if (r.kind === 'sort') { if (n <= r.bins.length) { e.preventDefault(); sortTo(r.bins[n - 1]); } }
    else if (n <= r.options.length) { e.preventDefault(); chooseCard(el.cards.children[n - 1]); }
  });
  el.celebrate.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(el.celebrate.querySelectorAll('button'), function (b) { return b.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (reduceMQ && reduceMQ.addEventListener) reduceMQ.addEventListener('change', function (m) { if (m.matches) setSetting('motion', false); });

  /* ---------- Public hook (tests + a future live mode; no networking here) ---------- */
  window.HFBOpp = {
    getState: function () { return JSON.parse(JSON.stringify(state)); },
    on: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    render: render,
    actions: { newRound: newRound, choose: choose, sortDrop: sortDrop, finish: finish, next: next, showCelebration: showCelebration, celebrateWithEgg: celebrateWithEgg,
               nextLevel: nextLevel, nextPair: nextPair, closeCelebration: closeCelebration, resetStars: resetStars, resetHelp: resetHelp, setSetting: setSetting, present: present },
    focusPair: focusPair, rightAnswer: rightAnswer,
    getMissed: function () { return JSON.parse(JSON.stringify(missed)); },
    getHelp: function () { return JSON.parse(JSON.stringify(helpData)); },
    promptDelay: promptDelay,
    data: { pairs: PAIRS, ex: EX, sits: SITS },
    words: WORDS
  };

  /* ---------- Init ---------- */
  if (synth) {
    refreshVoices();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
    else synth.onvoiceschanged = refreshVoices;
  }
  newRound();
  if (state.stars >= GOAL) showCelebration();
})();
