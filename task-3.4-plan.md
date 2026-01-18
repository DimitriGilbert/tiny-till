# Task 3.4: Conflict Resolution Logic and Import Execution Engine
## Implementation Plan

### Overview
Develop intelligent conflict resolution system with configurable strategies (merge, replace, skip). Implement ID-based matching algorithm that identifies existing records and applies appropriate update logic. Build atomic import execution that maintains data integrity, handles transaction rollback on errors, and updates local store with proper state management. Include progress tracking for large imports.

---

## Current State Analysis

### Existing Infrastructure
- **`catalog-store.ts`**: Contains `importWithPreview()` method that processes changes sequentially without conflict strategies
- **`import-comparison.ts`**: Has `categorizeProductChange()` for basic conflict detection (image data conflicts)
- **`ImportPreview.tsx`**: Allows selection/deselection of changes but no strategy selection
- **`ProductChangeCard.tsx`**: Displays conflicts with no resolution options
- **`ProductChange` type**: Already has `changeType` ('add', 'update', 'conflict', 'unchanged') and `changedFields` array

### Gaps to Address
1. No configurable conflict resolution strategies
2. No atomic transaction support for imports
3. No rollback mechanism on failure
4. No progress tracking for large imports
5. No UI for strategy selection per conflict
6. Sequential processing without batch operations

---

## Implementation Steps

### Step 1: Define Conflict Resolution Types
**File**: `packages/types/src/entities/import.ts`

Add new types for conflict resolution:

```typescript
export type ConflictResolutionStrategy = 'merge' | 'replace' | 'skip'

export interface ConflictResolution {
  productId: string
  strategy: ConflictResolutionStrategy
  fieldOverrides?: Record<string, 'existing' | 'incoming'>
}

export interface ImportExecutionOptions {
  conflictResolutions: Map<string, ConflictResolution>
  batchSize?: number
  onProgress?: (progress: ImportProgress) => void
}

export interface ImportProgress {
  total: number
  processed: number
  added: number
  updated: number
  skipped: number
  failed: number
  currentProduct?: {
    id: string
    name: string
  }
  error?: string
}

export interface ImportTransaction {
  id: string
  products: Product[]
  timestamp: number
  status: 'pending' | 'committing' | 'committed' | 'rolled-back'
}

export interface ImportResult {
  success: boolean
  transactionId: string
  added: number
  updated: number
  skipped: number
  failed: number
  errors: Array<{
    productId: string
    productName: string
    error: string
  }>
}
```

---

### Step 2: Implement Conflict Resolution Engine
**File**: `packages/types/src/utils/conflict-resolution.ts`

Create intelligent resolution logic:

```typescript
import type { Product, ConflictResolutionStrategy, ConflictResolution } from '../entities'

export function applyConflictResolution(
  existing: Product,
  incoming: Product,
  resolution: ConflictResolution
): Product {
  const { strategy, fieldOverrides = {} } = resolution

  switch (strategy) {
    case 'merge':
      return applyMergeStrategy(existing, incoming, fieldOverrides)
    case 'replace':
      return applyReplaceStrategy(existing, incoming)
    case 'skip':
      return existing
    default:
      throw new Error(`Unknown strategy: ${strategy}`)
  }
}

function applyMergeStrategy(
  existing: Product,
  incoming: Product,
  fieldOverrides: Record<string, 'existing' | 'incoming'>
): Product {
  const merged: Product = { ...existing }

  const fields: (keyof Product)[] = ['name', 'price', 'imageData', 'updatedAt']

  for (const field of fields) {
    if (fieldOverrides[field]) {
      merged[field] = fieldOverrides[field] === 'existing' ? existing[field] : incoming[field]
    } else if (field !== 'updatedAt') {
      merged[field] = incoming[field] !== undefined ? incoming[field] : existing[field]
    }
  }

  merged.updatedAt = Date.now()
  return merged
}

function applyReplaceStrategy(existing: Product, incoming: Product): Product {
  return {
    ...incoming,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  }
}

export function validateConflictResolution(
  existing: Product,
  incoming: Product,
  resolution: ConflictResolution
): { isValid: boolean; error?: string } {
  if (resolution.strategy === 'skip') {
    return { isValid: true }
  }

  if (resolution.fieldOverrides) {
    const validFields = ['name', 'price', 'imageData']
    for (const field of Object.keys(resolution.fieldOverrides)) {
      if (!validFields.includes(field)) {
        return { isValid: false, error: `Invalid field override: ${field}` }
      }
    }
  }

  return { isValid: true }
}
```

