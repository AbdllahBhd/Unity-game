# Reporting & Context Rules

> Loaded via CLAUDE.md. How to brief the user when work finishes, and when to
> suggest context cleanup. Written for a human reader, not a log file.

## Task briefing format (every task/job completion)

Structure the final message in these sections, in this order. Plain language,
short sentences, no jargon walls:

1. **Summary** — one or two sentences: what happened, lead with the outcome.
2. **What changed** — files/behavior touched, in human terms, not a raw diff.
3. **How it was verified** — the EVIDENCE: commands run and their results
   (test counts, analyzer output). Claim only what the evidence supports —
   "merged" is not "deployed"; "wrote tests" is not "tests pass".
4. **Decisions & tradeoffs** — choices made along the way the user should know,
   with the one-line why.
5. **Issues / blockers** — anything failed, skipped, or needing the user, with
   what was tried. Report failures as plainly as successes.
6. **Next step** — the single recommended next action.

Skip a section only when it is truly empty. For tiny tasks, compress to
Summary + Verified — never skip the evidence.

## Goal footer (while executing a plan)

- During plan execution, end EVERY response with exactly one line:
  `— Goal: <plan objective, verbatim from task_plan.md> · Task N/M · Risk: none | <one-phrase drift note>`
- The goal text is copied verbatim from the plan file, never paraphrased — a
  mutated goal line IS the drift signal.
- The footer complements the visible task list (which shows steps/checkmarks);
  it answers "is this still the right direction", so never re-list steps in it.
- A missing or altered footer tells the user the session is degrading — they
  may compact or restart; make the footer easy to scan, one line, always last.

## Context management (suggest, don't wait to be asked)

- **Between unrelated tasks:** suggest starting a fresh session (or `/clear`).
- **Mid-task, when context grows heavy** (many files read, long exploration,
  repeated corrections): suggest `/compact` and NAME what must survive it —
  modified files, plan status, test commands, key decisions.
- **Before compacting is ever needed:** keep durable state in files
  (task_plan.md, SPEC.md, rules) so a compaction or restart loses nothing
  important. Chat history is disposable; files are not.
- After two failed corrections on the same issue, recommend a fresh session
  with a better prompt instead of a third attempt in polluted context.
