# Hollow Night enhancement exploration

Date: 2026-10-14. Status: prototype delivered and verified; awaiting the user's choice of Unity direction.

## User brief

Read the plan, story, Claude sessions and project instructions; research comparable
games; propose different stories, assets and mechanics; rebuild the first ten stages
in HTML/CSS/JavaScript so the user can compare directions before choosing Unity changes.
Audience confirmed: adults, eerie atmosphere and deeper story.

## Evidence and decisions

- Read `AGENTS.md`, `CLAUDE.md`, `.claude/rules/*.md`, `SPEC.md`, current story and level data.
- Reviewed relevant September 29 and October 12 Claude session requests and outcomes.
- Preserve the October 12 identity: original black rabbit Izan, pursuing glowing
  pumpkins, drag launch, airborne dash, portrait mobile, ten stages and three stars.
- Existing `SPEC.md` records the implemented redesign; keep it intact while exploring.
- Full proposal and research links: `Tools/design/enhancement-proposal.md`.
- Baseline: `python3 Tools/check_levels.py` passed 10/10 on October 14. This approximation
  does not simulate pumpkin pursuit. Stage 6 used six launches against par six in this run.
- `Tools/smoke_report.txt` is historical evidence from before the pumpkin redesign:
  candy and removed heroes are present, and most wins are forced. No new Unity test ran.

## Approved implementation

The user gave go-ahead with multiple task agents on October 14. Physics, levels,
art/story and independent review were delegated; the parent integrated the interface.

1. Create a local, dependency-free comparison prototype in `Tools/design/prototype/`.
   Use `index.html`, `styles.css`, `game.js` and `levels.js`. Support mouse and touch,
   portrait playfields, stage selection, restart and visible instructions.
2. Provide a baseline mode based on all ten current Unity level layouts, with labelled
   differences in browser physics, then a redesign mode with ten intentionally paced
   stages. Every stage must be playable and have a documented successful route.
3. Provide three distinct original art/story treatments, shown together in a comparison
   view: The Last Light, The Borrowed Shadow and The Thirteenth Bell. Each gets a
   character/environment/prop sheet, opening, three chapter beats and ending concept.
4. Share launch, collision, dash, pumpkin hunt and scoring code across treatments.
   Prototype one distinctive mechanic per direction on stages 3, 6 and 10 for direct
   comparison. Show where a mechanic changes level structure, rather than silently
   giving all directions identical geometry. Do not build three complete ten-stage
   campaigns until a direction is selected.
5. Use original Canvas/SVG drawings for playable placeholders; show silhouettes,
   animation states, materials and visual hierarchy, not merely recoloured screens.
   Raster concept illustrations may supplement the comparison, clearly labelled as
   concept art rather than Unity-ready sprite sheets.
6. Write failing checks for launch/trajectory agreement, dash limits, pumpkin lethality,
   door seals and independent stars before implementing the browser rules. Verify
   documented routes for ten baseline stages and ten proposed stages. Use browser
   interaction checks for touch cancellation, restart, stage selection and theme switching.
7. Conduct the independent code review required by repository workflow; resolve findings.
   Run applicable syntax/lint checks and the existing level simulator. Report unavailable
   gates explicitly. The repo has no npm lint/typecheck/test setup today; define only
   the minimal checks needed for this isolated browser prototype.
8. Open the result in Codex for side-by-side review. Ask the user to choose the story,
   art treatment and mechanic after they can play and compare them.

## Scope boundary

Unity scripts, scenes, imported sprites and existing `.meta` files stay untouched
during exploration. Browser physics demonstrates design and is not proof of Unity
physics parity, performance or device acceptance. No publishing, asset purchases,
commits or production migration are part of this phase.

After a direction is chosen, write a separate approved Unity implementation plan,
update `SPEC.md` deliberately, and verify compilation, simulator routes and device play.

## Progress

- [x] Inspect project rules and existing design.
- [x] Review current story, ten stages and relevant Claude sessions.
- [x] Research official comparison games and puzzle design resources.
- [x] Record proposals and a concrete implementation plan.
- [x] User go-ahead, as required by `.claude/rules/workflow.md`.
- [x] Build and verify the comparison prototype.
- [ ] User chooses the Unity direction.

