# Hollow Night: The Green Harvest — browser prototype on the original art

Date: 2026-10-17. Status: approved by the user on 2026-10-18 ("build the prototype"); built, see §8.
Supersedes nothing: `SPEC.md` (Unity, 2026-10-12) and the Codex comparison in
`Tools/design/prototype/` stay untouched. This document is the single source of truth
for the new prototype.

## 1. Goal

A playable browser prototype that looks and flows like the finished game, built on the
user's **original handmade art** (the PSDs in `Assets/graphics/Texture/`), with a new
story. It exists so the user can play the intended game on a phone-shaped screen before
any Unity work starts. Unity scripts, scenes, sprites and `.meta` files are not changed.

Decisions already made by the user (2026-10-17):

- New story written around the original assets, adult and eerie in tone.
- Browser prototype with PNG exports of the PSDs; Unity untouched.
- Launch only from rest (no mid-air re-aim). One dash per flight stays.
- Story spine: Izan overhears the pumpkins plotting an evil plan, is spotted, runs,
  and they chase him through every stage.
- Each stage holds **three pumpkins**; each one broken is one star. Breaking them is
  optional. **Reaching the door completes the stage**, with any number of stars.
- Stages are obstacle courses with puzzles solved through interactive objects.

## 2. The story — "The Green Harvest"

Told by the Owl. Izan has no mouth in the original art, so he never speaks; his
answers are blinks and ear movements. The Owl's three eye states (open, narrowed,
closed) are the emotional cue on every story screen.

**The world.** In Hollowmere a pumpkin seed is planted on every new grave. On Hollow
Night the village lights every window for its dead, and the pumpkins ripen orange to
show them the way. Izan is the black rabbit of the house on the hill. He goes down to
the graveyard every night because it is quiet.

**Prologue (before stage 1).** Tonight the pumpkins are awake, still green, and
talking. Izan hides under a lifted grave stone and listens. The Weaver, the spider
that lives above the valley, has offered them a bargain: stay green, stay hungry, and
when the village lights its windows at midnight, climb the web and eat every light.
No lights, no morning, no way home for anyone. A stone shifts under Izan's paw.
"A rabbit," says the biggest pumpkin. "It heard." They come for him. He runs.
Owl: "Three hundred of them, one of you, and the hill is that way. Hop."

**Chapter 1 — The Lifted Stones (stages 1 to 3).** The graveyard. The grave stones
hang from the Weaver's threads. The Owl teaches the leap, the fast hit and the dash,
drily: "Hit one slowly and it will hit you back. Hit it fast and it is soup."
After stage 3 the crypt door shuts behind Izan. Owl: "They will go around. They always
go around."

**Chapter 2 — Under the Web (stages 4 to 7).** The way home is up, through the
Weaver's silk: swinging stones, sticky threads, stones that fall when stood on, stones
whose threads slacken. Midway the Owl narrows its eyes and admits it told the Weaver
about the custom of the lights. "I thought it would like the view." After stage 7
Izan reaches the garden gate of the house. Owl, eyes closed: "Go in. I will keep count
out here."

**Chapter 3 — The House on the Hill (stages 8 to 10).** The cellar, the family's
cauldrons, then the rafters where the Weaver has anchored its whole web. Stage 10 is
the Weaver fight. When it falls, every thread snaps, the stones drop back onto their
graves, and the pumpkins outside ripen orange one by one. Midnight. The windows light.
Owl, eyes open: "Counted. All of them. And one rabbit." Izan goes in through the house
door, using the original twelve-frame door-entering animation. Last line: "Somewhere
past the far trees, one pumpkin is still green." Then the title.

Per-stage lines (one or two per stage, shown on the story screen before the stage)
are written in `story.js` during implementation and must stay inside this outline.

## 3. Gameplay rules

- **Launch**: drag anywhere while Izan rests, release to launch. Max drag 4 world
  units, velocity set directly (same as the shared engine). Trajectory preview.
- **Dash**: one tap in flight; 0.45 s speed boost; smashes pumpkins and breaks what
  the engine already allows.
- **Pumpkins (hunters)**: three per stage. Inside their range they drift toward Izan;
  a fast impact or a dash smashes them; a slow touch kills Izan, who respawns at his
  last stable rest. A dead pumpkin spawns six shatter pieces (the original death PSD).
- **Stars**: one per smashed pumpkin, 0 to 3. No par, no death penalty beyond the
  respawn. The HUD shows a launch counter for information only.
- **Door**: always open, except in stage 10 where it opens once the Weaver falls.
  Touching it plays the door frames, then the entering animation, then the result screen.
- **Obstacles**: the pumpkins themselves, falling off the bottom of the stage (death),
  the Weaver's dropped silk bombs in stage 10, and stones that vanish or fall away.
