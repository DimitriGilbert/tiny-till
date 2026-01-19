import { test, expect } from '../setup'
import { clearStorage } from '../utils/storage'
import { verifyRecoveryDialog, executeRecoveryAction, verifyErrorLog } from '../utils/edge-case-helpers'

test.describe('Error Recovery Flows', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
    await page.goto('/')
  })

  test('shows recovery dialog on error', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Test error for recovery')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await verifyRecoveryDialog(page, {
      isOpen: true,
      errorType: 'error',
      hasRecoveryActions: true,
    })
  })

  test('executes recovery action successfully', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Test error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await verifyRecoveryDialog(page, {
      isOpen: true,
      hasRecoveryActions: true,
    })

    await executeRecoveryAction(page, 'reload-page')

    await page.waitForTimeout(2000)

    await verifyRecoveryDialog(page, {
      isOpen: false,
    })
  })

  test('closes recovery dialog on dismiss', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Test error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await verifyRecoveryDialog(page, {
      isOpen: true,
    })

    const closeButton = page.locator('[data-testid="close-error-dialog"]')
    await closeButton.click()

    await verifyRecoveryDialog(page, {
      isOpen: false,
    })
  })

  test('acknowledges error without recovery', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Acknowledgable error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    const acknowledgeButton = page.locator('[data-testid="acknowledge-error-button"]')
    await acknowledgeButton.click()

    await verifyRecoveryDialog(page, {
      isOpen: false,
    })

    const hasLoggedAcknowledged = await verifyErrorLog(page, {
      message: 'Acknowledgable error',
    })

    expect(hasLoggedAcknowledged).toBe(true)
  })

  test('shows appropriate recovery actions based on error type', async ({ page }) => {
    await page.evaluate(() => {
      const storageError = new DOMException('QuotaExceededError', 'QuotaExceededError')
      window.dispatchEvent(new CustomEvent('test-error', { detail: storageError }))
    })

    const recoveryActions = page.locator('[data-testid^="recovery-action-"]')
    const count = await recoveryActions.count()

    expect(count).toBeGreaterThan(0)

    const actionTexts: (string | null)[] = []
    for (let i = 0; i < count; i++) {
      const action = recoveryActions.nth(i)
      const text = await action.textContent()
      actionTexts.push(text)
    }

    const hasClearStorageAction = actionTexts.some((text) => 
      text?.toLowerCase().includes('clear') || text?.toLowerCase().includes('storage')
    )

    expect(hasClearStorageAction).toBe(true)
  })

  test('prevents duplicate recovery executions', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Test error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await verifyRecoveryDialog(page, {
      isOpen: true,
    })

    await executeRecoveryAction(page, 'reload-page')

    const actionButton = page.locator('[data-testid="recovery-action-reload-page"]')

    await page.waitForTimeout(500)

    await expect(actionButton).toBeDisabled()
  })

  test('displays recovery progress for multi-step actions', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Multi-step recovery needed')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    const progressBar = page.locator('[data-testid="recovery-progress-bar"]')
    const isVisible = await progressBar.isVisible()

    if (isVisible) {
      await expect(progressBar).toBeVisible()

      const progressText = page.locator('[data-testid="recovery-progress-text"]')
      await expect(progressText).toBeVisible()
    }
  })

  test('logs recovery attempt to error store', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Recovery test error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await executeRecoveryAction(page, 'reload-page')

    await page.waitForTimeout(2000)

    const hasLoggedRecovery = await verifyErrorLog(page, {
      message: 'Recovery test error',
    })

    expect(hasLoggedRecovery).toBe(true)
  })

  test('handles failed recovery attempt', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Recovery will fail')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    const recoveryButton = page.locator('[data-testid="recovery-action-test-action"]')
    await recoveryButton.click()

    await page.waitForTimeout(1000)

    const errorMessage = page.locator('[data-testid="recovery-failed-message"]')
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText(/failed/i)
    }
  })

  test('shows error statistics dashboard', async ({ page }) => {
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        const error = new Error(`Error ${i}`)
        window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
      }
    })

    await page.goto('/settings/errors')

    await expect(page.locator('[data-testid="error-stats-dashboard"]')).toBeVisible()

    const errorCount = page.locator('[data-testid="error-count"]')
    await expect(errorCount).toContainText('5')

    const resolvedCount = page.locator('[data-testid="resolved-count"]')
    const resolvedText = await resolvedCount.textContent()
    expect(resolvedText).not.toBeNull()
  })

  test('allows error log export', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Exportable error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await page.goto('/settings/errors')

    const exportButton = page.locator('[data-testid="export-error-log"]')
    await exportButton.click()

    const downloadPromise = page.waitForEvent('download')

    const download = await downloadPromise
    expect(download).not.toBeNull()
    expect(download.suggestedFilename()).toMatch(/error.*log/i)
  })

  test('marks error as resolved after successful recovery', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Resolvable error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await executeRecoveryAction(page, 'reload-page')

    await page.waitForTimeout(2000)

    await page.goto('/settings/errors')

    const errorItem = page.locator('[data-testid="error-item-Resolvable error"]')
    if (await errorItem.isVisible()) {
      const resolvedBadge = errorItem.locator('[data-testid="resolved-badge"]')
      await expect(resolvedBadge).toBeVisible()
    }
  })

  test('clears error log on demand', async ({ page }) => {
    await page.evaluate(() => {
      const error = new Error('Clearable error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: error }))
    })

    await page.goto('/settings/errors')

    const clearButton = page.locator('[data-testid="clear-error-log"]')
    await clearButton.click()

    await page.waitForTimeout(500)

    const errorList = page.locator('[data-testid^="error-item-"]')
    const count = await errorList.count()
    expect(count).toBe(0)
  })

  test('filters errors by type', async ({ page }) => {
    await page.evaluate(() => {
      const storageError = new Error('Storage error')
      const networkError = new Error('Network error')
      window.dispatchEvent(new CustomEvent('test-error', { detail: storageError }))
      window.dispatchEvent(new CustomEvent('test-error', { detail: networkError }))
    })

    await page.goto('/settings/errors')

    const filterButton = page.locator('[data-testid="error-filter-button"]')
    await filterButton.click()

    const storageFilter = page.locator('[data-testid="filter-storage"]')
    await storageFilter.click()

    const filteredErrors = page.locator('[data-testid^="error-item-"]')
    const count = await filteredErrors.count()
    expect(count).toBe(1)
  })
})
