# AI Coding Template — for Claude Code & Codex

**What this is, in one sentence:** a folder of configuration files you copy into
your project so your AI assistant starts every session already knowing your
project, follows your rules, and can't call a task "done" while the tests fail.

It's not a program. There's nothing to install. Claude Code and Codex read these
files natively the moment they're in your project.

**How to read this file:** sections 1–4 get you running (why, when not, and the
two setup paths). Sections 5–13 explain how everything works — read them when
you're curious, not before starting.

---

## 1. Why would I use this?

Think about how you work with AI today, without it:

- Every new chat starts from zero — you re-explain the stack, the folder layout,
  the "we never do X here" — again and again.
- The AI says "done!" and you find out later the tests were broken.
- You correct the same mistake for the tenth time, because chats forget.

With this template in your project:

- **The AI knows your project at message one.** Stack, commands, conventions —
  loaded automatically before you type anything.
- **"Done" is checked by a machine, not claimed.** When the AI tries to finish,
  a script runs your linter and tests. Red tests = the AI is sent back to fix
  them. It literally cannot stop until things pass.
- **Corrections become permanent.** Type `/retro` at the end of a session, and
  every correction you made gets written into the rule files. That mistake never
  happens again — in any future session, on any machine.
- **Hard safety limits.** The AI cannot read your `.env` secrets, force-push,
  or run `rm -rf` — even if a malicious web page tells it to.

## 2. When should I NOT use it?

Honesty first — skip this template when:

- **It's throwaway work.** A quick script or prototype you'll delete tomorrow?
  Just use the AI raw. Setup isn't worth it.
- **It's not a coding project.** This is built for software work.
- **You won't fill in the placeholders.** The files ship with `<placeholders>`.
  Until they contain your project's real facts, you get maybe 20% of the value.
  The good news: the AI fills them in for you (next section).

And one situation that's not "don't use it" but "use it differently":
**the project already has its own AI setup** (`CLAUDE.md` or `AGENTS.md` with
real content). Never copy this template over it — you'd erase learned knowledge.
Use the merge path in [section 4](#4-setup--existing-project-merge-dont-overwrite)
instead of the quick start.

## 3. Setup — NEW project

1. **Copy everything** in this folder into your project's root folder.
   (If you cloned this template from git: delete the `.git` folder inside the
   copy, so your project starts its own history. You can always re-link later
   to receive template updates — see "Pull template updates" in section 13.)
2. **Fill in the AI's project brief.** Open Claude Code in the project and say:
   > *Read the codebase and fill in CLAUDE.md with the real stack, commands, and architecture.*
   Skim what it wrote and fix anything wrong.
   **Why not `/init`?** Claude's built-in `/init` command does a similar job,
   BUT it generates its own CLAUDE.md layout — which can fight with the
   template's structure (the rule imports, the sections). The sentence above
   makes the AI fill the template's file *in place*, keeping everything wired.
   If you prefer `/init`, run it, then ask the AI to *merge its output into the
   template's CLAUDE.md* — never replace the file. (Same warning for Codex's
   `/init`, which would overwrite AGENTS.md — see section 10.)
   For a brand-new empty project with no code yet: fill the placeholders by
   hand as the project takes shape.
3. **Fill in `CLAUDE.local.md`** with things specific to YOUR machine: local
   ports, database URL, personal preferences. This file never goes into git.
4. **Trim what doesn't fit this project.** Rewrite or delete rule files that
   don't match your stack, remove unused servers from `.mcp.json`, and put your
   real deploy commands into `.claude/commands/deploy.md`. Leave skills and
   agents you don't need — they cost almost nothing while unused (explained in
   section 8).
5. **Activate the design setup for this project's type** (one command, once —
   the skills ship inert in `.claude/skills-optional/`; see CATALOG's Design
   section for what each does):

   | Project type | Run |
   |---|---|
   | Web app / site | `bash scripts/activate-design.sh xias` (quality gates — the Impeccable generator is already active by default) |
   | Mobile app (Flutter/native) | `bash scripts/activate-design.sh apple-design` (HIG reviewer, clone-on-activate) |
   | Backend / CLI / library | Nothing — skip this step |
   | Prefer a different look generator | `activate-design.sh off impeccable` then `activate-design.sh ui-ux-pro-max` (or `taste`) — one generator per project |

   (Windows PowerShell: run through Git Bash —
   `& "C:\Program Files\Git\bin\bash.exe" scripts/activate-design.sh xias`)
