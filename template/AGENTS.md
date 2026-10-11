# Startup project instructions

Vue and TypeScript provide the portfolio frontend; edit frontend/src/data/profile.ts.
The backend combines Django and FastAPI in one ASGI application. Use the service
runtime selected by `.python-version` and global uv; Node is selected by mise.

```bash
mise run backend:dev
mise run backend:lint
mise run backend:test
mise run backend:generate-client
mise run e2e:test
```

Each service owns its `make.sh` contract: `format` changes files, `lint` only
checks them. Run the versions pinned in pyproject.toml through uv run. CI must
only lint, never format. Do not add pre-commit hooks.

After API changes run `mise run backend:generate-client`. The pinned OpenAPI
Generator exports the schema without a running server or database and produces
the TypeScript client used by the frontend. CI checks it with `--check`; never
hand-edit generated files. API docs are at `/docs` on the frontend origin.

Vue Router uses the shared QueryClient and `useAuth` for guarded routes. API
calls use the generated service with `credentials: include`; tokens stay with
OAuth2 Proxy. `/dashboard` demonstrates a protected write and query invalidation.

Tests create entities through factories, use GIVEN / WHEN / THEN and start with
an empty database. Keep business logic in services and routes/views thin.
E2E uses a separate database and server; never point its flush at development
or production data. Local Postgres is started by Compose only when DATABASE_URL
is absent. Configure LOCAL_DB_NAME and POSTGRES_PORT for concurrent stacks.

Always use startup CLI for deployment, Ansible and Vault operations. Never print
or persist decrypted secrets. Ask before destructive restore or secret rotation.

## Working conventions

- KEEP IT SIMPLE: avoid over-engineering, premature abstractions and
  unnecessary configuration. Prefer plain, readable code over clever code.
- Never push directly to `main`; use a feature branch and a pull request.
  Branch names and commit format: [`.github/git-commit-instructions.md`](.github/git-commit-instructions.md).
- **Pull request titles and descriptions are always in English**, even when the
  conversation was in another language.
- Tests: integration and E2E tests only, never unit tests, and no mocks; start
  a small stand-in service for an external dependency instead (ADR 0001).
  Structure every test as GIVEN / WHEN / THEN.
- Before finishing, run lint and tests for every service you changed, and E2E
  for user-visible changes.

## Code style

- Prefer descriptive names over abbreviations, also for loop variables.
- Boolean functions and variables start with `is`, `has`, `can` or `should`.
- Prefer explicit code and setup over implicit conventions. In tests, keep
  scenario-specific data visible in the test instead of hiding it in shared
  magic values.
- Declare parameter and return types on every named function and method
  (ADR 0002); the linters enforce it, test code is exempt.
- Keep entry points (routes, views, commands) readable orchestrators: extract
  validation, persistence and side effects into named functions when they
  obscure the flow.
- Comment the why, not the what; document a rule once at its interface
  (ADR 0003).

## Architecture decisions

Record decisions that shape the project as numbered ADRs in
`docs/architecture/` and list them here with when to load them.

- [ADR 0001](docs/architecture/0001-test-strategy.md) — load when writing tests or choosing a test level or test infrastructure.
- [ADR 0002](docs/architecture/0002-explicit-types.md) — load when adding or changing production functions.
- [ADR 0003](docs/architecture/0003-documentation-at-interfaces.md) — load when adding comments, documentation or an ADR.
- [ADR 0004](docs/architecture/0004-application-structure.md) — load for topology, stack, authentication or database choices.
- [ADR 0005](docs/architecture/0005-service-command-contract.md) — load when adding a service or changing make.sh, mise tasks or CI.

## Template updates (Copier)

From the repo root with a clean working tree:

```bash
startup template update --version main --dry-run
startup template update --version main
```

Review the diff, resolve conflicts, run affected lint/tests/E2E, then commit
including `.copier-answers.yml`. A separate branch is optional; Copier does
not commit, push or deploy. Use a tag/commit instead of `main` for a fixed target.
Do not edit Copier answers manually. Existing deployment/group_vars files are
preserved. `startup sync` handles shared deployment roles/workflows separately.

Authentication: `mise run dev` starts a mock OIDC provider and the real
OAuth2 Proxy. Production login is configured with `startup bootstrap
--auth0-tenant <tenant>` or `startup auth0 setup`. Credentials stay in Vault.
`/private_api` must only be exposed through the proxy; it validates tokens.
Before bootstrap: `startup auth0 check --tenant <tenant>`.
After deploy: `startup auth0 validate --tenant <tenant> --base-domain <domain>`.
Complete the real login in the browser; the check verifies the private API and
secure HttpOnly session without saving auth state. Never use agent-supplied passwords.
