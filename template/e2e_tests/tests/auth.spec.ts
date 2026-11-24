import { expect, test } from "../support/fixtures";
import { OIDC_URL } from "../support/config";

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
  if (process.env.E2E_KEYCLOAK === "true") {
    const issuer = `${OIDC_URL}/realms/startup-test`;
    const discovery = await page.request.get(
      `${issuer}/.well-known/openid-configuration`,
    );
    expect(discovery.ok()).toBe(true);
    const metadata = await discovery.json();
    expect(metadata.issuer).toBe(issuer);
    const redirect = new URL(page.url());
    expect(redirect.origin + redirect.pathname).toBe(
      metadata.authorization_endpoint,
    );
    expect(redirect.searchParams.get("redirect_uri")).toBe(
      new URL("/oauth2/callback", String(test.info().project.use.baseURL)).href,
    );
    expect(redirect.searchParams.get("code_challenge_method")).toBe("S256");
    await page.locator("#username").fill("keycloak-user");
    await page.locator("#password").fill("local-e2e-user");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
  } else {
    await page.locator('input[name="username"]').fill("user@example.com");
    await page
      .locator('textarea[name="claims"]')
      .fill(JSON.stringify({ email: "user@example.com" }));
    await page.getByRole("button", { name: "Sign-in" }).click();
  }
  // THEN
  await expect(
    page.getByRole("button", { name: "Log out", exact: true }),
  ).toBeVisible();
  const cookie = (await page.context().cookies()).find((item) =>
    item.name.startsWith("_oauth2_proxy"),
  );
  expect(cookie?.httpOnly).toBe(true);
  expect((await page.request.get("/private_api/session")).status()).toBe(200);
  // vue-router keeps scroll positions in sessionStorage; nothing else may be
  // stored client-side, so tokens never reach web storage.
  expect(
    await page.evaluate(() =>
      [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter(
        (key) => key !== "vue-router:scroll",
      ),
    ),
  ).toEqual([]);
});
