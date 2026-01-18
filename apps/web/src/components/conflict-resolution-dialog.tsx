import * as React from 'react'
import { ArrowLeftRight, SkipForward, AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ProductChange, ConflictResolutionStrategy } from '@tiny-till/types'

export interface ConflictResolutionDialogProps {
  isOpen: boolean
  onClose: () => void
  conflicts: ProductChange[]
  onResolve: (resolutions: Map<string, ConflictResolutionStrategy>) => void
  onBatchResolve?: (strategy: ConflictResolutionStrategy) => void
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  conflicts,
  onResolve,
  onBatchResolve,
}: ConflictResolutionDialogProps) {
  const [resolutions, setResolutions] = React.useState<
    Map<string, ConflictResolutionStrategy>
  >(new Map())
  const [selectedForBatch, setSelectedForBatch] = React.useState<Set<string>>(
    new Set()
  )

  const handleStrategyChange = (
    productId: string,
    strategy: ConflictResolutionStrategy
  ) => {
    setResolutions((prev) => {
      const newMap = new Map(prev)
      newMap.set(productId, strategy)
      return newMap
    })
  }

  const handleSelectForBatch = (productId: string) => {
    setSelectedForBatch((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleBatchResolve = (strategy: ConflictResolutionStrategy) => {
    if (!onBatchResolve) return

    const newResolutions = new Map(resolutions)
    selectedForBatch.forEach((productId) => {
      newResolutions.set(productId, strategy)
    })
    setResolutions(newResolutions)
    onBatchResolve(strategy)
    setSelectedForBatch(new Set())
  }

  const handleResolve = () => {
    onResolve(resolutions)
  }

  const allResolved = conflicts.every(
    (conflict) => resolutions.has(conflict.productId)
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resolve Import Conflicts</DialogTitle>
          <DialogDescription>
            {conflicts.length} product{conflicts.length !== 1 ? 's' : ''}{' '}
            have conflicts. Choose how to resolve each conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedForBatch.size > 0 && onBatchResolve && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-sm">
                {selectedForBatch.size} product{selectedForBatch.size !== 1 ? 's' : ''}{' '}
                selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchResolve('merge')}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Merge All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchResolve('replace')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Replace All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchResolve('skip')}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip All
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <ConflictCard
                key={conflict.productId}
                conflict={conflict}
                strategy={resolutions.get(conflict.productId)}
                onStrategyChange={handleStrategyChange}
                onSelectForBatch={handleSelectForBatch}
                isSelectedForBatch={selectedForBatch.has(conflict.productId)}
                showBatchSelect={!!onBatchResolve}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={!allResolved}>
            Apply Resolutions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConflictCardProps {
  conflict: ProductChange
  strategy?: ConflictResolutionStrategy
  onStrategyChange: (productId: string, strategy: ConflictResolutionStrategy) => void
  onSelectForBatch: (productId: string) => void
  isSelectedForBatch: boolean
  showBatchSelect: boolean
}

function ConflictCard({
  conflict,
  strategy,
  onStrategyChange,
  onSelectForBatch,
  isSelectedForBatch,
  showBatchSelect,
}: ConflictCardProps) {
  const strategies: ConflictResolutionStrategy[] = ['merge', 'replace', 'skip']

  return (
    <div
      className={cn(
        'border rounded-lg p-4 space-y-3',
        isSelectedForBatch && 'bg-muted/50 border-primary'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {showBatchSelect && (
            <Checkbox
              id={`select-${conflict.productId}`}
              checked={isSelectedForBatch}
              onCheckedChange={() => onSelectForBatch(conflict.productId)}
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{conflict.newProduct.name}</h4>
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Conflict
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {conflict.existingProduct?.name}
            </p>
          </div>
        </div>
      </div>

      {conflict.changedFields && conflict.changedFields.length > 0 && (
        <div className="pl-7">
          <p className="text-xs text-muted-foreground mb-2">Changed fields:</p>
          <div className="flex flex-wrap gap-1">
            {conflict.changedFields.map((field) => (
              <Badge key={field} variant="outline" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pl-7">
        {strategies.map((strat) => (
          <Button
            key={strat}
            variant={strategy === strat ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStrategyChange(conflict.productId, strat)}
          >
            {strat === 'merge' && <ArrowLeftRight className="h-4 w-4 mr-1" />}
            {strat === 'replace' && <CheckCircle2 className="h-4 w-4 mr-1" />}
            {strat === 'skip' && <SkipForward className="h-4 w-4 mr-1" />}
            {strat.charAt(0).toUpperCase() + strat.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  )
}
