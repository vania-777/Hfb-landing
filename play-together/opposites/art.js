/* Opposites («برعکس‌ها») — artwork. Everything is inline SVG (no image files).
   - SYM[pole]():   the answer card symbol for each pole (viewBox 0 0 100 100). The same symbol is
                    used for every picture of that pole, so the answer picture stays consistent.
   - DRAW[d](pole): exemplar scenes (viewBox 0 0 200 200). Where possible the two poles are the SAME
                    object with one contrasting feature (a "minimal pair": the same glass full/empty,
                    the same door open/closed), so the child attends to the concept, not to the object.
   - Animated parts carry classes "o-…"; styles.css animates them only inside the live sample
     (.sample) and only when animation is on. The static state is always the clear final picture.
   - Situations: a child who needs something (cold, hot, wet, dark room, hungry, thirsty, baby sleeping,
     going out). Parts in .s-pre show the problem, .s-post the solved state. */
(function () {
  'use strict';
  var INK = '#2b2440';
  var S = 'stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var S2 = 'stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
  function svg(vb, inner, cls) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + inner + '</svg>';
  }
  function dl(i) { return ' style="animation-delay:' + i + 's"'; }

  /* ---------- small shared shapes ---------- */
  function flake(cx, cy, r, w, col) {
    var d = '';
    for (var k = 0; k < 6; k++) {
      var a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
      var x2 = cx + r * c, y2 = cy + r * s, bx = cx + r * 0.58 * c, by = cy + r * 0.58 * s;
      d += 'M' + cx + ',' + cy + 'L' + x2.toFixed(1) + ',' + y2.toFixed(1);
      [-0.8, 0.8].forEach(function (o) {
        d += 'M' + bx.toFixed(1) + ',' + by.toFixed(1) + 'L' + (bx + r * 0.3 * Math.cos(a + o)).toFixed(1) + ',' + (by + r * 0.3 * Math.sin(a + o)).toFixed(1);
      });
    }
    return '<path d="' + d + '" fill="none" stroke="' + (col || '#4fb3ff') + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"/>';
  }
  function sun(cx, cy, r, cls) {
    var rays = '';
    for (var k = 0; k < 8; k++) {
      var a = k * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      rays += 'M' + (cx + c * r * 1.3).toFixed(1) + ',' + (cy + s * r * 1.3).toFixed(1) + 'L' + (cx + c * r * 1.75).toFixed(1) + ',' + (cy + s * r * 1.75).toFixed(1);
    }
    return '<g' + (cls ? ' class="' + cls + '"' : '') + '><path d="' + rays + '" stroke="#ffb703" stroke-width="' + Math.max(3, r / 5) + '" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#ffd166" stroke="#f4a100" stroke-width="2.5"/></g>';
  }
  function moon(cx, cy, r, bg) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff1a8"/><circle cx="' + (cx + r * 0.5) + '" cy="' + (cy - r * 0.3) + '" r="' + (r * 0.86) + '" fill="' + bg + '"/>';
  }
  function star5(cx, cy, r, cls, d) {
    var p = [];
    for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; p.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); }
    return '<polygon' + (cls ? ' class="' + cls + '"' : '') + (d != null ? dl(d) : '') + ' points="' + p.join(' ') + '" fill="#fff6c2"/>';
  }
  function drop(x, y, s, col, cls, d) {
    return '<path' + (cls ? ' class="' + cls + '"' : '') + (d != null ? dl(d) : '') + ' d="M' + x + ',' + (y - 10 * s) + ' C' + (x + 7 * s) + ',' + (y - 1 * s) + ' ' + (x + 7 * s) + ',' + (y + 6 * s) + ' ' + x + ',' + (y + 6 * s) +
      ' C' + (x - 7 * s) + ',' + (y + 6 * s) + ' ' + (x - 7 * s) + ',' + (y - 1 * s) + ' ' + x + ',' + (y - 10 * s) + 'Z" fill="' + (col || '#4fa8ff') + '" stroke="' + INK + '" stroke-width="1.5"/>';
  }
  function cloud(x, y, s, col) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-30,10 Q-44,10 -42,-2 Q-40,-14 -26,-12 Q-22,-30 0,-28 Q20,-28 24,-12 Q40,-14 42,0 Q42,10 30,10Z" fill="' + (col || '#ffffff') + '" ' + S + '/></g>';
  }
  function ground(y, col) { return '<path d="M8,' + y + ' H192" stroke="' + (col || INK) + '" stroke-width="3" stroke-linecap="round" opacity=".35"/>'; }
  function flower(x, y) { // small constant-size reference for big/small
    return '<g><path d="M' + x + ',' + y + ' V' + (y - 22) + '" stroke="#3f9b4f" stroke-width="3"/><circle cx="' + x + '" cy="' + (y - 26) + '" r="7" fill="#ff8fb1" ' + S2 + '/><circle cx="' + x + '" cy="' + (y - 26) + '" r="2.5" fill="#ffd166"/></g>';
  }
  function steam(xs, y, col) {
    return xs.map(function (x, i) {
      return '<path class="o-steam"' + dl(i * 0.7) + ' d="M' + x + ',' + y + ' q-9,-11 0,-22 q9,-11 0,-22" fill="none" stroke="' + (col || '#c7cfe3') + '" stroke-width="6" stroke-linecap="round"/>';
    }).join('');
  }
  function snowfall(pts) {
    return '<g class="o-snowfall">' + pts.map(function (p, i) {
      return '<g class="o-snow"' + dl(i * 0.6) + '>' + flake(p[0], p[1], p[2] || 6, 2, '#bfe6ff') + '</g>';
    }).join('') + '</g>';
  }
  function finger(x, y, cls) {
    return '<g class="' + (cls || '') + '"><path d="M' + x + ',' + y + ' l-9,-36 q-2,-8 6,-9 q7,-1 9,7 l7,30" fill="#f6c9a0" ' + S + '/></g>';
  }

  /* ---------- Answer symbols (cards) ---------- */
  var SYM = {
    hot: function () {
      return '<path d="M50,8 C62,28 82,40 77,64 C73,84 61,93 50,93 C38,93 24,84 23,64 C21,47 35,38 38,24 C44,34 45,40 49,45 C52,32 53,21 50,8Z" fill="#ff7a3d" ' + S + '/>' +
        '<path d="M50,52 C57,62 64,68 61,79 C58,88 54,90 50,90 C44,90 39,86 39,78 C39,70 46,66 50,52Z" fill="#ffd166"/>';
    },
    cold: function () { return '<circle cx="50" cy="50" r="44" fill="#e6f5ff"/>' + flake(50, 50, 38, 7, '#3aa0ff'); },
    big: function () {
      return ground(92) + '<circle cx="46" cy="50" r="40" fill="#ff8fb1" ' + S + '/><path d="M10,46 Q46,64 84,40" fill="none" stroke="#fff" stroke-width="6" opacity=".8"/>' +
        '<circle cx="88" cy="85" r="6" fill="#ff8fb1" ' + S2 + ' opacity=".55"/>';
    },
    small: function () {
      return ground(92) + '<circle cx="50" cy="79" r="11" fill="#ff8fb1" ' + S + '/><path d="M40,78 Q50,83 60,76" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>';
    },
    day: function () { return '<rect x="4" y="4" width="92" height="92" rx="18" fill="#8fd3ff"/>' + sun(50, 46, 18) + '<path d="M4,78 Q50,64 96,78 V78 Q96,96 78,96 H22 Q4,96 4,78Z" fill="#7ccf6b"/>'; },
    night: function () {
      return '<rect x="4" y="4" width="92" height="92" rx="18" fill="#1b2050"/>' + moon(46, 44, 20, '#1b2050') + star5(76, 24, 6) + star5(20, 22, 4) + star5(80, 60, 4) +
        '<path d="M4,78 Q50,64 96,78 V78 Q96,96 78,96 H22 Q4,96 4,78Z" fill="#2f5a3a"/>';
    },
    light: function () {
      return '<rect x="4" y="4" width="92" height="92" rx="18" fill="#fff6d1"/>' +
        '<path d="M50,8 V16 M18,22 l6,6 M82,22 l-6,6 M10,50 h8 M90,50 h-8" stroke="#ffb703" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M34,52 a16,16 0 1 1 32,0 c0,9 -7,13 -8,22 h-16 c-1,-9 -8,-13 -8,-22Z" fill="#ffd166" ' + S + '/><rect x="41" y="76" width="18" height="12" rx="3" fill="#b9c3cf" ' + S + '/>';
    },
    dark: function () {
      return '<rect x="4" y="4" width="92" height="92" rx="18" fill="#1d2135"/>' +
        '<path d="M34,52 a16,16 0 1 1 32,0 c0,9 -7,13 -8,22 h-16 c-1,-9 -8,-13 -8,-22Z" fill="#5d6278" stroke="#9aa0b8" stroke-width="3" stroke-linejoin="round"/><rect x="41" y="76" width="18" height="12" rx="3" fill="#7a8094" stroke="#9aa0b8" stroke-width="3"/>';
    },
    wet: function () { return SHIRT(50, 46, 0.62, '#3c7fd6') + drop(36, 84, 0.9) + drop(52, 92, 0.9) + drop(66, 84, 0.9); },
    dry: function () { return SHIRT(50, 50, 0.62, '#8cc4ff') + sun(84, 16, 8); },
    full: function () { return GLASS(50, 52, 0.7, 1); },
    empty: function () { return GLASS(50, 52, 0.7, 0); },
    open: function () { return DOOR(50, 50, 0.56, true); },
    closed: function () { return DOOR(50, 50, 0.56, false); },
    fast: function () { return '<path d="M4,46 h18 M8,58 h16 M4,70 h14" stroke="#7aa6ff" stroke-width="5" stroke-linecap="round"/>' + RABBIT(58, 62, 0.5); },
    slow: function () { return SNAIL(50, 64, 0.52); },
    loud: function () { return SPEAKER(36, 50, 0.6) + '<path d="M62,36 q8,14 0,28 M72,26 q14,24 0,48 M82,16 q20,34 0,68" fill="none" stroke="#ff7a3d" stroke-width="6" stroke-linecap="round"/>'; },
    quiet: function () { return SPEAKER(36, 50, 0.6) + '<path d="M62,44 q4,6 0,12" fill="none" stroke="#7aa6ff" stroke-width="5" stroke-linecap="round"/>'; },
    up: function () { return '<circle cx="50" cy="24" r="14" fill="#ff9f43" ' + S + '/><path d="M50,92 V48 M34,62 L50,46 L66,62" fill="none" stroke="#3aa0ff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'; },
    down: function () { return '<circle cx="50" cy="78" r="14" fill="#ff9f43" ' + S + '/><path d="M50,8 V52 M34,38 L50,54 L66,38" fill="none" stroke="#3aa0ff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' + ground(94); },
    soft: function () { return PILLOW(50, 54, 0.62); },
    hard: function () { return ROCK(50, 58, 0.62); }
  };

  /* ---------- reusable objects ---------- */
  function SHIRT(x, y, s, col) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-22,-50 L-56,-34 L-46,-6 L-32,-12 L-32,52 L32,52 L32,-12 L46,-6 L56,-34 L22,-50 Q0,-34 -22,-50Z" fill="' + col + '" ' + S + '/>' +
      '<path d="M-22,-50 Q0,-30 22,-50" fill="none" ' + S + '/></g>';
  }
  function GLASS(x, y, s, full) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      (full ? '<path d="M-36,-44 L36,-44 L30,52 Q0,58 -30,52Z" fill="#5bb8ff"/><path d="M-36,-44 Q-18,-50 0,-44 T36,-44" fill="none" stroke="#8fd0ff" stroke-width="4"/>' : '') +
      '<path d="M-42,-60 L42,-60 L32,56 Q0,62 -32,56Z" fill="rgba(220,240,255,.25)" ' + S + '/><path d="M-26,-44 L-22,40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>';
  }
  function DOOR(x, y, s, open) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<rect x="-40" y="-72" width="80" height="144" fill="' + (open ? '#bfe9ff' : '#8a5a3c') + '" ' + S + '/>' +
      (open ? '<path d="M-40,40 H40 V72 H-40Z" fill="#7ccf6b"/>' + sun(16, -40, 10) +
        '<path d="M-40,-72 L-14,-62 L-14,82 L-40,72Z" fill="#c98b5e" ' + S + '/><circle cx="-20" cy="6" r="3.5" fill="#ffd166"/>'
        : '<rect x="-28" y="-60" width="56" height="48" rx="4" fill="none" stroke="#6b4329" stroke-width="3"/><rect x="-28" y="4" width="56" height="54" rx="4" fill="none" stroke="#6b4329" stroke-width="3"/><circle cx="26" cy="0" r="6" fill="#ffd166" ' + S2 + '/>') + '</g>';
  }
  function RABBIT(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<ellipse cx="-6" cy="10" rx="40" ry="26" fill="#f2efe9" ' + S + '/><circle cx="-46" cy="4" r="9" fill="#fff" ' + S + '/>' +
      '<ellipse cx="34" cy="-50" rx="9" ry="30" transform="rotate(-25 34 -50)" fill="#f2efe9" ' + S + '/><ellipse cx="48" cy="-46" rx="8" ry="28" transform="rotate(10 48 -46)" fill="#f2efe9" ' + S + '/>' +
      '<circle cx="38" cy="-10" r="22" fill="#f2efe9" ' + S + '/><circle cx="46" cy="-14" r="3.5" fill="' + INK + '"/><circle cx="58" cy="-6" r="3" fill="#ff8fb1"/>' +
      '<path d="M-30,32 l-14,8 M18,32 l14,8" ' + S + '/></g>';
  }
  function SNAIL(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<path d="M-70,30 Q-70,14 -50,14 L50,14 Q70,14 74,-10 L80,-30 M70,-10 L64,-34" fill="#ffd9a8" ' + S + '/>' +
      '<path d="M-70,30 L60,30 Q76,30 76,14 Q76,0 64,-4 L-50,14" fill="#ffd9a8" ' + S + '/>' +
      '<circle cx="80" cy="-32" r="4" fill="' + INK + '"/><circle cx="64" cy="-36" r="4" fill="' + INK + '"/>' +
      '<circle cx="-4" cy="-14" r="40" fill="#c98bd9" ' + S + '/><path d="M-4,-14 m0,-26 a26,26 0 1 1 -24,16 a18,18 0 1 1 18,-10 a10,10 0 1 1 6,8" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></g>';
  }
  function SPEAKER(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-36,-18 H-14 L14,-42 V42 L-14,18 H-36Z" fill="#6c7aa8" ' + S + '/></g>';
  }
  function PILLOW(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-62,-34 Q0,-50 62,-34 Q74,0 62,34 Q0,50 -62,34 Q-74,0 -62,-34Z" fill="#c9b8ff" ' + S + '/>' +
      '<path d="M-40,-20 Q0,-30 40,-20 M-40,20 Q0,30 40,20" fill="none" stroke="#a894f0" stroke-width="3"/><circle cx="0" cy="0" r="4" fill="#a894f0"/></g>';
  }
  function ROCK(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-66,34 L-56,-14 L-24,-42 L22,-46 L58,-20 L68,34Z" fill="#9aa3b2" ' + S + '/>' +
      '<path d="M-24,-42 L-12,-6 L-56,-14 M-12,-6 L30,-4 L58,-20 M30,-4 L40,34" fill="none" stroke="#6f7888" stroke-width="3"/></g>';
  }
  function CAR(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-60,10 L-54,-14 Q-50,-22 -40,-22 L-20,-22 L-4,-42 L34,-42 L50,-22 L60,-20 Q68,-18 68,-8 L68,10Z" fill="#ff5d73" ' + S + '/>' +
      '<path d="M0,-38 L-14,-24 L14,-24 L14,-38Z M20,-38 L20,-24 L44,-24 L32,-38Z" fill="#cfefff" ' + S2 + '/>' +
      '<g class="o-wheel"><circle cx="-34" cy="12" r="13" fill="#3a3550" ' + S + '/><path d="M-34,1 V23 M-45,12 H-23" stroke="#cfd8e6" stroke-width="3"/></g>' +
      '<g class="o-wheel"><circle cx="40" cy="12" r="13" fill="#3a3550" ' + S + '/><path d="M40,1 V23 M29,12 H51" stroke="#cfd8e6" stroke-width="3"/></g></g>';
  }
  function DOG(x, y, s, o) { // o.wet, o.mouth: 'smile'|'bark'|'sleep'
    o = o || {};
    var fur = o.wet ? '#a4744e' : '#d9a066';
    var head = o.wet ? '<circle cx="0" cy="0" r="40" fill="' + fur + '" ' + S + '/>'
      : '<path d="M0,-44 q10,0 12,6 q10,-4 16,4 q10,2 10,12 q8,6 4,16 q6,8 0,16 q2,10 -8,14 q-4,10 -14,8 q-8,8 -20,4 q-12,4 -20,-4 q-10,2 -14,-8 q-10,-4 -8,-14 q-6,-8 0,-16 q-4,-10 4,-16 q0,-10 10,-12 q6,-8 16,-4 q2,-6 12,-6Z" fill="' + fur + '" ' + S + '/>';
    var ears = o.wet ? '<path d="M-36,-14 Q-56,10 -44,34 Q-30,20 -28,-4Z M36,-14 Q56,10 44,34 Q30,20 28,-4Z" fill="#7a5233" ' + S + '/>'
      : '<path d="M-32,-30 Q-58,-30 -50,4 Q-36,-2 -26,-14Z M32,-30 Q58,-30 50,4 Q36,-2 26,-14Z" fill="#a8743f" ' + S + '/>';
    var eyes = o.mouth === 'sleep' ? '<path d="M-20,-6 q6,5 12,0 M8,-6 q6,5 12,0" fill="none" ' + S + '/>' : '<circle cx="-14" cy="-6" r="4.5" fill="' + INK + '"/><circle cx="14" cy="-6" r="4.5" fill="' + INK + '"/>';
    var mouth = o.mouth === 'bark' ? '<path d="M-12,16 Q0,40 12,16Z" fill="#c44" ' + S2 + '/>' : o.mouth === 'sleep' ? '<path d="M-6,20 q6,3 12,0" fill="none" ' + S2 + '/>' : '<path d="M-10,16 q10,10 20,0" fill="none" ' + S2 + '/>';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' + head + ears + eyes + '<ellipse cx="0" cy="8" rx="8" ry="6" fill="' + INK + '"/>' + mouth + '</g>';
  }
  function TOWEL(x, y, s, wet) {
    var col = wet ? '#e0a400' : '#ffd166';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-44,-40 H44 V40 Q0,' + (wet ? 50 : 44) + ' -44,40Z" fill="' + col + '" ' + S + '/>' +
      '<path d="M-44,24 H44 M-44,30 H44" stroke="#ff8fb1" stroke-width="4"/>' +
      (wet ? '' : '<path d="M-30,-24 q4,-4 8,0 t8,0 M4,-10 q4,-4 8,0 t8,0" fill="none" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>') + '</g>';
  }
  function LAMP(x, y, s, on) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      (on ? '<path class="o-glow" d="M-30,-18 L-70,60 H70 L30,-18Z" fill="#fff1a8" opacity=".55"/>' : '') +
      '<path d="M-28,-60 H28 L42,-18 H-42Z" fill="' + (on ? '#ffd166' : '#8b90a6') + '" ' + S + '/>' +
      '<path d="M0,-18 V52 M-26,56 H26" ' + S + ' stroke-width="6"/>' + '</g>';
  }
  function BOWL(x, y, s, hot) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' + (hot ? steam([-16, 0, 16], -10) : '') +
      '<ellipse cx="0" cy="0" rx="44" ry="10" fill="#f28c38" ' + S + '/><path d="M-44,0 Q-40,40 0,40 Q40,40 44,0" fill="#fff" ' + S + '/>' +
      '<path d="M-30,16 h60" stroke="#7aa6ff" stroke-width="4"/></g>';
  }
  function ICECREAM(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-24,-6 L0,58 L24,-6Z" fill="#e8b46a" ' + S + '/><path d="M-16,8 L10,8 M-10,24 L8,24" stroke="#c98b3e" stroke-width="3"/>' +
      '<circle cx="-12" cy="-16" r="18" fill="#ffc2d6" ' + S + '/><circle cx="12" cy="-16" r="18" fill="#bde6c8" ' + S + '/><circle cx="0" cy="-36" r="17" fill="#fff4d6" ' + S + '/></g>';
  }
  function PLATE(x, y, s, full) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="0" cy="10" rx="60" ry="18" fill="#ffffff" ' + S + '/><ellipse cx="0" cy="8" rx="40" ry="10" fill="none" stroke="#cfd8e6" stroke-width="3"/>' +
      (full ? '<ellipse cx="-14" cy="-2" rx="24" ry="14" fill="#ffe08a" ' + S2 + '/><circle cx="18" cy="-4" r="13" fill="#ff7a5c" ' + S2 + '/><path d="M2,-10 q8,-20 22,-16 q-4,14 -22,16Z" fill="#6cc46c" ' + S2 + '/><circle cx="-2" cy="4" r="6" fill="#8fd16a" ' + S2 + '/>' : '') + '</g>';
  }
  function BUCKET(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-34,-30 Q0,-70 34,-30" fill="none" ' + S + '/>' +
      '<path d="M-38,-30 L38,-30 L30,40 L-30,40Z" fill="#7aa6ff" ' + S + '/><ellipse cx="0" cy="-30" rx="38" ry="8" fill="#5bb8ff" ' + S + '/>' + drop(26, -46, 0.9) + drop(44, -30, 0.7) + '</g>';
  }
  function DRUM(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-44,-16 L-44,30 Q0,48 44,30 L44,-16" fill="#ff5d73" ' + S + '/><ellipse cx="0" cy="-16" rx="44" ry="14" fill="#fff4d6" ' + S + '/>' +
      '<path d="M-44,-10 L-20,30 L0,-2 L20,30 L44,-10" fill="none" stroke="#ffd166" stroke-width="4"/>' +
      '<path d="M-30,-60 L-8,-22 M34,-62 L10,-22" ' + S + ' stroke-width="5"/><circle cx="-32" cy="-62" r="6" fill="#ffd166" ' + S2 + '/><circle cx="36" cy="-64" r="6" fill="#ffd166" ' + S2 + '/></g>';
  }
  function SHH(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><circle cx="0" cy="0" r="40" fill="#f6c9a0" ' + S + '/><path d="M-40,-6 Q-40,-44 0,-44 Q40,-44 40,-6 Q20,-26 0,-26 Q-20,-26 -40,-6Z" fill="#4a3428"/>' +
      '<path d="M-20,-2 q6,5 12,0 M8,-2 q6,5 12,0" fill="none" ' + S + '/><ellipse cx="0" cy="22" rx="7" ry="4" fill="#c46a6a"/>' +
      '<path d="M0,54 L0,16 q0,-6 5,-6 q5,0 5,6 V54" fill="#f6c9a0" ' + S + '/></g>';
  }

  /* ---------- Exemplar scenes (viewBox 0 0 200 200) ---------- */
  var DRAW = {
    mug: function () {
      return steam([84, 104, 124], 82) + '<path d="M146,110 q30,2 28,24 q-2,22 -28,20" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="M146,110 q30,2 28,24 q-2,22 -28,20" fill="none" stroke="#ff8a5c" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M60,96 H150 L144,170 Q105,180 66,170Z" fill="#ff8a5c" ' + S + '/><ellipse cx="105" cy="98" rx="44" ry="8" fill="#7a3b1f" ' + S + '/>' +
        '<path d="M80,124 q8,-8 16,0 t16,0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>' + ground(182);
    },
    ice: function () {
      return snowfall([[30, 30], [160, 24], [176, 90, 5], [22, 110, 5]]) +
        '<g transform="rotate(-8 80 130)"><rect x="40" y="96" width="74" height="74" rx="14" fill="#cdeeff" ' + S + '/><path d="M54,110 h22 M54,120 h12" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>' +
        '<g transform="rotate(10 140 120)"><rect x="104" y="80" width="62" height="62" rx="12" fill="#b5e3ff" ' + S + '/><path d="M116,92 h18" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>' +
        flake(96, 52, 16, 4, '#3aa0ff') + ground(182);
    },
    fire: function () {
      return '<g class="o-flick"><path d="M100,40 C114,64 140,78 134,112 C130,140 116,150 100,150 C84,150 64,140 62,114 C60,90 80,78 84,58 C90,72 92,80 98,86 C102,70 104,56 100,40Z" fill="#ff7a3d" ' + S + '/>' +
        '<path d="M100,92 C110,106 120,114 116,130 C112,144 106,146 100,146 C92,146 84,140 84,128 C84,116 94,110 100,92Z" fill="#ffd166"/></g>' +
        '<path d="M50,170 L150,146 M50,146 L150,170" stroke="' + INK + '" stroke-width="20" stroke-linecap="round"/><path d="M50,170 L150,146 M50,146 L150,170" stroke="#9a6236" stroke-width="13" stroke-linecap="round"/>' + ground(182);
    },
    snowman: function () {
      return snowfall([[24, 30], [176, 40], [160, 110, 5], [34, 120, 5], [100, 20, 5]]) +
        '<path d="M8,176 Q100,160 192,176 V192 H8Z" fill="#eef7ff"/>' +
        '<circle cx="100" cy="140" r="36" fill="#ffffff" ' + S + '/><circle cx="100" cy="82" r="26" fill="#ffffff" ' + S + '/>' +
        '<rect x="80" y="40" width="40" height="22" rx="3" fill="#3a3550" ' + S + '/><rect x="72" y="58" width="56" height="8" rx="4" fill="#3a3550" ' + S + '/>' +
        '<circle cx="91" cy="78" r="3.5" fill="' + INK + '"/><circle cx="109" cy="78" r="3.5" fill="' + INK + '"/><path d="M100,86 l18,5 l-18,3Z" fill="#ff9f43"/>' +
        '<path d="M76,104 Q100,114 124,104 L124,112 Q100,122 76,112Z M110,110 l6,26 l10,-2 l-6,-26" fill="#ff5d73" ' + S2 + '/>';
    },
    thermo: function (pole) {
      var hot = pole === 'hot', col = hot ? '#ff4d4d' : '#3aa0ff', top = hot ? 34 : 122;
      return (hot ? sun(158, 44, 18) : flake(156, 46, 22, 5, '#3aa0ff')) +
        '<rect x="84" y="20" width="32" height="150" rx="16" fill="#ffffff" ' + S + '/>' +
        '<g class="o-merc"><rect x="93" y="' + top + '" width="14" height="' + (166 - top) + '" rx="7" fill="' + col + '"/></g>' +
        '<circle cx="100" cy="170" r="22" fill="' + col + '" ' + S + '/>' +
        '<path d="M116,44 h10 M116,68 h7 M116,92 h10 M116,116 h7 M116,140 h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".6"/>';
    },
    ball: function (pole) {
      var big = pole === 'big', r = big ? 64 : 15, cy = 180 - r;
      return ground(182) + flower(176, 182) +
        '<g class="' + (big ? 'o-bounce-big' : 'o-bounce-small') + '"><circle cx="88" cy="' + cy + '" r="' + r + '" fill="#ff8fb1" ' + S + '/><path d="M' + (88 - r) + ',' + (cy - r * 0.1) + ' Q88,' + (cy + r * 0.45) + ' ' + (88 + r) + ',' + (cy - r * 0.3) + '" fill="none" stroke="#fff" stroke-width="' + (big ? 9 : 4) + '" opacity=".8"/></g>';
    },
    fish: function (pole) {
      var s = pole === 'big' ? 1.55 : 0.42;
      return '<rect x="6" y="20" width="188" height="170" rx="22" fill="#cfeeff"/>' +
        '<path d="M170,188 q-8,-20 0,-34 q8,-14 0,-28" fill="none" stroke="#3f9b4f" stroke-width="5" stroke-linecap="round"/>' +
        '<g class="o-swim"><g transform="translate(92,104) scale(' + s + ')"><path d="M-40,0 Q-10,-30 30,0 Q-10,30 -40,0Z" fill="#ff9f43" ' + S + '/><path d="M30,0 L54,-18 L50,0 L54,18Z" fill="#ff9f43" ' + S + '/>' +
        '<circle cx="-22" cy="-4" r="4" fill="' + INK + '"/><path d="M-4,-14 q6,14 0,28" fill="none" stroke="' + INK + '" stroke-width="2.5"/></g></g>';
    },
    tree: function (pole) {
      var s = pole === 'big' ? 1 : 0.34;
      return ground(182) + flower(26, 182) +
        '<g class="o-sway"><g transform="translate(110,182) scale(' + s + ')"><rect x="-12" y="-80" width="24" height="80" fill="#9a6236" ' + S + '/>' +
        '<circle cx="0" cy="-118" r="52" fill="#5fbf63" ' + S + '/><circle cx="-34" cy="-92" r="30" fill="#5fbf63" ' + S + '/><circle cx="34" cy="-92" r="30" fill="#5fbf63" ' + S + '/>' +
        '<circle cx="-14" cy="-128" r="6" fill="#ff5d73"/><circle cx="20" cy="-108" r="6" fill="#ff5d73"/></g></g>';
    },
    sky: function (pole) {
      var day = pole === 'day', bg = day ? '#8fd3ff' : '#1b2050';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="' + bg + '"/>' +
        (day ? '<g class="o-rise">' + sun(100, 78, 30) + '</g>' + cloud(44, 46, 0.6) + cloud(160, 104, 0.5)
          : '<g class="o-rise">' + moon(96, 76, 32, bg) + '</g>' + star5(40, 40, 7, 'o-twinkle', 0) + star5(160, 36, 6, 'o-twinkle', 1) + star5(150, 110, 5, 'o-twinkle', 2) + star5(30, 108, 5, 'o-twinkle', 1.5)) +
        '<path d="M4,150 Q100,122 196,150 V172 Q196,196 172,196 H28 Q4,196 4,172Z" fill="' + (day ? '#7ccf6b' : '#2f5a3a') + '"/>';
    },
    house: function (pole) {
      var day = pole === 'day', bg = day ? '#8fd3ff' : '#1b2050';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="' + bg + '"/>' +
        (day ? sun(160, 44, 18, 'o-rise') : '<g class="o-rise">' + moon(158, 44, 20, bg) + '</g>' + star5(36, 34, 5, 'o-twinkle', 0) + star5(100, 24, 4, 'o-twinkle', 1)) +
        '<path d="M4,166 H196 V172 Q196,196 172,196 H28 Q4,196 4,172Z" fill="' + (day ? '#7ccf6b' : '#2f5a3a') + '"/>' +
        '<path d="M40,96 L96,52 L152,96Z" fill="' + (day ? '#e05a4f' : '#7a3a3a') + '" ' + S + '/><rect x="50" y="96" width="92" height="72" fill="' + (day ? '#ffe6b0' : '#7c6a5a') + '" ' + S + '/>' +
        '<rect x="62" y="110" width="28" height="26" fill="' + (day ? '#bfe9ff' : '#ffd166') + '" ' + S2 + '/><rect x="104" y="124" width="24" height="44" fill="' + (day ? '#9a6236' : '#4a3428') + '" ' + S2 + '/>';
    },
    park: function (pole) {
      var day = pole === 'day', bg = day ? '#8fd3ff' : '#1b2050';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="' + bg + '"/>' +
        (day ? sun(40, 44, 18, 'o-rise') + '<g class="o-bird"><path d="M130,50 q8,-8 16,0 q8,-8 16,0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></g>'
          : '<g class="o-rise">' + moon(44, 46, 20, bg) + '</g>' + star5(150, 30, 5, 'o-twinkle', 0) + star5(176, 70, 4, 'o-twinkle', 1.2)) +
        '<path d="M4,160 Q100,140 196,160 V172 Q196,196 172,196 H28 Q4,196 4,172Z" fill="' + (day ? '#7ccf6b' : '#2f5a3a') + '"/>' +
        '<rect x="122" y="96" width="16" height="62" fill="' + (day ? '#9a6236' : '#5a3d2a') + '" ' + S2 + '/><circle cx="130" cy="86" r="34" fill="' + (day ? '#5fbf63' : '#2f6b3f') + '" ' + S + '/>' +
        (day ? '' : '<g transform="translate(118,82)"><ellipse cx="0" cy="0" rx="12" ry="15" fill="#a8743f" ' + S2 + '/><circle cx="-5" cy="-5" r="4.5" fill="#fff"/><circle cx="5" cy="-5" r="4.5" fill="#fff"/><circle cx="-5" cy="-5" r="2" fill="' + INK + '"/><circle cx="5" cy="-5" r="2" fill="' + INK + '"/><path d="M-2,1 L2,1 L0,5Z" fill="#ffb703"/></g>');
    },
    lamp: function (pole) {
      var on = pole === 'light';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="' + (on ? '#fff4cc' : '#1a1d33') + '"/>' +
        '<rect x="40" y="150" width="120" height="12" rx="4" fill="' + (on ? '#c98b5e' : '#3a3044') + '" ' + S2 + '/>' + LAMP(100, 92, 0.9, on) +
        (on ? '' : '<rect class="o-off" x="4" y="4" width="192" height="192" rx="24" fill="#fff4cc" opacity="0"/>');
    },
    torch: function (pole) {
      var on = pole === 'light';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="' + (on ? '#3a3f63' : '#14172a') + '"/>' +
        (on ? '<path class="o-glow" d="M70,128 L196,40 V196 L120,196Z" fill="#fff1a8" opacity=".9"/><g transform="translate(152,140)"><circle cx="0" cy="-26" r="18" fill="#d9a066" ' + S2 + '/><circle cx="-14" cy="-40" r="8" fill="#d9a066" ' + S2 + '/><circle cx="14" cy="-40" r="8" fill="#d9a066" ' + S2 + '/><ellipse cx="0" cy="8" rx="20" ry="22" fill="#d9a066" ' + S2 + '/><circle cx="-6" cy="-28" r="2.5" fill="' + INK + '"/><circle cx="6" cy="-28" r="2.5" fill="' + INK + '"/></g>' : '') +
        '<g transform="rotate(-30 50 150)"><rect x="20" y="138" width="56" height="24" rx="6" fill="#ff9f43" ' + S + '/><path d="M76,134 L92,128 V172 L76,166Z" fill="' + (on ? '#fff1a8' : '#6b6f85') + '" ' + S + '/><rect x="40" y="134" width="10" height="6" rx="2" fill="#3a3550"/></g>';
    },
    bulb: function (pole) {
      var on = pole === 'light';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="' + (on ? '#fff6d1' : '#1d2135') + '"/>' +
        '<path d="M100,4 V52" stroke="' + (on ? INK : '#9aa0b8') + '" stroke-width="3"/><rect x="88" y="52" width="24" height="18" rx="4" fill="#b9c3cf" ' + S2 + '/>' +
        (on ? '<g class="o-glow"><path d="M100,172 V186 M48,124 h-18 M152,124 h18 M58,86 l-12,-10 M142,86 l12,-10 M62,160 l-12,12 M138,160 l12,12" stroke="#ffb703" stroke-width="6" stroke-linecap="round"/></g>' : '') +
        '<path d="M90,70 c0,16 -30,24 -30,52 a40,40 0 0 0 80,0 c0,-28 -30,-36 -30,-52Z" fill="' + (on ? '#ffd166' : '#5d6278') + '" stroke="' + (on ? INK : '#9aa0b8') + '" stroke-width="3" stroke-linejoin="round"/>';
    },
    shirt: function (pole) {
      var wet = pole === 'wet';
      return '<path d="M4,30 Q100,46 196,30" fill="none" stroke="' + INK + '" stroke-width="3"/>' + (wet ? '' : sun(166, 30, 13)) +
        '<g class="' + (wet ? '' : 'o-sway-soft') + '">' + SHIRT(100, 104, 1.05, wet ? '#3c7fd6' : '#8cc4ff') +
        '<rect x="70" y="44" width="8" height="14" rx="2" fill="#ffd166" ' + S2 + '/><rect x="122" y="44" width="8" height="14" rx="2" fill="#ffd166" ' + S2 + '/></g>' +
        (wet ? drop(80, 172, 1, null, 'o-drip', 0) + drop(102, 176, 1, null, 'o-drip', 0.5) + drop(124, 172, 1, null, 'o-drip', 1) + '<ellipse cx="102" cy="190" rx="46" ry="6" fill="#7cc4ff" opacity=".7"/>' : '');
    },
    towel: function (pole) {
      var wet = pole === 'wet';
      return '<rect x="30" y="40" width="140" height="10" rx="5" fill="#b9c3cf" ' + S2 + '/>' + (wet ? '' : sun(170, 24, 11)) +
        TOWEL(100, 100, 1.1, wet) +
        (wet ? drop(74, 168, 1, null, 'o-drip', 0.2) + drop(100, 172, 1, null, 'o-drip', 0.8) + drop(126, 168, 1, null, 'o-drip', 1.3) + '<ellipse cx="100" cy="190" rx="44" ry="6" fill="#7cc4ff" opacity=".7"/>' : '');
    },
    dog: function (pole) {
      var wet = pole === 'wet';
      return (wet ? cloud(100, 34, 0.9, '#cfd8e6') + '<g class="o-rain"><path d="M70,58 l-4,12 M96,60 l-4,12 M122,58 l-4,12 M84,74 l-4,12 M110,74 l-4,12" stroke="#4fa8ff" stroke-width="4" stroke-linecap="round"/></g>' : sun(160, 36, 15)) +
        DOG(100, 124, 1.15, { wet: wet }) +
        (wet ? drop(58, 160, 0.9, null, 'o-drip', 0) + drop(144, 160, 0.9, null, 'o-drip', 0.7) + '<ellipse cx="100" cy="188" rx="56" ry="7" fill="#7cc4ff" opacity=".7"/>' : '');
    },
    glass: function (pole) {
      var full = pole === 'full';
      return '<defs><clipPath id="gl-' + pole + '"><path d="M64,62 L136,62 L127,174 Q100,180 73,174Z"/></clipPath></defs>' +
        '<g clip-path="url(#gl-' + pole + ')"><g class="' + (full ? 'o-fill' : 'o-drain') + '"><rect x="60" y="' + (full ? 66 : 176) + '" width="80" height="120" fill="#5bb8ff"/></g></g>' +
        '<path d="M60,54 L140,54 L130,176 Q100,184 70,176Z" fill="rgba(220,240,255,.25)" ' + S + '/><path d="M76,70 L80,160" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>' + ground(186);
    },
    jar: function (pole) {
      var full = pole === 'full', cookies = '';
      if (full) [[78, 158], [112, 160], [92, 134], [124, 132], [76, 110], [108, 106]].forEach(function (c, i) {
        cookies += '<g class="o-dropin"' + dl(i * 0.12) + '><circle cx="' + c[0] + '" cy="' + c[1] + '" r="15" fill="#d9a066" ' + S2 + '/><circle cx="' + (c[0] - 5) + '" cy="' + (c[1] - 3) + '" r="2.5" fill="#5a3d2a"/><circle cx="' + (c[0] + 5) + '" cy="' + (c[1] + 4) + '" r="2.5" fill="#5a3d2a"/></g>';
      });
      return '<rect x="74" y="34" width="52" height="16" rx="5" fill="#ff8fb1" ' + S + '/>' + cookies +
        '<path d="M66,50 H134 Q154,60 154,90 V164 Q154,182 134,182 H66 Q46,182 46,164 V90 Q46,60 66,50Z" fill="rgba(220,240,255,.28)" ' + S + '/>' +
        (full ? '' : '<circle cx="90" cy="176" r="2" fill="#a8743f"/><circle cx="110" cy="177" r="1.6" fill="#a8743f"/>') + '<path d="M58,80 V150" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>';
    },
    basket: function (pole) {
      var full = pole === 'full', apples = '';
      if (full) [[72, 104], [100, 98], [128, 104], [86, 82], [114, 82], [100, 64]].forEach(function (c, i) {
        apples += '<g class="o-dropin"' + dl(i * 0.12) + '><circle cx="' + c[0] + '" cy="' + c[1] + '" r="16" fill="#ff5d5d" ' + S2 + '/><path d="M' + c[0] + ',' + (c[1] - 14) + ' q4,-8 10,-8" fill="none" stroke="#3f9b4f" stroke-width="3"/></g>';
      });
      return apples + '<path d="M40,110 H160 L146,176 H54Z" fill="#d9a066" ' + S + '/><path d="M46,132 H154 M50,154 H150 M74,110 L78,176 M100,110 V176 M126,110 L122,176" stroke="#a8743f" stroke-width="3"/>' +
        '<path d="M56,110 Q100,' + (full ? 30 : 40) + ' 144,110" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M56,110 Q100,' + (full ? 30 : 40) + ' 144,110" fill="none" stroke="#d9a066" stroke-width="4" stroke-linecap="round"/>' + ground(184);
    },
    door: function (pole) {
      var open = pole === 'open';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#f3e6d6"/>' +
        '<rect x="54" y="22" width="92" height="160" fill="' + (open ? '#bfe9ff' : '#6b4329') + '" ' + S + '/>' +
        (open ? '<path d="M56,140 H144 V180 H56Z" fill="#7ccf6b"/>' + sun(116, 62, 14) : '') +
        '<g class="' + (open ? 'o-open' : 'o-close') + '"><rect x="58" y="26" width="84" height="152" fill="#a86c44" ' + S + '/><rect x="70" y="40" width="60" height="50" rx="4" fill="none" stroke="#7a4b2e" stroke-width="3"/><rect x="70" y="104" width="60" height="60" rx="4" fill="none" stroke="#7a4b2e" stroke-width="3"/><circle cx="130" cy="104" r="6" fill="#ffd166" ' + S2 + '/></g>' +
        '<path d="M4,182 H196" stroke="' + INK + '" stroke-width="3" opacity=".35"/>';
    },
    box: function (pole) {
      var open = pole === 'open';
      return ground(184) + '<path d="M44,90 H156 V176 H44Z" fill="#d9a066" ' + S + '/>' +
        (open ? '<g class="o-flaps"><path d="M44,90 L24,58 L84,58 L100,90Z" fill="#e8b97c" ' + S + '/><path d="M156,90 L176,58 L116,58 L100,90Z" fill="#e8b97c" ' + S + '/></g><path d="M48,92 H152 L146,104 H54Z" fill="#8a5a3c" opacity=".55"/>'
          : '<path d="M44,90 L56,72 H144 L156,90Z" fill="#e8b97c" ' + S + '/><path d="M100,72 V176" stroke="#c98b5e" stroke-width="3"/><rect x="88" y="72" width="24" height="40" fill="#cfe3ff" opacity=".85"/>') +
        '<path d="M60,140 h20" stroke="#a8743f" stroke-width="3" stroke-linecap="round"/>';
    },
    window: function (pole) {
      var open = pole === 'open';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#f3e6d6"/><rect x="40" y="36" width="120" height="120" fill="#bfe9ff" ' + S + '/>' + sun(124, 70, 14) + cloud(76, 96, 0.4) +
        (open ? '<g class="o-fadein"><path d="M40,36 L18,24 V168 L40,156Z" fill="#cfefff" ' + S + '/><path d="M160,36 L182,24 V168 L160,156Z" fill="#cfefff" ' + S + '/></g>'
          : '<g class="o-fadein"><rect x="40" y="36" width="60" height="120" fill="rgba(255,255,255,.35)" ' + S + '/><rect x="100" y="36" width="60" height="120" fill="rgba(255,255,255,.35)" ' + S + '/><circle cx="94" cy="96" r="4" fill="#ffd166"/><circle cx="106" cy="96" r="4" fill="#ffd166"/></g>') +
        '<rect x="30" y="156" width="140" height="10" rx="4" fill="#c98b5e" ' + S2 + '/>';
    },
    rabbit: function () {
      return ground(176) + '<g class="o-zoom"><path d="M18,96 h34 M10,118 h36 M22,140 h28" stroke="#7aa6ff" stroke-width="6" stroke-linecap="round"/>' + RABBIT(118, 128, 1) + '</g>';
    },
    snail: function () { return ground(176) + '<g class="o-crawl">' + SNAIL(96, 140, 0.9) + '</g>'; },
    car: function (pole) {
      var fast = pole === 'fast';
      return ground(160) + '<g class="' + (fast ? 'o-zoom' : 'o-crawl') + '">' +
        (fast ? '<path d="M8,100 h30 M14,120 h26 M4,140 h34" stroke="#7aa6ff" stroke-width="6" stroke-linecap="round"/>' : '<circle cx="34" cy="138" r="7" fill="#cfd8e6"/><circle cx="24" cy="132" r="5" fill="#cfd8e6"/>') +
        CAR(112, 134, 1) + '</g>';
    },
    speaker: function (pole) {
      var loud = pole === 'loud';
      return SPEAKER(70, 100, 1.4) +
        (loud ? '<path class="o-wave"' + dl(0) + ' d="M110,74 q16,26 0,52" fill="none" stroke="#ff7a3d" stroke-width="8" stroke-linecap="round"/><path class="o-wave"' + dl(0.2) + ' d="M130,56 q28,44 0,88" fill="none" stroke="#ff7a3d" stroke-width="8" stroke-linecap="round"/><path class="o-wave"' + dl(0.4) + ' d="M150,38 q40,62 0,124" fill="none" stroke="#ff7a3d" stroke-width="8" stroke-linecap="round"/>'
          : '<path class="o-wave-soft" d="M112,90 q7,10 0,20" fill="none" stroke="#7aa6ff" stroke-width="6" stroke-linecap="round"/>');
    },
    barkdog: function (pole) {
      var loud = pole === 'loud';
      return ground(184) + DOG(84, 116, 1.05, { mouth: loud ? 'bark' : 'sleep' }) +
        (loud ? '<path class="o-wave"' + dl(0) + ' d="M134,108 q10,14 0,28" fill="none" stroke="#ff7a3d" stroke-width="6" stroke-linecap="round"/><path class="o-wave"' + dl(0.25) + ' d="M150,96 q18,26 0,52" fill="none" stroke="#ff7a3d" stroke-width="6" stroke-linecap="round"/><path class="o-wave"' + dl(0.5) + ' d="M166,84 q26,38 0,76" fill="none" stroke="#ff7a3d" stroke-width="6" stroke-linecap="round"/>'
          : '<g class="o-zzz" fill="#7aa6ff" font-family="system-ui,sans-serif" font-weight="800"><text x="128" y="78" font-size="20">z</text><text x="144" y="58" font-size="26">z</text><text x="162" y="34" font-size="32">Z</text></g>');
    },
    face: function (pole) {
      var loud = pole === 'loud';
      return '<circle cx="90" cy="104" r="56" fill="#f6c9a0" ' + S + '/><path d="M34,96 Q34,40 90,40 Q146,40 146,96 Q120,66 90,66 Q60,66 34,96Z" fill="#4a3428"/>' +
        (loud ? '<circle cx="70" cy="96" r="6" fill="' + INK + '"/><circle cx="110" cy="96" r="6" fill="' + INK + '"/><ellipse cx="90" cy="132" rx="20" ry="16" fill="#a83a3a" ' + S + '/>' +
          '<path class="o-wave"' + dl(0) + ' d="M152,96 q10,16 0,32" fill="none" stroke="#ff7a3d" stroke-width="6" stroke-linecap="round"/><path class="o-wave"' + dl(0.25) + ' d="M168,82 q18,30 0,60" fill="none" stroke="#ff7a3d" stroke-width="6" stroke-linecap="round"/>'
          : '<path d="M60,98 q8,6 16,0 M104,98 q8,6 16,0" fill="none" ' + S + '/><ellipse cx="90" cy="132" rx="8" ry="5" fill="#c46a6a"/><path d="M90,180 L90,130 q0,-8 6,-8 q6,0 6,8 V180" fill="#f6c9a0" ' + S + '/>');
    },
    arrow: function (pole) {
      var up = pole === 'up';
      return ground(186) + (up ? '<g class="o-up"><circle cx="100" cy="46" r="24" fill="#ff9f43" ' + S + '/></g><path d="M100,176 V96 M76,118 L100,94 L124,118" fill="none" stroke="#3aa0ff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M100,16 V96 M76,74 L100,98 L124,74" fill="none" stroke="#3aa0ff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><g class="o-down"><circle cx="100" cy="160" r="24" fill="#ff9f43" ' + S + '/></g>');
    },
    balloon: function (pole) {
      var up = pole === 'up', y = up ? 56 : 128;
      return ground(186) + '<g class="' + (up ? 'o-up' : 'o-down-soft') + '"><path d="M100,' + (y + 44) + ' q-8,14 4,26 q8,10 -2,22" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<ellipse cx="100" cy="' + y + '" rx="30" ry="38" fill="#ff5d73" ' + S + '/><path d="M96,' + (y + 38) + ' l4,8 l4,-8Z" fill="#ff5d73" ' + S2 + '/><path d="M86,' + (y - 18) + ' q-6,10 -4,22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>' +
        (up ? '<path d="M40,150 V110 M28,122 L40,108 L52,122" fill="none" stroke="#3aa0ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M40,60 V100 M28,88 L40,102 L52,88" fill="none" stroke="#3aa0ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    plane: function (pole) {
      var up = pole === 'up';
      return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#dff3ff"/><rect x="4" y="170" width="192" height="26" rx="10" fill="#9aa3b2"/><path d="M20,183 h20 M60,183 h20 M100,183 h20 M140,183 h20" stroke="#fff" stroke-width="4"/>' +
        '<g class="' + (up ? 'o-takeoff' : 'o-land') + '"><g transform="translate(100,' + (up ? 70 : 128) + ') rotate(' + (up ? -24 : 18) + ')">' +
        '<path d="M-60,0 Q-60,-12 -44,-12 H44 Q66,-12 70,0 Q66,12 44,12 H-44 Q-60,12 -60,0Z" fill="#ffffff" ' + S + '/><path d="M-8,-10 L-30,-44 H-16 L18,-10Z M-8,10 L-24,36 H-12 L14,10Z M-56,-8 L-66,-30 H-56 L-40,-10Z" fill="#7aa6ff" ' + S2 + '/>' +
        '<circle cx="30" cy="-2" r="4" fill="#7aa6ff"/><circle cx="16" cy="-2" r="4" fill="#7aa6ff"/><circle cx="2" cy="-2" r="4" fill="#7aa6ff"/></g></g>';
    },
    pillow: function () { return ground(178) + '<g class="o-squish">' + PILLOW(100, 140, 1.15) + '</g>' + finger(104, 100, 'o-press'); },
    rock: function () { return ground(178) + ROCK(100, 140, 1.05) + finger(104, 94, 'o-knockf') + '<g class="o-knock"><path d="M70,84 l-10,-8 M136,84 l10,-8 M100,74 v-12" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/></g>'; },
    teddy: function () {
      return ground(182) + '<g class="o-squish"><g transform="translate(100,124)"><circle cx="-34" cy="-44" r="14" fill="#c98b5e" ' + S + '/><circle cx="34" cy="-44" r="14" fill="#c98b5e" ' + S + '/><ellipse cx="0" cy="34" rx="40" ry="26" fill="#c98b5e" ' + S + '/>' +
        '<circle cx="0" cy="-20" r="38" fill="#d9a066" ' + S + '/><ellipse cx="0" cy="-6" rx="14" ry="10" fill="#f3d9b5"/><circle cx="-13" cy="-28" r="4" fill="' + INK + '"/><circle cx="13" cy="-28" r="4" fill="' + INK + '"/><circle cx="0" cy="-10" r="4" fill="' + INK + '"/></g></g>' + finger(150, 112, 'o-press');
    },
    block: function () {
      return ground(182) + '<path d="M50,96 L72,74 H158 L136,96Z" fill="#e8b97c" ' + S + '/><path d="M136,96 L158,74 V160 L136,182Z" fill="#c98b5e" ' + S + '/><rect x="50" y="96" width="86" height="86" fill="#d9a066" ' + S + '/>' +
        '<text x="93" y="158" text-anchor="middle" font-family="system-ui,sans-serif" font-size="48" font-weight="800" fill="#ff5d73">A</text>' + finger(100, 66, 'o-knockf') +
        '<g class="o-knock"><path d="M74,58 l-10,-8 M128,58 l10,-8" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/></g>';
    }
  };

  /* ---------- Pairs, poles and exemplars ---------- */
  // avoid: pairs never mixed with this one as a distractor (they look alike, e.g. day/night and light/dark).
  var PAIRS = [
    { id: 'hotcold', a: 'hot', b: 'cold', avoid: [] },
    { id: 'bigsmall', a: 'big', b: 'small', avoid: [] },
    { id: 'daynight', a: 'day', b: 'night', avoid: ['lightdark'] },
    { id: 'lightdark', a: 'light', b: 'dark', avoid: ['daynight'] },
    { id: 'wetdry', a: 'wet', b: 'dry', avoid: [] },
    { id: 'fullempty', a: 'full', b: 'empty', avoid: [] },
    { id: 'openclosed', a: 'open', b: 'closed', avoid: [] },
    { id: 'fastslow', a: 'fast', b: 'slow', avoid: [] },
    { id: 'loudquiet', a: 'loud', b: 'quiet', avoid: [] },
    { id: 'updown', a: 'up', b: 'down', avoid: [] },
    { id: 'softhard', a: 'soft', b: 'hard', avoid: [] }
  ];
  // [pole, drawing, prototype?]  The prototype is the clearest picture; level 1 uses only prototypes.
  var EX_LIST = [
    ['hot', 'mug', 1], ['hot', 'fire'], ['hot', 'thermo'], ['cold', 'ice', 1], ['cold', 'snowman'], ['cold', 'thermo'],
    ['big', 'ball', 1], ['big', 'fish'], ['big', 'tree'], ['small', 'ball', 1], ['small', 'fish'], ['small', 'tree'],
    ['day', 'sky', 1], ['day', 'house'], ['day', 'park'], ['night', 'sky', 1], ['night', 'house'], ['night', 'park'],
    ['light', 'lamp', 1], ['light', 'torch'], ['light', 'bulb'], ['dark', 'lamp', 1], ['dark', 'torch'], ['dark', 'bulb'],
    ['wet', 'shirt', 1], ['wet', 'towel'], ['wet', 'dog'], ['dry', 'shirt', 1], ['dry', 'towel'], ['dry', 'dog'],
    ['full', 'glass', 1], ['full', 'jar'], ['full', 'basket'], ['empty', 'glass', 1], ['empty', 'jar'], ['empty', 'basket'],
    ['open', 'door', 1], ['open', 'box'], ['open', 'window'], ['closed', 'door', 1], ['closed', 'box'], ['closed', 'window'],
    ['fast', 'rabbit', 1], ['fast', 'car'], ['slow', 'snail', 1], ['slow', 'car'],
    ['loud', 'speaker', 1], ['loud', 'barkdog'], ['loud', 'face'], ['quiet', 'speaker', 1], ['quiet', 'barkdog'], ['quiet', 'face'],
    ['up', 'arrow', 1], ['up', 'balloon'], ['up', 'plane'], ['down', 'arrow', 1], ['down', 'balloon'], ['down', 'plane'],
    ['soft', 'pillow', 1], ['soft', 'teddy'], ['hard', 'rock', 1], ['hard', 'block']
  ];
  var POLE = {};
  PAIRS.forEach(function (p) { POLE[p.a] = { id: p.a, pair: p.id, opp: p.b }; POLE[p.b] = { id: p.b, pair: p.id, opp: p.a }; });
  var EX = EX_LIST.map(function (e) { return { id: e[0] + '_' + e[1], pole: e[0], pair: POLE[e[0]].pair, d: e[1], proto: !!e[2] }; });

  /* ---------- Situations (level 4) ---------- */
  function kid(o) { // a simple, friendly child. o: shirt, pre face, post face, arms
    var face = function (m) {
      var eyes = m === 'worried' ? '<path d="M86,72 q4,-4 8,0 M106,72 q4,-4 8,0" fill="none" ' + S2 + '/><circle cx="90" cy="78" r="3.5" fill="' + INK + '"/><circle cx="110" cy="78" r="3.5" fill="' + INK + '"/>'
        : m === 'sleep' ? '<path d="M84,78 q6,5 12,0 M104,78 q6,5 12,0" fill="none" ' + S2 + '/>'
        : '<circle cx="90" cy="78" r="4" fill="' + INK + '"/><circle cx="110" cy="78" r="4" fill="' + INK + '"/>';
      var mouth = {
        smile: '<path d="M88,92 q12,12 24,0" fill="none" ' + S + '/>',
        chatter: '<path d="M86,94 l5,-4 l5,4 l5,-4 l5,4 l5,-4 l5,4" fill="none" ' + S2 + '/>',
        pant: '<ellipse cx="100" cy="95" rx="7" ry="6" fill="#a83a3a" ' + S2 + '/>',
        sad: '<path d="M90,98 q10,-8 20,0" fill="none" ' + S + '/>',
        worried: '<path d="M92,96 q8,-5 16,0" fill="none" ' + S + '/>',
        tongue: '<path d="M90,93 h20" ' + S + '/><path d="M96,93 q4,10 8,0" fill="#ff8fb1" ' + S2 + '/>',
        o: '<ellipse cx="100" cy="95" rx="5" ry="6" fill="#a83a3a" ' + S2 + '/>'
      }[m === 'worried' ? 'worried' : m] || '';
      return eyes + mouth;
    };
    var cheeks = function (c) { return c ? '<circle cx="80" cy="88" r="6" fill="' + c + '" opacity=".6"/><circle cx="120" cy="88" r="6" fill="' + c + '" opacity=".6"/>' : ''; };
    var arms = o.arms === 'crossed' ? '<path d="M70,126 Q100,146 130,126" fill="none" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M70,126 Q100,146 130,126" fill="none" stroke="' + o.shirt + '" stroke-width="10" stroke-linecap="round"/>'
      : o.arms === 'tummy' ? '<path d="M70,120 Q74,146 100,146" fill="none" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M70,120 Q74,146 100,146" fill="none" stroke="' + o.shirt + '" stroke-width="10" stroke-linecap="round"/><path d="M130,120 L138,160" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M130,120 L138,160" stroke="' + o.shirt + '" stroke-width="10" stroke-linecap="round"/>'
      : '<path d="M70,120 L60,160 M130,120 L140,160" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/><path d="M70,120 L60,160 M130,120 L140,160" stroke="' + o.shirt + '" stroke-width="10" stroke-linecap="round"/>';
    return '<g class="' + (o.cls || '') + '"><path d="M68,124 Q68,108 84,108 H116 Q132,108 132,124 V180 H68Z" fill="' + o.shirt + '" ' + S + '/>' + arms +
      '<circle cx="100" cy="80" r="28" fill="#f6c9a0" ' + S + '/><path d="M72,76 Q72,48 100,48 Q128,48 128,76 Q114,62 100,62 Q86,62 72,76Z" fill="#4a3428" ' + S2 + '/>' +
      '<g class="s-pre">' + face(o.pre) + cheeks(o.preCheek) + '</g><g class="s-post">' + face(o.post || 'smile') + cheeks('#ff8fb1') + '</g>' + (o.extra || '') + '</g>';
  }
  var SITS = [
    { id: 'cold', pair: 'hotcold', answer: 'soup', wrong: 'icecream', sfx: 'hot',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#e3f2ff"/>' + snowfall([[24, 30], [176, 40], [170, 120, 5], [28, 130, 5], [150, 20, 5]]) +
          kid({ shirt: '#7aa6ff', pre: 'chatter', preCheek: '#7cc4ff', arms: 'crossed', cls: 's-shiver' }) +
          '<g class="s-post">' + BOWL(100, 160, 0.62, true) + '</g>';
      } },
    { id: 'hot', pair: 'hotcold', answer: 'icecream', wrong: 'soup', sfx: 'cold',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#fff1d6"/><g class="s-pre">' + sun(160, 38, 18, 'o-sunspin') + '</g>' +
          kid({ shirt: '#ffb86b', pre: 'pant', preCheek: '#ff5d5d', arms: 'down' }) +
          '<g class="s-pre">' + drop(70, 66, 0.8, '#9fd8ff', 'o-drip', 0) + drop(132, 70, 0.8, '#9fd8ff', 'o-drip', 0.8) + '</g>' +
          '<g class="s-post">' + ICECREAM(146, 132, 0.62) + '</g>';
      } },
    { id: 'wet', pair: 'wetdry', answer: 'towel', wrong: 'bucket', sfx: 'dry',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#e6ecf5"/><g class="s-pre">' + cloud(100, 24, 0.9, '#cfd8e6') +
          '<g class="o-rain"><path d="M40,40 l-4,12 M160,40 l-4,12 M30,96 l-4,12 M170,92 l-4,12 M48,140 l-4,12 M156,140 l-4,12" stroke="#4fa8ff" stroke-width="4" stroke-linecap="round"/></g></g>' +
          kid({ shirt: '#3c7fd6', pre: 'sad', arms: 'down' }) +
          '<g class="s-pre">' + drop(76, 104, 0.8, null, 'o-drip', 0) + drop(124, 104, 0.8, null, 'o-drip', 0.6) + '<ellipse cx="100" cy="186" rx="60" ry="6" fill="#7cc4ff" opacity=".7"/></g>' +
          '<g class="s-post"><path d="M64,112 Q100,132 136,112 L140,142 Q100,156 60,142Z" fill="#ffd166" ' + S + '/><path d="M64,126 Q100,144 136,126" fill="none" stroke="#ff8fb1" stroke-width="4"/><path d="M70,64 Q100,34 130,64 Q100,52 70,64Z" fill="#ffd166" ' + S + '/></g>';
      } },
    { id: 'dark', pair: 'lightdark', answer: 'lampOn', wrong: 'lampOff', sfx: 'light',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#fff4cc"/><g class="s-post">' + LAMP(160, 112, 0.55, true) + '</g>' +
          kid({ shirt: '#b28dff', pre: 'worried', arms: 'down' }) +
          '<rect class="s-pre s-dark" x="4" y="4" width="192" height="192" rx="24" fill="#0b0d1c" opacity=".72"/>';
      } },
    { id: 'hungry', pair: 'fullempty', answer: 'plateFull', wrong: 'plateEmpty', sfx: 'full',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#fff3e3"/>' +
          kid({ shirt: '#5fbf63', pre: 'o', arms: 'tummy' }) +
          '<g class="s-pre o-rumble"><path d="M140,130 q6,-6 12,0 t12,0 M144,146 q6,-6 12,0 t12,0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></g>' +
          '<g class="s-post">' + PLATE(100, 172, 0.7, true) + '</g>';
      } },
    { id: 'thirsty', pair: 'fullempty', answer: 'glassFull', wrong: 'glassEmpty', sfx: 'full',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#fff1d6"/><g class="s-pre">' + sun(160, 38, 16) + '</g>' +
          kid({ shirt: '#ff8fb1', pre: 'tongue', arms: 'down' }) +
          '<g class="s-post">' + GLASS(150, 136, 0.42, 1) + '</g>';
      } },
    { id: 'baby', pair: 'loudquiet', answer: 'shh', wrong: 'drum', sfx: 'quiet',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#2a3166"/>' + moon(40, 40, 16, '#2a3166') + star5(160, 34, 5) + star5(130, 22, 4) +
          '<path d="M30,120 H170 V170 H30Z" fill="#c98b5e" ' + S + '/><path d="M40,120 V170 M60,120 V170 M80,120 V170 M100,120 V170 M120,120 V170 M140,120 V170 M160,120 V170" stroke="#a8743f" stroke-width="4"/>' +
          '<path d="M30,170 V186 M170,170 V186" ' + S + ' stroke-width="5"/>' +
          '<ellipse cx="100" cy="114" rx="56" ry="16" fill="#cfe3ff" ' + S + '/><circle cx="76" cy="102" r="18" fill="#f6c9a0" ' + S + '/><path d="M68,102 q4,4 8,0 M80,102 q4,4 8,0" fill="none" ' + S2 + '/>' +
          '<g class="o-zzz" fill="#cfe3ff" font-family="system-ui,sans-serif" font-weight="800"><text x="96" y="80" font-size="18">z</text><text x="112" y="62" font-size="24">z</text><text x="130" y="42" font-size="30">Z</text></g>' +
          '<g class="s-post">' + '<path d="M150,86 c-6,-10 -20,-4 -14,8 l14,12 l14,-12 c6,-12 -8,-18 -14,-8Z" fill="#ff8fb1"/></g>';
      } },
    { id: 'door', pair: 'openclosed', answer: 'doorOpen', wrong: 'doorClosed', sfx: 'open',
      scene: function () {
        return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#f3e6d6"/>' +
          '<rect x="108" y="30" width="76" height="152" fill="#bfe9ff" ' + S + '/><path d="M110,140 H182 V180 H110Z" fill="#7ccf6b"/>' + sun(160, 66, 12) +
          '<g class="s-door"><rect x="110" y="32" width="72" height="148" fill="#a86c44" ' + S + '/><circle cx="172" cy="108" r="5" fill="#ffd166" ' + S2 + '/></g>' +
          '<g transform="translate(-36,8) scale(.92)">' + kid({ shirt: '#ff9f43', pre: 'worried', arms: 'down', extra: '<circle cx="140" cy="168" r="14" fill="#5bb8ff" ' + S + '/>' }) + '</g>';
      } }
  ];
  // Situation answer items (cards). Drawn in the scene viewBox (200x200).
  var ITEMS = {
    soup: function () { return BOWL(100, 120, 1.2, true); },
    icecream: function () { return ICECREAM(100, 100, 1.25); },
    towel: function () { return TOWEL(100, 104, 1.25, false); },
    bucket: function () { return BUCKET(100, 120, 1.25); },
    lampOn: function () { return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#fff4cc"/>' + LAMP(100, 104, 1, true); },
    lampOff: function () { return '<rect x="4" y="4" width="192" height="192" rx="24" fill="#1a1d33"/>' + LAMP(100, 104, 1, false); },
    plateFull: function () { return PLATE(100, 110, 1.3, true); },
    plateEmpty: function () { return PLATE(100, 110, 1.3, false); },
    glassFull: function () { return GLASS(100, 104, 1.1, 1); },
    glassEmpty: function () { return GLASS(100, 104, 1.1, 0); },
    shh: function () { return SHH(100, 92, 1.5); },
    drum: function () { return DRUM(100, 120, 1.3); },
    doorOpen: function () { return DOOR(100, 100, 1.1, true); },
    doorClosed: function () { return DOOR(100, 100, 1.1, false); }
  };
  var ITEM_POLE = { soup: 'hot', icecream: 'cold', towel: 'dry', bucket: 'wet', lampOn: 'light', lampOff: 'dark', plateFull: 'full', plateEmpty: 'empty',
    glassFull: 'full', glassEmpty: 'empty', shh: 'quiet', drum: 'loud', doorOpen: 'open', doorClosed: 'closed' };

  function sparkles() {
    var pts = [[30, 34, 1], [172, 30, .8], [182, 150, 1], [20, 160, .7], [100, 12, .9]];
    return '<g class="o-sparks">' + pts.map(function (p, i) {
      var x = p[0], y = p[1], r = 11 * p[2];
      return '<path class="o-spark"' + dl(i * 0.07) + ' d="M' + x + ',' + (y - r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + r) + ' Q' + x + ',' + y + ' ' + (x - r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - r) + 'Z" fill="#ffd166"/>';
    }).join('') + '</g>';
  }

  window.HFBOppArt = {
    PAIRS: PAIRS, POLE: POLE, EX: EX, SITS: SITS, ITEM_POLE: ITEM_POLE,
    symbolSVG: function (pole) { return svg('0 0 100 100', SYM[pole]()); },
    exSVG: function (ex, withSparks) { return svg('0 0 200 200', DRAW[ex.d](ex.pole) + (withSparks ? sparkles() : ''), 'scene p-' + ex.d + ' pole-' + ex.pole); },
    sitSVG: function (sit) { return svg('0 0 200 200', sit.scene() + sparkles(), 'scene sit sit-' + sit.id); },
    itemSVG: function (id) { return svg('0 0 200 200', ITEMS[id](), 'scene item'); }
  };
})();
