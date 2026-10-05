import { defineConfig, devices } from "@playwright/test";
import { basename, resolve } from "node:path";
const backendPort = Number(process.env.E2E_APP_PORT || 8001);
const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 8081);
const databaseName =
  process.env.E2E_DB_NAME || `${basename(resolve(".."))}_e2e`;
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: `http://127.0.0.1:${frontendPort}`, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
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
      command: "cd ../frontend && ./make.sh run_dev",
      url: `http://127.0.0.1:${frontendPort}`,
      env: {
        FRONTEND_PORT: String(frontendPort),
        BACKEND_SERVICE_URL: `http://127.0.0.1:${backendPort}`,
      },
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
