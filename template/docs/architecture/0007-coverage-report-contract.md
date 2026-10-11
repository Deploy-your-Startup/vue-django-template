# Coverage as a standard report file

**Status**: Accepted

## Context

Coverage shows which code the tests never execute. Our tests are integration
and end-to-end tests only (ADR 0001), so coverage has to be measured where
those tests run: in the backend test process and in the servers the browser
tests start. The shared Deploy Your Startup pipelines serve projects in any
language (ADR 0005) and must not learn pytest-cov, coverage.py or V8.

## Decision

Coverage follows the service command contract. A service that measures
coverage writes one standard file, **`<service>/coverage/cobertura.xml`** in
Cobertura XML, with paths relative to the service directory. How it is
measured stays inside the service; consumers read only that file.

- **Backend:** `./make.sh test` runs the integration tests under pytest-cov.
  The browser tests start the backend with `run_dev --coverage true`, which runs
  the server under `coverage run`. `./make.sh coverage` combines whatever data
  exists, integration and E2E, into `coverage/cobertura.xml`; `test` and
  `e2e_tests/make.sh test_e2e` call it, so after a full local run the report
  reflects both test levels. Settings live in `[tool.coverage.*]` in
  `pyproject.toml`. Delete `coverage/` to start from nothing.
- **Frontend:** measured only through the browser tests. The Playwright
  fixtures collect Chromium's V8 coverage of the Vite dev server and map it back
  to `src/` with Vite's source maps (monocart-coverage-reports), writing
  `frontend/coverage/cobertura.xml`. Unvisited Vue, TypeScript and JavaScript
  modules are transformed by the project's Vite configuration and included at
  zero coverage. Generated API clients, declarations and test files are excluded.
- **CI:** the shared build workflow copies `<service>/coverage/cobertura.xml`
  out of the test container when `./make.sh test` wrote it. A small
  script in the shared repository adds its line and branch rates to the job
  summary and to one pull request comment per service. Services without the
  file are skipped silently. There is no threshold.

The build workflow sees only what `./make.sh test` measured in the container,
which for the backend is the integration tests. The E2E workflow uploads both
services' files, integration and E2E combined for the backend, as the
`coverage` artifact.

## Consequences

- A service in any language joins the report by writing one Cobertura file;
  coverage.py, Istanbul, JaCoCo and most other tools can produce it.
- Coverage reflects behaviour a user or API client can trigger, not isolated
  functions, so a low number points at untested flows.
- The E2E server stops on SIGTERM so it can save its data; killing it with
  SIGKILL loses that run's backend E2E coverage.
- Backend E2E coverage is not yet part of the pull request comment.

## Alternatives considered

- **A coverage SaaS or marketplace action:** convenient, but sends code
  metadata to a third party and ties the shared pipeline to one vendor.
- **Language-specific coverage steps in the shared pipeline:** precise, but
  breaks the language independence of ADR 0005.
- **Unit tests for coverage:** excluded by ADR 0001; they would raise the
  number without testing user-visible behaviour.
- **Istanbul instrumentation of the Vite build:** adds a build plugin and a
  separate instrumented build; V8 coverage needs no change to the frontend.

## Later steps

- Show the change against `main` and offer an optional threshold input.
- Report the combined E2E coverage from a shared E2E workflow.
