---
name: install
description: Install a tool from CATALOG.md by name (e.g. /install context7). No name = list what's available.
---

> Mirrored from .claude/commands/install.md by scripts/sync-codex.sh — edit the
> source file and re-run the script; do not edit this copy.
> $ARGUMENTS below means: the text the user typed after $install.


# /install — Install a tool from the catalog

Target: $ARGUMENTS

## If no name was given

Read `CATALOG.md` and print a compact menu: each tool's name, one-line purpose, and
install type icon, grouped by category. End with: "Run `/install <name>` to install one."
Do nothing else.

## If a name was given

1. Find the tool's entry in `CATALOG.md` (match loosely: case-insensitive, ignore
   hyphens, accept prefixes — "context7", "Context7", "ui-ux" for ui-ux-pro-max all work).
   If nothing matches, show the closest 3 names and stop.
2. Tell the user in one line what it is and what the install will do.
3. If the entry has a ⚠️ flag, check the repo's README first and confirm the install
   command is still current before running anything.
4. Install according to the entry's type:
   - **🔧 MCP server / 💻 CLI / 📁 skill copy:** run the entry's install command(s)
     yourself with Bash. For skill copies, clone into a temp folder, copy only the
     skill folder into `.claude/skills/`, then delete the clone.
   - **🔌 Plugin:** you cannot run `/plugin` commands — print the exact lines in a
     code block and tell the user to paste them into Claude Code themselves.
   - **📖 Reading material:** nothing to install — give the link and a one-line
     summary of what to read there.
   - Anything needing an API key (e.g. firecrawl): ask the user for the key name to
     use as an env var; never ask them to paste the key value into chat.
5. Verify: for MCP, run `claude mcp list` and confirm it appears; for a skill, confirm
   the folder exists in `.claude/skills/`; for a CLI, run `<tool> --version` or
   equivalent. Report the result in one or two lines.
6. Remind the user: plugins and CLIs are per-machine (reinstall on each laptop);
   MCP servers and skills are per-project.
