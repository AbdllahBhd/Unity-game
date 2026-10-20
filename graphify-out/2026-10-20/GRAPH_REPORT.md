# Graph Report - game1  (2026-10-19)

## Corpus Check
- 114 files · ~197,153 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: .ttf 5, (none) 2, .css 2)

## Summary
- 2104 nodes · 4138 edges · 125 communities (107 shown, 18 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 232 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97b0ddcd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- manifest.json
- level_Loader
- GameManager
- unityengine
- CharacterController2D
- original/art.js
- carecterScript
- 8. Legacy prototype
- HeroType
- izanScript
- sfx.js
- generate_art.py
- LegacyButton
- .Label
- bbbb
- LevelBuilder
- LevelData
- Sfx
- Hero
- Story
- mqidec_cloak.py
- .Start
- StageController
- 5. Core classes
- StageHud
- Hunter
- app-green-harvest.js
- packages-lock.json
- find-routes.js
- FlowRunner
- HNSmokeTest
- com.unity.modules.imgui
- Timucuha n Yennayer — script
- com.unity.modules.jsonserialize
- com.unity.modules.unitywebrequest
- Game
- WitchBoss
- com.unity.2d.common
- com.unity.test-framework
- com.unity.modules.physics
- balltest
- prototype/art.js
- prototype/app.js
- com.unity.modules.physics2d
- com.unity.modules.animation
- README.md
- com.unity.modules.audio
- com.unity.collab-proxy
- AI Coding Template — for Claude Code & Codex
- Hollow Night: three directions for an adult puzzle game
- com.unity.modules.imageconversion
- 🔧 Tools — reach beyond the terminal
- com.unity.ext.nunit
- com.unity.mathematics
- com.unity.ai.navigation
- 8. What each piece does (and when the AI reads it)
- Engineering Workflow Rules
- Testing Patterns
- hooks
- Testing Patterns
- API Conventions
- door_Scrip
- ⭐ Skills — knowledge loaded on demand
- ➕ More verified additions worth knowing
- 💰 Cost — understand and reduce the burn
- 🎛 Harness — changes how Claude works before it types
- API Conventions
- github
- 🧠 Memory — what survives the session
- Pull Request & Git Rules
- com.unity.ide.vscode
- /deploy — Guarded Deployment
- /retro — Learning Flywheel
- Tool Catalog — Install What You Need, When You Need It
- /deploy — Guarded Deployment
- /retro — Learning Flywheel
- Code Style Rules
- dependencies
- tales-art.js
- /install — Install a tool from the catalog
- code-reviewer.md
- security-auditor.md
- /install — Install a tool from the catalog
- done-gate.sh
- sync-codex.sh
- game1.slnx
- validate-code.sh
- MonoBehaviour
- StoryScreen
- .BuildNode
- .Get
- Hollow Night browser design study
- original/eslint.config.mjs
- game.test.js
- .Go
- original/app.js
- PLayer_drag_drop
- player_script
- Timucuha n Yennayer — the tales of Mqidec
- ButtonJuice
- com.unity.modules.tetgen
- Project Memory (CLAUDE.md)
- trajectory_Script
- SPEC: Black rabbit + hunting pumpkins redesign
- Hollow Night — AI project guide
- pumkinkScript
- HeroState
- 3. Folder map
- prototype/verify-routes.js
- .Shockwave
- simulateRoute
- 6. Gameplay rules
- The user's original handmade scene references
- characters.js

## God Nodes (most connected - your core abstractions)
1. `Hero` - 72 edges
2. `LevelData` - 49 edges
3. `StageController` - 41 edges
4. `Game` - 40 edges
5. `LevelBuilder` - 37 edges
6. `main()` - 33 edges
7. `chain()` - 32 edges
8. `env()` - 31 edges
9. `shape()` - 28 edges
10. `Sfx` - 27 edges

## Surprising Connections (you probably didn't know these)
- `2. Key design decision: everything is built from code` --references--> `GameBoot`  [INFERRED]
  AGENTS.md → Assets/Scripts/HollowNight/Core/GameBoot.cs
- `Project Overview` --references--> `GameBoot`  [INFERRED]
  CLAUDE.md → Assets/Scripts/HollowNight/Core/GameBoot.cs
- `4. Stages` --references--> `WitchBoss`  [INFERRED]
  SPEC.md → Assets/Scripts/HollowNight/Elements/WitchBoss.cs
- `Round 2: polish and tricks (approved 2026-10-18)` --references--> `seesaw()`  [INFERRED]
  task_plan.md → Tools/design/original/sfx.js
- `8. Legacy prototype` --references--> `GameManager`  [INFERRED]
  AGENTS.md → Assets/GameManager.cs

## Import Cycles
- None detected.

## Communities (125 total, 18 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (52): dependencies, com.unity.2d.animation, com.unity.2d.pixel-perfect, com.unity.2d.psdimporter, com.unity.2d.sprite, com.unity.2d.spriteshape, com.unity.2d.tilemap, com.unity.ai.navigation (+44 more)

### Community 1 - "manifest.json"
Cohesion: 0.04
Nodes (51): com.unity.2d.sprite, com.unity.2d.tilemap, com.unity.modules.ai, com.unity.modules.animation, com.unity.modules.assetbundle, com.unity.modules.audio, com.unity.modules.director, com.unity.modules.imageconversion (+43 more)

### Community 2 - "level_Loader"
Cohesion: 0.20
Nodes (6): button_Press, Animator, Rigidbody2D, Animator, IEnumerator, level_Loader

### Community 3 - "GameManager"
Cohesion: 0.17
Nodes (5): Animator, Camera, Vector2, GameManager, Vector2

### Community 4 - "unityengine"
Cohesion: 0.06
Nodes (25): ScreenKind, MainMenu, Stage, Story, WorldMap, Animator, start_left, Animator (+17 more)

### Community 5 - "CharacterController2D"
Cohesion: 0.21
Nodes (9): BoolEvent, CharacterController2D, Collider2D, Rigidbody2D, Transform, Vector3, BoolEvent, LayerMask (+1 more)

### Community 6 - "original/art.js"
Cohesion: 0.06
Nodes (71): Mqidec character art (2026-10-18), backdrop(), bandLozenges(), bandTriangles(), bandZigzag(), blinkAt(), blit(), braid() (+63 more)

### Community 7 - "carecterScript"
Cohesion: 0.22
Nodes (6): carecterScript, Pose, CircleCollider2D, Rigidbody2D, Vector2, Vector3

### Community 8 - "8. Legacy prototype"
Cohesion: 0.16
Nodes (7): 8. Legacy prototype, button_menu_, PressedParameter, button_next_, PressedParameter, button_restart_, PressedParameter

### Community 9 - "HeroType"
Cohesion: 0.21
Nodes (10): Color, HeroDef, Heroes, Count, HeroType, Hoot, Izan, Pip (+2 more)

### Community 10 - "izanScript"
Cohesion: 0.22
Nodes (6): CircleCollider2D, Rigidbody2D, Vector2, Vector3, izanScript, Pose

### Community 11 - "sfx.js"
Cohesion: 0.16
Nodes (43): ambience(), boing(), bossdown(), bosshit(), caw(), chain(), clink(), crackle() (+35 more)

### Community 12 - "generate_art.py"
Cohesion: 0.13
Nodes (77): hashlib, background(), hills(), bat(), button(), canvas(), cheeks(), cloud() (+69 more)

### Community 13 - "LegacyButton"
Cohesion: 0.24
Nodes (7): Animator, IEnumerator, Rigidbody2D, SpriteRenderer, Vector2, LegacyButton, PressedParameter

### Community 14 - ".Label"
Cohesion: 0.21
Nodes (14): AspectRatioFitter, Button, Transform, Button, Color, Image, RectTransform, Text (+6 more)

### Community 15 - "bbbb"
Cohesion: 0.29
Nodes (5): bbbb, Camera, Rigidbody2D, Vector2, Vector3

### Community 16 - "LevelBuilder"
Cohesion: 0.12
Nodes (16): SpriteRenderer, Transform, Vector2, Vector3, Pulse, Solid, CircleCollider2D, GameObject (+8 more)

### Community 17 - "LevelData"
Cohesion: 0.07
Nodes (23): 7. How to add or change a stage, List, Vector2, Elem, Kind, Bat, Boss, Cauldron (+15 more)

### Community 18 - "Sfx"
Cohesion: 0.07
Nodes (27): Dictionary, Sfx, Instance, Sound, BossHit, Bounce, Break, Candy (+19 more)

### Community 19 - "Hero"
Cohesion: 0.08
Nodes (23): Collision2D, IEnumerator, Portal, WebPatch, CircleCollider2D, Collider2D, IEnumerator, Rigidbody2D (+15 more)

### Community 20 - "Story"
Cohesion: 0.30
Nodes (6): Dictionary, Dialogue, Line, Story, AllIds, IEnumerable

### Community 21 - "mqidec_cloak.py"
Cohesion: 0.06
Nodes (69): bmesh, bpy, concurrent_futures, json, math, mathutils, os, pil (+61 more)

### Community 22 - ".Start"
Cohesion: 0.17
Nodes (8): Image, RectTransform, Sprite, Vector2, Drift, Hopper, MainMenuScreen, UIFrames

### Community 23 - "StageController"
Cohesion: 0.06
Nodes (19): Camera, Color, SpriteRenderer, Transform, Vector2, CameraRig, Trajectory, Camera (+11 more)

### Community 24 - "5. Core classes"
Cohesion: 0.17
Nodes (11): 5. Core classes, Layer, Color, Sprite, SpriteRenderer, Vector2, Vector3, Bob (+3 more)

### Community 25 - "StageHud"
Cohesion: 0.11
Nodes (14): Action, CanvasGroup, IEnumerator, Transform, Ease, Tween, CanvasGroup, Coroutine (+6 more)

### Community 26 - "Hunter"
Cohesion: 0.09
Nodes (14): Collider2D, Rigidbody2D, Transform, Vector2, Bomb, Cauldron, Hunter, Sated (+6 more)

### Community 27 - "app-green-harvest.js"
Cohesion: 0.16
Nodes (25): advanceStory(), applyMute(), cameraTarget(), dismissTip(), finishStage(), frame(), handleEvents(), nextStage() (+17 more)

### Community 28 - "packages-lock.json"
Cohesion: 0.06
Nodes (31): com.unity.2d.sprite, com.unity.2d.tilemap, com.unity.modules.ai, com.unity.modules.animation, com.unity.modules.assetbundle, com.unity.modules.audio, com.unity.modules.director, com.unity.modules.imageconversion (+23 more)

### Community 29 - "find-routes.js"
Cohesion: 0.10
Nodes (24): ref_node_fs, ref_node_path, args, cloneGame(), existing, file, fs, { Game } (+16 more)

### Community 30 - "FlowRunner"
Cohesion: 0.24
Nodes (7): Canvas, CanvasGroup, GraphicRaycaster, IEnumerator, Image, FlowRunner, Instance

### Community 31 - "HNSmokeTest"
Cohesion: 0.10
Nodes (18): Canvas, List, HNSmokeTest, Elapsed, Phase, Done, Map, Menu (+10 more)

### Community 32 - "com.unity.modules.imgui"
Cohesion: 0.07
Nodes (31): dependencies, depth, source, url, version, dependencies, depth, source (+23 more)

### Community 33 - "Timucuha n Yennayer — script"
Cohesion: 0.07
Nodes (29): After stage 16, After stage 20, After stage 4, After stage 4, After stage 4 (the trap), Before stage 1, Before stage 13, Before stage 17 (+21 more)

### Community 34 - "com.unity.modules.jsonserialize"
Cohesion: 0.07
Nodes (30): dependencies, depth, source, version, dependencies, depth, source, version (+22 more)

### Community 35 - "com.unity.modules.unitywebrequest"
Cohesion: 0.09
Nodes (26): dependencies, depth, source, version, dependencies, dependencies, depth, source (+18 more)

### Community 37 - "WitchBoss"
Cohesion: 0.16
Nodes (9): Level objects (`Kind` in `LevelData.cs`, classes in `Elements.cs`), CircleCollider2D, Collider2D, IEnumerator, Rigidbody2D, SpriteRenderer, LanternGoal, WitchBoss (+1 more)

### Community 38 - "com.unity.2d.common"
Cohesion: 0.08
Nodes (27): dependencies, depth, source, url, version, dependencies, depth, source (+19 more)

### Community 39 - "com.unity.test-framework"
Cohesion: 0.08
Nodes (27): dependencies, depth, source, version, dependencies, dependencies, depth, source (+19 more)

### Community 40 - "com.unity.modules.physics"
Cohesion: 0.08
Nodes (25): dependencies, depth, source, version, dependencies, depth, source, version (+17 more)

### Community 42 - "prototype/art.js"
Cohesion: 0.16
Nodes (31): 1. Goal, 2. The story — "The Green Harvest", 3. Gameplay rules, 4. Stages, 5. Files and interfaces, 6. Verification, 7. Out of scope, 9. Round 2 (2026-10-18): polish and tricks (+23 more)

### Community 43 - "prototype/app.js"
Cohesion: 0.24
Nodes (13): advanceReplay(), cancelDrag(), drawAim(), drawComparison(), frame(), loadStage(), renderStory(), saveChoices() (+5 more)

### Community 44 - "com.unity.modules.physics2d"
Cohesion: 0.10
Nodes (20): dependencies, depth, source, version, dependencies, depth, source, version (+12 more)

### Community 45 - "com.unity.modules.animation"
Cohesion: 0.11
Nodes (20): dependencies, depth, source, version, dependencies, depth, source, version (+12 more)

### Community 47 - "com.unity.modules.audio"
Cohesion: 0.11
Nodes (20): dependencies, depth, source, version, dependencies, depth, source, version (+12 more)

### Community 48 - "com.unity.collab-proxy"
Cohesion: 0.33
Nodes (6): dependencies, depth, source, url, version, com.unity.collab-proxy

### Community 49 - "AI Coding Template — for Claude Code & Codex"
Cohesion: 0.12
Nodes (16): 10. Commands reference, 11. Using it with Codex too (and Cursor, Gemini...), 12. Optional extras, when you need them, 13. Growing and maintaining it, 1. Why would I use this?, 2. When should I NOT use it?, 3. Setup — NEW project, 4. Setup — EXISTING project (merge, don't overwrite!) (+8 more)

### Community 50 - "Hollow Night: three directions for an adult puzzle game"
Cohesion: 0.18
Nodes (10): A — The Last Light, B — The Borrowed Shadow, C — The Thirteenth Bell, Current evidence, Decision after the playable comparison, Hollow Night: three directions for an adult puzzle game, Polish priorities to compare in the prototype, Research and how it informs this proposal (+2 more)

### Community 51 - "com.unity.modules.imageconversion"
Cohesion: 0.13
Nodes (15): dependencies, depth, source, version, dependencies, depth, source, version (+7 more)

### Community 52 - "🔧 Tools — reach beyond the terminal"
Cohesion: 0.17
Nodes (12): awesome-mcp-servers — ⭐ ~96k — 📖 Reading, cc-switch — ⭐ ~139k — 💻 Desktop app (per machine), chrome-devtools-mcp — ⭐ ~53k — 🔧 MCP, claude-code-router — ⭐ ~38k — 💻 CLI (per machine), context7 — ⭐ ~63k — 🔧 MCP, firecrawl — ⭐ ~188k — 🔧 MCP (needs API key), github-mcp — ⭐ ~33k — 🔧 MCP (remote), multica — ⭐ ~52k — 💻 Self-hosted app ⚠️ check README (+4 more)

### Community 53 - "com.unity.ext.nunit"
Cohesion: 0.17
Nodes (12): dependencies, depth, source, version, dependencies, depth, source, url (+4 more)

### Community 54 - "com.unity.mathematics"
Cohesion: 0.18
Nodes (11): dependencies, depth, source, url, version, dependencies, depth, source (+3 more)

### Community 55 - "com.unity.ai.navigation"
Cohesion: 0.18
Nodes (11): dependencies, depth, source, url, version, dependencies, depth, source (+3 more)

### Community 56 - "8. What each piece does (and when the AI reads it)"
Cohesion: 0.18
Nodes (11): 8. What each piece does (and when the AI reads it), `AGENTS.md` — the bridge to other tools *(read by Codex, Cursor, Gemini)*, `.claude/agents/*.md` — specialist reviewers *(used when delegating)*, `.claude/commands/*.md` — your shortcuts *(run only when YOU type them)*, `.claude/hooks/*.sh` — the guarantees *(run automatically by the system)*, `CLAUDE.local.md` — your personal brief *(read: every session, your machine only)*, `CLAUDE.md` — the project brief *(read: every session, always)*, `.claude/rules/*.md` — conventions *(read: every session, via CLAUDE.md)* (+3 more)

### Community 57 - "Engineering Workflow Rules"
Cohesion: 0.20
Nodes (9): Adversarial review, Context discipline, Definition of done (enforced by hooks/done-gate.sh), Engineering Workflow Rules, Interview → spec (large features), Plan first (non-trivial work), Single source of truth (multi-tool), Test-driven by default (+1 more)

### Community 58 - "Testing Patterns"
Cohesion: 0.22
Nodes (8): Anti-patterns (never do these), Definition of Done, Framework & Layout, Mocking Rules, Test Data: Builders over Fixtures, Test Structure: Arrange–Act–Assert, Testing Patterns, What to Test (priority order)

### Community 59 - "hooks"
Cohesion: 0.22
Nodes (8): hooks, PostToolUse, PreToolUse, Stop, permissions, allow, deny, $schema

### Community 60 - "Testing Patterns"
Cohesion: 0.22
Nodes (8): Anti-patterns (never do these), Definition of Done, Framework & Layout, Mocking Rules, Test Data: Builders over Fixtures, Test Structure: Arrange–Act–Assert, Testing Patterns, What to Test (priority order)

### Community 61 - "API Conventions"
Cohesion: 0.29
Nodes (6): API Conventions, Endpoint Design (REST), Error Responses, Request / Response Shape, Validation & Security, Versioning & Compatibility

### Community 62 - "door_Scrip"
Cohesion: 0.29
Nodes (4): Animator, Collider2D, GameObject, door_Scrip

### Community 64 - "⭐ Skills — knowledge loaded on demand"
Cohesion: 0.29
Nodes (7): anthropics/skills — ⭐ ~179k — 🔌 Plugin (or copy), awesome-claude-skills — ⭐ ~76k — 📖 Reading ⚠️ (ComposioHQ's is the big one), claude-plugins (official directory) — ⭐ ~37k — 🔌 Built in, ⭐ Skills — knowledge loaded on demand, taste-skill — ⭐ ~92k — 📁 Skill copy ⚠️ (same-named repos exist), ui-ux-pro-max — ⭐ ~132k — 📁 Skill copy, wshobson/agents — ⭐ ~40k — 🔌 Plugin marketplace

### Community 65 - "➕ More verified additions worth knowing"
Cohesion: 0.29
Nodes (7): awesome-claude-code — ⭐ ~55k — 📖 Reading, claude-code-templates — ⭐ ~32k — 💻 CLI, claude-squad — ⭐ ~8.6k — 💻 CLI, ➕ More verified additions worth knowing, oh-my-claudecode — ⭐ ~40k — 🔌 Plugin, spec-kit — ⭐ ~140k — 💻 CLI (scaffolds into project), SuperClaude — ⭐ ~24k — 💻 Installer

### Community 66 - "💰 Cost — understand and reduce the burn"
Cohesion: 0.29
Nodes (7): best-practice — ⭐ ~67k — 📖 Reading ⚠️ (name ambiguous), caveman — ⭐ ~109k — 📁 Skill copy, ccusage — ⭐ ~19k — 💻 CLI (one-off), claude-hud — ⭐ ~28k — 🔌 Plugin, codex-plugin-cc — ⭐ ~34k — 🔌 Plugin (needs Codex CLI + OpenAI login), 💰 Cost — understand and reduce the burn, system-prompts-ai — ⭐ ~144k — 📖 Reading

### Community 67 - "🎛 Harness — changes how Claude works before it types"
Cohesion: 0.29
Nodes (7): ECC ("Everything Claude Code") — ⭐ ~271k — 📁 Config pack, gstack — ⭐ ~135k — 📁 Skills copy, 🎛 Harness — changes how Claude works before it types, karpathy-skills — ⭐ ~216k — 📁 One file, learn-claude-code — ⭐ ~78k — 📖 Reading, ponytail — ⭐ ~151k — 🔌 Plugin, superpowers — ⭐ ~294k — 🔌 Plugin

### Community 68 - "API Conventions"
Cohesion: 0.29
Nodes (6): API Conventions, Endpoint Design (REST), Error Responses, Request / Response Shape, Validation & Security, Versioning & Compatibility

### Community 69 - "github"
Cohesion: 0.33
Nodes (6): GITHUB_PERSONAL_ACCESS_TOKEN, npx, filesystem, github, @modelcontextprotocol/server-filesystem, @modelcontextprotocol/server-github

### Community 70 - "🧠 Memory — what survives the session"
Cohesion: 0.33
Nodes (6): claude-mem — ⭐ ~95k — 💻 CLI 🔒 Claude-only, codegraph — ⭐ ~73k — 🔧 MCP 🖥 ⚠️ (name is ambiguous; verify repo), graphify — ⭐ ~123k — 💻 CLI + MCP 🔁 ⚠️ check README for current install, 🧠 Memory — what survives the session, planning-with-files — ⭐ ~27k — 📁 Skill copy 🔁, repomix — ⭐ ~29k — 💻 CLI (one-off)

### Community 71 - "Pull Request & Git Rules"
Cohesion: 0.33
Nodes (5): Before Opening a PR, Branching, Commits, PR Description Template, Pull Request & Git Rules

### Community 72 - "com.unity.ide.vscode"
Cohesion: 0.33
Nodes (6): dependencies, depth, source, url, version, com.unity.ide.vscode

### Community 73 - "/deploy — Guarded Deployment"
Cohesion: 0.40
Nodes (4): After deploy, Deploy, /deploy — Guarded Deployment, Pre-deploy checklist (MUST all pass — stop and report on any failure)

### Community 74 - "/retro — Learning Flywheel"
Cohesion: 0.40
Nodes (4): Process, /retro — Learning Flywheel, What counts as a lesson, What does NOT count

### Community 75 - "Tool Catalog — Install What You Need, When You Need It"
Cohesion: 0.40
Nodes (3): How things install (legend), 🚦 Suggested starting points, Tool Catalog — Install What You Need, When You Need It

### Community 76 - "/deploy — Guarded Deployment"
Cohesion: 0.40
Nodes (4): After deploy, Deploy, /deploy — Guarded Deployment, Pre-deploy checklist (MUST all pass — stop and report on any failure)

### Community 77 - "/retro — Learning Flywheel"
Cohesion: 0.40
Nodes (4): Process, /retro — Learning Flywheel, What counts as a lesson, What does NOT count

### Community 78 - "Code Style Rules"
Cohesion: 0.40
Nodes (4): Code Style Rules, Hard rules worth repeating (non-default or often violated), Project-specific deviations (edit per project — delete lines that don't apply), The linter owns style

### Community 79 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, depth, source, version, dependencies, depth, source, version (+12 more)

### Community 80 - "tales-art.js"
Cohesion: 0.08
Nodes (53): Approved implementation, Evidence and decisions, Hollow Night enhancement exploration, Implementation evidence, Original-art prototype (2026-10-17 to 2026-10-18), Original-reference clarification, Polish pass on the three nights (2026-10-19), Progress (+45 more)

### Community 81 - "/install — Install a tool from the catalog"
Cohesion: 0.50
Nodes (3): If a name was given, If no name was given, /install — Install a tool from the catalog

### Community 82 - "code-reviewer.md"
Cohesion: 0.50
Nodes (3): Output format, Process, Review priorities (in order)

### Community 83 - "security-auditor.md"
Cohesion: 0.50
Nodes (3): Checklist, Output format, Scope

### Community 84 - "/install — Install a tool from the catalog"
Cohesion: 0.50
Nodes (3): If a name was given, If no name was given, /install — Install a tool from the catalog

### Community 85 - "done-gate.sh"
Cohesion: 0.83
Nodes (3): has_script(), run_gate(), done-gate.sh script

### Community 86 - "sync-codex.sh"
Cohesion: 0.83
Nodes (3): body_without_frontmatter(), frontmatter_description(), sync-codex.sh script

### Community 90 - "MonoBehaviour"
Cohesion: 0.12
Nodes (10): Spin, SpriteRenderer, Vector3, Bat, Door, IsOpen, GhostPlatform, Mushroom (+2 more)

### Community 91 - "StoryScreen"
Cohesion: 0.27
Nodes (6): Coroutine, IEnumerator, Image, RectTransform, Text, StoryScreen

### Community 92 - ".BuildNode"
Cohesion: 0.15
Nodes (9): Progress, SoundOn, TotalStars, Image, Transform, Vector2, WorldMapScreen, RectMask2D (+1 more)

### Community 93 - ".Get"
Cohesion: 0.15
Nodes (10): Color, Dictionary, Sprite, Art, BodyFont, Fallback, SpriteMaterial, TitleFont (+2 more)

### Community 94 - "Hollow Night browser design study"
Cohesion: 0.50
Nodes (3): Checks, Compare and play, Hollow Night browser design study

### Community 99 - "game.test.js"
Cohesion: 0.17
Nodes (15): ref_node_test, launchVelocity(), stars(), advance(), assert, { Game, launchVelocity, trajectory, stars }, gateLanding(), level() (+7 more)

### Community 101 - "original/app.js"
Cohesion: 0.17
Nodes (29): advanceStory(), applyLang(), applyMute(), cameraTarget(), dismissTip(), finishStage(), frame(), handleEvents() (+21 more)

### Community 102 - "PLayer_drag_drop"
Cohesion: 0.18
Nodes (7): Animator, CircleCollider2D, Collider2D, Rigidbody2D, Vector3, PLayer_drag_drop, Pose

### Community 103 - "player_script"
Cohesion: 0.18
Nodes (6): Animator, IEnumerator, Rigidbody2D, Vector2, player_script, SpringJoint2D

### Community 104 - "Timucuha n Yennayer — the tales of Mqidec"
Cohesion: 0.13
Nodes (14): 1. Decisions taken with the user (2026-10-19), 2. The frame: the hearth, 3. The hero and the ogress, 4. The tales, 5. Text and languages, 6. What this changes in the prototype, 7. Open points for the user, Later tales (ideas, not planned) (+6 more)

### Community 105 - "ButtonJuice"
Cohesion: 0.24
Nodes (5): Vector3, ButtonJuice, IPointerDownHandler, IPointerUpHandler, PointerEventData

### Community 106 - "com.unity.modules.tetgen"
Cohesion: 0.40
Nodes (5): dependencies, depth, source, version, com.unity.modules.tetgen

### Community 107 - "Project Memory (CLAUDE.md)"
Cohesion: 0.18
Nodes (9): Architecture Notes, Essential Commands, Game guide, graphify, Hard Constraints (always follow), Project Memory (CLAUDE.md), Project Overview, Rules (+1 more)

### Community 108 - "trajectory_Script"
Cohesion: 0.27
Nodes (5): GameObject, Transform, Vector2, Vector3, trajectory_Script

### Community 109 - "SPEC: Black rabbit + hunting pumpkins redesign"
Cohesion: 0.20
Nodes (9): 2. The enemy: hunting pumpkins (`Kind.Hunter`), 3. Stars, 4. Stages, 5. Story (`Story.cs`), 6. Files, 7. Platform, 8. Out of scope, 9. Verification (+1 more)

### Community 110 - "Hollow Night — AI project guide"
Cohesion: 0.20
Nodes (10): 10. Code knowledge graph (Graphify), 11. Rules for AI assistants, 1. What this project is, 2. Key design decision: everything is built from code, 4. Scene flow, 9. Verification, Browser exploration (2026-10-14), Hollow Night — AI project guide (+2 more)

### Community 111 - "pumkinkScript"
Cohesion: 0.25
Nodes (6): Animator, Collision2D, GameObject, IEnumerator, pumkinkScript, Level 1 composition

### Community 112 - "HeroState"
Cohesion: 0.29
Nodes (7): Hero states (`HeroState`), HeroState, Cannon, Dead, Flying, Resting, Won

### Community 113 - "3. Folder map"
Cohesion: 0.18
Nodes (8): 3. Folder map, Camera, GameBoot, Canvas, GraphicRaycaster, AudioListener, CanvasScaler, EventSystem

### Community 114 - "prototype/verify-routes.js"
Cohesion: 0.33
Nodes (5): ref_node_assert, get(), assert, { get }, { simulateRoute }

### Community 116 - "simulateRoute"
Cohesion: 0.29
Nodes (3): simulateRoute(), Browser layouts and route evidence, Verified replays

### Community 117 - "6. Gameplay rules"
Cohesion: 0.33
Nodes (6): 6. Gameplay rules, Hero (`Heroes.cs`), Hunting pumpkins (`Hunter` in `Elements.cs`), Input (`StageController.Update`), Score, World units

### Community 118 - "The user's original handmade scene references"
Cohesion: 0.33
Nodes (5): History limits, Original art, Original rabbit animation and committed code, Retained scenes, The user's original handmade scene references

### Community 120 - "characters.js"
Cohesion: 0.83
Nodes (3): currentKey(), frame(), poseFor()

## Knowledge Gaps
- **702 isolated node(s):** `validate-code.sh script`, `$schema`, `allow`, `deny`, `PostToolUse` (+697 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 966 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `player_script` connect `player_script` to `8. Legacy prototype`, `MonoBehaviour`, `unityengine`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `3. Gameplay rules` connect `prototype/art.js` to `Game`, `player_script`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `Sfx` connect `Sfx` to `unityengine`, `3. Folder map`, `Hero`, `mqidec_cloak.py`, `5. Core classes`, `MonoBehaviour`, `.Get`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Hero` (e.g. with `3. Folder map` and `5. Core classes`) actually correct?**
  _`Hero` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `LevelData` (e.g. with `3. Folder map` and `5. Core classes`) actually correct?**
  _`LevelData` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `validate-code.sh script`, `$schema`, `allow` to the rest of the system?**
  _702 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.038461538461538464 - nodes in this community are weakly interconnected._