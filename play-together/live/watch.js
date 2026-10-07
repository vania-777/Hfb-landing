/* HFB Live view — watcher page (read-only). Connects peer-to-peer (PeerJS data channel) to the
   child's device that is sharing with a private code, gets a snapshot of the session so far and
   then every new question and attempt. Nothing is stored on a server; nothing is saved here. */
(function () {
  'use strict';
  var PEER_PREFIX = 'hfb-live-';
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var L = function () { return root.lang === 'en' ? 'en' : 'fa'; };
  var STR = {
    fa: {
      title: 'نمایش زنده', codeTitle: 'تماشای زنده‌ی جلسه', codeLabel: 'کد روی دستگاه کودک:', go: 'تماشا',
      codeIntro: 'روی دستگاه کودک، در پنل بزرگسال بازی، «اشتراک نمایش زنده» را بزنید. سپس کد را اینجا وارد کنید.',
      badCode: 'کد ۸ حرفی است، مثلاً abcd-efgh.', lang: 'EN', langAria: 'Switch to English',
      st_connecting: 'در حال اتصال…', st_ok: 'زنده', st_wait: 'منتظر دستگاه کودک… (اشتراک روشن است؟)', st_re: 'اتصال قطع شد؛ دوباره وصل می‌شویم…', st_paused: 'دستگاه کودک اشتراک را متوقف کرد یا صفحه را عوض کرد؛ منتظر می‌مانیم…', st_noPeer: 'ابزار اتصال بارگیری نشد. اینترنت را بررسی کنید.',
      waitingQ: 'منتظر اولین سؤال…', level: function (n, nm) { return 'مرحلهٔ ' + n + (nm ? ' · ' + nm : ''); },
      trials: 'پاسخ‌ها', correct: 'درست', wrong: 'نادرست', pct: 'درصد درست',
      sub: function (i, p, c) { return 'درست بدون کمک: ' + i + ' · درست با کمک: ' + p + (c ? ' · انتخاب آزاد: ' + c : ''); },
      perTarget: 'هر هدف (به ترتیب)', feed: 'همهٔ تلاش‌ها (جدیدترین بالا)', past: 'جلسه‌های قبلی در همین تماشا',
      legend: '✓ درست · ✗ نادرست · ᴾ با کمک (پرامپت) · • انتخاب آزاد (بدون جواب درست)',
      chose: function (r) { return 'انتخاب: ' + r; }, attempt: function (n) { return 'تلاش ' + n; }, helped: 'با کمک', choice: 'انتخاب',
      latency: function (s) { return s + ' ثانیه'; }, noTrials: 'هنوز پاسخی ثبت نشده.',
      privacy: 'فقط مشاهده. این صفحه چیزی ذخیره نمی‌کند و داده از دستگاه کودک مستقیم به این گوشی می‌آید. هر کسی که کد را داشته باشد می‌تواند تماشا کند.',
      pastLine: function (g, n, p) { return g + ' · ' + n + ' پاسخ' + (p != null ? ' · ' + p + '٪ درست' : ''); }
    },
    en: {
      title: 'Live view', codeTitle: 'Watch a session live', codeLabel: 'Code from the child\'s device:', go: 'Watch',
      codeIntro: 'On the child\'s device, open the game\'s Adult panel and tap "Share live view". Then type the code here.',
      badCode: 'The code has 8 letters, like abcd-efgh.', lang: 'فا', langAria: 'تغییر به فارسی',
      st_connecting: 'Connecting…', st_ok: 'Live', st_wait: 'Waiting for the child\'s device… (is sharing on?)', st_re: 'Connection lost; reconnecting…', st_paused: 'The child\'s device stopped sharing or changed page; waiting…', st_noPeer: 'Could not load the connection tool. Check the internet.',
      waitingQ: 'Waiting for the first question…', level: function (n, nm) { return 'Level ' + n + (nm ? ' · ' + nm : ''); },
      trials: 'Responses', correct: 'Correct', wrong: 'Incorrect', pct: '% correct',
      sub: function (i, p, c) { return 'Correct without help: ' + i + ' · correct with help: ' + p + (c ? ' · free choices: ' + c : ''); },
      perTarget: 'Per target (in order)', feed: 'Every attempt (newest first)', past: 'Earlier sessions in this view',
      legend: '✓ correct · ✗ incorrect · ᴾ with a help prompt · • free choice (no right answer)',
      chose: function (r) { return 'Chose: ' + r; }, attempt: function (n) { return 'attempt ' + n; }, helped: 'helped', choice: 'choice',
      latency: function (s) { return s + ' s'; }, noTrials: 'No responses yet.',
      privacy: 'View only. This page saves nothing; the data comes straight from the child\'s device to this phone. Anyone with the code can watch.',
      pastLine: function (g, n, p) { return g + ' · ' + n + ' responses' + (p != null ? ' · ' + p + '% correct' : ''); }
    }
  };
  function t(k) { return STR[L()][k]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lab(o) { // both languages, the page language first
    if (!o) return '';
    var a = L() === 'en' ? o.en : o.fa, b = L() === 'en' ? o.fa : o.en;
    return esc(a || b) + (a && b && a !== b ? ' <span class="muted">· ' + esc(b) + '</span>' : '');
  }
  function one(o) { return o ? (o[L()] || o.en || o.fa || '') : ''; }
  function hhmmss(ms) { var d = new Date(ms), p = function (n) { return (n < 10 ? '0' : '') + n; }; return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); }
  function mark(tr) {
    var p = tr.prompted ? '<span class="p">P</span>' : '';
    if (tr.correct === true) return '<span class="ok">✓' + p + '</span>';
    if (tr.correct === false) return '<span class="no">✗' + p + '</span>';
    return '<span class="muted">•</span>';
  }

  /* ---------- state ---------- */
  var code = (new URLSearchParams(location.search).get('code') || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  var st = { status: 'connecting', sid: null, sessions: {}, order: [], round: null, lastData: 0 };
  var peer = null, conn = null, retryT = null;

  function setStatus(s) { st.status = s; render(); }
  function connectPeer() {
    if (!window.Peer) { setStatus('noPeer'); return; }
    try { peer = new window.Peer({ debug: 1 }); } catch (e) { setStatus('noPeer'); return; }
    peer.on('open', connectHost);
    peer.on('disconnected', function () { setTimeout(function () { if (peer && !peer.destroyed && peer.disconnected) { try { peer.reconnect(); } catch (e) {} } }, 1500); });
    peer.on('error', function (e) {
      var type = e && e.type;
      if (type === 'peer-unavailable') { setStatus('wait'); retry(4000); return; }
      if (st.status !== 'ok') { setStatus('re'); retry(4000); }
    });
  }
  function retry(ms) { clearTimeout(retryT); retryT = setTimeout(connectHost, ms); }
  function connectHost() {
    if (!peer || peer.destroyed) return;
    if (peer.disconnected) { try { peer.reconnect(); } catch (e) {} retry(3000); return; }
    if (conn && conn.open) return;
    var c;
    try { c = peer.connect(PEER_PREFIX + code, { reliable: true }); } catch (e) { retry(4000); return; }
    conn = c;
    c.on('open', function () { if (conn !== c) return; st.lastData = Date.now(); setStatus('ok'); });
    c.on('data', function (m) { if (conn === c) onData(m); });
    var lost = function () { if (conn !== c) return; conn = null; if (st.status === 'ok') setStatus('re'); retry(2500); };
    c.on('close', lost); c.on('error', lost);
  }
  setInterval(function () {
    if (!conn || !conn.open) return;
    try { conn.send({ t: 'ping' }); } catch (e) {}
    if (Date.now() - st.lastData > 12000) { var c = conn; conn = null; try { c.close(); } catch (e) {} setStatus('re'); retry(500); }
  }, 3000);

  function onData(m) {
    if (!m || typeof m !== 'object') return;
    st.lastData = Date.now();
    if (m.t === 'ping') { if (st.status !== 'ok') setStatus('ok'); return; }
    if (m.t === 'bye') { setStatus('paused'); return; }
    if (m.t === 'snap' && m.session) {
      var s = m.session;
      if (!st.sessions[s.id]) st.order.push(s.id);
      st.sessions[s.id] = s; st.sid = s.id; st.round = m.round || null;
      st.status = 'ok'; render(); return;
    }
    var cur = st.sessions[m.sid];
    if (!cur || m.sid !== st.sid) { try { conn.send({ t: 'snapReq' }); } catch (e) {} return; }
    if (m.t === 'round') { st.round = m.round; render(); }
    else if (m.t === 'trial' && m.trial) {
      if (m.trial.i === cur.trials.length + 1) { cur.trials.push(m.trial); render(); }
      else if (m.trial.i > cur.trials.length + 1) { try { conn.send({ t: 'snapReq' }); } catch (e) {} } // missed something: catch up
    }
  }

  function stats(trials) {
    var s = { n: 0, ok: 0, no: 0, ind: 0, pr: 0, choice: 0 };
    trials.forEach(function (tr) {
      if (tr.correct === null) { s.choice++; return; }
      s.n++; if (tr.correct) { s.ok++; if (tr.prompted) s.pr++; else s.ind++; } else s.no++;
    });
    s.pct = s.n ? Math.round(100 * s.ok / s.n) : null;
    return s;
  }

  /* ---------- render ---------- */
  function render() {
    var lg = L();
    root.dir = lg === 'fa' ? 'rtl' : 'ltr';
    document.title = t('title') + ' · HFB';
    $('pageTitle').textContent = t('title');
    $('langBtnText').textContent = t('lang'); $('langBtn').setAttribute('aria-label', t('langAria'));
    $('codeTitle').textContent = t('codeTitle'); $('codeIntro').textContent = t('codeIntro');
    $('codeLabel').textContent = t('codeLabel'); $('codeGo').textContent = t('go');
    var watching = /^[a-z2-9]{8}$/.test(code);
    $('codeForm').hidden = watching; $('watch').hidden = !watching;
    if (!watching) return;
    var stEl = $('status');
    stEl.textContent = t('st_' + st.status);
    stEl.className = 'status ' + (st.status === 'ok' ? 'ok' : 'wait');
    var s = st.sessions[st.sid], r = st.round;
    $('nowGame').innerHTML = s ? lab(s.name) : '';
    $('nowLevel').textContent = r ? t('level')(r.level, one(r.levelName)) : '';
    $('nowQ').innerHTML = r ? lab(r.target) : '';
    $('nowStim').innerHTML = r && r.stimulus ? lab(r.stimulus) : '';
    $('nowChoices').innerHTML = r ? (r.choices || []).map(function (c) { return '<li' + (r.key && c.id && (c.id === r.key || c.id === r.answer) ? ' class="right"' : '') + '>' + lab(c) + '</li>'; }).join('') : '';
    $('nowEmpty').textContent = r ? '' : t('waitingQ');
    var trials = s ? s.trials : [], x = stats(trials);
    $('counts').innerHTML = [[x.n, t('trials')], ['<span class="ok">' + x.ok + '</span>', t('correct')], ['<span class="no">' + x.no + '</span>', t('wrong')], [x.pct == null ? '–' : x.pct + '%', t('pct')]]
      .map(function (a) { return '<li><b>' + a[0] + '</b><span>' + esc(a[1]) + '</span></li>'; }).join('');
    $('countsSub').textContent = t('sub')(x.ind, x.pr, x.choice);
    // per target
    var order = [], by = {};
    trials.forEach(function (tr) { if (!by[tr.key]) { by[tr.key] = { target: tr.target, list: [] }; order.push(tr.key); } by[tr.key].list.push(tr); });
    $('perTargetTitle').textContent = t('perTarget');
    $('targets').innerHTML = order.length ? order.map(function (k) {
      var g = by[k], sc = g.list.filter(function (tr) { return tr.correct !== null; }), ok = sc.filter(function (tr) { return tr.correct; }).length;
      return '<li><span>' + lab(g.target) + (sc.length ? ' <span class="muted small">' + ok + '/' + sc.length + '</span>' : '') + '</span><bdi class="seq ltr" dir="ltr">' + g.list.map(mark).join('') + '</bdi></li>';
    }).join('') : '<li class="muted">' + esc(t('noTrials')) + '</li>';
    $('legend').textContent = t('legend');
    // feed (newest first)
    $('feedTitle').textContent = t('feed');
    $('feed').innerHTML = trials.slice().reverse().map(function (tr) {
      var meta = [t('level')(tr.level, one(tr.levelName)), tr.correct === null ? t('choice') : t('attempt')(tr.attempt)];
      if (tr.latency != null) meta.push(t('latency')(tr.latency));
      if (tr.stimulus) meta.push(one(tr.stimulus));
      return '<li><span class="mark">' + mark(tr) + '</span><span class="what">' + lab(tr.target) + (tr.prompted ? '<span class="tag">' + esc(t('helped')) + '</span>' : '') +
        '<br><span class="muted small">' + esc(t('chose')(one(tr.response))) + '</span></span><span class="time">' + hhmmss(tr.t) + '</span><span class="meta">' + esc(meta.join(' · ')) + '</span></li>';
    }).join('');
    // earlier sessions seen in this view (e.g. the child switched games)
    var past = st.order.filter(function (id) { return id !== st.sid && st.sessions[id].trials.length; });
    $('pastCard').hidden = !past.length; $('pastTitle').textContent = t('past');
    $('past').innerHTML = past.reverse().map(function (id) { var ss = st.sessions[id], y = stats(ss.trials); return '<li>' + esc(t('pastLine')(one(ss.name), ss.trials.length, y.pct)) + '</li>'; }).join('');
    $('privacyNote').textContent = t('privacy');
  }

  /* ---------- events ---------- */
  $('langBtn').addEventListener('click', function () {
    root.lang = L() === 'fa' ? 'en' : 'fa';
    try { localStorage.setItem('hfb-lang', root.lang); } catch (e) {}
    render();
  });
  $('codeFormEl').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('codeInput').value.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!/^[a-z2-9]{8}$/.test(v)) { $('codeErr').hidden = false; $('codeErr').textContent = t('badCode'); return; }
    location.search = '?code=' + v;
  });
  render();
  if (/^[a-z2-9]{8}$/.test(code)) connectPeer();
  window.HFBWatch = { state: function () { return JSON.parse(JSON.stringify(st)); } };
})();
