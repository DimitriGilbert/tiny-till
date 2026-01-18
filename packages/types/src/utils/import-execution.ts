import type {
  Product,
  ProductChange,
  ConflictResolution,
  ImportProgress,
  ImportExecutionOptions,
  ImportExecutionResult,
} from '../entities'
import { applyConflictResolution } from './conflict-resolution'

export async function executeImportAtomic(
  existingProducts: Product[],
  changes: ProductChange[],
  options: ImportExecutionOptions
): Promise<ImportExecutionResult> {
  const { conflictResolutions, batchSize = 50, onProgress } = options
  const transactionId = generateTransactionId()

  const progress: ImportProgress = {
    total: changes.length,
    processed: 0,
    added: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  }

  const results: ImportExecutionResult = {
    success: true,
    transactionId,
    added: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  }

  const productMap = new Map(existingProducts.map((p) => [p.id, p]))
  const pendingUpdates: Map<string, Product> = new Map()
  const pendingAdds: Product[] = []

  try {
    for (let i = 0; i < changes.length; i += batchSize) {
      const batch = changes.slice(i, i + batchSize)
      await processBatch(
        batch,
        productMap,
        pendingUpdates,
        pendingAdds,
        conflictResolutions,
        progress,
        results,
        onProgress
      )
    }

    results.success = results.failed === 0
    return results
  } catch (error) {
    results.success = false
    return results
  }
}

async function processBatch(
  batch: ProductChange[],
  productMap: Map<string, Product>,
  pendingUpdates: Map<string, Product>,
  pendingAdds: Product[],
  conflictResolutions: Map<string, ConflictResolution>,
  progress: ImportProgress,
  results: ImportExecutionResult,
  onProgress?: (progress: ImportProgress) => void
): Promise<void> {
  for (const change of batch) {
    progress.processed++
    progress.currentProduct = {
      id: change.productId,
      name: change.newProduct.name,
    }

    try {
      if (change.changeType === 'add') {
        pendingAdds.push(change.newProduct)
        progress.added++
        results.added++
      } else if (change.changeType === 'update' || change.changeType === 'conflict') {
        const resolution = conflictResolutions.get(change.productId)

        if (!resolution || resolution.strategy === 'skip') {
          progress.skipped++
          results.skipped++
        } else {
          const existing = productMap.get(change.productId)!
          const updated = applyResolutionFromStrategy(
            existing,
            change.newProduct,
            resolution
          )
          pendingUpdates.set(change.productId, updated)
          progress.updated++
          results.updated++
        }
      }

      productMap.set(change.productId, change.newProduct)
    } catch (error) {
      progress.failed++
      results.failed++
      results.errors.push({
        productId: change.productId,
        productName: change.newProduct.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      progress.error = error instanceof Error ? error.message : 'Unknown error'
    }

    if (onProgress) {
      onProgress({ ...progress })
    }
  }
}

function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function applyResolutionFromStrategy(
  existing: Product,
  incoming: Product,
  resolution: ConflictResolution
): Product {
  return applyConflictResolution(existing, incoming, resolution)
}
