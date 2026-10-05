import { test, expect } from "@playwright/test";
test("the portfolio connects to the real backend", async ({ page }) => {
  // GIVEN: the isolated full stack is started by Playwright.
  // WHEN
  await page.goto("/");
  // THEN
  await expect(
    page.getByRole("heading", { name: "Ideas into things people can use." }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Backend connected");
});
