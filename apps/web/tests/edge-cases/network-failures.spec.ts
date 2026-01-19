import { test, expect } from '../setup'
import { clearStorage } from '../utils/storage'
import { setNetworkOffline } from '../utils/edge-case-helpers'

test.describe('Network Failure Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await page.goto('/')
  })

  test('shows offline banner when offline', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.waitForSelector('[data-testid="offline-banner"]', { timeout: 5000 })
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible()
    await expect(page.locator('[data-testid="offline-banner"]')).toContainText(/offline|no connection/i)
  })

  test('hides offline banner when back online', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.waitForSelector('[data-testid="offline-banner"]', { timeout: 5000 })

    await setNetworkOffline(page, false)

    await expect(page.locator('[data-testid="offline-banner"]')).not.toBeVisible()
  })

  test('allows product management while offline', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.click('[data-testid="settings-button"]')
    await page.click('[data-testid="add-product-button"]')

    await page.fill('[data-testid="product-name-input"]', 'Offline Product')
    await page.fill('[data-testid="product-price-input"]', '10.00')
    await page.click('[data-testid="save-product-button"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('allows tally operations while offline', async ({ page }) => {
    await page.evaluate(() => {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: '1',
            name: 'Test Product',
            price: 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      }
      return new Promise<void>((resolve) => {
        const request = indexedDB.open('tiny-till-catalog', 1)
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(['products'], 'readwrite')
          const store = transaction.objectStore('products')
          data.products.forEach((p) => store.put(p))
          transaction.oncomplete = () => resolve()
        }
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('products')) {
            const store = db.createObjectStore('products', { keyPath: 'id' })
            store.createIndex('name', 'name', { unique: true })
          }
        }
      })
    })

    await setNetworkOffline(page, true)

    await page.click('[data-testid="product-card-Test Product"]')

    const quantityBadge = page.locator('[data-testid="quantity-badge-1"]')
    await expect(quantityBadge).toBeVisible()
    await expect(quantityBadge).toHaveText('1')
  })

  test('handles export while offline', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.goto('/settings')

    const exportPromise = page.waitForEvent('download')

    await page.click('[data-testid="export-catalog-button"]')

    const download = await exportPromise
    expect(download).not.toBeNull()
    expect(download.suggestedFilename()).toMatch(/tiny-till-catalog-.*\.json/)
  })

  test('prevents operations that require network when offline', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.goto('/settings')

    await page.click('[data-testid="check-for-updates-button"]')

    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="offline-message"]')).toContainText(/offline/i)
  })

  test('persists data across offline-online transition', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.click('[data-testid="settings-button"]')
    await page.click('[data-testid="add-product-button"]')
    await page.fill('[data-testid="product-name-input"]', 'Persistent Product')
    await page.fill('[data-testid="product-price-input"]', '15.00')
    await page.click('[data-testid="save-product-button"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()

    await setNetworkOffline(page, false)

    await page.goto('/')

    await expect(page.locator('[data-testid="product-card-Persistent Product"]')).toBeVisible()
  })

  test('handles connection loss during import', async ({ page }) => {
    await page.goto('/settings')

    await setNetworkOffline(page, true)

    const validFile = Buffer.from(
      JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: crypto.randomUUID(),
            name: 'Import During Offline',
            price: 2000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
    )

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'import.json',
      mimeType: 'application/json',
      buffer: validFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()

    await setNetworkOffline(page, false)

    await page.goto('/')

    await expect(page.locator('[data-testid="product-card-Import During Offline"]')).toBeVisible()
  })

  test('shows loading state during network reconnection', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.waitForSelector('[data-testid="offline-banner"]', { timeout: 5000 })

    const reconnectButton = page.locator('[data-testid="reconnect-button"]')
    if (await reconnectButton.isVisible()) {
      await reconnectButton.click()

      await expect(page.locator('[data-testid="loading-state"]')).toBeVisible()

      await setNetworkOffline(page, false)

      await expect(page.locator('[data-testid="loading-state"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="offline-banner"]')).not.toBeVisible()
    }
  })

  test('stores offline actions for sync when online', async ({ page }) => {
    await setNetworkOffline(page, true)

    await page.goto('/settings/catalog')

    const initialCount = await page.locator('[data-testid^="product-item-"]').count()

    await page.click('[data-testid="add-product-button"]')
    await page.fill('[data-testid="product-name-input"]', 'Product to Sync')
    await page.fill('[data-testid="product-price-input"]', '8.50')
    await page.click('[data-testid="save-product-button"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()

    await setNetworkOffline(page, false)

    await page.reload()

    const newCount = await page.locator('[data-testid^="product-item-"]').count()
    expect(newCount).toBe(initialCount + 1)
  })
})
