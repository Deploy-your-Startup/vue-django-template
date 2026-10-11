import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "@playwright/test";
import { measureFrontend, measuresFrontend } from "./coverage.ts";

test("GIVEN a default local run WHEN a real browser flow executes THEN coverage stays disabled", async () => {
  assert.equal(measuresFrontend, false);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await measureFrontend(page, async () => {
      await page.goto("data:text/html,<button>Continue</button>");
      await page.getByRole("button", { name: "Continue" }).click();
      assert.equal(await page.title(), "");
    });
    assert.deepEqual(await page.coverage.stopJSCoverage(), []);
  } finally {
    await browser.close();
  }
});
