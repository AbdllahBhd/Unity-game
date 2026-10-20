#!/usr/bin/env bash
# PostToolUse hook: after Claude edits or writes a file under .claude/skills/ or
# .claude/commands/, regenerate the Codex mirror in .agents/skills/ by running
# scripts/sync-codex.sh. Keeps both tools identical without a manual step.
# Edits anywhere else exit immediately. Never blocks (always exit 0).

set -uo pipefail

INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
else
  FILE_PATH=$(printf '%s' "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')
fi

[ -z "$FILE_PATH" ] && exit 0

# Windows paths arrive with backslashes (JSON-escaped to "\\" when jq is absent):
# turn every run of slashes/backslashes into a single "/" before matching.
NORMALISED=$(printf '%s' "$FILE_PATH" | tr '\\' '/' | sed 's#//*#/#g')

case "$NORMALISED" in
  */.claude/skills/*|*/.claude/commands/*|.claude/skills/*|.claude/commands/*) ;;
  *) exit 0 ;;
esac

[ -f scripts/sync-codex.sh ] || exit 0

if bash scripts/sync-codex.sh >/dev/null 2>&1; then
  echo "note: synced .agents/skills/ from .claude/ (triggered by $FILE_PATH)."
else
  echo "warning: scripts/sync-codex.sh failed after editing $FILE_PATH - run it manually." >&2
fi

exit 0
