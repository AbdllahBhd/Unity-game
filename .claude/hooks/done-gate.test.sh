#!/usr/bin/env bash
# Tests for done-gate.sh. Builds a throwaway git repo (path with a space, like the
# real one) whose project checks are stubs that log their name and pass or fail
# on demand, then runs the hook in it from another directory.
# Run: bash .claude/hooks/done-gate.test.sh

set -uo pipefail

HOOK="$(cd "$(dirname "$0")" && pwd)/done-gate.sh"
TMP=$(mktemp -d "${TMPDIR:-/tmp}/done gate.XXXXXX")
FIX="$TMP/repo"
GATE_LOG="$TMP/ran.log"
ERR="$TMP/stderr.log"
export GATE_LOG
unset SKIP_DONE_GATE
trap 'rm -rf "$TMP"' EXIT

PASS_JS="require('fs').appendFileSync(process.env.GATE_LOG, require('path').relative(process.cwd(), process.argv[1]) + '\n');"
FAIL_JS="$PASS_JS console.error('stub failure'); process.exit(1);"

stub_js() { # $1 = path, $2 = pass|fail
  mkdir -p "$(dirname "$FIX/$1")"
  if [ "$2" = pass ]; then echo "$PASS_JS" >"$FIX/$1"; else echo "$FAIL_JS" >"$FIX/$1"; fi
}

stub_py() { # $1 = pass|fail
  local code=0
  [ "$1" = fail ] && code=1
  mkdir -p "$FIX/Tools"
  printf 'import os, sys\nopen(os.environ["GATE_LOG"], "a").write("check_levels\\n")\nprint("stub stage failure")\nsys.exit(%s)\n' "$code" >"$FIX/Tools/check_levels.py"
}

stub_sh() { # $1 = pass|fail: the Unity compile check
  local code=0
  [ "$1" = fail ] && code=1
  mkdir -p "$FIX/Tools"
  printf 'echo unity_check >>"$GATE_LOG"\necho "stub compile failure"\nexit %s\n' "$code" >"$FIX/Tools/unity_check.sh"
}

git_fix() { git -C "$FIX" -c commit.gpgsign=false -c user.email=t@example.com -c user.name=t "$@"; }

RC=0
run_hook() { # $1 = hook stdin JSON; runs from / so CLAUDE_PROJECT_DIR must be honoured
  (cd / && printf '%s' "${1:-{\}}" | CLAUDE_PROJECT_DIR="$FIX" bash "$HOOK" 2>"$ERR")
  RC=$?
}

mkdir -p "$FIX/Assets/Scripts/HollowNight/Stage" "$FIX/Tools/design/prototype"
echo "class LevelLibrary {}" >"$FIX/Assets/Scripts/HollowNight/Stage/LevelLibrary.cs"
echo "readme" >"$FIX/README.md"
echo "// engine" >"$FIX/Tools/design/prototype/game.js"
echo "// sorts after the checkers" >"$FIX/Tools/design/prototype/worker.js"
stub_py pass
stub_sh pass
mkdir -p "$FIX/Assets/Editor"
echo "class SmokeTest {}" >"$FIX/Assets/Editor/SmokeTest.cs"
for f in game.test.js art.test.js verify-routes.js; do stub_js "Tools/design/prototype/$f" pass; done
stub_js Tools/design/original/verify-routes.js pass
git_fix init -q && git_fix add -A && git_fix commit -qm init && git_fix tag init ||
  { echo "fixture setup failed"; exit 1; }

# Every test starts from the committed fixture with all checks recorded as passed.
reset_fixture() {
  git_fix reset -q --hard init && git_fix clean -fdq
  rm -rf "$FIX/.git/done-gate"
  run_hook
  [ "$RC" -eq 0 ] || { echo "seeding run failed: $(cat "$ERR")"; exit 1; }
  : >"$GATE_LOG"
}

FAILED=0
check() { # $1 = test name, $2 = condition (evaluated)
  if eval "$2"; then
    echo "ok   $1"
  else
    echo "FAIL $1  ($2; rc=$RC; ran: $(tr '\n' ' ' <"$GATE_LOG"); stderr: $(head -c 300 "$ERR"))"
    FAILED=1
  fi
}

ran() { grep -qx "$1" "$GATE_LOG"; }
ran_nothing() { [ ! -s "$GATE_LOG" ]; }

# --- First run and caching ----------------------------------------------------
git_fix reset -q --hard init && rm -rf "$FIX/.git/done-gate" && : >"$GATE_LOG"
run_hook
check "first run checks every area" '[ $RC -eq 0 ] && ran check_levels && ran Tools/design/prototype/game.test.js && ran Tools/design/original/verify-routes.js && ran unity_check'

: >"$GATE_LOG"
run_hook
check "unchanged areas are not re-checked" '[ $RC -eq 0 ] && ran_nothing'

reset_fixture
rm "$FIX/Tools/design/prototype/worker.js"
run_hook
: >"$GATE_LOG"
run_hook
check "an unstaged deletion is cached after one pass" '[ $RC -eq 0 ] && ran_nothing'

reset_fixture
cp "$HOOK" "$TMP/edited-hook.sh"
echo "# checker list changed" >>"$TMP/edited-hook.sh"
(cd / && printf '{}' | CLAUDE_PROJECT_DIR="$FIX" bash "$TMP/edited-hook.sh" 2>"$ERR")
RC=$?
check "changing the hook re-checks every area" '[ $RC -eq 0 ] && ran check_levels && ran Tools/design/original/verify-routes.js'

reset_fixture
git_fix rm -rq Tools/design/original
rm -rf "$FIX/.git/done-gate"
run_hook
check "a project without an area passes and skips it" '[ $RC -eq 0 ] && ran check_levels && ! ran Tools/design/original/verify-routes.js'

