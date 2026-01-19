import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  browser: string;
  viewport: string;
  testName: string;
  status: "passed" | "failed" | "skipped" | "timedOut";
  duration: number;
  error?: string;
  timestamp: string;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  browsers: string[];
  failures: TestResult[];
}

async function loadResults(resultsPath: string): Promise<TestResult[]> {
  const data = await fs.readFile(resultsPath, "utf-8");
  const json = JSON.parse(data);

  const tests: TestResult[] = [];

  for (const suiteName of Object.keys(json.suites || {})) {
    const suite = json.suites[suiteName];
    for (const specName of Object.keys(suite.specs || {})) {
      const spec = suite.specs[specName];
      const specTests = spec.tests || [];
      tests.push(...specTests.map((test: unknown) => {
        const testObj = test as { title?: string; results?: Array<{ status?: string; duration?: number; error?: { message?: string } }> };
        return {
          browser: spec.projectName || "unknown",
          viewport: "default",
          testName: testObj.title || specName,
          status: (testObj.results?.[0]?.status || "unknown") as "passed" | "failed" | "skipped" | "timedOut",
          duration: testObj.results?.[0]?.duration || 0,
          error: testObj.results?.[0]?.error?.message,
          timestamp: new Date().toISOString(),
        } as TestResult;
      }));
    }
  }

  return tests;
}

function summarizeResults(results: TestResult[]): TestSummary {
  const summary: TestSummary = {
    totalTests: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    duration: results.reduce((sum, r) => sum + r.duration, 0),
    browsers: Array.from(new Set(results.map((r) => r.browser))),
    failures: results.filter((r) => r.status === "failed"),
  };

  return summary;
}

function generateSummaryMarkdown(summary: TestSummary): string {
  const successRate = ((summary.passed / summary.totalTests) * 100).toFixed(1);

  let markdown = "# Test Results Summary\n\n";
  markdown += `## Overview\n\n`;
  markdown += `- **Total Tests**: ${summary.totalTests}\n`;
  markdown += `- **Passed**: ${summary.passed}\n`;
  markdown += `- **Failed**: ${summary.failed}\n`;
  markdown += `- **Skipped**: ${summary.skipped}\n`;
  markdown += `- **Success Rate**: ${successRate}%\n`;
  markdown += `- **Duration**: ${(summary.duration / 1000).toFixed(2)}s\n`;
  markdown += `- **Browsers Tested**: ${summary.browsers.join(", ")}\n\n`;

  if (summary.failures.length > 0) {
    markdown += "## Failed Tests\n\n";

    const failuresByBrowser = new Map<string, TestResult[]>();
    summary.failures.forEach((failure) => {
      const key = `${failure.browser} (${failure.viewport})`;
      const existing = failuresByBrowser.get(key) || [];
      existing.push(failure);
      failuresByBrowser.set(key, existing);
    });

    for (const [browser, failures] of failuresByBrowser.entries()) {
      markdown += `### ${browser}\n\n`;
      failures.forEach((failure) => {
        markdown += `- \`${failure.testName}\`\n`;
        if (failure.error) {
          markdown += `  - **Error**: ${failure.error}\n`;
        }
      });
      markdown += "\n";
    }
  }

  if (summary.failures.length === 0) {
    markdown += "## ✅ All tests passed!\n\n";
  }

  return markdown;
}

function generateJSONReport(summary: TestSummary): string {
  return JSON.stringify(summary, null, 2);
}

async function main() {
  const resultsDir = path.join(__dirname, "..", "..", "test-results");
  const resultsPath = path.join(resultsDir, "results.json");
  const outputPath = path.join(resultsDir, "summary.md");
  const jsonOutputPath = path.join(resultsDir, "summary.json");

  try {
    const results = await loadResults(resultsPath);
    const summary = summarizeResults(results);

    const markdown = generateSummaryMarkdown(summary);
    await fs.writeFile(outputPath, markdown);
    console.log(`Summary report written to: ${outputPath}`);

    const jsonReport = generateJSONReport(summary);
    await fs.writeFile(jsonOutputPath, jsonReport);
    console.log(`JSON summary written to: ${jsonOutputPath}`);

    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Error generating summary:", error);
    process.exit(1);
  }
}

main();