- **Interactive objects** (all drawable with the original art):
  - `solid` stone disc (`ground_tombe.psd`).
  - `mover` stone disc swinging on its thread along a path.
  - `ghost` stone disc whose thread slackens: fades in and out on a period.
  - `web` (new): a patch of silk. Flying into it stops Izan and holds him; he can
    launch again from it. Each web holds once and tears on launch.
  - `drop` (new): a stone disc on a frayed thread. When Izan rests on it the thread
    snaps after `delay` seconds; the disc falls, smashing any pumpkin it lands on, and
    stops on the next solid surface or leaves the stage. Izan may ride it or leap off.
  - `cannon` cauldron (`Assets/2D Halloween Decoration/.../Cauldron_V2.png`, the
    sprite the original cauldron prefab already uses).
  - `boss` the Weaver: spider body and legs from `Spider_sprite.psd`, three hits,
    drops silk bombs, climbs higher after each hit. The door opens when it falls.

## 4. Stages

Ten stages, one lesson each, every stage with exactly three pumpkins and one door.
Coordinates follow the shared engine: x from -6 to 6, y up, platform `y` is the walking
surface. Each stage stores a verified route.

| # | Name | Lesson | Objects |
|---|---|---|---|
| 1 | The Lifted Stone | One launch; three pumpkins strung along one arc | solid |
| 2 | They Go Around | Pursuit: bait from a perch, launch before they arrive | solid |
| 3 | The Crypt Door | Dash through a pumpkin guarding the door | solid |
| 4 | Threads That Swing | Ride a swinging stone to reach a hidden pumpkin | mover |
| 5 | Silk | Catch a web, hang, relaunch from height | web |
| 6 | The Frayed Thread | Stand on a drop stone to crush pumpkins below, leap before it falls | drop |
| 7 | Slack | Fading stones; time the landing | ghost, web |
| 8 | The Cellar | Descent combining drop, web and movers | drop, web, mover |
| 9 | The Family Cauldrons | Cannons aimed through pumpkin clusters | cannon, ghost |
| 10 | The Weaver | Boss: three hits, silk bombs, door opens on victory | boss, web |

## 5. Files and interfaces

New folder `Tools/design/original/` (no build step, no dependencies):

| File | Responsibility |
|---|---|
| `index.html` | One page: title screen, story screen, stage screen, result screen; portrait frame |
| `styles.css` | Phone-first layout; stone buttons and green stars from the original menu sheet |
| `app.js` | Flow (title → prologue → stage → story → stage …), input (mouse + touch), HUD, pause/restart/next, progress in `localStorage` wrapped in try/catch |
| `art.js` | Image-based renderer: parallax backdrop layers, part-based rabbit (ears, eyes, pupils, whiskers, paws react to aim, flight and rest), stone discs, door frames, pumpkin + shatter pieces, owl, spider, cauldron |
| `levels.js` | The ten stages above, `HNOriginalLevels.get(id)` and `.count` |
| `story.js` | `HNStory.prologue`, `HNStory.before[id]`, `HNStory.after[id]`, `HNStory.ending`; each beat is `{ owl: "open" \| "narrowed" \| "closed", lines: [...] }` |
| `assets/` | PNG exports, produced only by the export script |
| `verify-routes.js` | Loads the shared engine and every stage, replays its route, fails if any stage is not won |

Shared engine `Tools/design/prototype/game.js` gains, behind level flags so the Codex
prototype is unchanged:

- `level.rules = { door: "always" | "boss", stars: "pumpkins" }` — `always` ignores
  pumpkins and keys; `boss` opens the door when the boss falls; `snapshot().stars`
  counts smashed pumpkins.
- platform type `web` and platform type `drop` as described in §3.
- Exported `starsForPumpkins(smashed)` helper.

Art export: `Tools/export_original_art.py`, run with
`uv run --with psd-tools --with pillow python3 Tools/export_original_art.py`.
It reads the PSDs and writes:

| Source | Output in `assets/` |
|---|---|
| `Cateracter2 sprite_blue.psd` layers | `rabbit_body`, `rabbit_ear_l/r`, `rabbit_eye_l/r`, `rabbit_pupil_l/r`, `rabbit_whisker_l/r`, `rabbit_paw_l/r` plus `rabbit_parts.json` with each part's offset from the body centre |
| `Cateracter2.psd` | `rabbit_rest.png` fallback composite |
| `ground_tombe.psd` | `stone.png` |
| `door_sprite_2.psd` | `door_0..5.png` |
| `door_sprite_entring.psd` | `enter_0..11.png` |
| `Jack o lantern_3.png` | `pumpkin.png` (copied) |
| `Jack o lantern_3_death.psd` | `pumpkin_piece_0..5.png` |
| `owl_sprite.psd` | `owl_open.png`, `owl_narrow.png`, `owl_closed.png` |
| `Spider_sprite.psd` | `spider_body.png`, `spider_leg_0..7.png` |
| `back1.psd` layers | `bg_sky`, `bg_clouds`, `bg_far_trees`, `bg_tombs`, `bg_house`, `bg_web_left/right/lower`, `bg_near_tree`, `bg_ground` |
| `menu_next_sprite.psd` | `btn_stone`, `btn_next`, `btn_reset`, `btn_menu`, `star.png` |
| `Play_button.psd` | `btn_play.png` |
| `fingerhand.psd` | `hand.png` (first-launch hint) |

