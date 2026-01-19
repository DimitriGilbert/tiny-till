import type { Page } from "@playwright/test";

interface TestProduct {
  id: string;
  name: string;
  price: number;
  imageData?: string;
  createdAt: number;
  updatedAt: number;
}

export async function setupTestCatalog(page: Page, products: TestProduct[]): Promise<void> {
  await page.evaluate(async (data) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("tiny-till-catalog", 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["products"], "readwrite");
        const store = transaction.objectStore("products");

        store.clear();

        data.forEach((product) => {
          store.put(product);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "id" });
          store.createIndex("name", "name", { unique: true });
        }
      };
    });
  }, products);
}

export async function createTestProduct(overrides?: Partial<TestProduct>): Promise<TestProduct> {
  return {
    id: crypto.randomUUID(),
    name: "Test Product",
    price: 1000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export async function createTestCatalog(count: number = 10): Promise<TestProduct[]> {
  const products: TestProduct[] = [];

  for (let i = 0; i < count; i++) {
    products.push(await createTestProduct({
      name: `Product ${i + 1}`,
      price: (i + 1) * 1000,
    }));
  }

  return products;
}

export async function createLargeCatalog(count: number = 100): Promise<TestProduct[]> {
  const products: TestProduct[] = [];

  for (let i = 0; i < count; i++) {
    products.push(await createTestProduct({
      name: `Product ${i + 1}`,
      price: (Math.floor(Math.random() * 50) + 1) * 100,
    }));
  }

  return products;
}

export async function cleanupTestState(page: Page): Promise<void> {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();

    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase("tiny-till-catalog");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export async function seedTestSettings(page: Page, settings: Record<string, unknown>): Promise<void> {
  await page.evaluate((data) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }, settings);
}

export async function getTestProductsFromPage(page: Page): Promise<TestProduct[]> {
  return page.evaluate(() => {
    return new Promise<TestProduct[]>((resolve, reject) => {
      const request = indexedDB.open("tiny-till-catalog", 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["products"], "readonly");
        const store = transaction.objectStore("products");
        const getRequest = store.getAll();

        getRequest.onsuccess = () => resolve(getRequest.result as TestProduct[]);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  });
}

export async function verifyTestStateClean(page: Page): Promise<boolean> {
  const localStorageEmpty = await page.evaluate(() => localStorage.length === 0);
  const sessionStorageEmpty = await page.evaluate(() => sessionStorage.length === 0);

  return localStorageEmpty && sessionStorageEmpty;
}

export function generateImageData(width: number = 128, height: number = 128): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL("image/png");
}
