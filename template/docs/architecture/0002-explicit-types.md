# Explicit function signatures

**Status**: Accepted

## Context

Python and TypeScript both let a function's return type be inferred from its
body, so the public shape of a function becomes a side effect of its
implementation. Changing the body changes the contract silently, and the error
appears at a distant call site, or, in Python, not at all.

This matters most where services meet: the frontend's API client is generated
from the backend's OpenAPI schema, so an unannotated helper lets a contract
change travel through code without any single place reporting it.

## Decision

Declare parameter and return types on public interfaces: API and service
entry points, reusable exported functions and public methods. Their signatures
explain what callers can rely on.

Private Python helpers (names starting with `_`) may infer return types.
Internal TypeScript helpers and callbacks may use TypeScript's inference.
Do not repeat a library's result shape just to satisfy a blanket annotation
rule. `ReturnType<typeof function>` is appropriate when an adapter intentionally
preserves that function's contract; use a separate type for a stable domain API.

Python Ruff `ANN` rules enforce public signatures; `ANN202` is disabled for
private helper returns and `ANN401` permits honest framework-boundary `Any`.
TypeScript's compiler checks inferred types; public interface annotations are
reviewed rather than imposing return annotations on every local helper.
Test code is exempt.

## Consequences

- Public contract changes remain visible in signatures and diffs.
- Small helpers retain useful inference with less annotation maintenance.
- TypeScript public interface annotations require review.

## Alternatives considered

- **Explicit returns everywhere:** adds repeated library types and maintenance
  without strengthening small internal helpers.
- **Inference everywhere:** hides intended contracts at public interfaces.
