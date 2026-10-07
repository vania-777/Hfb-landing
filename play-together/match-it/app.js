/* Match It («چی به چی می‌خوره؟») — HFB Play Together prototype.
   Drag-to-match: the child drags the item that goes with the target (water → glass).
   A right drop plays a small SVG/CSS animation with a synthesized sound effect, then a star
   and praise. A wrong drop gently slides back (soft sound, no red, no X); after 2 misses the
   right card gently wiggles. Plain JS, no dependencies, works offline. Not a clinical tool.

   Architecture (so a two-player live mode can be added later, as in Choice & Reward):
   - ALL game state lives in one plain, serializable object: `state`.
   - Actions (newRound / select / drop / finish / next / nextLevel / closeCelebration /
     resetStars / setSetting) change `state`, then call render(). render() draws the screen
     from `state` only. Dragging is UI only: it ends in drop(itemId), the semantic action.
   - Audio side effects run inside the action (inside the user's gesture where possible).
   - Every action is reported through emit(type, payload); a live mode can listen via
     window.HFBMatch.on(fn) and replay remote actions with HFBMatch.actions.*.
     Nothing is sent over the network today. */
(function () {
  'use strict';

  var GOAL = 5;
  var root = document.documentElement;
  var ART = window.HFBMatchArt;
  var PAIRS = ART.PAIRS;
  var PAIR = {};
  PAIRS.forEach(function (p) { PAIR[p.id] = p; });

  var LEVELS = [null, { n: 2 }, { n: 3 }, { n: 4 }];
  var MAX_LEVEL = LEVELS.length - 1;

  var STR = {
    fa: {
      skip: 'پرش به بازی',
      homeLink: 'صفحهٔ اصلی HFB',
      title: 'چی به چی می‌خوره؟',
      ask: function (p) { return p.t.fa + ' به چی احتیاج داره؟'; },
      yes: function (p) { return p.yes.fa; },
      dragHint: 'کارت درست رو بکش و بنداز روی تصویر.',
      selHint: 'حالا روی تصویر بزن.',
      targetBtn: function (p) { return 'تصویر: ' + p.t.fa + '. کارت را اینجا بیندازید.'; },
      cardBtn: function (p) { return p.i.fa + '. بکشید روی تصویر، یا بزنید و بعد روی تصویر بزنید.'; },
      tryAgain: 'یه بار دیگه امتحان کنیم.',
      levelUp: 'مرحلهٔ بعد!',
      levelUpSay: 'آفرین! بریم مرحلهٔ بعد!',
      allDone: 'همهٔ مرحله‌ها تمام شد!',
      nextLevel: 'مرحلهٔ بعد',
      repeatLevel: 'دوباره همین مرحله',
      levelLabel: function (n) { return 'مرحلهٔ ' + toFaDigits(n); },
      levelMode: function (n) { return toFaDigits(n) + ' کارت'; },
      levelLegend: 'مرحله',
      levelHint: '۱: ۲ کارت · ۲: ۳ کارت · ۳: ۴ کارت. با ۵ ستاره، مرحلهٔ بعد باز می‌شود.',
      readAloud: 'بلند خواندن',
      next: 'بعدی',
      stars: 'ستاره‌های من',
      starCount: function (n) { return toFaDigits(n) + ' از ' + toFaDigits(GOAL); },
      starAria: function (i, filled) { return 'ستارهٔ ' + toFaDigits(i) + (filled ? '، گرفته شد' : '، خالی'); },
      celebrateTitle: 'آفرین! ۵ ستاره!',
      celebrateSub: 'چیزهایی که به هم می‌خورن رو خوب پیدا کردی.',
      celebrateSay: 'آفرین! پنج ستاره گرفتی!',
      playAgain: 'دوباره بازی کنیم',
      adultTitle: 'پنل بزرگسال',
      adultBtn: 'پنل بزرگسال (تنظیمات)',
      close: 'بستن',
      comfort: 'صدا و حرکت',
      sound: 'صدا، جلوه‌های صوتی و بلندخوانی',
      motion: 'انیمیشن',
      egg: 'تخم‌مرغ سورپرایز بعد از هر ۵ ستاره',
      starsLegend: 'ستاره‌ها',
      resetStars: 'صفر کردن ستاره‌ها',
      resetDone: 'ستاره‌ها صفر شد.',
      howLegend: 'روش بازی',
      howText: 'کارت را با انگشت یا ماوس روی تصویر بکشید. اگر کشیدن سخت است: روی کارت بزنید، بعد روی تصویر. با صفحه‌کلید: عدد ۱ تا ۴ برای انتخاب کارت، بعد Enter روی تصویر.',
      togetherTitle: 'حالت با هم',
      togetherText: 'برای بازی از راه دور، در تماس تصویری صفحه را به اشتراک بگذارید (همراه با صدای رایانه). کودک کارت را نشان می‌دهد یا می‌گوید و شما برایش می‌کشید؛ یا اگر ابزار تماس اجازه می‌دهد، کنترل را به او بدهید.',
      noSpeech: 'این مرورگر بلندخوانی ندارد؛ متن روی صفحه نمایش داده می‌شود.',
      noVoice: 'صدای فارسی روی این دستگاه پیدا نشد؛ مرورگر ممکن است با صدای پیش‌فرض بخواند یا ساکت بماند.',
      voiceOk: function (n) { return 'صدای بلندخوانی: ' + n; },
      voiceClips: 'صدای بلندخوانی: فایل‌های صوتی ضبط‌شده (روی همهٔ دستگاه‌ها، از جمله آیفون).',
      audioErr: 'خطای پخش صدا: ',
      langBtn: 'Switch to English',
      langBtnText: 'EN',
      theme: { dark: 'پوسته: تیره (برای تغییر بزنید)', dim: 'پوسته: نیمه‌روشن (برای تغییر بزنید)', light: 'پوسته: روشن (برای تغییر بزنید)' },
      docTitle: 'چی به چی می‌خوره؟ · HFB Play Together'
    },
    en: {
      skip: 'Skip to game',
      homeLink: 'HFB home page',
      title: 'What goes together?',
      ask: function (p) { return 'What goes with ' + p.t.en + '?'; },
      yes: function (p) { return p.yes.en; },
      dragHint: 'Drag the right card onto the picture.',
      selHint: 'Now tap the picture.',
      targetBtn: function (p) { return 'Picture: ' + p.t.en + '. Drop a card here.'; },
      cardBtn: function (p) { return p.i.en + '. Drag it onto the picture, or tap it and then tap the picture.'; },
      tryAgain: 'Let\'s try again.',
      levelUp: 'Level up!',
      levelUpSay: 'Level up! On to the next level!',
      allDone: 'All levels done!',
      nextLevel: 'Next level',
      repeatLevel: 'Repeat this level',
      levelLabel: function (n) { return 'Level ' + n; },
      levelMode: function (n) { return n + ' cards'; },
      levelLegend: 'Level',
      levelHint: '1: 2 cards · 2: 3 cards · 3: 4 cards. 5 stars opens the next level.',
      readAloud: 'Read aloud',
      next: 'Next',
      stars: 'My stars',
      starCount: function (n) { return n + ' of ' + GOAL; },
      starAria: function (i, filled) { return 'Star ' + i + (filled ? ', earned' : ', empty'); },
      celebrateTitle: 'Well done! 5 stars!',
      celebrateSub: 'You found what goes together.',
      celebrateSay: 'Well done! You got five stars!',
      playAgain: 'Play again',
      adultTitle: 'Adult panel',
      adultBtn: 'Adult panel (settings)',
      close: 'Close',
      comfort: 'Sound and motion',
      sound: 'Sound, sound effects and read-aloud',
      motion: 'Animation',
      egg: 'Surprise egg after every 5 stars',
      starsLegend: 'Stars',
      resetStars: 'Reset stars',
      resetDone: 'Stars reset.',
      howLegend: 'How to play',
      howText: 'Drag a card onto the picture with a finger or the mouse. If dragging is hard: tap a card, then tap the picture. Keyboard: 1–4 picks a card, then Enter on the picture.',
      togetherTitle: 'Together mode',
      togetherText: 'To play remotely, share your screen on a video call (with computer audio). The child points to or names a card and you drag it for them, or give them control if your call app allows it.',
      noSpeech: 'This browser has no read-aloud; the text stays on screen.',
      noVoice: 'No English voice found on this device; the browser may use a default voice or stay silent.',
      voiceOk: function (n) { return 'Read-aloud voice: ' + n; },
      voiceClips: 'Read-aloud: recorded audio clips (works on all devices, including iPhone).',
      audioErr: 'Audio playback error: ',
      langBtn: 'تغییر به فارسی',
      langBtnText: 'فا',
      theme: { dark: 'Theme: dark (tap to change)', dim: 'Theme: dim (tap to change)', light: 'Theme: light (tap to change)' },
      docTitle: 'What goes together? · HFB Play Together'
    }
  };
  function toFaDigits(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }

  /* ---------- Storage helpers ---------- */
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function loadRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function saveRaw(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var DEFAULTS = { level: 1, sound: true, motion: !(reduceMQ && reduceMQ.matches) };
  function cleanSettings(s) {
    s = Object.assign({}, DEFAULTS, s || {});
    s.level = Math.max(1, Math.min(MAX_LEVEL, parseInt(s.level, 10) || 1));
    s.sound = !!s.sound; s.motion = !!s.motion;
    return s;
  }

  /* ---------- THE state (one serializable object) ---------- */
  var state = {
    lang: loadRaw('hfb-lang') === 'en' ? 'en' : 'fa',
    theme: (function () { var t = loadRaw('hfb-theme'); return (t === 'dark' || t === 'dim' || t === 'light') ? t : 'dark'; })(),
    settings: cleanSettings(load('hfb-mi-settings', {})),
    stars: Math.max(0, Math.min(GOAL, parseInt(load('hfb-mi-stars', 0), 10) || 0)),
    round: null,      // { n, pair, retry, options: [pair ids whose ITEMS are on the cards] }
    phase: 'ask',     // 'ask' (waiting for a drop) | 'anim' (success animation) | 'done' (star + praise)
    misses: 0,        // wrong drops this round
    hint: false,      // after 2 misses the right card gently wiggles
    selected: null,   // tap-to-select fallback (tap a card, then the picture)
    celebrating: false,
    justFilled: -1
  };

  var listeners = [];
  function emit(type, payload) { listeners.forEach(function (fn) { try { fn(type, payload, state); } catch (e) {} }); }

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    main: $('main'), promptText: $('promptText'), target: $('target'), scene: $('scene'), dropHint: $('dropHint'),
    cards: $('cards'), feedback: $('feedback'), feedbackText: $('feedbackText'), nextBtn: $('nextBtn'),
    stars: $('stars'), starCount: $('starCount'), levelNum: $('levelNum'), levelMode: $('levelMode'),
    celebrate: $('celebrate'), levelUpText: $('levelUpText'), nextLevel: $('nextLevelBtn'), nextLevelText: $('nextLevelText'),
    playAgain: $('playAgainBtn'), playAgainText: $('playAgainText'),
    langBtn: $('langBtn'), langBtnText: $('langBtnText'), themeBtn: $('themeBtn'), themeIcon: $('themeIcon'),
    adultBtn: $('adultBtn'), panel: $('adultPanel'), form: $('adultForm'),
    sound: $('soundToggle'), motion: $('motionToggle'), reset: $('resetStars'), resetStatus: $('resetStatus'), voiceStatus: $('voiceStatus'),
    egg: $('eggToggle')
  };
  function t(key) { return STR[state.lang][key]; }
  function itemName(id) { var n = PAIR[id].i[state.lang]; return state.lang === 'en' ? n.charAt(0).toUpperCase() + n.slice(1) : n; }

  /* ---------- Read-aloud: recorded clips (same path as the other games) ----------
     audio/<lang>/<key>.mp3: ask_<pair>, yes_<pair>, item_<pair>, try_again, level_up, celebrate.
     One shared <audio> element; src + play() inside the tap (iOS rule). The first tap also
     plays a tiny silent clip so later clips (after the animation) may play on iPhone.
     speechSynthesis is only a fallback. */
  var ASSET_VER = '20261007-1';
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var voices = [];
  function refreshVoices() { if (!synth) return; try { voices = synth.getVoices() || []; } catch (e) { voices = []; } updateVoiceStatus(); }
  function pickVoice(lang) {
    var want = lang === 'fa' ? 'fa' : 'en', exact = lang === 'fa' ? 'fa-ir' : 'en-us';
    var norm = function (v) { return (v.lang || '').toLowerCase().replace('_', '-'); };
    return voices.find(function (v) { return norm(v) === exact; }) || voices.find(function (v) { return norm(v).indexOf(want) === 0; }) || null;
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
  var player = null;
  try { if (typeof Audio !== 'undefined') { player = new Audio(); player.preload = 'auto'; } } catch (e) { player = null; }
  var playToken = 0, unlocked = false;
  function clipUrl(key) { return 'audio/' + state.lang + '/' + key + '.mp3?v=' + ASSET_VER; }
  var speakingBtn = null;
  function setSpeaking(btn) {
    if (speakingBtn) speakingBtn.classList.remove('speaking');
    speakingBtn = btn || null;
    if (btn) btn.classList.add('speaking');
  }
  function stopSpeech() {
    playToken++;
    if (player) { try { player.pause(); } catch (e) {} }
    if (synth && (synth.speaking || synth.pending)) { try { synth.cancel(); } catch (e) {} }
    if (speakingBtn) { speakingBtn.classList.remove('speaking'); speakingBtn = null; }
  }
  function audioFailed(msg) { lastAudioErr = msg; updateVoiceStatus(); try { console.warn('[match-it] audio: ' + msg); } catch (e) {} }
  function playClip(key, text, btn, next) {
    var my = ++playToken, url = clipUrl(key);
    setSpeaking(btn);
    var fallback = function (why) {
      if (my !== playToken) return;
      playToken++;
      audioFailed(why + ' (' + url + ')');
      speakSynth(text, btn, next);
    };
    player.onended = function () {
      if (my !== playToken) return;
      if (next) { next(); return; }
      if (btn) btn.classList.remove('speaking');
    };
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
  function chain(text, btn, key) {
    return function () {
      if (!state.settings.sound) return;
      if (player && key) { playClip(key, text, btn); return; }
      speakSynth(text, btn);
    };
  }
  // First user gesture: unlock the shared audio element (silent clip) and the Web Audio context.
  function unlockAudio() {
    if (!state.settings.sound) return;
    ctx();
    if (unlocked || !player) return;
    unlocked = true;
    try {
      player.src = 'audio/silence.mp3?v=' + ASSET_VER;
      var p = player.play();
      if (p && p.catch) p.catch(function () { unlocked = false; });
    } catch (e) { unlocked = false; }
  }

  /* ---------- Sound effects (Web Audio, synthesized; no files) ---------- */
  var audioCtx = null, master = null, noiseBuf = null;
  function ctx() {
    if (!state.settings.sound) return null;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) {
        audioCtx = new AC();
        master = audioCtx.createGain(); master.gain.value = 0.9; master.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch (e) { return null; }
  }
  function getNoise(c) {
    if (noiseBuf) return noiseBuf;
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function envGain(c, t0, dur, peak, attack, release) {
    var g = c.createGain();
    attack = attack || 0.02; release = Math.min(release || 0.06, dur * 0.8);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.setValueAtTime(peak, t0 + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(master);
    return g;
  }
  var SFX = {
    rnd: Math.random,
    tone: function (f, t0, len, peak, type, fEnd) {
      var c = audioCtx; if (!c) return;
      var o = c.createOscillator(); o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t0);
      if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t0 + len);
      o.connect(envGain(c, t0, len + 0.05, peak, 0.015, len * 0.6));
      o.start(t0); o.stop(t0 + len + 0.1);
    },
    noise: function (t0, dur, o) {
      var c = audioCtx; if (!c) return;
      o = o || {};
      var src = c.createBufferSource(); src.buffer = getNoise(c);
      var f = c.createBiquadFilter(); f.type = o.type || 'bandpass';
      f.frequency.setValueAtTime(o.f0 || 1000, t0);
      if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
      f.Q.value = o.q || 1;
      src.connect(f); f.connect(envGain(c, t0, dur, o.gain || 0.15, o.attack, o.release));
      src.start(t0, Math.random()); src.stop(t0 + dur + 0.05);
    },
    click: function (t0, vol) {
      SFX.noise(t0, 0.03, { type: 'highpass', f0: 2200, gain: 0.3 * (vol || 1), attack: 0.002, release: 0.02 });
      SFX.tone(2400, t0, 0.03, 0.05 * (vol || 1), 'square');
    },
    buzz: function (t0, dur) {
      var c = audioCtx; if (!c) return;
      var o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 185;
      var lfo = c.createOscillator(); lfo.frequency.value = 26;
      var depth = c.createGain(); depth.gain.value = 16;
      lfo.connect(depth); depth.connect(o.frequency);
      var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 950;
      o.connect(f); f.connect(envGain(c, t0, dur, 0.05, 0.2, 0.3));
      o.start(t0); lfo.start(t0); o.stop(t0 + dur + 0.1); lfo.stop(t0 + dur + 0.1);
    },
    engine: function (t0, dur) {
      var c = audioCtx; if (!c) return;
      var o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(60, t0);
      o.frequency.exponentialRampToValueAtTime(150, t0 + dur * 0.45);
      o.frequency.exponentialRampToValueAtTime(85, t0 + dur);
      var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
      o.connect(f); f.connect(envGain(c, t0, dur, 0.07, 0.12, 0.35));
      o.start(t0); o.stop(t0 + dur + 0.1);
    },
    sparkle: function (t0) {
      [1568, 2093, 2637].forEach(function (f, i) { SFX.tone(f, t0 + i * 0.08, 0.35, 0.035, 'triangle'); });
    }
  };
  function playSfx(p) {
    var c = ctx(); if (!c) return;
    try { var t0 = c.currentTime + 0.02; p.sfx(SFX, t0); SFX.sparkle(t0 + p.spark); } catch (e) {}
  }
  function softCue() { // wrong drop: one quiet, gently falling note. No buzzer.
    var c = ctx(); if (!c) return;
    try { SFX.tone(330, c.currentTime + 0.02, 0.32, 0.045, 'sine', 262); } catch (e) {}
  }
  function chime() {
    var c = ctx(); if (!c) return;
    try { [587.33, 783.99].forEach(function (f, i) { SFX.tone(f, c.currentTime + 0.1 + i * 0.18, 0.8, 0.05); }); } catch (e) {}
  }
  function bigChime() {
    var c = ctx(); if (!c) return;
    try { [523.25, 659.25, 783.99].forEach(function (f, i) { SFX.tone(f, c.currentTime + i * 0.18, 0.9, 0.06); }); } catch (e) {}
  }

  /* ---------- Randomness (same rules as the other games) ----------
     crypto random numbers; Fisher–Yates shuffle; weighted no-repeat picking; the right card's
     slot is random, never the same slot more than 2 rounds in a row, and balanced over time. */
  function rnd() { try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); } }
  function randInt(n) { return Math.floor(rnd() * n); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = randInt(i + 1); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function pickWeighted(items, weightOf) {
    var w = items.map(function (it) { return Math.max(0.0001, weightOf(it)); });
    var total = w.reduce(function (s, x) { return s + x; }, 0), r = rnd() * total;
    for (var i = 0; i < items.length; i++) { r -= w[i]; if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  SFX.rnd = rnd;
  var RAND_KEY = 'hfb-mi-rand';
  var randMem = (function () { try { return JSON.parse(localStorage.getItem(RAND_KEY)) || {}; } catch (e) { return {}; } })();
  if (!randMem.pos || typeof randMem.pos !== 'object') randMem.pos = {};
  function saveRandMem() { try { localStorage.setItem(RAND_KEY, JSON.stringify(randMem)); } catch (e) {} }
  function placeTarget(target, others) {
    var n = others.length + 1;
    var mem = randMem.pos[n] = randMem.pos[n] || { counts: [], recent: [] };
    var slots = [];
    for (var s = 0; s < n; s++) { slots.push(s); mem.counts[s] = mem.counts[s] || 0; }
    var r = mem.recent;
    if (r.length >= 2 && r[r.length - 1] === r[r.length - 2]) slots = slots.filter(function (x) { return x !== r[r.length - 1]; });
    var min = Math.min.apply(null, mem.counts.slice(0, n));
    var slot = pickWeighted(slots, function (x) { return 1 / (1 + 0.5 * (mem.counts[x] - min)); });
    mem.counts[slot]++;
    r.push(slot); if (r.length > 6) r.shift();
    saveRandMem();
    var cards = shuffle(others.slice());
    cards.splice(slot, 0, target);
    return cards;
  }

  /* ---------- Rounds ----------
     Random pair order (never the same twice in a row, favouring pairs not seen recently/often).
     A pair with a wrong drop comes back after a random 2–4 rounds ("Let's try again"); if it is
     then matched without a miss it comes back once more 4–6 rounds later. */
  var asked = { count: {}, last: {}, recent: randMem.last ? [randMem.last] : [] };
  var missed = {}; // pair id -> { due, step }
  function makeRound() {
    var prev = state.round, n0 = prev ? prev.n + 1 : 1;
    var ids = PAIRS.map(function (p) { return p.id; });
    var r = asked.recent, last = r[r.length - 1];
    var due = ids.filter(function (id) { return missed[id] && missed[id].due <= n0 && id !== last; })
      .sort(function (a, b) { return missed[a].due - missed[b].due; });
    var id, retry = false;
    if (due.length) {
      id = due[0]; retry = true;
      missed[id].due = n0 + 2 + randInt(3); // if this round is skipped (e.g. level change), it comes back later, not every round
    }
    else {
      var choices = ids.filter(function (x) { return x !== last && !missed[x]; });
      if (!choices.length) choices = ids.filter(function (x) { return x !== last; });
      var minC = Math.min.apply(null, choices.map(function (x) { return asked.count[x] || 0; }));
      id = pickWeighted(choices, function (x) {
        var since = asked.last[x] == null ? ids.length : n0 - asked.last[x];
        return Math.min(since, ids.length) / (1 + (asked.count[x] || 0) - minC);
      });
    }
    asked.count[id] = (asked.count[id] || 0) + 1;
    asked.last[id] = n0;
    r.push(id); if (r.length > 4) r.shift();
    randMem.last = id; saveRandMem();
    var p = PAIR[id], n = LEVELS[state.settings.level].n;
    var pool = ids.filter(function (x) { return x !== id && p.avoid.indexOf(x) < 0 && PAIR[x].avoid.indexOf(id) < 0; });
    return { n: n0, pair: id, retry: retry, options: placeTarget(id, shuffle(pool).slice(0, n - 1)) };
  }
  function noteResult(r, clean) {
    var m = missed[r.pair];
    if (!clean) missed[r.pair] = { due: r.n + 2 + randInt(3), step: 0 };
    else if (m && m.step === 0 && r.retry) missed[r.pair] = { due: r.n + 4 + randInt(3), step: 1 };
    else if (m && r.retry) delete missed[r.pair];
  }

  /* ---------- Shared session log + Live view (../shared/session.js) ---------- */
  var SESS = null;
  function cap(x) { x = String(x || '').replace(/^the /, ''); return x.charAt(0).toUpperCase() + x.slice(1); }
  function itemLab(id) { var q = PAIR[id]; return { id: id, en: cap(q.i.en), fa: q.i.fa }; }
  function sessRound() {
    var r = state.round; if (!SESS || !r) return;
    var p = PAIR[r.pair], n = LEVELS[state.settings.level].n;
    SESS.round({
      level: state.settings.level, levelName: { en: n + ' cards', fa: STR.fa.levelMode(n) },
      key: r.pair, answer: r.pair,
      target: { id: r.pair, en: cap(p.t.en) + ' + ' + p.i.en.replace(/^the /, ''), fa: p.t.fa + ' + ' + p.i.fa },
      stimulus: { en: 'Picture: ' + p.t.en.replace(/^the /, ''), fa: 'تصویر: ' + p.t.fa },
      choices: r.options.map(itemLab)
    });
  }

  /* ---------- Actions ---------- */
  var timer = null;
  function clearTimer() { clearTimeout(timer); timer = null; }
  function persistSettings() { save('hfb-mi-settings', state.settings); }
  function persistStars() { save('hfb-mi-stars', state.stars); }

  function sayRound(btn, withRetryCue) {
    var r = state.round; if (!r) return;
    var p = PAIR[r.pair], b = btn || $('speakPrompt');
    if (withRetryCue && r.retry) speak(t('tryAgain'), b, 'try_again', chain(t('ask')(p), b, 'ask_' + p.id));
    else speak(t('ask')(p), b, 'ask_' + p.id);
  }
  function newRound(opts) {
    clearTimer();
    state.round = makeRound();
    state.phase = 'ask'; state.misses = 0; state.hint = false; state.selected = null;
    render();
    sessRound();
    emit('round', state.round);
    if (opts && opts.say) sayRound(null, true);
  }
  function select(id) { // tap a card (fallback for dragging); says its name
    if (state.phase !== 'ask' || state.celebrating || !state.round) return;
    state.selected = state.selected === id ? null : id;
    render();
    emit('select', state.selected);
    if (state.selected) speak(itemName(id), null, 'item_' + id);
  }
  // The semantic action: the child put item `id` on the target. Returns true if it matched.
  function drop(id) {
    if (state.phase !== 'ask' || state.celebrating || !state.round) return false;
    var r = state.round, p = PAIR[r.pair];
    state.selected = null;
    if (SESS && PAIR[id]) SESS.log({ response: itemLab(id), correct: id === r.pair, prompted: state.hint, prompt: 'wiggle hint' });
    if (id === r.pair) {
      state.phase = 'anim';
      render();
      emit('drop', { id: id, correct: true });
      unlockAudio();
      stopSpeech();
      playSfx(p);
      clearTimer();
      timer = setTimeout(finish, state.settings.motion ? p.ms : 650);
      return true;
    }
    state.misses++;
    if (state.misses >= 2) state.hint = true;
    render();
    emit('drop', { id: id, correct: false, misses: state.misses });
    softCue();
    return false;
  }
  function finish() {
    if (state.phase !== 'anim') return;
    var r = state.round, p = PAIR[r.pair];
    noteResult(r, state.misses === 0);
    state.phase = 'done';
    state.stars = Math.min(GOAL, state.stars + 1);
    state.justFilled = state.stars - 1;
    persistStars();
    render();
    state.justFilled = -1;
    emit('matched', { pair: p.id, misses: state.misses });
    speak(t('yes')(p), $('speakFeedback'), 'yes_' + p.id);
    chime();
    clearTimer();
    if (state.stars >= GOAL) { eggPending = true; timer = setTimeout(celebrateWithEgg, 2800); }
    else timer = setTimeout(function () { newRound({ say: true }); }, 4200);
  }
  function next() {
    if (state.phase === 'anim') return;
    if (state.stars >= GOAL) { celebrateWithEgg(); return; }
    newRound({ say: true });
  }
  /* ---------- Surprise egg (shared: ../shared/egg.js) ----------
     After every 5 stars a big egg wobbles, cracks and reveals a random surprise; then the usual
     celebration. Turned on/off in the Adult panel (localStorage "hfb-egg", shared by all games). */
  var eggPending = false; // true from the 5th star until the egg has been shown
  function eggOn() { return !!(window.HFBEgg && window.HFBEgg.enabled()); }
  function celebrateWithEgg() {
    if (window.HFBEgg && window.HFBEgg.isOpen()) return;
    if (eggPending && eggOn()) {
      eggPending = false;
      clearTimer();
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
  var lastFocus = null;
  function showCelebration() {
    clearTimer();
    lastFocus = document.activeElement;
    state.celebrating = true;
    render();
    emit('celebrate', null);
    bigChime();
    setTimeout(function () { if (state.celebrating) celebrateSay($('speakCelebrate')); }, 400);
    (state.settings.level < MAX_LEVEL ? el.nextLevel : el.playAgain).focus({ preventScroll: true });
  }
  function celebrateSay(btn) {
    if (state.settings.level < MAX_LEVEL) speak(t('levelUpSay'), btn, 'level_up');
    else speak(t('celebrateSay'), btn, 'celebrate');
  }
  function nextLevel() {
    state.celebrating = false;
    state.stars = 0; persistStars();
    state.settings.level = Math.min(MAX_LEVEL, state.settings.level + 1);
    persistSettings();
    emit('level', state.settings.level);
    newRound({ say: true });
  }
  function closeCelebration() { // = repeat this level
    state.celebrating = false;
    state.stars = 0; persistStars();
    emit('playAgain', null);
    newRound({ say: true });
  }
  function resetStars() { state.stars = 0; persistStars(); render(); emit('resetStars', null); }
  function setSetting(key, value) {
    if (key === 'level' && Number(value) !== state.settings.level) { state.stars = 0; persistStars(); }
    state.settings[key] = value;
    state.settings = cleanSettings(state.settings);
    persistSettings();
    if (key === 'sound' && !value) stopSpeech();
    emit('setting', { key: key, value: value });
    if (key === 'level') newRound(); else render();
  }

  /* ---------- Dragging (pointer events: touch, pen and mouse) ---------- */
  var drag = null; // { id, card, pid, x0, y0, moved }
  function overTarget(x, y, card) {
    var tr = el.target.getBoundingClientRect(), m = 18;
    if (x >= tr.left - m && x <= tr.right + m && y >= tr.top - m && y <= tr.bottom + m) return true;
    var cr = card.getBoundingClientRect(), cx = (cr.left + cr.right) / 2, cy = (cr.top + cr.bottom) / 2;
    return cx >= tr.left && cx <= tr.right && cy >= tr.top && cy <= tr.bottom;
  }
  function slideBack(card) {
    card.classList.remove('dragging');
    card.classList.add('returning');
    card.style.transform = '';
    setTimeout(function () { card.classList.remove('returning'); }, 450);
  }
  function flyIn(card) { // the matched card shrinks into the target, then the animation plays
    var tr = el.target.getBoundingClientRect(), cr = card.getBoundingClientRect();
    var cur = (card.style.transform.match(/translate\(([-\d.]+)px, ?([-\d.]+)px\)/) || [0, 0, 0]);
    var dx = (tr.left + tr.width / 2) - (cr.left + cr.width / 2) + Number(cur[1]);
    var dy = (tr.top + tr.height / 2) - (cr.top + cr.height / 2) + Number(cur[2]);
    card.classList.remove('dragging');
    card.classList.add('flying');
    card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.3)';
  }
  el.cards.addEventListener('pointerdown', function (e) {
    var card = e.target.closest('.card');
    if (!card || drag || state.phase !== 'ask' || state.celebrating) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try { card.setPointerCapture(e.pointerId); } catch (err) {}
    drag = { id: card.dataset.id, card: card, pid: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
  });
  el.cards.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
    if (!drag.moved) { drag.moved = true; drag.card.classList.add('dragging'); emit('dragStart', drag.id); }
    e.preventDefault();
    drag.card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.06)';
    el.target.classList.toggle('over', overTarget(e.clientX, e.clientY, drag.card));
  });
  function endDrag(e, cancelled) {
    if (!drag || e.pointerId !== drag.pid) return;
    var d = drag; drag = null;
    el.target.classList.remove('over');
    try { d.card.releasePointerCapture(e.pointerId); } catch (err) {}
    if (!d.moved) { if (!cancelled) { d.card.dataset.tapped = '1'; select(d.id); } return; }
    if (!cancelled && overTarget(e.clientX, e.clientY, d.card)) {
      if (drop(d.id)) { flyIn(d.card); return; }
    }
    slideBack(d.card);
  }
  el.cards.addEventListener('pointerup', function (e) { endDrag(e, false); });
  el.cards.addEventListener('pointercancel', function (e) { endDrag(e, true); });
  el.cards.addEventListener('click', function (e) { // keyboard (Enter/Space) select; taps are handled on pointerup
    var card = e.target.closest('.card'); if (!card) return;
    if (card.dataset.tapped) { delete card.dataset.tapped; return; }
    if (e.detail === 0) select(card.dataset.id);
  });
  el.cards.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  el.target.addEventListener('click', function () {
    if (state.phase !== 'ask') return;
    if (state.selected) {
      var id = state.selected, card = el.cards.querySelector('.card[data-id="' + id + '"]');
      if (drop(id)) { if (card) flyIn(card); }
      else if (card) { card.classList.add('nudge'); setTimeout(function () { card.classList.remove('nudge'); }, 500); }
      return;
    }
    sayRound(el.target, false);
  });
  document.addEventListener('pointerup', unlockAudio, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') unlockAudio(); }, true);

  /* ---------- Render: everything from `state` ---------- */
  var drawn = { sceneKey: '', cardsKey: '' };
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
    el.levelMode.textContent = t('levelMode')(LEVELS[s.level].n);

    if (r) {
      var p = PAIR[r.pair], playing = state.phase !== 'ask';
      el.promptText.textContent = t('ask')(p);
      if (drawn.sceneKey !== String(r.n)) {
        el.scene.innerHTML = ART.sceneSVG(p);
        el.target.style.setProperty('--spark', p.spark + 's');
        drawn.sceneKey = String(r.n);
      }
      el.target.classList.toggle('play', playing);
      el.target.classList.toggle('done', playing);
      el.target.classList.toggle('glow', state.phase === 'done');
      el.target.classList.toggle('ready', !!state.selected);
      el.target.dataset.pair = p.id;
      el.target.setAttribute('aria-label', t('targetBtn')(p));
      el.dropHint.textContent = playing ? '' : (state.selected ? t('selHint') : t('dragHint'));

      var ck = r.n + ':' + L;
      if (drawn.cardsKey !== ck) {
        el.cards.innerHTML = '';
        el.cards.dataset.count = String(r.options.length);
        r.options.forEach(function (id, idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'card';
          b.dataset.id = id;
          b.setAttribute('aria-keyshortcuts', String(idx + 1));
          b.setAttribute('aria-label', t('cardBtn')(PAIR[id]));
          b.innerHTML = '<span class="card-num" aria-hidden="true"></span><span class="card-art" aria-hidden="true"></span><span class="card-label" aria-hidden="true"></span>';
          b.children[0].textContent = L === 'fa' ? toFaDigits(idx + 1) : String(idx + 1);
          b.children[1].innerHTML = ART.itemSVG(PAIR[id]);
          b.children[2].textContent = itemName(id);
          el.cards.appendChild(b);
        });
        drawn.cardsKey = ck;
      }
      Array.prototype.forEach.call(el.cards.children, function (b) {
        var id = b.dataset.id, right = id === r.pair;
        b.classList.toggle('used', playing && right);
        b.classList.toggle('dim', playing && !right);
        b.classList.toggle('hint', !playing && state.hint && right);
        b.classList.toggle('selected', !playing && state.selected === id);
        b.setAttribute('aria-pressed', state.selected === id ? 'true' : 'false');
        b.setAttribute('aria-disabled', playing ? 'true' : 'false');
        if (playing && !right) b.style.transform = '';
      });

      if (state.phase === 'done') {
        el.feedback.hidden = false;
        el.feedbackText.textContent = t('yes')(p);
      } else el.feedback.hidden = true;
    }

    el.stars.innerHTML = '';
    for (var i = 0; i < GOAL; i++) {
      var li = document.createElement('li');
      var filled = i < state.stars;
      li.className = 'star' + (filled ? ' filled' : '') + (i === state.justFilled ? ' just-filled' : '');
      li.setAttribute('aria-label', t('starAria')(i + 1, filled));
      li.innerHTML = '<span class="star-glyph" aria-hidden="true">⭐</span>';
      el.stars.appendChild(li);
    }
    el.starCount.textContent = t('starCount')(state.stars);

    el.celebrate.hidden = !state.celebrating;
    if (state.celebrating) el.main.setAttribute('aria-hidden', 'true'); else el.main.removeAttribute('aria-hidden');
    var more = s.level < MAX_LEVEL;
    el.levelUpText.textContent = more ? t('levelUp') + ' ' + t('levelLabel')(s.level + 1) + ' · ' + t('levelMode')(LEVELS[s.level + 1].n) : t('allDone');
    el.nextLevel.hidden = !more;
    el.nextLevelText.textContent = t('nextLevel');
    el.playAgainText.textContent = more ? t('repeatLevel') : t('playAgain');
    el.playAgain.classList.toggle('primary', !more);

    renderSettings();
    updateVoiceStatus();
  }
  function renderSettings() {
    var s = state.settings;
    el.sound.checked = !!s.sound;
    el.motion.checked = !!s.motion;
    if (el.egg) el.egg.checked = eggOn();
    el.form.querySelectorAll('input[name="level"]').forEach(function (x) { x.checked = Number(x.value) === s.level; });
  }

  /* ---------- Theme ---------- */
  var THEMES = ['dark', 'dim', 'light'];
  var THEME_ICON = { dark: '🌙', dim: '🌗', light: '☀️' };

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
  $('speakPrompt').addEventListener('click', function () { sayRound(this, false); });
  $('speakFeedback').addEventListener('click', function () {
    if (state.phase === 'done') speak(t('yes')(PAIR[state.round.pair]), this, 'yes_' + state.round.pair);
  });
  $('speakCelebrate').addEventListener('click', function () { celebrateSay(this); });
  el.nextBtn.addEventListener('click', next);
  el.nextLevel.addEventListener('click', nextLevel);
  el.playAgain.addEventListener('click', closeCelebration);
  el.adultBtn.addEventListener('click', function () {
    renderSettings(); updateVoiceStatus();
    el.resetStatus.textContent = '';
    if (typeof el.panel.showModal === 'function') el.panel.showModal(); else el.panel.setAttribute('open', '');
  });
  el.panel.addEventListener('close', function () { el.adultBtn.focus({ preventScroll: true }); });
  el.panel.addEventListener('click', function (e) { if (e.target === el.panel) el.panel.close(); });
  el.form.addEventListener('change', function (e) {
    var tg = e.target;
    if (tg.name === 'level') setSetting('level', Number(tg.value));
    else if (tg === el.sound) setSetting('sound', tg.checked);
    else if (tg === el.motion) setSetting('motion', tg.checked);
    else if (tg === el.egg) { if (window.HFBEgg) window.HFBEgg.setEnabled(tg.checked); emit('setting', { key: 'egg', value: tg.checked }); }
  });
  el.reset.addEventListener('click', function () { resetStars(); el.resetStatus.textContent = t('resetDone'); });
  document.addEventListener('keydown', function (e) {
    if (el.panel.open || e.altKey || e.ctrlKey || e.metaKey) return;
    if (state.celebrating) { if (e.key === 'Escape') closeCelebration(); return; }
    var k = e.key.replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); });
    var n = parseInt(k, 10);
    if (state.round && state.phase === 'ask' && n >= 1 && n <= state.round.options.length) {
      e.preventDefault();
      var id = state.round.options[n - 1];
      if (state.selected !== id) select(id);
      el.target.focus({ preventScroll: true });
    }
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
  window.HFBMatch = {
    getState: function () { return JSON.parse(JSON.stringify(state)); },
    on: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    render: render,
    actions: { newRound: newRound, select: select, drop: drop, finish: finish, next: next, showCelebration: showCelebration, celebrateWithEgg: celebrateWithEgg,
               nextLevel: nextLevel, closeCelebration: closeCelebration, resetStars: resetStars, setSetting: setSetting },
    PAIRS: PAIRS.map(function (p) { return { id: p.id, avoid: p.avoid.slice(), target: p.t, item: p.i, yes: p.yes, ms: p.ms }; }),
    getMissed: function () { return JSON.parse(JSON.stringify(missed)); }
  };

  /* ---------- Init ---------- */
  if (synth) {
    refreshVoices();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
    else synth.onvoiceschanged = refreshVoices;
  }
  if (window.HFBSession) SESS = window.HFBSession.init({ game: 'match-it', name: { en: 'Match It', fa: 'چی به چی می‌خوره؟' } });
  newRound();
  if (state.stars >= GOAL) showCelebration();
})();
