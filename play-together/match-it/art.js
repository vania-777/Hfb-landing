/* Match It — artwork, success animations and sound effects for each pair.
   Everything is drawn as inline SVG (no images). Each target scene contains the hidden parts of its
   own animation (class "a-…"); styles.css animates them when the target gets the class "play",
   and shows their final state with the class "done" (so reduced motion still shows the result).
   Sound effects are synthesized with Web Audio (no audio files, nothing copyrighted). */
(function () {
  'use strict';
  var INK = '#2b2440';
  function svg(vb, inner, cls) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + inner + '</svg>';
  }
  var S = 'stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  function sparkles() { // shared success sparkles around the target
    var pts = [[52, 58, 1], [186, 50, .8], [200, 150, 1.1], [40, 160, .7], [120, 26, .9], [150, 200, .7]];
    return '<g class="a-sparks">' + pts.map(function (p, i) {
      var x = p[0], y = p[1], r = 12 * p[2];
      return '<path class="a-spark" style="animation-delay:calc(var(--spark, 1.6s) + ' + (i * 70) + 'ms)" d="M' + x + ',' + (y - r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + r) + ' Q' + x + ',' + y + ' ' + (x - r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - r) + 'Z" fill="#ffd166"/>';
    }).join('') + '</g>';
  }

  /* ---------- Item drawings (cards, viewBox 0 0 100 100) ---------- */
  var JUG = function (dx, dy, s) {
    return '<g transform="translate(' + dx + ',' + dy + ') scale(' + s + ')">' +
      '<path d="M72,40 q18,4 16,22 q-2,14 -14,16" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M72,40 q18,4 16,22 q-2,14 -14,16" fill="none" stroke="#dff1ff" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M26,28 L74,28 L78,88 Q50,96 22,88Z" fill="#e8f5ff" ' + S + '/>' +
      '<path d="M25,50 L75,50 L77.5,86 Q50,93 22.5,86Z" fill="#5bb8ff"/>' +
      '<path d="M26,28 L12,20 L28,38" fill="#e8f5ff" ' + S + '/>' +
      '<path d="M30,58 l0,18" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>';
  };
  var KEY = function (x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<path d="M0,-5 L46,-5 L46,5 L40,5 L40,14 L33,14 L33,5 L26,5 L26,12 L20,12 L20,5 L0,5Z" fill="#ffcf4d" ' + S + '/>' +
      '<circle cx="62" cy="0" r="18" fill="#ffcf4d" ' + S + '/><circle cx="66" cy="0" r="6" fill="#fff6d6" ' + S + '/></g>';
  };
  var LETTER = function (x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#ffffff" ' + S + '/>' +
      '<path d="M' + (x + 10) + ',' + (y + 14) + ' h' + (w - 20) + ' M' + (x + 10) + ',' + (y + 26) + ' h' + (w - 20) + ' M' + (x + 10) + ',' + (y + 38) + ' h' + (w - 34) + '" stroke="#9fb4d8" stroke-width="3" stroke-linecap="round"/>' +
      heart(x + w - 16, y + h - 16, 6);
  };
  function heart(x, y, r, c) {
    return '<path d="M' + x + ',' + (y + r) + ' C' + (x - 2 * r) + ',' + (y - 0.2 * r) + ' ' + (x - r) + ',' + (y - 1.6 * r) + ' ' + x + ',' + (y - 0.6 * r) +
      ' C' + (x + r) + ',' + (y - 1.6 * r) + ' ' + (x + 2 * r) + ',' + (y - 0.2 * r) + ' ' + x + ',' + (y + r) + 'Z" fill="' + (c || '#ff6f91') + '"/>';
  }
  var SOCK_D = 'M30,10 L62,10 L62,58 L86,66 Q98,72 94,84 Q90,94 76,92 L40,86 Q28,84 29,70Z';
  var SOCK = function () {
    return '<defs><clipPath id="SOCKCLIP"><path d="' + SOCK_D + '"/></clipPath></defs>' +
      '<path d="' + SOCK_D + '" fill="#ff8fb1"/>' +
      '<g clip-path="url(#SOCKCLIP)"><rect x="20" y="10" width="80" height="10" fill="#fff"/><rect x="20" y="30" width="80" height="9" fill="#6cc5ff"/><rect x="20" y="48" width="80" height="9" fill="#ffd166"/>' +
      '<path d="M76,64 Q100,70 96,96 L70,96Z" fill="#b28dff"/></g>' +
      '<path d="' + SOCK_D + '" fill="none" ' + S + '/>';
  };
  var TUBE = function () {
    return '<path d="M22,30 L64,30 L80,44 L80,56 L64,70 L22,70Z" fill="#f4f8ff" ' + S + '/>' +
      '<rect x="12" y="28" width="12" height="44" rx="3" fill="#cfd8e6" ' + S + '/>' +
      '<rect x="80" y="43" width="10" height="14" rx="3" fill="#ff5d73" ' + S + '/>' +
      '<path d="M32,42 h26 M32,50 h20 M32,58 h24" stroke="#4f9cff" stroke-width="4" stroke-linecap="round"/>';
  };
  var PENCIL = function (x, y, s, rot) {
    return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')">' +
      '<path d="M0,0 L10,-6 L10,6Z" fill="#3a2f4a"/>' +
      '<path d="M0,0 L14,-8 L14,8Z" fill="#f3d1a2" ' + S + '/>' +
      '<rect x="14" y="-8" width="56" height="16" fill="#ffcf4d" ' + S + '/>' +
      '<rect x="70" y="-8" width="8" height="16" fill="#cfd8e6" ' + S + '/>' +
      '<rect x="78" y="-8" width="12" height="16" rx="4" fill="#ff8fb1" ' + S + '/>' +
      '<path d="M0,0 L10,-6 L10,6Z" fill="#3a2f4a"/></g>';
  };
  var BEE = function (x, y, s, wingCls) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<ellipse class="' + (wingCls || '') + '" cx="-6" cy="-18" rx="12" ry="16" fill="#e6f6ff" ' + S + ' opacity=".95"/>' +
      '<ellipse class="' + (wingCls || '') + '" cx="10" cy="-18" rx="10" ry="14" fill="#e6f6ff" ' + S + ' opacity=".95"/>' +
      '<ellipse cx="0" cy="0" rx="26" ry="18" fill="#ffcf4d" ' + S + '/>' +
      '<path d="M-8,-17 Q-12,0 -8,17 M6,-17 Q2,0 6,17" stroke="' + INK + '" stroke-width="6"/>' +
      '<path d="M-26,0 L-34,0" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="16" cy="-4" r="3" fill="' + INK + '"/><path d="M14,6 Q18,9 22,5" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/></g>';
  };
  var BONE = function (x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<path d="M-26,-6 L26,-6 A9,9 0 1 1 34,-10 A9,9 0 1 1 30,12 L26,6 L-26,6 L-30,12 A9,9 0 1 1 -34,-10 A9,9 0 1 1 -26,-6Z" fill="#fffaf0" ' + S + '/></g>';
  };
  var CAN = function (x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<path d="M66,46 L92,24" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/><path d="M66,46 L92,24" stroke="#5fcf8a" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="86" y="14" width="12" height="16" rx="3" fill="#5fcf8a" ' + S + ' transform="rotate(-40 92 22)"/>' +
      '<path d="M26,34 q-2,-22 22,-22 q24,0 22,22" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M26,34 q-2,-22 22,-22 q24,0 22,22" fill="none" stroke="#5fcf8a" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M20,34 L72,34 L68,86 L24,86Z" fill="#5fcf8a" ' + S + '/>' +
      '<path d="M30,48 l0,26" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/></g>';
  };
  var HAT = function (x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<path d="M-40,8 Q-40,-38 0,-38 Q40,-38 40,8Z" fill="#6c8dff" ' + S + '/>' +
      '<path d="M-24,-30 Q-26,-10 -24,8 M0,-38 L0,8 M24,-30 Q26,-10 24,8" stroke="#8fb0ff" stroke-width="4" fill="none"/>' +
      '<rect x="-44" y="2" width="88" height="16" rx="8" fill="#ffd166" ' + S + '/>' +
      '<circle cx="0" cy="-42" r="10" fill="#ff8fb1" ' + S + '/></g>';
  };
  var BALL = function (x, y, r) {
    return '<g transform="translate(' + x + ',' + y + ')"><circle r="' + r + '" fill="#ff9f43" ' + S + '/>' +
      '<path d="M' + (-r) + ',0 H' + r + ' M0,' + (-r) + ' V' + r + ' M' + (-r * .7) + ',' + (-r * .7) + ' Q0,0 ' + (-r * .7) + ',' + (r * .7) + ' M' + (r * .7) + ',' + (-r * .7) + ' Q0,0 ' + (r * .7) + ',' + (r * .7) + '" fill="none" stroke="' + INK + '" stroke-width="2.5"/></g>';
  };
  var BATT = function (x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<rect x="-30" y="-14" width="56" height="28" rx="5" fill="#3a3550" ' + S + '/>' +
      '<rect x="-30" y="-14" width="22" height="28" rx="5" fill="#7ed957" ' + S + '/>' +
      '<rect x="26" y="-6" width="7" height="12" rx="2" fill="#cfd8e6" ' + S + '/>' +
      '<path d="M8,-8 L2,1 L8,1 L4,9 L14,-2 L8,-2 L12,-8Z" fill="#ffd166"/>' +
      '<path d="M-24,0 h10 M-19,-5 v10" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>';
  };

  /* ---------- Pairs ---------- */
  // avoid: pairs whose ITEM could also fit this target (never shown as a distractor here).
  var PAIRS = [
    { id: 'glass', avoid: ['plant', 'flower'], ms: 2050, spark: 1.6,
      t: { fa: 'لیوان', en: 'the glass' }, i: { fa: 'آب', en: 'water' },
      yes: { fa: 'آفرین! آب می‌ره توی لیوان!', en: 'Yes! Water goes in the glass!' },
      item: function () { return JUG(0, 2, 1); },
      scene: function () {
        return '<defs><clipPath id="glassIn"><path d="M87,112 L153,112 L146,209 Q120,214 94,209Z"/></clipPath></defs>' +
          '<ellipse cx="120" cy="214" rx="46" ry="7" fill="#000" opacity=".12"/>' +
          '<g clip-path="url(#glassIn)"><g class="a-fill"><rect x="80" y="128" width="84" height="90" fill="#5bb8ff"/>' +
          '<path d="M80,128 Q100,122 120,128 T164,128 L164,136 L80,136Z" fill="#8fd0ff"/></g></g>' +
          '<path d="M84,108 L156,108 L148,212 Q120,218 92,212Z" fill="rgba(220,240,255,.28)" ' + S + '/>' +
          '<path d="M96,122 L100,196" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>' +
          '<rect class="a-stream" x="101" y="46" width="9" height="160" rx="4.5" fill="#5bb8ff"/>' +
          '<g class="a-jug"><g transform="translate(116,24) scale(-0.9,0.9)">' + JUG(0, 0, 1) + '</g></g>' +
          '<g class="a-drops"><circle cx="104" cy="122" r="4" fill="#8fd0ff"/><circle cx="132" cy="118" r="3" fill="#8fd0ff"/><circle cx="118" cy="112" r="3.5" fill="#8fd0ff"/></g>';
      },
      sfx: function (A, t) {
        A.noise(t + 0.62, 1.05, { type: 'bandpass', f0: 380, f1: 1500, q: 2.5, gain: 0.2, attack: 0.1, release: 0.25 });
        A.noise(t + 0.62, 1.05, { type: 'highpass', f0: 3500, gain: 0.025, attack: 0.1, release: 0.3 });
        A.noise(t + 0.66, 0.28, { type: 'bandpass', f0: 1900, f1: 600, q: 1, gain: 0.12 });
        for (var i = 0; i < 6; i++) A.tone(520 + i * 70 + A.rnd() * 60, t + 0.8 + i * 0.13, 0.06, 0.025, 'sine', 900 + i * 90);
      } },
    { id: 'lock', avoid: [], ms: 1750, spark: 1.25,
      t: { fa: 'قفل', en: 'the lock' }, i: { fa: 'کلید', en: 'key' },
      yes: { fa: 'آفرین! کلید می‌ره توی قفل!', en: 'Yes! The key goes in the lock!' },
      item: function () { return KEY(6, 50, 1.05); },
      scene: function () {
        return '<path class="a-shackle" d="M90,118 V84 a30,30 0 0 1 60,0 V118" fill="none" stroke="' + INK + '" stroke-width="20" stroke-linecap="round"/>' +
          '<path class="a-shackle" d="M90,118 V84 a30,30 0 0 1 60,0 V118" fill="none" stroke="#b9c3cf" stroke-width="13" stroke-linecap="round"/>' +
          '<g class="a-key">' + KEY(122, 156, 1) + '</g>' +
          '<rect x="66" y="112" width="108" height="92" rx="16" fill="#ffb84d" ' + S + '/>' +
          '<rect x="74" y="120" width="92" height="10" rx="5" fill="#ffd38a"/>' +
          '<circle cx="120" cy="150" r="10" fill="' + INK + '"/><path d="M114,152 L126,152 L123,176 L117,176Z" fill="' + INK + '"/>';
      },
      sfx: function (A, t) {
        A.noise(t + 0.15, 0.3, { type: 'bandpass', f0: 2600, q: 6, gain: 0.07 });
        A.click(t + 0.78);
        A.click(t + 0.86, 0.6);
        A.tone(170, t + 1.05, 0.18, 0.13, 'triangle', 110);
        A.noise(t + 1.05, 0.06, { type: 'lowpass', f0: 900, gain: 0.18 });
      } },
    { id: 'envelope', avoid: ['paper'], ms: 1850, spark: 1.45,
      t: { fa: 'پاکت نامه', en: 'the envelope' }, i: { fa: 'نامه', en: 'letter' },
      yes: { fa: 'آفرین! نامه می‌ره توی پاکت!', en: 'Yes! The letter goes in the envelope!' },
      item: function () { return '<g transform="rotate(-6 50 50)">' + LETTER(20, 18, 60, 66) + '</g>'; },
      scene: function () {
        return '<rect x="46" y="112" width="148" height="92" rx="8" fill="#e9b872" ' + S + '/>' +
          '<path class="a-flapOpen" d="M46,114 L120,58 L194,114Z" fill="#f2c98a" ' + S + '/>' +
          '<g class="a-letter">' + LETTER(72, 46, 96, 82) + '</g>' +
          '<path d="M46,112 L120,166 L194,112 L194,198 Q194,204 188,204 L52,204 Q46,204 46,198Z" fill="#f6d59e" ' + S + '/>' +
          '<path class="a-flapClosed" d="M46,112 L120,168 L194,112Z" fill="#f2c98a" ' + S + '/>' +
          '<g class="a-seal">' + heart(120, 160, 11, '#ff5d73') + '</g>';
      },
      sfx: function (A, t) {
        A.noise(t + 0.12, 0.55, { type: 'bandpass', f0: 2600, f1: 500, q: 1.2, gain: 0.14, attack: 0.18, release: 0.25 });
        A.tone(190, t + 1.15, 0.14, 0.1, 'sine', 120);
        A.tone(620, t + 1.42, 0.1, 0.08, 'sine', 1240);
      } },
    { id: 'foot', avoid: [], ms: 1400, spark: 0.95,
      t: { fa: 'پا', en: 'the foot' }, i: { fa: 'جوراب', en: 'sock' },
      yes: { fa: 'آفرین! جوراب رو پا می‌کنیم!', en: 'Yes! The sock goes on the foot!' },
      item: function () { return SOCK().replace(/SOCKCLIP/g, 'sockClipCard'); },
      scene: function () {
        var foot = 'M96,20 L136,20 L136,150 L176,160 Q206,166 206,188 Q206,206 186,206 L110,206 Q94,206 94,190Z';
        return '<path d="' + foot + '" fill="#f5c9a3" ' + S + '/>' +
          '<circle cx="196" cy="190" r="6" fill="#f0b98d"/><circle cx="184" cy="196" r="5" fill="#f0b98d"/>' +
          '<g class="a-sock"><g transform="translate(40,87) scale(1.735,1.31)">' + SOCK().replace(/SOCKCLIP/g, 'sockClipScene') + '</g></g>';
      },
      sfx: function (A, t) {
        A.noise(t + 0.12, 0.5, { type: 'bandpass', f0: 300, f1: 1700, q: 1.4, gain: 0.15, attack: 0.15 });
        A.tone(480, t + 0.72, 0.1, 0.08, 'sine', 900);
      } },
    { id: 'toothbrush', avoid: ['glass'], ms: 1750, spark: 1.35,
      t: { fa: 'مسواک', en: 'the toothbrush' }, i: { fa: 'خمیردندون', en: 'toothpaste' },
      yes: { fa: 'آفرین! خمیردندون می‌ره روی مسواک!', en: 'Yes! Toothpaste goes on the toothbrush!' },
      item: function () { return TUBE(); },
      scene: function () {
        var br = '';
        for (var i = 0; i < 8; i++) br += '<rect x="' + (140 + i * 8) + '" y="126" width="6" height="24" rx="2" fill="#ffffff" stroke="#9fb4d8" stroke-width="1.5"/>';
        return '<rect x="24" y="150" width="190" height="22" rx="11" fill="#6cc5ff" ' + S + '/>' +
          '<rect x="34" y="156" width="80" height="6" rx="3" fill="#b8e4ff"/>' + br +
          '<path class="a-paste" pathLength="100" d="M142,120 q6,-10 12,0 t12,0 t12,0 t12,0 t12,0" fill="none" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/>' +
          '<path class="a-paste" pathLength="100" d="M142,120 q6,-10 12,0 t12,0 t12,0 t12,0 t12,0" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>' +
          '<path class="a-paste" pathLength="100" d="M142,120 q6,-10 12,0 t12,0 t12,0 t12,0 t12,0" fill="none" stroke="#4f9cff" stroke-width="3" stroke-linecap="round"/>' +
          '<g class="a-tube"><g transform="translate(142,110) rotate(60) scale(0.8) translate(-90,-50)">' + TUBE() + '</g></g>';
      },
      sfx: function (A, t) {
        for (var i = 0; i < 3; i++) A.noise(t + 0.35 + i * 0.27, 0.3, { type: 'lowpass', f0: 650, f1: 260, gain: 0.13, attack: 0.05 });
      } },
    { id: 'paper', avoid: ['envelope'], ms: 1750, spark: 1.35,
      t: { fa: 'کاغذ', en: 'the paper' }, i: { fa: 'مداد', en: 'pencil' },
      yes: { fa: 'آفرین! با مداد روی کاغذ نقاشی می‌کشیم!', en: 'Yes! The pencil draws on the paper!' },
      item: function () { return PENCIL(10, 82, 0.95, -40); },
      scene: function () {
        return '<rect x="40" y="46" width="160" height="156" rx="6" fill="#ffffff" ' + S + ' transform="rotate(-3 120 124)"/>' +
          '<path d="M56,74 h128 M56,96 h128" stroke="#dbe6f7" stroke-width="2" transform="rotate(-3 120 124)"/>' +
          '<path class="a-line" pathLength="100" d="M60,150 Q80,110 100,150 T140,150 T180,150" fill="none" stroke="#4f7cff" stroke-width="6" stroke-linecap="round"/>' +
          '<g class="a-pencil">' + PENCIL(0, 0, 0.8, -50) + '</g>';
      },
      sfx: function (A, t) {
        for (var i = 0; i < 11; i++) A.noise(t + 0.15 + i * 0.1, 0.075, { type: 'bandpass', f0: 2400 + A.rnd() * 900, q: 2, gain: 0.07, attack: 0.01, release: 0.04 });
      } },
    { id: 'flower', avoid: ['glass', 'plant'], ms: 1850, spark: 1.45,
      t: { fa: 'گل', en: 'the flower' }, i: { fa: 'زنبور', en: 'bee' },
      yes: { fa: 'آفرین! زنبور می‌ره سراغ گل!', en: 'Yes! The bee goes to the flower!' },
      item: function () { return BEE(52, 58, 1.2); },
      scene: function () {
        var petals = '';
        for (var i = 0; i < 6; i++) {
          var a = i * Math.PI / 3;
          petals += '<circle cx="' + (120 + 26 * Math.cos(a)).toFixed(1) + '" cy="' + (104 + 26 * Math.sin(a)).toFixed(1) + '" r="20" fill="#ff8fb1" ' + S + '/>';
        }
        return '<path d="M120,120 Q114,170 120,214" fill="none" stroke="#3f9b5a" stroke-width="8" stroke-linecap="round"/>' +
          '<path d="M118,176 Q90,160 80,176 Q96,190 118,180Z" fill="#6cc070" ' + S + '/><path d="M122,192 Q150,176 160,192 Q144,206 122,196Z" fill="#6cc070" ' + S + '/>' +
          '<g class="a-petals">' + petals + '<circle cx="120" cy="104" r="17" fill="#ffd166" ' + S + '/></g>' +
          '<g class="a-pollen"><circle cx="96" cy="70" r="3" fill="#ffd166"/><circle cx="146" cy="66" r="3" fill="#ffd166"/><circle cx="152" cy="92" r="2.5" fill="#ffd166"/><circle cx="90" cy="96" r="2.5" fill="#ffd166"/></g>' +
          '<g class="a-bee">' + BEE(0, 0, 0.75, 'a-wing') + '</g>';
      },
      sfx: function (A, t) {
        A.buzz(t + 0.05, 1.3);
        A.tone(1320, t + 1.38, 0.3, 0.05, 'sine');
      } },
    { id: 'dog', avoid: ['basket', 'foot'], ms: 1800, spark: 1.4,
      t: { fa: 'سگ', en: 'the dog' }, i: { fa: 'استخون', en: 'bone' },
      yes: { fa: 'آفرین! سگ استخون دوست داره!', en: 'Yes! The dog gets the bone!' },
      item: function () { return BONE(50, 52, 1.05); },
      scene: function () {
        var B = '#c8955f';
        return '<ellipse cx="66" cy="96" rx="20" ry="40" fill="#8a5a33" ' + S + ' transform="rotate(18 66 96)"/>' +
          '<ellipse cx="174" cy="96" rx="20" ry="40" fill="#8a5a33" ' + S + ' transform="rotate(-18 174 96)"/>' +
          '<circle cx="120" cy="108" r="62" fill="' + B + '" ' + S + '/>' +
          '<ellipse cx="120" cy="140" rx="38" ry="28" fill="#f0d2ad"/>' +
          '<circle cx="98" cy="96" r="7" fill="' + INK + '"/><circle cx="142" cy="96" r="7" fill="' + INK + '"/>' +
          '<circle cx="100" cy="93" r="2.2" fill="#fff"/><circle cx="144" cy="93" r="2.2" fill="#fff"/>' +
          '<ellipse cx="120" cy="124" rx="11" ry="8" fill="' + INK + '"/>' +
          '<ellipse class="a-mouth" cx="120" cy="152" rx="18" ry="13" fill="#7a2f3f" ' + S + '/>' +
          '<g class="a-bone">' + BONE(120, 152, 0.7) + '</g>' +
          '<path d="M100,140 Q110,148 120,140 Q130,148 140,140" fill="none" ' + S + '/>' +
          '<rect x="80" y="166" width="80" height="12" rx="6" fill="#ff5d73" ' + S + '/><circle cx="120" cy="184" r="7" fill="#ffd166" ' + S + '/>' +
          '<g class="a-hearts">' + heart(176, 56, 9) + heart(196, 80, 6, '#ff8fb1') + '</g>';
      },
      sfx: function (A, t) {
        [0.78, 1.02, 1.26].forEach(function (d) {
          A.noise(t + d, 0.07, { type: 'lowpass', f0: 1400, gain: 0.22, attack: 0.005, release: 0.04 });
          A.tone(150, t + d, 0.09, 0.12, 'triangle', 80);
        });
      } },
    { id: 'plant', avoid: ['glass', 'flower'], ms: 2250, spark: 1.85,
      t: { fa: 'گیاه', en: 'the plant' }, i: { fa: 'آب‌پاش', en: 'watering can' },
      yes: { fa: 'آفرین! آب‌پاش به گیاه آب می‌ده!', en: 'Yes! The watering can waters the plant!' },
      item: function () { return CAN(-4, 4, 1); },
      scene: function () {
        var drops = '';
        [[148, 74], [158, 82], [140, 86], [152, 96]].forEach(function (d, i) {
          drops += '<ellipse class="a-drop" style="animation-delay:' + (0.45 + i * 0.12) + 's" cx="' + d[0] + '" cy="' + d[1] + '" rx="3.5" ry="5" fill="#5bb8ff"/>';
        });
        return '<g class="a-plant">' +
          '<path d="M120,172 L120,96" stroke="#3f9b5a" stroke-width="7" stroke-linecap="round"/>' +
          '<path d="M120,140 Q96,120 84,132 Q98,150 120,144Z" fill="#6cc070" ' + S + '/>' +
          '<path d="M120,118 Q144,98 156,110 Q142,128 120,122Z" fill="#6cc070" ' + S + '/>' +
          '<g class="a-bloom"><circle cx="120" cy="84" r="9" fill="#ff8fb1" ' + S + '/><circle cx="108" cy="92" r="9" fill="#ff8fb1" ' + S + '/><circle cx="132" cy="92" r="9" fill="#ff8fb1" ' + S + '/><circle cx="120" cy="92" r="7" fill="#ffd166" ' + S + '/></g>' +
          '</g>' +
          '<path d="M78,166 L162,166 L154,214 L86,214Z" fill="#d9825b" ' + S + '/>' +
          '<rect x="72" y="158" width="96" height="16" rx="5" fill="#e8956b" ' + S + '/>' +
          '<g class="a-drops">' + drops + '</g>' +
          '<g class="a-can"><g transform="translate(150,20) scale(0.95) scale(-1,1)">' + CAN(-4, 4, 1) + '</g></g>';
      },
      sfx: function (A, t) {
        for (var i = 0; i < 9; i++) A.tone(1700 + A.rnd() * 700, t + 0.45 + i * 0.1, 0.05, 0.03, 'sine', 800);
        A.tone(330, t + 1.35, 0.7, 0.05, 'sine', 880);
      } },
    { id: 'head', avoid: [], ms: 1450, spark: 1.0,
      t: { fa: 'سر', en: 'the head' }, i: { fa: 'کلاه', en: 'hat' },
      yes: { fa: 'آفرین! کلاه می‌ره روی سر!', en: 'Yes! The hat goes on the head!' },
      item: function () { return HAT(50, 60, 0.95); },
      scene: function () {
        var skin = '#f5c9a3';
        return '<circle cx="62" cy="142" r="12" fill="' + skin + '" ' + S + '/><circle cx="178" cy="142" r="12" fill="' + skin + '" ' + S + '/>' +
          '<circle cx="120" cy="138" r="58" fill="' + skin + '" ' + S + '/>' +
          '<path d="M64,128 C60,82 92,78 120,80 C150,78 182,84 176,128 C160,104 140,100 120,104 C98,100 78,106 64,128Z" fill="#5b3a24"/>' +
          '<circle cx="100" cy="140" r="6" fill="' + INK + '"/><circle cx="140" cy="140" r="6" fill="' + INK + '"/>' +
          '<circle cx="88" cy="160" r="8" fill="#ff8fa3" opacity=".35"/><circle cx="152" cy="160" r="8" fill="#ff8fa3" opacity=".35"/>' +
          '<path class="a-smile0" d="M106,166 Q120,174 134,166" fill="none" ' + S + '/>' +
          '<path class="a-smile1" d="M102,162 Q120,186 138,162Z" fill="#7a2f3f" ' + S + '/>' +
          '<g class="a-hat">' + HAT(120, 94, 1.05) + '</g>';
      },
      sfx: function (A, t) {
        A.noise(t + 0.08, 0.4, { type: 'bandpass', f0: 1600, f1: 500, q: 1.2, gain: 0.07 });
        A.tone(260, t + 0.62, 0.16, 0.12, 'triangle', 200);
      } },
    { id: 'basket', avoid: ['dog'], ms: 1850, spark: 1.4,
      t: { fa: 'سبد بسکتبال', en: 'the basket' }, i: { fa: 'توپ', en: 'ball' },
      yes: { fa: 'آفرین! توپ می‌ره توی سبد!', en: 'Yes! The ball goes in the basket!' },
      item: function () { return BALL(50, 50, 34); },
      scene: function () {
        return '<rect x="112" y="98" width="16" height="122" rx="4" fill="#9aa5b1" ' + S + '/>' +
          '<rect x="60" y="22" width="120" height="78" rx="8" fill="#ffffff" ' + S + '/>' +
          '<rect x="98" y="50" width="44" height="34" rx="3" fill="none" stroke="#ff7a45" stroke-width="4"/>' +
          '<path d="M86,104 A34,8 0 0 1 154,104" fill="none" stroke="#e5602d" stroke-width="5"/>' +
          '<g class="a-ball"><g class="a-spin">' + BALL(0, 0, 17) + '</g></g>' +
          '<g class="a-net"><path d="M88,106 L96,146 L144,146 L152,106 M100,106 L106,146 M120,108 L120,146 M140,106 L134,146 M92,126 L148,126" fill="none" stroke="#f4f6ff" stroke-width="2.5"/></g>' +
          '<path d="M86,104 A34,8 0 0 0 154,104" fill="none" stroke="#ff7a45" stroke-width="6" stroke-linecap="round"/>';
      },
      sfx: function (A, t) {
        A.noise(t + 0.12, 0.4, { type: 'bandpass', f0: 700, f1: 2000, q: 1, gain: 0.07 });
        A.noise(t + 1.02, 0.3, { type: 'highpass', f0: 2600, gain: 0.12, attack: 0.03 });
        A.tone(130, t + 1.3, 0.14, 0.17, 'sine', 60);
        A.tone(130, t + 1.64, 0.1, 0.09, 'sine', 60);
      } },
    { id: 'car', avoid: ['lock'], ms: 2350, spark: 1.9,
      t: { fa: 'ماشین اسباب‌بازی', en: 'the toy car' }, i: { fa: 'باتری', en: 'battery' },
      yes: { fa: 'آفرین! باتری می‌ره توی ماشین!', en: 'Yes! The battery goes in the toy car!' },
      item: function () { return BATT(50, 50, 1.25); },
      scene: function () {
        var wheel = function (x) {
          return '<g class="a-wheel"><circle cx="' + x + '" cy="176" r="18" fill="#3a3550" ' + S + '/><circle cx="' + x + '" cy="176" r="7" fill="#cfd8e6"/>' +
            '<path d="M' + x + ',160 V192 M' + (x - 16) + ',176 H' + (x + 16) + '" stroke="#cfd8e6" stroke-width="3"/></g>';
        };
        return '<path d="M20,206 H220" stroke="' + INK + '" stroke-width="3" opacity=".2" stroke-linecap="round"/>' +
          '<g class="a-car">' +
          '<g class="a-batt">' + BATT(140, 108, 0.75) + '</g>' +
          '<path d="M36,170 L36,140 Q36,128 50,126 L74,124 L92,100 Q98,94 108,94 L120,94 L120,124 L196,128 Q206,130 206,142 L206,170Z" fill="#ff5d5d" ' + S + '/>' +
          '<path d="M80,124 L96,104 Q99,100 104,100 L114,100 L114,124Z" fill="#cdeaff" ' + S + '/>' +
          '<rect x="124" y="116" width="40" height="10" rx="3" fill="#3a3550"/>' +
          '<circle class="a-light" cx="202" cy="146" r="6" fill="#ffe14d"/>' +
          wheel(74) + wheel(170) + '</g>' +
          '<path class="a-zap" d="M150,62 L140,82 L150,82 L142,100 L162,76 L152,76 L160,62Z" fill="#ffe14d" ' + S + '/>';
      },
      sfx: function (A, t) {
        A.click(t + 0.55);
        A.tone(800, t + 0.66, 0.16, 0.05, 'square', 2400);
        A.engine(t + 0.9, 1.3);
      } }
  ];

  function itemSVG(p) { return svg('0 0 100 100', p.item()); }
  function sceneSVG(p) { return svg('0 0 240 240', p.scene() + sparkles(), 'scene p-' + p.id); }

  window.HFBMatchArt = { PAIRS: PAIRS, itemSVG: itemSVG, sceneSVG: sceneSVG };
})();
