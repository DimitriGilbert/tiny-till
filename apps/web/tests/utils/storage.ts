import type { Page } from "@playwright/test";

export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function clearIndexedDB(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const knownDatabases = ["tiny-till-catalog"];
    for (const dbName of knownDatabases) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  });
}

export async function getLocalStorage(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

export async function setLocalStorage(page: Page, key: string, value: string): Promise<void> {
  await page.evaluate((args) => localStorage.setItem(args[0], args[1]), [key, value]);
}

export async function removeLocalStorage(page: Page, key: string): Promise<void> {
  await page.evaluate((k) => localStorage.removeItem(k), key);
}

export async function getAllLocalStorage(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const items: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items[key] = localStorage.getItem(key) || "";
      }
    }
    return items;
  });
}

export async function seedCatalog(page: Page, products: unknown[]): Promise<void> {
  await page.evaluate((data) => {
    return new Promise((resolve, reject) => {
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

        transaction.oncomplete = () => resolve(undefined);
        transaction.onerror = () => reject(transaction.error);
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("products")) {
          db.createObjectStore("products", { keyPath: "id" });
        }
      };
    });
  }, products);
}

export async function getCatalogFromIndexedDB(page: Page): Promise<unknown[]> {
  return page.evaluate(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("tiny-till-catalog", 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["products"], "readonly");
        const store = transaction.objectStore("products");
        const getRequest = store.getAll();

        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  });
}

export async function setupTestCatalog(page: Page, products: unknown[]): Promise<void> {
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
