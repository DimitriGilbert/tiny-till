import * as React from 'react'
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ImportProgress as ImportProgressType, ImportExecutionResult } from '@tiny-till/types'

export interface ImportProgressModalProps {
  isOpen: boolean
  onClose: () => void
  progress: ImportProgressType
  isComplete: boolean
  result?: ImportExecutionResult
  onCancel?: () => void
  onRetryFailed?: () => void
}

export function ImportProgressModal({
  isOpen,
  onClose,
  progress,
  isComplete,
  result,
  onCancel,
  onRetryFailed,
}: ImportProgressModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              )}
              <div>
                <DialogTitle>
                  {isComplete ? 'Import Complete' : 'Importing...'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {progress.processed} of {progress.total} products processed
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={!isComplete && !onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <Badge variant="outline">{Math.round(percentage)}%</Badge>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Loader2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Processing Speed</p>
                <p className="font-medium">{itemsPerSecond} items/s</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">ETA</span>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Time</p>
                <p className="font-medium">{estimatedTime}</p>
              </div>
            </div>
            {progress.retryAttempts > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">↻</span>
                <div>
                  <p className="text-xs text-muted-foreground">Retry Attempts</p>
                  <p className="font-medium">{progress.retryAttempts}</p>
                </div>
              </div>
            )}
          </div>

          {progress.currentProduct && !isComplete && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span className="text-sm">Currently processing: </span>
              <span className="font-medium">{progress.currentProduct.name}</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            <StatCard
              label="Added"
              value={progress.added}
              color="green"
              bgClass="bg-green-50 dark:bg-green-950/20"
              textClass="text-green-600 dark:text-green-400"
            />
            <StatCard
              label="Updated"
              value={progress.updated}
              color="blue"
              bgClass="bg-blue-50 dark:bg-blue-950/20"
              textClass="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              label="Skipped"
              value={progress.skipped}
              color="gray"
              bgClass="bg-gray-50 dark:bg-gray-950/20"
              textClass="text-gray-600 dark:text-gray-400"
            />
            <StatCard
              label="Failed"
              value={progress.failed}
              color="red"
              bgClass="bg-red-50 dark:bg-red-950/20"
              textClass="text-red-600 dark:text-red-400"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span
              className={cn(
                'text-lg font-bold',
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

          {progress.error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Latest Error</p>
                <p className="text-sm text-destructive/80">{progress.error}</p>
              </div>
            </div>
          )}

          {result && result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Failed Products</p>
              <div className="h-40 overflow-y-auto rounded-md border">
                <div className="p-2 space-y-1">
                  {result.errors.map((error, index) => (
                    <div
                      key={`${error.productId}-${index}`}
                      className="flex items-start justify-between p-2 rounded bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {error.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {error.error}
                        </p>
                      </div>
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result && result.errors.length > 0 && !isComplete && (
            <Button
              variant="outline"
              onClick={onRetryFailed}
              className="w-full"
            >
              Retry Failed Products ({result.errors.length})
            </Button>
          )}
        </div>

        <DialogFooter>
          {!isComplete && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel Import
            </Button>
          )}
          <Button onClick={onClose}>
            {isComplete ? 'Done' : 'Continue in Background'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface StatCardProps {
  label: string
  value: number
  color: string
  bgClass: string
  textClass: string
}

function StatCard({ label, value, color, bgClass, textClass }: StatCardProps) {
  return (
    <div className={cn('flex flex-col items-center p-3 rounded-lg', bgClass)}>
      <span className={cn('text-2xl font-bold', textClass)}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
