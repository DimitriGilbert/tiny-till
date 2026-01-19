interface BrowserConfig {
  name: string;
  os: string;
  versions: string[];
  viewports: { width: number; height: number }[];
  priority: "high" | "medium" | "low";
}

export const browserMatrix: BrowserConfig[] = [
  {
    name: "Chrome",
    os: "macOS/Windows",
    versions: ["latest", "latest-1"],
    viewports: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
    ],
    priority: "high",
  },
  {
    name: "Firefox",
    os: "macOS/Windows",
    versions: ["latest", "latest-1"],
    viewports: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
    ],
    priority: "high",
  },
  {
    name: "Safari",
    os: "macOS",
    versions: ["latest", "latest-1"],
    viewports: [{ width: 1920, height: 1080 }],
    priority: "high",
  },
  {
    name: "Chrome",
    os: "iOS",
    versions: ["latest", "latest-1"],
    viewports: [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
    ],
    priority: "high",
  },
  {
    name: "Safari",
    os: "iOS",
    versions: ["latest", "latest-1"],
    viewports: [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
    ],
    priority: "high",
  },
  {
    name: "Chrome",
    os: "Android",
    versions: ["latest", "latest-1"],
    viewports: [
      { width: 393, height: 851 },
      { width: 360, height: 800 },
    ],
    priority: "high",
  },
  {
    name: "Firefox",
    os: "Android",
    versions: ["latest"],
    viewports: [{ width: 393, height: 851 }],
    priority: "medium",
  },
];

export function getBrowserMatrixPriority(priority: "high" | "medium" | "low"): BrowserConfig[] {
  return browserMatrix.filter((browser) => browser.priority === priority);
}

export function getBrowserMatrixByOS(os: string): BrowserConfig[] {
  return browserMatrix.filter((browser) => browser.os.includes(os));
}
