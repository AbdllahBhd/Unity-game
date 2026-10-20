---
name: ui-quality
description: Baseline premium UI/UX criteria. Use when creating or modifying any UI screen, component, page, or layout, and when reviewing UI changes — web or mobile.
---

# UI Quality — the premium baseline, applied without being asked

Make every screen pass this bar on the FIRST attempt — the user should never
have to say "make it premium" or "polish it".

## Rule zero: the project's design system wins

If the project has a design system (component library, tokens, theme package),
USE it — its components, spacing, colors, type scale. These criteria then apply
to how you compose, not what you invent. Never introduce one-off colors,
shadows, or spacing values when tokens exist. (Stronger per-project doctrines —
Impeccable, XIAS, apple-design — are listed in CATALOG.md; when one is
installed in the project, it outranks this baseline.)

## The baseline criteria (self-audit before presenting ANY UI)

**Hierarchy** — one primary action per view, visually dominant. Every element
has an obvious importance level; if two things compete, demote one.

**Spacing** — one scale (4 or 8 px base), applied consistently. Whitespace is
a feature: crowded = cheap. Align to a grid; no arbitrary pixel nudges.

**Typography** — max 2 font families; a deliberate type scale (not 13/14/15/16
chaos); line length 45–75 chars for reading; real hierarchy via weight+size,
not size alone.

**Color** — limited palette from tokens; one accent doing the "look here" job;
text contrast ≥ 4.5:1 (3:1 for large text); never color as the only signal.

**States — the premium tell.** Every interactive element has visible hover/
focus/pressed/disabled states. Every screen has designed loading, empty, and
error states — an unstyled spinner or raw error string fails this skill.

**Touch & input** — targets ≥ 44px; keyboard navigable on web; focus visible.

**Responsiveness** — works at phone width without horizontal scroll; wide
screens get intentional composition (not a stretched phone layout).

## The self-review loop (always, silently)

Before presenting UI work: re-read this checklist against what you built, fix
what fails, THEN present — mentioning anything you deliberately traded off.
When a browser/preview is available, LOOK at the result (screenshot) instead
of trusting the code; for Flutter, state what you verified and how.

## Anti-slop list (instant fails)

Default-looking Bootstrap-ish cards with heavy borders AND shadows; gradient
buttons from 2015; 5 font sizes within one component; emoji as icons in
production UI; placeholder text left visible ("Lorem", "Click here");
misaligned anything.