The script keeps the existing `.meta` files untouched and never writes into `Assets/`.

## 6. Verification

1. **Failing tests first** in `Tools/design/prototype/game.test.js`: web holds then
   tears; drop stone falls after its delay and smashes a pumpkin beneath; door opens
   with pumpkins alive under `rules.door = "always"`; stars equal smashed pumpkins.
   The existing 19 tests must stay green.
2. `node Tools/design/original/verify-routes.js`: 10 of 10 stages won by their stored
   route, every route smashing all three pumpkins so the three-star path is proven.
3. ESLint with `Tools/design/prototype/eslint.config.mjs` on the new folder; `node --check`
   on every new file.
4. The built-in browser opens `index.html` at 390 px width: title, prologue, stage 1 play,
   a door completion, a story screen and the ending are screenshotted into
   `output/playwright/original-*.png`. No console errors.
5. `python3 Tools/check_levels.py` still passes (Unity untouched).
6. `graphify update .`, `AGENTS.md` folder-map line, `task_plan.md` progress entry.

## 7. Out of scope

Unity changes, `SPEC.md`, sound and music, newly drawn art, third-party asset purchases,
balancing by human playtesting, and porting the Codex comparison features (themes,
directions, pursuit dropdown). Porting the chosen result to Unity is a separate plan.

## 8. As built (2026-10-18)

Built in `Tools/design/original/`; see its `README.md`. Differences from the plan above:

- **Grave posts and nests.** Stage 6 needed a reason to use the falling stone, because
  any pumpkin Izan can reach he can also hit. A `post` platform type was added: two posts
  with a gap narrower than Izan shelter a sleeping pumpkin. A falling stone that lands on
  the posts crushes it through a 0.35-unit landing shock.
- **Hanging spiders** (`spider` object, the small spider from `back1.psd`) were added as
  extra obstacles in stages 7 and 8. They move like the old bats and bite unless dashed.
- **Routes** are stored in a generated `routes.js`, written by `find-routes.js` (a beam
  search over launches and waits). Each stage is tagged with `teaches`; a route only
  counts if it uses that mechanic (for example stage 6 must crush, stage 9 must use a
  cauldron).
- **Pursuit** uses a new `aim` mode: pumpkins keep hunting while Izan rests and freeze
  only while the player aims, so the chase stays tense but aiming is never rushed.
- All ten stages are unlocked on the map so the user can review any stage.
- The play button and the rabbit's pupils are taken from the full composite and the
  sprite sheet respectively, because those layers render wrongly on their own.

## 9. Round 2 (2026-10-18): polish and tricks

After playing stages 1 to 6 the user asked for more immersive cutscenes, professional
pumpkin movement, better teaching of new skills, human-playability checks (stage 7's
fading stones were too fast) and more tricks like the sticky web. Approved with sound and
object-on-object collisions. Built:

- **Human-pace routes.** The route finder waits 1.2 s at rest before every launch with
  the pumpkins hunting, and never dashes within 0.15 s of a launch. All 14 stages pass.
- **Lively pumpkins** (`hunters: "lively"`): sleep, a 0.35 s notice jolt with flaring
  eyes, smooth acceleration, a lunge when close, a slow drift home when they lose him.
  Hit-stop, white flash and a camera kick on every smash.
- **Four new tricks**: trampoline web, zip thread, seesaw stone, rolling pumpkin. Moving
  and falling stones and flung pumpkins crush pumpkins they hit.
- **14 stages** in three chapters (1-4, 5-10, 11-14); story beats after 4, 10 and 14.
  Stage 10 (fading stones) uses 8 s cycles and a tremble-and-flicker warning.
- **Teaching cards**: the first appearance of each object pauses the game, spotlights it,
  moves the camera to it and shows an Owl card with a hand gesture. Owl remarks appear
  on first smash, all three, deaths (a calmer tip on the third), and each trick.
- **Cutscenes**: camera drift with a push-in on each line, typewriter text, speaker
  animation (pumpkins bounce, the Weaver's legs quicken, the Owl bobs), fog, fireflies,
  lightning on "It heard us".
- **Sound**: `sfx.js`, synthesized wind and owl ambience plus one effect per event,
  unlocked on the first touch, mutable from the title and pause screens.
