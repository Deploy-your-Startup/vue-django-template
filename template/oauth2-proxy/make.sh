#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
project="${AUTH_COMPOSE_PROJECT:-startup_auth_dev}"
case "${1:-}" in
  auth_up)
    docker compose --file "$root/backend/docker-compose.yml" --project-name "$project" --profile auth up --detach oidc mock-oauth2-proxy
    for _ in $(seq 1 60); do
      if curl -sf -o /dev/null "http://localhost:${MOCK_PROXY_PORT:-4180}/ping"; then exit 0; fi
      sleep 1
    done
    echo 'OAuth proxy did not become ready within 60 seconds.' >&2
    exit 1
    ;;
  auth_down)
    docker compose --file "$root/backend/docker-compose.yml" --project-name "$project" --profile auth stop oidc mock-oauth2-proxy
    ;;
  *) echo 'Usage: ./make.sh auth_up|auth_down' >&2; exit 2 ;;
esac
