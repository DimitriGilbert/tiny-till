import * as React from 'react'

import { cn } from '@/lib/utils'
import { Lock, RefreshCw, RotateCcw } from 'lucide-react'

interface OverrideStatusBadgeProps {
  isOverridden: boolean
  columnCount?: number
  onReset?: () => void
  className?: string
}

export function OverrideStatusBadge({
  isOverridden,
  columnCount,
  onReset,
  className,
}: OverrideStatusBadgeProps) {
  if (!isOverridden) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/30 px-2.5 py-1.5 text-xs',
          className
        )}
      >
        <RefreshCw className="size-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Auto Mode</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs dark:border-amber-900/30 dark:bg-amber-950/20',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Lock className="size-3.5 text-amber-600 dark:text-amber-500" />
        <span className="font-medium text-amber-700 dark:text-amber-400">
          {columnCount} Columns
        </span>
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset to auto"
          className="flex items-center gap-1 rounded-sm bg-amber-100/50 px-2 py-0.5 text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/40"
        >
          <RotateCcw className="size-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  )
}
