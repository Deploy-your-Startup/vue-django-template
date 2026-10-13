import { defineConfig, devices } from "@playwright/test";
import {
  backendPort,
  frontendPort,
  proxyPort,
  oidcPort,
  databaseName,
  DB_PORT,
  project,
  extraWebServers,
} from "./support/config";
if (process.env.E2E_BASE_URL && project.allowLiveSmoke === false) {
  throw new Error(
    "This project's browser tests write data; live smoke mode is disabled.",
  );
}
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./support/global-setup.ts",
  globalTeardown: "./support/global-teardown.ts",
  fullyParallel: true,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 30000,
  expect: { timeout: 10000 },
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
          // Measured for coverage; SIGTERM lets the server save its data.
          command: `cd ../backend && ./make.sh run_dev --port ${backendPort} --reload false --flush true --coverage ${process.env.STARTUP_COVERAGE === "true"}`,
          gracefulShutdown: { signal: "SIGTERM", timeout: 10000 },
          url: `http://127.0.0.1:${backendPort}${project.backendHealthPath}`,
          env: {
            // Never inherit the development database: this server flushes it.
            ...(process.env.E2E_DATABASE_URL
              ? { DATABASE_URL: process.env.E2E_DATABASE_URL }
              : {}),
            LOCAL_DB_NAME: databaseName.replaceAll("-", "_"),
            POSTGRES_PORT: DB_PORT,
          },
          reuseExistingServer: false,
          timeout: 300000,
        },
        {
          command:
            process.env.E2E_CONTAINER === "true"
              ? "node scripts/container-auth.ts"
              : "./scripts/start-auth-stack.sh",
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
        ...(Array.isArray(extraWebServers)
          ? extraWebServers
          : extraWebServers
            ? [extraWebServers]
            : []),
        {
          command: "cd ../frontend && ./make.sh run_dev",
          url: `http://localhost:${frontendPort}`,
          env: {
            FRONTEND_PORT: String(frontendPort),
            OAUTH2_PROXY_URL: `http://localhost:${proxyPort}`,
            BACKEND_SERVICE_URL: project.frontendThroughProxy
              ? `http://localhost:${proxyPort}`
              : `http://127.0.0.1:${backendPort}`,
          },
          reuseExistingServer: false,
          timeout: 120000,
        },
      ],
});
