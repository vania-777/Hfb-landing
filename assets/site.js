/* HFB — shared site script: three-state theme (dark → dim → light), mobile menu, and the
   "I'm a…" view switcher. No tracking, no network requests. Saved in localStorage:
   "hfb-theme" (shared with the games), "hfb-audience" (families | therapists | adults | investors)
   and "hfb-visited" (the welcome page has been used, so it is skipped on later visits from outside). */
(function () {
  'use strict';
  var root = document.documentElement;
  var ORDER = ['dark', 'dim', 'light'];
  var NAMES = { dark: 'Dark', dim: 'Dim', light: 'Light' };

  function current() {
    var t = root.getAttribute('data-theme');
    return ORDER.indexOf(t) > -1 ? t : 'dark';
  }
  function paint(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    var next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    var label = btn.querySelector('.theme-label');
    if (label) label.textContent = NAMES[theme];
    btn.setAttribute('aria-label', 'Color theme: ' + NAMES[theme] + '. Switch to ' + NAMES[next] + '.');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim() || '#080c22');
  }

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length];
      try { localStorage.setItem('hfb-theme', next); } catch (e) {}
      paint(next);
    });
  }
  paint(current());

  /* ---------- View switcher ("I'm a…") + picked-for-you bands ---------- */
  var AUD = {
    families: { short: 'Families', long: 'Families & caregivers' },
    therapists: { short: 'Therapists', long: 'Therapists & educators' },
    adults: { short: 'ND adults', long: 'Neurodivergent adults' },
    investors: { short: 'Investors', long: 'Investors & partners' }
  };
  function getAud() { try { var a = localStorage.getItem('hfb-audience'); return AUD[a] ? a : null; } catch (e) { return null; } }
  function setAud(a) {
    try { if (AUD[a]) localStorage.setItem('hfb-audience', a); localStorage.setItem('hfb-visited', '1'); } catch (e) {}
  }
  var forParam = /[?&]for=(families|therapists|adults|investors)\b/.exec(location.search);
  if (forParam) setAud(forParam[1]);

  function paintAudience() {
    var a = getAud();
    var label = document.querySelector('#viewBtn .view-label');
    var vb = document.getElementById('viewBtn');
    if (label) label.textContent = a ? AUD[a].short : 'I\u2019m a\u2026';
    if (vb) vb.setAttribute('aria-label', a ? 'Change view. Now viewing as: ' + AUD[a].long : 'I\u2019m a\u2026 Choose how to see the site');
    Array.prototype.forEach.call(document.querySelectorAll('#viewMenu [data-aud]'), function (l) {
      if (l.getAttribute('data-aud') === a) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
    // Home hub: show the band for the chosen view (or the neutral one).
    Array.prototype.forEach.call(document.querySelectorAll('[data-for]'), function (b) { b.hidden = b.getAttribute('data-for') !== a; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-for-none]'), function (b) { b.hidden = !!a; });
  }
  paintAudience();

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('a[href]') : null;
    if (!t) return;
    var a = t.getAttribute('data-aud');
    if (a) setAud(a);
    else if (document.body.classList.contains('page-welcome') && t.origin === location.origin) setAud(null); // the welcome page has done its job
  });

  var viewBtn = document.getElementById('viewBtn');
  var viewMenu = document.getElementById('viewMenu');
  if (viewBtn && viewMenu) {
    viewBtn.setAttribute('role', 'button'); // without JS it is a plain link to the welcome page
    var viewOpen = function (open, focusFirst) {
      viewMenu.hidden = !open;
      viewBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && focusFirst) { var f = viewMenu.querySelector('a'); if (f) f.focus(); }
    };
    viewBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = viewMenu.hidden;
      viewOpen(open, open && e.detail === 0); // keyboard activation moves focus into the menu
      if (open && typeof setOpen === 'function') setOpen(false);
    });
    viewBtn.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); viewOpen(true, true); }
    });
    document.addEventListener('click', function (e) {
      if (!viewMenu.hidden && !viewMenu.contains(e.target) && !viewBtn.contains(e.target)) viewOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !viewMenu.hidden) { viewOpen(false); viewBtn.focus(); }
    });
    viewMenu.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var items = Array.prototype.slice.call(viewMenu.querySelectorAll('a'));
      var i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    });
  }

  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('siteNav');
  var setOpen = null;
  if (menuBtn && nav) {
    setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var t = menuBtn.querySelector('.menu-label');
      if (t) t.textContent = open ? 'Close' : 'Menu';
      if (open && viewMenu && !viewMenu.hidden) { viewMenu.hidden = true; viewBtn.setAttribute('aria-expanded', 'false'); }
    };
    menuBtn.addEventListener('click', function () {
      setOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setOpen(false); menuBtn.focus(); }
    });
  }
})();
