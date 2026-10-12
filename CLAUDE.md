# Project Memory (CLAUDE.md)

> Loaded automatically at the start of every Claude Code session.
> Keep it short and high-signal. The full game guide is `AGENTS.md`, imported below.

## Project Overview

- **Name:** **Hollow Night: Izan and the Moon Lantern** (Unity project folder `game1`).
- **What it does:** 2D Halloween physics puzzle game for mobile portrait. Drag to aim,
  release to launch a hero, collect candy, reach the door. 4 heroes, 10 stages in
  3 chapters, a witch boss, story screens. Everything (UI, levels, audio) is built from
  code at runtime; scenes contain a single `GameBoot` object.
- **Tech stack:** Unity **6000.6.5f1** (Unity 6, upgraded from 2019.3 on 2026-10-12), C# code
  kept at **7.3** style, **built-in render pipeline** (URP removed, all sprites use `Sprites/Default`),
  Physics2D, legacy `Input`, `UnityEngine.UI` (no TextMeshPro). Python 3 + Pillow for tooling.
- **Package manager:** none (Unity Package Manager via `Packages/manifest.json`).
  No `package.json`, so the npm-based hooks in `.claude/hooks/` pass through untouched.

## Essential Commands

Unity Hub and editor 6000.6.5f1 are installed at `~/Unity/Hub/Editor/6000.6.5f1`. Claude cannot
drive the editor; the user play-tests and pastes Console output. Never claim a Unity test ran.

```bash
# All commands run from the project root (this folder)
# Verify every stage is finishable (physics simulator; vary --seed when a stage is near par)
python3 Tools/check_levels.py
python3 Tools/check_levels.py 4 7 --seed 5

# Regenerate the procedural sprites in Assets/Resources/HN/ (keeps .meta GUIDs)
python3 Tools/generate_art.py

# Code knowledge graph (use before opening .cs files; AST-only, no API cost)
graphify query "how does the hero come to rest"
graphify update .

# Compile check: open the project in Unity; Library/ScriptAssemblies/Assembly-CSharp.dll
# timestamp and Logs/Editor.log (grep 'error CS') show the result.
```

## Architecture Notes

- This folder is the git repo. `Library/`, `Temp/`, `obj/`, `Logs/` and IDE files are ignored.
- **AI tooling** (`.claude/`, `.agents/`, `.codex/`, `scripts/`, `CATALOG.md`,
  `TEMPLATE_README.md`) is shared by Claude Code and Codex. Edit `.claude/` only, then run
  `bash scripts/sync-codex.sh`; never edit `.agents/skills/` directly.
- **`AGENTS.md` is the full game guide** (imported below): folder map, scene flow, hero
  rules, how to add a stage, verification steps. Read it before touching code.
- Game code: `Assets/Scripts/HollowNight/{Core,UI,Story,Stage,Elements}/`.
  Entry point is `Core/GameBoot.cs` (its `.meta` GUID must never change).
  Scenes: `Assets/Scenes/HollowNight/HN_{MainMenu,WorldMap,Story,Stage}.unity`.
  Art and fonts: `Assets/Resources/HN/`, loaded by name through `Art.Get`.
- Stages are data in `Stage/LevelLibrary.cs` using the fluent `LevelData` DSL. The
  simulator parses that file, so keep one call per line with plain numbers.
- Legacy prototype (`Assets/*.cs`, `Assets/Scripts/*.cs`, old `.unity` scenes)
  is disabled in the build. Never rename its classes or public fields; they are wired in scenes.
- Never read or edit `Library/`, `Temp/`, `obj/`, `Logs/`, `*.csproj`, `*.sln`, or existing
  `.meta` files. Non-asset files go in `Tools/`, not `Assets/`.
- Status as of 2026-10-12: project opens in Unity 6 and compiles with 0 errors (API updater
  renamed `velocity`→`linearVelocity`, `drag`→`linearDamping`). All 10 stages pass the
  simulator. **Not yet play-tested**: expect first-run fixes to scenes, sprite imports, feel.

## Rules

Detailed conventions live in `.claude/rules/` and are loaded automatically:

- @.claude/rules/code-style.md
- @.claude/rules/pr.md
- @.claude/rules/workflow.md

API conventions load on demand as a skill (`.claude/skills/api-conventions/`) —
only sessions that touch an API pay for them. (This project has no HTTP API.)

## Session & Context Hygiene

- When compacting this conversation, always preserve the full list of modified
  files, the current task plan status, and any test commands used.
- Unrelated new task → suggest starting a fresh session instead of continuing here.
- Use `graphify query` / `AGENTS.md` first; open a `.cs` file only for exact lines.

## Hard Constraints (always follow)

- Never commit secrets, API keys, or `.env` files.
- Never push directly to `main` — always work on a feature branch.
- Run `python3 Tools/check_levels.py` (and the compile check when available) before
  claiming a task is complete. Never claim a Unity play-test that did not happen.
- Use Unity 6 APIs (`linearVelocity`, `linearDamping`); keep code simple C# 7.3 style.
- After changing game code: run `graphify update .` and update `AGENTS.md`.
- Prefer editing existing files over creating new ones.

## Game guide

@AGENTS.md

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
