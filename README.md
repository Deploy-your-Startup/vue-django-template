# Vue + Django/FastAPI template

Build a startup on a reusable Copier foundation: a customizable portfolio,
Vue/TypeScript/TanStack Query, Django/FastAPI,
Postgres, integration tests, a real full-stack Playwright test and Ansible/k3s deployment.
Auth0 is optional; `mise run dev` and E2E use a mock OIDC provider and real OAuth2 Proxy.

Follow the [public prerequisites](https://deploy-your-startup.com/get-started)
first: macOS, Chrome, GitHub, Hetzner Cloud and an owned domain. Servers and
domains are billed directly by their providers. Then install and verify the CLI:

```bash
curl -fsSL https://deploy-your-startup.com/install.sh | bash
gh auth login -h github.com -p https -s repo,workflow,read:packages,write:packages
gh auth setup-git
startup doctor
startup bootstrap --kind fullstack --provider hetzner --domain-owned \
  --project-name my-startup --base-domain example.com \
  --template https://github.com/Deploy-your-Startup/vue-django-template.git \
  --template-version v0.1.3 --without-auth
```

Use your own project name and domain. Verify GitHub Actions, DNS, HTTPS and the
application health before calling the first deployment complete. For an existing
owner deployment copy, preview and sync shared deployment `v0.1.5` before enabling
this template's required CI coverage. `startup sync` updates shared deployments;
`startup template update` updates application files.

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
only with both runtime values present, reviewed site-policy.json disclosures,
analytics set to consent and visitor permission; it respects Do Not Track. Use the funnel
`visit → cta_click → signup → activation → return`; page views supply `visit`
automatically. Mark meaningful actions with `data-umami-event="cta_click"` and
`data-umami-event-target`.

### KPI dashboard login

KPI tracking remains opt-in (`kpis_enabled: false`). Its login mode defaults to
`kpis_access_mode: password`, using Umami's admin credentials without requiring
an OAuth2 Proxy. Set `kpis_access_mode: oauth2_proxy` with
`oauth2_proxy_enabled: true` to reuse the existing proxy session for a read-only
traffic and events view. Set `kpis_allowed_emails` to the exact session emails
permitted to read metrics; OAuth mode requires a non-empty list and rejects
unlisted users without changing the application login policy.
Umami administration still requires its own account.

This mode requires a shared deployment revision containing the OAuth reader
configuration: sync that revision, review the project's role pin and workflow
references, then deploy. Existing group_vars are preserved by template updates.
See the [shared KPI configuration](https://github.com/Deploy-your-Startup/deploy-template/blob/main/roles/kpis/README.md).

See [legal information and local consent](template/docs/privacy.md) for operator configuration,
analytics opt-in and browser verification. No consent-service account is required.
