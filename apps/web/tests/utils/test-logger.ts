import type { FullConfig } from "@playwright/test";

interface TestCase {
  title: string;
  parent?: Suite;
}

interface Suite {
  title: string;
}

interface TestResult {
  status: "passed" | "failed" | "skipped" | "timedOut";
  duration: number;
  error?: {
    message: string;
  };
}

interface TestLog {
  browser: string;
  viewport: string;
  testName: string;
  status: "passed" | "failed" | "skipped" | "timedOut";
  duration: number;
  error?: string;
  timestamp: string;
}

interface TestRunSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  browsers: string[];
  logs: TestLog[];
}

class TestLogger {
  private logs: TestLog[] = [];
  private currentBrowser: string = "unknown";
  private currentViewport: string = "unknown";

  setBrowser(browser: string): void {
    this.currentBrowser = browser;
  }

  setViewport(viewport: string): void {
    this.currentViewport = viewport;
  }

  logTestResult(test: TestCase, result: TestResult): void {
    const log: TestLog = {
      browser: this.currentBrowser,
      viewport: this.currentViewport,
      testName: test.title,
      status: result.status,
      duration: result.duration,
      timestamp: new Date().toISOString(),
    };

    if (result.error) {
      log.error = result.error.message;
    }

    this.logs.push(log);
  }

  getSummary(): TestRunSummary {
    const summary: TestRunSummary = {
      totalTests: this.logs.length,
      passed: this.logs.filter((log) => log.status === "passed").length,
      failed: this.logs.filter((log) => log.status === "failed").length,
      skipped: this.logs.filter((log) => log.status === "skipped").length,
      duration: this.logs.reduce((sum, log) => sum + log.duration, 0),
      browsers: Array.from(new Set(this.logs.map((log) => log.browser))),
      logs: this.logs,
    };

    return summary;
  }

  printSummary(): void {
    const summary = this.getSummary();

    console.log("\n=== Test Run Summary ===");
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Skipped: ${summary.skipped}`);
    console.log(`Duration: ${summary.duration}ms`);
    console.log(`Browsers Tested: ${summary.browsers.join(", ")}`);

    if (summary.failed > 0) {
      console.log("\n=== Failed Tests ===");
      this.logs
        .filter((log) => log.status === "failed")
        .forEach((log) => {
          console.log(`\n${log.testName}`);
          console.log(`  Browser: ${log.browser}`);
          console.log(`  Viewport: ${log.viewport}`);
          console.log(`  Error: ${log.error || "Unknown error"}`);
        });
    }
  }

  saveToJSON(filePath: string): void {
    const summary = this.getSummary();
    const fs = require("fs");
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  }

  categorizeFailuresByBrowser(): Map<string, TestLog[]> {
    const failures = this.logs.filter((log) => log.status === "failed");
    const categorized = new Map<string, TestLog[]>();

    failures.forEach((log) => {
      const key = `${log.browser} (${log.viewport})`;
      const existing = categorized.get(key) || [];
      existing.push(log);
      categorized.set(key, existing);
    });

    return categorized;
  }
}

const logger = new TestLogger();

export function configureLogger(config: FullConfig): void {
  config.projects.forEach((project) => {
    const browser = project.use.browserName || "chromium";
    const viewport = project.use.viewport
      ? `${project.use.viewport.width}x${project.use.viewport.height}`
      : "default";

    logger.setBrowser(browser);
    logger.setViewport(viewport);
  });
}

export function logTestCaseBegin(): void {
}

export function logTestCaseEnd(test: TestCase, result: TestResult): void {
  logger.logTestResult(test, result);
}

export function logTestSuiteBegin(suite: Suite): void {
  console.log(`\nRunning suite: ${suite.title}`);
}

export function logTestSuiteEnd(): void {
  logger.printSummary();
}

export function getTestLogger(): TestLogger {
  return logger;
}

export type { TestLog, TestRunSummary };
