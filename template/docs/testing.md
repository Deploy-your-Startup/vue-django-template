# Test coverage

Run `backend/make.sh coverage` for integration coverage and
`STARTUP_COVERAGE=true e2e_tests/make.sh test_e2e` for browser coverage. The backend combines available
integration and E2E data through `backend/make.sh coverage_report`. Delete the service's
`coverage/` directory before a fresh measurement.

Normal local tests and browser runs do not measure coverage.

Each measured service writes `coverage/cobertura.xml` with service-relative paths.
The service owns the measurement tools; shared pipelines consume only Cobertura.
Generated backend workflows enable `require_coverage: true`: successful tests
without a valid report fail CI. There is no percentage threshold.

Build pipelines publish integration coverage in the job summary, a sticky PR
comment and a `coverage-backend` artifact. PR comment permissions may be unavailable
for forks; the summary and artifact remain available.

Vue browser tests also write `frontend/coverage/cobertura.xml`. The E2E pipeline
requires both backend and frontend reports and uploads them as the `coverage`
artifact. Its backend report combines integration and browser measurements.

## Parallel container checks

The shared application workflow runs integration tests, production image builds
and isolated browser shards concurrently: one by default, more through
`e2e_shards`. Every service waits for the same E2E gate before its
already-built production image can be published. Browser
and OIDC tooling lives in `e2e_tests/Dockerfile`; production images stay unchanged.
Each Compose shard owns its database and reports. Run `./make.sh ci_e2e` in that
image with `SHARD_INDEX` and `SHARD_TOTAL`; the shared workflow collects `/reports`.
Integration coverage and per-shard browser coverage remain separate artifacts.
Backend integration tests use two workers; set `TEST_WORKERS=0` to debug serially.
