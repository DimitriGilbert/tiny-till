import * as React from 'react'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { getErrorStateClasses, getValidationTransitionClasses } from '@/lib/animations'

export interface ValidatedQuantityInputProps {
  value: string
  error: string | null
  isValid: boolean
  hasError: boolean
  placeholder?: string
  className?: string
  displayClassName?: string
}

export const ValidatedQuantityInput = React.memo(function ValidatedQuantityInput({
  value,
  error,
  isValid,
  hasError,
  placeholder = '0',
  className,
  displayClassName,
}: ValidatedQuantityInputProps) {
  const displayValue = value || placeholder
  const showValidIndicator = isValid && value.length > 0 && !hasError

  const borderClasses = getErrorStateClasses(hasError, isValid)
  const transitionClasses = getValidationTransitionClasses()

  return (
    <output
      className={cn(
        'relative rounded-none p-6 text-center',
        'border-2',
        borderClasses,
        transitionClasses,
        hasError && 'animate-shake',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
      aria-invalid={hasError}
      aria-describedby={error ? 'quantity-error' : undefined}
    >
      <div
        className={cn(
          'text-5xl font-mono font-bold tracking-wider',
          displayClassName
        )}
      >
        {displayValue}
      </div>

      {showValidIndicator && (
        <div className="absolute top-2 right-2 flex items-center justify-center">
          <div
            className={cn(
              'rounded-full bg-green-500 p-1',
              'transition-all duration-200',
              'animate-fade-in'
            )}
            aria-hidden="true"
          >
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute top-2 right-2 flex items-center justify-center">
          <div
            className={cn(
              'rounded-full bg-destructive p-1',
              'transition-all duration-200',
              'animate-fade-in'
            )}
            aria-hidden="true"
          >
            <X className="h-3 w-3 text-destructive-foreground" />
          </div>
        </div>
      )}
    </output>
  )
})
