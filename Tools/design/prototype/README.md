# Hollow Night browser design study

Open `index.html` directly in a browser, or serve the design folder locally:

```bash
python3 -m http.server 8876 --bind 127.0.0.1 --directory Tools/design
```

Then visit `http://127.0.0.1:8876/prototype/`. No installation, build or network assets
are required. The parent folder is served so the written proposal link also works.

## Compare and play

The three concept screens, asset sheets and full narrative arcs are shown together.
Choose a direction to play, or combine story/mechanic and art independently.
Stage collection selects the current ten Unity layouts or ten proposed layouts.
The current Unity collection contains the AI-reworked Hollow Night stages, not the
user's handmade legacy scenes. Those are documented in `../original-scenes.md`.
Redesigned stages 3, 6 and 10 have different geometry for lantern lure, shadow replay
and bell phases; the other seven share their learning sequence.

Drag down and away from the intended flight, then release. Tap in flight to dash
once. Land on a platform top before launching again. The buttons and launch sliders
offer keyboard alternatives. Focus the playfield for Space (dash), L (signature),
R (restart) and Escape (cancel aim or pause). Window blur pauses the game.

“Watch a solution” restarts the stage in planning mode and replays stored launch,
dash and signature actions through normal collisions. It does not force a win.
Restart or act manually to leave the replay. A replay completion demonstrates a
route, not an optimal solution or proof that its puzzle is satisfying.

## Checks

```bash
node Tools/design/prototype/game.test.js
node Tools/design/prototype/art.test.js
node Tools/design/prototype/verify-routes.js
python3 Tools/check_levels.py
```

Run `node --check` on each prototype `.js` file for syntax. This prototype supplies
`eslint.config.mjs` for correctness checks; run ESLint with that configuration on this
folder. Formatting was checked with Prettier. There is no TypeScript/typecheck setup
and no root npm test or lint script. The JavaScript uses plain browser APIs and Node's
built-in test framework; these verification tools are not runtime dependencies.

With the preview server running, `browser-check.js` can be executed using
`playwright-cli -s=hollow-night run-code --filename Tools/design/prototype/browser-check.js`
after opening that session. It verifies representative solution replays, independent
art selection, restart, pause, accessible launch, mouse cancellation and real Chromium
touch events at 390px width. Desktop and phone viewport screenshots are saved under
`output/playwright/`. This emulated browser check is not a physical-phone acceptance test.

The engine tests cover the physical rules and respawn regressions. The route check
verifies all 60 collection/stage/story selections. Of these, 26 have distinct
layout/route combinations. Baseline stage 9's demonstrated solution takes six
launches against authored par five; it earns two stars.

`routes.md` records the coordinate conversion, each distinct route and known
approximation limits. Browser collision simulation is not Unity Physics2D. Boss movement/bombs,
trigger shapes, cannons, ghost timing, contacts and enemy behavior are approximations.
The concept art is original procedural Canvas drawing, not production sprite sheets.
Unity scripts, scenes, sprites and `.meta` files were not changed.

The prototype intentionally allows alternative solutions. Some routes bypass crates
or moving platforms. Human playtesting should decide which tools need compulsory
teaching, and whether continuous pursuit creates tension or prevents planning.
