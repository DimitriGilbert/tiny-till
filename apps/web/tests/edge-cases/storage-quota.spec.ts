import { test, expect } from '../setup'
import type { Page } from '@playwright/test'
import {
  mockStorageQuota,
  waitForStorageWarning,
  triggerStorageError,
  getStorageUsage,
  verifyErrorLog,
  createLargeCatalogFile,
} from '../utils/edge-case-helpers'
import { clearStorage } from '../utils/storage'
import { createMultipleProducts } from '../factories/product-factory'

test.describe('Storage Quota Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await page.goto('/')
  })

  test('detects warning when approaching quota limit', async ({ page }) => {
    await mockStorageQuota(page, {
      localStorageLimit: 1024 * 1024,
      warningThreshold: 0.8,
    })

    await setupTestCatalog(page, createMultipleProducts(20))

    await page.goto('/settings')

    await waitForStorageWarning(page)

    const warningAlert = page.locator('[data-testid="storage-warning-alert"]')
    await expect(warningAlert).toContainText(/warning/i)
    await expect(warningAlert).toContainText(/80%/i)
  })

  test('shows critical warning at quota limit', async ({ page }) => {
    await mockStorageQuota(page, {
      localStorageLimit: 1024 * 1024,
      criticalThreshold: 0.95,
    })

    await setupTestCatalog(page, createMultipleProducts(50))

    await page.goto('/settings')

    await waitForStorageWarning(page)

    const warningAlert = page.locator('[data-testid="storage-warning-alert"]')
    await expect(warningAlert).toContainText(/critical/i)
    await expect(warningAlert).toContainText(/95%/i)
  })

  test('prevents adding product when quota exceeded', async ({ page }) => {
    await mockStorageQuota(page, {
      localStorageLimit: 1024,
    })

    await page.click('[data-testid="settings-button"]')
    await page.click('[data-testid="add-product-button"]')

    await page.fill('[data-testid="product-name-input"]', 'Test Product')
    await page.fill('[data-testid="product-price-input"]', '10.00')

    await page.click('[data-testid="save-product-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/quota|storage/i)
  })

  test('handles quota exceeded during import', async ({ page }) => {
    await mockStorageQuota(page, {
      localStorageLimit: 10 * 1024,
    })

    await page.goto('/settings')

    const largeCatalog = await createLargeCatalogFile(100, 50)

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'large-catalog.json',
      mimeType: 'application/json',
      buffer: largeCatalog,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/quota|storage/i)
  })

  test('recovers from quota error by clearing old products', async ({ page }) => {
    await mockStorageQuota(page, {
      localStorageLimit: 1024,
    })

    await setupTestCatalog(page, createMultipleProducts(20))

    await page.goto('/settings/catalog')

    const productCountBefore = await page.locator('[data-testid^="product-item-"]').count()

    await page.click('[data-testid="product-item-1"] [data-testid="delete-button"]')
    await page.click('[data-testid="confirm-delete-button"]')

    await page.click('[data-testid="add-product-button"]')
    await page.fill('[data-testid="product-name-input"]', 'New Product After Cleanup')
    await page.fill('[data-testid="product-price-input"]', '5.00')
    await page.click('[data-testid="save-product-button"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('logs quota errors correctly', async ({ page }) => {
    await page.goto('/settings')

    await triggerStorageError(page, 'quota')

    const hasLoggedError = await verifyErrorLog(page, {
      type: 'storage',
      message: 'quota',
    })

    expect(hasLoggedError).toBe(true)
  })

  test('provides accurate storage usage information', async ({ page }) => {
    await setupTestCatalog(page, createMultipleProducts(10))

    const usage = await getStorageUsage(page)

    expect(usage.localStorage).toBeGreaterThan(0)
    expect(usage.indexedDB).toBeGreaterThan(0)
  })

  test('dismisses warning and prevents re-show', async ({ page }) => {
    await mockStorageQuota(page, {
      localStorageLimit: 1024 * 1024,
      warningThreshold: 0.8,
    })

    await setupTestCatalog(page, createMultipleProducts(20))

    await page.goto('/settings')

    await waitForStorageWarning(page)

    await page.click('[data-testid="dismiss-warning-button"]')

    await expect(page.locator('[data-testid="storage-warning-alert"]')).not.toBeVisible()

    await page.reload()

    await page.waitForTimeout(2000)

    await expect(page.locator('[data-testid="storage-warning-alert"]')).not.toBeVisible()
  })

  test('handles mixed storage exhaustion', async ({ page }) => {
    await mockStorageQuota(page, {
      localStorageLimit: 1024,
      indexedDBLimit: 10 * 1024,
    })

    await page.goto('/settings/catalog')

    await page.click('[data-testid="add-product-button"]')

    await page.fill('[data-testid="product-name-input"]', 'Product 1')
    await page.fill('[data-testid="product-price-input"]', '10.00')

    const imageData = 'x'.repeat(15 * 1024)
    await page.evaluate((data) => {
      const input = document.querySelector('[data-testid="product-image-input"]') as HTMLInputElement
      if (input) {
        const file = new File([data], 'test.png', { type: 'image/png' })
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
      }
    }, Buffer.from(imageData))

    await page.click('[data-testid="save-product-button"]')

    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText(/quota|storage/i)
  })
})

async function setupTestCatalog(page: Page, products: unknown[]): Promise<void> {
  await page.evaluate((data: unknown[]) => {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open('tiny-till-catalog', 1)

      request.onerror = () => {
        console.error('Failed to open IndexedDB')
        resolve()
      }

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['products'], 'readwrite')
        const store = transaction.objectStore('products')

        store.clear()

        data.forEach((product: unknown) => {
          store.put(product)
        })

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => {
          console.error('Failed to store products')
          resolve()
        }
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' })
          store.createIndex('name', 'name', { unique: true })
        }
      }
    })
  }, products)
}
