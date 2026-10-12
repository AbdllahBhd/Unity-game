---
name: retro
description: End-of-session retrospective — mine this conversation for corrections and lessons, and write them into the rule files so they're never repeated
---

> Mirrored from .claude/commands/retro.md by scripts/sync-codex.sh — edit the
> source file and re-run the script; do not edit this copy.
> $ARGUMENTS below means: the text the user typed after $retro.


# /retro — Learning Flywheel

Review THIS ENTIRE CONVERSATION and extract every durable lesson, then persist each
one into the right file. Scope hint (optional): $ARGUMENTS

## What counts as a lesson

1. **Corrections:** every time the user corrected something I did or rejected an
   approach ("no, we use X", "don't do that", an edit they redid differently).
2. **Failures:** anything that failed on the first attempt where the cause is
   generalizable (wrong command, wrong assumption about the stack, flaky pattern).
3. **Stated preferences:** rules the user expressed in passing ("I prefer...",
   "always...", "never...").
4. **Discovered project facts:** non-obvious things learned about the codebase that
   future sessions will need again (quirks, gotchas, "X must happen before Y").

## What does NOT count

- One-off decisions specific to today's task.
- Anything already covered by an existing rule (check first!).
- Vague impressions without a concrete, actionable phrasing.

## Process

1. Scan the conversation and list candidate lessons.
2. For each candidate, read the existing rules (`.claude/rules/*.md`) and `CLAUDE.md`
   to check it isn't already covered. Skip duplicates; sharpen near-duplicates in place.
3. Route each new lesson to the right home:
   - Coding conventions → `.claude/rules/code-style.md`
   - API/design decisions → `.claude/skills/api-conventions/SKILL.md`
   - Git/PR habits → `.claude/rules/pr.md`
   - Process/workflow lessons → `.claude/rules/workflow.md`
   - Project facts → the relevant section of `CLAUDE.md`
   - Machine-specific → suggest for `CLAUDE.local.md` (describe it; the user adds it)
4. Write each lesson as ONE imperative line, optionally with a short "why". Match the
   style of the file it goes into.
5. Report: a compact list of what was added and where, what was skipped as duplicate,
   and anything ambiguous that needs the user's call.

Be selective — five sharp rules beat twenty mushy ones. If the session produced no
durable lessons, say exactly that; do not invent rules to seem useful.
