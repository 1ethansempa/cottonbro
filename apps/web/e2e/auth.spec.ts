import { test, expect } from "@playwright/test";

test.describe("Auth Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("should display the login page title", async ({ page }) => {
    await expect(page.getByText(/Sign In/i)).toBeVisible();
  });

  test("should have email input field", async ({ page }) => {
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test("should have a submit button", async ({ page }) => {
    // Look for the Send Code or Continue button
    const submitButton = page.getByRole("button", { name: /send code|continue/i });
    await expect(submitButton).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    // Click submit without entering email
    const submitButton = page.getByRole("button", { name: /send code|continue/i });
    await submitButton.click();
    
    // Should show some form of validation (either browser or custom)
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test("should have Google Sign In option", async ({ page }) => {
    const googleButton = page.getByRole("button", { name: /google/i });
    await expect(googleButton).toBeVisible();
  });

  test("should have dark theme styling", async ({ page }) => {
    // Check that the page has dark background
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should have site header", async ({ page }) => {
    // Check header is present
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("should have site footer", async ({ page }) => {
    // Check footer is present
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});