## Implementation evidence

- Files live in `Tools/design/prototype/`; no Unity scripts/scenes/assets changed.
- Added `app.js` for interface/input/replay integration, `art.js` for original Canvas
  drawing, and `stories.js` for the three full adult story arcs; these supplement the
  originally proposed four files to keep ownership and responsibilities clear.
- `verify-routes.js`: 60/60 collection/stage/story selections won without deaths,
  representing 26 distinct layout/route combinations. Baseline stage 9 route is over
  par by one launch; some proposed tool routes can be bypassed legitimately.
- 19/19 engine tests and art regression checks pass locally. Checks were written before
  implementation and observed regression failures before the corresponding fixes.
- ESLint correctness rules and Prettier formatting pass; no TypeScript setup exists.
- Browser checks passed representative shadow, bell boss and original cannon replays,
  restart, pause, independent art selection, accessible launch, mouse pointer cancellation
  and Chromium touch events at 390px without horizontal overflow or runtime errors.
- `python3 Tools/check_levels.py`: 10/10 current Unity stage descriptions pass in their
  existing approximation. No new Unity compile/play test ran during this isolated work.
- `graphify update .` ran successfully; source graph now includes browser code.
- Independent review fixes cover stable respawn, ghost/phase visibility, bell countdown,
  wind direction and temporary-gate support. The reviewer reran the checks and approved
  the final implementation with no outstanding code/security findings in this scope.
- Browser preview: `http://127.0.0.1:8876/prototype/`. `README.md` explains how to
  restart the local preview and run the checks; `routes.md` documents completion evidence.

## Original-reference clarification

The user requested inspection of the handmade stages from before the first AI overhaul.
`Tools/design/original-scenes.md` records `Level_0_test`, `level_1_test`, `Level_1` and
recovery `0`, their geometry, original art and Git history limits. The browser baseline
was labelled too broadly as “Original”; it is now labelled **Current Unity** because
it represents the AI-reworked ten-stage LevelLibrary. A faithful handmade-scene browser
reconstruction has not yet been implemented. Use legacy `Level_1` as the main reference
and `Level_0_test` as the sandbox when deciding the next design iteration.

## Original-art prototype (2026-10-17 to 2026-10-18)

The user asked for a better story and prototype on the original character and assets,
then refined it: Izan overhears the pumpkins plotting, they chase him; three pumpkins per
stage give the stars; the door completes the stage. Spec:
`Tools/design/original-prototype-spec.md`, approved with "build the prototype".

- [x] Export the original PSDs to PNG (`Tools/export_original_art.py`, psd-tools via uv).
- [x] Failing engine tests first, then door/star rules, webs, frayed stones, posts,
      spiders, aim pursuit, boss bombs. 29/29 tests, comparison prototype still 60/60.
- [x] Ten stages, story, renderer and screens in `Tools/design/original/`.
- [x] Route search and verification: 10/10 three-star routes, each using its lesson.
- [x] ESLint clean; `python3 Tools/check_levels.py` still 10/10 (Unity untouched).
- [x] Seen in the built-in browser at 375x812: title, prologue, stage 1 launch and smash.
- [x] Independent code review: 8 findings, all fixed (landed stones re-check support,
      crush only below the stone, aim freezes pumpkins only during a real drag and is
      cancelled if Izan leaves rest, validated saved progress, stories marked seen when
      they end, double-tap guard, dust at the stone, bombs cleared on any boss defeat).
      31/31 engine tests, both route checks green.
- [ ] User plays all ten stages and gives feedback.
- [ ] Separate approved plan to port the chosen story and mechanics to Unity.

## Round 2: polish and tricks (approved 2026-10-18)

