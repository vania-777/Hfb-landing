# highfunctioningbrains.com

Static site for High Functioning Brains (HFB), hosted on GitHub Pages. No build step.

## Structure
- `index.html`, `tools.html`, `product.html`, `about.html`, `investors.html`, `docs.html`, `press-kit.html`, `privacy.html`, `404.html`
- `investor.html`, `build.html`, `philosophy.html`, `routines.html`, `docs-eight-leagues.html` are redirect stubs for old links
- `assets/site.css` is the only stylesheet. `assets/site.js` handles the theme (dark → dim → light, saved in localStorage `hfb-theme`) and the mobile menu
- `assets/logo-hfb-original@1x.png`, `@2x.png`, `logo.png`: approved logo. Use as-is and don't edit
- `assets/img/`: web-optimized brand artwork (crystal lotus symbol, cosmic lotus, wordmark banner)
- `play-together/choice-reward/`: Choice & Reward game (self-contained)
- Keep `CNAME`, `google646d6f24339df9d9.html`, `robots.txt`, `sitemap.xml`, `favicon.png`, `manifest.webmanifest`

## Editing
Every page shares the same header and footer markup. If you change the nav, change it on every page.
Bump `?v=` on `site.css` and `site.js` after you edit them, to bust caches.

## Preview locally
    python3 -m http.server 8000
