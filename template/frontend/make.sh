#!/bin/sh
set -e
cd "$(dirname "$0")"
case "${1:-}" in
 setup_local) npm ci ;;
 run_dev) npm run dev ;;
 run) nginx -g "daemon off;" ;;
 format) npm run format; npm run lint:fix ;;
 lint) npm run format:check; npm run lint; npm run type-check ;;
 test) npm run test:unit -- --run ;;
 build) npm run build ;;
 *) echo 'Usage: ./make.sh {setup_local|run_dev|run|format|lint|test|build}'; exit 2 ;;
esac
