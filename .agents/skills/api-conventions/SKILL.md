---
name: api-conventions
description: REST API design conventions for this project. Use when designing, implementing, or modifying any API endpoint, request/response shape, or error handling at the API boundary.
---

# API Conventions

> Loaded on demand when working on APIs (so non-API sessions don't pay for it).
> Adapt to REST/GraphQL/RPC as your project requires.

## Endpoint Design (REST)

- Nouns, not verbs: `GET /users/:id`, not `GET /getUser`.
- Plural resource names: `/users`, `/orders`, `/order-items`.
- Nesting max 2 levels: `/users/:id/orders` is fine, deeper is not.
- Use the right verb: `GET` (read, no side effects), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (remove).

## Request / Response Shape

- JSON everywhere; keys in `camelCase`.
- Every list endpoint supports pagination: `?page=` and `?limit=` (default limit 20, max 100).
- Timestamps are ISO-8601 strings in UTC (`2026-01-15T09:30:00Z`).
- IDs are strings in payloads, even if numeric in the database.

## Error Responses

All errors use one consistent envelope:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User 123 was not found",
    "details": {}
  }
}
```

- `code` is a stable `UPPER_SNAKE_CASE` machine-readable string.
- `message` is human-readable, safe to show to end users (no stack traces, no SQL).
- HTTP status codes: 400 validation, 401 unauthenticated, 403 unauthorized, 404 missing, 409 conflict, 422 semantic error, 500 unexpected.

## Validation & Security

- Validate ALL input at the boundary (body, query, params, headers) before any logic runs.
- Never trust client-supplied IDs for ownership — always check the authenticated user actually owns the resource.
- Never log request bodies that may contain passwords or tokens.

## Versioning & Compatibility

- Breaking changes require a new version (`/v2/...`) or a documented migration.
- Adding optional fields is non-breaking; removing or renaming fields is always breaking.
- Update the API documentation / OpenAPI spec in the same PR as the change.