6. **Optionally install day-one tools** from [CATALOG.md](CATALOG.md) — typical
   picks: `superpowers` (once per computer) and `context7` (per project). See
   section 12.
7. **Verify it loaded:** type `/install` in Claude Code — if a menu of tools
   appears, everything works. Using Codex too? Do the one-time steps in
   section 11.

## 4. Setup — EXISTING project (merge, don't overwrite!)

For a project that already used Claude or Codex: blind copy-paste is the one
destructive move — template placeholders would erase learned knowledge. Merge:

1. **Commit everything first**, so the template's arrival is one reviewable
   change you can undo.
2. **Take inventory:** does the project have `CLAUDE.md`, `AGENTS.md`, a
   `.claude/` folder, `.cursor/rules/`, `.mcp.json`?
3. **Merge the memory files (the critical step):** whichever of
   CLAUDE.md/AGENTS.md holds real content stays as the **master** — add to it
   what the template brings (the `@.claude/rules/` imports, the hygiene and
   constraints sections). The other file becomes the one-line pointer. One
   master + one pointer, never two full files.
4. **Copy the additive folders** — `rules/`, `commands/`, `skills/`, `agents/`,
   `hooks/`, `.codex/`, `.agents/`, `scripts/`, `CATALOG.md`. They're new files,
   so they're safe; on name collisions, keep the project's version and merge by
   hand.
5. **Merge configs carefully:** add the template's deny-rules and hook wiring
   into their existing `settings.json` (keep their allow-list — it reflects
   real usage); add missing MCP servers without deleting theirs; append the
   `.gitignore` lines.
6. **Check your tests pass BEFORE the done-gate arms.** If the suite is
   currently red, the gate will block every task until it's green — fix the
   suite first, or temporarily set `SKIP_DONE_GATE=1`.
7. Activate the design setup for the project's type (section 3, step 5), do the
   per-computer Codex steps from section 11 (the Codex mirror in
   `.agents/skills/` is already committed, no sync needed), then verify
   (`/install` in Claude, `$retro` in Codex).
8. **First week: run `/retro` after each session.** Everything you've been
   re-typing in prompts for months finally lands in rule files, permanently.

**The lazy correct way for steps 2–5:** put the template folder next to the
project and tell Claude Code: *"Merge ../Claude_Codex_template into this project
without losing any existing instructions — existing content wins on every
conflict."*

---

## 5. The one idea that explains everything

Every file in this template is one of two kinds:

| Kind | What it means | Examples |
|---|---|---|
| **Advice the AI reads** | Instructions the AI follows — very reliable, but still "following instructions" | `CLAUDE.md`, rules, skills |
| **Guarantees a machine enforces** | Scripts and settings the *system* runs — the AI can't skip or forget them | hooks, permission limits |

Rule of thumb: preferences and knowledge go in advice files; anything that must
**never** be skipped (secret-blocking, the tests-must-pass gate) goes in
guarantees. This template gives you both, pre-wired.

And one more split worth knowing: **some files are for the AI, some are for
you.** The AI automatically reads `CLAUDE.md`, the rules, and skills — it does
NOT read this README. So this file can be long and chatty for free; the
AI-facing files stay short because the AI re-reads them every single session,
and every line there costs a little bit of its attention each time.

## 6. What's in the folder

