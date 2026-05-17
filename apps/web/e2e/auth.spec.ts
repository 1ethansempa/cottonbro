import { test, expect } from "@playwright/test";

test.describe("Auth Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("should display the current sign-in experience", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /continue to cotton plug/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/sign in or create an account to continue/i),
    ).toBeVisible();
  });

  test("should have email input field", async ({ page }) => {
    const emailInput = page.getByPlaceholder("name@example.com");
    await expect(emailInput).toBeVisible();
  });

  test("should have a disabled send-code button until an email is entered", async ({
    page,
  }) => {
    const submitButton = page.getByRole("button", { name: /send code/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.getByPlaceholder("name@example.com").fill("not-an-email");

    const submitButton = page.getByRole("button", { name: /send code/i });
    await submitButton.click();

    await expect(
      page.getByText(/please enter a valid email address/i),
    ).toBeVisible();
  });

  test("should have Google Sign In option", async ({ page }) => {
    const googleButton = page.getByRole("button", {
      name: /continue with google/i,
    });
    await expect(googleButton).toBeVisible();
  });

  test("should link to legal pages from the auth card", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /privacy policy/i }),
    ).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: /terms of service/i }),
    ).toHaveCount(2);
  });

  test("should have site header", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: /login/i })).toBeVisible();
  });

  test("should have site footer", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});

test.describe("Auth redirects", () => {
  test("should send logged-out dashboard visitors to login with the dashboard path preserved", async ({
    page,
  }) => {
    await page.goto("/dashboard/profile");

    await expect(page).toHaveURL(
      /\/auth\/login\?redirect=%2Fdashboard%2Fprofile$/,
    );
  });

  test("should send logged-out non-dashboard protected visitors to login with their original path", async ({
    page,
  }) => {
    await page.goto("/design");

    await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fdesign$/);
  });
});
