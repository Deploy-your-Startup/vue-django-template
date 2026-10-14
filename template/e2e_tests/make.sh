#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
case "${1:-}" in
    help|--help) echo 'Commands: setup_local test_e2e test_privacy format lint'; exit 0 ;;
    ci_e2e) exec ./scripts/ci-e2e.sh ;;
    setup_local) npm ci; npx playwright install chromium ;;
    # STARTUP_COVERAGE=true also measures coverage: the backend server's data is
    # combined with its integration tests into backend/coverage/cobertura.xml,
    # the frontend's is written to frontend/coverage/cobertura.xml.
    test_privacy) npx playwright test --config privacy.config.ts ;;
    test_e2e) shift; npm test -- "$@"; if [ -z "${E2E_BASE_URL:-}" ]; then ./make.sh test_privacy; fi; if [ "${STARTUP_COVERAGE:-false}" = true ] && [ -z "${E2E_BASE_URL:-}" ]; then ../backend/make.sh coverage_report; fi ;;
    format) npm run format ;;
    lint) npm run format:check ;;
    *) if [ -x ./make.project.sh ]; then exec ./make.project.sh "$@"; fi; echo 'Usage: ./make.sh {setup_local|test_e2e|test_privacy|format|lint}' >&2; exit 2 ;;
esac
