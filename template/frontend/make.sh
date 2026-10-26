#!/bin/sh
set -e
cd "$(dirname "$0")"
case "${1:-}" in
 help|--help) echo 'Commands: setup_local run_dev run_dev_auth run format lint test build'; exit 0 ;;
 setup_local) npm ci ;;
 run_dev) DIST_FOLDER=public ./kpis-runtime-env.sh; npm run dev ;;
 run_dev_auth)
    DIST_FOLDER=public ./kpis-runtime-env.sh
    BACKEND_SERVICE_URL="${BACKEND_SERVICE_URL:-http://localhost:4180}" \
    OAUTH2_PROXY_URL="${OAUTH2_PROXY_URL:-http://localhost:4180}" npm run dev ;;
 run) ./kpis-runtime-env.sh; if [ -x ./runtime-env.sh ]; then ./runtime-env.sh; fi; nginx -g "daemon off;" ;;
 format) npm run format; npm run lint:fix ;;
 lint) npm run format:check; npm run lint; npm run type-check; npm run lint:architecture ;;
 test) npm run test:unit -- --run; npm run test:architecture ;;
 build) npm run build ;;
 *) if [ -x ./make.project.sh ]; then exec ./make.project.sh "$@"; fi; echo 'Usage: ./make.sh {setup_local|run_dev|run|format|lint|test|build}'; exit 2 ;;
esac