User feedback after playing stages 1 to 6: cutscenes need more immersion; pumpkin
movement and the way new skills are introduced need a professional touch; levels must
be checked for human playability (stage 7's fading stones are too fast); loves the sticky
web and wants more tricks. Approved: all of the below, with synthesized sound, plus
better object-on-object collisions (moving grave stones crush pumpkins).

- [x] Engine (`Tools/design/prototype/game.js`, tests first, old prototype unchanged):
      lively pumpkin AI behind `options.hunters = "lively"` (sleep, notice, accelerate,
      lunge, return home); `trampoline` web; `zip` thread with hero state `zip`;
      `seesaw` stone that flings the pumpkin on its other end; rolling pumpkins
      (`roll: true`) that bowl over others and shatter on hard landings; moving stones,
      falling stones and flung pumpkins crush pumpkins they hit; ghost stones expose
      their fade warning.
- [x] Human-pace route search: at least 1.2 s at rest before every launch, pumpkins
      hunting during that pause, dash reaction delay. Verify every stage under it.
- [x] 14 stages in three chapters (new: seesaw in the graveyard, trampoline and zip under
      the web, rolling pumpkins in the cellar); stage 7 rebuilt with 7 s cycles and a
      visible fade warning. Story beats moved to after stages 4, 10 and 14.
- [x] Teaching: first-time object focus overlay (pause, dim, camera to object, Owl line,
      hand gesture), Owl tip after three deaths, in-stage Owl remarks.
- [x] Pumpkin presentation: notice flare and ring, bob and tilt, lunge squash, hit-stop
      and camera kick on smash.
- [x] Cutscenes: camera drift, typewriter text, per-line speaker animation, fog and
      fireflies, lightning on "it heard us", chapter cards.
- [x] Sound: WebAudio synth (wind loop, launch, dash, smash, thud, web, zip, door, death,
      boss), unlocked on first touch, mute button.
- [x] Browser check at 375x812 (title, prologue effects, teaching cards, stages 4, 7, 8,
      10, 11), docs, graph update.
- [x] Independent review of round 2: 12 findings, all fixed (one tap dismissed two
      teaching cards; stored routes could rely on an 8 ms dash after a bounce, now one
      dash per action and routes 7 and 8 re-searched; audio unlock retried on every
      touch; typewriter double-tap guard; roller push cooldown; movers no longer crush a
      pumpkin hovering above their surface; nits). 39/39 tests, 60/60 and 14/14 routes.
- [ ] User plays the 14 stages and gives feedback.

## Mqidec character art (2026-10-18)

The user chose the name **Mqidec** and wants a premium Kabyle look: brown burnous
(abernus) worn open in front, the hood (aqelmun) snug on the head with the ears through
it when hunted, light protective marks. Code-drawn versions (art.js `mqidec`) hit their
ceiling, so the cloak is now **simulated as cloth in Blender**:

- Blender 4.2 LTS is installed portably at `~/Apps/blender` (no admin rights).
- `Tools/blender/mqidec_cloak.py` builds the egg body (holdout + collider), a hidden
  shoulder collider, the open cloak sheet pinned at the collar, the hood (up or lying on
  the back), wool material with braid edges, the sprite's lighting, an orthographic
  front camera at 200 px/unit, and renders `idle`, `hunted`, `flight` to
  `Tools/design/original/assets/cloak/`. Run:
  `~/Apps/blender/blender -b -P Tools/blender/mqidec_cloak.py -- idle hunted flight`
- `art.js` `mqidecSim` composites the renders over the sprite (render px / 2 = part px);
  the design sheet `characters.html` card 2 uses it, card 3 keeps the drawn version.
- [ ] Tune the scene until the user accepts card 2, then make it the in-game Mqidec.

## The tales of Mqidec, first build (approved 2026-10-19)

Story: `Tools/design/yennayer-spec.md`, text: `Tools/design/yennayer-script.md`.
Decisions: 12 fresh stages (3 tales x 4); story screens show tale scenes, the hearth only
opens and closes each night; hunters drawn in code (pots, spiders, ijenniwen); four
languages now (Taqbaylit draft, French, Arabic RTL, English).

- [x] Engine, tests first: `teryel` object (lethal on any touch, may patrol, never
      fought), trapped by a rolling jar, a falling stone or a flung object;
      `rules.door = "trap"`; seesaw `trigger` releases linked frayed stones.
- [x] 12 new stages in `levels.js`, per-tale theme and hunter kind; human-pace routes.
- [x] `build-text.py` turns the script's tables into `text.js`, so corrected
      Taqbaylit is one command away from the game.
- [x] Art: kitchen, loom room and gorge backdrops; shelves and beams; pots, spiders,
      ijenniwen; Teryel; wooden door; hearth scene and tale scenes.
- [x] Screens: nights flow, language selector, RTL, speakers, tale map.
- [x] Browser check (title, hearth, all three places, Arabic RTL, French, teaching card),
      docs, graph.
- [x] Independent review: 2 serious findings fixed (death loop when resting in a
      patrolling Teryel's path, now never a respawn point plus 0.6 s grace; stage 4
      unwinnable once its jar broke, the jar is now a tool that rolls back and not a star)
      and 8 smaller ones (trap toast, gate stays down after a death, night opening for any
      first-played stage, next night follows directly, Kabyle browser default, tip text on
      language change, translated aria labels, strict text builder). 50/50 tests,
      60/60 and 12/12 routes.
- [ ] User corrects the Taqbaylit in `Tools/design/yennayer-script.md`, then
      `python3 Tools/design/original/build-text.py`.

## Polish pass on the three nights (2026-10-19)

- [x] Story scenes: camera drift with an eased push-in per line, embers (one cached
      sprite), dust, mist; Jida's teasing gesture; children flinch on hushed lines;
      Teryel opens her eyes when she speaks.
- [x] Hunters: pots hop with squash and stretch, spiders bob on their threads,
      ijenniwen flicker and blink. Teryel's eyes follow Mqidec, she rocks while
      walking and struggles when trapped.
- [x] Sound: snore, growl, clink, whisper, crackle, creak; ambience follows the place
      (fire indoors, loom creaks, gorge wind, whispers and the owl outside); each hunter
      kind has its own notice sound; Teryel snores or growls when Mqidec is near.
- [x] Gorge cliffs anchored to the world (they used to change shape while scrolling).
- [x] Review: approved with nits, all fixed (cliff loop guarded against a zero-size
      canvas, one timer handle per sound loop, no scheduling while audio is suspended,
      wind changes at once with the place, drift kept inside the overscan).
- [ ] Difficulty tuning from the user's playtest notes.
- [x] Night 4, the rooftops of Lqelɛa (2026-10-19): Mqidec takes back the Yennayer
      bread; Teryel's ravens hunt him. Engine, tests first: sliding roofs (`slope`
      platforms, hero state `slide`, tap to hop off) and knockable tile stacks (`knock`
      drops pushed along the hit, skidding off their ridge). Stages 13-16 verified at
      human pace (slide, knock, slide into a stack, the stack drops Teryel down the
      chimney). Text in four languages, art, caw sound and roof ambience.
