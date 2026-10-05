import { test as base } from "@playwright/test";
import { backendPort, frontendPort, proxyPort, oidcPort } from "./config";
import { seed } from "./seed";

const origins = process.env.E2E_BASE_URL
  ? [new URL(process.env.E2E_BASE_URL).origin]
  : [backendPort, frontendPort, proxyPort, oidcPort].flatMap((port) => [
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
    ]);

export const test = base.extend<{ cleanDatabase: void }>({
  cleanDatabase: [
    async ({}, use) => {
      if (!process.env.E2E_BASE_URL) seed({ flush: true, create: [] });
      await use();
    },
    { auto: true },
  ],
  page: async ({ page }, use) => {
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return origins.includes(url.origin) || url.protocol === "data:"
        ? route.continue()
        : route.abort();
    });
    await use(page);
  },
});
export { expect } from "@playwright/test";
