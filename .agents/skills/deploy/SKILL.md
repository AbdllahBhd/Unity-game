---
name: deploy
description: Run the pre-deploy checklist and deploy to the given environment (staging by default)
---

> Mirrored from .claude/commands/deploy.md by scripts/sync-codex.sh — edit the
> source file and re-run the script; do not edit this copy.
> $ARGUMENTS below means: the text the user typed after $deploy.


# /deploy — Guarded Deployment

Deploy the project to: $ARGUMENTS (default: **staging** if no argument given).

> ⚠️ Edit this file to plug in your real deploy commands (CI trigger, `vercel deploy`,
> `docker push`, `kubectl apply`, etc.). Until then it runs the checklist only.

## Pre-deploy checklist (MUST all pass — stop and report on any failure)

1. `git status` — working tree must be clean (no uncommitted changes).
2. Confirm the current branch is the one meant for this environment (e.g. `main` for production).
3. `npm run lint` — zero errors.
4. `npm test` — full suite green.
5. `npm run build` — build succeeds.

## Deploy

- **staging:** `<your staging deploy command here>`
- **production:** Requires the user to explicitly confirm in chat before running
  `<your production deploy command here>`. Never deploy to production without that confirmation.

## After deploy

1. Report the deployed version/commit hash.
2. Suggest a quick smoke test (health-check URL or command) and run it if available.
3. If anything failed, report exactly what failed and do NOT retry automatically.
