import { test, expect } from "../setup";
import { clearStorage, setupTestCatalog } from "../utils/storage";
import { createMultipleProducts } from "../factories/product-factory";

test.describe("Catalog Flow", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto("/");
  });

  test("adds new product to catalog", async ({ page }) => {
    await page.click('[data-testid="settings-button"]');

    await page.click('[data-testid="add-product-button"]');

    await page.fill('[data-testid="product-name-input"]', "New Product");
    await page.fill('[data-testid="product-price-input"]', "5.99");

    await page.click('[data-testid="save-product-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="product-list-item-New Product"]'),
    ).toBeVisible();
  });

  test("edits existing product", async ({ page }) => {
    await setupTestCatalog(page, [
      {
        id: "test-1",
        name: "Old Name",
        price: 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    await page.goto("/catalog");

    await page.click(
      '[data-testid="product-item-test-1"] [data-testid="edit-button"]',
    );

    await page.fill('[data-testid="product-name-input"]', "New Name");
    await page.fill('[data-testid="product-price-input"]', "15.99");

    await page.click('[data-testid="save-product-button"]');

    await expect(page.locator('[data-testid="product-name"]')).toHaveText(
      "New Name",
    );
    await expect(page.locator('[data-testid="product-price"]')).toHaveText(
      "$15.99",
    );
  });

  test("deletes product from catalog", async ({ page }) => {
    await setupTestCatalog(page, [
      {
        id: "test-1",
        name: "Product to Delete",
        price: 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    await page.goto("/catalog");

    await page.click(
      '[data-testid="product-item-test-1"] [data-testid="delete-button"]',
    );
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(
      page.locator('[data-testid="product-item-test-1"]'),
    ).not.toBeVisible();
  });

  test("uploads product image", async ({ page }) => {
    await page.goto("/catalog");

    await page.click('[data-testid="add-product-button"]');

    await page.fill('[data-testid="product-name-input"]', "Product with Image");
    await page.fill('[data-testid="product-price-input"]', "10.00");

    const imageData =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    await page.evaluate(
      (data) => {
        const input = document.querySelector(
          '[data-testid="product-image-input"]',
        ) as HTMLInputElement;
        const file = new File([data], "test.png", { type: "image/png" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
      },
      Buffer.from(imageData.split(",")[1], "base64"),
    );

    await page.click('[data-testid="save-product-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("exports catalog to JSON", async ({ page }) => {
    await setupTestCatalog(page, createMultipleProducts(3));

    await page.goto("/settings");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('[data-testid="export-catalog-button"]'),
    ]);

    expect(download.suggestedFilename()).toMatch(/tiny-till-catalog-.*\.json/);
  });

  test("imports catalog from JSON", async ({ page }) => {
    const catalogData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      products: [
        {
          id: "import-1",
          name: "Imported Product",
          price: 2000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    };

    await page.goto("/settings");

    const fileInput = page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles({
      name: "catalog.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(catalogData)),
    });

    await page.click('[data-testid="confirm-import-button"]');

    await expect(
      page.locator('[data-testid="import-success-message"]'),
    ).toBeVisible();

    await page.goto("/");
    await expect(
      page.locator('[data-testid="product-card-Imported Product"]'),
    ).toBeVisible();
  });

  test("rejects invalid JSON import", async ({ page }) => {
    await page.goto("/settings");

    const fileInput = page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from("{ invalid json }"),
    });

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toHaveText(
      /invalid/i,
    );
  });

  test("handles large catalog import", async ({ page }) => {
    const largeCatalog = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      products: createMultipleProducts(100),
    };

    await page.goto("/settings");

    const fileInput = page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles({
      name: "large-catalog.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(largeCatalog)),
    });

    await page.click('[data-testid="confirm-import-button"]');

    await expect(
      page.locator('[data-testid="import-success-message"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="import-success-message"]'),
    ).toContainText("100 products");
  });
});