```
your-project/
├── README.md            ← this file (for humans — the AI ignores it)
├── CLAUDE.md            ← the AI's project brief: stack, commands, architecture
├── CLAUDE.local.md      ← same idea, but personal/machine-specific (not in git)
├── AGENTS.md            ← tells Codex (and Cursor/Gemini) to read CLAUDE.md
├── CATALOG.md           ← menu of 40 optional tools, installed via /install
├── .mcp.json            ← external tools for the AI (GitHub, databases...)
├── .gitignore           ← keeps personal files and secrets out of git
├── .agents/skills/      ← Codex's copy of skills (auto-generated — don't edit)
├── .codex/config.toml   ← wires the safety hooks into Codex
├── scripts/
│   └── sync-codex.sh    ← regenerates the Codex copies (auto-run by a hook on skill edits)
└── .claude/
    ├── settings.json        ← permissions (what the AI may/may not do) + hook wiring
    ├── settings.local.json  ← your personal overrides (not in git)
    ├── rules/               ← always-loaded conventions, one topic per file
    │   ├── code-style.md    ←   only NON-obvious style rules (the linter owns the rest)
    │   ├── pr.md            ←   branches, commit messages, PR habits
    │   ├── workflow.md      ←   plan-first (council-reviewed plans), test-first, done criteria
    │   ├── delivery.md      ←   feature done → review → merge to develop → next task
    │   └── reporting.md     ←   human-readable briefings, progress updates, context cleanup
    ├── commands/            ← shortcuts you type (one file = one command)
    │   ├── deploy.md        ←   /deploy — guarded deployment checklist
    │   ├── install.md       ←   /install — install tools from CATALOG.md
    │   └── retro.md         ←   /retro — write session lessons into the rules
    ├── skills/              ← deep knowledge loaded only when relevant
    │   ├── testing-patterns/
    │   │   └── SKILL.md     ←   how tests are written in this project
    │   ├── api-conventions/
    │   │   └── SKILL.md     ←   API design rules (loads only for API work)
    │   ├── project-structure/
    │   │   └── SKILL.md     ←   best-practice folder layouts per stack (loads when scaffolding)
    │   ├── ui-quality/
    │   │   └── SKILL.md     ←   premium UI baseline, auto-applied to any screen work
    │   ├── motion/
    │   │   └── SKILL.md     ←   animation rules (durations, easing, Flutter & web)
    │   ├── impeccable/      ←   vendored design-language skill (web + native UI,
    │   │                        auto-triggers; project design systems outrank it)
    ├── skills-optional/     ← design skills SHIPPED but inert — activate per project
    │   ├── xias/            ←   52 design gates + assets (web enforcer)
    │   ├── ui-ux-pro-max/   ←   alternative generator (7 skills)
    │   ├── taste/           ←   alternative generator (art direction)
    │   │                        → bash scripts/activate-design.sh <name>
    │   │                        (apple-design: same script, clone-on-activate)
    │   └── superpowers/     ←   the superpowers PLUGIN, vendored: 15 skills (TDD,
    │                            debugging, planning...) load from the repo itself
    ├── agents/              ← specialist reviewers the AI can hand work to
    │   ├── code-reviewer.md     ←   senior code reviewer (read-only, fresh context)
    │   └── security-auditor.md  ←   defensive security audits (read-only)
    └── hooks/               ← the guarantee scripts
        ├── validate-code.sh ←   after every edit: blocks secrets, flags debug junk
        └── done-gate.sh     ←   on "I'm finished": lint + tests must pass, or back to work
```

## 7. Which file do I use for what?

The quick decision table — when you want the AI to do something, this tells you
where it goes:

| I want the AI to... | Put it in |
|---|---|
| Always know a fact about the project | `CLAUDE.md` |
| Always follow a convention | `.claude/rules/` |
| Know something only on MY machine | `CLAUDE.local.md` |
| Run a repeatable workflow when I trigger it | `.claude/commands/` |
| Apply deep knowledge only when the task needs it | `.claude/skills/` |
| Hand work to a focused specialist | `.claude/agents/` |
| **Guarantee** something happens, no exceptions | `.claude/hooks/` |
| Stop asking permission for safe commands | `settings.json` allow-list |
| Never be able to do something dangerous | `settings.json` deny-list |
| Use an external service (GitHub, a database...) | `.mcp.json` |

## 8. What each piece does (and when the AI reads it)

### `CLAUDE.md` — the project brief *(read: every session, always)*
The first thing the AI reads. Project description, essential commands,
architecture notes, hard constraints. The `@.claude/rules/...` lines near the
bottom pull the rule files in automatically.
**Golden rule: keep it short.** It's loaded into every conversation, and the
official guidance is blunt: a bloated file gets *ignored* — important rules
drown in noise. For every line, ask *"would removing this cause mistakes?"* If
not, cut it. Helpers: `/context` shows what actually loaded; `/doctor` proposes
cuts for anything the AI could figure out from the code itself.

### `CLAUDE.local.md` — your personal brief *(read: every session, your machine only)*
Same idea, but git-ignored: local ports, your database URL, personal
preferences. Teammates each have their own version, so they never conflict.

