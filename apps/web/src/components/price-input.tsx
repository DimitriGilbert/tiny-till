import * as React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { animationClasses, getValidationTransitionClasses } from '@/lib/animations'

interface PriceInputProps {
  value?: number
  onChange?: (cents: number) => void
  minCents?: number
  maxCents?: number
  currencySymbol?: string
  variant?: 'default' | 'compact' | 'inline'
  error?: string
  className?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  showValidationIcon?: boolean
}

export function PriceInput({
  value = 0,
  onChange,
  minCents = 1,
  maxCents = 99_999_999,
  currencySymbol = '$',
  variant = 'default',
  error,
  className,
  id,
  placeholder = '$0.00',
  disabled = false,
  showValidationIcon = true,
  ...props
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() => {
    if (value === 0) return ''
    const dollars = value / 100
    return `${currencySymbol}${dollars.toFixed(2)}`
  })
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasInteracted, setHasInteracted] = React.useState(false)

  const formatPriceForDisplay = React.useCallback(
    (cents: number) => {
      if (cents === 0) return ''
      const dollars = cents / 100
      return `${currencySymbol}${dollars.toFixed(2)}`
    },
    [currencySymbol]
  )

  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatPriceForDisplay(value))
    }
  }, [value, isFocused, formatPriceForDisplay])

  const handleChange = React.useCallback(
    (input: string) => {
      let sanitized = input.replace(/[^0-9.]/g, '')

      const decimalIndex = sanitized.indexOf('.')
      if (decimalIndex !== -1) {
        const integerPart = sanitized.substring(0, decimalIndex)
        const decimalPart = sanitized.substring(decimalIndex + 1)
        sanitized = `${integerPart}.${decimalPart.slice(0, 2)}`
      }

      if (sanitized.startsWith('.')) {
        sanitized = `0${sanitized}`
      }

      setDisplayValue(sanitized ? `${currencySymbol}${sanitized}` : '')

      if (onChange && sanitized) {
        try {
          const parsed = parseFloat(sanitized)
          if (!isNaN(parsed)) {
            const cents = Math.round(parsed * 100)
            if (cents >= minCents && cents <= maxCents) {
              onChange(cents)
            }
          }
        } catch {
        }
      }
    },
    [onChange, minCents, maxCents, currencySymbol]
  )

  const handleBlur = React.useCallback(() => {
    setIsFocused(false)

    try {
      if (displayValue) {
        const sanitized = displayValue.replace(/[^0-9.]/g, '')
        if (sanitized) {
          const parsed = parseFloat(sanitized)
          if (!isNaN(parsed) && parsed >= minCents / 100) {
            const cents = Math.round(parsed * 100)
            const clamped = Math.min(Math.max(cents, minCents), maxCents)
            setDisplayValue(formatPriceForDisplay(clamped))
            if (onChange) {
              onChange(clamped)
            }
            return
          }
        }
      }

      setDisplayValue(formatPriceForDisplay(value))
    } catch {
      setDisplayValue(formatPriceForDisplay(value))
    }
  }, [displayValue, value, onChange, minCents, maxCents, formatPriceForDisplay])

  const handleFocus = React.useCallback(() => {
    setIsFocused(true)
    if (value === 0) {
      setDisplayValue('')
    }
  }, [value])

  const variantStyles = {
    default: '',
    compact: 'h-7 text-xs',
    inline: 'h-6 w-24 text-xs',
  }

  const isValid = value > 0 && !error && hasInteracted
  const showValidIcon = isValid && showValidationIcon

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={(e) => {
            setHasInteracted(true)
            handleChange(e.target.value)
          }}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            variantStyles[variant],
            error && 'pr-10',
            showValidIcon && 'pr-10',
            getValidationTransitionClasses(),
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error && id ? `${id}-error` : undefined}
          {...props}
        />
        {showValidIcon && (
          <div
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0',
              animationClasses.springEnter
            )}
            aria-hidden="true"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
          </div>
        )}
        {error && showValidationIcon && (
          <div
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0',
              animationClasses.springEnter
            )}
            aria-hidden="true"
          >
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>
      {error && id && (
        <p
          id={`${id}-error`}
          className={cn(
            'text-destructive text-xs flex items-start gap-1.5',
            animationClasses.springEnter
          )}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
