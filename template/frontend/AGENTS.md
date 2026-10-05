# Frontend
Vue + TypeScript with TanStack Query for API state. Content lives in
src/data/profile.ts. Keep personal data and secrets out of the reusable template.
make.sh format writes; lint checks formatting, ESLint and types. test runs Vitest.
/api is proxied to the backend by Vite locally and nginx in production.
Use factories and one GIVEN / WHEN / THEN action for tests.

The API client in src/services/backend/generated is generated, never edited.
Run `mise run backend:generate-client` from the root after changing the backend.
src/services/index.ts owns cookie-enabled API configuration. Use TanStack Query
for reads/mutations and the shared queryClient for router guards; auth is a server
fact via useAuth, never a token in browser storage. Edit profile.ts for projects
and CV content; dashboard shows the real protected write flow.
