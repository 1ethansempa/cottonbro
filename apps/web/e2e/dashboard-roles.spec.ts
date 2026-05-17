import { expect, test } from "@playwright/test";
import { authenticateAs } from "./helpers/auth";

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
