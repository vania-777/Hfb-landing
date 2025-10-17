HFB — Assets Patch RF-521a
=================================
Drop‑in update to unify the logo and fix visibility across all pages.

FILES → place under /assets/ :
  • logo-hfb-original@1x.png
  • logo-hfb-original@2x.png
  • logo.png
  • favicon.png
  • styles.patch.css
  • app.patch.js

HOW TO USE (per page):
  1) In <head> add:
     <link rel="stylesheet" href="assets/styles.patch.css?v=RF-521a">
  2) Before </body> add:
     <script src="assets/app.patch.js?v=RF-521a" defer></script>

Cache-bust: add ?v=RF-521a to page URL after upload.