### `AGENTS.md` — the bridge to other tools *(read by Codex, Cursor, Gemini)*
Those tools don't read CLAUDE.md by name — they read AGENTS.md (an open
standard). Ours is a **pointer**: "read CLAUDE.md and the rules." One source of
truth, every tool in sync. Never write content into the pointer itself — edit
CLAUDE.md and the rules. It also tells Codex where to SAVE new rules, so
lessons learned in Codex land in the shared files too.

### `.mcp.json` — external tools *(loaded at startup, after a one-time approval)*
MCP is the standard way to give the AI extra tools: GitHub, databases, browsers,
APIs. Because this file is committed, every teammate gets the same tools.
**Secrets never go in this file** — reference them as environment variables
(like `${GITHUB_TOKEN}`) and set the variable on each machine.

### `.claude/settings.json` — permissions & hook wiring *(always active)*
Two jobs:
- **Allow-list:** safe commands (`npm test`, `git diff`...) run without asking
  you every time — fewer interruptions.
- **Deny-list:** dangerous things (`rm -rf`, reading `.env`, force-push) are
  blocked outright. **Deny always beats allow.** This is enforcement, not advice.
It also wires the hook scripts to events (run this after every edit, run that
when the AI tries to stop).
`settings.local.json` is the same thing but personal and git-ignored — your
overrides win on your machine.

### `.claude/rules/*.md` — conventions *(read: every session, via CLAUDE.md)*
One topic per file. Keep each file to rules a good engineer would NOT already
follow by default — research shows restating the obvious adds cost without
improving results. Topic knowledge that's only sometimes relevant (like API
conventions here) belongs in `skills/` instead. Add new rule files freely and
reference them from CLAUDE.md with `@.claude/rules/your-file.md`.

### `.claude/commands/*.md` — your shortcuts *(run only when YOU type them)*
Each `.md` file becomes a `/command` named after the file. Inside the file,
`$ARGUMENTS` stands for whatever you type after the command — so
`/deploy production` runs deploy.md with `$ARGUMENTS` = "production". The
`allowed-tools` line at the top of each file limits what the command may touch
(for example, `/retro` can edit rule files but a review command could be locked
to read-only). Edit the file to change behavior; delete it to remove the
command; copy the folder to another project and the commands exist there too.

### `.claude/skills/<name>/SKILL.md` — on-demand knowledge *(loaded when relevant)*
The clever part: the AI only keeps each skill's two-line **description** in mind.
The full content loads *only* when a task matches it. That's why unused skills
cost almost nothing — 20 skills sitting idle ≈ a few hundred words of overhead,
total. Deep knowledge, near-zero daily price. The description is the trigger, so
write it precisely ("Use when writing or reviewing tests"), or the skill may
fire at the wrong time. A skill folder can also hold extra reference files and
scripts next to SKILL.md.

### The skills shipped in this template — what each one is for

You never invoke most of these — they fire on their own when the work matches.
This table is the reminder of what's watching over each kind of work:

**Always active (every project, both AIs):**

| Skill | Fires when you... | What it does for you |
|---|---|---|
| `ui-quality` | touch any screen/component | Premium baseline: hierarchy, spacing, states, a11y — self-audited before you see it |
| `motion` | touch any animation/transition | The timing/easing numbers, reduced-motion, Flutter & web patterns |
| `impeccable` | do any frontend design work | The full design language: polish, critique, audit, animate modes (project design systems outrank it) |
| `testing-patterns` | write or review tests | Your test conventions: builders, mocking rules, anti-patterns |
| `api-conventions` | design/modify an API | Endpoints, error envelope, validation, versioning rules |
| `project-structure` | scaffold a project/module | The recognized folder layout per stack; when clean architecture is worth it |
| `llm-council` | say "council this" / big decisions | 5 AI advisors analyze independently, peer-review, give a verdict — plans use it automatically |
| **superpowers** (15 skills) | ...the big ones: | `systematic-debugging` (any bug: root-cause process, no guess-loops) · `test-driven-development` (red→green discipline) · `brainstorming` (before new features) · `writing-plans`/`executing-plans` (plan workflow) · `verification-before-completion` (evidence before "done") · `dispatching-parallel-agents` (parallel work) |

**Shipped inert — activate per project type** (`bash scripts/activate-design.sh <name>`, see section 3 step 5):

| Skill | Activate in... | What it adds |
|---|---|---|
| `xias` | web projects | 52 objective design gates (WCAG, keyboard, overflow...) that fail instead of flattering |
| `apple-design` | mobile projects | Reviews screens against Apple's real HIG, speaks Flutter (clone-on-activate) |
| `ui-ux-pro-max` / `taste` | only if replacing impeccable | Alternative design generators — one generator per project, the script enforces it |

