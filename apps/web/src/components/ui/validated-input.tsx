import * as React from 'react'
import { CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { animationClasses, getValidationTransitionClasses } from '@/lib/animations'
import type { InputHTMLAttributes } from 'react'

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid'

export interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string | null
  isValid?: boolean
  isRequired?: boolean
  helperText?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validationStatus?: ValidationStatus
  id?: string
}

export const ValidatedInput = React.memo(function ValidatedInput({
  label,
  error,
  isValid,
  isRequired = false,
  helperText,
  validateOnChange = true,
  validateOnBlur = true,
  validationStatus: propValidationStatus,
  id: propId,
  className,
  children,
  ...inputProps
}: ValidatedInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasInteracted, setHasInteracted] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const generatedId = React.useId()

  const id = propId || generatedId

  const getValidationStatus = (): ValidationStatus => {
    if (propValidationStatus) return propValidationStatus
    if (error) return 'invalid'
    if (isValid && hasInteracted) return 'valid'
    if (!hasInteracted) return 'idle'
    return 'idle'
  }

  const status = getValidationStatus()
  const showError = error && hasInteracted

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    inputProps.onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (validateOnBlur) {
      setHasInteracted(true)
    }
    inputProps.onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateOnChange) {
      setHasInteracted(true)
    }
    inputProps.onChange?.(e)
  }

  const iconMap = {
    valid: <CheckCircle2 className="h-4 w-4" />,
    invalid: <AlertCircle className="h-4 w-4" />,
    validating: <Loader2 className="h-4 w-4 animate-spin" />,
    idle: null,
  }

  const statusColorMap = {
    valid: 'text-green-500 dark:text-green-400',
    invalid: 'text-red-500 dark:text-red-400',
    validating: 'text-blue-500 dark:text-blue-400',
    idle: 'text-gray-400 dark:text-gray-500',
  }

  const borderMap = {
    valid: 'border-green-500 focus-visible:ring-green-500',
    invalid: 'border-red-500 focus-visible:ring-red-500',
    validating: 'border-blue-500 focus-visible:ring-blue-500',
    idle: 'border-input focus-visible:ring-ring',
  }

  const Icon = iconMap[status]

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={id} className={cn('flex items-center gap-1', isFocused && 'text-primary')}>
          {label}
          {isRequired && <span className="text-red-500" aria-label="required">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          {...inputProps}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            borderMap[status],
            'pr-10',
            getValidationTransitionClasses(),
            className
          )}
          aria-invalid={status === 'invalid'}
          aria-describedby={
            showError || helperText
              ? cn(showError && `${id}-error`, helperText && `${id}-helper`).split(' ').filter(Boolean).join(' ')
              : undefined
          }
          aria-required={isRequired}
        />

        {Icon && (
          <div
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0 transition-opacity',
              statusColorMap[status],
              animationClasses.springEnter
            )}
            aria-hidden="true"
          >
            {Icon}
          </div>
        )}
      </div>

      {showError && (
        <div
          id={`${id}-error`}
          className={cn(
            'flex items-start gap-2 text-sm text-red-500 dark:text-red-400',
            animationClasses.springEnter
          )}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!showError && helperText && (
        <div
          id={`${id}-helper`}
          className={cn(
            'flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400',
            !hasInteracted && animationClasses.fadeIn
          )}
        >
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{helperText}</span>
        </div>
      )}
    </div>
  )
})