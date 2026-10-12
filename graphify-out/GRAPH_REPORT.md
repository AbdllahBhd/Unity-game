# Graph Report - game1  (2026-10-12)

## Corpus Check
- 73 files · ~50,301 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .ttf 2, .toml 1)

## Summary
- 1586 nodes · 2993 edges · 100 communities (92 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e14fd5e7`
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
- 8. Legacy prototype
- HeroType
- izanScript
- pumkinkScript
- generate_art.py
- LegacyButton
- .Label
- bbbb
- LevelBuilder
- LevelData
- Sfx
- Hero
- StoryScreen
- check_levels.py
- MonoBehaviour
- StageController
- .Play
- StageHud
- Hunter
- .IsFloor
- packages-lock.json
- .Start
- FlowRunner
- HNSmokeTest
- com.unity.modules.uielements
- GameBoot
- dependencies
- com.unity.modules.unitywebrequest
- ButtonJuice
- .Die
- com.unity.2d.common
- com.unity.test-framework
- com.unity.modules.physics
- balltest
- com.unity.modules.jsonserialize
- 3. Folder map
- com.unity.modules.physics2d
- com.unity.modules.audio
- README.md
- com.unity.modules.ui
- com.unity.collab-proxy
- AI Coding Template — for Claude Code & Codex
- .Get
- com.unity.modules.imageconversion
- 🔧 Tools — reach beyond the terminal
- com.unity.modules.imgui
- com.unity.mathematics
- com.unity.ai.navigation
- 8. What each piece does (and when the AI reads it)
- Engineering Workflow Rules
- Testing Patterns
- hooks
- Testing Patterns
- API Conventions
- door_Scrip
- .Pop
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
- com.unity.modules.accessibility
- .Go
- /install — Install a tool from the catalog
- code-reviewer.md
- security-auditor.md
- /install — Install a tool from the catalog
- done-gate.sh
- sync-codex.sh
- game1.slnx
- validate-code.sh
- 5. Core classes
- CameraRig
- Bob
- .Start
- Hollow Night — AI project guide
- Project Memory (CLAUDE.md)
- HeroState
- 6. Gameplay rules
- com.unity.modules.tetgen
- com.unity.modules.umbra

## God Nodes (most connected - your core abstractions)
1. `Hero` - 72 edges
2. `LevelData` - 49 edges
3. `StageController` - 41 edges
4. `LevelBuilder` - 37 edges
5. `main()` - 33 edges
6. `shape()` - 28 edges
7. `Sfx` - 27 edges
8. `save()` - 27 edges
9. `canvas()` - 27 edges
10. `5. Core classes` - 26 edges

## Surprising Connections (you probably didn't know these)
- `8. Legacy prototype` --references--> `GameManager`  [INFERRED]
  AGENTS.md → Assets/GameManager.cs
- `8. Legacy prototype` --references--> `LegacyButton`  [INFERRED]
  AGENTS.md → Assets/LegacyButton.cs
- `8. Legacy prototype` --references--> `CharacterController2D`  [INFERRED]
  AGENTS.md → Assets/Scripts/CharacterController2D.cs
- `5. Core classes` --references--> `Layer`  [INFERRED]
  AGENTS.md → Assets/Scripts/HollowNight/Core/Art.cs
- `3. Folder map` --references--> `Art`  [INFERRED]
  AGENTS.md → Assets/Scripts/HollowNight/Core/Art.cs

## Import Cycles
- None detected.

## Communities (100 total, 8 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (52): dependencies, com.unity.2d.animation, com.unity.2d.pixel-perfect, com.unity.2d.psdimporter, com.unity.2d.sprite, com.unity.2d.spriteshape, com.unity.2d.tilemap, com.unity.ai.navigation (+44 more)

### Community 1 - "manifest.json"
Cohesion: 0.04
Nodes (51): com.unity.2d.sprite, com.unity.2d.tilemap, com.unity.modules.ai, com.unity.modules.animation, com.unity.modules.assetbundle, com.unity.modules.audio, com.unity.modules.director, com.unity.modules.imageconversion (+43 more)

### Community 2 - "level_Loader"
Cohesion: 0.20
Nodes (6): button_Press, Animator, Rigidbody2D, Animator, IEnumerator, level_Loader

### Community 3 - "PLayer_drag_drop"
Cohesion: 0.07
Nodes (17): Animator, Camera, Vector2, GameManager, Animator, CircleCollider2D, Collider2D, Rigidbody2D (+9 more)

### Community 4 - "unityengine"
Cohesion: 0.07
Nodes (20): Animator, start_left, Animator, start_middel, Animator, start_right, HollowNight, HollowNight.EditorTools (+12 more)

### Community 5 - "CharacterController2D"
Cohesion: 0.21
Nodes (9): BoolEvent, CharacterController2D, Collider2D, Rigidbody2D, Transform, Vector3, BoolEvent, LayerMask (+1 more)

### Community 6 - "player_script"
Cohesion: 0.18
Nodes (6): Animator, IEnumerator, Rigidbody2D, Vector2, player_script, SpringJoint2D

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

### Community 11 - "pumkinkScript"
Cohesion: 0.29
Nodes (5): Animator, Collision2D, GameObject, IEnumerator, pumkinkScript

### Community 12 - "generate_art.py"
Cohesion: 0.12
Nodes (79): hashlib, pil, shutil, background(), hills(), bat(), button(), canvas() (+71 more)

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
Cohesion: 0.06
Nodes (44): Color, Dictionary, Sprite, SpriteRenderer, Transform, Vector2, Vector3, Art (+36 more)

### Community 17 - "LevelData"
Cohesion: 0.07
Nodes (22): 7. How to add or change a stage, List, Vector2, Kind, Bat, Boss, Cauldron, Crate (+14 more)

### Community 18 - "Sfx"
Cohesion: 0.07
Nodes (27): Dictionary, Sfx, Instance, Sound, BossHit, Bounce, Break, Candy (+19 more)

### Community 19 - "Hero"
Cohesion: 0.09
Nodes (21): IEnumerator, WebPatch, CircleCollider2D, Collider2D, IEnumerator, Rigidbody2D, SpriteRenderer, Transform (+13 more)

### Community 20 - "StoryScreen"
Cohesion: 0.15
Nodes (12): Dictionary, Dialogue, Line, Story, AllIds, Coroutine, IEnumerator, Image (+4 more)

### Community 21 - "check_levels.py"
Cohesion: 0.12
Nodes (24): concurrent_futures, math, os, Random, re, sys, check(), circle_box() (+16 more)

### Community 22 - "MonoBehaviour"
Cohesion: 0.10
Nodes (17): Spin, SpriteRenderer, Transform, Vector2, Vector3, Bat, Cauldron, Door (+9 more)

### Community 23 - "StageController"
Cohesion: 0.13
Nodes (11): Camera, CircleCollider2D, GameObject, Vector2, StageController, Ended, Hero, I (+3 more)

### Community 24 - ".Play"
Cohesion: 0.16
Nodes (7): Color, Vector2, Fx, Mote, Collision2D, Crate, IEnumerator

### Community 25 - "StageHud"
Cohesion: 0.23
Nodes (8): CanvasGroup, Coroutine, IEnumerator, Image, RectTransform, Text, Transform, StageHud

### Community 26 - "Hunter"
Cohesion: 0.18
Nodes (6): Collider2D, Rigidbody2D, Hunter, Sated, Mover, Velocity

### Community 28 - "packages-lock.json"
Cohesion: 0.06
Nodes (31): com.unity.2d.sprite, com.unity.2d.tilemap, com.unity.modules.ai, com.unity.modules.animation, com.unity.modules.assetbundle, com.unity.modules.audio, com.unity.modules.director, com.unity.modules.imageconversion (+23 more)

### Community 29 - ".Start"
Cohesion: 0.17
Nodes (8): Image, RectTransform, Sprite, Vector2, Drift, Hopper, MainMenuScreen, UIFrames

### Community 30 - "FlowRunner"
Cohesion: 0.24
Nodes (7): Canvas, CanvasGroup, GraphicRaycaster, IEnumerator, Image, FlowRunner, Instance

### Community 31 - "HNSmokeTest"
Cohesion: 0.10
Nodes (18): Canvas, List, HNSmokeTest, Elapsed, Phase, Done, Map, Menu (+10 more)

### Community 32 - "com.unity.modules.uielements"
Cohesion: 0.08
Nodes (24): dependencies, depth, source, version, dependencies, depth, source, version (+16 more)

### Community 33 - "GameBoot"
Cohesion: 0.18
Nodes (10): 2. Key design decision: everything is built from code, Camera, GameBoot, ScreenKind, MainMenu, Stage, Story, WorldMap (+2 more)

### Community 34 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, depth, source, version, dependencies, depth, source, version (+13 more)

### Community 35 - "com.unity.modules.unitywebrequest"
Cohesion: 0.09
Nodes (25): dependencies, depth, source, version, dependencies, depth, source, version (+17 more)

### Community 36 - "ButtonJuice"
Cohesion: 0.24
Nodes (5): Vector3, ButtonJuice, IPointerDownHandler, IPointerUpHandler, PointerEventData

### Community 38 - "com.unity.2d.common"
Cohesion: 0.10
Nodes (22): dependencies, depth, source, url, version, depth, source, url (+14 more)

### Community 39 - "com.unity.test-framework"
Cohesion: 0.07
Nodes (32): dependencies, dependencies, depth, source, version, dependencies, depth, source (+24 more)

### Community 40 - "com.unity.modules.physics"
Cohesion: 0.08
Nodes (25): dependencies, depth, source, version, dependencies, depth, source, version (+17 more)

### Community 42 - "com.unity.modules.jsonserialize"
Cohesion: 0.10
Nodes (20): dependencies, depth, source, version, dependencies, depth, source, version (+12 more)

### Community 43 - "3. Folder map"
Cohesion: 0.16
Nodes (10): 3. Folder map, Progress, SoundOn, TotalStars, Image, Transform, Vector2, WorldMapScreen (+2 more)

### Community 44 - "com.unity.modules.physics2d"
Cohesion: 0.13
Nodes (15): dependencies, depth, source, version, dependencies, depth, source, version (+7 more)

### Community 45 - "com.unity.modules.audio"
Cohesion: 0.09
Nodes (25): dependencies, depth, source, version, dependencies, depth, source, version (+17 more)

### Community 47 - "com.unity.modules.ui"
Cohesion: 0.12
Nodes (16): dependencies, depth, source, version, dependencies, depth, source, version (+8 more)

### Community 48 - "com.unity.collab-proxy"
Cohesion: 0.33
Nodes (6): dependencies, depth, source, url, version, com.unity.collab-proxy

### Community 49 - "AI Coding Template — for Claude Code & Codex"
Cohesion: 0.12
Nodes (16): 10. Commands reference, 11. Using it with Codex too (and Cursor, Gemini...), 12. Optional extras, when you need them, 13. Growing and maintaining it, 1. Why would I use this?, 2. When should I NOT use it?, 3. Setup — NEW project, 4. Setup — EXISTING project (merge, don't overwrite!) (+8 more)

### Community 50 - ".Get"
Cohesion: 0.18
Nodes (4): Canvas, GraphicRaycaster, CanvasScaler, EventSystem

### Community 51 - "com.unity.modules.imageconversion"
Cohesion: 0.13
Nodes (15): dependencies, depth, source, version, dependencies, depth, source, version (+7 more)

### Community 52 - "🔧 Tools — reach beyond the terminal"
Cohesion: 0.17
Nodes (12): awesome-mcp-servers — ⭐ ~96k — 📖 Reading, cc-switch — ⭐ ~139k — 💻 Desktop app (per machine), chrome-devtools-mcp — ⭐ ~53k — 🔧 MCP, claude-code-router — ⭐ ~38k — 💻 CLI (per machine), context7 — ⭐ ~63k — 🔧 MCP, firecrawl — ⭐ ~188k — 🔧 MCP (needs API key), github-mcp — ⭐ ~33k — 🔧 MCP (remote), multica — ⭐ ~52k — 💻 Self-hosted app ⚠️ check README (+4 more)

### Community 53 - "com.unity.modules.imgui"
Cohesion: 0.09
Nodes (23): dependencies, depth, source, url, version, dependencies, depth, source (+15 more)

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

### Community 63 - ".Pop"
Cohesion: 0.25
Nodes (5): Action, CanvasGroup, IEnumerator, Transform, Tween

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

### Community 79 - "com.unity.modules.accessibility"
Cohesion: 0.40
Nodes (5): dependencies, depth, source, version, com.unity.modules.accessibility

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

### Community 90 - "5. Core classes"
Cohesion: 0.20
Nodes (4): 5. Core classes, Layer, Ease, IEnumerator

### Community 91 - "CameraRig"
Cohesion: 0.33
Nodes (3): Camera, Transform, CameraRig

### Community 92 - "Bob"
Cohesion: 0.22
Nodes (5): Level objects (`Kind` in `LevelData.cs`, classes in `Elements.cs`), Vector3, Bob, Collider2D, LanternGoal

### Community 93 - ".Start"
Cohesion: 0.33
Nodes (4): Color, SpriteRenderer, Vector2, Trajectory

### Community 94 - "Hollow Night — AI project guide"
Cohesion: 0.25
Nodes (6): 10. Code knowledge graph (Graphify), 11. Rules for AI assistants, 1. What this project is, 4. Scene flow, 9. Verification, Hollow Night — AI project guide

### Community 95 - "Project Memory (CLAUDE.md)"
Cohesion: 0.25
Nodes (8): Architecture Notes, Essential Commands, Game guide, graphify, Hard Constraints (always follow), Project Memory (CLAUDE.md), Rules, Session & Context Hygiene

### Community 96 - "HeroState"
Cohesion: 0.29
Nodes (7): Hero states (`HeroState`), HeroState, Cannon, Dead, Flying, Resting, Won

### Community 97 - "6. Gameplay rules"
Cohesion: 0.33
Nodes (6): 6. Gameplay rules, Hero (`Heroes.cs`), Hunting pumpkins (`Hunter` in `Elements.cs`), Input (`StageController.Update`), Score, World units

### Community 98 - "com.unity.modules.tetgen"
Cohesion: 0.40
Nodes (5): dependencies, depth, source, version, com.unity.modules.tetgen

### Community 99 - "com.unity.modules.umbra"
Cohesion: 0.40
Nodes (5): dependencies, depth, source, version, com.unity.modules.umbra

## Knowledge Gaps
- **606 isolated node(s):** `validate-code.sh script`, `$schema`, `allow`, `deny`, `PostToolUse` (+601 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 821 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Sfx` connect `Sfx` to `unityengine`, `3. Folder map`, `.Get`, `check_levels.py`, `MonoBehaviour`, `.Play`, `5. Core classes`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `5. Core classes` connect `5. Core classes` to `GameBoot`, `3. Folder map`, `.Label`, `LevelBuilder`, `.Go`, `Sfx`, `Hero`, `LevelData`, `StoryScreen`, `MonoBehaviour`, `StageController`, `.Play`, `StageHud`, `Hollow Night — AI project guide`, `Bob`, `FlowRunner`, `.Pop`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Hero` connect `Hero` to `HeroState`, `unityengine`, `5. Core classes`, `.Die`, `HeroType`, `3. Folder map`, `MonoBehaviour`, `StageController`, `.Play`, `.Update`, `Hunter`, `.IsFloor`, `Bob`, `.Start`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Hero` (e.g. with `3. Folder map` and `5. Core classes`) actually correct?**
  _`Hero` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `LevelData` (e.g. with `3. Folder map` and `5. Core classes`) actually correct?**
  _`LevelData` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `validate-code.sh script`, `$schema`, `allow` to the rest of the system?**
  _606 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.038461538461538464 - nodes in this community are weakly interconnected._