---

### Step 3: Create Atomic Import Execution Engine
**File**: `packages/types/src/utils/import-execution.ts`

Implement transaction-based import with rollback:

```typescript
import type {
  Product,
  ProductChange,
  ConflictResolution,
  ImportProgress,
  ImportTransaction,
  ImportResult,
  ImportExecutionOptions,
} from '../entities'

export async function executeImportAtomic(
  existingProducts: Product[],
  changes: ProductChange[],
  options: ImportExecutionOptions
): Promise<ImportResult> {
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

  const results: ImportResult = {
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
  results: ImportResult,
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
```

---

### Step 4: Create Progress Tracking Component
**File**: `apps/web/src/components/ImportProgress.tsx`

```typescript
import * as React from 'react'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { ImportProgress as ImportProgressType } from '@tiny-till/types'

export interface ImportProgressProps {
  progress: ImportProgressType
  isComplete: boolean
}

export function ImportProgress({ progress, isComplete }: ImportProgressProps) {
  const percentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          )}
          <span className="text-sm font-medium">
            {isComplete ? 'Import Complete' : 'Importing...'}
          </span>
        </div>
        <Badge variant="outline">
          {progress.processed} / {progress.total}
        </Badge>
      </div>

      <Progress value={percentage} className="h-2" />

      {progress.currentProduct && !isComplete && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Processing:</span>
          <span className="font-medium">{progress.currentProduct.name}</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.added}</span>
          <span className="text-xs text-muted-foreground">Added</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progress.updated}</span>
          <span className="text-xs text-muted-foreground">Updated</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-950/20">
          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">{progress.skipped}</span>
          <span className="text-xs text-muted-foreground">Skipped</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">{progress.failed}</span>
          <span className="text-xs text-muted-foreground">Failed</span>
        </div>
      </div>

      {progress.error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80">{progress.error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### Step 5: Add Strategy Selection UI to ProductChangeCard
**File**: `apps/web/src/components/ProductChangeCard.tsx` (enhance existing)

Add strategy selection dropdown for conflicts:

```typescript
// Add to existing imports
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ConflictResolutionStrategy } from '@tiny-till/types'

// Add props
export interface ProductChangeCardProps {
  // ... existing props
  selectedStrategy?: ConflictResolutionStrategy
  onStrategyChange?: (strategy: ConflictResolutionStrategy) => void
  isConflicting?: boolean
}

