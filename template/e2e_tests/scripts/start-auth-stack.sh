#!/usr/bin/env bash
set -euo pipefail
make="$(cd "$(dirname "$0")/../../oauth2-proxy" && pwd)/make.sh"
"$make" auth_up
trap '"$make" auth_down >/dev/null 2>&1 || true' EXIT INT TERM
while true; do sleep 2; done
