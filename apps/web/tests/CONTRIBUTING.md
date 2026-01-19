# Contributing to Tests

This guide helps you write effective tests for the Tiny-Till application.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Writing Tests](#writing-tests)
- [Test Types](#test-types)
- [Test Organization](#test-organization)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Running Tests](#running-tests)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and improve
- Follow the project's coding standards

## Getting Started

### Prerequisites

- Familiarity with TypeScript
- Understanding of the Tiny-Till application
- Basic knowledge of testing concepts

### First Steps

1. Read the main [README.md](./README.md)
2. Review the test templates in `tests/templates/`
3. Run existing tests to understand the structure
4. Start with a simple component test

## Writing Tests

### Naming Conventions

- Test files: `${component-or-feature-name}.spec.ts`
- Test suites: `describe("FeatureName", () => {})`
- Test cases: `test("description of what is being tested", ...)`

### Test Structure

```typescript
import { test, expect } from "../setup";

test.describe("ComponentName", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });

  test("does something specific", async ({ page }) => {
    // Arrange - setup test conditions
    // Act - perform the action
    // Assert - verify the result
  });
});
```

### Test Description Guidelines

- **Use clear, descriptive names**: `test("increments quantity when clicked", ...)`
- **Start with a verb**: `test("adds product", ...)`, `test("removes item", ...)`
- **Focus on behavior, not implementation**: `test("updates total", ...)` not `test("calls updateTotal function", ...)`
- **Use user-centric language**: `test("user can add product", ...)`

## Test Types

### Component Tests

**Purpose**: Verify individual components work correctly

**When to Use**:
- Testing a single React component
- Verifying props and events
- Testing component variants
- Checking accessibility

**Example**:

```typescript
test.describe("ProductCard", () => {
  test("renders with correct name and price", async ({ page }) => {
    const card = page.locator('[data-testid="product-card-Test"]');

    await expect(card.locator('[data-testid="product-name"]')).toHaveText("Test");
    await expect(card.locator('[data-testid="product-price"]')).toHaveText("$10.00");
  });
});
```

### Integration Tests

**Purpose**: Verify feature flows across multiple components

**When to Use**:
- Testing complete features
- Verifying state management
- Testing navigation between routes
- Checking data persistence

**Example**:

```typescript
test.describe("Catalog Management", () => {
  test("adds, edits, and deletes product", async ({ page }) => {
    await catalog.addProduct(page, { name: "Test", price: 1000 });
    await expect(page.locator('[data-testid="product-card-Test"]')).toBeVisible();

    await catalog.editProduct(page, productId, { name: "Updated" });
    await expect(page.locator('[data-testid="product-name"]')).toHaveText("Updated");

    await catalog.deleteProduct(page, productId);
    await expect(page.locator('[data-testid="product-card-Updated"]')).not.toBeVisible();
  });
});
```

### E2E Tests

**Purpose**: Verify complete user journeys

**When to Use**:
- Testing critical user workflows
- Verifying business logic end-to-end
- Testing cross-browser compatibility
- Checking error handling

**Example**:

```typescript
test.describe("User Onboarding", () => {
  test("new user adds product and creates tally", async ({ page }) => {
    await page.goto("/");

    await test.step("Add product", async () => {
      await page.click('[data-testid="add-product-button"]');
      await page.fill('[data-testid="product-name-input"]', "Baguette");
      await page.click('[data-testid="save-product-button"]');
    });

    await test.step("Create tally", async () => {
      await page.goto("/");
      await page.click('[data-testid="product-card-Baguette"]');
      await expect(page.locator('[data-testid="grand-total"]')).toHaveText("$2.50");
    });
  });
});
```

## Test Organization

### Directory Structure

```
tests/
├── examples/          # Example tests (can be deleted after implementation)
├── templates/        # Test templates for reference
├── config/           # Configuration files
├── fixtures/         # Reusable test fixtures
├── factories/        # Test data factories
└── utils/            # Helper utilities
```

### File Organization

- **Component tests**: Place in root or create `components/` subdirectory
- **Feature tests**: Place in root or create `features/` subdirectory
- **Page tests**: Place in root or create `pages/` subdirectory

## Best Practices

### 1. Use data-testid Attributes

Always use `data-testid` for selecting elements:

```typescript
await page.click('[data-testid="submit-button"]');
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
```

### 2. Wait for Elements

Always wait for elements before asserting:

```typescript
await page.waitForSelector('[data-testid="product-card"]');
await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
```

### 3. Clean Up State

Always clean up state in beforeEach or afterEach:

```typescript
test.beforeEach(async ({ page }) => {
  await clearStorage(page);
  await setupTestCatalog(page, testProducts);
});
```

### 4. Use Test Steps

Use test steps for readability in long tests:

```typescript
await test.step("Add product to catalog", async () => {
  await page.click('[data-testid="add-product-button"]');
  await page.fill('[data-testid="product-name-input"]', "Test");
  await page.click('[data-testid="save-product-button"]');
});

await test.step("Verify product added", async () => {
  await expect(page.locator('[data-testid="product-card-Test"]')).toBeVisible();
});
```

### 5. Test Both Success and Failure

Always test both positive and negative cases:

```typescript
test("valid input succeeds", async ({ page }) => {
  await page.fill('[data-testid="input"]', "valid");
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});

test("invalid input fails with error", async ({ page }) => {
  await page.fill('[data-testid="input"]', "invalid");
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="error"]')).toBeVisible();
});
```

### 6. Test Responsive Behavior

Always test across different viewports:

```typescript
test("is responsive", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('[data-testid="grid"]')).toHaveCSS("grid-template-columns", "1fr 1fr");

  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('[data-testid="grid"]')).toHaveCSS("grid-template-columns", "repeat(6, 1fr)");
});
```

### 7. Test Keyboard Navigation

Always test keyboard accessibility:

```typescript
test("supports keyboard navigation", async ({ page }) => {
  const button = page.locator('[data-testid="submit-button"]');

  await button.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

### 8. Test Error States

Always test how errors are handled:

```typescript
test("displays error message", async ({ page }) => {
  await page.click('[data-testid="submit-button"]');

  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-message"]')).toHaveText("Field is required");
});
```

### 9. Use Fixtures

Use fixtures for reusable operations:

```typescript
import { createCatalogFixture } from "../fixtures/catalog.fixture";

const catalog = createCatalogFixture();

test("adds product", async ({ page }) => {
  await catalog.addProduct(page, { name: "Test", price: 1000 });
});
```

### 10. Use Factories for Test Data

Use factories for generating test data:

```typescript
import { createMultipleProducts } from "../factories/product-factory";

const products = createMultipleProducts(10);
await setupTestCatalog(page, products);
```

## Common Patterns

### Pattern 1: Form Submission

```typescript
test("submits form successfully", async ({ page }) => {
  await page.fill('[data-testid="name-input"]', "Test Name");
  await page.fill('[data-testid="price-input"]', "10.00");
  await page.click('[data-testid="submit-button"]');

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Pattern 2: Modal Interaction

```typescript
test("opens and closes modal", async ({ page }) => {
  await page.click('[data-testid="open-modal-button"]');

  await expect(page.locator('[data-testid="modal"]')).toBeVisible();

  await page.click('[data-testid="close-modal-button"]');

  await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
});
```

### Pattern 3: List Operations

```typescript
test("adds item to list", async ({ page }) => {
  const items = page.locator('[data-testid^="list-item-"]');
  const initialCount = await items.count();

  await page.fill('[data-testid="input"]', "New Item");
  await page.click('[data-testid="add-button"]');

  await expect(items).toHaveCount(initialCount + 1);
});
```

### Pattern 4: Navigation

```typescript
test("navigates between pages", async ({ page }) => {
  await page.click('[data-testid="nav-button"]');

  await expect(page).toHaveURL(/\/settings/);

  await page.click('[data-testid="back-button"]');

  await expect(page).toHaveURL("/");
});
```

### Pattern 5: State Persistence

```typescript
test("persists state across reload", async ({ page }) => {
  await page.click('[data-testid="toggle-button"]');

  await page.reload();

  await expect(page.locator('[data-testid="toggle-button"]')).toHaveAttribute("aria-pressed", "true");
});
```

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Specific Test File

```bash
npx playwright test tests/examples/product-card.spec.ts
```

### Run Specific Test

```bash
npx playwright test -g "renders correctly"
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

### Run in UI Mode

```bash
npx playwright test --ui
```

### Update Snapshots

```bash
npx playwright test --update-snapshots
```

## Submitting Changes

### Before Submitting

1. Run all tests: `npm run test`
2. Check code formatting: `npm run format` (if available)
3. Run linting: `npm run lint` (if available)
4. Update documentation if needed

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `test`: Adding or updating tests
- `fix`: Bug fix
- `feat`: New feature
- `refactor`: Code refactoring

**Examples**:
- `test(catalog): add tests for product deletion`
- `test(tally): fix flaky quantity input test`
- `test(ui): add visual regression tests for dark mode`

### Pull Request Checklist

- [ ] All tests pass
- [ ] Code follows project conventions
- [ ] Documentation is updated
- [ ] Test coverage is maintained or improved
- [ ] No linting errors

### Review Guidelines

When reviewing tests:

1. Check test clarity and readability
2. Verify test isolation and cleanup
3. Ensure proper error handling
4. Check for appropriate test coverage
5. Verify use of fixtures and factories
6. Check for redundant tests
7. Ensure tests are maintainable

## Additional Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Guidelines](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Naming Conventions](https://xp123.com/xp/articles/naming-test-cases/)
- [Testing Checklist](https://testingjavascript.com/)
