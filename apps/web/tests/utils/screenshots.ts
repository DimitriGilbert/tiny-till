import type { Page, Locator } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function takeScreenshot(page: Page, name: string, options?: { fullPage?: boolean }): Promise<void> {
  const screenshotPath = path.join(__dirname, "..", "..", "test-results", "screenshots", `${name}.png`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: options?.fullPage ?? false,
  });
}

export async function takeElementScreenshot(
  page: Page,
  element: Locator,
  name: string
): Promise<void> {
  const screenshotPath = path.join(__dirname, "..", "..", "test-results", "screenshots", `${name}.png`);
  await element.screenshot({ path: screenshotPath });
}

export async function takeScreenshotOnFailure(page: Page, testName: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const screenshotPath = path.join(__dirname, "..", "..", "test-results", "screenshots", `failure-${testName}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

export async function captureVisualBaseline(page: Page, name: string): Promise<void> {
  const baselinePath = path.join(__dirname, "..", "..", "test-results", "baselines", `${name}.png`);
  await page.screenshot({
    path: baselinePath,
    fullPage: false,
  });
}

export async function compareScreenshotToBaseline(page: Page, name: string): Promise<boolean> {
  const currentPath = path.join(__dirname, "..", "..", "test-results", "screenshots", `${name}.png`);
  const baselinePath = path.join(__dirname, "..", "..", "test-results", "baselines", `${name}.png`);

  await page.screenshot({ path: currentPath, fullPage: false });

  try {
    const fs = await import("fs/promises");
    const [currentBuffer, baselineBuffer] = await Promise.all([
      fs.readFile(currentPath),
      fs.readFile(baselinePath),
    ]);

    return currentBuffer.equals(baselineBuffer);
  } catch (error) {
    console.warn(`Could not compare screenshot to baseline: ${error}`);
    return false;
  }
}

export async function takeScreenshotAcrossViewports(page: Page, name: string): Promise<void> {
  const viewports = [
    { width: 375, height: 667 },
    { width: 768, height: 1024 },
    { width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(200);
    const viewportName = `${name}-${viewport.width}x${viewport.height}`;
    await takeScreenshot(page, viewportName);
  }
}

export async function takeDarkLightModeScreenshots(page: Page, name: string): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.classList.add("light");
  });
  await page.waitForTimeout(200);
  await takeScreenshot(page, `${name}-light`);

  await page.evaluate(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  });
  await page.waitForTimeout(200);
  await takeScreenshot(page, `${name}-dark`);
}

export function getScreenshotPath(name: string): string {
  return path.join(__dirname, "..", "..", "test-results", "screenshots", `${name}.png`);
}

export function getBaselinePath(name: string): string {
  return path.join(__dirname, "..", "..", "test-results", "baselines", `${name}.png`);
}
