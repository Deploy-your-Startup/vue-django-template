# Backend

Django models and FastAPI routes share one ASGI application. Keep routes thin,
business logic in each app's services.py (ADR 0006), and typed request/response
schemas in routes.py.
Public reads live under /api; protected writes under /private_api. The backend
trusts the proxy's Authorization header: never expose private routes directly.

After API changes: `./make.sh generate_client`. It uses pinned OpenAPI Generator
7.24.0 and the frontend's pinned Prettier; no server or database is required.
`./make.sh generate_client --check` checks without rewriting the client.

Tests use factories, GIVEN / WHEN / THEN, and an empty database. For synchronous
FastAPI database routes use TransactionTestCase so the server thread sees fixtures
and writes are cleaned up between tests. e2e_support bridges the same factories
to Playwright and is installed only in development. Never add a seed HTTP endpoint.

Declare parameter and return types on every function and method (ADR 0002);
Ruff enforces it, tests and e2e_support are exempt. Never mock our own code or
patch external clients in tests: point the client at a small local stand-in
service instead (ADR 0001).

Integration and E2E tests only, never unit tests (ADR 0001). Exercise real
persistence and collaborators; do not mock services. Keep GIVEN / WHEN / THEN
explicit, with one business action per scenario.
