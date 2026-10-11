# Browser tests

`mise run e2e:test` starts the real frontend, backend, mock OIDC and OAuth2 Proxy
on ports separate from development. support/config.ts owns their ports and DB URL.
Use support/fixtures.ts for tests: it empties the isolated DB before each test and
blocks third-party browser traffic. Arrange data with real write endpoints or the
backend factories via support/seed.ts. Write GIVEN / WHEN / THEN tests.

E2E_BASE_URL enables read-only live smoke tests. It starts no local servers and
never seeds or flushes data. Tests that log in to the mock or create data skip in
that mode. For real provider login use startup auth0 validate after deployment.

Local E2E ignores an inherited DATABASE_URL. To provide a disposable test
database explicitly, set E2E_DATABASE_URL; it is flushed before tests.

Put each independently understandable scenario in its own focused spec file.
Find elements by role and visible label, as the user does; add a data-testid
only when there is no such label. Import API types from the generated client
instead of duplicating them. Never mock: an external service the app calls gets
a small stand-in service started next to the stack, like the mock OIDC provider.

`test_e2e` also measures coverage (see docs/testing.md): support/coverage.ts records the
frontend in Chromium, and the backend server runs under coverage.py. Keep its
SIGTERM shutdown in playwright.config.ts; a killed server loses its data.
