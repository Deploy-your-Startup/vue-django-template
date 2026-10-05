# Frontend
Vue + TypeScript with TanStack Query for API state. Content lives in
src/data/profile.ts. Keep personal data and secrets out of the reusable template.
make.sh format writes; lint checks formatting, ESLint and types. test runs Vitest.
/api is proxied to the backend by Vite locally and nginx in production.
Use factories and one GIVEN / WHEN / THEN action for tests.