- [x] Review of Night 4 (2026-10-19). Fixed: a tap now hops Mqidec off a roof; tile
  stacks are drawn where they really are; landing on a stack from above stands on it (only
  a side hit or a dash knocks it); a knocked stack stops at the walls, ends its skid after a
  real fall and crushes ravens it pushes; a dash survives catching a roof; a slide stops at
  the walls; flat or vertical roofs are ignored; only the roof just left is skipped for a
  moment; bombs pass through roofs. Stages 14 and 16 got new routes (16 now takes 5
  launches; Night 4 stars count hunters only). Kept: the shared replay function still
  allows a repeated dash because the old comparison prototype's stored routes need it;
  the tales tools enforce one dash per launch themselves.
- [x] Night 5, the olive press (2026-10-19, chosen by the user): Mqidec takes back Jida's
      silver tabzimt; Teryel's rats hunt him. Engine, tests first: spilt oil (`oil` ledges;
      a fast landing glides on, a gentle one stops; "oil" event), the press wheel (`wheel`
      planks turning level round an axle, carry a resting hero, never a respawn point) and
      walking rats (`walk`: hunters that stay on their own beam). Stages 17-20 verified at
      human pace (oil; ride the wheel; wheel then oil; glide into the press beam so it
      pins Teryel). The verifier also checks that no wheel plank carries a rider through
      another platform. Text in four languages (Taqbaylit words to check: tasirt, asalas,
      igejdan, tafelwit), art (press, oil, wheel, beam, rats, the tabzimt), squeak and
      drip sounds, press ambience.
