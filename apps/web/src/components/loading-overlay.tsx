import * as React from 'react'
import { Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLoadingStore } from '@/stores/loading-store'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  className?: string
}

export function LoadingOverlay({ className }: LoadingOverlayProps) {
  const { isLoading, activeLoadingKeys, loadings } = useLoadingStore()
  const [visible, setVisible] = React.useState(false)

  const currentLoading = React.useMemo(() => {
    if (activeLoadingKeys.size === 0) return null
    const keys = Array.from(activeLoadingKeys)
    const firstKey = keys[0]
    return Array.from(loadings.values()).find((l) => l.key === firstKey)
  }, [activeLoadingKeys, loadings])

  React.useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (isLoading) {
      timeout = setTimeout(() => setVisible(true), 200)
    } else {
      setVisible(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [isLoading])

  if (!visible || !currentLoading) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg bg-background p-6 shadow-lg border">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <p className="text-center text-sm">
          {currentLoading.message || 'Loading...'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            activeLoadingKeys.forEach((key) => {
              useLoadingStore.getState().clearLoading(key)
            })
          }}
          className="mt-2"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
