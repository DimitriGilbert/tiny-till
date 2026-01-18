import * as React from 'react'

import { AlertCircle, XCircle, Info } from 'lucide-react'
import { VALIDATION_TYPES, type ValidationMessageType } from '@/lib/validation-messages'
import { animationClasses } from '@/lib/animations'
import { cn } from '@/lib/utils'

export interface ValidationErrorMessageProps {
  message: string
  type?: ValidationMessageType
  visible: boolean
  className?: string
  onDismiss?: () => void
}

const iconMap = {
  error: XCircle,
  warning: AlertCircle,
  info: Info,
} as const

const colorMap = {
  error: 'text-destructive',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
} as const

const bgMap = {
  error: 'bg-destructive/10 border-destructive/20',
  warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
} as const

export const ValidationErrorMessage = React.memo(function ValidationErrorMessage({
  message,
  type = VALIDATION_TYPES.ERROR,
  visible,
  className,
  onDismiss,
}: ValidationErrorMessageProps) {
  const Icon = iconMap[type]

  if (!visible || !message) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-2 px-3 py-2 rounded-none border gpu-accelerated',
        animationClasses.springEnter,
        bgMap[type],
        className
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 mt-0.5 flex-shrink-0',
          colorMap[type]
        )}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-tight', colorMap[type])}>
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 ml-auto opacity-70 hover:opacity-100 transition-opacity',
            colorMap[type]
          )}
          aria-label="Dismiss message"
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
})
