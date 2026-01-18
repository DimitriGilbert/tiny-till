import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  fullscreen?: boolean
}

export function LoadingState({ 
  message = 'Loading...', 
  fullscreen = false
}: LoadingStateProps) {
  const containerClass = fullscreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-12'

  return (
    <div 
      className={containerClass}
      aria-live="polite" 
      aria-busy="true"
    >
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" aria-hidden="true" />
      <p className="text-muted-foreground text-sm">
        {message}
      </p>
    </div>
  )
}