# --- Game code ------------------------------------------------------------------
reset_fixture
echo "// edit" >>"$FIX/Assets/Scripts/HollowNight/Stage/LevelLibrary.cs"
run_hook
check "game code change runs check_levels and passes" '[ $RC -eq 0 ] && ran check_levels'

reset_fixture
stub_py fail
run_hook
check "failing check_levels blocks" '[ $RC -eq 2 ] && ran check_levels && grep -q "check_levels" "$ERR"'
: >"$GATE_LOG"
run_hook
check "a failure is re-checked on the next turn" '[ $RC -eq 2 ] && ran check_levels'

reset_fixture
stub_py fail
git_fix commit -qam "break stages"
run_hook
check "committing during the turn still blocks" '[ $RC -eq 2 ] && ran check_levels'

reset_fixture
git_fix mv Assets/Scripts/HollowNight/Stage/LevelLibrary.cs LevelLibrary.cs
run_hook
check "staged rename out of game code is checked" 'ran check_levels'

reset_fixture
touch "$FIX/Assets/Scripts/q\"x.cs"
run_hook
check "odd file names are seen" 'ran check_levels'

reset_fixture
rm "$FIX/Tools/check_levels.py"
run_hook
check "deleted simulator blocks instead of passing" '[ $RC -eq 2 ] && grep -q "NOT RUN" "$ERR"'
check "the block names the way out for a removed area" 'grep -q "done-gate/stages" "$ERR"'

# --- Unity compile check --------------------------------------------------------------
reset_fixture
echo "// edit" >>"$FIX/Assets/Scripts/HollowNight/Stage/LevelLibrary.cs"
run_hook
check "game code change runs the Unity compile check" '[ $RC -eq 0 ] && ran unity_check'

reset_fixture
echo "// edit" >>"$FIX/Assets/Editor/SmokeTest.cs"
run_hook
check "editor script change runs the compile check only" '[ $RC -eq 0 ] && ran unity_check && ! ran check_levels'

reset_fixture
stub_sh fail
run_hook
check "failing compile check blocks" '[ $RC -eq 2 ] && ran unity_check && grep -q "unity_check" "$ERR"'

reset_fixture
echo "png" >"$FIX/Assets/sprite.png"
run_hook
check "a non-script asset runs no compile check" '[ $RC -eq 0 ] && ! ran unity_check'

# --- Browser prototypes -----------------------------------------------------------
reset_fixture
stub_js Tools/design/prototype/art.test.js fail
run_hook
check "failing prototype test blocks" '[ $RC -eq 2 ] && grep -q "art.test.js" "$ERR"'
check "prototype change runs all prototype checks" 'ran Tools/design/prototype/game.test.js && ran Tools/design/prototype/verify-routes.js'
check "prototype change skips the stage simulator" '! ran check_levels'

reset_fixture
echo "// physics change" >>"$FIX/Tools/design/prototype/game.js"
run_hook
check "prototype engine change re-checks original-art routes" 'ran Tools/design/original/verify-routes.js'

reset_fixture
echo "// new" >"$FIX/Tools/design/original/levels.js"
stub_js Tools/design/original/verify-routes.js fail
run_hook
check "failing original route check blocks" '[ $RC -eq 2 ] && ran Tools/design/original/verify-routes.js'
check "original-art change skips the comparison prototype" '! ran Tools/design/prototype/game.test.js'

# --- Unrelated changes, tooling, escape hatches -------------------------------------
reset_fixture
echo "more" >>"$FIX/README.md"
run_hook
check "unrelated change runs nothing" '[ $RC -eq 0 ] && ran_nothing'

reset_fixture
echo "// edit" >>"$FIX/Tools/design/prototype/game.js"
NODELESS="$TMP/bin"
mkdir -p "$NODELESS"
for c in bash cat grep git mktemp tail rm sort cut mkdir python3 tr head xargs sha1sum dirname printf; do
  p=$(command -v "$c") && [ -x "$p" ] && ln -sf "$p" "$NODELESS/$c"
done
(cd / && printf '{}' | PATH="$NODELESS" CLAUDE_PROJECT_DIR="$FIX" bash "$HOOK" 2>"$ERR")
RC=$?
check "missing node blocks with NOT RUN" '[ $RC -eq 2 ] && grep -q "'"'"'node'"'"' is not installed" "$ERR"'

reset_fixture
stub_py fail
run_hook '{"stop_hook_active": true}'
check "stop_hook_active never blocks" '[ $RC -eq 0 ] && ran_nothing'

reset_fixture
stub_py fail
(cd / && printf '{}' | SKIP_DONE_GATE=1 CLAUDE_PROJECT_DIR="$FIX" bash "$HOOK" 2>"$ERR")
RC=$?
check "SKIP_DONE_GATE=1 passes" '[ $RC -eq 0 ] && ran_nothing'

(cd / && printf '{}' | CLAUDE_PROJECT_DIR="$TMP/missing" bash "$HOOK" 2>"$ERR")
RC=$?
check "bad project directory blocks" '[ $RC -eq 2 ]'

NOGIT="$TMP/plain dir"
mkdir -p "$NOGIT/Tools"
cp "$FIX/Tools/check_levels.py" "$NOGIT/Tools/"
sed -i 's/sys.exit(0)/sys.exit(1)/' "$NOGIT/Tools/check_levels.py"
: >"$GATE_LOG"
(cd / && printf '{}' | CLAUDE_PROJECT_DIR="$NOGIT" bash "$HOOK" 2>"$ERR")
RC=$?
check "outside git every present check runs" '[ $RC -eq 2 ] && ran check_levels'

[ "$FAILED" -eq 0 ] && echo "All done-gate tests passed." || { echo "done-gate tests FAILED"; exit 1; }
