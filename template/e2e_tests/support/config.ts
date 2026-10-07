import { basename } from "node:path";
import { fileURLToPath } from "node:url";
export const backendPort = Number(
  process.env.E2E_BACKEND_PORT || process.env.E2E_APP_PORT || 8001,
);
export const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 8081);
export const proxyPort = Number(process.env.E2E_AUTH_PROXY_PORT || 4188);
export const oidcPort = Number(process.env.E2E_OIDC_PORT || 8098);
export const databaseName = (
  process.env.E2E_DB_NAME ||
  `${basename(fileURLToPath(new URL("../../", import.meta.url)))}_e2e`
).replaceAll("-", "_");
export const databaseUrl =
  process.env.E2E_DATABASE_URL ||
  `postgres://admin:admin@127.0.0.1:${process.env.E2E_DB_PORT || process.env.E2E_POSTGRES_PORT || "55432"}/${databaseName}`;

// Stable aliases for applications extracted from About Phil.
export const BACKEND_PORT = backendPort;
export const FRONTEND_PORT = frontendPort;
export const AUTH_PROXY_PORT = proxyPort;
export const OIDC_PORT = oidcPort;
export const DB_NAME = databaseName;
export const DB_PORT =
  process.env.E2E_DB_PORT || process.env.E2E_POSTGRES_PORT || "55432";
export const DATABASE_URL = databaseUrl;
export const BACKEND_URL = `http://localhost:${backendPort}`;
export const FRONTEND_URL = `http://localhost:${frontendPort}`;
export const AUTH_PROXY_URL = `http://localhost:${proxyPort}`;
export const OIDC_URL = `http://localhost:${oidcPort}`;
export const OIDC_ISSUER = `${OIDC_URL}/default`;
export const OIDC_INTERNAL_HOST = "oidc:8080";
export * from "./project.config.ts";
