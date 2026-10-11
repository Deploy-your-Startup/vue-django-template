#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
uv run --no-project --with copier==9.18.2 --with pyyaml==6.0.3 --with ansible==14.4.0 \
  python "$root/tests/render_roles_check.py" "$root"
