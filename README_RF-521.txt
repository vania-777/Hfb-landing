
HFB RF-521 Patch
================

What’s inside
-------------
- assets/styles.css      → unified header layout, cards grid, logo transparency enforcement, Calm Sky theme
- assets/theme.js        → Dark ↔︎ Calm Sky toggle + make logo/title click go to index.html (home)

How to deploy
-------------
1) Upload `assets/styles.css` and `assets/theme.js` to your repo, replacing existing files.
2) In every HTML page, make sure you have:
   <link rel="stylesheet" href="assets/styles.css?v=521">
   <script defer src="assets/theme.js"></script>
3) (Optional) In about.html use the high‑res image:
   <img class="core-hero" src="assets/conscious_core_magic.png"
        srcset="assets/conscious_core_magic.png 1920w, assets/conscious_core.png 1280w"
        sizes="(max-width:1024px) 100vw, 920px"
        alt="The Conscious Core — crystal lattice, lotus, and DNA helix">

Notes
-----
- The logo background is forced transparent by CSS. If you still see white, hard‑refresh your browser.
- The theme toggle keeps the user’s choice via localStorage.
- Clicking the HFB logo or title now always returns to the 3‑card home (index.html).
