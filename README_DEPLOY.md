# HFB — Full Release Package (v4) — 2025-10-08

This is a clean, ready-to-deploy snapshot of the HFB landing site.

## What’s inside
- **index.html** — Home (Clear Need · Privacy First · Focused MVP)
- **privacy.html** — Privacy-by-Design principles
- **build.html** — Live Build Thread (reads `tracker/hfb_status_tracker.csv`)
- **404.html**, **robots.txt**, **sitemap.xml**
- **assets/** — logo, CSS, LinkedIn banner, favicon
- **content/** — placeholders for `HFB_Proposal.pdf` & `HFB_PitchDeck.pdf`
- **tracker/** — `hfb_status_tracker.csv`
- **posts/** — LinkedIn #1 recap (txt), LinkedIn #2 draft (md)
- **netlify.toml** — Simple Netlify config

## One-time setup
1. Create a Formspree form and copy its endpoint ID (e.g., `xayzb123`).
2. Open `index.html` and replace `REPLACE_WITH_FORMSPREE_ENDPOINT` with your Formspree ID.
3. Replace PDFs inside `content/` with your real files (keep the same filenames).

## Deploy (Netlify easiest)
- Drag & Drop this folder in the Netlify dashboard **OR** push to GitHub and connect the repo.
- Set custom domain `highfunctioningbrains.com` via Netlify + Namecheap DNS.

## Optional
- Add/replace `assets/banner_linkedin.png` in LinkedIn post #2.
- Update `tracker/hfb_status_tracker.csv` regularly — `build.html` will reflect updates automatically.