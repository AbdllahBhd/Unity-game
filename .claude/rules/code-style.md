# Code Style Rules

> Loaded via CLAUDE.md. Keep this file SHORT: per Anthropic's guidance, only list
> rules that DIFFER from what a competent engineer would do by default — standard
> conventions (camelCase, const over let, early returns...) are already known and
> listing them just adds noise. Style is owned by the formatter/linter.

## The linter owns style

- Formatting and standard style are enforced by the project's formatter/linter
  (Prettier/ESLint/etc.) — obey them, never hand-format against them.
- Run `npm run lint` after edits; fix what it reports.

## Project-specific deviations (edit per project — delete lines that don't apply)

- <List ONLY your team's non-default choices here. Examples of the kind of rule
  that belongs: "We use snake_case file names, not kebab-case" · "No default
  exports, ever" · "All money values are integer cents, never floats" ·
  "Imports from `internal/` are forbidden outside `core/`">

## Hard rules worth repeating (non-default or often violated)

- No `any` — use `unknown` and narrow, or define a proper type.
- Never swallow errors silently (`catch {}` is forbidden); throw `Error`
  subclasses with descriptive messages.
- No `TODO` comments without an issue/ticket reference.
- Comment **why**, never **what**; no comments narrating your changes.
