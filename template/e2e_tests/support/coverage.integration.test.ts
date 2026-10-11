import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
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
  // Match Playwright: Vite runs in frontend/, coverage in a separate process.
  const vite = spawn(
    process.execPath,
    [
      join(
        dirname(frontendRequire.resolve("vite/package.json")),
        "bin/vite.js",
      ),
    ],
    {
      cwd: frontendRoot,
      env: { ...process.env, FRONTEND_PORT: "0", NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const exited = new Promise<void>((resolve) =>
    vite.once("exit", () => resolve()),
  );
  let browser;
  try {
    const port = await new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Vite did not start")),
        30000,
      );
      vite.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      vite.once("exit", (code) => {
        clearTimeout(timeout);
        reject(new Error(`Vite exited: ${code}`));
      });
      vite.stdout.on("data", (data) => {
        const match = String(data).match(/http:\/\/127\.0\.0\.1:(\d+)/);
        if (match) {
          clearTimeout(timeout);
          resolve(Number(match[1]));
        }
      });
    });
    process.env.E2E_FRONTEND_PORT = String(port);
    const { startFrontendCoverage, measureFrontend, writeFrontendCoverage } =
      await import("./coverage.ts");
    await startFrontendCoverage();
    browser = await chromium.launch();
    const page = await browser.newPage();
    await measureFrontend(page, async () => {
      await page.goto(`http://localhost:${port}`);
      await page.waitForSelector("#app > *");
    });
    await writeFrontendCoverage();
    const report = await readFile(
      join(frontendRoot, "coverage/cobertura.xml"),
      "utf8",
    );
    assert.ok(
      report.includes('filename="src/App.vue"'),
      "Loaded Vue paths must stay relative to frontend/src",
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
    vite.kill("SIGTERM");
    await exited;
    await rm(fixtures, { recursive: true, force: true });
  }
});
