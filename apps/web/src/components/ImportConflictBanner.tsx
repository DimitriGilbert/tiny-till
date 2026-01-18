import * as React from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProductChange } from '@tiny-till/types'

export interface ImportConflictBannerProps {
  conflicts: ProductChange[]
  onResolve?: (conflictId: string) => void
}

export function ImportConflictBanner({ conflicts, onResolve }: ImportConflictBannerProps) {
  if (conflicts.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Found
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Some products have conflicting data that needs resolution before importing.
              </p>
            </div>
            <Badge variant="destructive" className="flex-shrink-0">
              Attention Required
            </Badge>
          </div>

          <div className="space-y-2 mt-3">
            {conflicts.slice(0, 3).map((conflict) => (
              <div
                key={conflict.productId}
                className="flex items-center justify-between gap-3 p-2 rounded-md bg-white/50 dark:bg-black/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 truncate">
                    {conflict.newProduct.name}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {conflict.changedFields?.join(', ') || 'Data conflict'}
                  </p>
                </div>
                {onResolve && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 h-7 text-xs"
                    onClick={() => onResolve(conflict.productId)}
                  >
                    Review
                  </Button>
                )}
              </div>
            ))}

            {conflicts.length > 3 && (
              <p className="text-xs text-red-700 dark:text-red-300 pt-1">
                And {conflicts.length - 3} more conflict{conflicts.length - 3 > 1 ? 's' : ''}...
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 pt-2 border-t border-red-200 dark:border-red-800/50 mt-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300">
              Review each conflict below to choose which version to keep or merge the changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
