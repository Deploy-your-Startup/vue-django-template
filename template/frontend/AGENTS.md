# Frontend
Vue + TypeScript with TanStack Query for API state. Content lives in
src/data/profile.ts. Keep personal data and secrets out of the reusable template.
make.sh format writes; lint checks formatting, Oxlint, ESLint (Vue templates) and types.
/api is proxied to the backend by Vite locally and nginx in production.
Use factories and one GIVEN / WHEN / THEN action for tests.

The API client in src/services/backend/generated is generated, never edited.
Run `mise run backend:generate-client` from the root after changing the backend.
src/services/index.ts owns cookie-enabled API configuration. Use TanStack Query
for reads/mutations and the shared queryClient for router guards; auth is a server
fact via useAuth, never a token in browser storage. Edit profile.ts for projects
and CV content; dashboard shows the real protected write flow.

Oxlint checks all TypeScript; ESLint runs only the Vue template rules.
Declare signatures at public interfaces (ADR 0002). Internal helpers and
callbacks may infer return types; test files are exempt.

Components:
- Keep components small and focused on one responsibility; extract a
  subcomponent or a composable when one grows.
- Compose, don't drill props: a child that only forwards something exposes a
  slot and the parent renders it. State stays with the code that updates it.
- Components call their own composables (router, query client, auth) instead
  of receiving their results as props.
- Prefer native HTML elements (`<dialog>`, `<details>`, `<form>`) over
  reimplementing their behaviour with key listeners or focus handling.
- Keep interactions accessible: every control has a role and a visible label.
