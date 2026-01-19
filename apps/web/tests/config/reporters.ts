type ReporterConfig = [string, Record<string, unknown>?] | [string, string, Record<string, unknown>?];

export const htmlReporter: ReporterConfig = [
  "html",
  {
    outputFolder: "test-results/html-report",
    open: "never",
  },
];

export const jsonReporter: ReporterConfig = [
  "json",
  {
    outputFile: "test-results/results.json",
  },
];

export const listReporter: ReporterConfig = ["list"];

export const githubReporter: ReporterConfig = [
  "github",
  {
    enabled: process.env.GITHUB_ACTIONS === "true",
  },
];

export const defaultReporters: ReporterConfig[] = [
  htmlReporter,
  jsonReporter,
  listReporter,
];

export const ciReporters: ReporterConfig[] = [
  jsonReporter,
  listReporter,
  githubReporter,
];
