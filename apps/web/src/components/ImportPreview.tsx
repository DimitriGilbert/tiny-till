import * as React from 'react'
import { Search, CheckSquare, Square, AlertCircle, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ImportChangeSummary } from '@/components/ImportChangeSummary'
import { ImportConflictBanner } from '@/components/ImportConflictBanner'
import { ProductChangeCard } from '@/components/ProductChangeCard'
import { ImportProgress } from '@/components/ImportProgress'
import { hasChanges, isSafeToImport, generateChangeSummary } from '@tiny-till/types'
import type {
  ImportPreviewData,
  ProductChange,
  ProductChangeType,
  ConflictResolution,
  ConflictResolutionStrategy,
  ImportProgress as ImportProgressType,
} from '@tiny-till/types'

export interface ImportPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previewData: ImportPreviewData | null
  onConfirm: (
    selectedChanges: ProductChange[],
    conflictResolutions: Map<string, ConflictResolution>,
    onProgress: (progress: ImportProgressType) => void
  ) => Promise<unknown>
  onCancel: () => void
  isLoading?: boolean
}

export function ImportPreview({
  open,
  onOpenChange,
  previewData,
  onConfirm,
  onCancel,
  isLoading = false,
}: ImportPreviewProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterType, setFilterType] = React.useState<ProductChangeType | 'all'>('all')
  const [selectedChangeIds, setSelectedChangeIds] = React.useState<Set<string>>(new Set())
  const [expandedCardIds, setExpandedCardIds] = React.useState<Set<string>>(new Set())
  const [conflictResolutions, setConflictResolutions] = React.useState<Map<string, ConflictResolution>>(new Map())
  const [importProgress, setImportProgress] = React.useState<ImportProgressType | null>(null)
  const [isExecuting, setIsExecuting] = React.useState(false)

  const allChanges = previewData?.allChanges || []
  const analysis = previewData?.analysis

  const filteredChanges = React.useMemo(() => {
    let filtered = allChanges

    if (filterType !== 'all') {
      filtered = filtered.filter((c) => c.changeType === filterType)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.newProduct.name.toLowerCase().includes(query) ||
          c.productId.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [allChanges, filterType, searchQuery])

  const toggleCardExpansion = (changeId: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(changeId)) {
        next.delete(changeId)
      } else {
        next.add(changeId)
      }
      return next
    })
  }

  const toggleChangeSelection = (changeId: string, selected: boolean) => {
    setSelectedChangeIds((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(changeId)
      } else {
        next.delete(changeId)
      }
      return next
    })
  }

  const toggleAllChanges = (select: boolean) => {
    if (select) {
      setSelectedChangeIds(new Set(filteredChanges.map((c) => c.productId)))
    } else {
      setSelectedChangeIds(new Set())
    }
  }

  const handleStrategyChange = (productId: string, strategy: ConflictResolutionStrategy) => {
    setConflictResolutions((prev) => {
      const next = new Map(prev)
      next.set(productId, { productId, strategy })
      return next
    })
  }

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
      startTime: Date.now(),
      retryAttempts: 0,
      currentBatch: 1,
      totalBatches: Math.ceil(selectedChanges.length / 50),
    })

    try {
      await onConfirm(
        selectedChanges,
        conflictResolutions,
        (progress) => {
          setImportProgress(progress)
        }
      )
      setIsExecuting(false)
    } catch (error) {
      setIsExecuting(false)
      setImportProgress((prev) => {
        if (!prev) return null
        return {
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          failed: prev.failed + 1,
        }
      })
      throw error
    }
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  React.useEffect(() => {
    if (open && previewData) {
      setSelectedChangeIds(new Set(allChanges.map((c) => c.productId)))
      setExpandedCardIds(new Set())
      setSearchQuery('')
      setFilterType('all')
      setConflictResolutions(new Map())
      setImportProgress(null)
      setIsExecuting(false)
    }
  }, [open, previewData, allChanges])

  if (!previewData) {
    return null
  }

  const summary = analysis ? generateChangeSummary(analysis) : null
  const hasAnyChanges = analysis && hasChanges(analysis)
  const isSafe = analysis && isSafeToImport(analysis)
  const selectedCount = selectedChangeIds.size
  const allSelected = filteredChanges.length > 0 && selectedChangeIds.size === filteredChanges.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Preview</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto -mx-6 px-6">
          <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{previewData.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(previewData.file.size / 1024).toFixed(1)} KB • {analysis?.totalProducts || 0} products
                  </p>
                </div>
                <Badge variant="secondary">{previewData.importData.meta.version}</Badge>
              </div>

            {analysis && <ImportChangeSummary analysis={analysis} />}

            {analysis?.productsInConflict && analysis.productsInConflict.length > 0 && (
              <ImportConflictBanner
                conflicts={analysis.productsInConflict}
                onResolve={(conflictId) => toggleCardExpansion(conflictId)}
              />
            )}

            {!hasAnyChanges ? (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    No Changes Detected
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    All products in this file are identical to your existing catalog.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(['all', 'add', 'update', 'conflict', 'unchanged'] as const).map((type) => {
                    const count =
                      type === 'all'
                        ? allChanges.length
                        : allChanges.filter((c) => c.changeType === type).length

                    if (count === 0 && type !== 'all') return null

                    return (
                      <Button
                        key={type}
                        variant={filterType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType(type)}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                      </Button>
                    )
                  })}
                </div>
              </div>

              {filteredChanges.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAllChanges(!allSelected)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {allSelected ? (
                      <>
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4 mr-1" />
                        Select All
                      </>
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {selectedCount} of {filteredChanges.length} selected
                  </span>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {filteredChanges.map((change) => (
                  <ProductChangeCard
                    key={change.productId}
                    change={change}
                    expanded={expandedCardIds.has(change.productId)}
                    onToggleExpand={() => toggleCardExpansion(change.productId)}
                    selected={selectedChangeIds.has(change.productId)}
                    onSelectChange={(selected) => toggleChangeSelection(change.productId, selected)}
                    selectedStrategy={conflictResolutions.get(change.productId)?.strategy}
                    onStrategyChange={(strategy) => handleStrategyChange(change.productId, strategy)}
                    isConflicting={change.changeType === 'conflict'}
                  />
                ))}

                {filteredChanges.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No changes match your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {importProgress && isExecuting && (
          <div className="border-t border-border pt-4">
            <ImportProgress progress={importProgress} isComplete={importProgress.processed === importProgress.total} />
          </div>
        )}

        <DialogFooter className="flex-shrink-0 pt-4 gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading || isExecuting}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isExecuting || !isSafe || selectedCount === 0}
          >
            {isLoading || isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
