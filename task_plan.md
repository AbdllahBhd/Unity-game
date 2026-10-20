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
