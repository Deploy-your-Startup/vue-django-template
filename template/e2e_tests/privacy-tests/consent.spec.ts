import { test, expect } from "@playwright/test";

test("legal pages remain reachable without consent", async ({ page }, info) => {
  // GIVEN a visitor with no consent cookie
  // WHEN opening the legal page directly
  await page.goto("/impressum");
  await page.screenshot({
    path: info.outputPath("legal-page.png"),
    fullPage: true,
  });
  // THEN operator details and privacy links are available without login
  await expect(
    page.getByRole("heading", { name: "Impressum", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Example Street 1, 12345 Example City", { exact: true }),
  ).toBeVisible();
  const legalNavigation =
    info.project.name === "consent"
      ? page.getByRole("dialog")
      : page.locator('nav[aria-label="Legal and privacy"]');
  await legalNavigation.getByRole("link", { name: "Privacy policy" }).click();
  await expect(
    page.getByRole("heading", { name: "Privacy policy", exact: true }),
  ).toBeVisible();
  if (info.project.name === "draft")
    await expect(
      page.getByRole("status").filter({ hasText: "Draft" }),
    ).toBeVisible();
});

test("analytics is blocked by default and stays blocked after rejection", async ({
  page,
  context,
}, info) => {
  // GIVEN an anonymous visitor, recording real network activity
  let requests = 0;
  page.on("request", (request) => {
    if (/test-tracker|test-collect/.test(request.url())) requests++;
  });
  await page.goto("/privacy");
  // WHEN rejecting optional analytics (or using a disabled/incomplete configuration)
  if (info.project.name === "consent")
    await page
      .getByRole("button", { name: "Reject analytics", exact: true })
      .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Privacy policy", exact: true }),
  ).toBeVisible();
  // THEN no tracker was fetched, including after a reload
  expect(requests).toBe(0);
  await expect(page.locator("script[data-website-id]")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const cookies = await context.cookies();
  expect(cookies.some((cookie) => cookie.name === "site_consent")).toBe(
    info.project.name === "consent",
  );
});

test("acceptance persists and withdrawal stops future collection", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "consent",
    "Optional analytics is unavailable in this configuration",
  );
  // GIVEN no prior choice and a real local tracker service
  let collections = 0;
  page.on("request", (request) => {
    if (request.url().includes("/test-collect")) collections++;
  });
  await page.goto("/privacy");
  // WHEN accepting analytics
  await page
    .getByRole("button", { name: "Accept analytics", exact: true })
    .click();
  // THEN the tracker loads once and collects only after consent
  await expect(page.locator("script[data-website-id]")).toHaveCount(1);
  await expect.poll(() => collections).toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { trackerLoads?: number }).trackerLoads,
      ),
    )
    .toBe(1);
  await page.reload();
  await expect(page.locator("script[data-website-id]")).toHaveCount(1);
  // WHEN withdrawing through the persistent footer control
  await page
    .getByRole("button", { name: "Privacy settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reject analytics", exact: true })
    .click();
  await page.waitForEvent("load");
  // THEN the new page has no tracker and further navigation cannot collect
  await expect(page.locator("script[data-website-id]")).toHaveCount(0);
  const afterWithdrawal = collections;
  await page
    .locator('nav[aria-label="Legal and privacy"]')
    .getByRole("link", { name: "Impressum" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Impressum", exact: true }),
  ).toBeVisible();
  expect(collections).toBe(afterWithdrawal);
});

test("Do Not Track prevents loading after acceptance", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "consent",
    "Optional analytics is unavailable in this configuration",
  );
  // GIVEN browser Do Not Track is enabled
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "doNotTrack", { value: "1" }),
  );
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().includes("test-tracker")) requests++;
  });
  await page.goto("/privacy");
  // WHEN accepting analytics
  await page
    .getByRole("button", { name: "Accept analytics", exact: true })
    .click();
  // THEN the browser preference still prevents loading
  await expect(page.locator("script[data-website-id]")).toHaveCount(0);
  expect(requests).toBe(0);
});

test("outdated consent requires a fresh decision", async ({
  page,
  context,
}, info) => {
  test.skip(
    info.project.name !== "consent",
    "Optional analytics is unavailable",
  );
  // GIVEN a real prior consent cookie with an old policy revision
  await page.goto("/privacy");
  await page
    .getByRole("button", { name: "Accept analytics", exact: true })
    .click();
  const cookie = (await context.cookies()).find(
    (cookie) => cookie.name === "site_consent",
  )!;
  const saved = JSON.parse(decodeURIComponent(cookie.value));
  saved.revision = 0;
  await context.addCookies([
    { ...cookie, value: encodeURIComponent(JSON.stringify(saved)) },
  ]);
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().includes("test-tracker")) requests++;
  });
  // WHEN returning after the policy revision changed
  await page.reload();
  // THEN the banner returns and the old choice cannot authorize analytics
  await expect(
    page.getByRole("button", { name: "Accept analytics", exact: true }),
  ).toBeVisible();
  await expect(page.locator("script[data-website-id]")).toHaveCount(0);
  expect(requests).toBe(0);
});
