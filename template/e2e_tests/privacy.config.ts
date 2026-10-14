import { defineConfig, devices } from "@playwright/test";
const states = ["consent", "draft", "off"];
export default defineConfig({
  testDir: "./privacy-tests",
  outputDir: "privacy-test-results",
  workers: 1,
  timeout: 30000,
  use: { ...devices["Desktop Chrome"] },
  projects: states.map((state, index) => ({
    name: state,
    use: { baseURL: `http://127.0.0.1:${8186 + index}` },
  })),
  webServer: states.map((state, index) => ({
    command: "node scripts/privacy-server.mjs",
    url: `http://127.0.0.1:${8186 + index}`,
    env: { FRONTEND_PORT: String(8186 + index), POLICY_STATE: state },
    reuseExistingServer: false,
    timeout: 120000,
  })),
});
