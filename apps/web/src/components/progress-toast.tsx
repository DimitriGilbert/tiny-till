import * as React from 'react'
import { Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ImportProgress as ImportProgressType } from '@tiny-till/types'

export interface ProgressToastProps {
  progress: ImportProgressType
  isComplete: boolean
  onCancel?: () => void
}

export function ProgressToast({ progress, isComplete, onCancel }: ProgressToastProps) {
  const percentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0
  const elapsed = Date.now() - progress.startTime
  const itemsPerSecond = elapsed > 0 ? (progress.processed / (elapsed / 1000)).toFixed(1) : '0.0'
  const estimatedTime = progress.estimatedTimeRemaining
    ? `~${Math.round(progress.estimatedTimeRemaining / 1000)}s remaining`
    : 'Calculating...'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
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

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{estimatedTime}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Loader2 className="h-3 w-3" />
          <span>{itemsPerSecond} items/s</span>
        </div>
        {progress.retryAttempts > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Retries: {progress.retryAttempts}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {progress.added}
          </span>
          <span className="text-[10px] text-muted-foreground">Added</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {progress.updated}
          </span>
          <span className="text-[10px] text-muted-foreground">Updated</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-950/20">
          <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
            {progress.skipped}
          </span>
          <span className="text-[10px] text-muted-foreground">Skipped</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {progress.failed}
          </span>
          <span className="text-[10px] text-muted-foreground">Failed</span>
        </div>
      </div>

      {!isComplete && onCancel && (
        <Button variant="outline" size="sm" onClick={onCancel} className="w-full">
          Cancel Import
        </Button>
      )}

      {progress.error && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-destructive">Error</p>
            <p className="text-xs text-destructive/80">{progress.error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
