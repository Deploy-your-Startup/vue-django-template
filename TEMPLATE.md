# Maintaining the full-stack template

The template combines Vue/TypeScript, TanStack Query and a static nginx frontend
with a Django/FastAPI backend, Copier and deployment configuration.
Generated files live in template/.

The default app has a public portfolio and health API. Personal telemetry,
CV data, iOS, AI accounts and external OAuth credentials are project choices.
No write API depends on a missing proxy. All /api traffic is same-origin.

CI renders a new app and runs backend/frontend lint, tests and browser E2E.
The template contains only public questions. Existing group_vars are protected.

Shared workflow: pinned OpenAPI → TypeScript client, cookie-enabled
API services, TanStack Query and mutations, shared auth cache/router guards,
project/CV routes, protected dashboard writes, and per-test factory DB isolation.
Run `mise run backend:generate-client` after API changes; CI detects client drift.
The public/private split and `/docs` share the frontend origin. The sample Entry
model demonstrates the complete flow without copying personal integrations.

## Shared harness and project extensions

Keep backend/make.sh, frontend/make.sh, e2e_tests/make.sh,
e2e_tests/playwright.config.ts, e2e_tests/support/config.ts,
e2e_tests/scripts/start-auth-stack.sh, oauth2-proxy/make.sh and mise.toml
identical to the generated template. Extend them through project-owned files:

- frontend/runtime-env.sh initializes public runtime configuration before nginx.
- e2e_tests/support/project.config.ts supplies the backend readiness endpoint,
  frontend proxy topology and optional extra web servers (such as real Auth0).
- A service's executable make.project.sh handles extra commands.
- .mise/tasks/ adds project tasks without editing the shared mise.toml.

Copier seeds runtime-env.sh and project.config.ts only once. Keep application
APIs, models, factories, browser specs and extra service deployment roles in the
project. Resolve the initial adoption conflicts by aligning shared files; do not
freeze old harness implementations under the guise of customization.

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
