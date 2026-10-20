# The user's original handmade scene references

Inspected 2026-10-14 after the user clarified that the reference should be the scenes
from before the first AI redesign. This is scene/source inspection, not Unity playtesting.

The browser comparison's `baseline` collection translates the current AI-reworked
`Assets/Scripts/HollowNight/Stage/LevelLibrary.cs`. It is not a reconstruction of the
handmade legacy levels. Its visible label was corrected to **Current Unity**.

## Retained scenes

- `Assets/Scenes/Level_0_test.unity`: early sandbox with five graveyard platforms,
  the layered rabbit prefab, separate ball, owl and spider rig. No GameManager,
  exit door or pumpkin prefab. Rabbit starts around (7.01, 0.15), gravity scale 3.
- `Assets/Scenes/level_1_test.unity`: launch/trajectory test with three pumpkin
  prefabs and a cauldron near the top. No door or win menu.
- `Assets/Scenes/Level_1.unity`: most complete retained handmade game reference:
  rabbit drag/trajectory, three pumpkins, exit door, win menu, three stars and
  menu/restart/next buttons. Rabbit starts around (7.01, -3.7), gravity scale 4.
- `Assets/_Recovery/0.unity`: recovery copy added during the Unity 6 upgrade.
  Inspected object names, positions, script refs and prefab positions correspond
  to `Level_1.unity`; it is not evidence of a separate designed stage zero.

All cameras have orthographic size 24 and centre (0, 1.2, -10). The legacy backdrop
sprite is 27 by 48 world units; this scale differs substantially from today's
fixed-width 12-unit level system.

## Level 1 composition

Platform centres: (7.60,-4.7), (-6.60,0.5), (7.8,5.7), (-5.40,13.3), (9.14,13.3).
Their colliders are approximately 5.401 by 1.227, offset (-0.303,-0.736).
Pumpkin prefab homes: (-6.62,1.41), (7.92,6.05), (-5.55,13.9).
Door: (8.722,15.7). A cauldron exists at (-9.8,-20.5), below the visible camera;
its existence does not establish that it was part of a playable cannon route.

The current retained legacy code uses impulse launches through `PLayer_drag_drop`,
with an explicit body mass in the aim calculation. `pumkinkScript` responds to
collision speed (health threshold 4 by default); it contains no pumpkin chase AI.
These legacy scripts have received later bug fixes and API upgrades, so their current
behavior is not a verifiable pre-AI executable snapshot.

## Original art

Rabbit prefab chain: `Assets/Animation/player/player best Variant.prefab` →
`Assets/Scenes/player best.prefab` → `Assets/graphics/Texture/Cateracter2 sprite_blue.psd`.
The rabbit is assembled from layers/parts, unlike today's generated animation frames.
Platforms use `ground_tombe.psd`; background uses `back umpty.psd`; pumpkins use
`Jack o lantern_3.prefab` and its texture/death-piece PSD; door uses `door_sprite_2.psd`.

The background composite was readable and exported as an inspection preview to
`output/playwright/original-background-preview.png`. Pillow could not read the main
layered rabbit PSD. No original asset or `.meta` file was modified.

## History limits

The two pre-AI Git commits (`e7879767`, `8b935bc9`) contain only README.md.
The legacy scenes first entered Git in `69e012b5`, together with the AI overhaul.
`Level_0_test.unity`, `Level_1.unity` and `level_1_test.unity` are byte-for-byte unchanged
between that capture and current HEAD. That confirms they were retained, but Git
cannot recover or prove an earlier exact scene state before that first capture.

Use **Level_1** as the main handmade gameplay reference, **Level_0_test** as the early
mechanics/art sandbox, and **level_1_test** as a second layout experiment when refining
the browser comparison. Their actual sprites, proportions, impulse feel and layout
should be reviewed before calling any new comparison a faithful original reconstruction.

## Original rabbit animation and committed code

Further inspection confirmed `Level_1.unity` explicitly assigns `player best.controller`
to its rabbit instance (scene override around line 5146). The variant prefab also
assigns that controller. Controller, base prefab, variant prefab and all four animation
clips are unchanged between first game commit `69e012b5` and current HEAD.

| Clip | Duration | Loop | Authored motion |
|---|---:|---|---|
| `Player_none.anim` | 1.5 s | Yes | Two eye-detail transforms |
| `Player_idl2.anim` | 22.9 s | No | 19 paths: eyes, ears, feet, body pieces and root; position/rotation curves |
| `player_jumping.anim` | 0.4833 s | Yes | Root and two eye-detail transforms |
| `Player_enterdoor.anim` | 0.65 s | Yes | Root movement and shrink from scale 0.5 to 0.2, plus eye-group movement |

The controller switches from default `player_none 0` to idle when `Ground` is true
and back when false. Jump and door-entry states exist but have no incoming automatic
transitions. The `dooropen` parameter is not used by transition conditions. Presence
of a clip is not proof that it plays in the current scene at runtime.

`GameManager.cs` is unchanged since that first capture. The later diff in
`PLayer_drag_drop.cs` changes `velocity` to Unity 6's `linearVelocity`; the controller
has corresponding API updates. The retained input starts a new drag without checking
for a resting state: it freezes the body during aiming and relaunches with impulse.
This permits midflight re-aiming, unlike the newer resting-only launch system. Scene
body mass is 0.5 and gravity scale 4. Those differences are important when reproducing
the original feel. Source wiring and history were inspected; no Unity playback ran.
