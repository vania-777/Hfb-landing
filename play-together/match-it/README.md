# Match It · «چی به چی می‌خوره؟» (What goes together?) — HFB Play Together

A calm, bilingual (Persian RTL / English) drag-to-match game for an adult and a child.
The child sees a target picture (a glass) and 2–4 item cards, hears «لیوان به چی احتیاج
داره؟» / "What goes with the glass?", and drags the matching item (water) onto the picture.

- **Right drop:** a small SVG + CSS animation with a synthesized sound effect (the pitcher
  tilts and pours, the glass fills and sparkles), then a star and praise
  ("Yes! Water goes in the glass!").
- **Wrong drop:** the card gently slides back with one soft note: no red, no X. After 2
  misses the right card gets a soft ring and a gentle wiggle.
- Released outside the picture: the card slides back (not counted).

**Prototype — not a clinical tool.**

## Files

```
match-it/
├── index.html    page markup (same header, logo, theme, FA/EN toggle and adult panel as the other games)
├── styles.css    themes + layout (based on Choice & Reward / Feelings) + the per-pair animations
├── art.js        the 12 pairs: card art, target scenes, sound effects (inline SVG + Web Audio)
├── app.js        game state, rounds, dragging, levels, read-aloud, settings
└── audio/        fa/ and en/ voice clips (edge-tts) + silence.mp3 (unlocks audio on iPhone)
```

No images, no CDN, no libraries. Cache-busting: `?v=` in `index.html` and `ASSET_VER` in `app.js`.

## Pairs (target ← item) and animations

| id | target | item | animation | sound (Web Audio) |
|----|--------|------|-----------|-------------------|
| glass | glass · لیوان | water · آب | pitcher tilts and pours, glass fills | pour + splash + bubbles |
| lock | lock · قفل | key · کلید | key slides in and turns, shackle opens | scrape, click, clunk |
| envelope | envelope · پاکت نامه | letter · نامه | letter slides in, flap closes, heart seal | swoosh, tap, pop |
| foot | foot · پا | sock · جوراب | sock slides on | fwip, pop |
| toothbrush | toothbrush · مسواک | toothpaste · خمیردندون | tube squeezes a ribbon onto the bristles | squish |
| paper | paper · کاغذ | pencil · مداد | pencil draws a wavy line | scribble |
| flower | flower · گل | bee · زنبور | bee buzzes around and lands, petals bounce | buzz, ding |
| dog | dog · سگ | bone · استخون | bone flies to the mouth, chomp chomp, hearts | chomps |
| plant | plant · گیاه | watering can · آب‌پاش | can pours drops, plant grows a flower | droplets, rising tone |
| head | head · سر | hat · کلاه | hat drops on with a bounce, bigger smile | whoosh, boop |
| basket | basket · سبد بسکتبال | ball · توپ | ball arcs through the hoop, net swishes, bounce | whoosh, swish, bounces |
| car | toy car · ماشین اسباب‌بازی | battery · باتری | battery clicks in, zap, lights on, car drives | click, zap, engine |

Each pair also has an `avoid` list: items that could also fit (for example water for the
plant, or the ball for the dog) are never shown as distractors.

## Levels, randomness, repetition

Level 1: 2 cards · Level 2: 3 cards · Level 3: 4 cards. Five stars opens a level-up screen
with **Next level** / **Repeat this level**. The level picker is in the adult panel and is
remembered. Pair order is random (never the same pair twice in a row; pairs not seen
recently or often are favoured). The right card's slot is random, never the same slot more
than 2 rounds in a row, and slots stay balanced over time (remembered across sessions). A pair with
a wrong drop comes back after a random 2–4 rounds, starting with "Let's try again". If it is
then matched without a miss, it comes back once more 4–6 rounds later.

## Input and accessibility

Pointer events (touch on iPhone/iPad, pen, mouse). Cards use `touch-action: none` so dragging
never scrolls the page. Fallbacks: tap a card (it says its name), then tap the picture; or
keyboard 1–4 to pick a card, then Enter on the picture. Cards are at least about 80 px. With
**Animation** off (it is off by default when the device asks for reduced motion), there are
no keyframes or transitions; every animated part has a static end state, so the result (the
full glass, the open lock) is still shown.

## Audio

Voice clips: `ask_<id>`, `yes_<id>`, `item_<id>`, `try_again`, `level_up`, `celebrate`, made with
edge-tts (Persian `fa-IR-DilaraNeural` -10%, English `en-US-AvaMultilingualNeural` -8%).
One shared `Audio` element; the first tap also plays `silence.mp3`, so the praise clip that comes after
the animation may play on iPhone. Sound effects are synthesized with Web Audio (oscillators
and filtered noise), so there are no sound files and nothing copyrighted.

## Live mode later

All game state is in one serializable `state` object. Actions (`newRound`, `select`,
`drop(itemId)`, `finish`, `next`, `nextLevel`, `closeCelebration`, `resetStars`,
`setSetting`) change it and call `render()`. Dragging is UI only and ends in `drop(itemId)`.
`window.HFBMatch.on(fn)` reports every action, so a PeerJS two-player mode (as in Choice &
Reward) can sync rounds and drops. There is no networking today.

## Saved in localStorage

`hfb-theme`, `hfb-lang` (shared), `hfb-mi-settings`, `hfb-mi-stars`, `hfb-mi-rand`.
