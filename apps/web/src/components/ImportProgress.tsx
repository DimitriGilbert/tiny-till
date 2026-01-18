import * as React from 'react'
import { Loader2, CheckCircle, XCircle, Clock, Pause, Play } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ImportProgress as ImportProgressType } from '@tiny-till/types'

export interface ImportProgressProps {
  progress: ImportProgressType
  isComplete: boolean
  isPaused?: boolean
  onPause?: () => void
  onResume?: () => void
}

export function ImportProgress({
  progress,
  isComplete,
  isPaused = false,
  onPause,
  onResume,
}: ImportProgressProps) {
  const percentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0
  const elapsed = Date.now() - progress.startTime
  const itemsPerSecond = elapsed > 0 ? (progress.processed / (elapsed / 1000)).toFixed(1) : '0.0'
  const estimatedTime = progress.estimatedTimeRemaining
    ? `~${Math.round(progress.estimatedTimeRemaining / 1000)}s remaining`
    : 'Calculating...'

  const successRate =
    progress.processed > 0
      ? ((progress.added + progress.updated) / progress.processed) * 100
      : 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : isPaused ? (
            <Pause className="h-5 w-5 text-yellow-600" />
          ) : (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          )}
          <span className="text-sm font-medium">
            {isComplete ? 'Import Complete' : isPaused ? 'Paused' : 'Importing...'}
          </span>
        </div>
        <Badge variant="outline">
          {progress.processed} / {progress.total}
        </Badge>
      </div>

      <Progress value={percentage} className="h-2" />

      {progress.currentProduct && !isComplete && !isPaused && (
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

      <div className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
        <span className="text-muted-foreground">Success Rate</span>
        <span
          className={cn(
            'font-bold',
            successRate >= 90
              ? 'text-green-600 dark:text-green-400'
              : successRate >= 70
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
          )}
        >
          {successRate.toFixed(1)}%
        </span>
      </div>

      {progress.currentBatch && progress.totalBatches && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Batch {progress.currentBatch} of {progress.totalBatches}</span>
        </div>
      )}

      {!isComplete && (onPause || onResume) && (
        <Button
          variant="outline"
          size="sm"
          onClick={isPaused ? onResume : onPause}
          className="w-full"
        >
          {isPaused ? (
            <>
              <Play className="h-4 w-4 mr-1" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </>
          )}
        </Button>
      )}

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
