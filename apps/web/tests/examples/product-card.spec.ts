import { test, expect } from "../setup";

test.describe("ProductCard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders product card with name and price", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test Product"]');

    await expect(card).toBeVisible();
    await expect(card.locator('[data-testid="product-name"]')).toHaveText("Test Product");
    await expect(card.locator('[data-testid="product-price"]')).toHaveText("$10.00");
  });

  test("increments quantity when tapped", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test Product"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await expect(badge).toHaveText("1");

    await card.click();
    await expect(badge).toHaveText("2");
  });

  test("shows quantity badge when quantity > 0", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test Product"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await expect(badge).not.toBeVisible();

    await card.click();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("1");
  });

  test("opens quantity input dialog when badge is clicked", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test Product"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await badge.click();

    await expect(page.locator('[data-testid="quantity-input-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="quantity-input"]')).toBeVisible();
  });

  test("is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const card = page.locator('[data-testid="product-card-Test Product"]');
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("width", "150px");
  });

  test("is responsive on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const card = page.locator('[data-testid="product-card-Test Product"]');
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("width", "200px");
  });

  test("supports keyboard navigation", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test Product"]');

    await card.focus();
    await page.keyboard.press("Enter");

    const badge = card.locator('[data-testid="quantity-badge"]');
    await expect(badge).toHaveText("1");
  });

  test("has correct ARIA attributes", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test Product"]');

    await expect(card).toHaveAttribute("role", "button");
    await expect(card).toHaveAttribute("aria-label", "Add Test Product to tally");
  });

  test("displays product image when available", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test Product"]');
    const image = card.locator('[data-testid="product-image"]');

    await expect(image).toBeVisible();
  });

  test("hides product image when not available", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-No Image Product"]');
    const image = card.locator('[data-testid="product-image"]');

    await expect(image).not.toBeVisible();
  });
});
