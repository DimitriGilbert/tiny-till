import type { Page } from '@playwright/test'

export interface StorageQuotaConfig {
  localStorageLimit: number
  indexedDBLimit: number
  warningThreshold: number
  criticalThreshold: number
}

export interface NetworkCondition {
  offline: boolean
  downloadThroughput?: number
  uploadThroughput?: number
  latency?: number
}

export interface ConcurrentOperation {
  type: 'add' | 'update' | 'delete' | 'import' | 'export'
  productId?: string
  data?: unknown
  delay?: number
}

declare global {
  interface Window {
    __STORAGE_QUOTA_CONFIG__?: StorageQuotaConfig
  }
}

export async function mockStorageQuota(
  page: Page,
  config: Partial<StorageQuotaConfig> = {}
): Promise<void> {
  const quotaConfig: StorageQuotaConfig = {
    localStorageLimit: 5 * 1024 * 1024,
    indexedDBLimit: 50 * 1024 * 1024,
    warningThreshold: 0.8,
    criticalThreshold: 0.95,
    ...config,
  }

  await page.addInitScript((config) => {
    const globalWindow = window as Window
    globalWindow.__STORAGE_QUOTA_CONFIG__ = config

    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string) {
      const currentSize = JSON.stringify(localStorage).length
      const newSize = currentSize + key.length + value.length

      if (newSize > config.localStorageLimit) {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError')
      }

      return originalSetItem.call(this, key, value)
    }
  }, quotaConfig)
}

export async function setNetworkOffline(page: Page, offline: boolean): Promise<void> {
  await page.context().setOffline(offline)
}

export async function simulateConcurrentOperations(
  page: Page,
  operations: ConcurrentOperation[]
): Promise<void> {
  const results = await Promise.allSettled(
    operations.map((op) => executeOperation(page, op))
  )

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    console.warn('[ConcurrentOperations] Some operations failed:', failures)
  }
}

async function executeOperation(page: Page, op: ConcurrentOperation): Promise<void> {
  if (op.delay) {
    await new Promise((resolve) => setTimeout(resolve, op.delay))
  }

  switch (op.type) {
    case 'add':
      await page.click('[data-testid="add-product-button"]')
      await page.fill('[data-testid="product-name-input"]', `Concurrent Product ${Date.now()}`)
      await page.fill('[data-testid="product-price-input"]', '10.00')
      await page.click('[data-testid="save-product-button"]')
      break

    case 'update':
      if (op.productId) {
        await page.click(`[data-testid="product-item-${op.productId}"] [data-testid="edit-button"]`)
        await page.fill('[data-testid="product-name-input"]', `Updated Product ${Date.now()}`)
        await page.click('[data-testid="save-product-button"]')
      }
      break

    case 'delete':
      if (op.productId) {
        await page.click(`[data-testid="product-item-${op.productId}"] [data-testid="delete-button"]`)
        await page.click('[data-testid="confirm-delete-button"]')
      }
      break

    case 'import':
      if (op.data) {
        const fileInput = page.locator('[data-testid="import-file-input"]')
        await fileInput.setInputFiles({
          name: 'import.json',
          mimeType: 'application/json',
          buffer: Buffer.from(JSON.stringify(op.data)),
        })
        await page.click('[data-testid="confirm-import-button"]')
      }
      break

    case 'export':
      await page.click('[data-testid="export-catalog-button"]')
      break
  }
}

export async function triggerStorageError(page: Page, errorType: 'quota' | 'access' | 'read' | 'write'): Promise<void> {
  await page.evaluate((type) => {
    if (type === 'quota') {
      try {
        const largeData = 'x'.repeat(100 * 1024 * 1024)
        localStorage.setItem('test', largeData)
      } catch (error) {
        console.error('Storage quota error triggered')
      }
    } else if (type === 'access') {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('Access denied', 'SecurityError')
        },
      })
    } else if (type === 'read') {
      const originalGetItem = Storage.prototype.getItem
      Storage.prototype.getItem = function (key: string): string | null {
        if (key.startsWith('tiny-till')) {
          throw new DOMException('Read failed', 'DataError')
        }
        return originalGetItem.call(this, key)
      }
    } else if (type === 'write') {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function (key: string, value: string): void {
        if (key.startsWith('tiny-till')) {
          throw new DOMException('Write failed', 'DataError')
        }
        originalSetItem.call(this, key, value)
      }
    }
  }, errorType)
}

export async function waitForErrorToast(page: Page, expectedPattern: RegExp): Promise<void> {
  await page.waitForSelector('[data-testid="toast-message"]', { timeout: 10000 })
  const toast = page.locator('[data-testid="toast-message"]')
  const text = await toast.textContent()
  if (!text || !expectedPattern.test(text)) {
    throw new Error(`Expected toast to match ${expectedPattern}, got: ${text}`)
  }
}

