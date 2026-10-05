# Authentication

Reverse proxy: ingress → oauth2-proxy → backend for `/private_api`.
`/oauth2` uses the same origin as the frontend; sessions use HttpOnly cookies.
The negated `!=^/private_api` route keeps public endpoints anonymous.
Never route `/private_api` directly to the backend: it trusts the proxy's
Authorization header. Secrets come from Vault and Kubernetes Secret env vars.
Local development and E2E use the same mock OIDC/real proxy Compose profile.
