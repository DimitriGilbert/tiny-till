import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  role?: 'status' | 'alert' | 'img'
}

export function EmptyState({
  icon = '📦',
  title,
  description,
  actionLabel,
  onAction,
  role = 'img',
}: EmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-300"
      role={role === 'img' ? undefined : role}
      aria-live={role === 'status' ? 'polite' : role === 'alert' ? 'assertive' : undefined}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 -translate-x-2 -translate-y-2 opacity-20 blur-xl rounded-full bg-primary/30" />
        <div className="relative text-7xl mb-4 transition-transform duration-500 hover:scale-110 hover:rotate-6 animate-in zoom-in" role="img" aria-label="Empty state icon">
          <span aria-hidden="true">{icon}</span>
        </div>
      </div>
      <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-muted-foreground text-base max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          className="min-h-[48px] px-8 text-base transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          aria-label={actionLabel}
        >
          <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" aria-hidden="true" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  )
}
