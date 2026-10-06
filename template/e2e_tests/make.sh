#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
case "${1:-}" in
    help|--help) echo 'Commands: setup_local test_e2e format lint'; exit 0 ;;
    setup_local) npm ci; npx playwright install chromium ;;
    test_e2e) shift; npm test -- "$@" ;;
    format) npm run format ;;
    lint) npm run format:check ;;
    *) if [ -x ./make.project.sh ]; then exec ./make.project.sh "$@"; fi; echo 'Usage: ./make.sh {setup_local|test_e2e|format|lint}' >&2; exit 2 ;;
esac
