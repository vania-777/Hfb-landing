HFB — RF-523 Full Patch
=======================
This package fixes:
- Transparent HFB logo across **all pages**
- Conscious Core image centered and scaled (≈1/3 width on desktop)
- Clickable title/logo -> back to the Home (index)
- Defensive styles for pages that occasionally lose base CSS

Files in this zip:
- assets/page.patch.js
- assets/styles.patch.css

How to apply (takes ~2 minutes):
1) Upload both files into your repo at: /assets/
2) In *each* HTML file (index.html, about.html, product.html, investor.html, investors.html,
   philosophy.html, press-kit.html, privacy.html, routines.html, docs.html, build.html, 404.html),
   just before </body> add this line:

   <link rel="stylesheet" href="assets/styles.patch.css?v=523">
   <script src="assets/page.patch.js?v=523" defer></script>

3) Commit. If using GitHub Pages, append ?rf523 to your page URL once to bust cache.

Notes:
- The script will automatically find your header logo and swap it to:
  assets/logo-hfb-original@1x.png (and @2x if present). If these files already exist in your repo, nothing else to do.
- If your logo files have different names, either rename them to the above, or adjust page.patch.js constants.
- Conscious Core image is detected by its alt text including "Conscious Core".
