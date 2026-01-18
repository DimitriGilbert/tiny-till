import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NumericKeypadProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
  validateOnChange?: boolean
  onError?: (error: string | null) => void
  onValidChange?: (isValid: boolean) => void
  className?: string
}

export const NumericKeypad = React.memo(function NumericKeypad({
  value,
  onChange,
  maxLength = 6,
  disabled = false,
  validateOnChange = true,
  onError,
  onValidChange,
  className,
}: NumericKeypadProps) {
  const handleNumberPress = React.useCallback((num: string) => {
    if (disabled) return

    const newValue = value === '0' ? num : value + num

    if (validateOnChange) {
      if (!/^\d+$/.test(newValue)) {
        onError?.('Invalid input. Use numbers only')
        onValidChange?.(false)
        return
      }

      const numValue = parseInt(newValue, 10)
      if (numValue > 9_999) {
        onError?.('Quantity cannot exceed 9,999')
        onValidChange?.(false)
        return
      }
    }

    if (newValue.length <= maxLength) {
      onChange(newValue)
      onError?.(null)
      onValidChange?.(true)
    }
  }, [disabled, value, maxLength, onChange, validateOnChange, onError, onValidChange])

  const handleClear = React.useCallback(() => {
    if (disabled) return
    onChange('')
    onError?.(null)
    onValidChange?.(true)
  }, [disabled, onChange, onError, onValidChange])

  const handleBackspace = React.useCallback(() => {
    if (disabled) return
    if (value.length > 0) {
      onChange(value.slice(0, -1))
      if (validateOnChange) {
        const newValue = value.slice(0, -1)
        if (newValue.length === 0 || /^\d+$/.test(newValue)) {
          onError?.(null)
          onValidChange?.(true)
        }
      }
    }
  }, [disabled, value, onChange, validateOnChange, onError, onValidChange])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        handleNumberPress(e.key)
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        handleBackspace()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleClear()
      } else if (e.key === '.') {
        e.preventDefault()
        onError?.('Quantity must be a whole number (no decimals)')
        onValidChange?.(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, handleNumberPress, handleBackspace, handleClear, onError, onValidChange])

  const buttons = [
    { label: '1', value: '1', position: 'col-start-1 row-start-1' },
    { label: '2', value: '2', position: 'col-start-2 row-start-1' },
    { label: '3', value: '3', position: 'col-start-3 row-start-1' },
    { label: '4', value: '4', position: 'col-start-1 row-start-2' },
    { label: '5', value: '5', position: 'col-start-2 row-start-2' },
    { label: '6', value: '6', position: 'col-start-3 row-start-2' },
    { label: '7', value: '7', position: 'col-start-1 row-start-3' },
    { label: '8', value: '8', position: 'col-start-2 row-start-3' },
    { label: '9', value: '9', position: 'col-start-3 row-start-3' },
    { label: 'C', value: 'clear', position: 'col-start-1 row-start-4', variant: 'destructive' as const, action: handleClear },
    { label: '0', value: '0', position: 'col-start-2 row-start-4' },
    { label: '⌫', value: 'backspace', position: 'col-start-3 row-start-4', variant: 'outline' as const, action: handleBackspace },
  ]

  return (
    <fieldset
      className={cn(
        'grid grid-cols-3 gap-2 sm:gap-3 w-full',
        className
      )}
      disabled={disabled}
      aria-label="Numeric keypad"
    >
      {buttons.map((btn) => (
        <Button
          key={btn.value}
          type="button"
          variant={btn.variant || 'default'}
          size="icon"
          className={cn(
            'h-16 sm:h-14 md:h-16 min-h-[60px] sm:min-h-[60px]',
            'w-full min-w-[60px] sm:min-w-[60px] text-2xl sm:text-xl md:text-2xl font-semibold',
            'transition-all duration-150',
            'active:scale-95 active:bg-primary/80',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'touch-manipulation no-select',
            btn.position
          )}
          onClick={() => {
            if (btn.action) {
              btn.action()
            } else if (typeof btn.value === 'string' && btn.value.length === 1 && btn.value >= '0' && btn.value <= '9') {
              handleNumberPress(btn.value)
            }
          }}
          disabled={disabled}
          aria-label={btn.label === '⌫' ? 'Backspace' : btn.label === 'C' ? 'Clear' : `Number ${btn.label}`}
        >
          {btn.label}
        </Button>
      ))}
    </fieldset>
  )
})
