# Opposites · «برعکس‌ها» (Hot or cold?) — HFB Play Together

A calm, bilingual (Persian RTL / English) game about concept pairs, for an adult and a child who
does not read yet. **Every answer is a picture.** The child sees an animated picture (steam rising
from a mug, with a soft sizzle), hears «داغه یا سرده؟» / "Hot or cold?", and drags the matching
symbol card (a flame, or a snowflake) onto it, or taps it.

**Prototype — not a clinical tool. It has not been tested for effectiveness.**

## Levels (5 stars each → surprise egg → next level / repeat; changeable in the Adult panel)

| level | name | what the child does |
|---|---|---|
| 1 | Match · جور کردن | one focus pair, the clearest ("prototype") picture of each side, 2 cards |
| 2 | More pictures · عکس‌های بیشتر | same pair, 3 different pictures per side (generalization) |
| 3 | Sort · دسته‌بندی | 4 pictures (2 per side) one at a time, dragged into 2 boxes; 1 star per finished round |
| 4 | What helps? · چی کمک می‌کنه؟ | 8 situations, e.g. a shivering child → hot soup or ice cream |
| 5 | All mixed · همه با هم | all active pairs, 3 cards (the pair + one unrelated symbol) |

Levels 1–3 practise one **focus pair** at a time. In *Auto* the focus moves to the next active pair
after level 3; the celebration on levels 1–3 also offers **Next pair**. The adult picks the active
pairs (checkboxes) and can fix a focus pair in the Adult panel.

Pairs: hot/cold, big/small, day/night, light/dark, wet/dry, full/empty, open/closed, fast/slow,
loud/quiet, up/down, soft/hard. day/night and light/dark never appear on the same screen.
**Happy/sad is left out on purpose** because the Feelings game already teaches it.

Situations (answer / other card): cold → hot soup / ice cream · hot → ice cream / hot soup ·
wet from rain → dry towel / bucket · too dark → lamp on / lamp off · hungry → full / empty plate ·
thirsty → full / empty glass · baby sleeping → "shh" / drum · going outside → open / closed door.
A right answer changes the scene (the child stops shivering, the room lights up, the door opens).

## Feedback and help

- **Right:** the card flies into the picture, the picture reacts with sparkles and its sound,
  then a star, a chime and praise ("Yes! Hot!").
- **Wrong:** the card slides back with one soft note. No red, no X, no buzzer. The answer is named
  ("This one is hot.") and gently ringed. The picture comes back 2–4 rounds later, then once more
  4–6 rounds after that.
- **Errorless help (progressive time delay)**, separately for each pair and each situation:
  the right card/box gets a slow, soft gold ring right away on the first 2 tries, after 4 s on
  the next 3, and after that only after a mistake. After a mistake the next try is helped right
  away again. Adult panel: *Auto* / *Always* / *Off* (Off = only a gentle wiggle after 2 misses),
  plus *Restart help steps*. With animation off the ring is static.
- Random card positions (crypto RNG); the right answer is never on the same side more than twice
  in a row, and the same answer is never asked more than twice in a row.

## Sound

- Voice: recorded clips (edge-tts; FA `fa-IR-DilaraNeural` −10 %, EN `en-US-AvaMultilingualNeural`
  −8 %), the same voices as the other games. 98 clips per language: `word_*` (concept words),
  `ask_*`, `yes_*`, `is_*`, `sit_*`, `sityes_*`, and `try_again`, `level_up`, `celebrate`,
  `sort_intro`, `sort_done`; plus the shared surprise-egg lines `egg_*` and `silence.mp3`
  (unlocks audio on iPhone on the first touch). speechSynthesis is only a fallback.
- Sound effects are made in the browser (Web Audio), short and soft. Each side has its own sound:
  sizzle / wind, thuds / squeaks, birds / crickets, click + chime / click + falling tone,
  drips / rubbing, glugs / hollow knock, creak / creak + thud, zoom / slow plods,
  soft drum (capped volume) / "shh", rising / falling whistle, poof / knocks.
- Persian wording: «یواش» is used for *slow* (more natural for children and clearer in TTS
  than «کُند»).

## Files

```
opposites/
├── index.html   markup (compact game header, FA/EN toggle, theme, Adult panel)
├── styles.css   Match It base + Opposites layout, sorting boxes, picture animations
├── art.js       pairs, 62 pictures, 8 situations, symbols (inline SVG; animation via o-* classes)
├── words.js     all spoken/shown game words in fa + en (the clip generator reads this file)
├── app.js       state, rounds, help, dragging, sound effects, read-aloud, settings
└── audio/       fa/ and en/ clips + silence.mp3
```

No images, no CDN, no libraries. Cache-busting: `?v=` in `index.html` and `ASSET_VER` in `app.js`.
Settings stay in localStorage (`hfb-op-settings`, `hfb-op-stars`, `hfb-op-focus`, `hfb-op-help`;
the shared `hfb-lang`, `hfb-theme`, `hfb-egg`). `window.HFBOpp` exposes the state and actions
for tests and a possible live mode later (there is no networking).

## Surprise egg (shared)

Every 5 stars the shared `../shared/egg.js` shows the egg (wobble, crack, random surprise, read
aloud), then the celebration. It can be turned off in the Adult panel (shared by all games).

## Accessibility