- [x] Review of Night 5 (2026-10-19). Fixed, tests first: a wheel rider is no longer
      carried through the walls, ledges or rats (the plank slides out from under him); the
      press beam vanishes into the trap and is not reset by a later death (it used to come
      back, and lie invisible but solid); a glide on oil knocks a rat flat at any speed, as
      the story says; rats keep facing the hero at the end of their beam; the oil flag is
      reset on launch, death and restart. The press wall pattern no longer jumps while
      scrolling; "Up he goes!" plays only on a rising plank. The verifier now checks every
      wheel with the rider's full width against platforms and hunters, and that walking
      rats stay on their beams; stages 17-19 were re-laid out and re-searched.

## Night 6 plan: Tislit n Wanzar, the bride of Anzar (proposed 2026-10-20)

Status: built and reviewed (2026-10-20); awaiting the user's playtest and Taqbaylit
corrections. Plan approved by the user with "go with a helper". Chosen by the user on 2026-10-20 from the "later tales"
list, with water and well buckets as the new tricks.

**Objective:** add Night 6 (stages 21-24) to the tales prototype, with water Mqidec
floats on and well buckets on one rope, each verified by tests and a three-star route at
human pace.

### The tale

The spring of Ath Abbas is dry. Teryel stole *Tislit n Wanzar*, the ladle (aɣenja) the
village dresses as a bride and carries from door to door to call the rain, and hid it in
the old cistern above the spring. **Goal: the ladle bride.** Hunters: her frogs
(imqerqar), crouched on stones, leaping at Mqidec when he comes near. Place: the spring
in a dry ravine at night, the stone cistern, the well and its pulley, a fig tree.
Stages: 21 *Tala* (the spring: water) · 22 *Asiṭel* (the bucket) · 23 *Lbir* (the
well: buckets and water) · 24 *Teryel deg tala*: break the cistern wall; the flood
carries Teryel down the ravine. Ending: the rain comes, the children run to the window,
Jida sings the first line of the Anzar song. New Taqbaylit words (aɣenja, imqerqar,
asiṭel, lbir, tala) and the song line go on the user's checklist.

### Scope

**In:** engine rules in the shared `prototype/game.js` (tests first), four stages,
routes, story beats, text in four languages, art, sound, docs.
**Out:** Unity code, scenes and assets; the comparison prototype's stages (must still
replay 60/60); the Green Harvest set (left untouched, no checks exist for it); Night 7;
the Mqidec cloak.

### Approach: the rules

All new rules are opt-in on the level data, so stages 1-20 keep their exact behaviour;
their stored routes replay frame by frame, so `verify-routes.js` 20/20 is the proof.

- **At rest.** One helper `atRest(state)` (`resting` or `float`) replaces the
  `resting`-only checks in `launch()`, app.js input (pointer down, release, drag) and
  find-routes.js (thinking pause, end of an action).
- **Water** (`objects`, `type: "water"`, box `x, y, w` with surface `level`, optional
  `rise: { dy, period }` for a basin that rises and falls, optional `id`):
  - A flying hero is caught when his centre crosses the surface going down. Water is
    ignored for 0.25 s after a launch from it.
  - Under the surface: drag `exp(-3 dt)` on both axes, upward push `30 · min(1, depth)`
    against gravity. He settles into `float` within 0.15 of the surface once his speed is
    below 0.8 for 0.12 s.
  - `float` follows the surface. A rising basin carries him; if that pushes him into a
    ledge he drops out (flying, `wheelRiderBlocked`-style). If the surface falls below
    a ledge he is over, he lands on it as normal.
  - Water rising over a resting hero makes him float.
  - Dash still needs `flying`; in water the drag spends it quickly (allowed, weak).
  - `float` is cleared by `launch()`, `die()` and `restart()`. It is never a respawn
    point, and neither is any rest with his centre under water.
  - Hunters and stones ignore water. Events: `splash`, `float`.
