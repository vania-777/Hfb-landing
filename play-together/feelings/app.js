/* Feelings («احساس‌ها چیه؟») — HFB Play Together prototype.
   Emotion recognition: one cartoon face, 2–4 feeling words. Plain JS, no dependencies,
   works offline. Prototype — not a clinical tool.

   Architecture (so a two-player live mode can be added later):
   - ALL game state lives in one plain, serializable object: `state`.
   - Actions (newRound / answer / next / closeCelebration / resetStars / setSetting) change
     `state`, then call render(). render() draws the whole screen from `state` only.
   - Side effects that must run inside a tap (audio) happen in the action, never in render().
   - Every action is reported through emit(type, payload); a future live mode can listen via
     window.HFBFeelings.on(fn) and replay remote actions with HFBFeelings.actions.*.
     Nothing is sent over the network today. */
(function () {
  'use strict';

  var GOAL = 5; // stars needed for the celebration screen
  var root = document.documentElement;

  /* ---------- Content ---------- */
  // fa = button label (written form); faS = spoken sentence "this is X" (colloquial).
  var EMOTIONS = [
    { id: 'happy',     e: '😊', fa: 'خوشحال', faS: 'این خوشحاله.',   en: 'Happy',     enS: 'happy',     on: true },
    { id: 'sad',       e: '😢', fa: 'غمگین',  faS: 'این غمگینه.',    en: 'Sad',       enS: 'sad',       on: true },
    { id: 'angry',     e: '😠', fa: 'عصبانی', faS: 'این عصبانیه.',   en: 'Angry',     enS: 'angry',     on: true },
    { id: 'scared',    e: '😨', fa: 'ترسیده', faS: 'این ترسیده.',    en: 'Scared',    enS: 'scared',    on: true },
    { id: 'surprised', e: '😮', fa: 'متعجب',  faS: 'این متعجبه.',    en: 'Surprised', enS: 'surprised', on: true },
    { id: 'calm',      e: '😌', fa: 'آرام',   faS: 'این آرومه.',     en: 'Calm',      enS: 'calm',      on: true },
    { id: 'tired',     e: '😴', fa: 'خسته',   faS: 'این خسته‌ست.',   en: 'Tired',     enS: 'tired',     on: false },
    { id: 'disgusted', e: '🤢', fa: 'چندش',   faS: 'این چندشش شده.', en: 'Disgusted', enS: 'disgusted', on: false }
  ];
  var EMO = {};
  EMOTIONS.forEach(function (x) { EMO[x.id] = x; });

  var STR = {
    fa: {
      skip: 'پرش به بازی',
      homeLink: 'صفحهٔ اصلی HFB',
      title: 'احساس‌ها چیه؟',
      question: 'این چه حسیه؟',
      faceHint: 'روی چهره بزن تا اسم حس رو بشنوی.',
      faceBtn: 'چهره. برای شنیدن اسم حس بزنید.',
      yes: function (m) { return 'آفرین! ' + m.faS; },
      is: function (m) { return m.faS; },
      readAloud: 'بلند خواندن',
      next: 'بعدی',
      stars: 'ستاره‌های من',
      starCount: function (n) { return toFaDigits(n) + ' از ' + toFaDigits(GOAL); },
      starAria: function (i, filled) { return 'ستارهٔ ' + toFaDigits(i) + (filled ? '، گرفته شد' : '، خالی'); },
      celebrateTitle: 'آفرین! ۵ ستاره!',
      celebrateSub: 'حس‌ها رو خیلی خوب شناختی.',
      celebrateSay: 'آفرین! پنج ستاره گرفتی!',
      playAgain: 'دوباره بازی کنیم',
      adultTitle: 'پنل بزرگسال',
      adultBtn: 'پنل بزرگسال (تنظیمات)',
      close: 'بستن',
      optCount: 'تعداد گزینه‌ها',
      emotionsLegend: 'حس‌ها',
      emoHint: 'حداقل دو حس باید روشن بماند.',
      promptLegend: 'کمک (پرامپت)',
      errorless: 'یادگیری بدون خطا: جواب درست آرام می‌تپد',
      errorlessHint: 'برای شروع یک حس تازه مفید است. وقتی کودک آماده شد، خاموشش کنید.',
      comfort: 'صدا و حرکت',
      sound: 'صدا و بلندخوانی',
      motion: 'انیمیشن ملایم',
      starsLegend: 'ستاره‌ها',
      resetStars: 'صفر کردن ستاره‌ها',
      resetDone: 'ستاره‌ها صفر شد.',
      togetherTitle: 'حالت با هم',
      togetherText: 'برای بازی از راه دور، در تماس تصویری صفحه را به اشتراک بگذارید (همراه با صدای رایانه). کودک حس را نشان می‌دهد یا می‌گوید و شما برایش لمس می‌کنید؛ یا اگر ابزار تماس اجازه می‌دهد، کنترل را به او بدهید.',
      noSpeech: 'این مرورگر بلندخوانی ندارد؛ متن روی صفحه نمایش داده می‌شود.',
      noVoice: 'صدای فارسی روی این دستگاه پیدا نشد؛ مرورگر ممکن است با صدای پیش‌فرض بخواند یا ساکت بماند.',
      voiceOk: function (n) { return 'صدای بلندخوانی: ' + n; },
      voiceClips: 'صدای بلندخوانی: فایل‌های صوتی ضبط‌شده (روی همهٔ دستگاه‌ها، از جمله آیفون).',
      audioErr: 'خطای پخش صدا: ',
      langBtn: 'Switch to English',
      langBtnText: 'EN',
      theme: { dark: 'پوسته: تیره (برای تغییر بزنید)', dim: 'پوسته: نیمه‌روشن (برای تغییر بزنید)', light: 'پوسته: روشن (برای تغییر بزنید)' },
      docTitle: 'احساس‌ها چیه؟ · HFB Play Together'
    },
    en: {
      skip: 'Skip to game',
      homeLink: 'HFB home page',
      title: 'Feelings',
      question: 'How does this face feel?',
      faceHint: 'Tap the face to hear the feeling.',
      faceBtn: 'Face. Tap to hear the feeling.',
      yes: function (m) { return 'Yes! This face is ' + m.enS + '.'; },
      is: function (m) { return 'This face is ' + m.enS + '.'; },
      readAloud: 'Read aloud',
      next: 'Next',
      stars: 'My stars',
      starCount: function (n) { return n + ' of ' + GOAL; },
      starAria: function (i, filled) { return 'Star ' + i + (filled ? ', earned' : ', empty'); },
      celebrateTitle: 'Well done! 5 stars!',
      celebrateSub: 'You know your feelings so well.',
      celebrateSay: 'Well done! You got five stars!',
      playAgain: 'Play again',
      adultTitle: 'Adult panel',
      adultBtn: 'Adult panel (settings)',
      close: 'Close',
      optCount: 'Number of choices',
      emotionsLegend: 'Feelings',
      emoHint: 'At least two feelings must stay on.',
      promptLegend: 'Prompting',
      errorless: 'Errorless learning: the right answer gently pulses',
      errorlessHint: 'Helpful when teaching a new feeling. Turn it off when the child is ready.',
      comfort: 'Sound & motion',
      sound: 'Sound & read-aloud',
      motion: 'Gentle animation',
      starsLegend: 'Stars',
      resetStars: 'Reset stars',
      resetDone: 'Stars reset.',
      togetherTitle: 'Together mode',
      togetherText: 'To play remotely, share this screen on a video call (include computer audio). The child points to or says the feeling and you tap it, or hand over control if your call app allows it.',
      noSpeech: 'Read-aloud is not available in this browser; text stays on screen.',
      noVoice: 'No English voice found on this device; the browser may use a default voice or stay silent.',
      voiceOk: function (n) { return 'Read-aloud voice: ' + n; },
      voiceClips: 'Read-aloud voice: recorded audio clips (works on all devices, including iPhone).',
      audioErr: 'Audio playback error: ',
      langBtn: 'تغییر به فارسی',
      langBtnText: 'فا',
      theme: { dark: 'Theme: dark (tap to change)', dim: 'Theme: dim (tap to change)', light: 'Theme: light (tap to change)' },
      docTitle: 'Feelings · HFB Play Together'
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
  var DEFAULTS = {
    count: 2,
    emotions: EMOTIONS.filter(function (x) { return x.on; }).map(function (x) { return x.id; }),
    errorless: false,
    sound: true,
    motion: !(reduceMQ && reduceMQ.matches)
  };
  function cleanSettings(s) {
    s = Object.assign({}, DEFAULTS, s || {});
    if ([2, 3, 4].indexOf(s.count) < 0) s.count = 2;
    s.emotions = (s.emotions || []).filter(function (id) { return EMO[id]; });
    if (s.emotions.length < 2) s.emotions = DEFAULTS.emotions.slice();
    s.errorless = !!s.errorless; s.sound = !!s.sound; s.motion = !!s.motion;
    return s;
  }

  /* ---------- THE state (one serializable object) ---------- */
  var state = {
    lang: loadRaw('hfb-lang') === 'en' ? 'en' : 'fa',
    theme: (function () { var t = loadRaw('hfb-theme'); return (t === 'dark' || t === 'dim' || t === 'light') ? t : 'dark'; })(),
    settings: cleanSettings(load('hfb-fe-settings', {})),
    stars: Math.max(0, Math.min(GOAL, parseInt(load('hfb-fe-stars', 0), 10) || 0)),
    round: null,        // { n, emotion, skin, hair, style, options: [ids] }
    answer: null,       // null | { pick: id, correct: bool }
    celebrating: false,
    justFilled: -1      // index of the star that was just earned (for a gentle pop)
  };

  /* ---------- Tiny event hook for a future live mode ---------- */
  var listeners = [];
  function emit(type, payload) {
    listeners.forEach(function (fn) { try { fn(type, payload, state); } catch (e) {} });
  }

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    face: $('face'), faceBtn: $('faceBtn'), faceWrap: document.querySelector('.face-wrap'),
    answers: $('answers'), feedback: $('feedback'), feedbackText: $('feedbackText'), feedbackEmoji: $('feedbackEmoji'),
    nextBtn: $('nextBtn'), stars: $('stars'), starCount: $('starCount'),
    celebrate: $('celebrate'), playAgain: $('playAgainBtn'), main: $('main'),
    langBtn: $('langBtn'), langBtnText: $('langBtnText'), themeBtn: $('themeBtn'), themeIcon: $('themeIcon'),
    adultBtn: $('adultBtn'), panel: $('adultPanel'), form: $('adultForm'), emoChecks: $('emoChecks'), emoHint: $('emoHint'),
    sound: $('soundToggle'), motion: $('motionToggle'), errorless: $('errorlessToggle'),
    reset: $('resetStars'), resetStatus: $('resetStatus'), voiceStatus: $('voiceStatus')
  };
  function t(key) { return STR[state.lang][key]; }
  function emoName(id) { return EMO[id][state.lang === 'fa' ? 'fa' : 'en']; }

  /* ---------- Speech fallback (Web Speech API) ---------- */
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
     audio/<lang>/<key>.mp3 with keys: question, celebrate, name_<id>, yes_<id>, is_<id>.
     Same path as Choice & Reward: one shared <audio> element, src + play() run
     synchronously inside the tap handler (iOS rule). speechSynthesis is only a fallback. */
  var ASSET_VER = '20261004-2'; // bump when clips change (cache-busting)
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
  function stopSpeech() {
    playToken++;
    if (player) { try { player.pause(); } catch (e) {} }
    if (synth && (synth.speaking || synth.pending)) { try { synth.cancel(); } catch (e) {} }
    if (speakingBtn) { speakingBtn.classList.remove('speaking'); speakingBtn = null; }
  }
  function audioFailed(msg) {
    lastAudioErr = msg;
    updateVoiceStatus();
    try { console.warn('[feelings] audio: ' + msg); } catch (e) {}
  }
  function playClip(key, text, btn) {
    var my = ++playToken;
    var url = clipUrl(key);
    setSpeaking(btn);
    var fallback = function (why) {
      if (my !== playToken) return; // a newer clip took over
      playToken++;
      audioFailed(why + ' (' + url + ')');
      speakSynth(text, btn);
    };
    player.onended = function () { if (my === playToken && btn) btn.classList.remove('speaking'); };
    player.onerror = function () { fallback('load error ' + ((player.error && player.error.code) || '')); };
    player.src = url;
    var p;
    try { p = player.play(); } catch (e) { fallback(e && e.name || 'play() threw'); return; }
    if (p && p.then) p.then(function () { if (lastAudioErr) { lastAudioErr = ''; updateVoiceStatus(); } }, function (e) {
      if (my !== playToken) return; // superseded: expected
      var n = (e && e.name) || 'play() rejected';
      if (n === 'NotAllowedError') { audioFailed(n); if (btn) btn.classList.remove('speaking'); return; } // tap 🔊 to hear it
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
      u.rate = 0.9; u.pitch = 1; u.volume = 1;
      setSpeaking(btn);
      var done = function () { if (btn) btn.classList.remove('speaking'); };
      u.onend = done; u.onerror = done;
      synth.speak(u);
    } catch (e) { /* text is always on screen */ }
  }
  // Call directly from a tap/click handler (no await / setTimeout before it).
  function speak(text, btn, key) {
    if (!state.settings.sound || !text) return;
    stopSpeech();
    if (player && key) { playClip(key, text, btn); return; }
    speakSynth(text, btn);
  }

  /* Generated tones (Web Audio, no files). The context is created/resumed inside the tap,
     and notes are scheduled ahead, so they also play on iOS. */
  var audioCtx = null;
  function ctx() {
    if (!state.settings.sound) return null;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch (e) { return null; }
  }
  function tone(c, f, start, len, peak, type) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, start + len);
    o.connect(g); g.connect(c.destination);
    o.start(start); o.stop(start + len + 0.05);
  }
  // Gentle rising chime for a correct answer (or a slightly fuller one for the celebration).
  function chime(big, delay) {
    var c = ctx(); if (!c) return;
    try {
      var notes = big ? [523.25, 659.25, 783.99] : [587.33, 783.99];
      var t0 = c.currentTime + (delay || 0);
      notes.forEach(function (f, i) { tone(c, f, t0 + i * 0.18, 0.9, 0.06); });
    } catch (e) {}
  }
  // Soft, neutral "let's look together" cue for a wrong answer: one quiet low note. No buzzer.
  function softCue() {
    var c = ctx(); if (!c) return;
    try { tone(c, 392, c.currentTime + 0.02, 0.45, 0.035); } catch (e) {}
  }

  /* ---------- Faces: friendly cartoon SVG, drawn in code ---------- */
  var SKINS = ['#fde3cf', '#f5c9a3', '#e3a77b', '#c98b5f', '#a86b45', '#7d4e31'];
  var HAIRS = ['#2a1b14', '#5b3a24', '#9a5130', '#d9aa55', '#151515', '#6d4c3d'];
  var STYLES = ['short', 'curly', 'long', 'bun'];
  var INK = '#24172a', MOUTH = '#7a2636', TONGUE = '#ef7b8b', TEAR = '#7cc4ff', OUTLINE = 'rgba(40,24,20,.55)';

  function sw(d, w, extra) { return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (w || 5) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>'; }
  // Eyebrows get a soft skin-colored halo so they stay clear even over dark hair.
  var curSkin = '#f5c9a3';
  function bw(d, w) {
    w = w || 5;
    return '<path d="' + d + '" fill="none" stroke="' + curSkin + '" stroke-width="' + (w + 5) + '" stroke-linecap="round"/>' + sw(d, w);
  }
  function dotEyes(r) {
    r = r || 7;
    return '<circle cx="74" cy="110" r="' + r + '" fill="' + INK + '"/><circle cx="126" cy="110" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="76.5" cy="107" r="2.4" fill="#fff"/><circle cx="128.5" cy="107" r="2.4" fill="#fff"/>';
  }
  function wideEyes(pupil) {
    var s = '';
    [74, 126].forEach(function (x) {
      s += '<circle cx="' + x + '" cy="108" r="15" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
           '<circle cx="' + x + '" cy="109" r="' + pupil + '" fill="' + INK + '"/>' +
           '<circle cx="' + (x + 2) + '" cy="106" r="2" fill="#fff"/>';
    });
    return s;
  }
  function blush(op) {
    return '<ellipse cx="54" cy="134" rx="12" ry="7" fill="#ff7d7d" opacity="' + op + '"/>' +
           '<ellipse cx="146" cy="134" rx="12" ry="7" fill="#ff7d7d" opacity="' + op + '"/>';
  }
  var NOSE = sw('M95,128 Q100,134 105,128', 4, ' opacity=".55"');

  var FEATURES = {
    happy: function () {
      return bw('M60,84 Q74,75 88,83') + bw('M112,83 Q126,75 140,84') +
        sw('M61,113 Q74,97 87,113', 6) + sw('M113,113 Q126,97 139,113', 6) + blush(.45) + NOSE +
        '<path d="M64,138 Q100,142 136,138 Q132,180 100,180 Q68,180 64,138Z" fill="' + MOUTH + '" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M70,141 Q100,144 130,141 L128,151 Q100,154 72,151Z" fill="#fff"/>' +
        '<ellipse cx="100" cy="169" rx="17" ry="7" fill="' + TONGUE + '"/>';
    },
    sad: function () {
      return bw('M58,94 L88,81', 6) + bw('M112,81 L142,94', 6) + dotEyes(7) + NOSE +
        '<path d="M127,120 C123,129 119,133 119,138 A8,8 0 0 0 135,138 C135,133 131,129 127,120Z" fill="' + TEAR + '" stroke="#3b7bbf" stroke-width="1.5"/>' +
        sw('M74,164 Q100,140 126,164', 6);
    },
    angry: function () {
      return bw('M56,82 L90,96', 8) + bw('M110,96 L144,82', 8) + dotEyes(7) + NOSE +
        '<rect x="72" y="146" width="56" height="20" rx="9" fill="#fff" stroke="' + INK + '" stroke-width="4"/>' +
        '<path d="M72,156 L128,156 M86,147 L86,165 M100,147 L100,165 M114,147 L114,165" stroke="' + INK + '" stroke-width="2.5"/>';
    },
    scared: function () {
      return bw('M58,84 Q72,76 88,70', 5) + bw('M112,70 Q128,76 142,84', 5) + wideEyes(4.5) + NOSE +
        sw('M72,160 q7,-9 14,0 t14,0 t14,0 t14,0', 5) +
        '<path d="M156,64 C152,73 148,77 148,82 A8,8 0 0 0 164,82 C164,77 160,73 156,64Z" fill="' + TEAR + '" stroke="#3b7bbf" stroke-width="1.5"/>';
    },
    surprised: function () {
      return bw('M57,82 Q73,64 90,78', 5) + bw('M110,78 Q127,64 143,82', 5) + wideEyes(7.5) + NOSE +
        '<ellipse cx="100" cy="158" rx="14" ry="18" fill="' + MOUTH + '" stroke="' + INK + '" stroke-width="3.5"/>';
    },
    calm: function () {
      return bw('M62,89 Q74,85 86,89', 4.5) + bw('M114,89 Q126,85 138,89', 4.5) +
        sw('M61,108 Q74,119 87,108', 5) + sw('M113,108 Q126,119 139,108', 5) + blush(.28) + NOSE +
        sw('M83,150 Q100,162 117,150', 5);
    },
    tired: function () {
      var lid = function (x) {
        return '<path d="M' + (x - 13) + ',109 A13,13 0 0 0 ' + (x + 13) + ',109Z" fill="' + INK + '"/>' +
               sw('M' + (x - 15) + ',109 L' + (x + 15) + ',109', 5) +
               sw('M' + (x - 10) + ',128 Q' + x + ',133 ' + (x + 10) + ',128', 3, ' opacity=".35"');
      };
      return bw('M61,93 L87,95', 5) + bw('M113,95 L139,93', 5) + lid(74) + lid(126) + NOSE +
        '<ellipse cx="100" cy="159" rx="10" ry="12" fill="' + MOUTH + '" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<text x="146" y="62" font-family="Arial, sans-serif" font-weight="800" font-size="26" fill="#7fa8ff">Z</text>' +
        '<text x="166" y="42" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#7fa8ff">z</text>';
    },
    disgusted: function () {
      return bw('M58,84 L89,94', 6) + bw('M112,84 Q127,76 142,80', 6) +
        sw('M61,111 Q74,104 87,111', 5) + sw('M113,110 Q126,103 139,110', 5) +
        sw('M90,122 L97,127 M110,122 L103,127', 3.5) + NOSE +
        '<path d="M96,152 Q95,172 106,172 Q117,172 114,154Z" fill="' + TONGUE + '" stroke="' + INK + '" stroke-width="3"/>' +
        sw('M72,152 Q86,142 100,152 Q114,162 128,150', 5);
    }
  };

  // Soft whole-face tint for two feelings (warm red for angry, pale green for disgusted).
  var TINT = { angry: ['#ff3d3d', .14], disgusted: ['#5fcf6a', .2] };
  function hairBack(style, c) {
    if (style !== 'long') return '';
    return '<path d="M32,112 C22,40 178,40 168,112 L174,178 C156,190 136,184 132,170 L68,170 C64,184 44,190 26,178Z" fill="' + c + '"/>';
  }
  function hairFront(style, c) {
    if (style === 'short') {
      return '<path d="M33,108 C26,52 64,32 100,32 C138,32 174,52 167,108 C162,80 148,62 126,52 C106,60 64,56 33,104Z" fill="' + c + '"/>';
    }
    if (style === 'curly') {
      var s = '';
      for (var i = 0; i <= 8; i++) {
        var a = Math.PI * (1.08 + i * 0.105);
        s += '<circle cx="' + (100 + 64 * Math.cos(a)).toFixed(1) + '" cy="' + (108 + 64 * Math.sin(a)).toFixed(1) + '" r="17" fill="' + c + '"/>';
      }
      return s + '<path d="M40,98 C36,50 70,38 100,38 C130,38 164,50 160,98 C146,70 54,70 40,98Z" fill="' + c + '"/>';
    }
    if (style === 'long') {
      return '<path d="M34,104 C34,50 68,36 100,36 C132,36 166,50 166,104 C154,76 130,62 100,64 C70,62 46,76 34,104Z" fill="' + c + '"/>';
    }
    // bun
    return '<circle cx="100" cy="34" r="20" fill="' + c + '"/>' +
      '<path d="M34,104 C32,56 66,40 100,40 C134,40 168,56 166,104 C152,74 126,60 100,60 C74,60 48,74 34,104Z" fill="' + c + '"/>';
  }
  function faceSVG(r) {
    var skin = SKINS[r.skin], hair = HAIRS[r.hair];
    curSkin = skin;
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
      hairBack(r.style, hair) +
      '<circle cx="33" cy="116" r="13" fill="' + skin + '" stroke="' + OUTLINE + '" stroke-width="3"/>' +
      '<circle cx="167" cy="116" r="13" fill="' + skin + '" stroke="' + OUTLINE + '" stroke-width="3"/>' +
      '<circle cx="100" cy="112" r="68" fill="' + skin + '" stroke="' + OUTLINE + '" stroke-width="3"/>' +
      (TINT[r.emotion] ? '<circle cx="100" cy="112" r="66" fill="' + TINT[r.emotion][0] + '" opacity="' + TINT[r.emotion][1] + '"/>' : '') +
      hairFront(r.style, hair) +
      FEATURES[r.emotion]() +
      '</svg>';
  }

  /* ---------- Helpers ---------- */
  /* ---------- Randomness (unpredictable order; no fixed sequences) ----------
     - crypto-seeded random numbers when available
     - Fisher–Yates shuffle
     - pickWeighted: random pick that favours items not seen recently/often (balanced, never a cycle)
     - placeTarget: random slot for the right answer, never the same slot more than 2 rounds in a
       row, and slots balanced over time; the other cards are shuffled into the remaining slots */
  function rnd() {
    try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); }
  }
  function randInt(n) { return Math.floor(rnd() * n); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = randInt(i + 1); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function pickWeighted(items, weightOf) {
    var w = items.map(function (it) { return Math.max(0.0001, weightOf(it)); });
    var total = w.reduce(function (s, x) { return s + x; }, 0), r = rnd() * total;
    for (var i = 0; i < items.length; i++) { r -= w[i]; if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  var RAND_KEY = 'hfb-fe-rand'; // { last: target id, pos: { n: { counts: [], recent: [] } } }
  var randMem = (function () { try { return JSON.parse(localStorage.getItem(RAND_KEY)) || {}; } catch (e) { return {}; } })();
  if (!randMem.pos || typeof randMem.pos !== 'object') randMem.pos = {};
  function saveRandMem() { try { localStorage.setItem(RAND_KEY, JSON.stringify(randMem)); } catch (e) {} }
  function placeTarget(target, others) {
    var n = others.length + 1;
    var mem = randMem.pos[n] = randMem.pos[n] || { counts: [], recent: [] };
    var slots = [];
    for (var s = 0; s < n; s++) { slots.push(s); mem.counts[s] = mem.counts[s] || 0; }
    var r = mem.recent;
    if (r.length >= 2 && r[r.length - 1] === r[r.length - 2]) {
      slots = slots.filter(function (x) { return x !== r[r.length - 1]; }); // no 3rd time in a row
    }
    var min = Math.min.apply(null, mem.counts.slice(0, n));
    var slot = pickWeighted(slots, function (x) { return 1 / (1 + 0.5 * (mem.counts[x] - min)); }); // gently balanced over time
    mem.counts[slot]++;
    r.push(slot); if (r.length > 6) r.shift();
    saveRandMem();
    var cards = shuffle(others.slice());
    cards.splice(slot, 0, target);
    return cards;
  }
  function rand(n) { return randInt(n); }
  function persistSettings() { save('hfb-fe-settings', state.settings); }
  function persistStars() { save('hfb-fe-stars', state.stars); }
  var timer = null;
  function clearTimer() { clearTimeout(timer); timer = null; }

  /* ---------- Actions (mutate state → render) ---------- */
  // Random question order: never the same feeling twice in a row (with only 2 feelings on,
  // at most twice in a row — strict alternation would be a learnable pattern), favouring
  // feelings not asked recently/often. The right answer's slot is randomized by placeTarget().
  var asked = { count: {}, last: {}, recent: randMem.last ? [randMem.last] : [] };
  function makeRound() {
    var pool = state.settings.emotions;
    var prev = state.round;
    var n0 = prev ? prev.n + 1 : 1, r = asked.recent, last = r[r.length - 1];
    var run2 = r.length >= 2 && r[r.length - 1] === r[r.length - 2];
    var choices = pool.filter(function (id) { return pool.length > 2 ? id !== last : !(run2 && id === last); });
    if (!choices.length) choices = pool.slice();
    var minC = Math.min.apply(null, choices.map(function (id) { return asked.count[id] || 0; }));
    var emotion = pickWeighted(choices, function (id) {
      var since = asked.last[id] == null ? pool.length : n0 - asked.last[id];
      var w = Math.min(since, pool.length) / (1 + (asked.count[id] || 0) - minC);
      return id === last ? w * 0.5 : w;
    });
    asked.count[emotion] = (asked.count[emotion] || 0) + 1;
    asked.last[emotion] = n0;
    r.push(emotion); if (r.length > 4) r.shift();
    randMem.last = emotion; saveRandMem();
    var skin = rand(SKINS.length);
    if (prev && skin === prev.skin) skin = (skin + 1 + rand(SKINS.length - 1)) % SKINS.length;
    var n = Math.min(state.settings.count, pool.length);
    var others = shuffle(pool.filter(function (id) { return id !== emotion; })).slice(0, n - 1); // random distractors
    return {
      n: prev ? prev.n + 1 : 1,
      emotion: emotion,
      skin: skin,
      hair: rand(HAIRS.length),
      style: STYLES[rand(STYLES.length)],
      options: placeTarget(emotion, others)
    };
  }

  function newRound(opts) {
    clearTimer();
    state.round = makeRound();
    state.answer = null;
    render();
    emit('round', state.round);
    if (opts && opts.say) speak(t('question'), $('speakPrompt'), 'question');
  }

  function answer(id) {
    if (state.answer || state.celebrating || !state.round) return;
    var m = EMO[state.round.emotion];
    var correct = id === m.id;
    state.answer = { pick: id, correct: correct };
    if (correct) {
      state.stars = Math.min(GOAL, state.stars + 1);
      state.justFilled = state.stars - 1;
      persistStars();
    }
    render();
    state.justFilled = -1;
    emit('answer', state.answer);

    // Audio: synchronous, inside the tap.
    if (correct) { speak(t('yes')(m), $('speakFeedback'), 'yes_' + m.id); chime(false, 0.15); }
    else { softCue(); speak(t('is')(m), $('speakFeedback'), 'is_' + m.id); }

    clearTimer();
    if (correct && state.stars >= GOAL) timer = setTimeout(showCelebration, 2800);
    else timer = setTimeout(function () { newRound({ say: true }); }, correct ? 4200 : 5000); // "Next" skips the wait
    el.nextBtn.focus({ preventScroll: true });
  }

  function next() {
    if (state.stars >= GOAL) { showCelebration(); return; }
    newRound({ say: true });
    var first = el.answers.querySelector('.answer');
    if (first) first.focus({ preventScroll: true });
  }

  var lastFocus = null;
  function showCelebration() {
    clearTimer();
    lastFocus = document.activeElement;
    state.celebrating = true;
    render();
    emit('celebrate', null);
    chime(true, 0);
    setTimeout(function () { if (state.celebrating) speak(t('celebrateSay'), $('speakCelebrate'), 'celebrate'); }, 400);
    el.playAgain.focus({ preventScroll: true });
  }
  function closeCelebration() {
    state.celebrating = false;
    state.stars = 0; persistStars();
    emit('playAgain', null);
    newRound({ say: true });
    var first = el.answers.querySelector('.answer');
    if (first) first.focus({ preventScroll: true });
  }
  function resetStars() {
    state.stars = 0; persistStars();
    render();
    emit('resetStars', null);
  }
  function setSetting(key, value) {
    state.settings[key] = value;
    state.settings = cleanSettings(state.settings);
    persistSettings();
    if (key === 'sound' && !value) stopSpeech();
    emit('setting', { key: key, value: value });
    if (key === 'count' || key === 'emotions') newRound(); else render();
  }

  /* ---------- Render: everything from `state` ---------- */
  var drawn = { faceKey: '', answersKey: '' };

  function render() {
    var L = state.lang, r = state.round, a = state.answer, s = state.settings;

    // Static text + language + theme
    root.lang = L;
    root.dir = L === 'fa' ? 'rtl' : 'ltr';
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
    el.faceBtn.setAttribute('aria-label', t('faceBtn'));

    if (r) {
      // Face (redrawn only when the round changes)
      var fk = r.n + ':' + r.emotion + ':' + r.skin + ':' + r.hair + ':' + r.style;
      if (drawn.faceKey !== fk) { el.face.innerHTML = faceSVG(r); drawn.faceKey = fk; }
      el.faceWrap.classList.toggle('glow', !!(a && a.correct));
      el.faceWrap.dataset.emotion = r.emotion;

      // Answer buttons (rebuilt only when round or language changes; classes always updated)
      var ak = r.n + ':' + L + ':' + r.options.join(',');
      if (drawn.answersKey !== ak) {
        el.answers.innerHTML = '';
        el.answers.dataset.count = String(r.options.length);
        r.options.forEach(function (id, idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer';
          b.dataset.id = id;
          b.setAttribute('aria-keyshortcuts', String(idx + 1));
          b.innerHTML = '<span class="answer-num" aria-hidden="true"></span><span class="answer-icon" aria-hidden="true"></span><span class="answer-label"></span><span class="answer-mark" aria-hidden="true"></span>';
          b.children[0].textContent = L === 'fa' ? toFaDigits(idx + 1) : String(idx + 1);
          b.children[1].textContent = EMO[id].e;
          b.children[2].textContent = emoName(id);
          b.addEventListener('click', function () { answer(id); });
          el.answers.appendChild(b);
        });
        drawn.answersKey = ak;
      }
      el.answers.classList.toggle('answered', !!a);
      Array.prototype.forEach.call(el.answers.children, function (b) {
        var id = b.dataset.id, isRight = id === r.emotion;
        b.classList.toggle('prompting', !a && s.errorless && isRight);
        b.classList.toggle('picked-right', !!(a && a.correct && a.pick === id));
        b.classList.toggle('reveal', !!(a && !a.correct && isRight));
        b.classList.toggle('picked-wrong', !!(a && !a.correct && a.pick === id));
        b.classList.toggle('dim', !!(a && !isRight && a.pick !== id));
        if (a) b.setAttribute('aria-pressed', a.pick === id ? 'true' : 'false'); else b.removeAttribute('aria-pressed');
        b.setAttribute('aria-disabled', a ? 'true' : 'false');
      });

      // Feedback
      if (a) {
        var m = EMO[r.emotion];
        el.feedback.hidden = false;
        el.feedback.classList.toggle('is-correct', a.correct);
        el.feedbackEmoji.textContent = a.correct ? '⭐' : m.e;
        el.feedbackText.textContent = a.correct ? t('yes')(m) : t('is')(m);
      } else {
        el.feedback.hidden = true;
      }
    }

    // Stars
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

    // Celebration
    el.celebrate.hidden = !state.celebrating;
    if (state.celebrating) el.main.setAttribute('aria-hidden', 'true'); else el.main.removeAttribute('aria-hidden');

    renderSettings();
    updateVoiceStatus();
  }

  function renderSettings() {
    var s = state.settings, L = state.lang;
    el.sound.checked = !!s.sound;
    el.motion.checked = !!s.motion;
    el.errorless.checked = !!s.errorless;
    el.form.querySelectorAll('input[name="count"]').forEach(function (r) { r.checked = Number(r.value) === s.count; });
    if (el.emoChecks.dataset.lang !== L) {
      el.emoChecks.innerHTML = '';
      EMOTIONS.forEach(function (m) {
        var lab = document.createElement('label');
        lab.innerHTML = '<input type="checkbox" name="emo"> <span aria-hidden="true"></span> <span></span>';
        lab.firstChild.value = m.id;
        lab.children[1].textContent = m.e;
        lab.children[2].textContent = emoName(m.id);
        el.emoChecks.appendChild(lab);
      });
      el.emoChecks.dataset.lang = L;
    }
    el.emoChecks.querySelectorAll('input[name="emo"]').forEach(function (c) { c.checked = s.emotions.indexOf(c.value) >= 0; });
  }

  /* ---------- Theme: DARK → DIM → LIGHT (shared "hfb-theme" key with the site) ---------- */
  var THEMES = ['dark', 'dim', 'light'];
  var THEME_ICON = { dark: '🌙', dim: '🌗', light: '☀️' };

  /* ---------- Events ---------- */
  el.langBtn.addEventListener('click', function () {
    state.lang = state.lang === 'fa' ? 'en' : 'fa';
    saveRaw('hfb-lang', state.lang);
    stopSpeech();
    render();
    emit('lang', state.lang);
  });
  el.themeBtn.addEventListener('click', function () {
    state.theme = THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length];
    saveRaw('hfb-theme', state.theme);
    render();
  });
  $('speakPrompt').addEventListener('click', function () { speak(t('question'), this, 'question'); });
  el.faceBtn.addEventListener('click', function () {
    if (!state.round) return;
    var id = state.round.emotion;
    speak(emoName(id), el.faceBtn, 'name_' + id);
    emit('faceTap', id);
  });
  $('speakFeedback').addEventListener('click', function () {
    if (!state.answer) return;
    var m = EMO[state.round.emotion];
    if (state.answer.correct) speak(t('yes')(m), this, 'yes_' + m.id);
    else speak(t('is')(m), this, 'is_' + m.id);
  });
  $('speakCelebrate').addEventListener('click', function () { speak(t('celebrateSay'), this, 'celebrate'); });
  el.nextBtn.addEventListener('click', next);
  el.playAgain.addEventListener('click', closeCelebration);

  el.adultBtn.addEventListener('click', function () {
    renderSettings();
    updateVoiceStatus();
    el.resetStatus.textContent = '';
    el.emoHint.classList.remove('warn');
    if (typeof el.panel.showModal === 'function') el.panel.showModal();
    else el.panel.setAttribute('open', '');
  });
  el.panel.addEventListener('close', function () { el.adultBtn.focus({ preventScroll: true }); });
  el.panel.addEventListener('click', function (e) { if (e.target === el.panel) el.panel.close(); });

  el.form.addEventListener('change', function (e) {
    var tg = e.target;
    if (tg.name === 'count') setSetting('count', Number(tg.value));
    else if (tg.name === 'emo') {
      var on = Array.prototype.filter.call(el.emoChecks.querySelectorAll('input[name="emo"]'), function (c) { return c.checked; })
        .map(function (c) { return c.value; });
      if (on.length < 2) { tg.checked = true; el.emoHint.classList.add('warn'); return; }
      el.emoHint.classList.remove('warn');
      setSetting('emotions', on);
    }
    else if (tg === el.sound) setSetting('sound', tg.checked);
    else if (tg === el.motion) setSetting('motion', tg.checked);
    else if (tg === el.errorless) setSetting('errorless', tg.checked);
  });
  el.reset.addEventListener('click', function () {
    resetStars();
    el.resetStatus.textContent = t('resetDone');
  });

  // Keyboard: 1–4 (or Persian ۱–۴) pick an answer; Escape closes the celebration.
  document.addEventListener('keydown', function (e) {
    if (el.panel.open || e.altKey || e.ctrlKey || e.metaKey) return;
    if (state.celebrating) { if (e.key === 'Escape') closeCelebration(); return; }
    var k = e.key.replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); });
    var n = parseInt(k, 10);
    if (state.round && !state.answer && n >= 1 && n <= state.round.options.length) {
      e.preventDefault();
      answer(state.round.options[n - 1]);
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
    reduceMQ.addEventListener('change', function (m) { if (m.matches) setSetting('motion', false); });
  }

  /* ---------- Public hook (for tests and a future live mode; no networking here) ---------- */
  window.HFBFeelings = {
    getState: function () { return JSON.parse(JSON.stringify(state)); },
    on: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    render: render,
    actions: { newRound: newRound, answer: answer, next: next, showCelebration: showCelebration,
               closeCelebration: closeCelebration, resetStars: resetStars, setSetting: setSetting },
    faceSVG: faceSVG, // draw any face: faceSVG({ emotion, skin, hair, style })
    EMOTIONS: EMOTIONS.map(function (m) { return m.id; })
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
