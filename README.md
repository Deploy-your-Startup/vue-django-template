# Vue + Django/FastAPI template

Reusable Copier startup harness extracted from example-app and the Django backend
template: a neutral portfolio, Vue/TypeScript/TanStack Query, Django/FastAPI,
Postgres, integration tests, a real full-stack Playwright test and Ansible/k3s deployment.
No personal content, private integrations or credentials are copied from example-app.
Auth0 is optional; `mise run dev` and E2E use a mock OIDC provider and real OAuth2 Proxy.

```bash
startup bootstrap --kind fullstack --template https://github.com/Deploy-your-Startup/vue-django-template.git --template-version main --auth0-tenant <your-tenant.eu.auth0.com>
```

Source of truth for the product vision: [Deploy Your Startup](https://deploy-your-startup.com).

## Shared clusters

Use a compatible Startup CLI and shared deployment release to bootstrap a
cluster owner with `--shared-cluster`, then attach additional trusted projects
with `--cluster <descriptor>`. Each application keeps its own namespace, Vault,
database and media volumes. The owner manages cluster-wide operations, including
Ubuntu release upgrades. Review policies and per-startup backups before
maintenance; local volumes do not provide storage failover. `deploy_ref` selects
a reviewed shared deployment ref for generated workflows (default: `main`).

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