- **Well buckets** (two `platforms`, `type: "bucket"`, same `rope` id, each with `top`
  and `bottom`; the pair must have equal travel, checked when the stage loads):
  - One rope value `s` in [0, 1] is stored as plain data, so `structuredClone` copies it:
    A sits at `top - s·travel`, B at `bottom + s·travel`.
  - All ropes move in one pass at the start of `tick()`, before the platform loop. Their
    previous positions are recorded first, so the carry rule and the stones' held check
    see a consistent move whatever the platform order.
  - Load: a resting hero weighs 1 and a stone resting in the bucket weighs 2. A hero on
    a stone in the bucket counts on that side.
  - The heavier side goes down at 2.5 units/s; equal loads stay. Buckets stop at their
    ends.
  - Stones ride buckets: a new held rule for a stone resting on a bucket. Stones on
    movers and wheels keep today's behaviour.
  - Jerk: a stone landing in a bucket at ≥ 6 units/s runs the rope at 10 units/s. A hero
    resting in the other bucket is flung up with `vy = min(16, 1.3 · impact)`, flying,
    dash re-armed. Frogs are not flung.
  - A rider is dropped (flying) if a bucket would carry him through a platform or wall.
  - Buckets are never a respawn point. On death, knocked stones reset (existing rule)
    and the rope follows its loads again. Events: `bucket`, `jerk`.
- **Frogs** (lively hunter field `leap: { height, every }`, with `walk` for hopping
  along the stone): only while hunting, every `every` s, the frog leaps `height` above
  its stone along a parabola, added after the `walk` reset of `y`. The timer resets in
  `die()`. Same lethality and smash rules as every hunter.
- **Cistern and flood** (a `drop` with `knock: true, flood: <water id>`, water with
  `to`): the cistern is knocked loose by a hard side hit or a dash (existing rule).
  When it falls, the linked water rises to `to` in 1.5 s, event `flood`. A fallen
  cistern never resets on death, and the flooded water stays up. Any free Teryel whose
  centre is under any water surface is trapped (event `trapped`), so a flood that misses
  her the first time still catches her later. Stage 24 teaches `flood`; its layout keeps
  the falling cistern itself from landing on her.

### Steps (each verified before the next)

1. **Spec and text.** Add "Tale 6" to `Tools/design/yennayer-spec.md` (decision row,
   section, removed from "later tales"). Add the Night 6 tables to
   `Tools/design/yennayer-script.md` (intro, stage lines, ending, tips `tip.water`,
   `tip.bucket`, `tip.frog`, remarks, names `tale.6`, `stage.21`-`24`). Rebuild
   `original/text.js`.
   Done when:
   - `python3 Tools/design/original/build-text.py` succeeds, and every new id is in
     `text.js` in four languages.
   - `git diff --stat` shows only these three files, and the text.js diff only adds ids.
2. **Engine, tests first.** Write failing tests in `prototype/game.test.js` (lively
   hunters where frogs are involved):
   - Entering water slows him and he floats. He can launch from float without being
     re-caught. A rising surface carries him, and a ledge above drops him out.
   - Float is never a respawn point. `die()` clears float.
   - Buckets: the hero's side goes down and the other rises; equal loads stay; buckets
     stop at their ends.
   - A resting stone rides a bucket. The rope moves consistently whatever the platform
     order (both orders tested).
   - A hard stone landing flings the hero in the other bucket. A rider is dropped
     before a platform.
   - A frog leaps only while hunting. A slow touch kills, a fast one breaks it.
   - The flood traps Teryel. The water stays up and the cistern stays fallen after a
     death. A Teryel walking into flooded water is trapped later.
   Show them failing, then implement in `prototype/game.js`.
   Done when:
   - `node Tools/design/prototype/game.test.js` is all green (73 + new).
   - `node Tools/design/prototype/verify-routes.js` is still 60/60.
   - `node Tools/design/original/verify-routes.js` is still 20/20 with the stored
     routes unchanged.
   - Only `prototype/game.js` and `prototype/game.test.js` changed.
