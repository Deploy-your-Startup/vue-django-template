# Vue + Django/FastAPI template

Reusable Copier startup harness extracted from about-phil and the Django backend
template: a neutral portfolio, Vue/TypeScript/TanStack Query, Django/FastAPI,
Postgres, unit tests, a real full-stack Playwright test and Ansible/k3s deployment.
No personal content, private integrations or credentials are copied from about-phil.
Auth0 is optional; `mise run dev` and E2E use a mock OIDC provider and real OAuth2 Proxy.

```bash
startup bootstrap --kind fullstack --template https://github.com/Deploy-your-Startup/vue-django-template.git --template-version main --auth0-tenant <your-tenant.eu.auth0.com>
```

Source of truth for the product vision: [Deploy Your Startup](https://deploy-your-startup.com).
