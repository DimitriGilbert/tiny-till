import * as React from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
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
