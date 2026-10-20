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

## Plan quality (large features & new projects)

- A plan is a professional document, straight to the point: **Objective** (one
  sentence) · **In scope / Out of scope** · **Approach** (the decision and its why,
  not a survey of options) · **Ordered steps, each ending with how that step is
  verified** · **Files/components touched** · **Risks & open questions**.
- For a NEW project (or new module), the plan includes the folder structure —
  follow the recognized best-practice layout for the stack via the
  `project-structure` skill. Clean architecture only where it earns its weight;
  the skill says when.
- **Adversarial plan review before presenting:** for large features and new
  projects, have the draft plan reviewed in a fresh context before showing it —
  the `llm-council` skill when available, otherwise a subagent prompted as a
  critical plan reviewer (gaps, wrong assumptions, missing verification — not
  style). The review also checks every task's "Done when" for the two failure
  modes: too weak (satisfiable without the real work) and wrong/too strict
  (tests the wrong thing, fences out files the task must touch). Address the
  findings, then present the plan noting it was reviewed and what changed.
  Present it only when it would pass a senior engineer's bar.

## Per-task goals (acceptance criteria in the plan)

- Every task in `task_plan.md` carries its own `Done when:` with three clauses,
  all checkable from files or command output:
  1. **Proof of the new behavior** — named test/command + expected result.
  2. **Nothing broken** — the project's standing gates (analyzer, suite).
  3. **Scope fence** — "no files changed outside <paths>".
- A task may be marked `[x]` ONLY when its Done-when evidence was produced and
  shown. A checked box means "evidence existed", never "felt finished".
- If execution reveals a Done-when is wrong (e.g. the fence excludes a file the
  task genuinely needs), propose an amendment to the plan file and say why —
  never silently reinterpret the goal. Plan edits are visible in git.
- **Every presented plan ends with a ready-to-paste `/goal` line**, e.g.:
  `/goal every task in task_plan.md is checked off per its own "Done when", and the project's quality gates pass`
  The user sets it; the AI never invokes /goal itself (the worker must not
  appoint its own judge).

## Precedence with plugins (superpowers and others)

Plugin skills supply TECHNIQUE; these rules define the REQUIRED ARTIFACTS and
OUTCOMES. On any conflict, this file and the other `.claude/rules/` win:

- A plan produced with superpowers `writing-plans` (or any other method) must
  still land in `task_plan.md` in the Plan-quality structure above, with
  per-task `Done when:` clauses and the closing `/goal` line. Superpowers
  shapes the thinking; our format is the deliverable.
- `brainstorming` serves the Interview → spec step for large/fuzzy features.
  The trivial-fix exemption in "Plan first" OVERRIDES its "use before any
  creative work" trigger — no brainstorming ceremony for typo-sized changes.
- Branch integration follows `delivery.md` (gates → review → merge to
  `develop` → propose next task), not `finishing-a-development-branch`'s own
  menu of options.
- **Design generators** (the vendored `impeccable`, or ui-ux-pro-max etc.)
  propose the visual language ONLY in projects without their own design system.
  Where a design system exists, its tokens/components win and generators serve
  in review/critique mode only (see `ui-quality` rule zero). Never two
  generator doctrines in one project.

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
