import type { Page } from "@playwright/test";

export type DashboardRole = "admin" | "user" | "partner";

const e2eAuthStorageKey = "__cottonplug_e2e_auth_role";

export async function authenticateAs(page: Page, role: DashboardRole) {
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

  await page.route("**/api/auth/profile", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        name: "E2E User",
        email: "e2e@cottonplug.test",
        emailVerified: true,
        phoneNumber: null,
        avatarUrl: null,
        role,
        canChangeEmail: role === "user",
      }),
    });
  });
}
