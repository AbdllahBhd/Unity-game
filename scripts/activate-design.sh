#!/usr/bin/env bash
# activate-design.sh — turn an optional design skill ON (or OFF) in this project.
#
# The template SHIPS these inert under .claude/skills-optional/ so every pull
# carries them; nothing loads until you activate it here:
#
#   bash scripts/activate-design.sh xias            # 25 enforcer skills + root assets (web)
#   bash scripts/activate-design.sh ui-ux-pro-max   # generator (7 skills)
#   bash scripts/activate-design.sh taste           # generator (art direction)
#   bash scripts/activate-design.sh apple-design    # HIG reviewer — CLONED at activation
#                                                   # (no license upstream, so it is fetched,
#                                                   # git-ignored, and never committed)
#   bash scripts/activate-design.sh off <name>      # deactivate (moves it back / deletes clone)
#
# ONE GENERATOR PER PROJECT (workflow.md): impeccable ships active. Activating
# ui-ux-pro-max or taste requires deactivating the current generator first;
# this script refuses otherwise (FORCE_SECOND_GENERATOR=1 overrides, unwisely).
# Windows: run via Git Bash, e.g.  "C:\Program Files\Git\bin\bash.exe" scripts/activate-design.sh xias

set -euo pipefail
cd "$(dirname "$0")/.."
OPT=.claude/skills-optional
SK=.claude/skills
GENERATORS="impeccable ui-ux-pro-max taste"

active_generator() {
  for g in $GENERATORS; do [ -d "$SK/$g" ] && echo "$g" && return; done
  return 0
}

sync() { bash scripts/sync-codex.sh >/dev/null 2>&1 || true; echo "(Codex projections synced — restart sessions to load changes)"; }

case "${1:-}" in
  xias)
    cp -r "$OPT/xias/skills/." "$SK/"
    cp -r "$OPT/xias/root-assets/." ./
    echo "XIAS active: 25 skills + root assets (components/, tokens/, scripts/...)."
    echo "NOTE: web-oriented; adds 25 skill descriptions to every session here."
    sync ;;
  ui-ux-pro-max|taste)
    g=$(active_generator)
    if [ -n "$g" ] && [ "$g" != "$1" ] && [ "${FORCE_SECOND_GENERATOR:-0}" != "1" ]; then
      echo "REFUSED: generator '$g' is active and the rule is one generator per project."
      echo "Deactivate first:  bash scripts/activate-design.sh off $g"; exit 1
    fi
    cp -r "$OPT/$1/." "$SK/_tmp_$1/" 2>/dev/null || true
    rm -rf "$SK/_tmp_$1"
    # pro-max bundle contains multiple skill dirs; taste contains taste-skill/
    for d in "$OPT/$1"/*/; do
      name=$(basename "$d"); [ "$name" = "LICENSE" ] && continue
      rm -rf "$SK/$name"; cp -r "$d" "$SK/$name"
    done
    echo "Generator '$1' active."; sync ;;
  apple-design)
    rm -rf "$SK/apple-design"
    git clone --depth 1 https://github.com/dickwu/apple-design-skill "$SK/apple-design"
    rm -rf "$SK/apple-design/.git"
    echo "apple-design active (cloned, git-ignored — re-run after fresh clones of this repo)."
    sync ;;
  off)
    n="${2:?usage: off <name>}"
    case "$n" in
      apple-design) rm -rf "$SK/apple-design" ;;
      xias) for d in "$OPT/xias/skills"/*/; do rm -rf "$SK/$(basename "$d")"; done
            echo "NOTE: XIAS root assets (components/, tokens/...) left in place; remove manually if unwanted." ;;
      *) for d in "$OPT/$n"/*/; do rm -rf "$SK/$(basename "$d")"; done ;;
    esac
    echo "'$n' deactivated."; sync ;;
  *)
    echo "usage: activate-design.sh <xias|ui-ux-pro-max|taste|apple-design> | off <name>"; exit 1 ;;
esac