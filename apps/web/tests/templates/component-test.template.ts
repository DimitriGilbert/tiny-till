import { test, expect } from "@playwright/test";

/**
 * Component Test Template
 *
 * Use this template for testing individual React components in isolation.
 *
 * Template Structure:
 * 1. Describe the component being tested
 * 2. Test props and their variations
 * 3. Test user interactions (clicks, inputs, etc.)
 * 4. Test responsive behavior
 * 5. Test accessibility (aria labels, keyboard navigation)
 * 6. Test edge cases and error states
 *
 * Naming Convention: ${component-name}.spec.ts
 * Location: tests/examples/
 */

test.describe("ComponentName", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    // - Navigate to component test page
    // - Mock any required data
    // - Clear storage
    await page.goto("/test-components/component-name");
  });

  test("renders correctly with default props", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await expect(component).toBeVisible();
    await expect(component).toHaveText("Default Text");
  });

  test("renders correctly with custom props", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await expect(component).toHaveText("Custom Text");
    await expect(component).toHaveAttribute("data-variant", "primary");
  });

  test("handles user interactions", async ({ page }) => {
    const button = page.locator('[data-testid="component-button"]');

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("handles keyboard navigation", async ({ page }) => {
    const button = page.locator('[data-testid="component-button"]');

    await button.focus();
    await page.keyboard.press("Enter");

    await expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("displays correct ARIA attributes", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await expect(component).toHaveAttribute("role", "button");
    await expect(component).toHaveAttribute("aria-label", "Button label");
  });

  test("handles loading state", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await expect(component).toHaveAttribute("data-loading", "true");
    await expect(component.locator('[data-testid="spinner"]')).toBeVisible();
  });

  test("handles error state", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await expect(component).toHaveAttribute("data-error", "true");
    await expect(component.locator('[data-testid="error-message"]')).toHaveText("Error message");
  });

  test("is responsive across viewports", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(component).toHaveCSS("width", "100%");

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(component).toHaveCSS("width", "600px");
  });

  test("supports dark mode", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await expect(component).toHaveCSS("background-color", "rgb(0, 0, 0)");
  });

  test("passes visual regression test", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');

    await expect(component).toHaveScreenshot("component-name.png");
  });
});

/**
 * Test Checklist:
 * [ ] Component renders without errors
 * [ ] All props are correctly applied
 * [ ] User interactions work as expected
 * [ ] Keyboard navigation works
 * [ ] ARIA attributes are correct
 * [ ] Loading state displays correctly
 * [ ] Error state displays correctly
 * [ ] Responsive behavior works
 * [ ] Dark mode works
 * [ ] Visual regression passes
 */
