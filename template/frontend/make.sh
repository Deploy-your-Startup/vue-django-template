#!/bin/sh
set -e
cd "$(dirname "$0")"
case "${1:-}" in
 help|--help) echo 'Commands: setup_local run_dev run_dev_auth run format lint test build'; exit 0 ;;
 setup_local) npm ci ;;
 run_dev) npm run dev ;;
 run_dev_auth)
    BACKEND_SERVICE_URL="${BACKEND_SERVICE_URL:-http://localhost:4180}" \
    OAUTH2_PROXY_URL="${OAUTH2_PROXY_URL:-http://localhost:4180}" npm run dev ;;
 run) if [ -x ./runtime-env.sh ]; then ./runtime-env.sh; fi; nginx -g "daemon off;" ;;
 format) npm run format; npm run lint:fix ;;
 lint) npm run format:check; npm run lint; npm run type-check ;;
 test) npm run test:unit -- --run ;;
 build) npm run build ;;
 *) if [ -x ./make.project.sh ]; then exec ./make.project.sh "$@"; fi; echo 'Usage: ./make.sh {setup_local|run_dev|run|format|lint|test|build}'; exit 2 ;;
esac