3. **Stages and routes.** Add the tale (`key: "spring", hunter: "frog"`), helpers and
   stages 21-24 to `original/levels.js` (header "six tales").
   - `find-routes.js`: `atRest`, the new uses (`float`, `ride:bucket`, `jerk`, `flood`),
     and a `--strip <kind>` option that removes a mechanic from a stage copy.
   - `verify-routes.js`: the new uses, plus layout checks that no bucket's travel and
     no frog's leap passes through a platform.
   - Run `node Tools/design/original/find-routes.js 21 22 23 24` to write `routes.js`.
   Done when:
   - `node Tools/design/original/verify-routes.js` prints 24/24 three stars at human
     pace, each stage using its lesson, with the new layout checks passing.
   - The stored routes for 1-20 are byte-identical in `routes.js`.
   - `find-routes.js 21 --strip water` and `find-routes.js 22 --strip bucket` find no
     three-star route: necessity evidence from a random search, not a proof.
   - Changes stay in `Tools/design/original/`.
4. **Screens, art and sound.**
   - `app.js`: night list, `place()` → `spring`, tips, event handlers, and `atRest` in
     the input code.
   - `story.js`: tale 6 beats.
   - `tales-art.js` and `art.js` hooks: ravine backdrop, water with a moving surface
     drawn over the hero, a float pose, buckets with rope and pulley, frogs (crouch and
     leap), the cistern, the ladle bride, story scenes, the flood and rain.
   - `sfx.js`: splash, croak, rope creak, flood and rain sounds; a `spring` ambience
     with dripping water and night insects.
   Done when:
   - `npx eslint .` reports nothing in both `Tools/design/original/` and
     `Tools/design/prototype/`.
   - The built-in browser at 375x812 shows these with no console errors, and the
     screenshots are shared: the Night 6 intro, stage 21 floating, the stage 22 bucket,
     the stage 24 flood, and the ending.
   - Tests and both route checks are still green.
   - Changes stay in `Tools/design/`.
5. **Review and wrap-up.**
   - Run an independent `code-reviewer` pass on the Night 6 diff. Fix or rebut every
     finding, writing a test first for each bug.
   - Update this plan's evidence, `yennayer-spec.md` and CLAUDE.md §10 if needed, then
     run `graphify update .`.
   - Commit on `feat/black-rabbit-pumpkin-hunt`.
   Done when:
   - Tests, both route checks, ESLint and `python3 Tools/check_levels.py` (10/10, Unity
     untouched) re-run green after the fixes.
   - The commit exists.

### Files touched

`Tools/design/yennayer-spec.md`, `Tools/design/yennayer-script.md`,
`Tools/design/prototype/game.js`, `Tools/design/prototype/game.test.js`, and these in
`Tools/design/original/`: `text.js`, `levels.js`, `routes.js`, `find-routes.js`,
`verify-routes.js`, `app.js`, `story.js`, `tales-art.js`, `art.js`, `sfx.js`. Also
`task_plan.md`, `CLAUDE.md` (§10 only, if needed) and `graphify-out/`.

### Parallel work

Once step 3 fixes the data names, the art and sound work is independent of the screens
and text, so a subagent can take it while the parent integrates. This is optional and
your call.

### Risks and open questions

- Changing the tick order for buckets could shift stored routes by a frame. Step 2's
  20/20 replay catches this, and the bucket pass does nothing when a stage has no
  buckets.
- Float plus a rising basin can make a ledge too easy to reach. `--strip` gives some
  evidence that each lesson is needed; the user's playtest is the real judge.
- Rope speed, jerk strength, water drag and frog timing are first guesses for playtest.
- The Anzar song line and every new Taqbaylit word need the user's correction.


### Progress

- [x] 1. Spec and text (2026-10-20): `build-text.py` wrote 222 lines; 31 new ids in four
      languages; text.js diff has additions only; Tale 6 in `yennayer-spec.md`.
- [x] 2. Engine, tests first (2026-10-20): 21 new tests written and seen failing (21/21),
      then `prototype/game.test.js` 94/94; `prototype/verify-routes.js` 60/60;
      `original/verify-routes.js` 20/20 with `routes.js` unchanged. Only `game.js` and
      `game.test.js` changed. Amendments, found while implementing:
      - A rider about to be carried into a ledge **jams the rope** instead of being dropped
        (dropping him made him land in the bucket again and loop).
      - A death **resets the rope** to its start, like the stones.
      - The rope's reference bucket is the left one (`s`), so platform order never matters.
      - Water drag `exp(-4 dt)`; he floats within 0.25 of the float line at under 1.2
        units/s relative to the surface (with the planned 3 and 0.15/0.8 he bobbed for
        over 1.5 s). The float line is where the push balances gravity (0.245 deep).
