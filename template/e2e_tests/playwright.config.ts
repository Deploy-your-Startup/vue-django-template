import { defineConfig, devices } from "@playwright/test";
import { basename, resolve } from "node:path";
const backendPort = Number(process.env.E2E_APP_PORT || 8001);
const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 8081);
const proxyPort = Number(process.env.E2E_AUTH_PROXY_PORT || 4188);
const oidcPort = Number(process.env.E2E_OIDC_PORT || 8098);
const databaseName =
  process.env.E2E_DB_NAME || `${basename(resolve(".."))}_e2e`;
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://localhost:${frontendPort}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: `cd ../backend && ./make.sh run_dev --port ${backendPort} --reload false --flush true`,
          url: `http://127.0.0.1:${backendPort}/api/health`,
          env: {
            LOCAL_DB_NAME: databaseName.replaceAll("-", "_"),
            POSTGRES_PORT: process.env.E2E_POSTGRES_PORT || "55432",
          },
          reuseExistingServer: false,
          timeout: 300000,
        },
        {
          command: "./scripts/start-auth-stack.sh",
          gracefulShutdown: { signal: "SIGTERM", timeout: 10000 },
          url: `http://localhost:${proxyPort}/ping`,
          timeout: 180000,
          env: {
            AUTH_COMPOSE_PROJECT: `${databaseName}_auth`,
            MOCK_PROXY_PORT: String(proxyPort),
            OIDC_PORT: String(oidcPort),
            BACKEND_PORT: String(backendPort),
            PROXY_PUBLIC_ORIGIN: `http://localhost:${frontendPort}`,
            PROXY_WHITELIST_DOMAIN: `localhost:${frontendPort}`,
          },
        },
        {
          command: "cd ../frontend && ./make.sh run_dev",
          url: `http://localhost:${frontendPort}`,
          env: {
            FRONTEND_PORT: String(frontendPort),
            OAUTH2_PROXY_URL: `http://localhost:${proxyPort}`,
            BACKEND_SERVICE_URL: `http://127.0.0.1:${backendPort}`,
          },
          reuseExistingServer: false,
          timeout: 120000,
        },
      ],
});
