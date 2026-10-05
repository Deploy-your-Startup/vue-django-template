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
