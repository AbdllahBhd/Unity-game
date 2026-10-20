# Agent Instructions

> This file is read automatically by Codex, Cursor, Gemini CLI, and other tools
> that support the AGENTS.md standard. Claude Code reads CLAUDE.md instead.
> To avoid maintaining two copies, this file is a pointer:

**All project instructions live in [CLAUDE.md](CLAUDE.md). Read that file now, and follow it as if its content were written here.**

Also read the convention files it references:

- [.claude/rules/code-style.md](.claude/rules/code-style.md)
- [.claude/rules/pr.md](.claude/rules/pr.md)
- [.claude/rules/workflow.md](.claude/rules/workflow.md)
- [.claude/rules/delivery.md](.claude/rules/delivery.md)
- [.claude/rules/reporting.md](.claude/rules/reporting.md)

On-demand knowledge and workflows are available to you natively as skills in
`.agents/skills/` — list that folder to see what exists (project skills,
workflow commands like `$deploy`/`$install`/`$retro`, and the superpowers
discipline skills such as `$test-driven-development` and
`$systematic-debugging`). These are generated copies of `.claude/skills/` and
`.claude/commands/` — when updating a skill, edit the source under `.claude/`
and run `bash scripts/sync-codex.sh` (Windows: `scripts\sync-codex.cmd`);
never edit `.agents/skills/` directly.

**Where to save lessons and new rules:** when the user corrects you or states a
rule, write it into the matching file — coding conventions →
`.claude/rules/code-style.md`, git/PR habits → `.claude/rules/pr.md`,
process → `.claude/rules/workflow.md`, API design →
`.claude/skills/api-conventions/SKILL.md`, project facts → `CLAUDE.md`.
Do NOT store project knowledge in tool-private memory (e.g. /memories) — other
tools and machines read only these repo files.

> Maintainers: never put content here — edit CLAUDE.md and the rules files.
> One source of truth; this pointer keeps every AI tool in sync.
