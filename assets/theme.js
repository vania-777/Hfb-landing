
// HFB RF-521 — Theme + header fix + logo link
(() => {
  const KEY = 'hfb_theme';
  const apply = (mode) => {
    const root = document.documentElement;
    if (mode === 'calm') {
      root.setAttribute('data-theme','calm');
      const b = document.getElementById('themeToggle');
      if (b){ b.setAttribute('aria-pressed','true'); b.textContent='Light'; }
    } else {
      root.removeAttribute('data-theme');
      const b = document.getElementById('themeToggle');
      if (b){ b.setAttribute('aria-pressed','false'); b.textContent='Dark'; }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // ensure logo/brand click goes home
    const header = document.querySelector('.header');
    if (header){
      // wrap logo + brand text with a link if not wrapped
      const logo = header.querySelector('.logo');
      const title = header.querySelector('.title');
      if (logo && !logo.closest('a')){
        const a = document.createElement('a');
        a.href = 'index.html';
        a.className = 'brand';
        a.setAttribute('aria-label','Go to HFB home');

        const brandText = document.createElement('div');
        brandText.className = 'brand-text';
        if (title){
          brandText.appendChild(title.cloneNode(true));
          // move the original title out to avoid duplicate
          title.parentElement && title.parentElement.removeChild(title);
        }
        const tagline = header.querySelector('.tagline');
        if (tagline){
          brandText.appendChild(tagline.cloneNode(true));
          tagline.parentElement && tagline.parentElement.removeChild(tagline);
        }

        logo.parentElement.insertBefore(a, logo);
        a.appendChild(logo);
        a.appendChild(brandText);
      }
    }

    // Theme init and toggle hookup
    const saved = localStorage.getItem(KEY) || 'dark';
    apply(saved);
    const btn = document.getElementById('themeToggle');
    if (btn){
      btn.addEventListener('click', () => {
        const newMode = (document.documentElement.getAttribute('data-theme') === 'calm') ? 'dark' : 'calm';
        localStorage.setItem(KEY, newMode);
        apply(newMode);
      });
    }
  });
})();