Big touch targets (cards ≥ 128 px tall), `touch-action: none` on draggable items, tap works
everywhere as an alternative to dragging, and keys 1–3 choose a card or box. Every picture is
also described for screen readers. There is no flashing. Animation is off when the device asks for
reduced motion, and it can be turned off in the Adult panel; every picture's still frame is the
complete picture. Forced-colors mode is supported.

## Research notes (design rationale, not evidence that this game works)

These choices follow common, published teaching practices. **The game itself has not been
studied.** All references were checked against Crossref (October 2026).

- **Teaching opposites directly.** Pérez-González et al. (2007) found that children with autism
  learned to say antonyms in one direction but often needed direct teaching for the reverse. So
  both sides of each pair are taught on purpose and mixed from the start.
  Dunne et al. (2014) trained coordination and opposition relations in young autistic children.
- **Both sides from the start, with positions counterbalanced.** Grow et al. (2011) and
  Grow & LeBlanc (2013) recommend teaching targets together, not one at a time
  (the "conditional-only" method), and counterbalancing the position of the right answer.
  *Tension:* Grow & LeBlanc also
  recommend at least three comparisons to reduce faulty stimulus control, but an opposite pair
  only has two sides. We use two cards in levels 1–4 (plus errorless prompts and balanced
  positions) and three cards in level 5. Adults should watch for side bias.
- **Errorless learning and fading prompts.** Mueller et al. (2007) reviewed errorless learning;
  Cengher et al. (2018) reviewed prompt-fading procedures; O'Neill et al. (2018) found progressive
  prompt delay efficient, with few errors. → help ring at 0 s, then 4 s, then none.
- **Multiple exemplars for generalization.** Stokes & Baer (1977) → several different pictures
  per concept (level 2), sorting (level 3) and everyday situations (level 4).
- **Clear pictures and prototypes first.** Overselectivity (Lovaas et al., 1979) → simple, uncluttered
  pictures where the two sides differ in one obvious feature where possible. Klinger & Dawson
  (2001) on prototype formation in autism → start with the clearest example.
- **Receptive vocabulary teaching with prompts for minimally verbal preschoolers:** Muldoon & Gray (2023).
  Stimulus control technology: Green (2001). Prompting, visual supports and reinforcement are
  evidence-based practices in the NCAEP review (Hume et al., 2021).

### References

1. Pérez-González LA, García-Asenjo L, Williams G, Carnerero JJ. Emergence of intraverbal antonyms in children with pervasive developmental disorder. *J Appl Behav Anal*. 2007;40(4):697–701. doi:10.1901/jaba.2007.697-701
2. Dunne S, Foody M, Barnes-Holmes Y, Barnes-Holmes D, Murphy C. Facilitating repertoires of coordination, opposition distinction, and comparison in young children with autism. *Behav Dev Bull*. 2014;19(2):37–47. doi:10.1037/h0100576
3. Grow L, LeBlanc L. Teaching receptive language skills. *Behav Anal Pract*. 2013;6(1):56–75. doi:10.1007/BF03391791
4. Grow LL, Carr JE, Kodak TM, Jostad CM, Kisamore AN. A comparison of methods for teaching receptive labeling to children with autism spectrum disorders. *J Appl Behav Anal*. 2011;44(3):475–498. doi:10.1901/jaba.2011.44-475
5. Mueller MM, Palkovic CM, Maynard CS. Errorless learning: review and practical application for teaching children with pervasive developmental disorders. *Psychol Sch*. 2007;44(7):691–700. doi:10.1002/pits.20258
6. Cengher M, Budd A, Farrell N, Fienup DM. A review of prompt-fading procedures: implications for effective and efficient skill acquisition. *J Dev Phys Disabil*. 2018;30(2):155–173. doi:10.1007/s10882-017-9575-8
7. O'Neill SJ, McDowell C, Leslie JC. A comparison of prompt delays with trial-and-error instruction in conditional discrimination training. *Behav Anal Pract*. 2018;11(4):370–380. doi:10.1007/s40617-018-0261-9
8. Stokes TF, Baer DM. An implicit technology of generalization. *J Appl Behav Anal*. 1977;10(2):349–367. doi:10.1901/jaba.1977.10-349
9. Lovaas OI, Koegel RL, Schreibman L. Stimulus overselectivity in autism: a review of research. *Psychol Bull*. 1979;86(6):1236–1254. doi:10.1037/0033-2909.86.6.1236
10. Klinger LG, Dawson G. Prototype formation in autism. *Dev Psychopathol*. 2001;13(1):111–124. doi:10.1017/S0954579401001080
11. Muldoon DM, Gray R. Teaching receptive vocabulary to minimally verbal preschoolers with autism spectrum disorder: a single-case multiple baseline design. *Am J Speech Lang Pathol*. 2023;32(6):3036–3047. doi:10.1044/2023_AJSLP-23-00095
12. Green G. Behavior analytic instruction for learners with autism. *Focus Autism Other Dev Disabl*. 2001;16(2):72–85. doi:10.1177/108835760101600203
13. Hume K, Steinbrenner JR, Odom SL, et al. Evidence-based practices for children, youth, and young adults with autism: third generation review. *J Autism Dev Disord*. 2021;51(11):4013–4032. doi:10.1007/s10803-020-04844-2

## Tests

`/workspace/test_opposites.py [BASE] [SHOT_DIR]`: headless Chromium in an iPhone-sized touch
context. It covers every level, touch dragging and tapping, help timing, missed-picture retries,
randomness, the Adult panel, English, all 196 clips, reduced motion, the egg, and console errors.
