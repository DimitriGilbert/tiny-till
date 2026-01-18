import { Button } from '@/components/ui/button'
import { RefreshCw, X, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react'

export interface RetryButtonProps {
  onRetry: () => void
  isRetrying?: boolean
  label?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function RetryButton({
  onRetry,
  isRetrying = false,
  label = 'Retry',
  size = 'sm',
}: RetryButtonProps) {
  return (
    <Button size={size} onClick={onRetry} disabled={isRetrying}>
      {isRetrying ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-1" />
          {label}
        </>
      )}
    </Button>
  )
}

export interface FixButtonProps {
  onFix: () => void
  label?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function FixButton({
  onFix,
  label = 'Fix',
  size = 'sm',
  variant = 'default',
}: FixButtonProps) {
  return (
    <Button size={size} variant={variant} onClick={onFix}>
      <CheckCircle2 className="h-4 w-4 mr-1" />
      {label}
    </Button>
  )
}

export interface ViewDetailsButtonProps {
  onView: () => void
  label?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ViewDetailsButton({
  onView,
  label = 'View Details',
  size = 'sm',
}: ViewDetailsButtonProps) {
  return (
    <Button size={size} variant="outline" onClick={onView}>
      <ExternalLink className="h-4 w-4 mr-1" />
      {label}
    </Button>
  )
}

export interface DismissButtonProps {
  onDismiss: () => void
  label?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function DismissButton({
  onDismiss,
  label,
  size = 'icon',
}: DismissButtonProps) {
  return (
    <Button size={size} variant="ghost" onClick={onDismiss}>
      <X className="h-4 w-4" />
      {label}
    </Button>
  )
}

export interface ActionButtonsProps {
  actions: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    icon?: React.ReactNode
    disabled?: boolean
  }>
  onDismiss?: () => void
  dismissLabel?: string
}

export function ActionButtons({
  actions,
  onDismiss,
  dismissLabel,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {actions.map((action, index) => (
        <Button
          key={`action-${action.label}-${index}`}
          variant={action.variant || 'default'}
          onClick={action.onClick}
          disabled={action.disabled}
          size="sm"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
      {onDismiss && (
        <Button variant="ghost" onClick={onDismiss} size="sm">
          {dismissLabel || 'Dismiss'}
        </Button>
      )}
    </div>
  )
}

export interface WarningActionButtonProps {
  onClick: () => void
  label?: string
  description?: string
}

export function WarningActionButton({
  onClick,
  label = 'Proceed',
  description,
}: WarningActionButtonProps) {
  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="destructive"
        onClick={onClick}
        className="w-full sm:w-auto"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        {label}
      </Button>
      {description && (
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          {description}
        </p>
      )}
    </div>
  )
}
