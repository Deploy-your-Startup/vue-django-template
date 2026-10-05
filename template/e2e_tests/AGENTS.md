# Browser tests

`mise run e2e:test` starts the real frontend, backend, mock OIDC and OAuth2 Proxy
on ports separate from development. support/config.ts owns their ports and DB URL.
Use support/fixtures.ts for tests: it empties the isolated DB before each test and
blocks third-party browser traffic. Arrange data with real write endpoints or the
backend factories via support/seed.ts. Write GIVEN / WHEN / THEN tests.

E2E_BASE_URL enables read-only live smoke tests. It starts no local servers and
never seeds or flushes data. Tests that log in to the mock or create data skip in
that mode. For real provider login use startup auth0 validate after deployment.