export async function waitForStorageWarning(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="storage-warning-alert"]', { timeout: 10000 })
}

export async function verifyRecoveryDialog(
  page: Page,
  options: {
    isOpen: boolean
    hasRecoveryActions?: boolean
    errorType?: string
  }
): Promise<void> {
  if (options.isOpen) {
    await page.waitForSelector('[data-testid="error-recovery-dialog"]', { timeout: 5000 })
    if (options.hasRecoveryActions) {
      await page.waitForSelector('[data-testid="recovery-action-button"]', { timeout: 5000 })
    }
    if (options.errorType) {
      const title = page.locator('[data-testid="error-dialog-title"]')
      const text = await title.textContent()
      if (!text?.includes(options.errorType)) {
        throw new Error(`Expected error type "${options.errorType}", got: "${text}"`)
      }
    }
  } else {
    await page.waitForSelector('[data-testid="error-recovery-dialog"]', { state: 'hidden', timeout: 5000 })
  }
}

export async function executeRecoveryAction(page: Page, actionId: string): Promise<void> {
  const actionButton = page.locator(`[data-testid="recovery-action-${actionId}"]`)
  await actionButton.click()
  await page.waitForTimeout(1000)
}

export async function verifyErrorLog(
  page: Page,
  expectedError: {
    type?: string
    severity?: string
    message?: string
  }
): Promise<boolean> {
  const logs = await page.evaluate(() => {
    const logs = localStorage.getItem('tiny-till-error-log')
    return logs ? JSON.parse(logs) : []
  })

  return logs.some((log: unknown) => {
    const typedLog = log as { type?: string; severity?: string; message?: string }
    if (expectedError.type && typedLog.type !== expectedError.type) return false
    if (expectedError.severity && typedLog.severity !== expectedError.severity) return false
    if (expectedError.message && !typedLog.message?.includes(expectedError.message)) return false
    return true
  })
}

export async function getStorageUsage(page: Page): Promise<{ localStorage: number; indexedDB: number }> {
  return page.evaluate(() => {
    const localStorageSize = JSON.stringify(localStorage).length

    let indexedDBSize = 0
    const request = indexedDB.open('tiny-till-catalog', 1)

    return new Promise<{ localStorage: number; indexedDB: number }>((resolve) => {
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['products'], 'readonly')
        const store = transaction.objectStore('products')
        const getAllRequest = store.getAll()

        getAllRequest.onsuccess = () => {
          indexedDBSize = JSON.stringify(getAllRequest.result).length
          resolve({ localStorage: localStorageSize, indexedDB: indexedDBSize })
        }

        getAllRequest.onerror = () => {
          resolve({ localStorage: localStorageSize, indexedDB: 0 })
        }
      }

      request.onerror = () => {
        resolve({ localStorage: localStorageSize, indexedDB: 0 })
      }
    })
  })
}

export async function createLargeCatalogFile(productCount: number, imageSizeKB: number = 20): Promise<Buffer> {
  const products = []
  const base64Image = 'x'.repeat(imageSizeKB * 1024)

  for (let i = 0; i < productCount; i++) {
    products.push({
      id: crypto.randomUUID(),
      name: `Product ${i + 1}`,
      price: (i + 1) * 100,
      imageData: `data:image/png;base64,${base64Image}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  return Buffer.from(
    JSON.stringify({
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      products,
    })
  )
}

export async function createCorruptFile(corruptionType: string): Promise<Buffer> {
  let content = ''

  switch (corruptionType) {
    case 'malformed-json':
      content = '{ "version": "1.0.0", "products": [ { "id": "1", "name": "Test", "price": 1000 } '
      break

    case 'truncated':
      content = JSON.stringify({
        version: '1.0.0',
        products: [
          { id: '1', name: 'Test', price: 1000, createdAt: Date.now(), updatedAt: Date.now() },
        ],
      }).slice(0, -50)
      break

    case 'version-mismatch':
      content = JSON.stringify({
        version: '99.99.99',
        exportDate: new Date().toISOString(),
        products: [],
      })
      break

    case 'missing-fields':
      content = JSON.stringify({
        version: '1.0.0',
        products: [{ id: '1', price: 1000 }],
      })
      break

    case 'invalid-types':
      content = JSON.stringify({
        version: '1.0.0',
        products: [
          { id: '1', name: 'Test', price: 'not-a-number', createdAt: Date.now(), updatedAt: Date.now() },
        ],
      })
      break

    case 'unicode':
      content = JSON.stringify({
        version: '1.0.0',
        products: [
          {
            id: '1',
            name: '🎉🎊🎈✨ Test Product 中文 日本語 العربية',
            price: 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
      break

    default:
      content = JSON.stringify({
        version: '1.0.0',
        products: [],
      })
  }

  return Buffer.from(content)
}
