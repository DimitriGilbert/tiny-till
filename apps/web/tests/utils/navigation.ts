import type { Page } from "@playwright/test";

export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

export async function navigateAndWait(page: Page, path: string, selector: string): Promise<void> {
  await Promise.all([
    page.waitForSelector(selector),
    page.goto(path),
  ]);
}

export async function goBack(page: Page): Promise<void> {
  await page.goBack();
  await page.waitForLoadState("networkidle");
}

export async function goForward(page: Page): Promise<void> {
  await page.goForward();
  await page.waitForLoadState("networkidle");
}

export async function reload(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState("networkidle");
}

export async function waitForNavigation(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}

export async function getCurrentPath(page: Page): Promise<string> {
  return page.evaluate(() => window.location.pathname);
}

export async function checkNavigationGuard(page: Page, path: string, expectedMessage: string): Promise<boolean> {
  await page.goto(path);

  const dialog = await page.waitForEvent("dialog");
  const message = dialog.message();
  await dialog.accept();

  return message === expectedMessage;
}
