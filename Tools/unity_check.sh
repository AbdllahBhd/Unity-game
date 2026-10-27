#!/usr/bin/env bash
# Compile check for the Unity C# code, and plain C# tests, without opening the editor.
# Uses the editor's own Roslyn compiler and engine assemblies, and builds the same
# assemblies Unity does:
#   HollowNight.Logic  Assets/Scripts/HollowNight/Logic/ (asmdef, no engine references)
#   Assembly-CSharp    every other non-Editor script in Assets/, legacy ones included,
#                      compiled once as in the editor and once as in a player build
#   Assembly-CSharp-Editor  every script under an Editor/ folder
# then compiles Tools/unity_tests/*.cs against Logic only and runs it with the bundled
# dotnet. Exit code: 0 when everything compiles and every test passes.
# UGUI is compiled once from the editor's bundled package source into Tools/.build/.
# Usage: bash Tools/unity_check.sh        (UNITY_EDITOR_DATA overrides the editor path)
set -uo pipefail
cd "$(dirname "$0")/.."

E=${UNITY_EDITOR_DATA:-$HOME/Unity/Hub/Editor/6000.6.5f1/Editor/Data}
DOTNET=$E/DotNetSdk/dotnet
CSC_DLL=$(ls "$E"/DotNetSdk/sdk/*/Roslyn/bincore/csc.dll 2>/dev/null | head -1)
NETSTD=$E/NetStandard/ref/2.1.0/netstandard.dll
UGUI_SRC=$E/Resources/PackageManager/BuiltInPackages/com.unity.ugui/Runtime/UGUI
OUT=Tools/.build
LOGIC_DIR=Assets/Scripts/HollowNight/Logic
for need in "$DOTNET" "$CSC_DLL" "$NETSTD" "$UGUI_SRC"; do
  [ -e "$need" ] || { echo "unity_check: missing $need (is Unity 6000.6.5f1 installed?)"; exit 2; }
done
mkdir -p "$OUT"

# The split engine modules; the editor modules (UnityEditor.*Module.dll) are here too.
ENGINE=()
for f in "$E"/Managed/UnityEngine/*.dll; do ENGINE+=("-r:$f"); done
DEFINES="UNITY_6000_0_OR_NEWER;UNITY_2023_3_OR_NEWER;UNITY_2022_3_OR_NEWER;UNITY_2021_3_OR_NEWER;UNITY_2020_3_OR_NEWER;UNITY_5_3_OR_NEWER;ENABLE_LEGACY_INPUT_MANAGER"
ERRORS=0

csc() { # $1 = label; rest = compiler arguments. Prints errors only.
  local label=$1 log
  shift
  log=$(mktemp)
  "$DOTNET" "$CSC_DLL" -nologo -nostdlib -noconfig -r:"$NETSTD" "$@" >"$log" 2>&1
  local n
  n=$(grep -c "error CS" "$log")
  if [ "$n" -gt 0 ]; then
    echo "FAIL $label: $n error(s)"
    grep "error CS" "$log" | sed "s#^$PWD/##" | head -40
    ERRORS=$((ERRORS + n))
  else
    echo "ok   $label"
  fi
  rm -f "$log"
  return 0
}

list() { # NUL-free list of .cs files, one per line, sorted
  find "$@" -name "*.cs" 2>/dev/null | sort
}

# UGUI once (TextMeshPro inside the package needs editor-internal access; the game
# does not use it).
if [ ! -f "$OUT/UnityEngine.UI.dll" ]; then
  find "$UGUI_SRC" -name "*.cs" >"$OUT/ugui.rsp"
  csc "UnityEngine.UI (from the editor's package source)" -langversion:9 -target:library \
    "${ENGINE[@]}" -out:"$OUT/UnityEngine.UI.dll" -define:"$DEFINES" -nowarn:0618,0649,0414 @"$OUT/ugui.rsp"
  [ -f "$OUT/UnityEngine.UI.dll" ] || exit 2
fi

LOGIC_REF=()
if [ -n "$(list "$LOGIC_DIR")" ]; then
  list "$LOGIC_DIR" >"$OUT/logic.rsp"
  rm -f "$OUT/HollowNight.Logic.dll"
  csc "HollowNight.Logic (no engine references)" -langversion:7.3 -target:library \
    -out:"$OUT/HollowNight.Logic.dll" @"$OUT/logic.rsp"
  [ -f "$OUT/HollowNight.Logic.dll" ] && LOGIC_REF=("-r:$OUT/HollowNight.Logic.dll")
fi

# Scripts in folders owned by an asmdef belong to that assembly, not Assembly-CSharp.
ASMDEF_DIRS=$(find Assets -name "*.asmdef" -printf '%h\n' | sort -u)
in_asmdef() {
  local f=$1 d
  for d in $ASMDEF_DIRS; do case "$f" in "$d"/*) return 0 ;; esac; done
  return 1
}
: >"$OUT/game.rsp"
: >"$OUT/editor.rsp"
while IFS= read -r f; do
  in_asmdef "$f" && continue
  case "/$f" in */Editor/*) echo "$f" >>"$OUT/editor.rsp" ;; *) echo "$f" >>"$OUT/game.rsp" ;; esac
done < <(list Assets)

rm -f "$OUT/Assembly-CSharp.dll"
csc "Assembly-CSharp (editor)" -langversion:7.3 -target:library "${ENGINE[@]}" -r:"$OUT/UnityEngine.UI.dll" \
  "${LOGIC_REF[@]}" -out:"$OUT/Assembly-CSharp.dll" -define:"$DEFINES;UNITY_EDITOR" -nowarn:0618,0649,0414,0169 @"$OUT/game.rsp"
csc "Assembly-CSharp (player build)" -langversion:7.3 -target:library "${ENGINE[@]}" -r:"$OUT/UnityEngine.UI.dll" \
  "${LOGIC_REF[@]}" -out:"$OUT/Assembly-CSharp-player.dll" -define:"$DEFINES" -nowarn:0618,0649,0414,0169 @"$OUT/game.rsp"
if [ -s "$OUT/editor.rsp" ] && [ -f "$OUT/Assembly-CSharp.dll" ]; then
  csc "Assembly-CSharp-Editor" -langversion:7.3 -target:library "${ENGINE[@]}" \
    -r:"$OUT/UnityEngine.UI.dll" -r:"$OUT/Assembly-CSharp.dll" "${LOGIC_REF[@]}" \
    -out:"$OUT/Assembly-CSharp-Editor.dll" -define:"$DEFINES;UNITY_EDITOR" -nowarn:0618,0649,0414,0169 @"$OUT/editor.rsp"
fi

# Plain C# tests: they see Logic only, so they run outside Unity.
TEST_FAIL=0
if [ -n "$(list Tools/unity_tests)" ]; then
  list Tools/unity_tests >"$OUT/tests.rsp"
  # Every text id written as a literal in the game's code (the generated table itself excluded),
  # for StoryTests.EveryTextIdInTheGameCodeExistsInFourLanguages.
  {
    echo "public static class UsedIds { public static readonly string[] All = {"
    # Any "word.rest" literal is taken as an id (so a new prefix is checked too); file names are not.
    list Assets | grep -v "/Logic/TalesText.cs$" | tr '\n' '\0' | xargs -0 grep -ohE \
      '"[a-z][A-Za-z0-9]*\.[A-Za-z0-9][A-Za-z0-9._-]*"' | grep -vE '\.(png|cs|wav|txt|json|unity|asset)"$' \
      | sort -u | sed 's/$/,/'
    echo "}; }"
  } >"$OUT/UsedIds.cs"
  echo "$OUT/UsedIds.cs" >>"$OUT/tests.rsp"
  rm -f "$OUT/unity_tests.dll"
  csc "unity_tests" -langversion:7.3 -target:exe "${LOGIC_REF[@]}" -out:"$OUT/unity_tests.dll" @"$OUT/tests.rsp"
  if [ -f "$OUT/unity_tests.dll" ]; then
    RT=$(ls "$E/DotNetSdk/shared/Microsoft.NETCore.App" | sort -V | tail -1)
    printf '{"runtimeOptions":{"tfm":"net8.0","framework":{"name":"Microsoft.NETCore.App","version":"%s"}}}\n' "$RT" \
      >"$OUT/unity_tests.runtimeconfig.json"
    "$DOTNET" "$OUT/unity_tests.dll"
    TEST_FAIL=$?
  fi
fi

echo "unity_check: $ERRORS compile error(s), $TEST_FAIL failed test(s)"
[ "$ERRORS" -eq 0 ] && [ "$TEST_FAIL" -eq 0 ]
