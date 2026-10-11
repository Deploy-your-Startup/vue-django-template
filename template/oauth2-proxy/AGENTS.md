# Authentication

Reverse proxy: ingress → oauth2-proxy → backend for `/private_api`.
`/oauth2` uses the same origin as the frontend; sessions use HttpOnly cookies.
The negated `!=^/private_api` route keeps public endpoints anonymous.
Never route `/private_api` directly to the backend: it trusts the proxy's
Authorization header. Secrets come from Vault and Kubernetes Secret env vars.
Local development and E2E use the same mock OIDC/real proxy Compose profile.

## Shared authentication and KPI tracking

Production uses the synced `oauth2-proxy` and `kpis` roles, without project-owned
copies. Keep `oauth2_proxy_enabled: false` until Auth0 setup has saved the proxy
credentials. Existing projects using `oauth_enabled` must rename that setting
when migrating to this template; their group_vars are preserved by Copier.

New bootstrap projects enable cookieless KPI tracking at `kpis.<base_domain>`.
Bootstrap creates a stable public `kpis_website_id` and encrypts
`kpis_db_password`, `kpis_app_secret` and `kpis_admin_password`. Provide DNS for
that host. Read the admin password through `startup secrets get-field -f deployment/group_vars/production.yml --field kpis_admin_password`.

Set `kpis_enabled: false` and deploy the frontend to stop tracking; this skips
the role and preserves existing analytics data. The frontend loads one tracker
only with both runtime values present and respects Do Not Track. Use the funnel
`visit → cta_click → signup → activation → return`; page views supply `visit`
automatically. Mark meaningful actions with `data-umami-event="cta_click"` and
`data-umami-event-target`.