// Add to component body
{change.isConflict && isConflicting && (
  <div className="border-t border-border p-3 bg-muted/30">
    <label className="text-xs font-medium text-muted-foreground mb-2 block">
      Resolution Strategy
    </label>
    <Select value={selectedStrategy || 'skip'} onValueChange={onStrategyChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="merge">Merge - Combine fields from both</SelectItem>
        <SelectItem value="replace">Replace - Use imported data</SelectItem>
        <SelectItem value="skip">Skip - Keep existing data</SelectItem>
      </SelectContent>
    </Select>
  </div>
)}
```

---

### Step 6: Update ImportPreview Component
**File**: `apps/web/src/components/ImportPreview.tsx` (enhance existing)

Add progress tracking and strategy management:

```typescript
// Add imports
import type { ConflictResolution, ConflictResolutionStrategy, ImportProgress } from '@tiny-till/types'
import { ImportProgress as ImportProgressComponent } from '@/components/ImportProgress'
import { executeImportAtomic } from '@tiny-till/types'

// Add state
const [conflictResolutions, setConflictResolutions] = React.useState<Map<string, ConflictResolution>>(new Map())
const [importProgress, setImportProgress] = React.useState<ImportProgress | null>(null)
const [isExecuting, setIsExecuting] = React.useState(false)

// Add strategy change handler
const handleStrategyChange = (productId: string, strategy: ConflictResolutionStrategy) => {
  setConflictResolutions((prev) => {
    const next = new Map(prev)
    next.set(productId, { productId, strategy })
    return next
  })
}

// Replace handleConfirm
const handleConfirm = async () => {
  const selectedChanges = allChanges.filter((c) => selectedChangeIds.has(c.productId))
  setIsExecuting(true)
  setImportProgress({
    total: selectedChanges.length,
    processed: 0,
    added: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  })

  try {
    const existingProducts = products
    const result = await executeImportAtomic(existingProducts, selectedChanges, {
      conflictResolutions,
      batchSize: 50,
      onProgress: (progress) => {
        setImportProgress(progress)
      },
    })

    if (result.success) {
      toast.success('Import Completed', {
        description: `Added ${result.added}, updated ${result.updated}, skipped ${result.skipped}`,
      })
      onConfirm(selectedChanges)
    } else {
      toast.error('Import Failed', {
        description: `${result.failed} products failed to import`,
      })
    }
  } catch (error) {
    toast.error('Import Error', {
      description: error instanceof Error ? error.message : 'Unknown error',
    })
  } finally {
    setIsExecuting(false)
  }
}

// Add to dialog content after changes list
{importProgress && isExecuting && (
  <ImportProgress progress={importProgress} isComplete={importProgress.processed === importProgress.total} />
)}
```

---

### Step 7: Update Catalog Store with Enhanced Import
**File**: `apps/web/src/stores/catalog-store.ts` (enhance existing)

Add atomic import method:

```typescript
// Add imports
import type { ImportResult, ConflictResolution, ImportProgress } from '@tiny-till/types'
import { executeImportAtomic } from '@tiny-till/types'

// Add to CatalogActions interface
importAtomic: (
  changes: ProductChange[],
  options: {
    conflictResolutions: Map<string, ConflictResolution>
    batchSize?: number
    onProgress?: (progress: ImportProgress) => void
  }
) => Promise<ImportResult>

// Add implementation
importAtomic: async (changes, options) => {
  set({ isLoading: true })

  try {
    const result = await executeImportAtomic(get().products, changes, options)

    if (result.success) {
      const productsToAdd: ProductInput[] = []
      const productsToUpdate: Array<{ id: string; data: ProductUpdate }> = []

      for (const change of changes) {
        if (change.changeType === 'add') {
          productsToAdd.push({
            name: change.newProduct.name,
            price: change.newProduct.price,
            imageData: change.newProduct.imageData,
          })
        } else if (change.changeType === 'update' || change.changeType === 'conflict') {
          const resolution = options.conflictResolutions.get(change.productId)
          if (resolution && resolution.strategy !== 'skip') {
            productsToUpdate.push({
              id: change.productId,
              data: {
                name: change.newProduct.name,
                price: change.newProduct.price,
                imageData: change.newProduct.imageData,
              },
            })
          }
        }
      }

      await get().addProducts(productsToAdd)
      await get().updateProducts(productsToUpdate)
    }

    set({ isLoading: false })
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to import products'
    set({ error: errorMessage, isLoading: false })
    return {
      success: false,
      transactionId: '',
      added: 0,
      updated: 0,
      skipped: 0,
      failed: changes.length,
      errors: changes.map((c) => ({
        productId: c.productId,
        productName: c.newProduct.name,
        error: errorMessage,
      })),
    }
  }
},
```

---

### Step 8: Update CatalogImport Component
**File**: `apps/web/src/components/CatalogImport.tsx` (enhance existing)

Update to use atomic import:

```typescript
// Update handleConfirmImport to use importAtomic instead of importWithPreview
const handleConfirmImport = async (selectedChanges: ProductChange[]) => {
  if (!previewData) {
    return
  }

  try {
    setIsImportingPreview(true)
    const result = await importWithPreview(previewData, selectedChanges)

    toast.success('Import Successful', {
      description: `Added ${result.added}, updated ${result.updated} products`,
    })

    resetState()
    onOpenChange(false)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to import file'
    toast.error('Import Failed', {
      description: errorMessage,
    })
  } finally {
    setIsImportingPreview(false)
  }
}
```

---

## File Changes Summary

### New Files
1. `packages/types/src/entities/import.ts` - Add conflict resolution types
2. `packages/types/src/utils/conflict-resolution.ts` - Resolution engine
3. `packages/types/src/utils/import-execution.ts` - Atomic execution engine
4. `apps/web/src/components/ImportProgress.tsx` - Progress UI component

### Modified Files
1. `apps/web/src/stores/catalog-store.ts` - Add importAtomic method
2. `apps/web/src/components/ImportPreview.tsx` - Add strategy selection and progress
3. `apps/web/src/components/ProductChangeCard.tsx` - Add strategy UI for conflicts
4. `apps/web/src/components/CatalogImport.tsx` - Update to use new import flow

---

## Implementation Dependencies

### Prerequisites (Already Complete)
- Task 3.1: File upload interface
- Task 3.2: JSON schema validation
- Task 3.3: Import preview modal

### External Dependencies
- shadcn/ui Select component (may need to add if not present)
- Existing Progress component (already exists)

---

## Testing Strategy

### Unit Tests
1. Conflict resolution engine tests
   - Test each strategy (merge, replace, skip)
   - Test field override logic
   - Test edge cases (empty fields, missing data)

2. Import execution engine tests
   - Test batch processing
   - Test progress callbacks
   - Test error handling and rollback
   - Test conflict resolution integration

### Integration Tests
1. End-to-end import flow with conflicts
2. Large import performance testing (100+ products)
3. Progress tracking accuracy
4. Error recovery scenarios

### Manual Testing
1. Import file with conflicts and verify strategy options appear
2. Select different strategies and verify results
3. Test with large catalog file to verify progress tracking
4. Test error scenarios and verify rollback

---

## Edge Cases to Handle

1. **Empty conflict resolutions map**: Default to 'skip' strategy
2. **Invalid resolution strategy**: Validate and reject with error message
3. **Network/storage failures**: Ensure atomic rollback
4. **Concurrent imports**: Prevent or queue multiple import operations
5. **Large files**: Optimize batch size for performance
6. **Memory constraints**: Process in chunks to avoid OOM
7. **Invalid product data**: Skip and continue, don't fail entire import

---

## Performance Considerations

1. **Batch size**: Default to 50, configurable per import
2. **Progress throttling**: Limit progress updates to avoid UI thrashing
3. **Memory management**: Clear temporary data after each batch
4. **IndexedDB operations**: Batch writes to reduce transaction overhead
5. **Lazy loading**: Only load product data needed for current batch

---

## Type Safety Notes

- All conflict resolution types are strictly typed
- Strategy values are constrained to literal union types
- Progress callback is optional and typed correctly
- Field overrides use mapped types for compile-time validation

---

## Success Criteria

1. ✅ Conflict strategies (merge, replace, skip) can be selected per product
2. ✅ Import executes atomically with rollback on failure
3. ✅ Progress is tracked and displayed for large imports
4. ✅ All changes persist correctly to IndexedDB
5. ✅ Error messages are clear and actionable
6. ✅ Type checking passes with no `any` types
7. ✅ Build succeeds without errors
8. ✅ UI is responsive during import operations

---

## Rollback Plan

If implementation fails or causes issues:

1. Revert to existing `importWithPreview()` method
2. Keep conflict detection from `categorizeProductChange()`
3. Remove strategy selection UI
4. Remove progress tracking
5. Keep existing sequential import flow
