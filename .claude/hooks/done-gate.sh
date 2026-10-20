#!/usr/bin/env bash
# Stop hook: the "definition of done" gate (wired in .claude/settings.json).
# Fires when Claude tries to end its turn. If the project's checks FAIL, Claude is
# blocked from stopping (exit 2) and must fix the failures first. This converts
# "I'm done" from a claim into a verified fact.
#
# Checks for this project (Hollow Night, Unity, no package.json), one per area:
#   stages     Assets/Scripts/, Tools/check_levels.py  -> python3 Tools/check_levels.py
#   prototype  Tools/design/prototype/                 -> its game/art tests and route check
#   original   Tools/design/original/ + prototype/     -> its route check (it loads
#                                                         ../prototype/game.js)
# An area is re-checked only when its files differ from the last time its checks
# passed (fingerprints in .git/done-gate/), because check_levels.py takes ~30 s
# and this hook fires on every turn. Committing does not skip a check. A missing
# checker or interpreter blocks instead of passing. The Unity compile check cannot
# run here (no editor access). Tests: bash .claude/hooks/done-gate.test.sh
#
# Escape hatches:
#   - Set SKIP_DONE_GATE=1 in the environment to disable temporarily.
#   - npm projects: lint/typecheck/test scripts in package.json also run.
#
# Loop protection: when the hook itself already blocked once, stop_hook_active=true
# arrives in the input JSON — never block again on that pass, or Claude loops forever.

set -uo pipefail

INPUT=$(cat)

[ "${SKIP_DONE_GATE:-0}" = "1" ] && exit 0

if printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Resolved before the cd: the hook's own content is part of every fingerprint,
# so editing the checker list re-checks every area.
SELF="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || {
  echo "DONE-GATE BLOCKED: cannot enter the project directory '${CLAUDE_PROJECT_DIR:-.}'." >&2
  exit 2
}

FAILURES=""
NL=$'\n'

run_check() { # $1 = label, rest = command
  local label=$1 log
  shift
  if ! command -v "$1" >/dev/null 2>&1; then
    FAILURES="$FAILURES$NL--- $label NOT RUN: '$1' is not installed ---"
    return
  fi
  log=$(mktemp)
  if ! "$@" >"$log" 2>&1; then
    FAILURES="$FAILURES$NL--- $label FAILED ($*) ---$NL$(tail -30 "$log")"
  fi
  rm -f "$log"
}

# Passing fingerprints live inside .git, so they are never committed. Outside git
# there is nowhere to keep them and every present check runs each time.
STATE=$(git rev-parse --git-path done-gate 2>/dev/null) && mkdir -p "$STATE" || STATE=""

fingerprint() { # $@ = watched paths; names and contents of tracked + untracked files
  [ -n "$STATE" ] || return 1
  # The loop body must always succeed: with pipefail, a deleted tracked file
  # listed last would otherwise fail the pipeline and miss the cache forever.
  {
    sha1sum <"$SELF"
    git ls-files -z -co --exclude-standard -- "$@" |
      while IFS= read -r -d '' f; do [ -f "$f" ] || continue; printf '%s\0' "$f"; done |
      xargs -0 sha1sum
  } | sha1sum | cut -c1-40
}

gate_area() { # $1 = area, $2 = interpreter, $3 = space-separated checker scripts, rest = watched paths
  local area=$1 interp=$2 scripts=$3 script present=0 fp="" before
  shift 3
  for script in $scripts; do [ -f "$script" ] && present=1; done
  # No checker and never checked before: this project has no such area.
  [ "$present" = 1 ] || { [ -n "$STATE" ] && [ -f "$STATE/$area" ]; } || return 0
  if fp=$(fingerprint "$@") && [ "$fp" = "$(cat "$STATE/$area" 2>/dev/null)" ]; then
    return 0
  fi
  before=$FAILURES
  for script in $scripts; do
    if [ -f "$script" ]; then
      run_check "$area: $script" "$interp" "$script"
    else
      FAILURES="$FAILURES$NL--- $area NOT RUN: $script is missing (if the area was removed on purpose, delete $STATE/$area) ---"
    fi
  done
  if [ -n "$fp" ] && [ "$FAILURES" = "$before" ]; then
    printf '%s\n' "$fp" >"$STATE/$area"
  fi
}

gate_area stages python3 "Tools/check_levels.py" \
  Assets/Scripts Tools/check_levels.py
gate_area prototype node "Tools/design/prototype/game.test.js Tools/design/prototype/art.test.js Tools/design/prototype/verify-routes.js" \
  Tools/design/prototype
gate_area original node "Tools/design/original/verify-routes.js" \
  Tools/design/original Tools/design/prototype

# --- npm scripts, when the project has a package.json -------------------------
if [ -f package.json ]; then
  for script in lint typecheck test; do
    grep -q "\"$script\"[[:space:]]*:" package.json &&
      run_check "npm $script" npm run "$script" --silent
  done
fi

if [ -n "$FAILURES" ]; then
  printf 'DONE-GATE BLOCKED: the task is not done because quality gates failed.\nFix these before finishing:%s\n' "$FAILURES" >&2
  exit 2
fi

exit 0
