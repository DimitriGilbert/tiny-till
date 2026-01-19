import { test, expect } from "../setup";
import { clearStorage } from "../utils/storage";
import { createMultipleProducts } from "../factories/product-factory";
import { setTheme, getTheme, isDarkMode } from "../utils/theme";

test.describe("User Onboarding", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("new user sees empty state", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('[data-testid="empty-catalog-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-catalog-message"]')).toHaveText(/no products/i);
  });

  test("new user adds first product", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="add-first-product-button"]');

    await page.fill('[data-testid="product-name-input"]', "Baguette");
    await page.fill('[data-testid="product-price-input"]', "2.50");

    await page.click('[data-testid="save-product-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card-Baguette"]')).toBeVisible();
  });

  test("new user creates first tally", async ({ page }) => {
    await test.step("Add product", async () => {
      await page.goto("/settings");

      await page.click('[data-testid="add-product-button"]');

      await page.fill('[data-testid="product-name-input"]', "Croissant");
      await page.fill('[data-testid="product-price-input"]', "1.99");

      await page.click('[data-testid="save-product-button"]');
    });

    await test.step("Create tally", async () => {
      await page.goto("/");

      await page.click('[data-testid="product-card-Croissant"]');
      await page.click('[data-testid="product-card-Croissant"]');

      await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$3.98");
      await expect(page.locator('[data-testid="item-count"]')).toHaveText("2 items");
    });
  });

  test("new user explores settings", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="settings-button"]');

    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator('[data-testid="settings-header"]')).toBeVisible();
  });

  test("new user sets theme preference", async ({ page }) => {
    await page.goto("/settings");

    await page.click('[data-testid="theme-dark-button"]');
    await expect(await isDarkMode(page)).toBe(true);

    await page.goto("/");
    await expect(await isDarkMode(page)).toBe(true);
  });

  test("new user exports empty catalog", async ({ page }) => {
    await page.goto("/settings");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[data-testid="export-catalog-button"]'),
    ]);

    expect(download.suggestedFilename()).toMatch(/tiny-till-catalog-.*\.json/);
  });

  test("new user imports catalog", async ({ page }) => {
    const catalogData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      products: createMultipleProducts(3),
    };

    await page.goto("/settings");

    const fileInput = page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles({
      name: "catalog.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(catalogData)),
    });

    await page.click('[data-testid="confirm-import-button"]');

    await expect(page.locator('[data-testid="import-success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="import-success-message"]')).toContainText("3 products");
  });

  test("new user completes full onboarding journey", async ({ page }) => {
    await test.step("User opens app", async () => {
      await page.goto("/");
      await expect(page.locator('[data-testid="empty-catalog-message"]')).toBeVisible();
    });

    await test.step("User adds product", async () => {
      await page.click('[data-testid="settings-button"]');
      await page.click('[data-testid="add-product-button"]');

      await page.fill('[data-testid="product-name-input"]', "Pain au Chocolat");
      await page.fill('[data-testid="product-price-input"]', "2.50");

      await page.click('[data-testid="save-product-button"]');
    });

    await test.step("User sets theme", async () => {
      await page.click('[data-testid="theme-dark-button"]');
    });

    await test.step("User returns to tally page", async () => {
      await page.click('[data-testid="home-button"]');
      await expect(page.locator('[data-testid="product-card-Pain au Chocolat"]')).toBeVisible();
    });

    await test.step("User creates tally", async () => {
      await page.click('[data-testid="product-card-Pain au Chocolat"]');
      await page.click('[data-testid="product-card-Pain au Chocolat"]');

      await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$5.00");
    });

    await test.step("User clears tally", async () => {
      await page.click('[data-testid="clear-cart-button"]');
      await page.click('[data-testid="confirm-clear-button"]');

      await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$0.00");
    });
  });

  test("new user on mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "This test is for mobile devices only");

    await page.goto("/");

    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    await page.click('[data-testid="add-first-product-button"]');

    await page.fill('[data-testid="product-name-input"]', "Mobile Product");
    await page.fill('[data-testid="product-price-input"]', "1.00");

    await page.click('[data-testid="save-product-button"]');

    await expect(page.locator('[data-testid="product-card-Mobile Product"]')).toBeVisible();

    await page.tap('[data-testid="product-card-Mobile Product"]');
    await expect(page.locator('[data-testid="quantity-badge"]')).toHaveText("1");
  });

  test("new user on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "This test is for desktop devices only");

    await page.goto("/");

    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();

    await page.hover('[data-testid="product-card-Product 1"]');

    await expect(page.locator('[data-testid="product-card-Product 1"]')).toHaveCSS("cursor", "pointer");
  });
});
