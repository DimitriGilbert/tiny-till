import type { Page } from "@playwright/test";

type Theme = "light" | "dark" | "system";
type GridDensity = "normal" | "compact";

export interface SettingsFixture {
  navigateToSettings: (page: Page) => Promise<void>;
  setTheme: (page: Page, theme: Theme) => Promise<void>;
  getTheme: (page: Page) => Promise<Theme>;
  setGridDensity: (page: Page, density: GridDensity) => Promise<void>;
  getGridDensity: (page: Page) => Promise<GridDensity>;
  setColumnCount: (page: Page, count: number) => Promise<void>;
  getColumnCount: (page: Page) => Promise<number>;
  resetSettings: (page: Page) => Promise<void>;
}

export const createSettingsFixture = (): SettingsFixture => {
  return {
    async navigateToSettings(page: Page): Promise<void> {
      await page.goto("/settings");
    },

    async setTheme(page: Page, theme: Theme): Promise<void> {
      await this.navigateToSettings(page);
      const themeButton = page.locator(`[data-testid="theme-${theme}-button"]`);
      await themeButton.click();
      await page.waitForTimeout(200);
    },

    async getTheme(page: Page): Promise<Theme> {
      const activeTheme = await page.locator('[data-testid^="theme-"][aria-selected="true"]').getAttribute("data-testid");
      return (activeTheme?.replace("theme-", "").replace("-button", "") as Theme) || "system";
    },

    async setGridDensity(page: Page, density: GridDensity): Promise<void> {
      await this.navigateToSettings(page);
      const densityButton = page.locator(`[data-testid="density-${density}-button"]`);
      await densityButton.click();
      await page.waitForTimeout(200);
    },

    async getGridDensity(page: Page): Promise<GridDensity> {
      const activeDensity = await page.locator('[data-testid^="density-"][aria-selected="true"]').getAttribute("data-testid");
      return (activeDensity?.replace("density-", "").replace("-button", "") as GridDensity) || "normal";
    },

    async setColumnCount(page: Page, count: number): Promise<void> {
      await this.navigateToSettings(page);
      const slider = page.locator('[data-testid="column-count-slider"]');
      await slider.evaluate((el: HTMLInputElement, value) => {
        el.value = String(value);
      }, count);
      await slider.dispatchEvent("change");
      await page.waitForTimeout(200);
    },

    async getColumnCount(page: Page): Promise<number> {
      const slider = page.locator('[data-testid="column-count-slider"]');
      const value = await slider.inputValue();
      return parseInt(value, 10);
    },

    async resetSettings(page: Page): Promise<void> {
      await this.navigateToSettings(page);
      await page.click('[data-testid="reset-settings-button"]');
      await page.click('[data-testid="confirm-reset-button"]');
      await page.waitForTimeout(200);
    },
  };
};
