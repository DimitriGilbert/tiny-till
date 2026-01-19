# Troubleshooting Guide

This guide helps you resolve common issues when writing and running tests for Tiny-Till.

## Table of Contents

- [Common Issues](#common-issues)
- [Browser Issues](#browser-issues)
- [Test Execution Issues](#test-execution-issues)
- [Performance Issues](#performance-issues)
- [Visual Regression Issues](#visual-regression-issues)
- [Debugging Tips](#debugging-tips)
- [Getting Help](#getting-help)

## Common Issues

### Tests Not Found

**Symptom**: `No tests found` error when running tests

**Solutions**:
1. Check test file location - should be in `tests/` directory
2. Verify file naming - should end with `.spec.ts`
3. Check test pattern in `playwright.config.ts`:
   ```typescript
   testDir: "./tests",
   testMatch: "**/*.spec.ts",
   ```

### Cannot Find Module

**Symptom**: `Cannot find module '@/...'` or `Cannot find module '../...'`

**Solutions**:
1. Check import path is correct
2. Verify file exists at specified path
3. Use relative imports instead of aliases in test files
4. Run `npm install` to ensure dependencies are installed

### data-testid Not Found

**Symptom**: `locator.click: Target closed` or `locator.click: Timeout`

**Solutions**:
1. Verify element has `data-testid` attribute in production code
2. Wait for element to be visible:
   ```typescript
   await page.waitForSelector('[data-testid="element"]');
   ```
3. Check if element is in shadow DOM:
   ```typescript
   const element = page.locator('.shadow-root').locator('[data-testid="element"]');
   ```

### Timeout Exceeded

**Symptom**: `Test timeout of 30000ms exceeded`

**Solutions**:
1. Increase timeout in test:
   ```typescript
   test.setTimeout(60 * 1000); // 60 seconds
   ```
2. Increase timeout in playwright.config.ts:
   ```typescript
   timeout: 60 * 1000,
   ```
3. Wait for specific condition:
   ```typescript
   await page.waitForSelector('[data-testid="element"]', { timeout: 10000 });
   ```

### Tests Flaky

**Symptom**: Tests sometimes pass, sometimes fail

**Solutions**:
1. Add retries in playwright.config.ts:
   ```typescript
   retries: 2,
   ```
2. Use explicit waits instead of arbitrary timeouts:
   ```typescript
   await page.waitForSelector('[data-testid="element"]');
   await page.waitForLoadState("networkidle");
   ```
3. Check for race conditions and add proper synchronization
4. Use `test.step()` for better error messages

### Storage Not Clearing

**Symptom**: Tests interfere with each other

**Solutions**:
1. Clear storage in beforeEach:
   ```typescript
   test.beforeEach(async ({ page }) => {
     await clearStorage(page);
     await clearIndexedDB(page);
   });
   ```
2. Use unique data for each test
3. Clear specific storage:
   ```typescript
   await page.evaluate(() => localStorage.clear());
   ```

## Browser Issues

### Browser Not Installed

**Symptom**: `BrowserType.launch: Executable doesn't exist`

**Solutions**:
1. Install browsers:
   ```bash
   npx playwright install
   ```
2. Install specific browser:
   ```bash
   npx playwright install chromium
   npx playwright install firefox
   npx playwright install webkit
   ```

### Browser Launch Failed

**Symptom**: `BrowserType.launch: Failed to launch`

**Solutions**:
1. Check system dependencies (Linux):
   ```bash
   sudo npx playwright install-deps
   ```
2. Try launching in headed mode:
   ```typescript
   use: {
     headless: false,
   },
   ```
3. Check if browser is installed:
   ```bash
   npx playwright install --force
   ```

### Browser Crashes During Test

**Symptom**: Browser crashes randomly during test execution

**Solutions**:
1. Reduce concurrency:
   ```typescript
   workers: 1,
   ```
2. Increase timeout:
   ```typescript
   timeout: 60 * 1000,
   ```
3. Check system resources (memory, CPU)
4. Try different browser
5. Run tests one at a time:
   ```bash
   npx playwright test --workers=1
   ```

### WebKit (Safari) Issues

**Symptom**: Tests fail on WebKit only

**Solutions**:
1. WebKit has different CSS behavior - check for browser-specific styles
2. Use `await page.waitForFunction()` for complex conditions
3. Increase timeout for WebKit:
   ```typescript
   use: {
     ...devices["Desktop Safari"],
     launchOptions: {
       slowMo: 100,
     },
   },
   ```
4. Check for Safari-specific bugs in known issues

## Test Execution Issues

### Dev Server Not Running

**Symptom**: `Web Server failed to start`

**Solutions**:
1. Start dev server manually:
   ```bash
   npm run dev
   ```
2. Check webServer config in playwright.config.ts:
   ```typescript
   webServer: {
     command: "npm run dev",
     port: 3001,
     timeout: 120 * 1000,
   },
   ```
3. Check if port is available

### Tests Run in Wrong Order

**Symptom**: Tests don't run in expected order

**Solutions**:
1. Playwright runs tests in parallel - order is not guaranteed
2. Use test.serial() to run tests sequentially:
   ```typescript
   test.serial("dependent test", async ({ page }) => {
     // This test will run after previous test completes
   });
   ```
3. Use beforeEach/afterEach for setup/teardown
4. Make tests independent

### All Tests Skipped

**Symptom**: All tests show as skipped

**Solutions**:
1. Check if tests are configured to skip:
   ```typescript
   test.skip(condition, "Reason");
   ```
2. Check if file pattern matches testMatch config
3. Verify test files exist and are named correctly

### Specific Browser Tests Fail

**Symptom**: Tests fail on specific browser only

**Solutions**:
1. Check browser-specific API usage
2. Use feature detection:
   ```typescript
   const supportsFeature = await page.evaluate(() => 'feature' in window);
   ```
3. Skip tests for specific browsers:
   ```typescript
   test.skip(browserName === 'webkit', 'Feature not supported in Safari');
   ```
4. Check browser matrix configuration

## Performance Issues

### Tests Running Slow

**Symptom**: Tests take too long to complete

**Solutions**:
1. Run tests in parallel (default):
   ```typescript
   workers: undefined,
   ```
2. Use headless mode:
   ```typescript
   use: {
     headless: true,
   },
   ```
3. Reduce number of projects in playwright.config.ts
4. Skip slow tests:
   ```typescript
   test.slow();
   ```
5. Optimize test setup and teardown

### Memory Issues

**Symptom**: Tests fail due to memory exhaustion

**Solutions**:
1. Reduce concurrency:
   ```typescript
   workers: 2,
   ```
2. Close pages in afterEach:
   ```typescript
   test.afterEach(async ({ page }) => {
     await page.close();
   });
   ```
3. Clear storage after tests:
   ```typescript
   test.afterEach(async ({ page }) => {
     await clearStorage(page);
   });
   ```

### Screenshot Timeout

**Symptom**: Screenshots take too long or timeout

**Solutions**:
1. Reduce screenshot area:
   ```typescript
   await page.screenshot({ clip: { x: 0, y: 0, width: 800, height: 600 } });
   ```
2. Skip screenshots for fast tests:
   ```typescript
   use: {
     screenshot: "only-on-failure",
   },
   ```
3. Use element screenshots instead of full page:
   ```typescript
   await element.screenshot();
   ```

## Visual Regression Issues

### Screenshots Don't Match

**Symptom**: Visual regression tests fail due to screenshots not matching baseline

**Solutions**:
1. Update baseline screenshots:
   ```bash
   npx playwright test --update-snapshots
   ```
2. Check if layout changes are intentional
3. Use custom diff options:
   ```typescript
   await expect(page).toHaveScreenshot({
     maxDiffPixels: 100,
     threshold: 0.2,
   });
   ```
4. Mask dynamic elements:
   ```typescript
   await expect(page).toHaveScreenshot({
     mask: [page.locator('[data-testid="dynamic-element"]')],
   });
   ```

### Baseline Not Found

**Symptom**: `Baseline does not exist` error

**Solutions**:
1. Generate baseline:
   ```bash
   npx playwright test --update-snapshots
   ```
2. Check screenshot naming convention
3. Verify baseline directory exists

### Screenshots Different Across Browsers

**Symptom**: Screenshots look different on different browsers

**Solutions**:
1. Use per-browser baselines:
   ```typescript
   await expect(page).toHaveScreenshot(`browser-${browserName}.png`);
   ```
2. Mask browser-specific UI elements
3. Use CSS normalization
4. Test with custom viewport:
   ```typescript
   await page.setViewportSize({ width: 1920, height: 1080 });
   ```

## Debugging Tips

### Use Debug Mode

```bash
npx playwright test --debug
```

This opens a browser and pauses before each action, allowing you to inspect state.

### Use UI Mode

```bash
npx playwright test --ui
```

This provides a GUI to run and inspect tests.

### Add Breakpoints

```typescript
test("example test", async ({ page }) => {
  await page.pause(); // Execution will pause here
  await page.click('[data-testid="button"]');
});
```

### Print Page Content

```typescript
console.log(await page.content());
```

### Take Screenshots Manually

```typescript
await page.screenshot({ path: "debug.png", fullPage: true });
```

### Use Browser DevTools

```typescript
use: {
  headless: false,
  devtools: true,
},
```

### Log Page Events

```typescript
page.on("console", msg => console.log(msg.text()));
page.on("pageerror", err => console.error(err));
```

### Inspect Network Requests

```typescript
const responses: Response[] = [];
page.on("response", response => responses.push(response));

// Later
console.log(responses.map(r => r.url()));
```

## Getting Help

### Check Documentation

- [Playwright Documentation](https://playwright.dev)
- [Tiny-Till Test README](./README.md)
- [Test Templates](./templates/)

### Search Existing Issues

Check if your issue has already been reported in the project's issue tracker.

### Ask for Help

If you can't resolve your issue:

1. Provide error message and stack trace
2. Include relevant code snippet
3. Describe steps to reproduce
4. Mention browser and OS version
5. Include test file that reproduces the issue

### Common Error Messages

| Error | Common Cause | Solution |
|-------|--------------|-----------|
| `Target closed` | Page closed or navigation | Wait for navigation |
| `Timeout exceeded` | Element not found/ready | Increase timeout or wait for condition |
| `Element not visible` | Hidden or off-screen | Wait for visibility or scroll into view |
| `Selector not found` | Incorrect selector | Verify selector is correct |
| `Storage not cleared` | Test interference | Clear storage in beforeEach |
| `Browser crash` | Resource exhaustion | Reduce concurrency or workers |

## Prevention

### Best Practices to Avoid Issues

1. **Always clean up state** in beforeEach/afterEach
2. **Use explicit waits** instead of fixed timeouts
3. **Write independent tests** that don't depend on each other
4. **Use data-testid** for element selection
5. **Test both success and failure** paths
6. **Verify conditions** before asserting
7. **Use test steps** for better error messages
8. **Add proper error handling** in tests
9. **Keep tests focused** on one thing
10. **Update baselines** intentionally, not automatically

### Regular Maintenance

1. Review and update flaky tests regularly
2. Keep dependencies up to date
3. Clean up unused test files
4. Review test coverage periodically
5. Update documentation when tests change
6. Refactor common patterns into fixtures
7. Remove redundant tests
8. Keep test data in factories
9. Use descriptive test names
10. Comment complex test logic
