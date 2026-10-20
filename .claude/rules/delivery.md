# Feature Delivery Loop

> Loaded via CLAUDE.md. What happens when a major feature or task is finished,
> and how work flows from one task to the next.

## When a major feature is complete

Run this loop IN ORDER — never skip a step, never reorder:

1. **Gate:** all quality gates green (see "Definition of done" in workflow.md).
2. **Review:** run an adversarial review of the diff (`code-reviewer` agent, or
   superpowers `requesting-code-review` when installed). Fix every finding that
   affects correctness or requirements; list the ones deliberately skipped and why.
3. **Commit** on the feature branch — Conventional Commits per pr.md
   (`feat: ...`, imperative, ≤72 chars).
4. **Merge to `develop`:**
   - If `develop` does not exist, create it from `main` first:
     `git checkout -b develop main` and push it.
   - Merge the feature branch into `develop` (regular merge, no squash unless
     pr.md says otherwise). Never merge with failing gates — no exceptions.
   - Never push directly to `main`.
   - Solo flow note: the step-2 adversarial review IS the required review
     (pr.md's "never merge without review" is satisfied by it). Teams that
     require human PR review use a PR to develop instead of a direct merge.
5. **Propose the next task:** suggest it with one line of reasoning (from
   task_plan.md, the roadmap, or open issues), and wait for the user's pick or
   confirmation.
6. **Start it cleanly:** create the branch `<type>/<short-description>`
   (naming per pr.md) from `develop`, recommend a fresh session for the new
   task, and continue there.

## Multitask opportunities

- When a task splits into 2+ independent subtasks (no shared files, no ordering
  dependency), SAY SO and propose parallel execution: subagents, or parallel
  sessions in git worktrees (superpowers `dispatching-parallel-agents` /
  `using-git-worktrees` when installed). Let the user choose; don't parallelize
  side-effectful work without their yes.

## Progress visibility (during every task)

- Keep a visible task list for multi-step work and update it as steps complete —
  the user must be able to see where the task stands at any moment.
- Post a one-line progress note at each milestone (step done, finding, direction
  change). Small frequent updates beat one wall of text at the end.
- Long-running work (test suites, builds): say what is running and roughly how
  long it takes.

## If superpowers is installed

Its skills implement parts of this loop (`finishing-a-development-branch`,
`verification-before-completion`, `requesting-code-review`). Use them — this
file defines the REQUIRED OUTCOMES (reviewed, gated, merged to develop,
next task proposed); the skills supply the technique.
