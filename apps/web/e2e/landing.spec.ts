import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the hero section", async ({ page }) => {
    // Check hero headline
    await expect(page.locator("h1")).toContainText("Your Studio");
    await expect(page.locator("h1")).toContainText("Your Brand");
  });

  test("should display the hero subtext with Kampala mention", async ({ page }) => {
    await expect(page.locator("text=Kampala")).toBeVisible();
  });

  test("should have Open Studio CTA button", async ({ page }) => {
    const ctaButton = page.getByRole("button", { name: /open studio/i });
    await expect(ctaButton).toBeVisible();
  });

  test("should have See how it works link", async ({ page }) => {
    await expect(page.getByText(/see how it works/i)).toBeVisible();
  });

  test("should display the product grid section", async ({ page }) => {
    await expect(page.getByText("Trending Creator Drops")).toBeVisible();
  });

  test("should have product filter tabs", async ({ page }) => {
    await expect(page.getByText("Most Popular")).toBeVisible();
    await expect(page.getByText("Just Launched")).toBeVisible();
  });

  test("should display the Features section", async ({ page }) => {
    await expect(page.getByText("The Platform.")).toBeVisible();
    await expect(page.getByText("Design Studio")).toBeVisible();
    await expect(page.getByText("Real Body 3D")).toBeVisible();
    await expect(page.getByText("Asset Protection")).toBeVisible();
    await expect(page.getByText("Fulfillment")).toBeVisible();
  });

  test("should display the How It Works section", async ({ page }) => {
    await expect(page.getByText("From Vision")).toBeVisible();
    await expect(page.getByText("To Reality.")).toBeVisible();
  });

  test("should display the Pricing section", async ({ page }) => {
    await expect(page.getByText("10k")).toBeVisible();
    await expect(page.getByText("UGX")).toBeVisible();
    await expect(page.getByText("Flat platform fee")).toBeVisible();
  });

  test("should display the FAQ section", async ({ page }) => {
    await expect(page.getByText("Help & Support")).toBeVisible();
    await expect(page.getByText("Skills Required?")).toBeVisible();
  });

  test("should have header with Login and Sign Up links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });

  test("should navigate to auth page when Sign Up is clicked", async ({ page }) => {
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
