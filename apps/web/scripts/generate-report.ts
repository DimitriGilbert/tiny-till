import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestSuite {
  name: string;
  specResults: SpecResult[];
}

interface SpecResult {
  name: string;
  browser: string;
  status: "passed" | "failed" | "skipped" | "timedOut";
  duration: number;
  error?: string;
}

interface ReportData {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: TestSuite[];
  failures: SpecResult[];
}

async function generateHTMLReport(reportData: ReportData): Promise<string> {
  const passedPercent = reportData.totalTests > 0
    ? ((reportData.passed / reportData.totalTests) * 100).toFixed(1)
    : "0";

  const failedTestsHTML = reportData.failures.map(failure => `
    <div class="test-failure">
      <div class="test-name">${failure.name}</div>
      <div class="test-browser">${failure.browser}</div>
      <div class="test-status status-${failure.status}">${failure.status}</div>
      ${failure.error ? `<div class="test-error">${escapeHtml(failure.error)}</div>` : ""}
    </div>
  `).join("");

  const suitesHTML = reportData.suites.map(suite => {
    const suitePassed = suite.specResults.filter(s => s.status === "passed").length;
    const suiteFailed = suite.specResults.filter(s => s.status === "failed").length;
    const suiteTotal = suite.specResults.length;

    return `
      <div class="test-suite">
        <h3 class="suite-name">${escapeHtml(suite.name)}</h3>
        <div class="suite-stats">
          <span class="stat passed">${suitePassed} passed</span>
          <span class="stat failed">${suiteFailed} failed</span>
          <span class="stat total">${suiteTotal} total</span>
        </div>
      </div>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Report - Tiny-Till</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
        }
        .timestamp {
          opacity: 0.9;
          font-size: 0.9em;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .summary-card .value {
          font-size: 2em;
          font-weight: bold;
          margin: 10px 0;
        }
        .summary-card .label {
          color: #666;
          text-transform: uppercase;
          font-size: 0.8em;
          letter-spacing: 1px;
        }
        .test-failures {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .test-failures h2 {
          margin-top: 0;
          color: #dc3545;
        }
        .test-failure {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
          background: #fff5f5;
        }
        .test-name {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 1.1em;
        }
        .test-browser {
          color: #666;
          margin-bottom: 5px;
        }
        .test-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.9em;
          font-weight: bold;
        }
        .test-status.status-passed {
          background: #28a745;
          color: white;
        }
        .test-status.status-failed {
          background: #dc3545;
          color: white;
        }
        .test-status.status-skipped {
          background: #ffc107;
          color: #333;
        }
        .test-error {
          background: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .test-suites {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .test-suite {
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        .test-suite:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .suite-name {
          margin-top: 0;
          color: #667eea;
        }
        .suite-stats {
          margin-top: 10px;
        }
        .stat {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 4px;
          margin-right: 10px;
          font-weight: bold;
        }
        .stat.passed {
          background: #d4edda;
          color: #155724;
        }
        .stat.failed {
          background: #f8d7da;
          color: #721c24;
        }
        .stat.total {
          background: #e2e3e5;
          color: #383d41;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Test Report</h1>
        <div class="timestamp">Generated: ${reportData.timestamp}</div>
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="value">${reportData.totalTests}</div>
          <div class="label">Total Tests</div>
        </div>
        <div class="summary-card">
          <div class="value" style="color: #28a745;">${reportData.passed}</div>
          <div class="label">Passed</div>
        </div>
        <div class="summary-card">
          <div class="value" style="color: #dc3545;">${reportData.failed}</div>
          <div class="label">Failed</div>
        </div>
        <div class="summary-card">
          <div class="value" style="color: #ffc107;">${reportData.skipped}</div>
          <div class="label">Skipped</div>
        </div>
        <div class="summary-card">
          <div class="value">${passedPercent}%</div>
          <div class="label">Success Rate</div>
        </div>
        <div class="summary-card">
          <div class="value">${(reportData.duration / 1000).toFixed(2)}s</div>
          <div class="label">Duration</div>
        </div>
      </div>

      ${reportData.failures.length > 0 ? `
      <div class="test-failures">
        <h2>Failed Tests (${reportData.failures.length})</h2>
        ${failedTestsHTML}
      </div>
      ` : ""}

      <div class="test-suites">
        <h2>Test Suites</h2>
        ${suitesHTML}
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function main() {
  const resultsDir = path.join(__dirname, "..", "..", "test-results");
  const resultsPath = path.join(resultsDir, "results.json");
  const outputPath = path.join(resultsDir, "report.html");

  try {
    const data = await fs.readFile(resultsPath, "utf-8");
    const json = JSON.parse(data);

    const reportData: ReportData = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: [],
      failures: [],
    };

    for (const suiteName of Object.keys(json.suites || {})) {
      const suite = json.suites[suiteName];
      const suiteResults: SpecResult[] = [];

      for (const specName of Object.keys(suite.specs || {})) {
        const spec = suite.specs[specName];
        const specTests = spec.tests || [];

        for (const test of specTests) {
          const testObj = test as { title?: string; results?: Array<{ status?: string; duration?: number; error?: { message?: string } }> };
          const result: SpecResult = {
            name: testObj.title || specName,
            browser: spec.projectName || "unknown",
            status: (testObj.results?.[0]?.status || "unknown") as "passed" | "failed" | "skipped" | "timedOut",
            duration: testObj.results?.[0]?.duration || 0,
            error: testObj.results?.[0]?.error?.message,
          };

          reportData.totalTests++;

          switch (result.status) {
            case "passed":
              reportData.passed++;
              break;
            case "failed":
              reportData.failed++;
              reportData.failures.push(result);
              break;
            case "skipped":
              reportData.skipped++;
              break;
          }

          reportData.duration += result.duration;
          suiteResults.push(result);
        }
      }

      reportData.suites.push({
        name: suiteName,
        specResults: suiteResults,
      });
    }

    const html = await generateHTMLReport(reportData);
    await fs.writeFile(outputPath, html);
    console.log(`HTML report generated: ${outputPath}`);

    process.exit(reportData.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Error generating report:", error);
    process.exit(1);
  }
}

main();
