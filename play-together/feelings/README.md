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

## Levels

| Level | What the child does | Choices |
|-------|---------------------|---------|
| 1 / 2 / 3 | **Faces:** one cartoon face, pick its feeling | 2 / 3 / 4 |
| 4 / 5 / 6 | **Situations:** a simple illustrated scene is read aloud ("His ice cream fell. How does he feel?"); pick the right feeling face | 2 / 3 / 4 |

Five stars opens a level-up screen with **Next level** and **Repeat this level** (the last
level shows **Play again**). The level picker is in the adult panel and is remembered.
In a scene, the person shows a neutral face until the child answers, so the feeling comes
from the situation; after the answer the face shows the feeling.
Each situation has ONE correct feeling. Feelings that could also fit (`avoid`) are never
used as distractors, so the wrong options are clearly wrong.
A missed situation comes back after a random 2–4 rounds, starting with "Let's try again".
If it is then answered right, it comes back once more 4–6 rounds later.
Situations use the same randomness rules as faces (below). The feelings checkboxes only
affect the face levels.

| id | feeling | Persian (read aloud) | English (read aloud) | never a distractor |
|----|---------|----------------------|----------------------|--------------------|
| gift | happy | برای تولدش کادو گرفت. چه حسی داره؟ | She got a present for her birthday. How does she feel? | surprised, calm |
| icecream | sad | بستنی‌اش افتاد زمین. چه حسی داره؟ | His ice cream fell on the ground. How does he feel? | angry, surprised |
| dog | scared | یه سگ بزرگ داره براش پارس می‌کنه. چه حسی داره؟ | A big dog is barking at her. How does she feel? | surprised, sad |
| toy | angry | دوستش اسباب‌بازی‌اش رو به زور ازش گرفت. چه حسی داره؟ | His friend grabbed his toy away from him. How does he feel? | sad, surprised |
| hug | happy | مامانش محکم بغلش کرد. چه حسی داره؟ | Her mom gave her a big hug. How does she feel? | calm, surprised |
| party | surprised | یهو همه داد زدن: سورپرایز! چه حسی داره؟ | Everyone jumped out and shouted, "Surprise!" How does he feel? | happy, scared |
| sleepy | tired | بعد از یه روز طولانی، هی خمیازه می‌کشه. چه حسی داره؟ | After a long day, she keeps yawning. How does she feel? | calm, sad |
| bath | calm | توی وان آب گرم، آروم دراز کشیده. چه حسی داره؟ | He is lying quietly in a warm bath. How does he feel? | happy, tired |
| balloon | sad | بادکنکش از دستش در رفت و رفت هوا. چه حسی داره؟ | Her balloon slipped away and flew up into the sky. How does she feel? | surprised, angry, scared |
| thunder | scared | شب، صدای رعد و برق خیلی بلندی اومد. چه حسی داره؟ | At night, there was a very loud crash of thunder. How does he feel? | surprised, sad |
| tower | angry | یکی عمداً برجش رو خراب کرد. چه حسی داره؟ | Someone knocked down her block tower on purpose. How does she feel? | sad, surprised |
| jackbox | surprised | یهو یه عروسک از توی جعبه پرید بیرون. چه حسی داره؟ | A toy suddenly popped out of the box. How does he feel? | scared, happy |
| trash | disgusted | سطل آشغال خیلی بوی بد میده. چه حسی داره؟ | The trash can smells really bad. How does she feel? | angry, sad |
| reading | calm | زیر درخت، آروم کتاب می‌خونه. چه حسی داره؟ | She is quietly reading a book under a tree. How does she feel? | happy, tired |
| swing | happy | توی پارک داره تاب‌بازی می‌کنه. چه حسی داره؟ | He is playing on the swings at the park. How does he feel? | calm, surprised, tired |

## Adult panel (⚙️)

Level (1–6, default 1) · which feelings are included (at least two) ·
errorless-learning prompt (the right answer gently pulses; a static ring when motion is
off) · sound on/off · gentle animation on/off · reset stars.

## Audio

Clips in `audio/fa/` and `audio/en/`: `question`, `celebrate`, `level_up`, `try_again`,
`name_<id>` (played when the face is tapped), `yes_<id>` (right answer), `is_<id>` (wrong
answer, names the right one). For each situation: `sit_<id>` (scene + question, also played
when the scene is tapped), `sityes_<id>` ("Yes! He feels sad." / «آفرین! غمگینه.») and
`sitis_<id>` ("He feels sad." / «اون غمگینه.»).
Made with edge-tts: Persian `fa-IR-DilaraNeural` (rate -10%), English
`en-US-AvaMultilingualNeural` (rate -8%). Same playback path as Choice & Reward: one shared
`Audio` element, `src` + `play()` inside the tap handler (iOS rule), `speechSynthesis` only as
a fallback. The chime and the soft wrong-answer note are generated with Web Audio.
If you change a phrase, regenerate the clip and bump `ASSET_VER` in `app.js` and the `?v=`
query strings in `index.html`.

## Code structure (ready for a live mode later)

All game state lives in one serializable object (`state`: language, theme, settings, stars,
current round, answer, celebrating). Actions (`newRound`, `answer`, `next`,
`showCelebration`, `closeCelebration` (= repeat level), `nextLevel`, `resetStars`, `setSetting`) change the state and call
`render()`, which draws the whole screen from the state. Audio side effects run only inside
actions. `window.HFBFeelings` exposes `getState()`, `on(fn)` (every action is emitted as
`(type, payload, state)`), `actions.*` and `render()`, so a two-player live mode (e.g. PeerJS,
as in Choice & Reward) can sync rounds and answers later. There is no networking today.

## Saved in localStorage

`hfb-theme` (shared with the site), `hfb-lang` (fa/en, shared with Choice & Reward),
`hfb-fe-settings`, `hfb-fe-stars`. Nothing is sent anywhere.

**Keyboard:** Tab/Enter/Space everywhere; keys 1–4 (or ۱–۴) pick an answer; Esc closes the
celebration (repeats the level).

- **Random, unpredictable order:** targets are picked at random. The same target never comes
  twice in a row, items not asked recently or often are favoured, and there is no fixed cycle
  or category rotation. The right answer's position is shuffled every round (Fisher–Yates): it
  never lands in the same slot more than 2 rounds in a row, and slots stay balanced over time.
  Distractors are drawn at random each round. The last target is remembered across sessions,
  so a new session doesn't start where the old one ended.
  With only 2 feelings turned on, the same feeling may come at most twice in a row, because
  strict alternation would itself be a pattern.

## Surprise egg (shared)

After every 5 stars, `../shared/egg.js` shows a big egg. It wobbles, cracks, and reveals one of 12 random surprises (car, dinosaur, duck, puppy, rocket, butterfly, frog, train, kitten, chick, fish, unicorn). Each surprise has a Web Audio sound and an excited line read aloud from `audio/<lang>/egg_<id>.mp3`. After that comes the usual celebration.
- Tap, or press Enter, to continue. Escape closes it.
- With motion off, the egg simply opens.
- Every surprise appears once before any repeats, and never twice in a row (`hfb-egg-bag`).
- The Adult panel toggle "Surprise egg after every 5 stars" sets `hfb-egg` (`off` to turn it off). The setting is shared by all games.
