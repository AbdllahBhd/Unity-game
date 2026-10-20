---
name: motion
description: UI motion and animation rules. Use when adding, changing, or reviewing any animation, transition, or micro-interaction, in web or mobile (Flutter/native) UI.
---

# Motion — animation rules that read as premium

Premium motion is restraint + consistency, not spectacle. Apply these rules to
every animation without being asked.

## What may animate (and nothing else)

1. **State changes** — something appeared, closed, succeeded, failed.
2. **User feedback** — press, drag, hover acknowledgement.
3. **Navigation context** — where did this screen come from / go to.

Pure decoration animates nothing. If removing the animation loses no meaning,
remove the animation.

## The numbers (use these, don't improvise)

- **Micro-interactions** (press, toggle, hover): 150–250 ms.
- **Transitions** (panels, dialogs, navigation): 300–400 ms.
- **Never above 500 ms** on anything the user triggers repeatedly.
- **Easing:** decelerate on enter (ease-out), accelerate on exit (ease-in),
  standard curves only. Define ONE duration/easing token scale per project and
  reuse it everywhere — consistency beats cleverness.
- **Stagger** list items by 20–50 ms, capped: after ~6 items, the rest appear
  together.

## Hard rules

- **Never block input** while animating; animations are interruptible.
- **Respect reduced-motion** (CSS `prefers-reduced-motion`, Flutter
  `MediaQuery.disableAnimations`) — provide the no-motion path.
- Loading states: skeletons/subtle pulses, not spinners everywhere; no looping
  attention-grabbers in persistent UI.
- If the project defines motion tokens in its design system, those WIN over the
  numbers above.

## Flutter / mobile

- Prefer implicit animations (`AnimatedContainer`, `AnimatedOpacity`,
  `AnimatedSwitcher`) — explicit `AnimationController` only for choreography.
- `Hero` for shared-element navigation; platform page transitions by default.
- Jank discipline: `const` constructors, isolate repaints (`RepaintBoundary`)
  for hot animations, never animate layout when transform/opacity suffices.

## Web

- CSS transitions/keyframes first; a JS motion library (Framer Motion etc.)
  only for genuine choreography (shared layout, exit animations, gestures).
- Animate `transform` and `opacity` only (compositor-friendly); never animate
  `width/height/top/left` when a transform works.
- Hover states still need visible non-hover affordances (touch devices).
