import type { Page } from "@playwright/test";

interface Product {
  id: string;
  name: string;
  price: number;
  imageData?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CatalogFixture {
  products: Product[];
  navigateToCatalog: (page: Page) => Promise<void>;
  addProduct: (
    page: Page,
    product: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  editProduct: (
    page: Page,
    productId: string,
    updates: Partial<Product>,
  ) => Promise<void>;
  deleteProduct: (page: Page, productId: string) => Promise<void>;
  exportCatalog: (page: Page) => Promise<Buffer>;
  importCatalog: (page: Page, jsonData: string) => Promise<void>;
  getProducts: (page: Page) => Promise<Product[]>;
}

export const createCatalogFixture = (): CatalogFixture => {
  return {
    products: [],

    async navigateToCatalog(page: Page): Promise<void> {
      await page.goto("/catalog");
    },

    async addProduct(
      page: Page,
      product: Omit<Product, "id" | "createdAt" | "updatedAt">,
    ): Promise<void> {
      await this.navigateToCatalog(page);

      await page.click('[data-testid="add-product-button"]');

      await page.fill('[data-testid="product-name-input"]', product.name);
      await page.fill(
        '[data-testid="product-price-input"]',
        String(product.price),
      );

      if (product.imageData) {
        await page.setInputFiles('[data-testid="product-image-input"]', {
          name: "test-image.png",
          mimeType: "image/png",
          buffer: Buffer.from(product.imageData.split(",")[1], "base64"),
        });
      }

      await page.click('[data-testid="save-product-button"]');
      await page.waitForSelector('[data-testid="product-list-item"]');
    },

    async editProduct(
      page: Page,
      productId: string,
      updates: Partial<Product>,
    ): Promise<void> {
      await page.click(
        `[data-testid="product-item-${productId}"] [data-testid="edit-button"]`,
      );

      if (updates.name !== undefined) {
        await page.fill('[data-testid="product-name-input"]', updates.name);
      }

      if (updates.price !== undefined) {
        await page.fill(
          '[data-testid="product-price-input"]',
          String(updates.price),
        );
      }

      await page.click('[data-testid="save-product-button"]');
      await page.waitForSelector('[data-testid="product-list-item"]');
    },

    async deleteProduct(page: Page, productId: string): Promise<void> {
      await page.click(
        `[data-testid="product-item-${productId}"] [data-testid="delete-button"]`,
      );
      await page.click('[data-testid="confirm-delete-button"]');
    },

    async exportCatalog(page: Page): Promise<Buffer> {
      await page.goto("/settings");
      await page.click('[data-testid="export-catalog-button"]');

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.click('[data-testid="confirm-export-button"]'),
      ]);

      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    },

    async importCatalog(page: Page, jsonData: string): Promise<void> {
      await page.goto("/settings");
      await page.click('[data-testid="import-catalog-button"]');

      const fileInput = page.locator('[data-testid="import-file-input"]');
      await fileInput.setInputFiles({
        name: "catalog.json",
        mimeType: "application/json",
        buffer: Buffer.from(jsonData),
      });

      await page.click('[data-testid="confirm-import-button"]');
      await page.waitForSelector('[data-testid="import-success-message"]');
    },

    async getProducts(page: Page): Promise<Product[]> {
      const productElements = await page
        .locator('[data-testid^="product-item-"]')
        .all();
      const products: Product[] = [];

      for (const element of productElements) {
        const name = await element
          .locator('[data-testid="product-name"]')
          .textContent();
        const priceText = await element
          .locator('[data-testid="product-price"]')
          .textContent();
        const price = parseFloat(
          (priceText ?? "").replace(/[^0-9.-]+/g, "") || "0",
        );

        products.push({
          id:
            (await element.getAttribute("data-testid"))?.replace(
              "product-item-",
              "",
            ) || "",
          name: name || "",
          price,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return products;
    },
  };
};
