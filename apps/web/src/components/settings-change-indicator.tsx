import * as React from 'react'

import { cn } from '@/lib/utils'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OverrideStatusBadge } from '@/components/override-status-badge'

interface SettingsChangeIndicatorProps {
  hasChanges: boolean
  changeCount: number
  onReset?: () => void
  className?: string
}

export function SettingsChangeIndicator({
  hasChanges,
  changeCount,
  onReset,
  className,
}: SettingsChangeIndicatorProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (hasChanges && !isVisible) {
      setIsVisible(true)
    } else if (!hasChanges && isVisible) {
      const timeout = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [hasChanges, isVisible])

  if (!hasChanges) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <OverrideStatusBadge isOverridden={false} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div className="inline-flex items-center gap-1.5 rounded-sm border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs dark:border-amber-900/30 dark:bg-amber-950/20">
        <span className="font-medium text-amber-700 dark:text-amber-400">
          {changeCount} change{changeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {onReset && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-1 text-xs text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset All</span>
        </Button>
      )}
    </div>
  )
}
