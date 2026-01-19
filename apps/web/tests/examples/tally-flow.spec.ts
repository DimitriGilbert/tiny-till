import { test, expect } from "../setup";
import { clearStorage, setupTestCatalog } from "../utils/storage";
import { createMultipleProducts } from "../factories/product-factory";

test.describe("Tally Flow", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await setupTestCatalog(page, createMultipleProducts(5));
    await page.goto("/");
  });

  test("taps product to increment quantity", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Product 1"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("1");

    await card.click();
    await expect(badge).toHaveText("2");
  });

  test("opens quantity input modal on badge click", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Product 1"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await badge.click();

    await expect(page.locator('[data-testid="quantity-input-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue("1");
  });

  test("sets quantity manually via input", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Product 1"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await badge.click();

    await page.fill('[data-testid="quantity-input"]', "50");
    await page.click('[data-testid="confirm-quantity-button"]');

    await expect(badge).toHaveText("50");
  });

  test("rejects negative quantities", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Product 1"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await badge.click();

    await page.fill('[data-testid="quantity-input"]', "-5");
    await page.click('[data-testid="confirm-quantity-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(badge).toHaveText("1");
  });

  test("rejects decimal quantities", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Product 1"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await badge.click();

    await page.fill('[data-testid="quantity-input"]', "2.5");
    await page.click('[data-testid="confirm-quantity-button"]');

    await expect(badge).toHaveText("2");
  });

  test("sets quantity to zero removes item", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Product 1"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await expect(badge).toBeVisible();

    await badge.click();
    await page.fill('[data-testid="quantity-input"]', "0");
    await page.click('[data-testid="confirm-quantity-button"]');

    await expect(badge).not.toBeVisible();
  });

  test("calculates live total correctly", async ({ page }) => {
    const totalElement = page.locator('[data-testid="grand-total"]');

    await expect(totalElement).toHaveText("$0.00");

    await page.click('[data-testid="product-card-Product 1"]');
    await expect(totalElement).toHaveText("$10.00");

    await page.click('[data-testid="product-card-Product 2"]');
    await expect(totalElement).toHaveText("$30.00");

    await page.click('[data-testid="product-card-Product 1"]');
    await expect(totalElement).toHaveText("$40.00");
  });

  test("displays correct item count", async ({ page }) => {
    const itemCountElement = page.locator('[data-testid="item-count"]');

    await expect(itemCountElement).toHaveText("0 items");

    await page.click('[data-testid="product-card-Product 1"]');
    await expect(itemCountElement).toHaveText("1 item");

    await page.click('[data-testid="product-card-Product 2"]');
    await expect(itemCountElement).toHaveText("2 items");

    await page.click('[data-testid="product-card-Product 1"]');
    await expect(itemCountElement).toHaveText("3 items");
  });

  test("clears cart with confirmation", async ({ page }) => {
    await page.click('[data-testid="product-card-Product 1"]');
    await page.click('[data-testid="product-card-Product 2"]');

    await page.click('[data-testid="clear-cart-button"]');
    await expect(page.locator('[data-testid="confirm-modal"]')).toBeVisible();

    await page.click('[data-testid="confirm-clear-button"]');

    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$0.00");
  });

  test("cancels clear cart", async ({ page }) => {
    await page.click('[data-testid="product-card-Product 1"]');

    await page.click('[data-testid="clear-cart-button"]');
    await page.click('[data-testid="cancel-clear-button"]');

    const badge = page.locator('[data-testid="product-card-Product 1"] [data-testid="quantity-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("1");
  });

  test("handles large quantities", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Product 1"]');
    const badge = card.locator('[data-testid="quantity-badge"]');

    await card.click();
    await badge.click();

    await page.fill('[data-testid="quantity-input"]', "999");
    await page.click('[data-testid="confirm-quantity-button"]');

    await expect(badge).toHaveText("999");
  });

  test("maintains state across page navigation", async ({ page }) => {
    await page.click('[data-testid="product-card-Product 1"]');
    await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$10.00");

    await page.goto("/settings");
    await expect(page.locator('[data-testid="grand-total"]')).not.toBeVisible();

    await page.goto("/");
    await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$10.00");
  });

  test("resets on page refresh", async ({ page }) => {
    await page.click('[data-testid="product-card-Product 1"]');
    await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$10.00");

    await page.reload();

    await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$0.00");
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
  });
});
