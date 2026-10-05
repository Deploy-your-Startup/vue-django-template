# §§deploy_your_startup.project_name§§
Vue + Django/FastAPI startup harness inspired by about-phil.

```bash
mise run dev
mise run backend:lint
mise run backend:test
mise run frontend:lint
mise run frontend:test
mise run e2e:test
```

Run ./frontend/make.sh setup_local and ./e2e_tests/make.sh setup_local once.
Edit frontend/src/data/profile.ts to make the portfolio yours. /api connects the
frontend to the backend on the same origin. Deployment uses your GitHub account,
Hetzner, k3s and shared Ansible roles through startup CLI.

Keep .copier-answers.yml committed; use startup template update --dry-run before
updates. Deployment variables and Vault files are preserved.
Product vision: https://deploy-your-startup.com

For a deployed-site smoke test (no local servers or database flush):

```bash
E2E_BASE_URL=https://§§deploy_your_startup.base_domain§§ mise run e2e:test
```
