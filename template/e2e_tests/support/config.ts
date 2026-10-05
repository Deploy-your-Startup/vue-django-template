import { basename } from "node:path";
import { fileURLToPath } from "node:url";
export const backendPort = Number(process.env.E2E_APP_PORT || 8001);
export const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 8081);
export const proxyPort = Number(process.env.E2E_AUTH_PROXY_PORT || 4188);
export const oidcPort = Number(process.env.E2E_OIDC_PORT || 8098);
export const databaseName = (
  process.env.E2E_DB_NAME ||
  `${basename(fileURLToPath(new URL("../../", import.meta.url)))}_e2e`
).replaceAll("-", "_");
export const databaseUrl =
  process.env.DATABASE_URL ||
  `postgres://admin:admin@127.0.0.1:${process.env.E2E_POSTGRES_PORT || "55432"}/${databaseName}`;
