#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p /reports
./make.sh lint
STARTUP_COVERAGE=false node --test support/coverage.disabled.integration.test.ts support/coverage.integration.test.ts
status=0
./make.sh test_e2e --shard="${SHARD_INDEX:-1}/${SHARD_TOTAL:-1}" || status=$?
for report in test-results playwright-report; do
    if [ -d "$report" ]; then cp -R "$report" /reports/; fi
done
for service in backend frontend; do
    if [ -d "../$service/coverage" ]; then cp -R "../$service/coverage" "/reports/$service-coverage"; fi
done
exit "$status"
