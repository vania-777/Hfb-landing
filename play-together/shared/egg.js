/* HFB Surprise Egg: a shared reward for the Play Together games.
   After every 5 stars a big egg wobbles, cracks and opens, and a random surprise comes out
   (a car that drives off, a dinosaur that roars, a duck that waddles...), with a sound made
   in the browser (Web Audio) and an excited line read aloud in Persian or English.

   - No images or sound files: SVG + CSS for the egg, emoji for the surprises, Web Audio for sounds.
     The read-aloud lines are recorded clips that each game ships as audio/<lang>/egg_<id>.mp3,
     played through the game's own speak() (so iPhone audio unlocking keeps working).
   - Calm: soft colours, no flashing. With motion off (game setting or reduced motion), the egg simply opens.
   - Tap (or Enter / Space) to continue; Escape closes it.
   - Random order: every surprise appears once before any repeats, and never twice in a row
     (localStorage "hfb-egg-bag").
   - On/off: localStorage "hfb-egg" ("off" = turned off), shared by every game.

   API (window.HFBEgg):
     show({ lang, sound, motion, speak(text, key), onClose }) -> the surprise shown
     enabled() / setEnabled(bool) / isOpen() / close() / SURPRISES / lastId */
(function () {
  'use strict';
  var KEY_ON = 'hfb-egg', KEY_BAG = 'hfb-egg-bag';

  var SURPRISES = [
    { id: 'car',       emoji: '🚗', anim: 'drive',   fa: 'بروم بروم! یه ماشین کوچولو!', en: 'Vroom vroom! A little car!' },
    { id: 'dinosaur',  emoji: '🦖', anim: 'stomp',   fa: 'واااو! یه دایناسور!',          en: 'Roar! Wow, a dinosaur!' },
    { id: 'duck',      emoji: '🦆', anim: 'waddle',  fa: 'کواک کواک! یه اردک!',          en: 'Quack quack! A duck!' },
    { id: 'puppy',     emoji: '🐶', anim: 'hop',     fa: 'هاپ هاپ! یه توله‌سگ!',          en: 'Woof woof! A puppy!' },
    { id: 'rocket',    emoji: '🚀', anim: 'launch',  fa: 'ووووش! یه موشک!',              en: 'Whoosh! A rocket!' },
    { id: 'butterfly', emoji: '🦋', anim: 'flutter', fa: 'واای! یه پروانهٔ قشنگ!',        en: 'Wow! A butterfly!' },
    { id: 'frog',      emoji: '🐸', anim: 'hop',     fa: 'قور قور! یه قورباغه!',          en: 'Ribbit ribbit! A frog!' },
    { id: 'train',     emoji: '🚂', anim: 'drive',   fa: 'چوچو! یه قطار!',               en: 'Choo choo! A train!' },
    { id: 'kitten',    emoji: '🐱', anim: 'sway',    fa: 'میو میو! یه پیشی کوچولو!',      en: 'Meow! A kitten!' },
    { id: 'chick',     emoji: '🐥', anim: 'hop',     fa: 'جیک جیک! یه جوجه!',            en: 'Peep peep! A baby chick!' },
    { id: 'fish',      emoji: '🐠', anim: 'swim',    fa: 'قل قل! یه ماهی!',              en: 'Blub blub! A fish!' },
    { id: 'unicorn',   emoji: '🦄', anim: 'twirl',   fa: 'تا دا! یه اسب تک‌شاخ!',         en: 'Ta-da! A unicorn!' }
  ];
  var BY_ID = {}; SURPRISES.forEach(function (s) { BY_ID[s.id] = s; });
  var TEXT = {
    fa: { title: 'سورپرایز!', cont: 'ادامه', aria: 'تخم‌مرغ سورپرایز', tapHint: 'ببین چی توشه!' },
    en: { title: 'Surprise!', cont: 'Continue', aria: 'Surprise egg', tapHint: 'What’s inside?' }
  };

  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function enabled() { return load(KEY_ON) !== 'off'; }
  function setEnabled(on) { save(KEY_ON, on ? 'on' : 'off'); }

  function rnd() {
    try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); }
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Shuffle bag: every surprise once before repeats; the first of a new bag is never the last one shown.
  function pick() {
    var mem = {};
    try { mem = JSON.parse(load(KEY_BAG) || '{}') || {}; } catch (e) { mem = {}; }
    var bag = (mem.bag || []).filter(function (id) { return BY_ID[id]; });
    if (!bag.length) {
      bag = shuffle(SURPRISES.map(function (s) { return s.id; }));
      if (bag[0] === mem.last) bag.push(bag.shift());
    }
    var id = bag.shift();
    if (id === mem.last && bag.length) { bag.push(id); id = bag.shift(); }
    save(KEY_BAG, JSON.stringify({ bag: bag, last: id }));
    return BY_ID[id];
  }

  /* ---------- Sounds (Web Audio, synthesized, soft) ---------- */
  var ctx = null;
  function ac() {
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }
  // Unlock on the first touch/click/key (iPhone needs a gesture before any sound).
  function unlock() { var c = ac(); if (c) { var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); try { s.start(0); } catch (e) {} } }
  ['pointerdown', 'touchend', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { once: true, passive: true, capture: true }); });

  var MASTER = 0.5;
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak * MASTER, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tone(c, o) { // o: {type,f,f2,t,a,d,v,filter,q,vib}
    var t = c.currentTime + (o.t || 0), osc = c.createOscillator(), g = c.createGain(), last = g;
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || (o.a || .01) + (o.d || .2)));
    if (o.f3) osc.frequency.exponentialRampToValueAtTime(o.f3, t + (o.a || .01) + (o.d || .2));
    if (o.vib) { var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + (o.a || .01) + (o.d || .2) + .05); }
    var node = osc;
    if (o.filter) { var f = c.createBiquadFilter(); f.type = o.filter; f.frequency.value = o.ff || 1000; f.Q.value = o.q || 1; osc.connect(f); node = f; }
    if (o.am) { var amg = c.createGain(), lfo = c.createOscillator(), lfg = c.createGain(); amg.gain.value = .5; lfo.frequency.value = o.am; lfg.gain.value = .5; lfo.connect(lfg); lfg.connect(amg.gain); node.connect(amg); node = amg; lfo.start(t); lfo.stop(t + (o.a || .01) + (o.d || .2) + .05); }
    node.connect(g); g.connect(c.destination);
    env(g, t, o.a || .01, o.v || .2, o.d || .2);
    osc.start(t); osc.stop(t + (o.a || .01) + (o.d || .2) + .05);
    return last;
  }
  function noise(c, o) { // o: {t,d,v,type,f,f2,q}
    var t = c.currentTime + (o.t || 0), len = Math.max(1, Math.floor(c.sampleRate * (o.d + .05)));
    var buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1500, t); f.Q.value = o.q || 1;
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.d);
    s.connect(f); f.connect(g); g.connect(c.destination);
    env(g, t, o.a || .005, o.v || .2, o.d);
    s.start(t); s.stop(t + o.d + .05);
  }
  var SFX = {
    crack: function (c, t) { noise(c, { t: t, d: .05, v: .35, f: 2600, q: 2 }); noise(c, { t: t + .07, d: .04, v: .25, f: 3200, q: 2 }); },
    open: function (c) { tone(c, { f: 520, f2: 260, d: .18, v: .25 }); noise(c, { t: .02, d: .12, v: .15, f: 1800, q: .8 }); },
    tada: function (c) { tone(c, { f: 784, t: 0, d: .25, v: .12, type: 'triangle' }); tone(c, { f: 1047, t: .14, d: .5, v: .14, type: 'triangle' }); },
    car: function (c) { tone(c, { type: 'sawtooth', f: 70, f2: 190, glide: .55, d: 1.0, a: .08, v: .16, filter: 'lowpass', ff: 700, vib: [9, 6] }); tone(c, { type: 'square', f: 523, t: 1.15, d: .09, v: .07 }); tone(c, { type: 'square', f: 523, t: 1.32, d: .12, v: .07 }); },
    dinosaur: function (c) { tone(c, { type: 'sawtooth', f: 150, f2: 85, d: .9, a: .12, v: .18, filter: 'lowpass', ff: 650, q: 4, vib: [22, 9] }); noise(c, { d: .9, a: .15, v: .08, f: 500, f2: 250, q: 1.5 }); },
    duck: function (c) { [0, .24].forEach(function (t) { tone(c, { type: 'sawtooth', f: 340, f2: 240, t: t, d: .15, v: .14, filter: 'bandpass', ff: 1250, q: 3 }); }); },
    puppy: function (c) { [0, .26].forEach(function (t) { tone(c, { type: 'triangle', f: 420, f2: 190, t: t, d: .12, v: .2, filter: 'lowpass', ff: 1400 }); noise(c, { t: t, d: .07, v: .08, f: 900, q: 1 }); }); },
    rocket: function (c) { noise(c, { d: 1.3, a: .25, v: .2, f: 250, f2: 3200, q: 1.2 }); tone(c, { type: 'sine', f: 220, f2: 880, d: 1.1, a: .2, v: .06 }); },
    butterfly: function (c) { [1319, 1568, 1976, 2349, 1976].forEach(function (f, i) { tone(c, { f: f, t: i * .11, d: .35, v: .07 }); }); },
    frog: function (c) { [0, .3].forEach(function (t) { tone(c, { type: 'square', f: 190, f2: 160, t: t, d: .2, v: .1, am: 32, filter: 'lowpass', ff: 900 }); }); },
    train: function (c) { tone(c, { f: 660, d: .6, a: .06, v: .08, vib: [6, 6] }); tone(c, { f: 880, d: .6, a: .06, v: .06, vib: [6, 8] }); [.75, .95, 1.15, 1.35].forEach(function (t) { noise(c, { t: t, d: .1, v: .12, f: 700, q: 1 }); }); },
    kitten: function (c) { tone(c, { type: 'triangle', f: 560, f2: 900, f3: 520, d: .6, a: .05, v: .12, filter: 'bandpass', ff: 1100, q: 1.5 }); },
    chick: function (c) { [0, .17, .34].forEach(function (t) { tone(c, { f: 2400, f2: 3100, t: t, d: .09, v: .08 }); }); },
    fish: function (c) { [0, .12, .26, .37, .52, .66].forEach(function (t, i) { tone(c, { f: 380 + i * 70, f2: 800 + i * 90, t: t, d: .08, v: .1 }); }); },
    unicorn: function (c) { [1047, 1319, 1568, 2093, 2637].forEach(function (f, i) { tone(c, { f: f, t: i * .09, d: .5, v: .07, type: 'triangle' }); }); }
  };
  function sfx(name, delay) {
    var c = ac(); if (!c || !SFX[name]) return;
    if (delay) setTimeout(function () { var c2 = ac(); if (c2) SFX[name](c2, 0); }, delay * 1000);
    else SFX[name](c, 0);
  }

  /* ---------- Styles (injected once) ---------- */
  var CSS = [
    '.hfb-egg{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:16px;font-family:inherit}',
    '.hfb-egg[hidden]{display:none}',
    '.hfb-egg-backdrop{position:absolute;inset:0;background:rgba(6,9,30,.78)}',
    '.hfb-egg-card{position:relative;width:min(92vw,440px);max-height:96dvh;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 18px 22px;border-radius:28px;',
    'background:radial-gradient(420px 300px at 50% 30%,rgba(143,211,255,.22),transparent 70%),linear-gradient(160deg,#18214d,#211a4f);border:1px solid rgba(160,175,255,.35);color:#eef1ff;box-shadow:0 20px 50px rgba(0,0,0,.45);text-align:center;cursor:pointer}',
    '.hfb-egg-title{margin:0;font-size:1.15rem;font-weight:700;letter-spacing:.04em;color:#c9a8ff}',
    '.hfb-egg-stage{position:relative;width:min(70vw,260px);aspect-ratio:200/250;max-height:44dvh;overflow:visible}',
    '.hfb-egg-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block}',
    '.hfb-egg-glow{position:absolute;inset:-12%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,236,170,.55),rgba(201,168,255,.25) 55%,transparent 75%);opacity:0;transition:opacity .8s ease}',
    '.hfb-egg.revealed .hfb-egg-glow{opacity:1}',
    '.hfb-egg-prize{position:absolute;left:0;right:0;top:18%;display:grid;place-items:center;opacity:0;transform:scale(.25)}',
    '.hfb-egg-emoji{display:block;font-size:min(30vw,128px);line-height:1;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))}',
    '.hfb-egg.revealed .hfb-egg-prize{opacity:1;transform:none}',
    '.hfb-egg-line{margin:4px 0 0;min-height:2.4em;font-size:clamp(1.35rem,6vw,1.75rem);font-weight:800;line-height:1.3}',
    '.hfb-egg-line:lang(fa){line-height:1.6}',
    '.hfb-egg-btn{margin-top:6px;min-height:56px;min-width:180px;padding:.7rem 1.6rem;border-radius:999px;border:0;font:inherit;font-weight:700;font-size:1.15rem;color:#fff;background:linear-gradient(135deg,#2360d6,#6a34cf);cursor:pointer;visibility:hidden}',
    '.hfb-egg.revealed .hfb-egg-btn{visibility:visible}',
    '.hfb-egg-btn:focus-visible{outline:3px solid #ffd98a;outline-offset:3px}',
    '.egg-crack{fill:none;stroke:#7a5aa8;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:260;stroke-dashoffset:260}',
    '.hfb-egg.crack1 .egg-crack.c1,.hfb-egg.crack2 .egg-crack{stroke-dashoffset:0}',
    '.hfb-egg-card:focus{outline:none}',
    /* closed: one whole egg (no seam); on open it is swapped for the two halves, which fly apart and fade */
    '.egg-top,.egg-bottom{visibility:hidden}',
    '.hfb-egg.open .egg-full{visibility:hidden}',
    '.hfb-egg.open .egg-top,.hfb-egg.open .egg-bottom{visibility:visible}',
    '.hfb-egg.open .egg-top,.hfb-egg.open .egg-bottom,.hfb-egg.open .egg-crack,.hfb-egg.open .egg-shadow{opacity:0}',
    '.hfb-egg.motion .egg-shadow{transition:opacity .6s ease .3s}',
    '.hfb-egg-spark{position:absolute;left:50%;top:45%;width:12px;height:12px;margin:-6px;color:#ffe9a8;font-size:16px;line-height:12px;opacity:0;pointer-events:none}',
    /* motion */
    '.hfb-egg.motion .egg-whole{transform-origin:100px 230px}',
    '.hfb-egg.motion.wobble .egg-whole{animation:hfbEggWobble 1.1s ease-in-out 2}',
    '.hfb-egg.motion .egg-crack{transition:stroke-dashoffset .35s ease-out}',
    '.hfb-egg.motion .egg-top{transform-box:view-box;transform-origin:60px 120px;transition:transform .8s cubic-bezier(.3,.7,.4,1),opacity .6s ease .25s}',
    '.hfb-egg.motion .egg-bottom{transition:transform .8s ease-in .1s,opacity .6s ease .35s}',
    '.hfb-egg.motion .egg-crack{transition:stroke-dashoffset .35s ease-out,opacity .3s}',
    '.hfb-egg.motion.open .egg-top{transform:translate(-34px,-80px) rotate(-38deg)}',
    '.hfb-egg.motion.open .egg-bottom{transform:translateY(46px)}',
    '.hfb-egg.motion .hfb-egg-prize{transition:opacity .25s ease}',
    '.hfb-egg.motion.revealed .hfb-egg-prize{animation:hfbEggPop .7s cubic-bezier(.3,1.5,.5,1) both}',
    '.hfb-egg.motion.revealed .hfb-egg-spark{animation:hfbEggSpark 1.3s ease-out both}',
    '.hfb-egg.motion.revealed .hfb-egg-emoji{animation-duration:1.8s;animation-iteration-count:2;animation-timing-function:ease-in-out;animation-delay:.7s;animation-fill-mode:both}',
    '.hfb-egg.motion .a-drive{animation-name:hfbEggDrive}',
    '.hfb-egg.motion .a-stomp{animation-name:hfbEggStomp}',
    '.hfb-egg.motion .a-waddle{animation-name:hfbEggWaddle}',
    '.hfb-egg.motion .a-hop{animation-name:hfbEggHop}',
    '.hfb-egg.motion .a-launch{animation-name:hfbEggLaunch}',
    '.hfb-egg.motion .a-flutter{animation-name:hfbEggFlutter}',
    '.hfb-egg.motion .a-sway{animation-name:hfbEggSway}',
    '.hfb-egg.motion .a-swim{animation-name:hfbEggSwim}',
    '.hfb-egg.motion .a-twirl{animation-name:hfbEggTwirl}',
    '@keyframes hfbEggWobble{0%,100%{transform:rotate(0)}15%{transform:rotate(-6deg)}35%{transform:rotate(6deg)}55%{transform:rotate(-9deg)}75%{transform:rotate(8deg)}90%{transform:rotate(-3deg)}}',
    '@keyframes hfbEggPop{0%{opacity:0;transform:translateY(30px) scale(.25)}60%{opacity:1;transform:translateY(-8px) scale(1.12)}100%{opacity:1;transform:none}}',
    '@keyframes hfbEggSpark{0%{opacity:0;transform:translate(0,0) scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(1)}}',
    '@keyframes hfbEggDrive{0%,100%{transform:translateX(0)}40%{transform:translateX(-140%)}40.01%{transform:translateX(140%)}80%{transform:translateX(0)}88%{transform:translateY(-6px)}}',
    '@keyframes hfbEggStomp{0%,100%{transform:scale(1)}20%{transform:scale(1.14) rotate(-4deg)}30%{transform:scale(1.14) rotate(4deg)}40%{transform:scale(1.14) rotate(-3deg)}55%{transform:scale(1) translateY(0)}70%{transform:translateY(-14px)}80%{transform:translateY(0)}}',
    '@keyframes hfbEggWaddle{0%,100%{transform:translateX(0) rotate(0)}20%{transform:translateX(-24px) rotate(-10deg)}40%{transform:translateX(0) rotate(8deg)}60%{transform:translateX(24px) rotate(-8deg)}80%{transform:translateX(0) rotate(10deg)}}',
    '@keyframes hfbEggHop{0%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.1,.88)}30%{transform:translateY(-46px) scale(.95,1.06)}50%{transform:translateY(0) scale(1.08,.9)}60%{transform:translateY(0) scale(1)}75%{transform:translateY(-22px)}90%{transform:translateY(0)}}',
    '@keyframes hfbEggLaunch{0%,100%{transform:translate(0,0)}10%{transform:translate(0,6px)}45%{transform:translate(90px,-220px);opacity:1}46%{opacity:0;transform:translate(-90px,220px)}47%{opacity:1}85%{transform:translate(0,0)}}',
    '@keyframes hfbEggFlutter{0%,100%{transform:translate(0,0) scaleX(1)}12%{transform:translate(-40px,-24px) scaleX(.6)}25%{transform:translate(-60px,6px) scaleX(1)}37%{transform:translate(-20px,-30px) scaleX(.6)}50%{transform:translate(30px,-10px) scaleX(1)}62%{transform:translate(60px,-34px) scaleX(.6)}75%{transform:translate(36px,8px) scaleX(1)}87%{transform:translate(10px,-16px) scaleX(.6)}}',
    '@keyframes hfbEggSway{0%,100%{transform:rotate(0) scale(1)}25%{transform:rotate(-8deg) scale(1.05)}50%{transform:rotate(0) scale(1)}75%{transform:rotate(8deg) scale(1.05)}}',
    '@keyframes hfbEggSwim{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-50px,-12px) rotate(-8deg)}50%{transform:translate(0,6px) rotate(0)}75%{transform:translate(50px,-12px) rotate(8deg)}}',
    '@keyframes hfbEggTwirl{0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-24px) rotate(-12deg)}60%{transform:translateY(0) rotate(12deg)}80%{transform:translateY(-10px) rotate(0)}}',
    '@media (prefers-reduced-motion: reduce){.hfb-egg *{animation:none!important;transition:none!important}}'
  ].join('\n');
  function injectCss() {
    if (document.getElementById('hfbEggCss')) return;
    var s = document.createElement('style'); s.id = 'hfbEggCss'; s.textContent = CSS; document.head.appendChild(s);
  }

  // Egg: cream with soft brand-colour dots and a zigzag band. The crack line splits it into two halves.
  var CRACK = '20,128 40,112 58,130 76,110 94,132 112,110 130,130 148,112 166,130 180,126';
  var EGG_PATH = 'M100 18C150 18 182 108 182 150C182 202 146 234 100 234C54 234 18 202 18 150C18 108 50 18 100 18Z';
  function eggArt() {
    var deco = '<path d="' + EGG_PATH + '" fill="url(#hfbEggFill)" stroke="#b9a6e8" stroke-width="2.5"/>' +
      '<path d="M22 170 L40 158 L58 172 L76 158 L94 172 L112 158 L130 172 L148 158 L166 172 L180 162" fill="none" stroke="#8fd3ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>' +
      '<circle cx="70" cy="70" r="9" fill="#c9a8ff" opacity=".8"/><circle cx="128" cy="62" r="7" fill="#9ff3d6" opacity=".85"/>' +
      '<circle cx="104" cy="96" r="6" fill="#ffd6a8" opacity=".9"/><circle cx="52" cy="112" r="6" fill="#8fd3ff" opacity=".8"/>' +
      '<circle cx="150" cy="104" r="8" fill="#ffd6a8" opacity=".85"/><circle cx="70" cy="205" r="8" fill="#c9a8ff" opacity=".75"/>' +
      '<circle cx="132" cy="206" r="9" fill="#9ff3d6" opacity=".8"/><circle cx="100" cy="190" r="5" fill="#8fd3ff" opacity=".8"/>' +
      '<ellipse cx="70" cy="60" rx="14" ry="26" fill="#fff" opacity=".35" transform="rotate(24 70 60)"/>';
    var topPoly = '0,0 200,0 200,126 ' + CRACK.split(' ').reverse().join(' ') + ' 0,128';
    var botPoly = '0,128 ' + CRACK + ' 200,126 200,250 0,250';
    return '<svg class="hfb-egg-svg" viewBox="0 0 200 250" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="hfbEggFill" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f6f0ff"/><stop offset="1" stop-color="#ddd3fb"/></radialGradient>' +
      '<clipPath id="hfbEggTop"><polygon points="' + topPoly + '"/></clipPath><clipPath id="hfbEggBot"><polygon points="' + botPoly + '"/></clipPath></defs>' +
      '<ellipse cx="100" cy="238" rx="62" ry="8" fill="#000" opacity=".25" class="egg-shadow"/>' +
      '<g class="egg-whole"><g class="egg-full">' + deco + '</g>' +
      '<g class="egg-bottom"><g clip-path="url(#hfbEggBot)">' + deco + '</g></g>' +
      '<g class="egg-top"><g clip-path="url(#hfbEggTop)">' + deco + '</g></g>' +
      '<polyline class="egg-crack c1" points="20,128 40,112 58,130 76,110 94,132"/>' +
      '<polyline class="egg-crack c2" points="' + CRACK + '"/></g></svg>';
  }

  var root = null, timers = [], cur = null, opts = null, phase = 'closed', prevFocus = null;
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function reducedMotion() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function build() {
    injectCss();
    root = document.createElement('div');
    root.className = 'hfb-egg'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'hfbEggLine');
    var sparks = '';
    [[-110, -60], [110, -70], [-90, 60], [100, 50], [0, -120], [-30, 100], [40, -100], [-120, 0]].forEach(function (p, i) {
      sparks += '<span class="hfb-egg-spark" style="--sx:' + p[0] + 'px;--sy:' + p[1] + 'px;animation-delay:' + (i * 40) + 'ms">✦</span>';
    });
    root.innerHTML = '<div class="hfb-egg-backdrop"></div><div class="hfb-egg-card">' +
      '<p class="hfb-egg-title"></p><div class="hfb-egg-stage"><div class="hfb-egg-glow"></div>' + eggArt() +
      '<div class="hfb-egg-prize"><span class="hfb-egg-emoji" aria-hidden="true"></span></div>' + sparks + '</div>' +
      '<p class="hfb-egg-line" id="hfbEggLine" aria-live="polite"></p>' +
      '<button type="button" class="hfb-egg-btn"></button></div>';
    document.body.appendChild(root);
    root.addEventListener('click', function (e) { e.preventDefault(); advance(); });
    root.addEventListener('keydown', function (e) {
      e.stopPropagation(); // the game behind must not react (e.g. keys 1-4 pick a card)
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
      else if (e.key === 'Tab') { e.preventDefault(); root.querySelector('.hfb-egg-btn').focus(); }
    });
  }

  function reveal() {
    if (phase !== 'egg') return;
    phase = 'revealed'; clearTimers();
    var lang = opts.lang === 'en' ? 'en' : 'fa';
    root.classList.add('crack1', 'crack2', 'open');
    root.classList.remove('wobble');
    later(function () {
      root.classList.add('revealed');
      root.querySelector('.hfb-egg-line').textContent = cur[lang];
      root.querySelector('.hfb-egg-btn').focus({ preventScroll: true });
    }, root.classList.contains('motion') ? 150 : 0);
    if (opts.sound) {
      sfx('open'); sfx('tada', .15); sfx(cur.id, .55);
      later(function () { if (phase === 'revealed' && opts.speak) opts.speak(cur[lang], 'egg_' + cur.id); }, 1700);
    }
  }
  function advance() { if (phase === 'egg') reveal(); else if (phase === 'revealed') close(); }

  function show(o) {
    o = o || {};
    if (!root) build();
    if (phase !== 'closed') close(true);
    opts = o; cur = pick(); api.lastId = cur.id;
    var lang = o.lang === 'en' ? 'en' : 'fa', T = TEXT[lang];
    var motion = o.motion !== false && !reducedMotion();
    root.setAttribute('lang', lang); root.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    root.setAttribute('aria-label', T.aria); root.removeAttribute('aria-labelledby');
    root.className = 'hfb-egg' + (motion ? ' motion' : '');
    root.setAttribute('data-surprise', cur.id);
    root.querySelector('.hfb-egg-title').textContent = T.title;
    root.querySelector('.hfb-egg-line').textContent = T.tapHint;
    root.querySelector('.hfb-egg-btn').textContent = T.cont;
    var em = root.querySelector('.hfb-egg-emoji'); em.textContent = cur.emoji; em.className = 'hfb-egg-emoji a-' + cur.anim;
    prevFocus = document.activeElement;
    root.hidden = false; phase = 'egg';
    root.querySelector('.hfb-egg-card').setAttribute('tabindex', '-1');
    root.querySelector('.hfb-egg-card').focus({ preventScroll: true });
    if (motion) {
      root.classList.add('wobble');
      later(function () { root.classList.add('crack1'); if (opts.sound) sfx('crack'); }, 1000);
      later(function () { root.classList.add('crack2'); if (opts.sound) sfx('crack'); }, 1800);
      later(reveal, 2350);
    } else {
      later(reveal, 700);
    }
    return cur;
  }
  function close(silent) {
    if (!root || phase === 'closed') return;
    clearTimers(); phase = 'closed'; root.hidden = true;
    var cb = opts && opts.onClose; opts = null;
    if (prevFocus && prevFocus.focus && document.contains(prevFocus)) { try { prevFocus.focus({ preventScroll: true }); } catch (e) {} }
    if (!silent && cb) cb();
  }

  var api = window.HFBEgg = {
    show: show, close: function () { close(); }, enabled: enabled, setEnabled: setEnabled,
    isOpen: function () { return phase !== 'closed'; }, phase: function () { return phase; },
    SURPRISES: SURPRISES, lastId: null
  };
})();
