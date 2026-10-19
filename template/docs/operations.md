# Authentication, KPI tracking and template updates

## Authentication

`mise run dev` starts a mock OIDC provider and the real OAuth2 Proxy. Production
login is configured with `startup bootstrap --auth0-tenant <tenant>` or
`startup auth0 setup`; credentials stay in Vault. `/private_api` must only be
exposed through the proxy, which validates tokens.

- Before bootstrap: `startup auth0 check --tenant <tenant>`.
- After deploy: `startup auth0 validate --tenant <tenant> --base-domain <domain>`.

Complete the real login in the browser; the check verifies the private API and
secure HttpOnly session without saving auth state. Never use agent-supplied
passwords.

Production uses the synced `oauth2-proxy` and `kpis` roles, without project-owned
copies. Keep `oauth2_proxy_enabled: false` until Auth0 setup has saved the proxy
credentials. Existing projects using `oauth_enabled` must rename that setting
when migrating to this template; their group_vars are preserved by Copier.

## KPI tracking

New bootstrap projects leave KPI tracking disabled (`kpis_enabled: false`), so
the first deployment starts no KPI service. To enable cookieless tracking, set
`kpis_enabled: true`, provide DNS for `kpis.<base_domain>` and deploy the `kpis`
and `frontend` services. Bootstrap creates a stable public `kpis_website_id` and
encrypts `kpis_db_password`, `kpis_app_secret` and `kpis_admin_password`. Read
the admin password through
`startup secrets get-field -f deployment/group_vars/production.yml --field kpis_admin_password`.

Set `kpis_enabled: false` and deploy the frontend to stop tracking; this skips
the role and preserves existing analytics data, but does not remove an already
deployed KPI service or release its resources. The frontend loads one tracker
only with both runtime values present, reviewed site-policy.json disclosures,
analytics set to consent and visitor permission; it respects Do Not Track (see
[Privacy](privacy.md)). Use the funnel `visit → cta_click → signup → activation
→ return`; page views supply `visit` automatically. Mark meaningful actions with
`data-umami-event="cta_click"` and `data-umami-event-target`.

## Template updates (Copier)

From the repo root with a clean working tree:

```bash
startup template update --version <release-tag> --dry-run
startup template update --version <release-tag>
```

Review the diff, resolve conflicts, run affected lint/tests/E2E, then commit
including `.copier-answers.yml`. Copier does not commit, push or deploy. Do not
edit Copier answers manually. Existing deployment/group_vars files are
preserved. `startup sync` handles shared deployment roles and workflows
separately. Treat the agent harness drift warning as a finding.
