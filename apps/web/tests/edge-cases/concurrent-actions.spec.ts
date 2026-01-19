import { test, expect } from '../setup'
import { clearStorage } from '../utils/storage'
import { simulateConcurrentOperations } from '../utils/edge-case-helpers'

test.describe('Concurrent Action Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await page.goto('/')
  })

  test('handles rapid product creation', async ({ page }) => {
    await page.goto('/settings/catalog')

    const operations = Array.from({ length: 10 }, (_, i) => ({
      type: 'add' as const,
      delay: 50 * i,
    }))

    await simulateConcurrentOperations(page, operations)

    await page.waitForTimeout(3000)

    const productItems = page.locator('[data-testid^="product-item-"]')
    const count = await productItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('handles simultaneous add and delete operations', async ({ page }) => {
    await page.evaluate(() => {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: 'delete-1',
            name: 'Product to Delete',
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

    await page.goto('/settings/catalog')

    const operations = [
      { type: 'delete' as const, productId: 'delete-1', delay: 0 },
      { type: 'add' as const, delay: 100 },
      { type: 'add' as const, delay: 200 },
    ]

    await simulateConcurrentOperations(page, operations)

    await page.waitForTimeout(2000)

    const deletedProduct = page.locator('[data-testid="product-item-delete-1"]')
    await expect(deletedProduct).not.toBeVisible()
  })

  test('handles concurrent updates to same product', async ({ page }) => {
    await page.evaluate(() => {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: 'concurrent-1',
            name: 'Original Name',
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

    await page.goto('/settings/catalog')

    const operations = [
      { type: 'update' as const, productId: 'concurrent-1', delay: 0 },
      { type: 'update' as const, productId: 'concurrent-1', delay: 100 },
      { type: 'update' as const, productId: 'concurrent-1', delay: 200 },
    ]

    await simulateConcurrentOperations(page, operations)

    await page.waitForTimeout(2000)

    const productItem = page.locator('[data-testid="product-item-concurrent-1"]')
    await expect(productItem).toBeVisible()

    const productName = page.locator('[data-testid="product-item-concurrent-1"] [data-testid="product-name"]')
    const name = await productName.textContent()
    expect(name).toBeTruthy()
  })

  test('handles theme switching during data operations', async ({ page }) => {
    await page.goto('/settings/catalog')

    const operations = [
      { type: 'add' as const, delay: 0 },
      { type: 'add' as const, delay: 500 },
    ]

    const addOperation = simulateConcurrentOperations(page, operations)

    await page.click('[data-testid="theme-toggle-button"]')

    await addOperation

    await page.waitForTimeout(1000)

    const productItems = page.locator('[data-testid^="product-item-"]')
    const count = await productItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('handles concurrent import and export', async ({ page }) => {
    await page.goto('/settings')

    const operations = [
      {
        type: 'import' as const,
        data: {
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          products: [
            {
              id: crypto.randomUUID(),
              name: 'Imported Product',
              price: 1500,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        },
        delay: 0,
      },
      { type: 'export' as const, delay: 100 },
    ]

    await simulateConcurrentOperations(page, operations)

    await page.waitForTimeout(2000)

    await page.goto('/')

    await expect(page.locator('[data-testid="product-card-Imported Product"]')).toBeVisible()
  })

  test('maintains data integrity under concurrent load', async ({ page }) => {
    await page.goto('/settings/catalog')

    const operations = []

    for (let i = 0; i < 20; i++) {
      operations.push({
        type: 'add' as const,
        delay: i * 50,
      })
    }

    await simulateConcurrentOperations(page, operations)

    await page.waitForTimeout(5000)

    await page.goto('/')

    const productCards = page.locator('[data-testid^="product-card-"]')
    const count = await productCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('handles rapid tally updates', async ({ page }) => {
    await page.evaluate(() => {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: 'tally-1',
            name: 'Tally Product',
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

    await page.reload()

    const productCard = page.locator('[data-testid="product-card-Tally Product"]')

    for (let i = 0; i < 10; i++) {
      await productCard.click()
    }

    const quantityBadge = page.locator('[data-testid="quantity-badge-tally-1"]')
    await expect(quantityBadge).toHaveText('10')

    const totalDisplay = page.locator('[data-testid="tally-total"]')
    const totalText = await totalDisplay.textContent()
    expect(totalText).toContain('10.00')
  })

  test('handles settings changes during active tally', async ({ page }) => {
    await page.evaluate(() => {
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: 'settings-1',
            name: 'Settings Test Product',
            price: 2000,
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

    await page.reload()

    await page.click('[data-testid="product-card-Settings Test Product"]')

    await page.click('[data-testid="settings-button"]')

    const quantityBadge = page.locator('[data-testid="quantity-badge-settings-1"]')
    await expect(quantityBadge).toHaveText('1')
  })
})