(The typed commands — `/retro`, `/install`, `/deploy` — are in section 10; the
optional *tools* catalog is section 12.)

### `.claude/agents/*.md` — specialist reviewers *(used when delegating)*
Separate workers with their own instructions, their own allowed tools, and —
key point — **their own working memory**, separate from your conversation. The
`description` tells the AI when to hand work over. Both included agents are
read-only on purpose: they report findings, you decide. Fresh context matters —
a reviewer that didn't write the code judges it honestly.

### `.claude/hooks/*.sh` — the guarantees *(run automatically by the system)*
Plain scripts — not AI — that fire on events:
- **validate-code.sh** runs after every file edit: blocks hardcoded secrets
  (the AI is forced to fix it immediately), warns about leftover
  `console.log`/`print` debug lines, and can auto-format (a Prettier line is
  included, commented out — enable it if you use Prettier).
- **done-gate.sh** runs when the AI tries to finish: lint, typecheck, and tests
  must pass, or the AI is sent back with the error output. To pause it
  temporarily (e.g. a codebase with known-red tests), set `SKIP_DONE_GATE=1`.
  It auto-detects npm projects; for other stacks (PHP, Python, Rust...), adjust
  the marked section at the top of the script.
How blocking works: a hook that exits with code 2 feeds its message back to the
AI as something it must fix — that's the whole enforcement mechanism.
On Windows, hooks run through Git Bash, which comes with Git — nothing to install.

## 9. The three habits that make it compound

The template works on day one, but these habits are where the value grows:

1. **`/retro` before you close a work session.** It re-reads the conversation,
   finds every correction and lesson, checks they're not already covered, and
   writes them into the right rule file. Twenty sessions later, your rules
   contain twenty sessions of experience. The single most valuable habit.
2. **`/code-review` before merging anything significant.** That's the built-in
   reviewer — it's strong (multiple effort levels, double-checks its own
   findings, can fix what it finds with `--fix`). We deliberately did NOT make
   a custom review command: the built-in hunts bugs better, and convention
   compliance is already covered by the rules plus the `code-reviewer` agent.
   For releases or anything touching auth/payments, also say
   *"run the security-auditor agent."*
3. **Fresh session per task.** Finish a feature → commit → `/retro` → new
   session for the next thing. New sessions are cheap here (everything
   important lives in files, not chat history), and short sessions keep the AI
   sharp and your costs down. Mid-task, stay in the session — context about
   work in progress is valuable.

Everything else — plans before big changes, tests before fixes, interviews
before big features — is written into `rules/workflow.md`, and the AI follows
it automatically.

## 10. Commands reference

### Custom commands in 30 seconds

```
one file                       what you type              what you type
in the template                in CLAUDE CODE             in CODEX

.claude/commands/retro.md  →   /retro                     $retro
.claude/commands/deploy.md →   /deploy                    $deploy
.claude/commands/install.md →  /install                   $install
```

Four facts, that's all there is to it:

1. **A custom command is just a text file** in `.claude/commands/` containing
   instructions. The file name becomes the command name.
2. **In Claude Code you type it with a slash:** `/retro` + Enter. The menu that
   pops up when you type `/` will suggest it.
3. **In Codex you type the same command with a dollar sign:** `$retro`.
   (Why different? Codex receives them as "skills", its own format — the sync
   script converts them automatically. Same content, different trigger key.)
4. **Commands only run when YOU type them** — the AI never runs them on its own.
   And anything after the name is passed into the instructions: `/retro testing`
   runs retro focused on testing.

Don't confuse them with **built-in commands** (`/clear`, `/cost`, `/init`...):
those ship with the tools and exist everywhere. The three above exist only in
projects that carry this template — because the files do.

### The template's commands

| In Claude | In Codex | What it does | Examples |
|---|---|---|---|
| `/retro` | `$retro` | Writes this session's lessons into the rule files | `/retro` · `/retro testing` (focus on one topic) |
| `/install` | `$install` | Shows/installs optional tools from CATALOG.md | `/install` (menu) · `/install context7` · partial names work |
| `/deploy` | `$deploy` | Checklist: clean tree → lint → tests → build, then deploy | `/deploy` (staging) · `/deploy production` (asks confirmation) |

