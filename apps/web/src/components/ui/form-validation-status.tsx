import * as React from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { animationClasses } from '@/lib/animations'

export type FormValidationVariant = 'inline' | 'block' | 'icon-only'

export interface FormValidationStatusProps {
  isValid: boolean
  isDirty: boolean
  isValidating: boolean
  errorCount: number
  variant?: FormValidationVariant
  className?: string
}

export const FormValidationStatus = React.memo(function FormValidationStatus({
  isValid,
  isDirty,
  isValidating,
  errorCount,
  variant = 'inline',
  className,
}: FormValidationStatusProps) {
  if (!isDirty && !isValidating) {
    return null
  }

  const getStatusState = () => {
    if (isValidating) return 'validating'
    if (errorCount > 0) return 'invalid'
    if (isValid) return 'valid'
    return 'idle'
  }

  const status = getStatusState()

  const iconMap = {
    valid: <CheckCircle2 className="h-4 w-4" />,
    invalid: <AlertCircle className="h-4 w-4" />,
    validating: <Loader2 className="h-4 w-4 animate-spin" />,
    idle: null,
  }

  const colorMap = {
    valid: 'text-green-500 dark:text-green-400',
    invalid: 'text-red-500 dark:text-red-400',
    validating: 'text-blue-500 dark:text-blue-400',
    idle: 'text-gray-400 dark:text-gray-500',
  }

  const bgMap = {
    valid: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    invalid: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    validating: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    idle: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
  }

  const getMessage = () => {
    if (isValidating) return 'Validating...'
    if (errorCount > 0) return `${errorCount} error${errorCount > 1 ? 's' : ''} found`
    if (isValid) return 'All fields valid'
    return null
  }

  const Icon = iconMap[status]
  const message = getMessage()

  if (variant === 'icon-only') {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full',
          bgMap[status],
          animationClasses.springEnter,
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={message || 'Form status'}
      >
        {Icon}
      </div>
    )
  }

  if (variant === 'block') {
    return (
      <div
        className={cn(
          'w-full rounded-lg border p-3 flex items-center gap-3',
          bgMap[status],
          animationClasses.springEnter,
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={message || 'Form status'}
      >
        {Icon && (
          <div className={cn('flex-shrink-0', colorMap[status])}>{Icon}</div>
        )}
        {message && (
          <p className={cn('text-sm font-medium', colorMap[status])}>{message}</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border',
        bgMap[status],
        animationClasses.springEnter,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message || 'Form status'}
    >
      {Icon && <span className={cn('flex-shrink-0', colorMap[status])}>{Icon}</span>}
      {message && <span className={cn('font-medium', colorMap[status])}>{message}</span>}
    </div>
  )
})