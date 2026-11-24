#!/usr/bin/env bash
set -euo pipefail
if [[ "${E2E_KEYCLOAK:-}" == true ]]; then
  cd "$(dirname "$0")/.."
  compose=(docker compose -f keycloak.compose.yml --project-name "$AUTH_COMPOSE_PROJECT")
  realm_dir="$(mktemp -d)"
  export KEYCLOAK_REALM_FILE="$realm_dir/realm.json"
  trap '"${compose[@]}" down --volumes >/dev/null 2>&1 || true; rm -f "$KEYCLOAK_REALM_FILE"; rmdir "$realm_dir"' EXIT
  trap 'exit 0' INT TERM
  node --input-type=module <<'JS'
import { readFileSync, writeFileSync } from "node:fs";
const realm = JSON.parse(readFileSync("support/keycloak-realm.json", "utf8"));
realm.clients[0].redirectUris = [new URL("/oauth2/callback", process.env.PROXY_PUBLIC_ORIGIN).href];
writeFileSync(process.env.KEYCLOAK_REALM_FILE, JSON.stringify(realm));
JS
  "${compose[@]}" up -d
  while true; do sleep 2; done
fi
make="$(cd "$(dirname "$0")/../../oauth2-proxy" && pwd)/make.sh"
"$make" auth_up
trap '"$make" auth_down >/dev/null 2>&1 || true' EXIT INT TERM
while true; do sleep 2; done
