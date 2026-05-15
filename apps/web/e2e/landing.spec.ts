import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the hero section", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Turn your");
    await expect(page.locator("h1")).toContainText("ideas into");
    await expect(page.locator("h1")).toContainText("a brand.");
  });

  test("should display the hero subtext", async ({ page }) => {
    await expect(
      page.getByText(/create pieces people want to wear/i),
    ).toBeVisible();
  });

  test("should have primary hero CTAs", async ({ page }) => {
    const ctaButton = page
      .getByRole("link", { name: /^start designing$/i })
      .first();
    await expect(ctaButton).toBeVisible();
    await expect(
      page.getByRole("link", { name: /go to dashboard/i }),
    ).toBeVisible();
  });

  test("should have auth access link", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /sign in to access your account/i }),
    ).toHaveAttribute("href", "/auth/login?redirect=/dashboard");
  });

  test("should display the drops sections", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /latest drops/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /still interested/i }),
    ).toBeVisible();
  });

  test("should show product cards", async ({ page }) => {
    await expect(page.getByText("Yuri Tee").first()).toBeVisible();
    await expect(page.getByText("Oversized Heavyweight")).toBeVisible();
    await expect(page.getByText("UGX 60,000").first()).toBeVisible();
  });

  test("should display the How It Works section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /from vision to reality/i }),
    ).toBeVisible();
    await expect(page.getByText("Design").first()).toBeVisible();
    await expect(page.getByText("Create").first()).toBeVisible();
    await expect(page.getByText("Sell").first()).toBeVisible();
    await expect(page.getByText("Earn").first()).toBeVisible();
  });

  test("should display the creative sections", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /4k textile simulation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /your creative space/i }),
    ).toBeVisible();
  });

  test("should display the Pricing section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /ugx\s+10k/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/platform fee \+ base blank cost/i),
    ).toBeVisible();
  });

  test("should display the FAQ section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /help & support/i }),
    ).toBeVisible();
    await expect(
      page.getByText("How much does it cost to start?"),
    ).toBeVisible();
    await expect(page.getByText("How do I get paid?")).toBeVisible();
  });

  test("should have header with Login and Start Designing links", async ({
    page,
  }) => {
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: /login/i })).toBeVisible();
    await expect(
      header.getByRole("link", { name: /start designing/i }),
    ).toHaveAttribute("href", "/auth/login?redirect=%2Fdesign");
  });

  test("should navigate to auth page when Start Designing is clicked", async ({
    page,
  }) => {
    await page
      .locator("header")
      .getByRole("link", { name: /start designing/i })
      .click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
