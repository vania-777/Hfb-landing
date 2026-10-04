# Feelings · «احساس‌ها چیه؟» — HFB Play Together

A calm, bilingual (Persian RTL / English) emotion-recognition game for an adult (behavior
technician, caregiver or parent) and an autistic child to play together, in person or
remotely over a shared screen.
The child sees one friendly cartoon face and picks the matching feeling word from 2–4
buttons. A right answer plays a soft chime, says "Yes! This face is happy." and earns a star.
A wrong answer has **no buzzer and no red X**: a quiet neutral note plays, the right answer
is gently highlighted and read out ("This face is sad."), and the game moves on.
Five stars opens a gentle celebration screen.

**Prototype — not a clinical tool.** (نمونهٔ اولیه — ابزار بالینی نیست.)

## Files

```
feelings/
├── index.html      page markup
├── styles.css      themes (dark / dim / light), layout, gentle motion (based on Choice & Reward)
├── app.js          game logic, SVG faces, read-aloud, settings (no dependencies)
└── audio/fa|en/    pre-recorded read-aloud clips (MP3)
```

No build step, no CDN, no web fonts, no images, no tracking. Faces are drawn as inline SVG
in `app.js` (no photos of real people). Works offline and from any static host.
The logo is the shared site file `../../assets/logo-hfb-original@1x.png` (and `@2x`).

## Feelings

Happy, sad, angry, scared, surprised, calm (on by default); tired and disgusted (off by
default). Each face gets a random skin tone (6), hair colour (6) and hair style (4); the same
feeling never appears twice in a row.

| id | Persian label | Persian sentence | English |
|----|---------------|------------------|---------|
| happy | خوشحال | این خوشحاله. | This face is happy. |
| sad | غمگین | این غمگینه. | This face is sad. |
| angry | عصبانی | این عصبانیه. | This face is angry. |
| scared | ترسیده | این ترسیده. | This face is scared. |
| surprised | متعجب | این متعجبه. | This face is surprised. |
| calm | آرام | این آرومه. | This face is calm. |
| tired | خسته | این خسته‌ست. | This face is tired. |
| disgusted | چندش | این چندشش شده. | This face is disgusted. |

## Adult panel (⚙️)

Number of choices (2/3/4, default 2) · which feelings are included (at least two) ·
errorless-learning prompt (the right answer gently pulses; a static ring when motion is
off) · sound on/off · gentle animation on/off · reset stars.

## Audio

Clips in `audio/fa/` and `audio/en/`: `question`, `celebrate`, `name_<id>` (played when the
face is tapped), `yes_<id>` (right answer), `is_<id>` (wrong answer, names the right one).
Made with edge-tts: Persian `fa-IR-DilaraNeural` (rate -10%), English
`en-US-AvaMultilingualNeural` (rate -8%). Same playback path as Choice & Reward: one shared
`Audio` element, `src` + `play()` inside the tap handler (iOS rule), `speechSynthesis` only as
a fallback. The chime and the soft wrong-answer note are generated with Web Audio.
If you change a phrase, regenerate the clip and bump `ASSET_VER` in `app.js` and the `?v=`
query strings in `index.html`.

## Code structure (ready for a live mode later)

All game state lives in one serializable object (`state`: language, theme, settings, stars,
current round, answer, celebrating). Actions (`newRound`, `answer`, `next`,
`showCelebration`, `closeCelebration`, `resetStars`, `setSetting`) change the state and call
`render()`, which draws the whole screen from the state. Audio side effects run only inside
actions. `window.HFBFeelings` exposes `getState()`, `on(fn)` (every action is emitted as
`(type, payload, state)`), `actions.*` and `render()`, so a two-player live mode (e.g. PeerJS,
as in Choice & Reward) can sync rounds and answers later. There is no networking today.

## Saved in localStorage

`hfb-theme` (shared with the site), `hfb-lang` (fa/en, shared with Choice & Reward),
`hfb-fe-settings`, `hfb-fe-stars`. Nothing is sent anywhere.

**Keyboard:** Tab/Enter/Space everywhere; keys 1–4 (or ۱–۴) pick an answer; Esc closes the
celebration.

- **Random, unpredictable order:** targets are picked at random. The same target never comes
  twice in a row, items not asked recently or often are favoured, and there is no fixed cycle
  or category rotation. The right answer's position is shuffled every round (Fisher–Yates): it
  never lands in the same slot more than 2 rounds in a row, and slots stay balanced over time.
  Distractors are drawn at random each round. The last target is remembered across sessions,
  so a new session doesn't start where the old one ended.
  With only 2 feelings turned on, the same feeling may come at most twice in a row, because
  strict alternation would itself be a pattern.
