import * as React from 'react'

import { cn } from '@/lib/utils'
import { Lock, RefreshCw, Monitor, Tablet, Smartphone } from 'lucide-react'

interface ResponsiveColumnIndicatorProps {
  screenWidth: number
  autoColumns: number
  manualColumns?: number
  isOverridden: boolean
  className?: string
}

export function ResponsiveColumnIndicator({
  screenWidth,
  autoColumns,
  manualColumns,
  isOverridden,
  className,
}: ResponsiveColumnIndicatorProps) {
  const breakpoint = getBreakpointLabel(screenWidth)
  const displayColumns = isOverridden && manualColumns !== undefined ? manualColumns : autoColumns

  const deviceIcon = React.useMemo(() => {
    if (screenWidth < 768) {
      return Smartphone
    }
    if (screenWidth < 1024) {
      return Tablet
    }
    return Monitor
  }, [screenWidth])

  const DeviceIcon = deviceIcon

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Screen Size</span>
        <span className="text-xs text-muted-foreground">{screenWidth}px</span>
      </div>

      <div className="flex items-center justify-between rounded-sm border bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <DeviceIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{breakpoint}</span>
        </div>
        <div className="flex items-center gap-2">
          {isOverridden ? (
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-500">
                {displayColumns} cols
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <RefreshCw className="size-3.5 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-500">
                Auto: {displayColumns}
              </span>
            </div>
          )}
        </div>
      </div>

      {!isOverridden && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Auto-calculated</span>
          <span>{autoColumns} columns</span>
        </div>
      )}

      {isOverridden && manualColumns !== undefined && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Override applied</span>
          <span>{manualColumns} of 8 max</span>
        </div>
      )}
    </div>
  )
}

function getBreakpointLabel(width: number): string {
  if (width < 640) return 'Mobile'
  if (width < 768) return 'Large Mobile'
  if (width < 1024) return 'Tablet'
  if (width < 1280) return 'Desktop'
  if (width < 1536) return 'Large Desktop'
  return 'XL Desktop'
}
