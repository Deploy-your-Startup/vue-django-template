#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
action="${1:-}"
if [ "$action" != auth_up ] && [ "$action" != auth_down ]; then
    if [ -x "$root/oauth2-proxy/make.project.sh" ]; then exec "$root/oauth2-proxy/make.project.sh" "$@"; fi
    echo 'Usage: ./make.sh auth_up|auth_down' >&2; exit 2
fi
shift
project="${AUTH_COMPOSE_PROJECT:-startup_auth_dev}"
backend_port="${BACKEND_PORT:-8000}"
proxy_port="${MOCK_PROXY_PORT:-4180}"
oidc_port="${OIDC_PORT:-8090}"
public_origin="${PROXY_PUBLIC_ORIGIN:-http://localhost:8080}"
while [ $# -gt 0 ]; do
    if [ $# -lt 2 ]; then echo "Missing value for $1" >&2; exit 2; fi
    case "$1" in
        --project) project="$2" ;;
        --backend_port) backend_port="$2" ;;
        --proxy_port) proxy_port="$2" ;;
        --oidc_port) oidc_port="$2" ;;
        --public_origin) public_origin="$2" ;;
        *) echo "Unknown option: $1" >&2; exit 2 ;;
    esac
    shift 2
done
export BACKEND_PORT="$backend_port" MOCK_PROXY_PORT="$proxy_port" OIDC_PORT="$oidc_port"
export PROXY_PUBLIC_ORIGIN="$public_origin" PROXY_WHITELIST_DOMAIN="${PROXY_WHITELIST_DOMAIN:-${public_origin#*://}}"
compose() {
    docker compose --file "$root/backend/docker-compose.yml" --project-name "$project" --profile auth "$@"
}
if [ "$action" = auth_down ]; then compose stop oidc mock-oauth2-proxy; exit 0; fi
compose up --detach oidc mock-oauth2-proxy
for _ in $(seq 1 60); do
    if curl -sf -o /dev/null "http://localhost:$proxy_port/ping"; then exit 0; fi
    sleep 1
done
echo 'OAuth proxy did not become ready within 60 seconds.' >&2
exit 1
