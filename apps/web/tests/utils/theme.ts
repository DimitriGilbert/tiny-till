import type { Page } from "@playwright/test";

export async function setTheme(page: Page, theme: "light" | "dark" | "system"): Promise<void> {
  await page.evaluate((themeValue) => {
    localStorage.setItem("theme", themeValue);
  }, theme);
  await page.reload();
}

export async function getTheme(page: Page): Promise<"light" | "dark" | "system"> {
  return page.evaluate(() => {
    const theme = localStorage.getItem("theme") as "light" | "dark" | "system";
    return theme || "system";
  });
}

export async function toggleTheme(page: Page): Promise<void> {
  await page.click('[data-testid="theme-toggle-button"]');
  await page.waitForTimeout(200);
}

export async function isDarkMode(page: Page): Promise<boolean> {
  const html = page.locator("html");
  const className = await html.getAttribute("class");
  return className?.includes("dark") ?? false;
}

export async function waitForThemeChange(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.classList.contains("dark") || document.documentElement.classList.contains("light"),
    { timeout: 5000 }
  );
}

export async function getSystemTheme(page: Page): Promise<"light" | "dark"> {
  return page.evaluate(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
}

export async function verifyThemeApplied(page: Page, expectedTheme: "light" | "dark"): Promise<boolean> {
  await waitForThemeChange(page);
  const actualTheme = expectedTheme === "dark" ? await isDarkMode(page) : !(await isDarkMode(page));
  return actualTheme;
}
