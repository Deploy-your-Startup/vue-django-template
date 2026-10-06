import type { PlaywrightTestConfig } from "@playwright/test";

// Project-owned settings. Keep orchestration in the template's shared harness.
export const project = {
  backendHealthPath: "/api/health",
  frontendThroughProxy: false,
  allowLiveSmoke: true,
};
export const extraWebServers: PlaywrightTestConfig["webServer"] = [];
