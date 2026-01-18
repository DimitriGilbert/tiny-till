import { useState, useCallback, useRef } from 'react'
import {
  toDollars,
  toCents,
  sanitizePriceInput,
  validatePriceStrict,
} from '@tiny-till/types'

interface UsePriceInputProps {
  initialValue?: number
  minCents?: number
  maxCents?: number
  onChange?: (cents: number) => void
}

interface UsePriceInputReturn {
  value: string
  cents: number
  error: string | null
  isValid: boolean
  handleChange: (input: string) => void
  handleBlur: () => void
  handleFocus: () => void
  reset: () => void
}

export function usePriceInput({
  initialValue = 0,
  minCents = 1,
  maxCents = 99_999_999,
  onChange,
}: UsePriceInputProps = {}): UsePriceInputReturn {
  const [value, setValue] = useState(() => {
    if (initialValue === 0) return ''
    return `$${toDollars(initialValue).toFixed(2)}`
  })
  const [cents, setCents] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)
  const isFocusedRef = useRef(false)

  const handleChange = useCallback(
    (input: string) => {
      const sanitized = sanitizePriceInput(input)

      if (!sanitized) {
        setValue('')
        setError(null)
        setIsValid(false)
        return
      }

      const hasCurrencySymbol = input.startsWith('$')
      const displayValue = hasCurrencySymbol ? `$${sanitized}` : sanitized
      setValue(displayValue)

      try {
        const parsed = parseFloat(sanitized)
        if (isNaN(parsed)) {
          setError('Invalid price')
          setIsValid(false)
          return
        }

        const newCents = Math.round(parsed * 100)

        if (newCents < minCents) {
          setError(`Price must be at least $${(minCents / 100).toFixed(2)}`)
          setIsValid(false)
          return
        }

        if (newCents > maxCents) {
          setError(`Price cannot exceed $${(maxCents / 100).toLocaleString()}`)
          setIsValid(false)
          return
        }

        setCents(newCents)
        setError(null)
        setIsValid(true)

        if (onChange) {
          onChange(newCents)
        }
      } catch {
        setError('Invalid price format')
        setIsValid(false)
      }
    },
    [minCents, maxCents, onChange]
  )

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false

    if (!value.trim()) {
      setValue('')
      setCents(0)
      setError('Price is required')
      setIsValid(false)
      return
    }

    const validation = validatePriceStrict(value)
    if (!validation.isValid) {
      setError(validation.errors[0] ?? 'Invalid price')
      setIsValid(false)
      return
    }

    if (validation.value !== undefined) {
      const formatted = `$${toDollars(validation.value).toFixed(2)}`
      setValue(formatted)
      setCents(validation.value)
      setError(null)
      setIsValid(true)

      if (onChange) {
        onChange(validation.value)
      }
    }
  }, [value, onChange])

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true
  }, [])

  const reset = useCallback(() => {
    setValue('')
    setCents(0)
    setError(null)
    setIsValid(false)
  }, [])

  return {
    value,
    cents,
    error,
    isValid,
    handleChange,
    handleBlur,
    handleFocus,
    reset,
  }
}
