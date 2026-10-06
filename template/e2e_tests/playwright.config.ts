import { defineConfig, devices } from "@playwright/test";
import {
  backendPort,
  frontendPort,
  proxyPort,
  oidcPort,
  databaseName,
} from "./support/config";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://localhost:${frontendPort}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: `cd ../backend && ./make.sh run_dev --port ${backendPort} --reload false --flush true`,
          url: `http://127.0.0.1:${backendPort}/api/health`,
          env: {
            // Never inherit the development database: this server flushes it.
            DATABASE_URL: process.env.E2E_DATABASE_URL || "",
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
