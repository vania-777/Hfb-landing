/*! HFB RF-523 Full Patch — page.patch.js
 *  - Injects styles.patch.css
 *  - Normalizes logo to transparent original across pages
 *  - Adds 'click title/logo -> Home'
 *  - Centers Conscious Core hero and ensures it's smaller (1/3 width desktop)
 */
(function() {
  const ver = '523';
  // 1) ensure CSS patch is present
  function ensureCss(href) {
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href.includes('styles.patch.css'))) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href + (href.includes('?') ? '&' : '?') + 'v=' + ver;
    document.head.appendChild(link);
  }
  // Attempt to resolve assets path from current page
  const ASSETS = (function(){
    // If current page already has a link/script to assets, infer path
    const hints = [...document.querySelectorAll('link[href],script[src]')]
      .map(n => n.getAttribute('href') || n.getAttribute('src') || '')
      .filter(x => /assets\//.test(x));
    if (hints.length) {
      const p = hints[0].split('assets/')[0] + 'assets/';
      return p;
    }
    // Fallback: assume assets/ next to current html
    return (document.baseURI || '').replace(/[^/]+$/, '') + 'assets/';
  })();
  ensureCss(ASSETS + 'styles.patch.css');

  function onReady(fn){ 
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function(){
    // 2) Normalize header logo
    const logoTargets = [];
    const headerLogo = document.querySelector('.header .logo img');
    if (headerLogo) logoTargets.push(headerLogo);
    // fallback: any img with alt containing HFB
    document.querySelectorAll('img[alt*="HFB"], img[alt*="High Function"]').forEach(x => logoTargets.push(x));
    const src1x = ASSETS + 'logo-hfb-original@1x.png';
    const src2x = ASSETS + 'logo-hfb-original@2x.png';
    logoTargets.forEach(img => {
      img.classList.add('hfb-logo');
      // only swap if not already correct to avoid loops
      if (!/logo-hfb-original@/.test(img.src)) {
        img.src = src1x + '?v=' + ver;
        img.srcset = src1x + ' 1x, ' + src2x + ' 2x';
        img.loading = 'eager';
        img.decoding = 'async';
        img.alt = 'HFB logo';
      }
    });

    // If there is a title that should return home, wire it
    const homeHref = (function(){
      // Try to find link to index.html or root
      const a = document.querySelector('a[href*="index.html"], a[href="/"], a.logo, .header a');
      if (a && a.getAttribute('href')) return a.getAttribute('href');
      // fallback to index.html in root
      return 'index.html';
    })();
    ['.header .logo', '.title', 'h1.title'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(){
        window.location.href = homeHref;
      }, { passive: true });
    });

    // 3) Conscious Core hero sizing
    // mark it with class if found
    const cc = document.querySelector('img[alt*="Conscious Core"], img[alt*="The Conscious Core"]');
    if (cc) cc.classList.add('hfb-conscious-hero');

    // 4) Defensive: if page lost base styles, try to restore theme class from localStorage
    try {
      const mode = localStorage.getItem('hfb:theme');
      if (mode) document.documentElement.setAttribute('data-theme', mode);
    } catch(e){}
  });
})();
