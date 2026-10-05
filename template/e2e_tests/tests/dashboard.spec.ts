import { test, expect } from "../support/fixtures";
import { seed } from "../support/seed";

test("guarded dashboard returns after login and writes through the generated client", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.E2E_BASE_URL),
    "Live smoke tests never create production data.",
  );
  // GIVEN: a factory fixture and an anonymous browser
  seed({
    create: [{ factory: "Entry", kwargs: { title: "An existing idea" } }],
  });
  await page.goto("/dashboard");
  await page.locator('input[name="username"]').fill("user@example.com");
  await page.getByRole("button", { name: "Sign-in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("list", { name: "Entries" })).toContainText(
    "An existing idea",
  );
  // WHEN
  await page.getByLabel("Entry title").fill("My next idea");
  await page.getByRole("button", { name: "Add entry" }).click();
  // THEN: the mutation invalidates the query cache and persists in the real DB
  await expect(page.getByRole("list", { name: "Entries" })).toContainText(
    "My next idea",
  );
  const response = await page.request.get("/api/entries");
  expect(
    (await response.json()).map((item: { title: string }) => item.title),
  ).toEqual(["An existing idea", "My next idea"]);
});

test("project detail and CV routes survive direct navigation", async ({
  page,
}) => {
  // GIVEN / WHEN
  await page.goto("/projects/your-next-project");
  // THEN
  await expect(
    page.getByRole("heading", { name: "Your next project", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "CV", exact: true }).click();
  await expect(page.getByRole("heading", { name: /\/ CV$/ })).toBeVisible();
});
