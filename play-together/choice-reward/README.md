# Choice & Reward · «انتخاب و پاداش» — HFB Play Together

A calm, bilingual (Persian RTL / English) choice-making game for an adult (behavior
technician, caregiver or parent) and an autistic child to play together.
The child picks one of 2–4 large picture cards, hears "You chose X!", and earns a star.
Five stars opens a gentle celebration screen.

**Prototype — not a clinical tool.** (نمونهٔ اولیه — ابزار بالینی نیست.)

## Files

```
choice-reward/
├── index.html      page markup
├── styles.css      themes (dark / dim / light), layout, gentle motion
├── app.js          game logic, read-aloud, settings (no dependencies)
├── assets/         put logo-hfb-original@1x.png and @2x.png here
└── screenshots/    preview images (not needed on the live site)
```

No build step, no CDN, no web fonts, no tracking. It works offline and from any static host.

## Upload to a static site

1. Copy the whole `choice-reward/` folder into your site, e.g. `/play-together/choice-reward/`.
   (Any static host works: GitHub Pages, Netlify, Cloudflare Pages, cPanel/FTP, S3.)
2. Copy the approved logo into `choice-reward/assets/` as
   `logo-hfb-original@1x.png` (and optionally `@2x.png`). If the file is missing, the
   `<img>` simply hides itself and the text "HFB · Play Together" remains.
3. The header link points to `../../index.html` (the site home when the game lives at
   `/play-together/choice-reward/`). Change the `href` on `.brand` in `index.html` if your
   folder depth is different.
4. Open `https://your-site/play-together/choice-reward/` to check. The `screenshots/`
   folder is optional; you can leave it out of the upload.

Test locally:

```bash
cd choice-reward
python3 -m http.server 8080
# open http://localhost:8080/
```

## Notes

- **Read-Aloud** uses the browser's built-in Web Speech API (`speechSynthesis`) with an
  `fa-IR` or `en-US` voice. Many desktop browsers have no Persian voice. In that case the
  Adult panel says so, and the text stays on screen. If the browser has no speech support,
  the speaker buttons are hidden.
- **Saved in localStorage:** `hfb-theme` (dark/dim/light, shared with other HFB pages),
  `hfb-lang` (fa/en), `hfb-cr-settings`, `hfb-cr-stars`. Nothing is sent anywhere.
- **Keyboard:** Tab/Enter/Space work everywhere. Keys 1–4 (or ۱–۴) pick a card. Esc closes
  the panel or the celebration.
- **Motion** is off automatically when the OS asks for reduced motion. The Adult panel
  can also turn it off.
- **Fonts:** uses Vazirmatn if it is installed, otherwise Noto Sans Arabic, Segoe UI,
  Tahoma, then sans-serif. To always use Vazirmatn, self-host the font file and add an
  `@font-face` rule in `styles.css`. Do not load it from a CDN, so the game keeps
  working offline.
- **Together mode:** share the screen on a video call and include computer audio. There
  is no real-time networking.
