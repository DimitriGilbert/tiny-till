import { Button } from '@/components/ui/button'
import { PlayfulButton, KawaiiSparkle } from '@/components/kawaii'
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
      className="relative flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-300"
      role={role === 'img' ? undefined : role}
      aria-live={role === 'status' ? 'polite' : role === 'alert' ? 'assertive' : undefined}
    >
      <div className="absolute -top-4 -left-4 opacity-40">
        <KawaiiSparkle size="lg" color="pink" delay={100} />
      </div>
      <div className="absolute top-0 right-8 opacity-40">
        <KawaiiSparkle size="md" color="acid-green" delay={300} />
      </div>
      <div className="absolute -top-2 right-24 opacity-40">
        <KawaiiSparkle size="sm" color="acid-yellow" delay={500} />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 -translate-x-2 -translate-y-2 opacity-20 blur-xl rounded-full bg-primary/30" />
        <div className="relative text-8xl mb-4 transition-transform duration-500 hover:scale-110 hover:rotate-6 animate-bounce-in font-display" role="img" aria-label="Empty state icon">
          <span aria-hidden="true">{icon}</span>
        </div>
      </div>
      <h3 className="text-3xl font-display font-bold mb-3 bg-gradient-to-r from-primary to-kawaii-lavender bg-clip-text text-transparent animate-rainbow-gradient">
        {title}
      </h3>
      <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <PlayfulButton
          onClick={onAction}
          variant="pink"
          size="lg"
          wiggle
          aria-label={actionLabel}
        >
          <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" aria-hidden="true" />
          <span>{actionLabel}</span>
        </PlayfulButton>
      )}
    </div>
  )
}
