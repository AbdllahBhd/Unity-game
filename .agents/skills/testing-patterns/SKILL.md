---
name: testing-patterns
description: Testing conventions and patterns for this project. Use when writing, fixing, or reviewing tests, or when the user asks to add test coverage for new or existing code.
---

# Testing Patterns

How tests are written in this project. Follow these patterns whenever you create or modify tests.

## Framework & Layout

- **Test framework:** <e.g. Vitest / Jest / pytest — edit this>
- **Location:** tests mirror the source tree — `src/services/user.ts` → `tests/services/user.test.ts`.
- **Naming:** `<file-under-test>.test.<ext>`; describe blocks name the unit, test names state behavior.

## Test Structure: Arrange–Act–Assert

```ts
it("rejects orders with an empty cart", async () => {
  // Arrange
  const cart = makeCart({ items: [] });

  // Act
  const result = await submitOrder(cart);

  // Assert
  expect(result.ok).toBe(false);
  expect(result.error.code).toBe("EMPTY_CART");
});
```

- One behavior per test. If you need "and" in the test name, split it.
- Test names read as specifications: `"returns 404 when the user does not exist"`, not `"test getUser 2"`.

## What to Test (priority order)

1. **Happy path** of every public function/endpoint.
2. **Edge cases:** empty inputs, boundaries (0, 1, max), unicode, very large inputs.
3. **Error paths:** invalid input, missing resources, permission denied, downstream failures.
4. **Regressions:** every bug fix gets a test that fails without the fix.

## Test Data: Builders over Fixtures

Use builder functions with sensible defaults and targeted overrides:

```ts
function makeUser(overrides: Partial<User> = {}): User {
  return { id: "u1", name: "Test User", role: "member", ...overrides };
}
```

- Never share mutable state between tests; each test builds its own data.
- No magic values — if `42` matters, name it (`const MAX_RETRIES = 42`).

## Mocking Rules

- Mock at the boundary (HTTP clients, DB, clock, randomness) — never mock the unit under test.
- Prefer fakes/in-memory implementations over deep mock chains.
- Always control time (`vi.useFakeTimers()` / fixed clock) in tests involving dates.

## Anti-patterns (never do these)

- Asserting on implementation details (private calls, internal state).
- Sleeping (`setTimeout`) to "wait" — use proper async awaiting or fake timers.
- Snapshot tests for logic (fine for stable serialized output only).
- Tests that depend on execution order or on a previous test's side effects.
- Skipped (`it.skip`) or commented-out tests left in a PR.

## Definition of Done

A change is testable-done when: new logic is covered, all tests pass locally, and coverage of the touched files did not decrease.
