# Browser layouts and route evidence

The baseline data in `levels.js` translates `Assets/Scripts/HollowNight/Stage/LevelLibrary.cs`, read on October 14, 2026. All ten starts, solid ledges, ground gaps, hunter homes, door locations, spike widths, mushrooms, moving platforms, wind zones, portal pairs, bat travel vectors, cannon velocities, cracked-block rows, ghost periods and boss coordinates are retained. Source background decoration names and locations are retained as metadata for visual comparison.

Platform `y` denotes its walking surface in the browser. Unity ledge centres are therefore converted by adding half their height. Ground is at zero. Izan’s start is the surface plus radius 0.45. Doors use the centre of their 1.9-unit trigger (surface plus 1); cannon locations use the Unity trigger centre (surface plus 1.05). Mushroom bodies use surface plus 0.55 and their cap is approximated by a simple trigger. Spikes use the Unity trigger centre and reduced collider width. These conversions are intentional, rather than changes in level layout.

The browser engine approximates Unity Physics2D. Circle and axis-aligned contacts, friction, moving-platform attachment, trigger ordering, enemy movement and boss timing require separate Unity acceptance. Browser route wins establish only that this browser prototype can be completed. The original Python simulator is a third, distinct approximation; its routes do not prove browser or Unity pursuit behavior.

The redesign introduces one tool at a time: launch, pursuit, dash, mushroom, moving ledge, signature puzzle, portals, descent, cannon, then boss. Safe solid shelves support deliberate planning. Stages 3, 6 and 10 have distinct geometry for lantern clusters, shadow switches and gates, and bell-phase ledges. The remaining redesigned stages are shared to isolate each direction’s differences.

## Verified replays

All 26 stage/direction combinations below reached normal victory through their stored action route using `HNGame.simulateRoute`. Every recorded replay used zero deaths; baseline stage 9 currently needs six launches against the authored par of five. These are completion routes, not proofs of optimal par or puzzle quality. The boss routes now clear every pumpkin before claiming the lantern, and shadow routes activate every ghost switch.

`get(mode, id, direction).route` contains exact world launch velocities and elapsed waits, with an optional `dashAt` time after launch and `activate` before launch. The demo uses those same actions. Browser validation runs 120 simulation steps per second. Float precision is kept deliberately in the stored evidence; rounding it can change collision and timing outcomes.

| Layout | Stage | Mechanic | Result | Launches/par | Deaths | Seconds |
|---|---:|---|---|---:|---:|---:|
| baseline | 1 | light | Win | 1/2 | 0 | 1.12 |
| baseline | 2 | light | Win | 4/4 | 0 | 5.00 |
| baseline | 3 | light | Win | 3/5 | 0 | 4.56 |
| baseline | 4 | light | Win | 3/4 | 0 | 5.12 |
| baseline | 5 | light | Win | 5/6 | 0 | 7.91 |
| baseline | 6 | light | Win | 6/6 | 0 | 10.75 |
| baseline | 7 | light | Win | 3/5 | 0 | 4.65 |
| baseline | 8 | light | Win | 4/5 | 0 | 5.88 |
| baseline | 9 | light | Win | 6/5 | 0 | 13.59 |
| baseline | 10 | light | Win | 3/7 | 0 | 6.73 |
| redesigned | 1 | light | Win | 2/2 | 0 | 1.21 |
| redesigned | 2 | light | Win | 3/3 | 0 | 4.04 |
| redesigned | 3 | light | Win | 2/3 | 0 | 1.59 |
| redesigned | 3 | shadow | Win | 3/3 | 0 | 3.87 |
| redesigned | 3 | bell | Win | 3/3 | 0 | 2.68 |
| redesigned | 4 | light | Win | 2/4 | 0 | 5.12 |
| redesigned | 5 | light | Win | 3/4 | 0 | 5.48 |
| redesigned | 6 | light | Win | 3/5 | 0 | 3.52 |
| redesigned | 6 | shadow | Win | 3/5 | 0 | 3.17 |
| redesigned | 6 | bell | Win | 4/5 | 0 | 3.63 |
| redesigned | 7 | light | Win | 3/3 | 0 | 3.80 |
| redesigned | 8 | light | Win | 3/5 | 0 | 4.93 |
| redesigned | 9 | light | Win | 2/4 | 0 | 5.26 |
| redesigned | 10 | light | Win | 4/7 | 0 | 8.35 |
| redesigned | 10 | shadow | Win | 6/7 | 0 | 12.02 |
| redesigned | 10 | bell | Win | 5/7 | 0 | 7.21 |

The route search intentionally accepts legitimate alternative solutions. Some sample solutions dash past cracked blocks instead of breaking them; the prototypes allow the player to try the destructive path. Lantern activation gathers hunters but remains an optional tactical aid rather than a victory flag. Moving platforms remain useful alternate perches rather than mandatory checkboxes. These are areas to evaluate in human playtesting before tightening layouts.

To reproduce a row, load the two CommonJS modules with Node, call `const level = HNLevels.get(mode, id, direction)`, then `const result = HNGame.simulateRoute(level, level.route, {direction})`. Require `result.won === true`; no force-win or direct hero-state mutation is used by the replays.

