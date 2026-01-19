import { test, expect } from "@playwright/test";
import { createCatalogFixture } from "../fixtures/catalog.fixture";
import { clearStorage } from "../utils/storage";

/**
 * Integration Test Template
 *
 * Use this template for testing feature flows across multiple components.
 *
 * Template Structure:
 * 1. Set up fixtures and state
 * 2. Test complete user workflows
 * 3. Verify state management and persistence
 * 4. Test navigation between routes
 * 5. Test error handling and recovery
 *
 * Naming Convention: ${feature-name}-flow.spec.ts
 * Location: tests/examples/
 */

const catalog = createCatalogFixture();

test.describe("Feature Name Flow", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.goto("/");
  });

  test.afterEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("complete user workflow", async ({ page }) => {
    await test.step("Step 1: Navigate to feature", async () => {
      await page.click('[data-testid="nav-button"]');
      await expect(page).toHaveURL(/\/feature/);
    });

    await test.step("Step 2: Perform action 1", async () => {
      await page.fill('[data-testid="input-field"]', "Test Value");
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    await test.step("Step 3: Verify state persistence", async () => {
      await page.reload();
      await expect(page.locator('[data-testid="input-field"]')).toHaveValue("Test Value");
    });

    await test.step("Step 4: Clean up", async () => {
      await page.click('[data-testid="delete-button"]');
      await page.click('[data-testid="confirm-delete"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test("handles errors gracefully", async ({ page }) => {
    await test.step("Submit with invalid data", async () => {
      await page.fill('[data-testid="input-field"]', "");
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toHaveText("Field is required");
    });

    await test.step("Correct error and retry", async () => {
      await page.fill('[data-testid="input-field"]', "Valid Value");
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test("maintains state across navigation", async ({ page }) => {
    await test.step("Add data to state", async () => {
      await page.fill('[data-testid="input-field"]', "Test Value");
      await page.click('[data-testid="save-button"]');
    });

    await test.step("Navigate away", async () => {
      await page.click('[data-testid="nav-button"]');
      await expect(page).toHaveURL(/\/other-page/);
    });

    await test.step("Navigate back", async () => {
      await page.click('[data-testid="back-button"]');
      await expect(page).toHaveURL(/\/feature/);
      await expect(page.locator('[data-testid="input-field"]')).toHaveValue("Test Value");
    });
  });

  test("updates correctly when data changes", async ({ page }) => {
    await test.step("Initial state", async () => {
      await expect(page.locator('[data-testid="display-value"]')).toHaveText("Initial");
    });

    await test.step("Update data", async () => {
      await page.fill('[data-testid="input-field"]', "Updated Value");
      await page.click('[data-testid="update-button"]');
    });

    await test.step("Verify update", async () => {
      await expect(page.locator('[data-testid="display-value"]')).toHaveText("Updated Value");
    });
  });

  test("handles concurrent operations", async ({ page }) => {
    await test.step("Perform multiple actions", async () => {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          page.fill('[data-testid="input-field"]', `Value ${i}`),
          page.click('[data-testid="add-button"]'),
        );
      }

      await Promise.all(promises);
    });

    await test.step("Verify all operations completed", async () => {
      const items = page.locator('[data-testid^="item-"]');
      await expect(items).toHaveCount(5);
    });
  });

  test("maintains data integrity", async ({ page }) => {
    const testData = [
      { id: "1", name: "Item 1", value: 100 },
      { id: "2", name: "Item 2", value: 200 },
      { id: "3", name: "Item 3", value: 300 },
    ];

    await test.step("Add multiple items", async () => {
      for (const item of testData) {
        await page.fill('[data-testid="item-name"]', item.name);
        await page.fill('[data-testid="item-value"]', String(item.value));
        await page.click('[data-testid="add-button"]');
      }
    });

    await test.step("Verify data integrity", async () => {
      for (const item of testData) {
        const itemElement = page.locator(`[data-testid="item-${item.id}"]`);
        await expect(itemElement.locator('[data-testid="item-name"]')).toHaveText(item.name);
        await expect(itemElement.locator('[data-testid="item-value"]')).toHaveText(String(item.value));
      }
    });
  });
});

/**
 * Test Checklist:
 * [ ] Complete user workflow works end-to-end
 * [ ] Error handling works correctly
 * [ ] State persists across navigation
 * [ ] State updates correctly when data changes
 * [ ] Concurrent operations don't cause race conditions
 * [ ] Data integrity is maintained
 * [ ] Cleanup operations work correctly
 * [ ] User feedback is provided at each step
 */
