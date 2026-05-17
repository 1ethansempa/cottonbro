import { expect, test } from "@playwright/test";
import { authenticateAs, type DashboardRole } from "./helpers/auth";

const cases: Array<{
  role: DashboardRole;
  visiblePanel: string;
  hiddenPanels: string[];
}> = [
  {
    role: "user",
    visiblePanel: "User Only",
    hiddenPanels: ["Admin Only", "Partner Only"],
  },
  {
    role: "partner",
    visiblePanel: "Partner Only",
    hiddenPanels: ["Admin Only", "User Only"],
  },
  {
    role: "admin",
    visiblePanel: "Admin Only",
    hiddenPanels: ["Partner Only", "User Only"],
  },
];

test.describe("Dashboard role test page", () => {
  for (const { role, visiblePanel, hiddenPanels } of cases) {
    test(`shows only the ${role} panel for ${role}s`, async ({ page }) => {
      await authenticateAs(page, role);

      await page.goto("/dashboard/role-test");

      await expect(
        page.getByRole("heading", { name: /role test/i }),
      ).toBeVisible();
      await expect(page.getByTestId("active-role")).toHaveText(
        `Active role: ${role}`,
      );
      await expect(
        page.getByRole("region", { name: visiblePanel }),
      ).toBeVisible();

      for (const hiddenPanel of hiddenPanels) {
        await expect(
          page.getByRole("region", { name: hiddenPanel }),
        ).toHaveCount(0);
      }
    });
  }
});
