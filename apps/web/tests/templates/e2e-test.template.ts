import { test, expect } from "@playwright/test";
import { clearStorage } from "../utils/storage";
import { setTheme, getTheme, isDarkMode } from "../utils/theme";

/**
 * E2E Test Template
 *
 * Use this template for testing complete user journeys and business logic.
 *
 * Template Structure:
 * 1. Test complete user workflows from start to finish
 * 2. Verify business logic end-to-end
 * 3. Test error handling and recovery
 * 4. Test cross-browser compatibility
 * 5. Test responsive behavior across devices
 *
 * Naming Convention: ${user-journey-name}.spec.ts
 * Location: tests/examples/
 */

test.describe("User Journey Name", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test.afterEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("new user onboarding journey", async ({ page }) => {
    await test.step("User opens app for first time", async () => {
      await page.goto("/");

      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="welcome-message"]')).toHaveText("Welcome to Tiny-Till!");
    });

    await test.step("User navigates to settings", async () => {
      await page.click('[data-testid="settings-button"]');
      await expect(page).toHaveURL(/\/settings/);
    });

    await test.step("User adds first product", async () => {
      await page.click('[data-testid="add-product-button"]');

      await page.fill('[data-testid="product-name-input"]', "Baguette");
      await page.fill('[data-testid="product-price-input"]', "2.50");

      await page.click('[data-testid="save-product-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    await test.step("User returns to tally page", async () => {
      await page.click('[data-testid="home-button"]');
      await expect(page).toHaveURL("/");
      await expect(page.locator('[data-testid="product-card-Baguette"]')).toBeVisible();
    });

    await test.step("User creates first tally", async () => {
      await page.click('[data-testid="product-card-Baguette"]');

      await expect(page.locator('[data-testid="quantity-badge"]')).toHaveText("1");
      await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$2.50");
    });

    await test.step("User clears tally", async () => {
      await page.click('[data-testid="clear-cart-button"]');
      await page.click('[data-testid="confirm-clear-button"]');

      await expect(page.locator('[data-testid="quantity-badge"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$0.00");
    });
  });

  test("import catalog journey", async ({ page }) => {
    await test.step("User navigates to settings", async () => {
      await page.goto("/settings");
    });

    await test.step("User clicks import", async () => {
      await page.click('[data-testid="import-catalog-button"]');
      await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    });

    await test.step("User selects file", async () => {
      const fileInput = page.locator('[data-testid="import-file-input"]');
      await fileInput.setInputFiles({
        name: "catalog.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify({
          version: "1.0.0",
          exportDate: new Date().toISOString(),
          products: [
            { id: crypto.randomUUID(), name: "Product 1", price: 1000 },
          ],
        })),
      });
    });

    await test.step("User reviews import", async () => {
      await expect(page.locator('[data-testid="import-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-preview"]')).toContainText("1 product will be added");
    });

    await test.step("User confirms import", async () => {
      await page.click('[data-testid="confirm-import-button"]');
      await expect(page.locator('[data-testid="import-success-message"]')).toBeVisible();
    });

    await test.step("User verifies catalog", async () => {
      await page.goto("/");
      await expect(page.locator('[data-testid="product-card-Product 1"]')).toBeVisible();
    });
  });

  test("theme switching journey", async ({ page }) => {
    await test.step("User opens settings", async () => {
      await page.goto("/settings");
    });

    await test.step("User switches to dark mode", async () => {
      await page.click('[data-testid="theme-dark-button"]');
      await expect(await isDarkMode(page)).toBe(true);
    });

    await test.step("User returns to home", async () => {
      await page.goto("/");
      await expect(await isDarkMode(page)).toBe(true);
    });

    await test.step("User reloads page", async () => {
      await page.reload();
      await expect(await isDarkMode(page)).toBe(true);
    });

    await test.step("User switches to light mode", async () => {
      await page.goto("/settings");
      await page.click('[data-testid="theme-light-button"]');
      await expect(await isDarkMode(page)).toBe(false);
    });

    await test.step("User sets to system theme", async () => {
      await page.click('[data-testid="theme-system-button"]');
      await expect(await getTheme(page)).toBe("system");
    });
  });

  test("error recovery journey", async ({ page }) => {
    await test.step("User encounters error", async () => {
      await page.goto("/settings");

      await page.click('[data-testid="import-catalog-button"]');

      const fileInput = page.locator('[data-testid="import-file-input"]');
      await fileInput.setInputFiles({
        name: "invalid.json",
        mimeType: "application/json",
        buffer: Buffer.from("{ invalid json }"),
      });

      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    await test.step("User understands error", async () => {
      await expect(page.locator('[data-testid="error-message"]')).toHaveText("Invalid JSON file");
    });

    await test.step("User dismisses error and tries again", async () => {
      await page.click('[data-testid="dismiss-error-button"]');

      const fileInput = page.locator('[data-testid="import-file-input"]');
      await fileInput.setInputFiles({
        name: "valid.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify({
          version: "1.0.0",
          exportDate: new Date().toISOString(),
          products: [],
        })),
      });

      await expect(page.locator('[data-testid="import-preview"]')).toBeVisible();
    });
  });

  test("mobile-specific journey", async ({ page, isMobile }) => {
    test.skip(!isMobile, "This test is for mobile devices only");

    await test.step("User opens app on mobile", async () => {
      await page.goto("/");

      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    });

    await test.step("User uses touch interactions", async () => {
      await page.tap('[data-testid="product-card-Product 1"]');

      await expect(page.locator('[data-testid="quantity-badge"]')).toHaveText("1");
    });

    await test.step("User long-presses to edit quantity", async () => {
      const card = page.locator('[data-testid="product-card-Product 1"]');
      await card.click({ button: "right", delay: 500 });

      await expect(page.locator('[data-testid="quantity-input-modal"]')).toBeVisible();
    });
  });
});

/**
 * Test Checklist:
 * [ ] Complete user journey works end-to-end
 * [ ] Each step provides user feedback
 * [ ] Error recovery works correctly
 * [ ] State persists across page reloads
 * [ ] Theme settings work correctly
 * [ ] Mobile-specific interactions work
 * [ ] Desktop-specific interactions work
 * [ ] Business logic is correct
 * [ ] User can complete journey successfully
 */
