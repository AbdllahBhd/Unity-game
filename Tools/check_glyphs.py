"""Check that every character of the tales' text exists in the font that will draw it.

UnityEngine.UI.Text draws a missing glyph as an empty box, so each language's text is
checked against its font's character set (read with fc-query):
  Taqbaylit, French, English  -> Assets/Resources/HN/Fonts/NotoSans.ttf
  Arabic                      -> Assets/Resources/HN/Fonts/NotoSansArabic.ttf, including
                                 every joined form the shaper (ArabicText) can produce
It also reports, for information, how many lines the decorative fonts (Creepster,
Luckiest Guy) can draw; the game falls back to Noto Sans for the others.

Usage: python3 Tools/check_glyphs.py      (exit code 1 when a glyph is missing)
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FONTS = os.path.join(ROOT, "Assets", "Resources", "HN", "Fonts")
TEXT = os.path.join(ROOT, "Tools", "design", "original", "text.js")

# Presentation forms the shaper emits: the lam-alef ligatures and every joined letter form.
SHAPED = [chr(c) for c in range(0xFE80, 0xFEFD)]


def charset(font):
    out = subprocess.run(["fc-query", "--format=%{charset}", font], capture_output=True, text=True, check=True).stdout
    cps = set()
    for part in out.split():
        lo, _, hi = part.partition("-")
        cps.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return cps


def load_text():
    with open(TEXT, encoding="utf-8") as fh:
        body = fh.read()
    return json.loads(body[body.index("{"): body.rindex("}") + 1])


def missing(chars, font):
    have = charset(os.path.join(FONTS, font))
    return sorted({c for c in chars if c not in "\n" and ord(c) not in have})


def main():
    table = load_text()
    failures = 0
    plan = [("tq fr en", ["tq", "fr", "en"], "NotoSans.ttf", []), ("ar", ["ar"], "NotoSansArabic.ttf", SHAPED)]
    for label, langs, font, extra in plan:
        # Placeholders such as {n} are replaced by numbers before they are drawn.
        texts = [re.sub(r"\{\w+\}", "", entry[lang]) for entry in table.values() for lang in langs]
        chars = {c for t in texts for c in t} | set(extra) | set("0123456789")
        gone = missing(chars, font)
        if gone:
            failures += 1
            print(f"FAIL {label}: {font} lacks " + " ".join(f"{c} U+{ord(c):04X}" for c in gone))
        else:
            print(f"ok   {label}: {font} draws all {len(chars)} characters")
    for font in ("Creepster.ttf", "LuckiestGuy.ttf"):
        have = charset(os.path.join(FONTS, font))
        lines = [(i, e[l]) for i, e in table.items() for l in ("tq", "fr", "en")]
        drawable = sum(all(ord(c) in have for c in s) for _, s in lines)
        print(f"info {font} draws {drawable}/{len(lines)} Latin lines; the rest fall back to Noto Sans")
    sys.exit(1 if failures else 0)


main()
