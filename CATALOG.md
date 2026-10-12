# Tool Catalog — Install What You Need, When You Need It

> This file is a **menu, not an installation**. Nothing here is bundled in the template.
> When a project needs a capability, find it below and run the one-line install —
> you always get the latest version straight from GitHub.
>
> All repo links verified against GitHub on **2026-10-02** (star counts approximate).
> Names marked ⚠️ had ambiguous matches — double-check the repo is what you expect before installing.

## How things install (legend)

| Type | Meaning | Scope |
|---|---|---|
| 🔌 Plugin | `/plugin` commands inside Claude Code | Per machine, auto-updates |
| 📁 Skill copy | Copy a folder into `.claude/skills/` | Per project, frozen at copy |
| 🔧 MCP server | `claude mcp add ...` | Per project (or `--scope user`) |
| 💻 CLI / App | npm / brew / download | Per machine |
| 📖 Reading | Nothing to install — a guide or link list | — |

---

## 🎛 Harness — changes how Claude works before it types

### superpowers — ⭐ ~294k — 🔌 Plugin
Development methodology as composable skills: brainstorm → write-plan → execute-plan, TDD, systematic debugging. The best "any project" pick.
```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```
https://github.com/obra/superpowers

### ECC ("Everything Claude Code") — ⭐ ~271k — 📁 Config pack
Affaan Mustafa's full harness pack: 28 subagents, 119 skills, 60 commands, hooks, rules. Huge — cherry-pick, don't install wholesale.
```bash
git clone https://github.com/affaan-m/ECC
```
Then copy only the agents/skills you want into `.claude/`. https://github.com/affaan-m/ECC

### karpathy-skills — ⭐ ~216k — 📁 One file
A single CLAUDE.md with 4 behavioral rules from Andrej Karpathy's LLM-coding observations. Read it, steal the lines you like into your own CLAUDE.md.
```bash
curl -o CLAUDE-karpathy.md https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md
```
https://github.com/multica-ai/andrej-karpathy-skills

### gstack — ⭐ ~135k — 📁 Skills copy
Garry Tan's (YC CEO) setup: 23 role skills (designer, EM, QA, CEO...) as slash commands.
```bash
git clone https://github.com/garrytan/gstack && cp -r gstack/skills/* .claude/skills/
```
https://github.com/garrytan/gstack

### ponytail — ⭐ ~151k — 🔌 Plugin
Makes Claude "the laziest senior dev": forces reuse of existing code/stdlib before writing new code (~54% less code).
```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```
https://github.com/DietrichGebert/ponytail

### learn-claude-code — ⭐ ~78k — 📖 Reading
"Bash is all you need" — build a nano Claude Code from scratch; the best way to understand how the harness works internally.
https://github.com/shareAI-lab/learn-claude-code

---

## ⭐ Skills — knowledge loaded on demand

### anthropics/skills — ⭐ ~179k — 🔌 Plugin (or copy)
Anthropic's official skill library (docx, pptx, xlsx, pdf...).
```
/plugin marketplace add anthropics/skills
```
Or clone and copy individual folders into `.claude/skills/`. https://github.com/anthropics/skills

### ui-ux-pro-max — ⭐ ~132k — 📁 Skill copy
Design intelligence: 67 UI styles, 96 palettes, 57 font pairings, UX rules. For projects with a UI.
```bash
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill && cp -r ui-ux-pro-max-skill/ui-ux-pro-max .claude/skills/
```
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

### taste-skill — ⭐ ~92k — 📁 Skill copy ⚠️ (same-named repos exist)
Metric-driven design quality — stops generic "AI slop" frontend output.
```bash
npx skills add leonxlnx/taste-skill
```
https://github.com/Leonxlnx/taste-skill

### awesome-claude-skills — ⭐ ~76k — 📖 Reading ⚠️ (ComposioHQ's is the big one)
Curated list of Claude skills. https://github.com/ComposioHQ/awesome-claude-skills