- [x] 3. Stages and routes (2026-10-20): stages 21-24 in `levels.js` (tale `spring`,
      hunter `frog`); `find-routes.js` knows `atRest` and `--strip`; `verify-routes.js`
      knows the new uses and checks bucket travel and frog leaps against platforms.
      `node Tools/design/original/verify-routes.js`: 24/24 three stars at human pace, each
      stage using its lesson (21 float; 22 ride:bucket; 23 float, ride:bucket, jerk; 24
      flood). Stored routes 1-20 byte-identical. Amendments, found while laying out:
      - **Tied stone** (`tied: <rope>`): it slips `delay` s after he rests in a bucket of
        that rope. Without it, nothing could drop a stone into the other bucket while he
        waited in his, so the jerk could not happen in play (test first, 95/95).
      - **The jerk throws him at `min(20, 10 + impact)`**, more than a launch's 16;
        otherwise it only matched a normal launch from the same bucket.
      - A hero resting in water with nothing under him floats (found when stage 23 started
        him in the well; test first, 96/96).
      - **Necessity check, partly not met.** `--strip flood` on 24 finds no route: the flood
        is required. (Without its flood the cistern is removed: it never falls as a stone.)
        `--strip water` on 21 and `--strip bucket` on 22 and 23 still find three-star
        routes. They climb with launch-plus-dash (about 18 units of height), which ceilings
        did not stop on paper. The lesson is used by the verified route but not forced.
        This is the same limit the comparison prototype already records, so it is left
        for the user's playtest rather than chasing it with more geometry.
- [x] 4. Screens, art and sound (2026-10-20). Done: `app.js` (atRest input,
      spring/rain ambience, tips water/bucket/frog/cistern, splash/float/bucket/jerk/leap/
      flood handlers, flood/rain beat fx), `story.js` (tale 6 beats, tips, remarks); helper
      added art and sound (springBack, frog, water front layer, float pose, well/buckets,
      cistern, tislit, scenes spring/spring-cistern/spring-trap/spring-rain/hearth-rain;
      sounds splash/croak/rope/flood/rain, spring and rain ambience). ESLint clean in both
      folders. Browser at 375x812: Night 6 on the map, chapter card, spring scene, stage 21
      splash and float, stage 22 bucket card; all five new scenes rendered; no console
      errors. The helper's last fix landed (spring frayed stones as cracked slabs on a
      rope to the well beam via `th.hanging`; tied stones roped to a well frame raised
      above them, fraying as the tug timer runs; `th.well` now takes `g`); ESLint clean
      after it. Browser (375x812, no console errors): stage 23 well with the tied stone on
      the raised frame; a hop into the left bucket slipped the stone, jerked the rope and
      carried Mqidec to the top ("He flew!"); stage 24's cistern burst, the flood filled
      the bed and trapped Teryel. Found and fixed: the tied stone showed the frayed-root
      card; it now has its own `tip.tied` in four languages.
- [x] 5. Review and wrap-up (2026-10-20). Independent `code-reviewer`: 1 serious finding
      and 5 nits.
      - Fixed, tests first: rising water under a ledge pinned a floating Mqidec in a
        flying state he could not be launched from (stage 24 under the terrace); he now
        stays floating, held under the ledge.
      - Fixed, tests first: only the first frog leap of a hunt was announced.
      - Fixed, tests first: a stone could fall through a bucket rising at jerk speed.
      - Fixed: the rain sound stopped at 2 s (it now loops the noise for its length).
      - Fixed: the verifier's bucket check now covers a rider at the bucket's edge.
      - Kept: the tied stone's slip timer accumulates over visits, like frayed stones.
      Gates after the fixes: `prototype/game.test.js` 99/99; `prototype/verify-routes.js`
      60/60; `original/verify-routes.js` 24/24 (routes 1-20 unchanged); ESLint clean in
      both folders; `python3 Tools/check_levels.py` 10/10 (Unity untouched);
      `graphify update .` done.

/goal every Night 6 step in task_plan.md is checked off per its own "Done when", and the tales prototype's tests, route checks and ESLint pass
