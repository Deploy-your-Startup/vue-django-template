# Maintaining the full-stack template

Source architecture: about-phil (Vue/TypeScript, TanStack Query, static nginx
frontend, service conventions) and django-backend-template (Copier, backend,
Vault seeds, infrastructure). Generated files live in template/.

The default app has a public portfolio and health API. Personal telemetry,
CV data, iOS, AI accounts and external OAuth credentials are project choices.
No write API depends on a missing proxy. All /api traffic is same-origin.

CI renders a new app and runs backend/frontend lint, tests and browser E2E.
The template contains only public questions. Existing group_vars are protected.

Shared About Phil workflow: pinned OpenAPI → TypeScript client, cookie-enabled
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
