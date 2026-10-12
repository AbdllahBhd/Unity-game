# Engineering Workflow Rules

> Loaded via CLAUDE.md. Process discipline: how work gets planned, built, verified,
> and reviewed. These rules apply to Claude, Codex, and any agent reading AGENTS.md.

## Single source of truth (multi-tool)

- Durable knowledge lives ONLY in repo files: `CLAUDE.md`, `.claude/rules/`,
  `.claude/skills/`, `SPEC.md`, `task_plan.md`. Never store project rules or
  lessons in any tool's private memory (Claude user memory, Codex /memories) —
  the other tool and other machines can't see it there.
- When asked to "remember" something project-related, write it into the right
  repo file (see the routing in `/retro`), not into private memory.
- When choosing a memory/indexing tool, prefer one that stores its state as
  files in the repo — that state is then shared across tools and laptops via git.

## Interview → spec (large features)

- For a large or fuzzy feature, interview the user BEFORE planning: ask about
  technical approach, UI/UX, edge cases, and tradeoffs — dig into the hard parts
  they might not have considered, skip the obvious.
- Write the result to `SPEC.md`: self-contained, naming the files and interfaces
  involved, what is OUT of scope, and an end-to-end verification step.
- Recommend executing the spec in a fresh session with clean context.

## Plan first (non-trivial work)

- Any task that touches **more than 2 files**, adds a feature, or changes behavior
  starts with a short written plan BEFORE any code: what changes, which files, how
  it will be verified. Wait for the user's go-ahead on the plan.
- For multi-session work, keep the plan in `task_plan.md` at the repo root and update
  it as steps complete — plans must survive a restart; memory does not.
- Trivial fixes (typo, one-liner, rename) skip planning. When unsure, plan.

## Test-driven by default

- For new behavior: write the failing test FIRST, see it fail, implement, see it pass.
- For bug fixes: write a test that reproduces the bug before touching the fix.
- Never write tests after the fact that merely assert what the code already does.
- A red/green signal beats re-reading your own code. Iterate against tests, not vibes.

## Definition of done (enforced by hooks/done-gate.sh)

A task is done ONLY when all of these are true — never claim done otherwise:

1. Lint passes with no new warnings.
2. Typecheck passes (if the project has one).
3. The full test suite is green.
4. The diff has been self-reviewed: no debug logs, no dead code, no unrelated changes.

If a gate cannot run (e.g. no test script yet), say so explicitly instead of
implying it passed.

## Context discipline

- Do not read whole directories "to get familiar" — delegate broad exploration to a
  subagent (Explore) and keep only the conclusions in the main conversation.
- Read only the parts of files relevant to the task when files are large.
- Long research, log-dumping, or multi-file audits belong in subagents whose reports
  come back small.

## Adversarial review

- After completing any significant change, run the `code-reviewer` agent on the diff.
  The author must not be the only reviewer — the agent runs with fresh context and
  judges the diff on its own merits.
- Before a release or when touching auth/payments/input-handling, also run the
  `security-auditor` agent.
- Treat review findings as work items: fix or explicitly rebut each one; never
  silently ignore them.

## When things go wrong

- Two failed attempts at the same fix = stop, re-read the actual error, and question
  the diagnosis instead of trying a third variation of the same guess.
- Never "fix" a failing test by weakening the assertion unless the test is provably
  wrong — say so and explain why.
- Never disable a linter rule inline to make a warning disappear without flagging it.
