import type { Page } from "@playwright/test";

interface TallyItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface TallyFixture {
  items: TallyItem[];
  navigateToTally: (page: Page) => Promise<void>;
  addItem: (page: Page, productId: string) => Promise<void>;
  setQuantity: (page: Page, productId: string, quantity: number) => Promise<void>;
  clearTally: (page: Page) => Promise<void>;
  getItems: (page: Page) => Promise<TallyItem[]>;
  getTotal: (page: Page) => Promise<number>;
  getItemCount: (page: Page) => Promise<number>;
}

export const createTallyFixture = (): TallyFixture => {
  return {
    items: [],

    async navigateToTally(page: Page): Promise<void> {
      await page.goto("/");
    },

    async addItem(page: Page, productId: string): Promise<void> {
      await page.click(`[data-testid="product-card-${productId}"]`);
      await page.waitForTimeout(100);
    },

    async setQuantity(page: Page, productId: string, quantity: number): Promise<void> {
      const badge = page.locator(`[data-testid="product-card-${productId}"] [data-testid="quantity-badge"]`);
      await badge.click();

      const input = page.locator('[data-testid="quantity-input"]');
      await input.fill(String(quantity));
      await page.click('[data-testid="confirm-quantity-button"]');
      await page.waitForTimeout(100);
    },

    async clearTally(page: Page): Promise<void> {
      await page.click('[data-testid="clear-cart-button"]');
      await page.click('[data-testid="confirm-clear-button"]');
      await page.waitForSelector('[data-testid="empty-cart-message"]');
    },

    async getItems(page: Page): Promise<TallyItem[]> {
      const quantityBadges = await page.locator('[data-testid="quantity-badge"]').all();
      const items: TallyItem[] = [];

      for (const badge of quantityBadges) {
        const productCard = badge.locator("xpath=ancestor::div[starts-with(@data-testid, 'product-card-')]");
        const productId = (await productCard.getAttribute("data-testid"))?.replace("product-card-", "") || "";
        const quantityText = await badge.textContent();
        const quantity = parseInt(quantityText || "0", 10);

        if (quantity > 0) {
          const priceText = await productCard.locator('[data-testid="product-price"]').textContent();
          const price = parseFloat((priceText ?? "").replace(/[^0-9.-]+/g, "") || "0");

          items.push({
            productId,
            quantity,
            price,
          });
        }
      }

      return items;
    },

    async getTotal(page: Page): Promise<number> {
      const totalElement = page.locator('[data-testid="grand-total"]');
      const totalText = await totalElement.textContent();
      return parseFloat((totalText ?? "").replace(/[^0-9.-]+/g, "") || "0");
    },

    async getItemCount(page: Page): Promise<number> {
      const itemCountElement = page.locator('[data-testid="item-count"]');
      const itemCountText = await itemCountElement.textContent();
      return parseInt((itemCountText ?? "").replace(/\D/g, "") || "0", 10);
    },
  };
};
