/* HFB — shared site script: three-state theme (dark → dim → light) + mobile menu.
   No tracking, no network requests. The theme choice is stored in localStorage
   under "hfb-theme" (shared with the Play Together game). */
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

  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('siteNav');
  if (menuBtn && nav) {
    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var t = menuBtn.querySelector('.menu-label');
      if (t) t.textContent = open ? 'Close' : 'Menu';
    }
    menuBtn.addEventListener('click', function () {
      setOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setOpen(false); menuBtn.focus(); }
    });
  }
})();
