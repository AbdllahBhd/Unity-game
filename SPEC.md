# SPEC: Black rabbit + hunting pumpkins redesign

Decided with the user on 2026-10-12. Keep the Hollow Night engine (drag-launch physics, 10 stages,
UI, tools). Replace the hero and the story; make pumpkin-smashing the core goal.

## 1. The hero: Izan the black rabbit (single hero)

- `Heroes.cs`: Izan stays the only playable hero. Hoot, Webster and Pip are removed from the
  roster (`HeroType` keeps only `Izan`; `Heroes.Count == 1`). Hero swap button disappears.
- Look: the legacy prototype rabbit (`Assets/graphics/Texture/Cateracter2*.psd`): black egg-shaped
  body, two tall ears, big glowing white eyes, pale belly patch, small cheek marks.
  The PSD cannot be read outside Unity (no psd library on this machine, Pillow fails), and the
  old character is a rig of parts, not frames. So the rabbit is **redrawn in
  `Tools/generate_art.py`** to match that look, producing `izan_idle/blink/fly/happy/hurt`.
  If the user later exports real PNG frames with these names into `Assets/Resources/HN/`, they
  replace the generated ones with no code change.
- Ability stays Spirit Dash (tap in flight: speed boost, smashes pumpkins, breaks crates).
- Launch speed 16 unchanged.

## 2. The enemy: hunting pumpkins (`Kind.Hunter`)

New element, class `Hunter` in `Elements.cs`, fluent `.Hunter(x, y, range = 5f, speed = 1.6f)`.
- Floating glowing jack-o'-lantern (kinematic, no gravity, bobbing). Sprite `hunter_0/1`
  (alternating glow frames) copied from the legacy `Jack o lantern_3.png` and tinted; a soft
  glow sprite behind it.
- When the rabbit is within `range` it drifts toward it at `speed` (slow enough to escape),
  otherwise returns to its home position.
- Collision with the rabbit:
  - rabbit `Powered` (dashing) or impact speed > 4.5 → `Smash()` (burst, shake, sound, counted).
  - otherwise the rabbit dies (`hero.Die()`), costing a launch.
- Every stage uses `SmashAll()`: the door is sealed until all hunters are smashed. The old
  static `Minion` is removed (replaced by `Hunter`).

## 3. Stars

1 star: reach the door. +1: every pumpkin smashed. +1: launches <= par.
Candy is removed entirely: `Kind.Candy`, `Candy` class, `.Candy()`, HUD candy icons, candy
sound/story mentions. HUD shows `Pumpkins left: N` with pumpkin icons instead.

## 4. Stages

All 10 stages in `LevelLibrary.cs` are revised: candies replaced by 2–5 hunters per stage,
placed so that the simulator finds a route that smashes all of them and reaches the door within
par. Stages 4, 6 and 8 (built for Hoot, Webster, Pip) are reworked for the rabbit: no web lines,
no glide gaps; crates stay (dash breaks them). Boss stage 10 keeps `WitchBoss` mechanics (Morgra
becomes the pumpkin queen who sends the hunters); lantern goal unchanged.

`Tools/check_levels.py`: learn `Hunter` (treated as a static breakable at its home position:
smashed when the simulated hero passes through it faster than 4.5 or while dashing; lethal
otherwise). Chasing is not simulated; stages are placed so routes do not depend on the chase.

## 5. Story (`Story.cs`)

Rewrite all dialogue: prologue, pre_1..10, post_3/5/7/10. Tone: dark night, Izan alone,
hunted by glowing pumpkins, must escape and smash them to reach each door; Morgra is the
pumpkin queen. Remove Hoot/Webster/Pip lines and "new friend" scenes (post_3/5/7 become short
escape beats). Chapter names kept. Main menu subtitle → "Izan and the Pumpkin Hunt";
menu cast shows only Izan and pumpkins.

## 6. Files

Heroes.cs, StageController.cs (team/swap removal, candy → pumpkin counters), StageHud.cs,
Elements.cs, LevelData.cs, LevelBuilder.cs, LevelLibrary.cs, Story.cs, MainMenuScreen.cs,
WorldMapScreen.cs (hero unlock text if any), Tools/generate_art.py, Tools/check_levels.py,
AGENTS.md, CLAUDE.md overview line. Legacy prototype untouched.

## 7. Platform

Phones only, portrait (Android/iOS). Unchanged by this redesign: canvas 1080x1920, touch input,
camera fixed at 12 world units wide. In the editor, the Game view must use a portrait
resolution (add 1080x1920 "Phone" under the resolution dropdown) for the preview to match.

## 8. Out of scope

New boss art, new backgrounds, sound redesign, new stages beyond 10, touch-specific tuning.

## 9. Verification

1. `python3 Tools/generate_art.py` → new `izan_*`, `hunter_*` sprites exist.
2. `python3 Tools/check_levels.py` → 10 of 10 pass with every hunter smashable.
3. Open in Unity: 0 compile errors.
4. Hollow Night → Smoke Test (all stages): `Tools/smoke_report.txt` lists no errors.
5. User play-test: pumpkins chase, dash smashes them, slow touch kills, door opens at 0 left,
   3 stars awarded as in §3.
