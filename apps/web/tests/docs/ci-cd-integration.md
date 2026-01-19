# CI/CD Integration Guide

This guide explains how to integrate Playwright tests into CI/CD pipelines for Tiny-Till.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions](#github-actions)
- [Test Configuration](#test-configuration)
- [Reporting](#reporting)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### Why CI/CD Integration?

- **Automated Testing**: Run tests automatically on every push/PR
- **Early Detection**: Catch issues before they reach production
- **Consistent Environment**: Ensure tests run in identical environment
- **Coverage Reports**: Track test coverage over time
- **Artifact Collection**: Store test results and screenshots

### Supported CI/CD Platforms

- GitHub Actions (Recommended)
- GitLab CI
- CircleCI
- Azure DevOps
- Jenkins
- Travis CI

## GitHub Actions

### Basic Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: test-results/
          retention-days: 30
```

### Matrix Strategy

Test across multiple browsers:

```yaml
name: Playwright Tests Matrix

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps ${{ matrix.project }}

      - name: Run Playwright tests on ${{ matrix.project }}
        run: npx playwright test --project=${{ matrix.project }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.project }}
          path: test-results/
```

### With Caching

Speed up builds by caching dependencies:

```yaml
name: Playwright Tests with Cache

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
          restore-keys: ${{ runner.os }}-playwright-

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: test-results/
```

### With GitHub Integration

Use Playwright's GitHub reporter for inline annotations:

```yaml
name: Playwright Tests with GitHub Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Run Playwright tests
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: test-results/

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-html-report
          path: test-results/html-report/
```

### Deploy to GitHub Pages

After tests pass, deploy to GitHub Pages:

```yaml
name: Playwright Tests and Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: test-results/

  deploy:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Test Configuration

### Playwright Config for CI

Update `playwright.config.ts`:

```typescript
const config: PlaywrightTestConfig = {
  // ... existing config

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["html", { outputFolder: "test-results/html-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    process.env.GITHUB_ACTIONS && ["github"],
  ].filter(Boolean) as ReporterConfig[],

  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
};
```

### Environment Variables

Configure environment variables in CI:

```yaml
- name: Run Playwright tests
  env:
    CI: true
    NODE_ENV: test
    DEBUG: pw:*
  run: npx playwright test
```

### Browser Selection

Select specific browsers for CI to save time:

```yaml
strategy:
  matrix:
    browser: [chromium, firefox]
    # webkit excluded for faster CI runs
```

## Reporting

### HTML Report

Upload and access HTML report:

```yaml
- name: Upload HTML report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-html-report
    path: test-results/html-report/
```

### JSON Report

Use JSON report for custom analysis:

```yaml
- name: Upload JSON report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-json-report
    path: test-results/results.json
```

### JUnit Report

Use JUnit report for test tracking systems:

```yaml
- name: Upload JUnit report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-junit-report
    path: test-results/junit.xml
```

### Screenshots and Videos

Upload screenshots and videos from failed tests:

```yaml
- name: Upload screenshots
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-screenshots
    path: test-results/screenshots/

- name: Upload videos
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-videos
    path: test-results/videos/
```

### Trace Files

Upload trace files for debugging:

```yaml
- name: Upload trace files
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-traces
    path: test-results/traces/
```

## Best Practices

### 1. Fail Fast

Use `fail-fast: false` to run all tests even if some fail:

```yaml
strategy:
  fail-fast: false
```

### 2. Parallel Execution

Run tests in parallel to reduce total time:

```yaml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]

- name: Run Playwright tests
  run: npx playwright test --shard=${{ matrix.shard }}
```

### 3. Artifact Retention

Set appropriate artifact retention:

```yaml
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: test-results/
    retention-days: 30
```

### 4. Conditional Steps

Run steps conditionally:

```yaml
- name: Report to Slack
  if: failure() && github.ref == 'refs/heads/main'
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
```

### 5. Caching

Cache dependencies and browsers:

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```

### 6. Timeout Management

Set appropriate timeouts:

```yaml
jobs:
  test:
    timeout-minutes: 60

- name: Run Playwright tests
  run: npx playwright test --timeout=60000
```

### 7. Notifications

Set up notifications for test results:

```yaml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: 'Tests failed. Please check the workflow results.'
      })
```

## Troubleshooting

### Tests Timeout in CI

**Symptom**: Tests timeout in CI but pass locally

**Solutions**:
1. Increase timeout in CI workflow
2. Increase test timeout in playwright.config.ts
3. Reduce parallelism
4. Use `--workers=1` flag

### Browsers Not Installing

**Symptom**: Playwright browsers fail to install

**Solutions**:
```yaml
- name: Install system dependencies
  run: sudo apt-get install -y libicu74 libjpeg-turbo8

- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium
```

### Artifacts Not Uploading

**Symptom**: Test artifacts don't upload

**Solutions**:
1. Use `if: always()` to upload on failure
2. Check artifact path is correct
3. Verify artifact size doesn't exceed limits

### GitHub Annotations Not Appearing

**Symptom**: GitHub test annotations don't appear

**Solutions**:
1. Ensure GITHUB_TOKEN is set
2. Check that github reporter is enabled
3. Verify workflow is triggered on PR

### Slow CI Runs

**Symptom**: CI takes too long to complete

**Solutions**:
1. Use caching for dependencies
2. Run tests in parallel
3. Reduce browser matrix
4. Use sharding for large test suites
5. Skip visual regression tests in CI

### Flaky Tests in CI

**Symptom**: Tests fail intermittently in CI

**Solutions**:
1. Increase retries in playwright.config.ts
2. Add explicit waits instead of arbitrary timeouts
3. Use proper cleanup in beforeEach/afterEach
4. Run tests in serial mode to identify race conditions

### Memory Issues in CI

**Symptom**: CI runner runs out of memory

**Solutions**:
1. Reduce number of workers
2. Close pages in afterEach
3. Clear storage after tests
4. Increase runner memory (if using self-hosted runners)

## Additional Resources

- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Integration Reporter](https://playwright.dev/docs/test-reporters#github-actions-annotations-for-failures)
- [Actions Marketplace](https://github.com/marketplace?type=actions)
- [Playwright Docker Images](https://github.com/microsoft/playwright/tree/main/packages/docker)
