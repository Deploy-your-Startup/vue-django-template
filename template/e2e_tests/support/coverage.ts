import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { relative } from "node:path";
import type { Page } from "@playwright/test";
import {
  CoverageReport,
  type CoverageReportOptions,
} from "monocart-coverage-reports";
import { frontendPort } from "./config.ts";

// Frontend coverage comes from the browser tests: Chromium's V8 coverage of the
// Vite dev server, mapped back to src/ through Vite's source maps and written
// as frontend/coverage/cobertura.xml for the shared pipeline
// (docs/architecture/0007). Live smoke runs against a deployment measure nothing.
export const measuresFrontend = !process.env.E2E_BASE_URL;

const frontendOrigins = [
  `http://localhost:${frontendPort}`,
  `http://127.0.0.1:${frontendPort}`,
];

const frontendRoot = fileURLToPath(new URL("../../frontend", import.meta.url));
const frontendRequire = createRequire(
  new URL("../../frontend/package.json", import.meta.url),
);

const options: CoverageReportOptions = {
  baseDir: frontendRoot,
  name: "Frontend E2E coverage",
  outputDir: fileURLToPath(new URL("../../frontend/coverage", import.meta.url)),
  reports: [["cobertura", { file: "cobertura.xml" }], ["console-summary"]],
  // Application modules only; the generated API client is checked by
  // `generate_client --check`, not measured.
  entryFilter: (entry) => {
    const url = new URL(entry.url);
    return (
      frontendOrigins.includes(url.origin) &&
      url.pathname.startsWith("/src/") &&
      !url.pathname.startsWith("/src/services/backend/generated/") &&
      !url.pathname.endsWith(".css") &&
      !url.search.includes("type=style")
    );
  },
  // Report paths relative to frontend/, as in the repository: drop the
  // "localhost-8081/" origin prefix and, where Vite's source map names only the
  // file ("App.vue"), use the path the dev server served it from.
  sourcePath: (filePath, { distFile }) =>
    (distFile?.endsWith(`/${filePath}`) ? distFile : filePath).replace(
      /^[^/]+-\d+\//,
      "",
    ),
  logging: "error",
};

export async function measureFrontend(page: Page, run: () => Promise<void>) {
  if (!measuresFrontend) return run();
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  await run();
  await new CoverageReport(options).add(await page.coverage.stopJSCoverage());
}

export async function startFrontendCoverage() {
  if (measuresFrontend) new CoverageReport(options).cleanCache();
}

export async function writeFrontendCoverage() {
  if (!measuresFrontend) return;
  // Use the application's own Vite transform for unloaded Vue/TypeScript files.
  // No listener or backend is needed to add them to the denominator at 0%.
  const { createServer } = await import(frontendRequire.resolve("vite"));
  const vite = await createServer({
    root: frontendRoot,
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: "custom",
  });
  try {
    await new CoverageReport({
      ...options,
      all: {
        dir: `${frontendRoot}/src`,
        filter: (path) =>
          /\.(vue|ts|js)$/.test(path) &&
          !path.endsWith(".d.ts") &&
          !/\.(test|spec)\.[jt]s$/.test(path) &&
          !path.includes("/__tests__/") &&
          !path.includes("/services/backend/generated/"),
        transformer: async (entry) => {
          const path = relative(frontendRoot, fileURLToPath(entry.url));
          const transformed = await vite.transformRequest(`/${path}`);
          if (!transformed)
            throw new Error(`Cannot measure unvisited source: ${path}`);
          entry.source = transformed.code;
          entry.sourceMap = transformed.map;
        },
      },
    }).generate();
  } finally {
    await vite.close();
  }
}