**Built into Claude Code** (every project, no template needed) — the ones worth
knowing: `/code-review` (the serious bug hunt), `/init` (generate CLAUDE.md —
see the warning in section 3 before using it here), `/clear` (fresh session),
`/compact` (shrink a long conversation), `/cost` (what you've spent), `/memory`
(edit the memory files), `/permissions`, `/agents`, `/mcp`, `/plugin` (browse
installable plugins), `/doctor`. Type `/` to see everything.

**Built into Codex** — closest equivalents: `/review` (its reviewer), `/plan`,
`/compact`, `/diff`, `/status` and `/usage`. Two Codex commands need care here:
- ⚠️ **Don't run Codex's `/init` in this project** — it generates a fresh
  AGENTS.md and would overwrite our pointer.
- 💡 **Codex's `/import`** can carry your Claude Code setup into Codex on a
  fresh machine — useful when setting up a new laptop.

## 11. Using it with Codex too (and Cursor, Gemini...)

You don't choose one tool — the template serves both from the same files.
**The rule that makes it work: `.claude/` is the single source of truth;
`.agents/` and `.codex/` are generated projections of it.** Edit sources, never
projections.

| What | Claude reads | Codex reads | Kept in sync by |
|---|---|---|---|
| Memory & rules | `CLAUDE.md` + `.claude/rules/` | `AGENTS.md` (pointer → same files) | Nothing — same files |
| Skills | `.claude/skills/` | `.agents/skills/` | `scripts/sync-codex.sh` |
| Workflows | `/deploy` `/install` `/retro` | `$deploy` `$install` `$retro` | `scripts/sync-codex.sh` |
| Hooks (done-gate, secrets) | `settings.json` → `.claude/hooks/` | `.codex/config.toml` → same scripts | Nothing — same scripts |
| MCP servers | `.mcp.json` | Codex's own config | One-time registration per machine |

**The sync command:**

```bash
bash scripts/sync-codex.sh
```

It copies every `.claude/skills/*` folder into `.agents/skills/` and converts every
`.claude/commands/*.md` into a Codex skill (`$deploy`, `$retro`, ...). It is
idempotent and only ever writes inside `.agents/skills/`, so it is always safe
to run. Run it from the repo root.

**When to run it:**

| Situation | Run it? |
|---|---|
| Fresh copy of the template into a new project | No — `.agents/skills/` is committed and already up to date |
| Claude edited a skill or command in a session | No — the `sync-codex-on-edit.sh` hook already ran it |
| You edited a skill or command by hand in your editor | **Yes** |
| You copied a skill folder in from another project | **Yes** |
| You deleted a skill or command | **Yes** (the hook only fires on edits) |
| You only use Claude Code, never Codex | Never — you can delete `.agents/` |

Then commit `.agents/skills/` together with the `.claude/` change. Generated
files carry a "do not edit this copy" banner.

**One-time steps per computer, in Codex:**
1. Register your MCP servers (`codex mcp add ...`, matching what's in `.mcp.json`).
2. Open Codex in the repo and run `/hooks` — review and trust the two project
   hooks (Codex requires a one-time approval for safety).
3. Restart the Codex session, then verify: type `$retro` — it should appear in
   the popup.

**Memory discipline (important):** project knowledge lives in the repo files,
NEVER in a tool's private "memory" feature (Codex `/memories`, Claude's personal
memory). Private memory is invisible to the other tool and to your other
computers. When you want something remembered, say *"add it to the rules"*, not
just *"remember this."* This is also written into the rules, so the AIs enforce
it on themselves. Note: a rule changed in one tool reaches the other at its
**next** session — these files load at session start.

**What still differs (the honest ~5–10%):**
- Claude's subagents (code-reviewer, security-auditor) have no exact Codex
  equivalent — in Codex, use its built-in `/review` for a second opinion.
- Permissions: Claude's allow/deny lives in `settings.json`; mirror the deny
  list once per machine in Codex's own approval/sandbox settings.
- Hook event details differ slightly between tools; both scripts handle it
  gracefully, but test the done-gate once per tool on a new stack.
- Same instructions, different models — behavior will never be byte-identical.
- Cursor/Gemini get the knowledge layer via AGENTS.md; the deeper adapter
  (skills sync, hook wiring) is Claude+Codex only.

## 12. Optional extras, when you need them

[CATALOG.md](CATALOG.md) lists 40 verified ecosystem tools — browser testing,
live library docs, cost tracking, codebase indexing — each with what it is, when
you'd want it, and a one-line install.

```
/install               ← shows the menu, grouped by category
/install context7      ← installs that tool (latest version, from GitHub)
/install ui-ux         ← partial names work too
```

The AI looks the tool up, runs the right kind of install (MCP server, skill
copy, CLI), and verifies it worked. One exception: **plugins** (like
superpowers) install through Claude Code's own `/plugin` command, which only you
can type — for those, `/install` hands you the exact lines to paste.

Don't install ahead of need. When a project hits a real problem, grab the tool
that solves it — 30 seconds, always the current version, and the template stays
tiny. The catalog also marks which memory tools are shared across both AIs (🔁)
versus locked to one tool (🔒).

## 13. Growing and maintaining it

- **New rule:** add a file under `.claude/rules/`, reference it from `CLAUDE.md`
  with `@.claude/rules/your-file.md` (or just let `/retro` do it).
- **New command:** drop a `.md` file in `.claude/commands/` → instantly a
  `/command`.
- **New skill:** a folder in `.claude/skills/` with a `SKILL.md` (two-line
  frontmatter: `name` + a precise `description`).
- **New agent:** a `.md` file in `.claude/agents/` with `name`, `description`,
  and `tools` at the top.
- **New hook:** script into `.claude/hooks/`, wire it in `settings.json` (and in
  `.codex/config.toml` for Codex).
- **After any skill/command change:** commit `.agents/skills/` too (the hook
  regenerates it; run `bash scripts/sync-codex.sh` only for manual edits).
- **The vendored superpowers plugin** (`.claude/skills/superpowers/`) loads from
  the repo on every machine once the folder is trusted — no install needed. If
  you ALSO install superpowers from its marketplace (`/plugin`), the marketplace
  copy wins and auto-updates; the vendored one is the fallback for fresh
  machines. To update the vendored copy, re-clone the repo and copy it over the
  folder (excluding `.git`), then re-run the sync. The sync projects the
  plugin's inner skills into `.agents/skills/` so Codex gets them too
  (invoke with `$test-driven-development`, `$systematic-debugging`, ...).
- **Prune as often as you add.** A focused 30-line rule file beats a 300-line
  manifesto the AI has to wade through every session. `/doctor` proposes cuts;
  `/context` shows what's actually loading.
- **Pull template updates into an existing project** (works even though you
  deleted the template's `.git` when copying — the project's own repo just
  re-links). One-time setup per project:
  ```bash
  git remote add template <your-template-repo-url>
  git fetch template
  git merge template/main --allow-unrelated-histories -X ours
  ```
  `-X ours` keeps YOUR version of every shared file (your CLAUDE.md, adapted
  hooks...) and brings in only new template files — review, run the sync,
  commit. Every later update is just `git fetch template && git merge
  template/main`: a normal merge where only real line-level overlaps conflict.

**Committed (shared via git) vs. personal (git-ignored):**

| Shared with the team | Stays on your machine |
|---|---|
| `CLAUDE.md`, `AGENTS.md`, `CATALOG.md` | `CLAUDE.local.md` |
| `.mcp.json`, `.claude/settings.json`, `.codex/` | `.claude/settings.local.json` |
| `rules/`, `commands/`, `skills/`, `agents/`, `hooks/`, `.agents/`, `scripts/` | `.env` files |

The included `.gitignore` already enforces this split.

---

## Further reading (official sources this template is built on)

- [Claude Code best practices](https://code.claude.com/docs/en/best-practices) —
  Anthropic's own guide; the done-gate, plan-first, and subagent patterns come from here
- [CLAUDE.md / memory](https://code.claude.com/docs/en/memory) ·
  [Slash commands](https://code.claude.com/docs/en/slash-commands) ·
  [Hooks](https://code.claude.com/docs/en/hooks) ·
  [Skills](https://code.claude.com/docs/en/skills) ·
  [Subagents](https://code.claude.com/docs/en/sub-agents)
- Codex: [Agent Skills](https://developers.openai.com/codex/skills) ·
  [Hooks](https://developers.openai.com/codex/hooks) ·
  [Slash commands](https://developers.openai.com/codex/cli/slash-commands.md)

*Questions this file didn't answer? Open Claude Code in the project and ask —
it can read every file here and explain what anything does.*
