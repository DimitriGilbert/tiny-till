# Testing Framework Documentation

This directory contains the testing framework for the Tiny-Till application using Playwright for cross-browser testing.

## Table of Contents

- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Fixtures](#fixtures)
- [Utilities](#utilities)
- [Factories](#factories)
- [Configuration](#configuration)
- [Browser Matrix](#browser-matrix)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

The testing framework is already set up with Playwright and all dependencies. The browsers are installed and configured.

### Initial Setup

If you need to reinstall browsers or install additional dependencies:

```bash
npm install
npx playwright install
```

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Component Tests Only

```bash
npm run test:component
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run E2E Tests Only

```bash
npm run test:e2e
```

### Run Visual Regression Tests

```bash
npm run test:visual
```

### Run Mobile-Specific Tests

```bash
npm run test:mobile
```

### Run Desktop-Specific Tests

```bash
npm run test:desktop
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium-desktop
npx playwright test --project=firefox-desktop
npx playwright test --project=webkit-desktop
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

### Run Tests in Headed Mode

```bash
npx playwright test --headed
```

## Test Structure

```
tests/
├── config/                    # Configuration files
│   ├── browser-matrix.ts      # Browser and device configurations
│   ├── devices.ts             # Device definitions
│   ├── environments.ts        # Test environment configurations
│   └── reporters.ts          # Reporter configurations
├── examples/                  # Example tests
│   ├── product-card.spec.ts   # Component test example
│   ├── catalog-flow.spec.ts  # Integration test example
│   ├── tally-flow.spec.ts     # Integration test example
│   └── user-onboarding.spec.ts # E2E test example
├── factories/                 # Test data factories
│   ├── catalog-factory.ts    # Catalog data factory
│   ├── product-factory.ts     # Product data factory
│   └── tally-factory.ts      # Tally data factory
├── fixtures/                  # Test fixtures
│   ├── catalog.fixture.ts    # Catalog management fixtures
│   ├── settings.fixture.ts   # Settings management fixtures
│   └── tally.fixture.ts      # Tally management fixtures
├── templates/                 # Test templates
│   ├── component-test.template.ts   # Component test template
│   ├── integration-test.template.ts # Integration test template
│   └── e2e-test.template.ts       # E2E test template
├── utils/                     # Test utilities
│   ├── navigation.ts         # Navigation utilities
│   ├── screenshots.ts        # Screenshot utilities
│   ├── storage.ts            # Storage utilities
│   ├── test-logger.ts        # Test logging utilities
│   ├── test-storage.ts       # Test storage utilities
│   ├── theme.ts              # Theme utilities
│   └── viewport.ts           # Viewport utilities
├── setup.ts                  # Test setup and configuration
└── *.spec.ts                # Actual test files
```

## Writing Tests

### Component Tests

Component tests verify individual components in isolation. Use the `component-test.template.ts` as a starting point.

```typescript
import { test, expect } from "../setup";

test.describe("ComponentName", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-components/component-name");
  });

  test("renders correctly", async ({ page }) => {
    const component = page.locator('[data-testid="component-name"]');
    await expect(component).toBeVisible();
  });
});
```

### Integration Tests

Integration tests verify feature flows across multiple components. Use the `integration-test.template.ts` as a starting point.

```typescript
import { test, expect } from "../setup";
import { createCatalogFixture } from "../fixtures/catalog.fixture";

const catalog = createCatalogFixture();

test.describe("Feature Flow", () => {
  test("complete workflow", async ({ page }) => {
    await catalog.addProduct(page, { name: "Test", price: 1000 });
    await expect(page.locator('[data-testid="product-card-Test"]')).toBeVisible();
  });
});
```

### E2E Tests

E2E tests verify complete user journeys. Use the `e2e-test.template.ts` as a starting point.

```typescript
import { test, expect } from "../setup";
import { clearStorage } from "../utils/storage";

test.describe("User Journey", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("new user onboarding", async ({ page }) => {
    await page.goto("/");

    await test.step("Add first product", async () => {
      // Complete onboarding steps
    });
  });
});
```

## Fixtures

Fixtures provide reusable test utilities for common operations.

### Catalog Fixture

```typescript
import { createCatalogFixture } from "../fixtures/catalog.fixture";

const catalog = createCatalogFixture();

// Add a product
await catalog.addProduct(page, {
  name: "Product Name",
  price: 1000,
  imageData: "data:image/png;base64,...",
});

// Edit a product
await catalog.editProduct(page, productId, {
  name: "New Name",
  price: 2000,
});

// Delete a product
await catalog.deleteProduct(page, productId);

// Export catalog
const json = await catalog.exportCatalog(page);

// Import catalog
await catalog.importCatalog(page, jsonData);
```

### Tally Fixture

```typescript
import { createTallyFixture } from "../fixtures/tally.fixture";

const tally = createTallyFixture();

// Add item
await tally.addItem(page, productId);

// Set quantity
await tally.setQuantity(page, productId, 5);

// Clear tally
await tally.clearTally(page);

// Get items
const items = await tally.getItems(page);

// Get total
const total = await tally.getTotal(page);
```

### Settings Fixture

```typescript
import { createSettingsFixture } from "../fixtures/settings.fixture";

const settings = createSettingsFixture();

// Set theme
await settings.setTheme(page, "dark");

// Get theme
const theme = await settings.getTheme(page);

// Set grid density
await settings.setGridDensity(page, "compact");

// Set column count
await settings.setColumnCount(page, 6);

// Reset settings
await settings.resetSettings(page);
```

## Utilities

Utilities provide helper functions for common test operations.

### Navigation

```typescript
import { navigateTo, goBack, goForward, reload } from "../utils/navigation";

// Navigate to path
await navigateTo(page, "/settings");

// Go back
await goBack(page);

// Go forward
await goForward(page);

// Reload page
await reload(page);
```

### Theme

```typescript
import { setTheme, getTheme, isDarkMode, toggleTheme } from "../utils/theme";

// Set theme
await setTheme(page, "dark");

// Get theme
const theme = await getTheme(page);

// Check if dark mode
const darkMode = await isDarkMode(page);

// Toggle theme
await toggleTheme(page);
```

### Storage

```typescript
import {
  clearStorage,
  clearIndexedDB,
  getLocalStorage,
  setLocalStorage,
  seedCatalog,
  getCatalogFromIndexedDB,
} from "../utils/storage";

// Clear all storage
await clearStorage(page);

// Clear IndexedDB
await clearIndexedDB(page);

// Get local storage
const value = await getLocalStorage(page, "key");

// Set local storage
await setLocalStorage(page, "key", "value");

// Seed catalog
await seedCatalog(page, products);

// Get catalog from IndexedDB
const catalog = await getCatalogFromIndexedDB(page);
```

### Viewport

```typescript
import {
  setViewport,
  setMobileViewport,
  setTabletViewport,
  setDesktopViewport,
  simulateDevice,
} from "../utils/viewport";

// Set viewport
await setViewport(page, { width: 375, height: 667 });

// Set mobile viewport
await setMobileViewport(page);

// Set tablet viewport
await setTabletViewport(page);

// Set desktop viewport
await setDesktopViewport(page);

// Simulate device
await simulateDevice(page, "iPhone 14");
```

### Screenshots

```typescript
import {
  takeScreenshot,
  takeElementScreenshot,
  takeScreenshotOnFailure,
  compareScreenshotToBaseline,
  takeScreenshotAcrossViewports,
} from "../utils/screenshots";

// Take screenshot
await takeScreenshot(page, "test-name");

// Take element screenshot
await takeElementScreenshot(page, element, "element-name");

// Take screenshot on failure
await takeScreenshotOnFailure(page, testName);

// Compare to baseline
const matches = await compareScreenshotToBaseline(page, "test-name");

// Take screenshot across viewports
await takeScreenshotAcrossViewports(page, "test-name");
```

## Factories

Factories provide test data generation utilities.

### Product Factory

```typescript
import {
  createProduct,
  createProductWithName,
  createProductWithPrice,
  createMultipleProducts,
  createProductsList,
} from "../factories/product-factory";

// Create default product
const product = createProduct();

// Create product with name
const namedProduct = createProductWithName("Product Name");

// Create product with price
const pricedProduct = createProductWithPrice(1000);

// Create multiple products
const products = createMultipleProducts(10);

// Create products from list
const listProducts = createProductsList(["Product 1", "Product 2"]);
```

### Catalog Factory

```typescript
import {
  createCatalog,
  createEmptyCatalog,
  createLargeCatalog,
  createCatalogWithImages,
  createExportString,
  createCatalogJSONFile,
  validateCatalogSchema,
} from "../factories/catalog-factory";

// Create catalog
const catalog = createCatalog(10);

// Create empty catalog
const emptyCatalog = createEmptyCatalog();

// Create large catalog
const largeCatalog = createLargeCatalog(100);

// Create catalog with images
const catalogWithImages = createCatalogWithImages(5);

// Export as string
const json = createExportString(catalog);

// Create JSON file
const file = createCatalogJSONFile(catalog);

// Validate schema
const isValid = validateCatalogSchema(data);
```

### Tally Factory

```typescript
import {
  createTallyItem,
  createMultipleTallyItems,
  createEmptyTally,
  createLargeTally,
  calculateTotal,
  calculateItemCount,
} from "../factories/tally-factory";

// Create tally item
const item = createTallyItem();

// Create multiple items
const items = createMultipleTallyItems(10);

// Create empty tally
const emptyTally = createEmptyTally();

// Create large tally
const largeTally = createLargeTally(100);

// Calculate total
const total = calculateTotal(items);

// Calculate item count
const count = calculateItemCount(items);
```

## Configuration

### Browser Matrix

The browser matrix is configured in `tests/config/browser-matrix.ts` and includes:

- Chrome, Firefox, Safari on desktop
- Chrome, Safari on iOS (iPhone SE, iPhone 14)
- Chrome, Firefox on Android (Pixel 5, Galaxy S21)

### Devices

Devices are defined in `tests/config/devices.ts` and include:

- Mobile devices: iPhone SE, iPhone 14, Pixel 5, Galaxy S21
- Tablet devices: iPad Mini, iPad Pro, Surface Pro
- Desktop devices: Small, Large, Ultra-wide

### Environments

Test environments are configured in `tests/config/environments.ts`:

- `development`: Local dev server with hot reload
- `staging`: Production build locally with service worker
- `production-simulation`: Full production simulation

## Browser Matrix

### High Priority Browsers

- Chrome Desktop (Latest, Latest-1)
- Firefox Desktop (Latest, Latest-1)
- Safari Desktop (Latest, Latest-1)
- Chrome iOS (Latest, Latest-1)
- Safari iOS (Latest, Latest-1)
- Chrome Android (Latest, Latest-1)

### Medium Priority Browsers

- Firefox Android (Latest)

## Troubleshooting

### Tests Failing to Load

Ensure the dev server is running:

```bash
npm run dev
```

### Screenshots Not Appearing

Check that the test-results/screenshots directory exists and is writable.

### Browser Not Launching

Ensure Playwright browsers are installed:

```bash
npx playwright install
```

### Timeouts Increasing

Increase timeout in test or in playwright.config.ts:

```typescript
test.setTimeout(60 * 1000); // 60 seconds
```

### Tests Flaky

Add retries in playwright.config.ts:

```typescript
retries: 2,
```

### Visual Regression Failing

Update baseline screenshots:

```bash
npx playwright test --update-snapshots
```

## Best Practices

1. **Use data-testid attributes** for selecting elements
2. **Wait for elements** before asserting
3. **Clean up state** in beforeEach or afterEach
4. **Use test steps** for readability in long tests
5. **Test both success and failure paths**
6. **Test responsive behavior** across viewports
7. **Test keyboard navigation** for accessibility
8. **Test error states** and user feedback
9. **Use fixtures** for reusable operations
10. **Use factories** for test data generation

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Visual Regression Testing](https://playwright.dev/docs/screenshots)
