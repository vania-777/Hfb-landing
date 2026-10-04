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

  /* Levels: 1–3 faces (2/3/4 choices); 4–6 situations (2/3/4 choices). */
  var LEVELS = [null,
    { kind: 'face', n: 2 }, { kind: 'face', n: 3 }, { kind: 'face', n: 4 },
    { kind: 'sit', n: 2 }, { kind: 'sit', n: 3 }, { kind: 'sit', n: 4 }
  ];
  var MAX_LEVEL = LEVELS.length - 1;

  /* Situations: ONE clearly correct feeling each. `avoid` lists feelings that could also fit,
     so they are never used as distractors (distractors stay clearly wrong).
     g: 'm' / 'f' only changes the English pronoun and the drawing (Persian has no gendered pronoun). */
  var SITUATIONS = [
    { id: 'gift',      emo: 'happy',     g: 'f', avoid: ['surprised', 'calm'],
      fa: 'برای تولدش کادو گرفت.', en: 'She got a present for her birthday.' },
    { id: 'icecream',  emo: 'sad',       g: 'm', avoid: ['angry', 'surprised'],
      fa: 'بستنی‌اش افتاد زمین.', en: 'His ice cream fell on the ground.' },
    { id: 'dog',       emo: 'scared',    g: 'f', avoid: ['surprised', 'sad'],
      fa: 'یه سگ بزرگ داره براش پارس می‌کنه.', en: 'A big dog is barking at her.' },
    { id: 'toy',       emo: 'angry',     g: 'm', avoid: ['sad', 'surprised'],
      fa: 'دوستش اسباب‌بازی‌اش رو به زور ازش گرفت.', en: 'His friend grabbed his toy away from him.' },
    { id: 'hug',       emo: 'happy',     g: 'f', avoid: ['calm', 'surprised'],
      fa: 'مامانش محکم بغلش کرد.', en: 'Her mom gave her a big hug.' },
    { id: 'party',     emo: 'surprised', g: 'm', avoid: ['happy', 'scared'],
      fa: 'یهو همه داد زدن: سورپرایز!', en: 'Everyone jumped out and shouted, "Surprise!"' },
    { id: 'sleepy',    emo: 'tired',     g: 'f', avoid: ['calm', 'sad'],
      fa: 'بعد از یه روز طولانی، هی خمیازه می‌کشه.', en: 'After a long day, she keeps yawning.' },
    { id: 'bath',      emo: 'calm',      g: 'm', avoid: ['happy', 'tired'],
      fa: 'توی وان آب گرم، آروم دراز کشیده.', en: 'He is lying quietly in a warm bath.' },
    { id: 'balloon',   emo: 'sad',       g: 'f', avoid: ['surprised', 'angry', 'scared'],
      fa: 'بادکنکش از دستش در رفت و رفت هوا.', en: 'Her balloon slipped away and flew up into the sky.' },
    { id: 'thunder',   emo: 'scared',    g: 'm', avoid: ['surprised', 'sad'],
      fa: 'شب، صدای رعد و برق خیلی بلندی اومد.', en: 'At night, there was a very loud crash of thunder.' },
    { id: 'tower',     emo: 'angry',     g: 'f', avoid: ['sad', 'surprised'],
      fa: 'یکی عمداً برجش رو خراب کرد.', en: 'Someone knocked down her block tower on purpose.' },
    { id: 'jackbox',   emo: 'surprised', g: 'm', avoid: ['scared', 'happy'],
      fa: 'یهو یه عروسک از توی جعبه پرید بیرون.', en: 'A toy suddenly popped out of the box.' },
    { id: 'trash',     emo: 'disgusted', g: 'f', avoid: ['angry', 'sad'],
      fa: 'سطل آشغال خیلی بوی بد میده.', en: 'The trash can smells really bad.' },
    { id: 'reading',   emo: 'calm',      g: 'f', avoid: ['happy', 'tired'],
      fa: 'زیر درخت، آروم کتاب می‌خونه.', en: 'She is quietly reading a book under a tree.' },
    { id: 'swing',     emo: 'happy',     g: 'm', avoid: ['calm', 'surprised', 'tired'],
      fa: 'توی پارک داره تاب‌بازی می‌کنه.', en: 'He is playing on the swings at the park.' }
  ];
  var SIT = {};
  SITUATIONS.forEach(function (x) { SIT[x.id] = x; });
  function shortFa(m) { return m.faS.replace(/^این /, ''); } // 'این غمگینه.' -> 'غمگینه.'

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
      sitSay: function (x) { return x.fa + ' چه حسی داره؟'; },
      sitYes: function (x) { return 'آفرین! ' + shortFa(EMO[x.emo]); },
      sitIs: function (x) { return 'اون ' + shortFa(EMO[x.emo]); },
      sceneHint: 'روی تصویر بزن تا دوباره بشنوی.',
      sceneBtn: 'تصویر موقعیت. برای شنیدن دوباره بزنید.',
      tryAgain: 'یه بار دیگه امتحان کنیم.',
      levelUp: 'مرحلهٔ بعد!',
      levelUpSay: 'آفرین! بریم مرحلهٔ بعد!',
      allDone: 'همهٔ مرحله‌ها تمام شد!',
      nextLevel: 'مرحلهٔ بعد',
      repeatLevel: 'دوباره همین مرحله',
      levelLabel: function (n) { return 'مرحلهٔ ' + toFaDigits(n); },
      kind_face: 'چهره‌ها',
      kind_sit: 'موقعیت‌ها',
      levelLegend: 'مرحله',
      levelHint: '۱ تا ۳: چهره‌ها (۲، ۳، ۴ گزینه) · ۴ تا ۶: موقعیت‌ها، کودک حسِ آدمِ توی تصویر را پیدا می‌کند (۲، ۳، ۴ گزینه). با ۵ ستاره، مرحلهٔ بعد باز می‌شود.',
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
      emoHint: 'حداقل دو حس باید روشن بماند. (برای مرحله‌های چهره)',
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
      sitSay: function (x) { return x.en + ' How does ' + (x.g === 'f' ? 'she' : 'he') + ' feel?'; },
      sitYes: function (x) { return 'Yes! ' + (x.g === 'f' ? 'She' : 'He') + ' feels ' + EMO[x.emo].enS + '.'; },
      sitIs: function (x) { return (x.g === 'f' ? 'She' : 'He') + ' feels ' + EMO[x.emo].enS + '.'; },
      sceneHint: 'Tap the picture to hear it again.',
      sceneBtn: 'Picture of the situation. Tap to hear it again.',
      tryAgain: 'Let\'s try again.',
      levelUp: 'Level up!',
      levelUpSay: 'Level up! On to the next level!',
      allDone: 'All levels done!',
      nextLevel: 'Next level',
      repeatLevel: 'Repeat this level',
      levelLabel: function (n) { return 'Level ' + n; },
      kind_face: 'Faces',
      kind_sit: 'Situations',
      levelLegend: 'Level',
      levelHint: '1–3: faces (2, 3, 4 choices) · 4–6: situations, where the child finds how the person in the picture feels (2, 3, 4 choices). 5 stars opens the next level.',
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
      emoHint: 'At least two feelings must stay on. (For the face levels.)',
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
    level: 1,
    count: 2,
    emotions: EMOTIONS.filter(function (x) { return x.on; }).map(function (x) { return x.id; }),
    errorless: false,
    sound: true,
    motion: !(reduceMQ && reduceMQ.matches)
  };
  function cleanSettings(s) {
    var had = s || {};
    s = Object.assign({}, DEFAULTS, had);
    // Older saves only had `count` (2/3/4 faces) → face level 1/2/3.
    if (had.level == null && [2, 3, 4].indexOf(had.count) >= 0) s.level = had.count - 1;
    s.level = Math.max(1, Math.min(MAX_LEVEL, parseInt(s.level, 10) || 1));
    s.count = LEVELS[s.level].n; // derived from the level
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
    round: null,        // { n, kind: 'face'|'sit', sit?: id, retry?: bool, emotion, skin, hair, style, options: [ids] }
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
    levelNum: $('levelNum'), levelMode: $('levelMode'), levelUpText: $('levelUpText'),
    nextLevel: $('nextLevelBtn'), nextLevelText: $('nextLevelText'), playAgainText: $('playAgainText'),
    promptText: $('promptText'), faceHint: $('faceHint'),
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
     audio/<lang>/<key>.mp3 with keys: question, celebrate, level_up, try_again, name_<id>, yes_<id>, is_<id>,
     and per situation sit_<id> (scene + question), sityes_<id> (right), sitis_<id> (gentle answer).
     Same path as Choice & Reward: one shared <audio> element, src + play() run
     synchronously inside the tap handler (iOS rule). speechSynthesis is only a fallback. */
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
  function playClip(key, text, btn, next) {
    var my = ++playToken;
    var url = clipUrl(key);
    setSpeaking(btn);
    var fallback = function (why) {
      if (my !== playToken) return; // a newer clip took over
      playToken++;
      audioFailed(why + ' (' + url + ')');
      speakSynth(text, btn, next);
    };
    player.onended = function () {
      if (my !== playToken) return;
      if (next) { next(); return; } // play the next clip in a sequence
      if (btn) btn.classList.remove('speaking');
    };
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
  function speakSynth(text, btn, next) {
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
      u.onend = function () { if (next) next(); else done(); }; u.onerror = done;
      synth.speak(u);
    } catch (e) { /* text is always on screen */ }
  }
  // Call directly from a tap/click handler (no await / setTimeout before it).
  // `next` (optional) runs when this clip ends, e.g. "Let's try again" → the situation.
  function speak(text, btn, key, next) {
    if (!state.settings.sound || !text) return;
    stopSpeech();
    if (player && key) { playClip(key, text, btn, next); return; }
    speakSynth(text, btn, next);
  }
  function chain(text, btn, key) { // a follow-up clip in a sequence (keeps the speaking ring)
    return function () {
      if (!state.settings.sound) return;
      if (player && key) { playClip(key, text, btn); return; }
      speakSynth(text, btn);
    };
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

  /* ---------- Situation scenes (SVG, same cartoon style as the faces) ----------
     The person in the scene shows a neutral face until the child answers, so the feeling is
     found from the situation; after the answer the face shows the feeling. */
  FEATURES.neutral = function () {
    return bw('M62,90 Q74,86 86,90', 4.5) + bw('M114,90 Q126,86 138,90', 4.5) + dotEyes(7) + NOSE +
      sw('M84,154 Q100,159 116,154', 5);
  };
  var SHIRTS = ['#ff9f68', '#6cc5ff', '#b28dff', '#7ed6a5', '#ffd166', '#ff8fb1'];
  function headSVG(look, emotion, x, y, size) {
    return faceSVG({ emotion: emotion || 'neutral', skin: look.skin, hair: look.hair, style: look.style })
      .replace('<svg ', '<svg x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" ');
  }
  function arm(sx, sy, ex, ey, shirt, skin) {
    var cx = (sx + ex) / 2 + (ex < sx ? -6 : 6), cy = (sy + ey) / 2 + 4;
    var d = 'M' + sx + ',' + sy + ' Q' + cx + ',' + cy + ' ' + ex + ',' + ey;
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + shirt + '" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="' + ex + '" cy="' + ey + '" r="6.5" fill="' + skin + '" stroke="' + INK + '" stroke-width="2.5"/>';
  }
  var ARMS = { // hand positions [left, right] relative to the feet (0,0)
    down: [[-32, -40], [32, -40]], front: [[-13, -54], [13, -54]], up: [[-40, -124], [40, -124]],
    reachR: [[-32, -40], [38, -128]], reachFwdR: [[-32, -40], [44, -66]], yawn: [[-32, -40], [6, -98]],
    nose: [[-32, -40], [4, -104]], book: [[-15, -48], [15, -48]], ropes: [[-30, -104], [30, -104]],
    shout: [[-42, -118], [42, -118]], hold: [[-30, -42], [38, -60]]
  };
  // A child (or adult with s > 1). x,y = feet; o: { arms, sit, emotion, shirt, pants, hat, pj }
  function kid(x, y, s, look, o) {
    o = o || {};
    var skin = SKINS[look.skin], shirt = o.shirt || look.shirt, pants = o.pants || '#4b5c9e';
    var g = '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">';
    if (o.sit) {
      g += '<rect x="-20" y="-36" width="16" height="22" rx="7" fill="' + pants + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="4" y="-36" width="16" height="22" rx="7" fill="' + pants + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<ellipse cx="-12" cy="-12" rx="10" ry="6" fill="#3a2f4a"/><ellipse cx="12" cy="-12" rx="10" ry="6" fill="#3a2f4a"/>';
    } else {
      g += '<rect x="-18" y="-36" width="14" height="33" rx="6" fill="' + pants + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="4" y="-36" width="14" height="33" rx="6" fill="' + pants + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<ellipse cx="-12" cy="-3" rx="11" ry="5.5" fill="#3a2f4a"/><ellipse cx="12" cy="-3" rx="11" ry="5.5" fill="#3a2f4a"/>';
    }
    g += '<path d="M-24,-80 Q0,-88 24,-80 L29,-30 Q0,-24 -29,-30Z" fill="' + shirt + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>';
    if (o.pj) g += '<circle cx="-10" cy="-62" r="3" fill="#fff" opacity=".8"/><circle cx="9" cy="-50" r="3" fill="#fff" opacity=".8"/><circle cx="-6" cy="-40" r="3" fill="#fff" opacity=".8"/><circle cx="12" cy="-70" r="3" fill="#fff" opacity=".8"/>';
    var h = ARMS[o.arms || 'down'];
    g += arm(-22, -76, h[0][0], h[0][1], shirt, skin) + arm(22, -76, h[1][0], h[1][1], shirt, skin);
    g += headSVG(look, o.emotion, -40, -158, 80);
    if (o.hat) g += '<path d="M-16,-146 L4,-196 L20,-142Z" fill="' + o.hat + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="4" cy="-197" r="6" fill="#ffd166" stroke="' + INK + '" stroke-width="2"/>';
    return g + '</g>';
  }
  function bgRoom(wall, floor) {
    return '<rect width="320" height="220" fill="' + wall + '"/><rect y="168" width="320" height="52" fill="' + floor + '"/>' +
      '<path d="M0,168 L320,168" stroke="' + INK + '" stroke-width="2" opacity=".25"/>';
  }
  function bgOut(sky, grass, sun) {
    return '<rect width="320" height="220" fill="' + (sky || '#cdeaff') + '"/>' +
      (sun === false ? '' : '<circle cx="280" cy="36" r="20" fill="#ffd166"/>') +
      '<ellipse cx="70" cy="40" rx="30" ry="12" fill="#fff" opacity=".9"/><ellipse cx="92" cy="34" rx="20" ry="12" fill="#fff" opacity=".9"/>' +
      '<path d="M0,170 Q80,158 160,168 T320,164 L320,220 L0,220Z" fill="' + (grass || '#a6dc8c') + '"/>';
  }
  function bunting(y) {
    var c = ['#ff6f91', '#ffd166', '#6cc5ff', '#7ed6a5', '#b28dff'], out = '<path d="M0,' + y + ' Q160,' + (y + 26) + ' 320,' + y + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
    for (var i = 0; i < 9; i++) {
      var x = 16 + i * 36, yy = y + 26 * (1 - Math.pow((x - 160) / 160, 2)) * 0.5 + 4;
      out += '<path d="M' + (x - 11) + ',' + yy + ' L' + (x + 11) + ',' + yy + ' L' + x + ',' + (yy + 20) + 'Z" fill="' + c[i % 5] + '" stroke="' + INK + '" stroke-width="1.5"/>';
    }
    return out;
  }
  function motion(x, y, dir) { // three short speed lines
    var o = '';
    for (var i = 0; i < 3; i++) o += '<path d="M' + x + ',' + (y + i * 12) + ' l' + (dir * 22) + ',0" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".45"/>';
    return o;
  }
  function heart(x, y, r, c) {
    return '<path d="M' + x + ',' + (y + r) + ' C' + (x - 2 * r) + ',' + (y - 0.2 * r) + ' ' + (x - r) + ',' + (y - 1.6 * r) + ' ' + x + ',' + (y - 0.6 * r) +
      ' C' + (x + r) + ',' + (y - 1.6 * r) + ' ' + (x + 2 * r) + ',' + (y - 0.2 * r) + ' ' + x + ',' + (y + r) + 'Z" fill="' + (c || '#ff6f91') + '"/>';
  }
  var SCENES = {
    gift: function (k, e) {
      return bgRoom('#fde9f0', '#e8c9a8') + bunting(12) +
        '<rect x="232" y="132" width="56" height="36" rx="4" fill="#fff3d6" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="232" y="132" width="56" height="10" fill="#ff8fb1"/><rect x="258" y="114" width="5" height="18" fill="#6cc5ff"/>' +
        '<path d="M260.5,104 q6,6 0,11 q-6,-5 0,-11z" fill="#ffb84d"/>' +
        kid(150, 210, 1, k, { arms: 'front', emotion: e, hat: '#6cc5ff' }) +
        '<rect x="126" y="136" width="48" height="38" rx="5" fill="#ff6f91" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="146" y="136" width="8" height="38" fill="#ffd166"/><rect x="126" y="150" width="48" height="8" fill="#ffd166"/>' +
        '<ellipse cx="141" cy="132" rx="11" ry="7" fill="#ffd166" stroke="' + INK + '" stroke-width="2"/><ellipse cx="159" cy="132" rx="11" ry="7" fill="#ffd166" stroke="' + INK + '" stroke-width="2"/>';
    },
    icecream: function (k, e) {
      return bgOut() + '<path d="M0,196 L320,190" stroke="#d9c7a7" stroke-width="22"/>' +
        kid(125, 205, 1, k, { arms: 'reachFwdR', emotion: e }) +
        '<ellipse cx="228" cy="200" rx="28" ry="8" fill="#ffb3c7" stroke="' + INK + '" stroke-width="2"/>' +
        '<circle cx="222" cy="192" r="14" fill="#ffb3c7" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M232,186 L262,176 L248,202Z" fill="#e0a458" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M240,186 L254,196 M247,182 L258,190" stroke="#a8742f" stroke-width="2"/>' +
        '<path d="M200,150 l4,10 M214,140 l2,11 M228,148 l-2,10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".45"/>';
    },
    dog: function (k, e) {
      var B = '#b07a4a';
      return bgOut() + kid(80, 205, 0.9, k, { arms: 'front', emotion: e }) +
        
        '<rect x="196" y="168" width="16" height="36" rx="7" fill="' + B + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="262" y="168" width="16" height="36" rx="7" fill="' + B + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M282,148 q26,-18 22,-40" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M282,148 q26,-18 22,-40" fill="none" stroke="' + B + '" stroke-width="7" stroke-linecap="round"/>' +
        '<ellipse cx="238" cy="152" rx="54" ry="32" fill="' + B + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="174" cy="112" r="36" fill="' + B + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<ellipse cx="200" cy="96" rx="12" ry="24" fill="#7a5030" stroke="' + INK + '" stroke-width="2.5" transform="rotate(-20 200 96)"/>' +
        '<circle cx="162" cy="102" r="5" fill="' + INK + '"/><circle cx="184" cy="100" r="5" fill="' + INK + '"/>' +
        '<ellipse cx="146" cy="116" rx="9" ry="7" fill="' + INK + '"/>' +
        '<path d="M146,128 Q166,124 184,132 Q170,152 150,144Z" fill="#7a2f3f" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M152,129 l3,6 l3,-6 M170,128 l3,6 l3,-6" fill="#fff" stroke="#fff" stroke-width="1"/>' +
        '<path d="M132,124 q-8,10 0,20 M122,116 q-14,18 0,36" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round" opacity=".6"/>';
    },
    toy: function (k, e) {
      var f = { skin: (k.skin + 2) % SKINS.length, hair: (k.hair + 3) % HAIRS.length, style: 'curly', shirt: '#7ed6a5' };
      return bgRoom('#e9f4ff', '#d9b48f') + kid(95, 208, 0.95, k, { arms: 'reachFwdR', emotion: e }) +
        kid(232, 208, 0.9, f, { arms: 'up' }) + motion(278, 120, 1) +
        '<g transform="translate(268,72)"><circle cx="0" cy="0" r="15" fill="#c98b5f" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="-12" cy="-12" r="7" fill="#c98b5f" stroke="' + INK + '" stroke-width="2.5"/><circle cx="12" cy="-12" r="7" fill="#c98b5f" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="-5" cy="-2" r="2.5" fill="' + INK + '"/><circle cx="5" cy="-2" r="2.5" fill="' + INK + '"/><ellipse cx="0" cy="5" rx="5" ry="3.5" fill="#f3d1b0"/></g>';
    },
    hug: function (k, e) {
      var m = { skin: k.skin, hair: (k.hair + 1) % HAIRS.length, style: 'long', shirt: '#b28dff' };
      return bgRoom('#fff1e0', '#e3c29f') + heart(70, 50, 12) + heart(250, 40, 9, '#ff8fb1') + heart(270, 76, 6) +
        kid(185, 212, 1.22, m, { arms: 'down', pants: '#6a5a8e' }) +
        kid(132, 212, 0.88, k, { arms: 'front', emotion: e }) +
        '<path d="M164,134 Q122,150 108,168" fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/><path d="M164,134 Q122,150 108,168" fill="none" stroke="#b28dff" stroke-width="10" stroke-linecap="round"/>' +
        '<circle cx="108" cy="169" r="7.5" fill="' + SKINS[m.skin] + '" stroke="' + INK + '" stroke-width="2.5"/>';
    },
    party: function (k, e) {
      var a = { skin: (k.skin + 3) % SKINS.length, hair: (k.hair + 2) % HAIRS.length, style: 'bun', shirt: '#ffd166' },
          b = { skin: (k.skin + 1) % SKINS.length, hair: (k.hair + 4) % HAIRS.length, style: 'short', shirt: '#7ed6a5' };
      var conf = '', cc = ['#ff6f91', '#ffd166', '#6cc5ff', '#7ed6a5', '#b28dff'];
      for (var i = 0; i < 16; i++) conf += '<rect x="' + (12 + i * 19) + '" y="' + (40 + (i * 37) % 60) + '" width="6" height="10" rx="2" fill="' + cc[i % 5] + '" transform="rotate(' + (i * 40) + ' ' + (15 + i * 19) + ' ' + (45 + (i * 37) % 60) + ')"/>';
      return bgRoom('#ece6ff', '#d9b48f') + bunting(8) + conf +
        kid(58, 212, 0.82, a, { arms: 'shout', hat: '#ff6f91' }) + kid(262, 212, 0.82, b, { arms: 'shout', hat: '#6cc5ff' }) +
        kid(160, 212, 0.95, k, { arms: 'down', emotion: e });
    },
    sleepy: function (k, e) {
      return bgRoom('#4a5290', '#7d6aa8') +
        '<rect x="22" y="26" width="86" height="70" rx="6" fill="#26305e" stroke="#e8e4ff" stroke-width="5"/>' +
        '<path d="M86,46 a16,16 0 1 0 6,26 a12,12 0 1 1 -6,-26z" fill="#ffe08a"/>' +
        '<circle cx="40" cy="44" r="2.5" fill="#fff"/><circle cx="58" cy="74" r="2" fill="#fff"/><circle cx="48" cy="60" r="1.6" fill="#fff"/>' +
        '<rect x="200" y="118" width="110" height="52" rx="10" fill="#8a6bd1" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="208" y="104" width="40" height="22" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="196" y="96" width="10" height="84" rx="4" fill="#c98b5f" stroke="' + INK + '" stroke-width="2.5"/>' +
        kid(140, 212, 0.98, k, { arms: 'yawn', emotion: e, shirt: '#9fb4ff', pants: '#9fb4ff', pj: true });
    },
    bath: function (k, e) {
      var tiles = '';
      for (var x = 0; x <= 320; x += 32) tiles += '<path d="M' + x + ',0 L' + x + ',220" stroke="#b9dcef" stroke-width="2"/>';
      for (var y = 0; y <= 220; y += 32) tiles += '<path d="M0,' + y + ' L320,' + y + '" stroke="#b9dcef" stroke-width="2"/>';
      return '<rect width="320" height="220" fill="#e3f5ff"/>' + tiles +
        '<path d="M120,40 q8,-10 0,-20 M150,34 q8,-10 0,-20 M180,40 q8,-10 0,-20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
        kid(160, 198, 0.95, k, { arms: 'down', emotion: e, shirt: SKINS[k.skin], pants: SKINS[k.skin] }) +
        '<path d="M40,140 L280,140 Q280,200 230,200 L90,200 Q40,200 40,140Z" fill="#ffffff" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="34" y="132" width="252" height="14" rx="7" fill="#f3f7fb" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="80" y="198" width="10" height="16" rx="3" fill="#c0c8d2"/><rect x="230" y="198" width="10" height="16" rx="3" fill="#c0c8d2"/>' +
        '<circle cx="96" cy="130" r="14" fill="#fff" stroke="#9ccbe8" stroke-width="2"/><circle cx="114" cy="126" r="10" fill="#fff" stroke="#9ccbe8" stroke-width="2"/>' +
        '<circle cx="210" cy="128" r="12" fill="#fff" stroke="#9ccbe8" stroke-width="2"/><circle cx="226" cy="130" r="9" fill="#fff" stroke="#9ccbe8" stroke-width="2"/>' +
        '<g transform="translate(252,116)"><ellipse cx="0" cy="8" rx="16" ry="10" fill="#ffd166" stroke="' + INK + '" stroke-width="2.5"/><circle cx="8" cy="-6" r="9" fill="#ffd166" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M16,-6 l9,2 l-9,4z" fill="#ff9f43"/><circle cx="10" cy="-8" r="1.8" fill="' + INK + '"/></g>';
    },
    balloon: function (k, e) {
      return bgOut() + kid(110, 205, 1, k, { arms: 'reachR', emotion: e }) +
        '<path d="M232,78 q-10,16 4,30 q12,14 -2,30" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<ellipse cx="236" cy="52" rx="22" ry="27" fill="#ff5d73" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M231,79 l5,-3 l5,3z" fill="#ff5d73" stroke="' + INK + '" stroke-width="2"/><ellipse cx="228" cy="42" rx="5" ry="8" fill="#fff" opacity=".5"/>' +
        '<path d="M270,70 l10,-8 M268,88 l12,-2" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".45"/>';
    },
    thunder: function (k, e) {
      var rain = '';
      for (var i = 0; i < 10; i++) rain += '<path d="M' + (28 + i * 14) + ',' + (40 + (i % 3) * 14) + ' l-5,12" stroke="#9fc4ff" stroke-width="2.5" stroke-linecap="round"/>';
      return '<rect width="320" height="220" fill="#353a6a"/><rect y="168" width="320" height="52" fill="#5a4f86"/>' +
        '<rect x="18" y="20" width="160" height="104" rx="6" fill="#1b1f3f" stroke="#d9d6f5" stroke-width="5"/>' + rain +
        '<path d="M108,28 L84,74 L102,74 L86,116 L130,64 L110,64 L126,28Z" fill="#ffe14d" stroke="#fff3a6" stroke-width="2"/>' +
        '<path d="M150,40 l14,-6 M150,56 l16,0" stroke="#ffe14d" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="176" y="146" width="136" height="40" rx="8" fill="#c98b5f" stroke="' + INK + '" stroke-width="2.5"/>' +
        kid(240, 196, 0.85, k, { arms: 'front', emotion: e, shirt: '#9fb4ff', pants: '#9fb4ff', pj: true, sit: true }) +
        '<path d="M182,150 Q240,132 306,150 L306,188 L182,188Z" fill="#7ea8ff" stroke="' + INK + '" stroke-width="2.5"/>';
    },
    tower: function (k, e) {
      var f = { skin: (k.skin + 4) % SKINS.length, hair: (k.hair + 1) % HAIRS.length, style: 'short', shirt: '#ff9f68' };
      var bl = [['#ff6f91', 196, 120, 20], ['#ffd166', 222, 92, -25], ['#6cc5ff', 186, 154, 10], ['#7ed6a5', 214, 148, 35], ['#b28dff', 240, 130, -10], ['#ff9f68', 206, 182, 0], ['#6cc5ff', 236, 186, 12]];
      var blocks = bl.map(function (b) { return '<rect x="' + (b[1] - 13) + '" y="' + (b[2] - 13) + '" width="26" height="26" rx="4" fill="' + b[0] + '" stroke="' + INK + '" stroke-width="2.5" transform="rotate(' + b[3] + ' ' + b[1] + ' ' + b[2] + ')"/>'; }).join('');
      return bgRoom('#eaf7e8', '#d9b48f') + kid(85, 208, 0.95, k, { arms: 'down', emotion: e }) + blocks +
        '<path d="M200,92 l-6,-10 M220,70 l0,-12 M246,96 l8,-8" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".45"/>' +
        kid(284, 208, 0.72, f, { arms: 'down' }) + motion(250, 100, -1);
    },
    jackbox: function (k, e) {
      var spring = 'M226,150 l-12,-8 l24,-8 l-24,-8 l24,-8 l-24,-8 l12,-6';
      return bgRoom('#fff4d6', '#d9b48f') + kid(95, 208, 0.95, k, { arms: 'down', emotion: e }) +
        '<path d="' + spring + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<circle cx="226" cy="84" r="24" fill="#fde3cf" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M206,70 L226,30 L246,70Z" fill="#ff6f91" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="226" cy="28" r="6" fill="#ffd166" stroke="' + INK + '" stroke-width="2"/>' +
        '<circle cx="217" cy="82" r="3" fill="' + INK + '"/><circle cx="235" cy="82" r="3" fill="' + INK + '"/><circle cx="226" cy="91" r="6" fill="#ff5d5d"/>' +
        sw('M214,98 Q226,106 238,98', 3) +
        '<path d="M184,64 l-12,-6 M182,84 l-14,0 M268,64 l12,-6 M270,84 l14,0" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".5"/>' +
        '<path d="M190,150 L262,150 L266,200 L186,200Z" fill="#6cc5ff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M190,150 L160,128 L196,132Z" fill="#9fd9ff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M216,166 l10,14 l10,-14z" fill="#ffd166"/>';
    },
    trash: function (k, e) {
      var fly = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + INK + '"/><ellipse cx="' + (x - 3) + '" cy="' + (y - 4) + '" rx="3" ry="2" fill="#fff" opacity=".8"/><ellipse cx="' + (x + 3) + '" cy="' + (y - 4) + '" rx="3" ry="2" fill="#fff" opacity=".8"/>'; };
      return bgOut('#d6efe6', '#b5d99a', false) + '<path d="M0,196 L320,190" stroke="#d1c3a8" stroke-width="22"/>' +
        kid(100, 205, 1, k, { arms: 'nose', emotion: e }) +
        '<path d="M196,112 L264,112 L256,200 L204,200Z" fill="#8f9ba8" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M214,124 L218,188 M230,124 L230,188 M246,124 L242,188" stroke="#6f7a86" stroke-width="3"/>' +
        '<rect x="188" y="100" width="84" height="14" rx="6" fill="#a7b2be" stroke="' + INK + '" stroke-width="2.5" transform="rotate(-8 230 107)"/>' +
        '<path d="M208,90 q-8,-10 0,-20 q8,-10 0,-20 M230,86 q-8,-10 0,-20 q8,-10 0,-20 M252,90 q-8,-10 0,-20 q8,-10 0,-20" fill="none" stroke="#6bbf59" stroke-width="4" stroke-linecap="round"/>' +
        fly(192, 60) + fly(270, 52) + fly(282, 96) +
        '<path d="M206,198 l-8,6 l14,0z" fill="#9ccc65"/><ellipse cx="270" cy="200" rx="10" ry="4" fill="#c49a6c"/>';
    },
    reading: function (k, e) {
      return bgOut() +
        '<rect x="44" y="70" width="22" height="104" rx="6" fill="#9a6a3f" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="34" cy="62" r="32" fill="#6cc070"/><circle cx="76" cy="56" r="34" fill="#7fd07f"/><circle cx="56" cy="30" r="28" fill="#8fda88"/>' +
        kid(160, 200, 1, k, { arms: 'book', emotion: e, sit: true }) +
        '<path d="M160,146 L132,138 L132,166 L160,174 L188,166 L188,138Z" fill="#ffffff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M160,146 L160,174" stroke="' + INK + '" stroke-width="2"/><path d="M138,148 l16,4 M138,156 l16,4 M166,152 l16,-4 M166,160 l16,-4" stroke="#b9c2cc" stroke-width="2"/>' +
        '<path d="M236,92 q6,-8 12,0 q6,-8 12,0 q-6,8 -12,4 q-6,4 -12,-4z" fill="#ff8fb1"/>' +
        '<circle cx="250" cy="180" r="5" fill="#fff"/><circle cx="250" cy="180" r="2" fill="#ffd166"/><circle cx="276" cy="188" r="5" fill="#fff"/><circle cx="276" cy="188" r="2" fill="#ffd166"/>';
    },
    swing: function (k, e) {
      return bgOut() +
        '<path d="M70,200 L100,30 L130,200 M190,200 L220,30 L250,200" fill="none" stroke="#c0392b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M92,32 L228,32" stroke="#c0392b" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M140,34 L136,148 M180,34 L184,148" stroke="#6f5a46" stroke-width="3"/>' +
        kid(160, 172, 0.84, k, { arms: 'ropes', emotion: e, sit: true }) +
        '<rect x="128" y="154" width="64" height="9" rx="4" fill="#9a6a3f" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M106,120 q-14,22 0,44 M214,120 q14,22 0,44" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".4"/>';
    }
  };
  function sceneSVG(r, answered) {
    var x = SIT[r.sit];
    var look = { skin: r.skin, hair: r.hair, style: r.style, shirt: SHIRTS[r.shirt || 0] };
    return '<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" focusable="false" preserveAspectRatio="xMidYMid slice">' +
      SCENES[x.id](look, answered ? x.emo : 'neutral') + '</svg>';
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
    var lv = LEVELS[state.settings.level];
    if (lv.kind === 'sit') return makeSitRound(lv.n);
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
    var n = Math.min(lv.n, pool.length);
    var others = shuffle(pool.filter(function (id) { return id !== emotion; })).slice(0, n - 1); // random distractors
    return {
      n: prev ? prev.n + 1 : 1,
      kind: 'face',
      emotion: emotion,
      skin: skin,
      hair: rand(HAIRS.length),
      style: STYLES[rand(STYLES.length)],
      options: placeTarget(emotion, others)
    };
  }

  /* Situations: random order (never the same one twice in a row, favouring ones not seen
     recently/often). A missed situation comes back after a random 2–4 rounds ("Let's try
     again"); once it is answered right it comes back once more a bit later (4–6 rounds). */
  var sitAsked = { count: {}, last: {}, recent: randMem.lastSit ? [randMem.lastSit] : [] };
  var missed = {}; // id -> { due: round number, step: 0 | 1 }
  function makeSitRound(nOpts) {
    var prev = state.round, n0 = prev ? prev.n + 1 : 1;
    var ids = SITUATIONS.map(function (x) { return x.id; });
    var r = sitAsked.recent, last = r[r.length - 1];
    var due = ids.filter(function (id) { return missed[id] && missed[id].due <= n0 && id !== last; })
      .sort(function (a, b) { return missed[a].due - missed[b].due; });
    var id, retry = false;
    if (due.length) { id = due[0]; retry = true; }
    else {
      var choices = ids.filter(function (x) { return x !== last && !missed[x]; }); // missed ones wait for their turn
      if (!choices.length) choices = ids.filter(function (x) { return x !== last; });
      var minC = Math.min.apply(null, choices.map(function (x) { return sitAsked.count[x] || 0; }));
      id = pickWeighted(choices, function (x) {
        var since = sitAsked.last[x] == null ? ids.length : n0 - sitAsked.last[x];
        return Math.min(since, ids.length) / (1 + (sitAsked.count[x] || 0) - minC);
      });
    }
    sitAsked.count[id] = (sitAsked.count[id] || 0) + 1;
    sitAsked.last[id] = n0;
    r.push(id); if (r.length > 4) r.shift();
    randMem.lastSit = id; saveRandMem();
    var x = SIT[id];
    var allowed = EMOTIONS.map(function (m) { return m.id; })
      .filter(function (e) { return e !== x.emo && x.avoid.indexOf(e) < 0; }); // clearly wrong only
    var others = shuffle(allowed).slice(0, nOpts - 1);
    var skin = rand(SKINS.length);
    if (prev && skin === prev.skin) skin = (skin + 1 + rand(SKINS.length - 1)) % SKINS.length;
    var styles = x.g === 'f' ? ['long', 'bun'] : ['short', 'curly'];
    return {
      n: n0, kind: 'sit', sit: id, retry: retry,
      emotion: x.emo,
      skin: skin, hair: rand(HAIRS.length), style: styles[rand(2)], shirt: rand(SHIRTS.length),
      options: placeTarget(x.emo, others)
    };
  }
  function noteSitResult(r, correct) {
    if (!r || r.kind !== 'sit') return;
    var m = missed[r.sit];
    if (!correct) missed[r.sit] = { due: r.n + 2 + randInt(3), step: 0 };        // back in 2–4 rounds
    else if (m && m.step === 0 && r.retry) missed[r.sit] = { due: r.n + 4 + randInt(3), step: 1 }; // once more, later
    else if (m && r.retry) delete missed[r.sit];
  }
  // Read the round aloud: the question (faces) or the situation sentence (+ "Let's try again" first on a retry).
  function sayRound(btn, withRetryCue) {
    var r = state.round; if (!r) return;
    btn = btn || $('speakPrompt');
    if (r.kind !== 'sit') { speak(t('question'), btn, 'question'); return; }
    var x = SIT[r.sit], say = t('sitSay')(x);
    if (withRetryCue && r.retry) speak(t('tryAgain'), btn, 'try_again', chain(say, btn, 'sit_' + x.id));
    else speak(say, btn, 'sit_' + x.id);
  }

  function newRound(opts) {
    clearTimer();
    state.round = makeRound();
    state.answer = null;
    render();
    emit('round', state.round);
    if (opts && opts.say) sayRound(null, true);
  }

  function answer(id) {
    if (state.answer || state.celebrating || !state.round) return;
    var m = EMO[state.round.emotion], r0 = state.round;
    var correct = id === m.id;
    state.answer = { pick: id, correct: correct };
    noteSitResult(r0, correct);
    if (correct) {
      state.stars = Math.min(GOAL, state.stars + 1);
      state.justFilled = state.stars - 1;
      persistStars();
    }
    render();
    state.justFilled = -1;
    emit('answer', state.answer);

    // Audio: synchronous, inside the tap.
    sayFeedback();
    if (correct) chime(false, 0.15); else softCue();

    clearTimer();
    if (correct && state.stars >= GOAL) timer = setTimeout(showCelebration, 2800);
    else timer = setTimeout(function () { newRound({ say: true }); }, correct ? 4200 : 5000); // "Next" skips the wait
    el.nextBtn.focus({ preventScroll: true });
  }

  function sayFeedback(btn) {
    var r = state.round, a = state.answer; if (!r || !a) return;
    btn = btn || $('speakFeedback');
    if (r.kind === 'sit') {
      var x = SIT[r.sit];
      if (a.correct) speak(t('sitYes')(x), btn, 'sityes_' + x.id);
      else speak(t('sitIs')(x), btn, 'sitis_' + x.id);
      return;
    }
    var m = EMO[r.emotion];
    if (a.correct) speak(t('yes')(m), btn, 'yes_' + m.id);
    else speak(t('is')(m), btn, 'is_' + m.id);
  }
  function celebrateSay(btn) {
    if (state.settings.level < MAX_LEVEL) speak(t('levelUpSay'), btn, 'level_up');
    else speak(t('celebrateSay'), btn, 'celebrate');
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
    setTimeout(function () { if (state.celebrating) celebrateSay($('speakCelebrate')); }, 400);
    (state.settings.level < MAX_LEVEL ? el.nextLevel : el.playAgain).focus({ preventScroll: true });
  }
  // Celebration → "Next level" (or "Repeat this level" = closeCelebration).
  function nextLevel() {
    state.celebrating = false;
    state.stars = 0; persistStars();
    state.settings.level = Math.min(MAX_LEVEL, state.settings.level + 1);
    state.settings = cleanSettings(state.settings);
    persistSettings();
    emit('level', state.settings.level);
    newRound({ say: true });
    var first = el.answers.querySelector('.answer');
    if (first) first.focus({ preventScroll: true });
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
    if (key === 'count') { key = 'level'; value = Math.max(1, Math.min(3, Number(value) - 1)); } // old API: 2/3/4 faces
    if (key === 'level' && Number(value) !== state.settings.level) { state.stars = 0; persistStars(); }
    state.settings[key] = value;
    state.settings = cleanSettings(state.settings);
    persistSettings();
    if (key === 'sound' && !value) stopSpeech();
    emit('setting', { key: key, value: value });
    if (key === 'level' || key === 'emotions') newRound(); else render();
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
    var isSit = !!(r && r.kind === 'sit'), lv = s.level;
    el.faceBtn.setAttribute('aria-label', isSit ? t('sceneBtn') : t('faceBtn'));
    el.levelNum.textContent = t('levelLabel')(lv);
    el.levelMode.textContent = t('kind_' + LEVELS[lv].kind);
    el.promptText.textContent = isSit ? t('sitSay')(SIT[r.sit]) : t('question');
    el.promptText.classList.toggle('sit', isSit);
    el.faceHint.textContent = isSit ? t('sceneHint') : t('faceHint');

    if (r) {
      // Face or scene (redrawn only when the round changes; a scene also when it is answered)
      var fk = r.n + ':' + r.emotion + ':' + r.skin + ':' + r.hair + ':' + r.style + (isSit ? ':' + r.sit + ':' + !!a : '');
      if (drawn.faceKey !== fk) { el.face.innerHTML = isSit ? sceneSVG(r, !!a) : faceSVG(r); drawn.faceKey = fk; }
      el.faceWrap.classList.toggle('scene', isSit);
      el.faceWrap.classList.toggle('glow', !!(a && a.correct));
      el.faceWrap.dataset.emotion = r.emotion;
      if (isSit) el.faceWrap.dataset.sit = r.sit; else delete el.faceWrap.dataset.sit;

      // Answer buttons (rebuilt only when round or language changes; classes always updated)
      var ak = r.n + ':' + L + ':' + r.kind + ':' + r.options.join(',');
      if (drawn.answersKey !== ak) {
        el.answers.innerHTML = '';
        el.answers.dataset.count = String(r.options.length);
        el.answers.classList.toggle('sit', isSit);
        r.options.forEach(function (id, idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer';
          b.dataset.id = id;
          b.setAttribute('aria-keyshortcuts', String(idx + 1));
          b.innerHTML = '<span class="answer-num" aria-hidden="true"></span><span class="answer-icon" aria-hidden="true"></span><span class="answer-label"></span><span class="answer-mark" aria-hidden="true"></span>';
          b.children[0].textContent = L === 'fa' ? toFaDigits(idx + 1) : String(idx + 1);
          if (isSit) { // a small cartoon face showing the feeling
            b.children[1].className = 'answer-icon answer-face';
            b.children[1].innerHTML = faceSVG({ emotion: id, skin: r.skin, hair: r.hair, style: r.style });
          } else b.children[1].textContent = EMO[id].e;
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
        el.feedbackText.textContent = isSit ? (a.correct ? t('sitYes')(SIT[r.sit]) : t('sitIs')(SIT[r.sit]))
                                            : (a.correct ? t('yes')(m) : t('is')(m));
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
    var more = lv < MAX_LEVEL;
    el.levelUpText.textContent = more ? t('levelUp') + ' ' + t('levelLabel')(lv + 1) + ' · ' + t('kind_' + LEVELS[lv + 1].kind) : t('allDone');
    el.nextLevel.hidden = !more;
    el.nextLevelText.textContent = t('nextLevel');
    el.playAgainText.textContent = more ? t('repeatLevel') : t('playAgain');
    el.playAgain.classList.toggle('primary', !more);
    if (state.celebrating) el.main.setAttribute('aria-hidden', 'true'); else el.main.removeAttribute('aria-hidden');

    renderSettings();
    updateVoiceStatus();
  }

  function renderSettings() {
    var s = state.settings, L = state.lang;
    el.sound.checked = !!s.sound;
    el.motion.checked = !!s.motion;
    el.errorless.checked = !!s.errorless;
    el.form.querySelectorAll('input[name="level"]').forEach(function (r) { r.checked = Number(r.value) === s.level; });
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
  $('speakPrompt').addEventListener('click', function () { sayRound(this, false); });
  el.faceBtn.addEventListener('click', function () {
    if (!state.round) return;
    if (state.round.kind === 'sit') { sayRound(el.faceBtn, false); emit('sceneTap', state.round.sit); return; }
    var id = state.round.emotion;
    speak(emoName(id), el.faceBtn, 'name_' + id);
    emit('faceTap', id);
  });
  $('speakFeedback').addEventListener('click', function () {
    sayFeedback(this);
  });
  $('speakCelebrate').addEventListener('click', function () { celebrateSay(this); });
  el.nextLevel.addEventListener('click', nextLevel);
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
    if (tg.name === 'level') setSetting('level', Number(tg.value));
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
    if (state.celebrating) { if (e.key === 'Escape') closeCelebration(); return; } // Escape = repeat this level
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
               closeCelebration: closeCelebration, nextLevel: nextLevel, resetStars: resetStars, setSetting: setSetting },
    faceSVG: faceSVG, // draw any face: faceSVG({ emotion, skin, hair, style })
    LEVELS: LEVELS.slice(1),
    SITUATIONS: SITUATIONS.map(function (x) { return { id: x.id, emo: x.emo, avoid: x.avoid.slice(), fa: x.fa, en: x.en }; }),
    getMissed: function () { return JSON.parse(JSON.stringify(missed)); },
    sceneSVG: function (r, answered) { return sceneSVG(r, answered); }, // r = { sit, skin, hair, style, shirt }
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
