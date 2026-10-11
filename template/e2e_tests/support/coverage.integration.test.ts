import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { chromium } from "@playwright/test";

const frontendRoot = fileURLToPath(new URL("../../frontend", import.meta.url));
const frontendRequire = createRequire(
  new URL("../../frontend/package.json", import.meta.url),
);

test("GIVEN unvisited Vue and TypeScript files WHEN browser coverage is reported THEN they count as uncovered", async () => {
  const fixtures = await mkdtemp(
    join(frontendRoot, "src/coverage-regression-"),
  );
  await writeFile(
    join(fixtures, "Unvisited.vue"),
    '<script setup lang="ts">const label: string = "never visited";</script><template><p>{{ label }}</p></template>',
  );
  await writeFile(
    join(fixtures, "unvisited.ts"),
    "export function unvisited(value: number): number { return value + 1; }",
  );
  const { createServer } = await import(frontendRequire.resolve("vite"));
  const vite = await createServer({
    root: frontendRoot,
    server: { port: 0, strictPort: false },
  });
  let browser;
  try {
    await vite.listen();
    const address = vite.httpServer.address();
    assert.ok(address && typeof address !== "string");
    process.env.E2E_FRONTEND_PORT = String(address.port);
    const { startFrontendCoverage, measureFrontend, writeFrontendCoverage } =
      await import("./coverage.ts");
    await startFrontendCoverage();
    browser = await chromium.launch();
    const page = await browser.newPage();
    await measureFrontend(page, async () => {
      await page.goto(`http://localhost:${address.port}`);
      await page.waitForSelector("#app > *");
    });
    await writeFrontendCoverage();
    const report = await readFile(
      join(frontendRoot, "coverage/cobertura.xml"),
      "utf8",
    );
    for (const name of ["Unvisited.vue", "unvisited.ts"]) {
      const element = report.match(
        new RegExp(
          `<class[^>]*filename="[^\"]*${name.replace(".", "\\.")}"[^>]*>[\\s\\S]*?</class>`,
        ),
      );
      assert.ok(element, `${name} must appear in the coverage denominator`);
      assert.match(element[0], /line-rate="0"/);
      assert.doesNotMatch(element[0], /hits="[1-9]/);
    }
    assert.doesNotMatch(
      report,
      /filename="[^\"]*services\/backend\/generated\//,
    );
  } finally {
    await browser?.close();
    await vite.close();
    await rm(fixtures, { recursive: true, force: true });
  }
});
