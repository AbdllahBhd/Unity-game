# SPEC: the tales of Mqidec in Unity, slice 1 (Night 1)

Decided with the user on 2026-10-21. Supersedes the 2026-10-12 "black rabbit and hunting
pumpkins" design, which stays in git history. The story, the nights and the mechanics are
defined by the browser prototype in `Tools/design/original/` and `Tools/design/yennayer-spec.md`;
this spec covers bringing them into the Unity project.

## 1. Decisions (2026-10-21)

| Question | Decision |
|---|---|
| The current Unity game (Izan, pumpkins, 10 stages) | **Replaced** by the tales. Its stages, roster and story leave the build; code that the tales reuse is adapted in place |
| Physics | **Unity Physics2D**, as the current game. The browser's stored routes do not carry over; Night 1 is re-tuned by `Tools/check_levels.py` and the user's play |
| Art | **Placeholders now** (simple sprites from `Tools/generate_art.py` and existing sprites); final art is a separate project |
| First slice | **Night 1** (stages 1-4), menu, hearth, story in four languages, playable **in the Unity editor**. A phone build is a later step (the Android module is not installed) |

## 2. What the player gets in slice 1

- **Main menu:** title "Timucuha n Mqidec", Play, the tales, a language selector
  (Taqbaylit, Français, العربية, English) and sound.
- **The hearth:** the first time, Jida's opening ("Amacahu!" / "Macahu!"), the first-night
  naming of Mqidec, then Night 1's intro.
- **The tale map:** Night 1 with its four stages and their stars.
- **Stages 1-4,** Teryel's kitchen, with the prototype's layouts and rules:
  - stage 1: pots that hunt;
  - stage 2: the rolling jar;
  - stage 3: the hearth cannons and a crumbling ledge;
  - stage 4: the great jar traps Teryel.
- **Per-stage lines:** one Jida line and one child reaction before each stage.
- **The ending:** the tale's end, then the closing formula and the lamp.

## 3. Rules carried over from the prototype

- **Hero:** Mqidec (`HeroType.Izan` keeps its name in code; only what is shown changes).
  Drag-launch (max speed 16) and one Spirit Dash per flight, as today.
- **Stars:** one per hunter broken, up to 3. A rolling jar counts as a hunter (stage 2's
  third star); only the trap jar never does. Finishing alone gives no star; there is no par.
- **The door:**
  - Stages 1-3 (`always`): open from the start.
  - Stage 4 (`trap`): opens once Teryel is trapped.
- **Pots** (lively hunters):
  - States: idle; notice (0.35 s); hunt (accelerating, with a lunge when close); return
    home.
  - Frozen while the player holds a real aim.
  - Smashed by a dash or an impact over 4.5; a slower touch kills.
  - After a death they go home, safe, until the next launch.
  - A sleeper (`range 0`) never moves.
- **Rolling jar:**
  - A dynamic body the hero pushes.
  - It breaks pots it hits at speed, and shatters after a fall of 2.5 or more, or against
    a wall at speed over 3.
  - Mqidec never comes to rest on a jar; jar contacts don't count as ground.
  - The trap jar (stage 4) rolls out again 1.2 s after breaking while Teryel is free.
- **Teryel:**
  - Kills on any touch, even dashing; she respects the hero's grace after a respawn.
  - Can patrol.
  - Trapped by a moving jar.
  - A rest inside her patrol path is never saved as a respawn spot (a hook in `Hero.Rest`).
- **Hearth cannon:** the existing `Cauldron` (enter, 0.4 s, fired with a set velocity).
- **Crumbling ledge:** the existing `GhostPlatform` loop (period, offset), with its fade
  warning.

## 4. Text and languages

- **Pure logic in its own assembly:** `Assets/Scripts/HollowNight/Logic/` has an asmdef with
  `noEngineReferences`, so the compiler keeps it free of UnityEngine and plain C# tests can
  run it.
  - It holds the text table, the Arabic helper, the star and door rules, and the pot's
    state step.
  - `Tools/design/original/build-text.py` also writes `Logic/TalesText.cs` (generated,
    never hand-edited) from `Tools/design/yennayer-script.md`: id → who, mood, en, tq,
    fr, ar.
- **Fonts:** Noto Sans (Latin, covers Taqbaylit's ɣ ɛ ḍ ṛ ṣ ṭ ẓ ḥ) and Noto Sans Arabic
  (with the Arabic presentation forms), copied from the system's `fonts-noto-core` with the
  OFL licence. Creepster and Luckiest Guy stay for Latin titles that they can draw; any
  string they can't draw falls back to Noto.
- **Arabic:**
  - `UnityEngine.UI.Text` neither joins nor reverses Arabic, so an `ArabicText` helper does
    both:
    - contextual shaping to the presentation forms, including lam-alef;
    - wrapping of the shaped logical text with a width measurer (`TextGenerator` in Unity,
      a stub in tests);
    - a visual reversal per line by grapheme cluster, so the 95 shaddas and other marks
      stay on their letter;
    - brackets and guillemets mirrored;
    - Latin and digit runs kept in their own order.
  - The Text is right-aligned, overflow without its own wrapping, no BestFit, with explicit
    line breaks.
  - The story typewriter reveals Arabic from the right, one logical prefix at a time.
- **Glyph coverage:** a check confirms that every character in the table exists in the font
  chosen for its language. Titles fall back from Creepster and Luckiest Guy to Noto when
  that check says so.

## 5. Out of scope (slice 1)

Nights 2-7, final art and animation, an Android or iOS build, the product rename in Player
Settings, the browser prototype itself (unchanged), and the legacy prototype scenes.

## 6. Verification

| Gate | How |
|---|---|
| Compile | `bash Tools/unity_check.sh`: the real Unity 6 compiler and engine assemblies, outside the editor (UGUI built from the editor's bundled source). 0 errors |
| Pure logic | The same script runs plain C# tests (`Tools/unity_tests/`) on the Arabic helper, the text table and the scoring and door rules |
| Stages | `python3 Tools/check_levels.py`: every Night 1 stage finishable with three stars in the simulator's approximation (taught mechanic used) |
| Browser prototype | Unchanged: its tests and route checks still pass |
| Play | The user plays `HN_MainMenu` in the editor and runs `Hollow Night > Smoke Test`; nothing else counts as a Unity play test |
