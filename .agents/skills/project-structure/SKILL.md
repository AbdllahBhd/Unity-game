---
name: project-structure
description: Recognized folder structures and architecture choices per technology stack. Use when scaffolding a new project or module, proposing a folder layout, or deciding whether clean architecture fits.
---

# Project Structure — recognized layouts per stack

Pick the layout the stack's community actually uses — a famous structure beats a
clever one, because every tool, tutorial, and new teammate assumes it.

## Decision rules (before any folders)

1. **Feature-first beats layer-first** for apps that will grow: group by feature
   (`features/orders/`) not by kind (`controllers/`, `models/`). Layer-first is
   acceptable for small services (<~10 endpoints).
2. **Clean architecture (domain/data/presentation + inversion) earns its weight
   when:** the domain logic is genuinely complex, multiple data sources must be
   swappable, or the team is 3+. For a CRUD app or MVP it's overhead — choose
   the stack's idiomatic default instead, and say so in the plan.
3. Never invent names: use the stack's conventional directory names below.
4. State the choice in the plan with one line of why, and record it in
   CLAUDE.md's architecture notes once approved.

## Flutter

```
lib/
├── features/<feature>/        # feature-first
│   ├── data/                  # repositories impl, DTOs, data sources
│   ├── domain/                # entities, repository interfaces, usecases (only if clean arch)
│   └── presentation/          # screens, widgets, state (provider/riverpod/bloc)
├── core/                      # theme, routing, DI, constants, shared utils
└── shared/widgets/            # cross-feature reusable widgets
test/                          # mirrors lib/
```
Small app: drop `domain/`, keep `data/` + `presentation/` per feature.

## Next.js (App Router)

```
app/<route>/page.tsx           # routes = folders
components/ (ui/ + features/)  # shared vs feature components
lib/                           # data access, helpers, server-side logic
hooks/  types/  public/
```
Server components by default; `"use client"` only where interaction demands it.

## Node.js API (Express/Fastify)

```
src/
├── routes/        # thin: parse/validate → call service
├── services/      # business logic (the only place it lives)
├── repositories/  # data access
├── middleware/  models/  utils/  config/
tests/             # mirrors src/
```

## Python (FastAPI)

```
app/
├── api/routes/     # endpoint modules per resource
├── core/           # config, security, startup
├── models/  schemas/  services/  repositories/
tests/
```

## Laravel / PHP

Follow the framework skeleton exactly (`app/Http/Controllers`, `app/Models`,
`app/Services`, `database/migrations`...). Framework-strong ecosystems punish
deviation; add `app/Services` + `app/Actions` for business logic rather than
fat controllers.

## Monorepo (any stack)

```
apps/<app-name>/       # deployable applications
packages/<pkg-name>/   # shared libraries (ui, config, types)
```
Tooling: turborepo/nx (JS), melos (Dart). Each package owns its tests.

## Universal rules

- Tests mirror source structure, always.
- One obvious home per thing — if a file could live in two places, the structure
  is wrong, fix the structure not the file.
- `docs/` for human docs; scripts in `scripts/`; environment examples as
  `.env.example` (never real `.env`).
