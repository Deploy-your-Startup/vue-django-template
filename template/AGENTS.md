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

Local Postgres is started by Compose only when DATABASE_URL is absent.
Configure LOCAL_DB_NAME and POSTGRES_PORT for concurrent stacks.

Always use startup CLI for deployment, Ansible and Vault operations. Never print
or persist decrypted secrets. Ask before destructive restore or secret rotation.

## Testing

**Integration and E2E tests only. Never write unit tests.** Every behaviour
change ships with an integration test; changed user flows also get browser E2E.
Exercise the real application, PostgreSQL and service boundaries. Do not mock
our own code. Use a local stand-in for an external service (ADR 0001).

- **GIVEN:** arrange the relevant state explicitly with factories or real write
  endpoints. Name the scenario-specific values in the test.
- **WHEN:** perform one business action through the application's public interface.
- **THEN:** assert the result a user or API client observes, including persistence
  and side effects where relevant. Do not assert private helper calls.
- Each test starts with an empty, isolated database and must pass independently.
  Never seed or flush development or production data.
- Find browser elements by role and visible label. Test success, validation and
  permission failures as separate scenarios.

## Business logic

Keep business logic in **`services.py` per Django app or business area** (ADR 0006).
Routes, views and commands adapt input, call a service and return a response.
Services own business rules, queries, transactions and side effects; models
own data and row invariants. Avoid a single project-wide service collection.

## Working conventions

- KEEP IT SIMPLE: avoid over-engineering, premature abstractions and
  unnecessary configuration. Prefer plain, readable code over clever code.
- Never push directly to `main`; use a feature branch and a pull request.
  Branch names and commit format: [`.github/git-commit-instructions.md`](.github/git-commit-instructions.md).
- **Pull request titles and descriptions are always in English**, even when the
  conversation was in another language.
- Before finishing, run lint and tests for every service you changed, and E2E
  for user-visible changes.

## Code style

- Prefer descriptive names over abbreviations, also for loop variables.
- Boolean functions and variables start with `is`, `has`, `can` or `should`.
- Prefer explicit code and setup over implicit conventions. In tests, keep
  scenario-specific data visible in the test instead of hiding it in shared
  magic values.
- Declare parameter and return types at public interfaces (ADR 0002). Private
  Python helpers and internal TypeScript helpers may infer their return types.
  Keep callback inference; test code is exempt.
- Comment the why, not the what; document a rule once at its interface
  (ADR 0003).

## Architecture decisions

Record decisions that shape the project as numbered ADRs in
`docs/architecture/` and list them here with when to load them.

- [ADR 0001](docs/architecture/0001-test-strategy.md) — load when writing integration or E2E scenarios; includes GIVEN / WHEN / THEN and isolation.
- [ADR 0002](docs/architecture/0002-explicit-types.md) — load when adding or changing production functions.
- [ADR 0003](docs/architecture/0003-documentation-at-interfaces.md) — load when adding comments, documentation or an ADR.
- [ADR 0004](docs/architecture/0004-application-structure.md) — load for topology, stack, authentication or database choices.
- [ADR 0005](docs/architecture/0005-service-command-contract.md) — load when adding a service or changing make.sh, mise tasks or CI.
- [ADR 0006](docs/architecture/0006-business-logic-in-services.md) — load when adding business rules, queries, transactions or an entry point.
- [ADR 0007](docs/architecture/0007-coverage-report-contract.md) — load when changing test commands, coverage or the CI test reports.

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

## Shared authentication and KPI tracking

Production uses the synced `oauth2-proxy` and `kpis` roles, without project-owned
copies. Keep `oauth2_proxy_enabled: false` until Auth0 setup has saved the proxy
credentials. Existing projects using `oauth_enabled` must rename that setting
when migrating to this template; their group_vars are preserved by Copier.

New bootstrap projects leave KPI tracking disabled (`kpis_enabled: false`),
so the first deployment starts no KPI service. To enable cookieless tracking,
set `kpis_enabled: true`, provide DNS for `kpis.<base_domain>` and deploy the
`kpis` and `frontend` services.
Bootstrap creates a stable public `kpis_website_id` and encrypts
`kpis_db_password`, `kpis_app_secret` and `kpis_admin_password`. Read the admin password through `startup secrets get-field -f deployment/group_vars/production.yml --field kpis_admin_password`.

Set `kpis_enabled: false` and deploy the frontend to stop tracking; this skips
the role and preserves existing analytics data. Disabling tracking does not
remove an already deployed KPI service or release its resources. The frontend loads one tracker
only with both runtime values present and respects Do Not Track. Use the funnel
`visit → cta_click → signup → activation → return`; page views supply `visit`
automatically. Mark meaningful actions with `data-umami-event="cta_click"` and
`data-umami-event-target`.
