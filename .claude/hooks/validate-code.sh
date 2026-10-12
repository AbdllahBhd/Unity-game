#!/usr/bin/env bash
# PostToolUse hook: runs after every Edit/Write Claude makes (wired in .claude/settings.json).
# It receives hook JSON on stdin, extracts the edited file path, and runs quick checks.
#
# Exit codes (Claude Code hook contract):
#   0 = success (stdout shown in transcript mode only)
#   2 = BLOCK: stderr is fed back to Claude, which must fix the problem
#   other = non-blocking error (stderr shown to user)
#
# Works on Windows via Git Bash (Claude Code runs hooks through bash).

set -uo pipefail

INPUT=$(cat)

# Extract .tool_input.file_path from the hook JSON (jq if available, grep fallback).
if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
else
  FILE_PATH=$(printf '%s' "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')
fi

[ -z "$FILE_PATH" ] && exit 0            # nothing to validate
[ ! -f "$FILE_PATH" ] && exit 0          # file was deleted/moved

# --- Check 1: block obvious secrets -----------------------------------------
if grep -nE '(api[_-]?key|secret|password|token)[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9_\-]{16,}["'"'"']' "$FILE_PATH" >/dev/null 2>&1; then
  echo "BLOCKED: $FILE_PATH appears to contain a hardcoded secret (api key / password / token). Move it to an environment variable and reference it instead." >&2
  exit 2
fi

# --- Check 2: warn on debug leftovers (non-blocking) ------------------------
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    if grep -nE '^\s*(console\.log|debugger)\b' "$FILE_PATH" >/dev/null 2>&1; then
      echo "note: $FILE_PATH contains console.log/debugger statements — remove before committing."
    fi
    ;;
  *.py)
    if grep -nE '^\s*(print\(|breakpoint\(\)|import pdb)' "$FILE_PATH" >/dev/null 2>&1; then
      echo "note: $FILE_PATH contains print/breakpoint debug statements — remove before committing."
    fi
    ;;
esac

# --- Check 3: auto-format if the project has a formatter (best effort) ------
# Uncomment when your project uses Prettier:
# case "$FILE_PATH" in
#   *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
#     npx prettier --write "$FILE_PATH" >/dev/null 2>&1 || true
#     ;;
# esac

exit 0