### wshobson/agents — ⭐ ~40k — 🔌 Plugin marketplace
Marketplace of dozens of ready-made specialized subagents (the infographic's "whobson/agents").
```
/plugin marketplace add wshobson/agents
```
https://github.com/wshobson/agents

### claude-plugins (official directory) — ⭐ ~37k — 🔌 Built in
Anthropic's curated plugin directory — already registered in Claude Code; browse at claude.com/plugins.
```
/plugin install <name>@claude-plugins-official
```
https://github.com/anthropics/claude-plugins-official

---

## 🧠 Memory — what survives the session

> **Cross-tool note:** prefer tools that store state as repo files — that memory is
> then shared between Claude, Codex, and all your laptops (via git). Tool-private
> memory is locked to one tool. Per entry: 🔁 = shared via repo files ·
> 🔒 = locked to one tool · 🖥 = shared across tools on one machine only.

### graphify — ⭐ ~123k — 💻 CLI + MCP 🔁 ⚠️ check README for current install
Codebase → queryable knowledge graph stored in the repo (`graphify-out/`) — the graph is shared across tools and laptops; register the MCP in each tool. Hooks redirect Claude from raw file reads to graph queries. **Try on one project before making it a default — it changes how every session reads code.**
https://github.com/Graphify-Labs/graphify

### claude-mem — ⭐ ~95k — 💻 CLI 🔒 Claude-only
Persistent compressed memory of everything the agent did, recalled in later sessions. Hooks into Claude Code specifically — Codex never sees this memory; skip it if Codex is part of your workflow.
```bash
npm install -g claude-mem && claude-mem install
```
https://github.com/thedotmack/claude-mem

### codegraph — ⭐ ~73k — 🔧 MCP 🖥 ⚠️ (name is ambiguous; verify repo)
Local SQLite code knowledge graph, auto-syncing, queried via MCP. 100% local — any MCP-speaking tool on this machine can query it, but the index doesn't travel via git.
https://github.com/colbymchenry/codegraph

### repomix — ⭐ ~29k — 💻 CLI (one-off)
Packs a whole repo into one AI-friendly file — great for pasting a codebase into a chat.
```bash
npx repomix@latest
```
https://github.com/yamadashy/repomix

### planning-with-files — ⭐ ~27k — 📁 Skill copy 🔁
Manus-style persistent planning: task_plan.md / findings.md / progress.md survive restarts — plain repo files, fully shared across tools and laptops.
```bash
git clone https://github.com/OthmanAdi/planning-with-files && cp -r planning-with-files/planning-with-files .claude/skills/
```
https://github.com/OthmanAdi/planning-with-files

---

## 🔧 Tools — reach beyond the terminal

### firecrawl — ⭐ ~188k — 🔧 MCP (needs API key)
Web search/scrape/crawl as clean data. Requires a Firecrawl account + API key.
```bash
claude mcp add firecrawl -e FIRECRAWL_API_KEY=your-key -- npx -y firecrawl-mcp
```
https://github.com/firecrawl/firecrawl

### context7 — ⭐ ~63k — 🔧 MCP
**Top pick.** Current, version-specific library docs injected into context — fixes "Claude knows the old API."
```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```
https://github.com/upstash/context7

### chrome-devtools-mcp — ⭐ ~53k — 🔧 MCP
Official Chrome team server: performance traces, console, network, DOM debugging.
```bash
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
```
https://github.com/ChromeDevTools/chrome-devtools-mcp

### playwright-mcp — ⭐ ~38k — 🔧 MCP
Microsoft's official browser automation MCP — lets Claude drive and test in a real browser.
```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```
https://github.com/microsoft/playwright-mcp

### github-mcp — ⭐ ~33k — 🔧 MCP (remote)
GitHub's official server (repos, PRs, issues, Actions). Note: the `gh` CLI covers much of this already.
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```
https://github.com/github/github-mcp-server

### serena — ⭐ ~30k — 🔧 MCP
LSP-based semantic code navigation — IDE-grade "find references / go to definition" for large codebases.
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
```
https://github.com/oraios/serena

### cc-switch — ⭐ ~139k — 💻 Desktop app (per machine)
Manage/switch providers, MCP servers and skills across Claude Code, Codex, Gemini CLI and more.
Download from GitHub Releases; macOS: `brew install --cask cc-switch`. https://github.com/farion1231/cc-switch

### multica — ⭐ ~52k — 💻 Self-hosted app ⚠️ check README
Platform for humans + many AI agents working as one team (issue → 20 agents).
https://github.com/multica-ai/multica

### claude-code-router — ⭐ ~38k — 💻 CLI (per machine)
Route Claude Code requests to any model/provider (DeepSeek, Gemini, OpenRouter...).
```bash
npm install -g @musistudio/claude-code-router
```
https://github.com/musistudio/claude-code-router

### vibe-kanban — ⭐ ~28k — 💻 App
Kanban board to orchestrate and review multiple coding agents in parallel.
```bash
npx vibe-kanban
```
https://github.com/BloopAI/vibe-kanban

### awesome-mcp-servers — ⭐ ~96k — 📖 Reading
The canonical list of MCP servers — look here first when you need a new integration.
https://github.com/punkpeye/awesome-mcp-servers

---

## 💰 Cost — understand and reduce the burn

### ccusage — ⭐ ~19k — 💻 CLI (one-off)
**Top pick.** Reads your local Claude Code logs → cost per day/project/model. Zero setup.
```bash
npx ccusage@latest
```
https://github.com/ccusage/ccusage

### claude-hud — ⭐ ~28k — 🔌 Plugin
Live HUD under the input: context usage, active tools, running subagents, todo progress.
```
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud@claude-hud
```
https://github.com/jarrodwatts/claude-hud

### caveman — ⭐ ~109k — 📁 Skill copy
"why use many token when few token do trick" — telegraphic answers, ~65-75% fewer output tokens. Fun, but hurts readability; use selectively.
```bash
git clone https://github.com/JuliusBrussee/caveman && cp -r caveman/caveman .claude/skills/
```
https://github.com/JuliusBrussee/caveman

### codex-plugin-cc — ⭐ ~34k — 🔌 Plugin (needs Codex CLI + OpenAI login)
OpenAI's official plugin: run Codex inside Claude Code for adversarial second-opinion reviews.
```
/plugin marketplace add openai/codex-plugin-cc
```
https://github.com/openai/codex-plugin-cc

### system-prompts-ai — ⭐ ~144k — 📖 Reading
Leaked system prompts of Claude Code, Cursor, Devin, v0... Educational gold for prompt design.
https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools

### best-practice — ⭐ ~67k — 📖 Reading ⚠️ (name ambiguous)
"From vibe coding to agentic engineering" — community best-practices guide.
https://github.com/shanraisshan/claude-code-best-practice

---

## ➕ More verified additions worth knowing

### spec-kit — ⭐ ~140k — 💻 CLI (scaffolds into project)
GitHub's official Spec-Driven Development kit: /specify → /plan → /tasks → /implement commands.
```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <project> --ai claude
```
https://github.com/github/spec-kit

### awesome-claude-code — ⭐ ~55k — 📖 Reading
The canonical curated list of Claude Code commands, CLAUDE.md files, and workflows.
https://github.com/hesreallyhim/awesome-claude-code

### oh-my-claudecode — ⭐ ~40k — 🔌 Plugin
Multi-agent orchestration layer with its own HUD and execution modes.
```
/plugin marketplace add Yeachan-Heo/oh-my-claudecode
```
https://github.com/Yeachan-Heo/oh-my-claudecode

### claude-code-templates — ⭐ ~32k — 💻 CLI
Hundreds of ready agents/commands/MCPs + usage analytics dashboard (aitmpl.com).
```bash
npx claude-code-templates@latest
```
https://github.com/davila7/claude-code-templates

### SuperClaude — ⭐ ~24k — 💻 Installer
Commands + cognitive personas + dev methodology framework.
```bash
pipx install SuperClaude && SuperClaude install
```
https://github.com/SuperClaude-Org/SuperClaude_Framework

### claude-squad — ⭐ ~8.6k — 💻 CLI
Run multiple agents in parallel tmux sessions with git-worktree isolation.
```bash
brew install claude-squad
```
https://github.com/smtg-ai/claude-squad

---

## 🚦 Suggested starting points

- **Every project, day one:** superpowers (plugin, per laptop) · context7 (MCP)
- **When cost questions come up:** `npx ccusage@latest` · claude-hud
- **Web app projects:** playwright-mcp or chrome-devtools-mcp · ui-ux-pro-max
- **Huge codebase:** serena · graphify (trial first)
- **Install once per laptop, not per project:** plugins (superpowers, claude-hud), cc-switch, claude-code-router
- **Never "install", just read:** learn-claude-code, system-prompts-ai, best-practice, the awesome-* lists

> Rule of thumb: install when you feel the pain, not before. Every addition costs
> context, attention, or maintenance — the catalog exists so adding later takes 30 seconds.
