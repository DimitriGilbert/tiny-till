import type { Product } from '@tiny-till/types'
import { validateProductList, checkProductIntegrity } from '@tiny-till/types'
import { useCatalogStore } from '@/stores/catalog-store'
import { useTallyStore } from '@/stores/tally-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useErrorStore } from '@/stores/error-store'
import { showDataIntegrityWarning } from './toast-helpers'

export interface IntegrityIssue {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  entityId?: string
  repairable: boolean
  repairAction?: () => Promise<void>
}

export interface IntegrityReport {
  store: string
  isValid: boolean
  issues: IntegrityIssue[]
  warnings: string[]
}

export interface RepairResult {
  success: boolean
  repairedCount: number
  failedCount: number
  messages: string[]
}

export async function checkCatalogIntegrity(): Promise<IntegrityReport> {
  const issues: IntegrityIssue[] = []
  const warnings: string[] = []
  const products = useCatalogStore.getState().products

  const validation = validateProductList(products, { checkUniqueNames: false })

  if (!validation.isValid) {
    for (const index of validation.invalidIndices) {
      const product = products[index]
      if (!product) continue

      const integrityCheck = checkProductIntegrity(product)

      for (const error of integrityCheck.errors) {
        issues.push({
          id: `catalog-${product.id}-${error.replace(/\s+/g, '-')}`,
          severity: 'high',
          type: 'product_integrity',
          message: error,
          entityId: product.id,
          repairable: false,
        })
      }
    }

    warnings.push(`Found ${validation.invalidIndices.length} products with integrity issues`)
  }

  const duplicates = products.filter(
    (product, index, self) =>
      self.findIndex((p) => p.name.trim().toLowerCase() === product.name.trim().toLowerCase()) !==
      index
  )

  if (duplicates.length > 0) {
    const duplicateNames = [...new Set(duplicates.map((p) => p.name))]
    warnings.push(
      `Found products with duplicate names: ${duplicateNames.join(', ').slice(0, 100)}`
    )

    for (const name of duplicateNames) {
      issues.push({
        id: `duplicate-name-${name.replace(/\s+/g, '-')}`,
        severity: 'low',
        type: 'duplicate_names',
        message: `Multiple products with name "${name}"`,
        repairable: false,
      })
    }
  }

  const anomalousProducts = products.filter((p) => p.price > 100000)
  if (anomalousProducts.length > 0) {
    warnings.push(`Found ${anomalousProducts.length} products with prices above $1000`)
  }

  return {
    store: 'catalog',
    isValid: issues.filter((i) => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues,
    warnings,
  }
}

export async function checkTallyIntegrity(): Promise<IntegrityReport> {
  const issues: IntegrityIssue[] = []
  const warnings: string[] = []
  const { items, getSummary } = useTallyStore.getState()

  const products = useCatalogStore.getState().products
  const productIds = new Set(products.map((p) => p.id))

  let orphanedItems = 0
  for (const [productId, item] of items.entries()) {
    if (!productIds.has(productId)) {
      orphanedItems++
      issues.push({
        id: `tally-orphan-${productId}`,
        severity: 'medium',
        type: 'orphaned_item',
        message: `Tally references non-existent product`,
        entityId: productId,
        repairable: true,
        repairAction: async () => {
          useTallyStore.getState().removeItem(productId)
        },
      })
    }

    if (item.price < 0) {
      issues.push({
        id: `tally-negative-price-${productId}`,
        severity: 'critical',
        type: 'negative_price',
        message: `Item has negative price`,
        entityId: productId,
        repairable: true,
        repairAction: async () => {
          useTallyStore.getState().removeItem(productId)
        },
      })
    }
  }

  if (orphanedItems > 0) {
    warnings.push(`Found ${orphanedItems} orphaned tally items`)
  }

  const summary = getSummary()
  if (summary.total > Number.MAX_SAFE_INTEGER / 2) {
    warnings.push('Tally total is approaching safe number limit')
  }

  if (summary.itemCount > 90000) {
    warnings.push('Tally item count is approaching limit')
  }

  return {
    store: 'tally',
    isValid: issues.filter((i) => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues,
    warnings,
  }
}

export async function checkSettingsIntegrity(): Promise<IntegrityReport> {
  const issues: IntegrityIssue[] = []
  const warnings: string[] = []
  const settings = useSettingsStore.getState()

  if (settings.columnCountOverride && settings.gridDensity === 'compact') {
    if (settings.columnCountOverride < 3) {
      issues.push({
        id: 'settings-column-count-compact',
        severity: 'medium',
        type: 'invalid_column_count',
        message: 'Compact view requires at least 3 columns',
        repairable: true,
        repairAction: async () => {
          useSettingsStore.getState().setColumnCountOverride(3)
        },
      })
    }
  }

  if (settings.backupReminder !== undefined && settings.backupReminder < 0) {
    issues.push({
      id: 'settings-backup-reminder',
      severity: 'low',
      type: 'invalid_backup_reminder',
      message: 'Backup reminder days cannot be negative',
      repairable: true,
      repairAction: async () => {
        useSettingsStore.getState().setBackupReminder(undefined)
      },
    })
  }

  return {
    store: 'settings',
    isValid: issues.filter((i) => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues,
    warnings,
  }
}

export async function checkAllDataIntegrity(): Promise<IntegrityReport[]> {
  const reports: IntegrityReport[] = []

  try {
    reports.push(await checkCatalogIntegrity())
  } catch (error) {
    console.error('[DataIntegrity] Failed to check catalog:', error)
  }

  try {
    reports.push(await checkTallyIntegrity())
  } catch (error) {
    console.error('[DataIntegrity] Failed to check tally:', error)
  }

  try {
    reports.push(await checkSettingsIntegrity())
  } catch (error) {
    console.error('[DataIntegrity] Failed to check settings:', error)
  }

  const totalIssues = reports.reduce((sum, r) => sum + r.issues.length, 0)
  if (totalIssues > 0) {
    showDataIntegrityWarning(totalIssues)
  }

  const criticalIssues = reports.reduce(
    (sum, r) => sum + r.issues.filter((i) => i.severity === 'critical').length,
    0
  )

  if (criticalIssues > 0) {
    useErrorStore.getState().addError({
      type: 'business',
      severity: 'critical',
      message: `Found ${criticalIssues} critical data integrity issues`,
      details: { reports },
      recoverable: true,
    })
  }

  return reports
}

export async function repairDataIntegrity(issues: IntegrityIssue[]): Promise<RepairResult> {
  let repairedCount = 0
  let failedCount = 0
  const messages: string[] = []

  const repairableIssues = issues.filter((i) => i.repairable && i.repairAction)

  for (const issue of repairableIssues) {
    try {
      await issue.repairAction!()
      repairedCount++
      messages.push(`Repaired: ${issue.message}`)
      console.log(`[DataIntegrity] Repaired issue: ${issue.id}`)
    } catch (error) {
      failedCount++
      messages.push(`Failed to repair: ${issue.message}`)
      console.error(`[DataIntegrity] Failed to repair issue: ${issue.id}`, error)
    }
  }

  const success = repairedCount > 0 && failedCount === 0

  if (success) {
    showDataIntegrityWarning(repairedCount)
  }

  return {
    success,
    repairedCount,
    failedCount,
    messages,
  }
}
