import { expect, type Page, test } from "@playwright/test";

type DashboardRole = "admin" | "user" | "partner";

const e2eAuthStorageKey = "__cottonbro_e2e_auth_role";

async function authenticateAs(page: Page, role: DashboardRole) {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: e2eAuthStorageKey, value: role },
  );

  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ claims: { role } }),
    });
  });

  await page.route("**/api/auth/settings", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        marketingEmailsEnabled: true,
        marketingEmailsOptedInAt: "2026-01-01T00:00:00.000Z",
        marketingEmailsOptedOutAt: null,
      }),
    });
  });
}

test.describe("Dashboard role access", () => {
  test("shows settings navigation and allows settings access for regular users", async ({
    page,
  }) => {
    await authenticateAs(page, "user");

    await page.goto("/dashboard/profile");

    await expect(
      page.getByRole("link", { name: /settings/i }),
    ).toBeVisible();

    await page.goto("/dashboard/settings");

    await expect(
      page.getByRole("heading", { name: /^settings$/i }),
    ).toBeVisible();
  });

  for (const role of ["partner", "admin"] as const) {
    test(`hides settings navigation and redirects settings access for ${role}s`, async ({
      page,
    }) => {
      await authenticateAs(page, role);

      await page.goto("/dashboard/profile");

      await expect(
        page.getByRole("link", { name: /settings/i }),
      ).toHaveCount(0);

      await page.goto("/dashboard/settings");

      await expect(page).toHaveURL(/\/dashboard\/profile$/);
      await expect(
        page.getByRole("link", { name: /settings/i }),
      ).toHaveCount(0);
    });
  }
});
