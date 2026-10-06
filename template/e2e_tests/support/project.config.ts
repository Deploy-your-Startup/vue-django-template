import type { PlaywrightTestConfig } from "@playwright/test";

// Project-owned settings. Keep orchestration in the template's shared harness.
export const project = {
  backendHealthPath: "/api/health",
  frontendThroughProxy: false,
};
export const extraWebServers: PlaywrightTestConfig["webServer"] = [];
