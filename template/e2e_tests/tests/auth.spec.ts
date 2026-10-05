import { expect, test } from "../support/fixtures";

test("protected routes reject anonymous and forged credentials", async ({
  request,
}) => {
  // GIVEN: the proxy protects the private API.
  for (const headers of [
    {},
    { Authorization: "Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJoYWNrZXIifQ." },
  ]) {
    // WHEN
    const response = await request.get("/private_api/session", {
      headers,
      maxRedirects: 0,
    });
    // THEN
    expect([302, 401, 403]).toContain(response.status());
  }
});

test("browser login keeps tokens in an HttpOnly cookie", async ({ page }) => {
  test.skip(
    Boolean(process.env.E2E_BASE_URL),
    "Mock provider is only used locally and in CI.",
  );
  // GIVEN: a visitor on the real frontend.
  await page.goto("/");
  // WHEN
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.locator('input[name="username"]').fill("user@example.com");
  await page
    .locator('textarea[name="claims"]')
    .fill(JSON.stringify({ email: "user@example.com" }));
  await page.getByRole("button", { name: "Sign-in" }).click();
  // THEN
  await expect(
    page.getByRole("button", { name: "Log out", exact: true }),
  ).toBeVisible();
  const cookie = (await page.context().cookies()).find((item) =>
    item.name.startsWith("_oauth2_proxy"),
  );
  expect(cookie?.httpOnly).toBe(true);
  expect((await page.request.get("/private_api/session")).status()).toBe(200);
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
});
