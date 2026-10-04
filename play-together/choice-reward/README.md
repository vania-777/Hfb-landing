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
├── audio/fa|en/    pre-recorded read-aloud clips (MP3)
├── vendor/         peerjs.min.js 1.5.5 (MIT) for the live two-player mode, loaded only when used
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

- **Read-Aloud** plays pre-recorded MP3 clips for both languages, from `audio/fa/` and
  `audio/en/` (one per phrase: `item_<id>.mp3`, `chose_<id>.mp3`, `prompt.mp3`,
  `celebrate.mp3`). iOS has no `fa-IR` speech voice and its built-in English voices sound
  robotic. The clips were made with edge-tts: Persian `fa-IR-DilaraNeural` (rate -10%),
  English `en-US-AvaMultilingualNeural` (rate -8%). Playback runs synchronously inside the
  tap handler (`audio.src = url; audio.play()`), as iOS requires. If you add or rename an item
  or phrase in `app.js`, generate matching clips and bump `ASSET_VER` in `app.js` and the
  `?v=` in `index.html`. If a clip fails to load, the game falls back to `speechSynthesis`,
  and the Adult panel shows the playback error.
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
- **Levels:** levels 1–3 are free choice with 2, 3 and 4 cards, and any pick earns a star.
  Levels 4–6 are "find it" with 2, 3 and 4 cards: the game asks «سیب کدومه؟» / "Which one is
  the apple?". A right pick earns a star and praise. A wrong pick gets no red and no X: the
  right card is gently ringed, its name is said («سیب این‌جاست.»), and that target comes back
  2 rounds later (after "Let's try again"), then once more 4 rounds after that. Targets
  otherwise rotate by least practised. Level 7 is "find it" among look-alikes from the same
  category (4 cards). Five stars bring a calm "Level up!" screen with *Next level* or *Repeat
  this level*. The Adult panel has a level picker (it replaced the card-count control),
  and the level is saved. In live mode, the adult's device sets the level and the target.
- **Team framing:** the adult and child are one team. The page shows shared team stars
  ("ستاره‌های تیم ما" / "Our team stars"), two avatars (🧑‍🏫 + 🧒), and team praise after each
  choice ("آفرین به تیم ما! یه ستاره گرفتیم." / "Great teamwork! We got a star!").
- **Live two-player mode (voice):** in the Adult panel, tap *Start live two-player session*
  and open the link (`?join=CODE`) on the child's device. The child taps *Tap to start*,
  which unlocks audio on iOS and asks for the microphone. Both devices show the same cards
  and team stars, and either player can tap. The adult's device deals the cards and keeps
  the score. Voice is a PeerJS audio-only call (`echoCancellation`, `noiseSuppression`). The
  adult side has a big mute/unmute button. The child side has a mic indicator plus a mute
  button. The teammate's voice is lowered while a game clip plays (not on iOS, which ignores
  media volume). If the mic is denied, the game keeps working without voice and shows a
  friendly note. Signalling uses the free PeerJS cloud server (`0.peerjs.com`) and its default
  STUN/TURN, so this mode needs internet and may not connect on very strict networks.
  You can also still share the screen on a video call (include computer audio).
