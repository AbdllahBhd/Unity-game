# Graph Report - game1  (2026-09-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 981 nodes · 2262 edges · 48 communities (40 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b935bc9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- manifest.json
- level_Loader
- PLayer_drag_drop
- unityengine
- CharacterController2D
- player_script
- carecterScript
- 7. Inspector wiring and Animator parameters
- trajectory_Script
- izanScript
- pumkinkScript
- generate_art.py
- LegacyButton
- .Get
- bbbb
- LevelBuilder
- LevelData
- Sfx
- Hero
- Story
- check_levels.py
- Bat
- StageController
- .Burst
- StageHud
- Elements.cs
- .Play
- GameManager
- MonoBehaviour
- FlowRunner
- .Pop
- game1 — AI project guide
- .Awake
- CameraRig
- .Start
- ButtonJuice
- .Die
- .FingerTutorial
- FrameLoop
- balltest
- Mover
- UIFrames
- start_right
- game1
- README.md
- unityeditor

## God Nodes (most connected - your core abstractions)
1. `Hero` - 71 edges
2. `LevelData` - 47 edges
3. `StageController` - 45 edges
4. `LevelBuilder` - 36 edges
5. `main()` - 32 edges
6. `canvas()` - 27 edges
7. `shape()` - 27 edges
8. `save()` - 26 edges
9. `Sfx` - 25 edges
10. `Sound` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Unused / prototype scripts (not in any build scene)` --references--> `PLayer_drag_drop`  [INFERRED]
  AGENTS.md → Assets/Scripts/PLayer_drag_drop.cs
- `8. Known bugs and gotchas` --references--> `pumkinkScript`  [INFERRED]
  AGENTS.md → Assets/pumkinkScript.cs
- `7. Inspector wiring and Animator parameters` --references--> `button_next_`  [INFERRED]
  AGENTS.md → Assets/button_next_.cs
- `8. Known bugs and gotchas` --references--> `button_next_`  [INFERRED]
  AGENTS.md → Assets/button_next_.cs
- `7. Inspector wiring and Animator parameters` --references--> `button_Press`  [INFERRED]
  AGENTS.md → Assets/button_Press.cs

## Import Cycles
- None detected.

## Communities (48 total, 8 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (46): dependencies, com.unity.2d.animation, com.unity.2d.pixel-perfect, com.unity.2d.psdimporter, com.unity.2d.sprite, com.unity.2d.spriteshape, com.unity.2d.tilemap, com.unity.collab-proxy (+38 more)

### Community 1 - "manifest.json"
Cohesion: 0.04
Nodes (45): com.unity.2d.animation, com.unity.2d.pixel-perfect, com.unity.2d.psdimporter, com.unity.2d.sprite, com.unity.2d.spriteshape, com.unity.2d.tilemap, com.unity.collab-proxy, com.unity.ide.rider (+37 more)

### Community 2 - "level_Loader"
Cohesion: 0.13
Nodes (9): Active scripts (used in build scenes), button_Press, Animator, Rigidbody2D, Animator, IEnumerator, level_Loader, Animator (+1 more)

### Community 3 - "PLayer_drag_drop"
Cohesion: 0.18
Nodes (8): Animator, CircleCollider2D, Collider2D, Rigidbody2D, Vector2, Vector3, PLayer_drag_drop, Pose

### Community 4 - "unityengine"
Cohesion: 0.10
Nodes (16): Layer, HeroState, Cannon, Dead, Flying, Resting, Won, HollowNight (+8 more)

### Community 5 - "CharacterController2D"
Cohesion: 0.21
Nodes (9): BoolEvent, CharacterController2D, Collider2D, Rigidbody2D, Transform, Vector3, BoolEvent, LayerMask (+1 more)

### Community 6 - "player_script"
Cohesion: 0.18
Nodes (6): Animator, IEnumerator, Rigidbody2D, Vector2, player_script, SpringJoint2D

### Community 7 - "carecterScript"
Cohesion: 0.22
Nodes (6): carecterScript, Pose, CircleCollider2D, Rigidbody2D, Vector2, Vector3

### Community 8 - "7. Inspector wiring and Animator parameters"
Cohesion: 0.13
Nodes (10): 7. Inspector wiring and Animator parameters, 8. Known bugs and gotchas, button_menu_, PressedParameter, button_restart_, PressedParameter, Animator, Collider2D (+2 more)

### Community 9 - "trajectory_Script"
Cohesion: 0.27
Nodes (5): GameObject, Transform, Vector2, Vector3, trajectory_Script

### Community 10 - "izanScript"
Cohesion: 0.22
Nodes (6): CircleCollider2D, Rigidbody2D, Vector2, Vector3, izanScript, Pose

### Community 11 - "pumkinkScript"
Cohesion: 0.29
Nodes (5): Animator, Collision2D, GameObject, IEnumerator, pumkinkScript

### Community 12 - "generate_art.py"
Cohesion: 0.14
Nodes (74): hashlib, pil, shutil, background(), hills(), bat(), button(), canvas() (+66 more)

### Community 13 - "LegacyButton"
Cohesion: 0.16
Nodes (9): button_next_, PressedParameter, Animator, IEnumerator, Rigidbody2D, SpriteRenderer, Vector2, LegacyButton (+1 more)

### Community 14 - ".Get"
Cohesion: 0.07
Nodes (30): AspectRatioFitter, Flow, Progress, SoundOn, TotalStars, Button, Transform, Vector2 (+22 more)

### Community 15 - "bbbb"
Cohesion: 0.29
Nodes (5): bbbb, Camera, Rigidbody2D, Vector2, Vector3

### Community 16 - "LevelBuilder"
Cohesion: 0.07
Nodes (35): Color, Dictionary, Sprite, SpriteRenderer, Transform, Vector2, Vector3, Art (+27 more)

### Community 17 - "LevelData"
Cohesion: 0.05
Nodes (31): Color, HeroDef, Heroes, Count, HeroType, Hoot, Izan, Pip (+23 more)

### Community 18 - "Sfx"
Cohesion: 0.07
Nodes (27): Dictionary, Sfx, Instance, Sound, BossHit, Bounce, Break, Candy (+19 more)

### Community 19 - "Hero"
Cohesion: 0.09
Nodes (19): CircleCollider2D, Collider2D, IEnumerator, Rigidbody2D, SpriteRenderer, Transform, Vector2, Vector3 (+11 more)

### Community 20 - "Story"
Cohesion: 0.13
Nodes (12): Dictionary, Dialogue, Line, Story, AllIds, Coroutine, IEnumerator, Image (+4 more)

### Community 21 - "check_levels.py"
Cohesion: 0.12
Nodes (24): concurrent_futures, math, os, Random, re, sys, check(), circle_box() (+16 more)

### Community 22 - "Bat"
Cohesion: 0.12
Nodes (11): Collider2D, SpriteRenderer, Vector2, Vector3, Bat, Door, IsOpen, GhostPlatform (+3 more)

### Community 23 - "StageController"
Cohesion: 0.12
Nodes (10): Camera, GameObject, List, StageController, Candies, Ended, Hero, I (+2 more)

### Community 24 - ".Burst"
Cohesion: 0.17
Nodes (8): Color, Vector2, Fx, Mote, Collision2D, Collider2D, IEnumerator, LanternGoal

### Community 25 - "StageHud"
Cohesion: 0.13
Nodes (10): CircleCollider2D, Vector2, CanvasGroup, Coroutine, IEnumerator, Image, RectTransform, Text (+2 more)

### Community 26 - "Elements.cs"
Cohesion: 0.17
Nodes (8): IEnumerator, Transform, Candy, Cauldron, KeyItem, Portal, Touchable, WebPatch

### Community 27 - ".Play"
Cohesion: 0.23
Nodes (3): Crate, Minion, Collision2D

### Community 28 - "GameManager"
Cohesion: 0.17
Nodes (5): 5. Core gameplay loop (Level_1), Animator, Camera, Vector2, GameManager

### Community 29 - "MonoBehaviour"
Cohesion: 0.17
Nodes (7): Spin, RectTransform, Drift, MainMenuScreen, Animator, start_middel, MonoBehaviour

### Community 30 - "FlowRunner"
Cohesion: 0.24
Nodes (7): Canvas, CanvasGroup, GraphicRaycaster, IEnumerator, Image, FlowRunner, Instance

### Community 31 - ".Pop"
Cohesion: 0.29
Nodes (5): Action, CanvasGroup, IEnumerator, Transform, Tween

### Community 32 - "game1 — AI project guide"
Cohesion: 0.20
Nodes (9): 10. Rules for AI assistants, 1. What this project is, 2. Folder map, 3. Scenes and flow, 4. Scripts, 6. Dependency graph (script → script), 9. Code knowledge graph (Graphify), game1 — AI project guide (+1 more)

### Community 33 - ".Awake"
Cohesion: 0.22
Nodes (8): Camera, GameBoot, ScreenKind, MainMenu, Stage, Story, WorldMap, AudioListener

### Community 34 - "CameraRig"
Cohesion: 0.33
Nodes (3): Camera, Transform, CameraRig

### Community 35 - ".Start"
Cohesion: 0.29
Nodes (4): Color, SpriteRenderer, Vector2, Trajectory

### Community 36 - "ButtonJuice"
Cohesion: 0.24
Nodes (5): Vector3, ButtonJuice, IPointerDownHandler, IPointerUpHandler, PointerEventData

### Community 40 - "FrameLoop"
Cohesion: 0.40
Nodes (3): Sprite, SpriteRenderer, FrameLoop

### Community 42 - "Mover"
Cohesion: 0.50
Nodes (3): Rigidbody2D, Mover, Velocity

### Community 43 - "UIFrames"
Cohesion: 0.50
Nodes (3): Image, Sprite, UIFrames

## Knowledge Gaps
- **187 isolated node(s):** `Layer`, `com.unity.2d.animation`, `com.unity.2d.pixel-perfect`, `com.unity.2d.psdimporter`, `com.unity.2d.sprite` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 374 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Sfx` connect `Sfx` to `check_levels.py`, `.Play`, `unityengine`, `MonoBehaviour`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Why does `StageController` connect `StageController` to `.Awake`, `CameraRig`, `.Start`, `unityengine`, `.Update`, `.FingerTutorial`, `.Get`, `LevelBuilder`, `LevelData`, `Hero`, `StageHud`, `MonoBehaviour`, `.Pop`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `Hero` connect `Hero` to `.Start`, `unityengine`, `.Die`, `.Update`, `LevelData`, `Bat`, `StageController`, `.Burst`, `Elements.cs`, `.Play`, `MonoBehaviour`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `Layer`, `com.unity.2d.animation`, `com.unity.2d.pixel-perfect` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `manifest.json` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `level_Loader` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._