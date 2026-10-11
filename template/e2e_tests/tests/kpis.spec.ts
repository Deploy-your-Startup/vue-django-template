import { test, expect } from "../support/fixtures";

const scriptUrl = "https://kpis.example.test/script.js";
const websiteId = "8d92b4ec-9a6a-4c50-85e4-b6ea4048f3f8";

test("loads one DNT-aware tracker and keeps it across navigation", async ({
  page,
}) => {
  // GIVEN public runtime configuration and a local tracking service stand-in.
  await page.route("**/config.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.KPIS_SCRIPT_URL=${JSON.stringify(scriptUrl)};window.KPIS_WEBSITE_ID=${JSON.stringify(websiteId)};`,
    }),
  );
  let requests = 0;
  await page.route(scriptUrl, (route) => {
    requests += 1;
    return route.fulfill({ contentType: "application/javascript", body: "" });
  });
  // WHEN a visitor opens the page.
  await page.goto("/");
  // THEN one tracker is configured and the project action carries a funnel event.
  const tracker = page.locator("script[data-website-id]");
  await expect(tracker).toHaveCount(1);
  await expect(tracker).toHaveAttribute("data-website-id", websiteId);
  await expect(tracker).toHaveAttribute("data-do-not-track", "true");
  await expect(tracker).toHaveAttribute("defer", "");
  const project = page.locator("#projects a").first();
  await expect(project).toHaveAttribute("data-umami-event", "cta_click");
  // WHEN navigating within the SPA.
  await project.click();
  // THEN navigation retains the existing tracker.
  await expect(tracker).toHaveCount(1);
  expect(requests).toBe(1);
});

for (const missing of ["both", "script", "id"]) {
  test(`does not track without ${missing}`, async ({ page }) => {
    // GIVEN incomplete runtime tracking configuration.
    await page.route("**/config.js", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `window.KPIS_SCRIPT_URL=${JSON.stringify(missing === "id" ? scriptUrl : "")};window.KPIS_WEBSITE_ID=${JSON.stringify(missing === "script" ? websiteId : "")};`,
      }),
    );
    let requests = 0;
    await page.route(scriptUrl, (route) => {
      requests += 1;
      return route.fulfill({ contentType: "application/javascript", body: "" });
    });
    // WHEN opening the public portfolio.
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // THEN neither a tracker nor a tracking request exists.
    await expect(page.locator("script[data-website-id]")).toHaveCount(0);
    expect(requests).toBe(0);
  });
}
