#!/usr/bin/env bash
# sync-codex.sh — project Codex adapter sync (run from the repo root).
#
# Single source of truth is .claude/ — this script PROJECTS it into the
# locations Codex reads, so both tools stay identical without manual upkeep:
#
#   .claude/skills/*            →  .agents/skills/*            (Codex skill discovery)
#   .claude/commands/*.md       →  .agents/skills/<name>/      (as Codex skills: $deploy, $retro...)
#
# Codex hooks need no sync: .codex/config.toml (committed) wires the SAME
# scripts in .claude/hooks/. MCP registration is per-machine (see output).
#
# Re-run after changing any skill or command. Idempotent and safe:
# it only ever writes inside .agents/skills/.

set -euo pipefail

[ -d .claude ] || { echo "ERROR: run from the repo root (no .claude/ here)"; exit 1; }

mkdir -p .agents/skills

# --- extract the description: value from a file's YAML frontmatter -----------
frontmatter_description() {
  awk '/^---[[:space:]]*$/{n++; next} n==1 && /^description:[[:space:]]*/{
    sub(/^description:[[:space:]]*/, ""); print; exit }' "$1"
}

# --- strip the frontmatter block, keep the body -------------------------------
body_without_frontmatter() {
  awk 'BEGIN{n=0} /^---[[:space:]]*$/{n++; next} n!=1{print}' "$1"
}

SYNCED=""

# 1) Mirror real skills as-is
for dir in .claude/skills/*/; do
  [ -f "$dir/SKILL.md" ] || continue
  name=$(basename "$dir")
  rm -rf ".agents/skills/$name"
  cp -r "$dir" ".agents/skills/$name"
  SYNCED="$SYNCED $name"
done

# 2) Project skills nested inside vendored plugins (e.g. superpowers/skills/*)
#    so Codex gets them too — the plugin folder itself is not a skill, but the
#    skills inside it are plain SKILL.md folders Codex understands.
for dir in .claude/skills/*/skills/*/; do
  [ -f "$dir/SKILL.md" ] || continue
  name=$(basename "$dir")
  rm -rf ".agents/skills/$name"
  cp -r "$dir" ".agents/skills/$name"
  SYNCED="$SYNCED $name"
done

# 3) Convert Claude commands into Codex skills ($<name>)
for cmd in .claude/commands/*.md; do
  [ -f "$cmd" ] || continue
  name=$(basename "$cmd" .md)
  desc=$(frontmatter_description "$cmd")
  [ -n "$desc" ] || desc="Project workflow: $name"
  mkdir -p ".agents/skills/$name"
  {
    printf -- '---\nname: %s\ndescription: %s\n---\n\n' "$name" "$desc"
    echo "> Mirrored from .claude/commands/$name.md by scripts/sync-codex.sh — edit the"
    echo "> source file and re-run the script; do not edit this copy."
    echo "> \$ARGUMENTS below means: the text the user typed after \$$name."
    echo
    body_without_frontmatter "$cmd"
  } > ".agents/skills/$name/SKILL.md"
  SYNCED="$SYNCED \$$name"
done

echo "Synced into .agents/skills/:$SYNCED"
echo
echo "Per-machine steps still needed ONCE on each laptop:"
echo "  1. MCP servers: register the servers from .mcp.json in Codex, e.g."
echo "       codex mcp add <name> -- <command>   (or add them to ~/.codex/config.toml)"
echo "  2. Hooks trust: open Codex in this repo and run /hooks to review+trust"
echo "     the hooks wired in .codex/config.toml (Codex requires a one-time trust)."
echo "  3. Restart Codex sessions to pick up new skills."
