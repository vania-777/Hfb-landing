/* HFB Play Together — shared session log + Live view sharing (used by all four games).
   - Trial log: every presentation (round) and every response (trial) of this session, kept in
     memory and in localStorage on this device only (key hfb-session-cur-<game>).
   - Live view: the adult can share the session read-only with watchers (therapist, parent) on
     other phones. Peer-to-peer with the vendored PeerJS (data channel only, no audio/video);
     the PeerJS public broker (0.peerjs.com) only introduces the devices. Nothing is stored on a
     server. Access is by a random private code (no accounts).
   Games call: HFBSession.init({game, name:{en,fa}}); HFBSession.round({...}); HFBSession.log({...}).
   The UI lives only in the Adult panel (never in the child's view). */
(function () {
  'use strict';
  var VER = '20261007-3';
  var PEER_PREFIX = 'hfb-live-';
  var CODE_ABC = 'abcdefghjkmnpqrstuvwxyz23456789';
  var SHARE_KEY = 'hfb-live-share', SHARE_MAX_MS = 12 * 3600 * 1000;
  var root = document.documentElement;

  function load(k, f) { try { var v = localStorage.getItem(k); return v === null ? f : JSON.parse(v); } catch (e) { return f; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function lang() { return root.lang === 'en' ? 'en' : 'fa'; }
  function randCode(n) {
    var out = '', r;
    try { r = crypto.getRandomValues(new Uint8Array(n * 2)); } catch (e) { r = []; for (var j = 0; j < n * 2; j++) r.push(Math.floor(Math.random() * 256)); }
    for (var i = 0; i < r.length && out.length < n; i++) if (r[i] < 248) out += CODE_ABC[r[i] % CODE_ABC.length]; // unbiased (248 = 8 × 31)
    while (out.length < n) out += CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)];
    return out;
  }
  function prettyCode(c) { return c ? c.slice(0, 4) + '-' + c.slice(4) : ''; }

  var STR = {
    fa: {
      legend: 'نمایش زنده', intro: 'درمانگر یا والد می‌توانند این جلسه را زنده روی گوشی خودشان ببینند (فقط مشاهده).',
      start: 'اشتراک نمایش زنده', starting: 'در حال آماده شدن…', stop: 'توقف اشتراک',
      on: function (n) { return 'نمایش زنده روشن است: ' + n + ' نفر در حال تماشا'; },
      code: 'کد:', copy: 'کپی لینک', copied: 'کپی شد ✓',
      how: 'روی گوشی دیگر این لینک را باز کنید، یا به highfunctioningbrains.com/play-together/live بروید و کد را وارد کنید. هر کسی که کد را داشته باشد می‌تواند تماشا کند؛ آن را فقط با افراد مورد اعتماد به اشتراک بگذارید. حساب کاربری وجود ندارد و چیزی روی سرور ذخیره نمی‌شود.',
      err: 'اتصال برقرار نشد. اینترنت را بررسی کنید؛ دوباره تلاش می‌کنیم…', noPeer: 'بارگیری ابزار اتصال ممکن نشد. اینترنت را بررسی کنید.',
      trials: function (n) { return 'این جلسه: ' + n + ' پاسخ ثبت شده (فقط روی این دستگاه).'; }
    },
    en: {
      legend: 'Live view', intro: 'A therapist or parent can watch this session live on their own phone (view only).',
      start: 'Share live view', starting: 'Getting ready…', stop: 'Stop sharing',
      on: function (n) { return 'Live view on: ' + n + ' watching'; },
      code: 'Code:', copy: 'Copy link', copied: 'Copied ✓',
      how: 'On the other phone, open this link, or go to highfunctioningbrains.com/play-together/live and type the code. Anyone with the code can watch, so share it only with people you trust. There are no accounts and nothing is stored on a server.',
      err: 'Could not connect. Check the internet; trying again…', noPeer: 'Could not load the connection tool. Check the internet.',
      trials: function (n) { return 'This session: ' + n + ' responses recorded (on this device only).'; }
    }
  };
  function t(k) { return STR[lang()][k]; }

  /* ---------------- Session log ---------------- */
  var cfg = null, session = null, cur = null, shownAt = 0, listeners = [];
  function curKey() { return 'hfb-session-cur-' + cfg.game; }
  function newSession() {
    return { v: 1, id: randCode(10), game: cfg.game, name: cfg.name, created: Date.now(), start: null, end: null, child: '', trials: [] };
  }
  function persist() { if (session) save(curKey(), session); }
  function emit(type, data) {
    listeners.forEach(function (fn) { try { fn(type, data); } catch (e) {} });
    live.broadcast(type, data);
  }
  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }

  var HFBSession = {
    init: function (opts) {
      cfg = { game: opts.game, name: opts.name || { en: opts.game, fa: opts.game } };
      var prev = load('hfb-session-cur-' + cfg.game, null);
      if (prev && prev.trials && prev.trials.length) { // a session left open (page closed or reloaded): keep it in the history
        prev.end = prev.end || prev.trials[prev.trials.length - 1].t;
        var hist = load('hfb-session-history', []);
        hist.unshift(prev); if (hist.length > 100) hist.length = 100;
        if (!save('hfb-session-history', hist)) { hist.length = Math.min(hist.length, 20); save('hfb-session-history', hist); }
      }
      session = newSession(); persist();
      ui.mount();
      live.autoResume();
      return HFBSession;
    },
    /* A new question/picture is shown. r = {level, levelName:{en,fa}, key, target:{en,fa}, stimulus:{en,fa}?, choices:[{id,en,fa}]} */
    round: function (r) {
      if (!session) return;
      shownAt = Date.now();
      cur = clone(r); cur.t = shownAt;
      emit('round', cur);
    },
    /* A response. x = {response:{id,en,fa}, correct:true|false|null, prompted:bool, prompt:'…', via:'…'} */
    log: function (x) {
      if (!session || !cur) return null;
      var now = Date.now(), key = cur.key;
      var n = 0; session.trials.forEach(function (tr) { if (tr.key === key) n++; });
      var tr = {
        i: session.trials.length + 1, t: now,
        level: cur.level, levelName: cur.levelName, key: key, target: cur.target, stimulus: cur.stimulus || null,
        choices: cur.choices || [], response: x.response || null,
        correct: x.correct === true ? true : x.correct === false ? false : null,
        prompted: !!x.prompted, prompt: x.prompted ? (x.prompt || '') : '',
        attempt: n + 1, latency: shownAt ? Math.round((now - shownAt) / 100) / 10 : null
      };
      if (x.via) tr.via = x.via;
      if (session.start == null) session.start = shownAt || now;
      shownAt = now; // the next attempt on the same question is timed from this answer
      session.trials.push(tr);
      if (session.trials.length > 3000) session.trials.shift();
      persist();
      emit('trial', tr);
      ui.refresh();
      return tr;
    },
    current: function () { return clone(session); },
    currentRound: function () { return clone(cur); },
    on: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    live: null // filled below
  };

  /* ---------------- Live view host (this device = the child's device) ---------------- */
  var live = {
    peer: null, code: null, conns: [], on: false, status: '', timer: null, retry: 0,
    snapshot: function () {
      return { t: 'snap', v: 1, session: clone(session), round: clone(cur), sentAt: Date.now() };
    },
    send: function (c, msg) { if (c.open) { try { c.send(msg); } catch (e) {} } },
    broadcast: function (type, data) {
      if (!live.on || !live.conns.length) return;
      var msg = { t: type, sid: session && session.id };
      if (type === 'round') msg.round = data; else if (type === 'trial') msg.trial = data; else return;
      live.conns.forEach(function (c) { live.send(c, msg); });
    },
    loadPeer: function (cb) {
      if (window.Peer) { cb(null); return; }
      var s = document.createElement('script');
      s.src = '../choice-reward/vendor/peerjs.min.js?v=' + VER;
      s.onload = function () { cb(window.Peer ? null : 'missing'); };
      s.onerror = function () { cb('load'); };
      document.head.appendChild(s);
    },
    start: function (code) {
      if (live.on) return;
      live.on = true; live.code = code || randCode(8); live.retry = 0;
      save(SHARE_KEY, { code: live.code, since: (load(SHARE_KEY, {}) || {}).since || Date.now() });
      live.status = 'starting'; ui.refresh();
      live.loadPeer(function (err) {
        if (err) { live.status = 'noPeer'; ui.refresh(); return; }
        if (live.on) live.open();
      });
    },
    open: function () {
      if (!live.on) return;
      var peer;
      try { peer = live.peer = new window.Peer(PEER_PREFIX + live.code, { debug: 1 }); } catch (e) { live.status = 'err'; ui.refresh(); return; }
      peer.on('open', function () { if (live.peer !== peer) return; live.status = 'on'; live.retry = 0; ui.refresh(); });
      peer.on('connection', function (c) {
        c.lastSeen = Date.now();
        c.on('open', function () {
          if (!live.on) { try { c.close(); } catch (e) {} return; }
          live.conns.push(c); live.send(c, live.snapshot()); ui.refresh();
        });
        c.on('data', function (m) { c.lastSeen = Date.now(); if (m && m.t === 'snapReq') live.send(c, live.snapshot()); });
        var gone = function () { var i = live.conns.indexOf(c); if (i >= 0) { live.conns.splice(i, 1); ui.refresh(); } };
        c.on('close', gone); c.on('error', gone);
      });
      peer.on('disconnected', function () {
        if (peer.destroyed || live.peer !== peer) return;
        setTimeout(function () { if (!peer.destroyed && peer.disconnected) { try { peer.reconnect(); } catch (e) {} } }, 1500);
      });
      peer.on('error', function (e) {
        if (live.peer !== peer) return;
        var type = e && e.type;
        if (type === 'peer-unavailable') return;
        // e.g. 'unavailable-id' right after a reload (the broker still holds the old connection for a moment): retry with the same code
        live.status = 'err'; ui.refresh();
        try { peer.destroy(); } catch (x) {}
        live.peer = null;
        clearTimeout(live.timer);
        live.timer = setTimeout(function () { if (live.on) live.open(); }, Math.min(15000, 3000 + 2000 * live.retry++));
      });
    },
    stop: function () {
      live.on = false; clearTimeout(live.timer);
      live.conns.forEach(function (c) { live.send(c, { t: 'bye' }); });
      var p = live.peer;
      setTimeout(function () { try { if (p) p.destroy(); } catch (e) {} }, 300);
      live.peer = null; live.conns = []; live.code = null; live.status = '';
      del(SHARE_KEY); ui.refresh();
    },
    autoResume: function () { // sharing stays on across reloads and game switches until "Stop sharing" (max 12 h)
      var s = load(SHARE_KEY, null);
      if (!s || !s.code || !/^[a-z2-9]{8}$/.test(s.code)) return;
      if (!s.since || Date.now() - s.since > SHARE_MAX_MS) { del(SHARE_KEY); return; }
      live.start(s.code);
    },
    link: function () { return live.code ? new URL('../live/?code=' + live.code, location.href).href : ''; }
  };
  setInterval(function () { // heartbeat; drop watchers that went silent
    if (!live.on) return;
    var now = Date.now(), before = live.conns.length, stale = [];
    live.conns = live.conns.slice().filter(function (c) {
      if (now - c.lastSeen > 12000 || !c.open) { stale.push(c); return false; }
      live.send(c, { t: 'ping' }); return true;
    });
    // close after filtering: c.close() fires 'close' -> gone(), which must not mutate the list mid-iteration
    stale.forEach(function (c) { try { c.close(); } catch (e) {} });
    if (live.conns.length !== before) ui.refresh();
  }, 3000);
  window.addEventListener('pagehide', function () { if (live.on) live.conns.forEach(function (c) { live.send(c, { t: 'bye', reload: true }); }); });
  HFBSession.live = {
    start: function () { live.start(); }, stop: function () { live.stop(); },
    isOn: function () { return live.on; }, status: function () { return live.status; },
    watchers: function () { return live.conns.length; }, code: function () { return live.code; }, link: function () { return live.link(); }
  };

  /* ---------------- Adult-panel UI ---------------- */
  var ui = {
    el: null,
    mount: function () {
      var form = document.getElementById('adultForm');
      if (!form || ui.el) return;
      var f = document.createElement('fieldset');
      f.className = 'field hfb-sess'; f.id = 'hfbSessionField';
      f.innerHTML =
        '<legend id="hfbLiveLegend"></legend>' +
        '<p class="hint" id="hfbLiveIntro"></p>' +
        '<button type="button" class="pill-btn" id="hfbLiveStart"><span aria-hidden="true">📡</span> <span id="hfbLiveStartText"></span></button>' +
        '<div id="hfbLiveOn" class="hfb-live-on" hidden>' +
        '  <p class="hfb-live-badge" id="hfbLiveStatus" role="status" aria-live="polite"></p>' +
        '  <p class="hfb-live-code"><span id="hfbLiveCodeLabel"></span> <strong id="hfbLiveCode" dir="ltr"></strong></p>' +
        '  <div class="hfb-live-linkrow"><input id="hfbLiveLink" type="text" readonly dir="ltr" aria-labelledby="hfbLiveCodeLabel">' +
        '  <button type="button" class="pill-btn small" id="hfbLiveCopy"><span id="hfbLiveCopyText"></span></button></div>' +
        '  <p class="hint" id="hfbLiveHow"></p>' +
        '  <button type="button" class="pill-btn hfb-stop" id="hfbLiveStop"><span aria-hidden="true">⏹</span> <span id="hfbLiveStopText"></span></button>' +
        '</div>' +
        '<p class="hint" id="hfbTrialCount"></p>';
      var head = form.querySelector('.panel-head');
      if (head && head.nextSibling) form.insertBefore(f, head.nextSibling); else form.appendChild(f);
      ui.el = f;
      f.querySelector('#hfbLiveStart').addEventListener('click', function () { live.start(); });
      f.querySelector('#hfbLiveStop').addEventListener('click', function () { live.stop(); });
      f.querySelector('#hfbLiveCopy').addEventListener('click', function () {
        var v = live.link(), txt = f.querySelector('#hfbLiveCopyText');
        var ok = function () { txt.textContent = t('copied'); setTimeout(function () { txt.textContent = t('copy'); }, 1800); };
        var inp = f.querySelector('#hfbLiveLink');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok, function () { inp.select(); });
        else { inp.select(); try { document.execCommand('copy'); ok(); } catch (e) {} }
      });
      try { new MutationObserver(function () { ui.refresh(); }).observe(root, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}
      ui.refresh();
    },
    refresh: function () {
      var f = ui.el; if (!f) return;
      var q = function (id) { return f.querySelector('#' + id); };
      q('hfbLiveLegend').textContent = t('legend');
      q('hfbLiveIntro').textContent = t('intro');
      q('hfbLiveStartText').textContent = t('start');
      q('hfbLiveStopText').textContent = t('stop');
      q('hfbLiveCodeLabel').textContent = t('code');
      if (q('hfbLiveCopyText').textContent !== t('copied')) q('hfbLiveCopyText').textContent = t('copy');
      q('hfbLiveHow').textContent = t('how');
      q('hfbLiveStart').hidden = live.on;
      q('hfbLiveOn').hidden = !live.on;
      q('hfbLiveCode').textContent = prettyCode(live.code);
      q('hfbLiveLink').value = live.link();
      var st = live.status;
      q('hfbLiveStatus').textContent = st === 'on' ? t('on')(live.conns.length) : st === 'err' ? t('err') : st === 'noPeer' ? t('noPeer') : t('starting');
      q('hfbLiveStatus').className = 'hfb-live-badge' + (st === 'on' ? ' ok' : st === 'err' || st === 'noPeer' ? ' warn' : '');
      q('hfbTrialCount').textContent = t('trials')(session ? session.trials.length : 0);
    }
  };

  window.HFBSession = HFBSession;
})();
