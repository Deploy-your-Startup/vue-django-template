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

Every named function and method in production code declares its parameter and
return types. `None` / `void` / `Promise<void>` are written out, not omitted.

The linters enforce it, so the rule does not depend on review:

- **Python:** Ruff's `ANN` rules. `ANN401` is ignored because `Any` is
  sometimes the honest type at a framework boundary.
- **TypeScript and Vue:** Oxlint's `typescript/explicit-function-return-type`
  with `allowExpressions`, `allowTypedFunctionExpressions` and
  `allowHigherOrderFunctions`, so inline callbacks and functions assigned to an
  already typed target are not annotated twice.

Test code is exempt: its signatures carry no contract for other code. A helper
that moves from test code into production code acquires the requirement.

Derived annotations such as `ReturnType<typeof someFunction>` do not satisfy
the intent, because they restate the inference instead of replacing it.

## Consequences

- A change to a function's result is reported at that function and shows up in
  the diff as an edited signature.
- Readers and agents learn the contract from the signature without reading the
  body.
- Some signatures get verbose, for example query hooks returning
  `UseQueryReturnType<...>`.

## Alternatives considered

- **Annotate only module boundaries:** half the annotations, but internal
  helpers stay inferred, and the boundary that matters here (the generated API
  client) is not the one such a rule checks.
- **Convention without lint:** costs nothing to adopt and is not upheld under
  review pressure.
