#!/usr/bin/env bash
# Stop hook: the "definition of done" gate (wired in .claude/settings.json).
# Fires when Claude tries to end its turn. If the project defines lint/typecheck/test
# scripts and any of them FAIL, Claude is blocked from stopping (exit 2) and must fix
# the failures first. This converts "I'm done" from a claim into a verified fact.
#
# Escape hatches:
#   - Set SKIP_DONE_GATE=1 in the environment to disable temporarily.
#   - Projects without a package.json pass through untouched (adapt the
#     "Detect project type" section for other stacks: composer, cargo, pytest...).
#
# Loop protection: when the hook itself already blocked once, stop_hook_active=true
# arrives in the input JSON — never block again on that pass, or Claude loops forever.

set -uo pipefail

INPUT=$(cat)

[ "${SKIP_DONE_GATE:-0}" = "1" ] && exit 0

if printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# --- Detect project type (npm-based by default; adapt per stack) ------------
[ -f package.json ] || exit 0

has_script() {
  grep -q "\"$1\"[[:space:]]*:" package.json
}

FAILURES=""

run_gate() { # $1 = script name, $2 = label
  if has_script "$1"; then
    if ! npm run "$1" --silent >/tmp/done-gate-$1.log 2>&1; then
      FAILURES="$FAILURES\n--- $2 FAILED (npm run $1) ---\n$(tail -30 /tmp/done-gate-$1.log)"
    fi
  fi
}

run_gate lint "Lint"
run_gate typecheck "Typecheck"
run_gate test "Tests"

if [ -n "$FAILURES" ]; then
  printf 'DONE-GATE BLOCKED: the task is not done because quality gates failed.\nFix these before finishing:%b\n' "$FAILURES" >&2
  exit 2
fi

exit 0
