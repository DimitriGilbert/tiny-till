import { test, expect } from '../setup'
import { createCorruptFile, waitForErrorToast } from '../utils/edge-case-helpers'
import { clearStorage } from '../utils/storage'

test.describe('Corrupted File Import Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await page.goto('/settings')
  })

  test('rejects malformed JSON file', async ({ page }) => {
    const corruptFile = await createCorruptFile('malformed-json')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'malformed.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/json/i)
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/invalid|malformed/i)
  })

  test('rejects truncated file', async ({ page }) => {
    const corruptFile = await createCorruptFile('truncated')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'truncated.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('handles version mismatch with clear message', async ({ page }) => {
    const corruptFile = await createCorruptFile('version-mismatch')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'version-mismatch.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/version/i)
  })

  test('detects missing required fields', async ({ page }) => {
    const corruptFile = await createCorruptFile('missing-fields')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'missing-fields.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/required|field/i)
  })

  test('detects invalid field types', async ({ page }) => {
    const corruptFile = await createCorruptFile('invalid-types')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'invalid-types.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/type|invalid/i)
  })

  test('handles Unicode characters in product names', async ({ page }) => {
    const corruptFile = await createCorruptFile('unicode')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'unicode.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()

    await page.goto('/')

    const productCard = page.locator('[data-testid="product-card-🎉🎊🎈✨ Test Product 中文 日本語 العربية"]')
    await expect(productCard).toBeVisible()
  })

  test('shows detailed error for corrupt file', async ({ page }) => {
    const corruptFile = await createCorruptFile('malformed-json')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'malformed.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    const errorDetails = page.locator('[data-testid="validation-issue-list"]')
    await expect(errorDetails).toBeVisible()

    const errorItems = errorDetails.locator('[data-testid="validation-issue-item"]')
    const count = await errorItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('prevents import of completely corrupted file', async ({ page }) => {
    const completelyCorrupt = Buffer.from('{this is not valid json at all}')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'completely-corrupt.json',
      mimeType: 'application/json',
      buffer: completelyCorrupt,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()

    await page.goto('/')

    const productCount = await page.locator('[data-testid^="product-card-"]').count()
    expect(productCount).toBe(0)
  })

  test('allows retry after correcting file', async ({ page }) => {
    const corruptFile = await createCorruptFile('malformed-json')

    const fileInput = page.locator('[data-testid="import-file-input"]')
    await fileInput.setInputFiles({
      name: 'malformed.json',
      mimeType: 'application/json',
      buffer: corruptFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()

    const validFile = Buffer.from(
      JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: crypto.randomUUID(),
            name: 'Valid Product',
            price: 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
    )

    await fileInput.setInputFiles({
      name: 'valid.json',
      mimeType: 'application/json',
      buffer: validFile,
    })

    await page.click('[data-testid="confirm-import-button"]')

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })
})
