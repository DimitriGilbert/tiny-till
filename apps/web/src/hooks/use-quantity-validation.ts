import * as React from 'react'
import { validateQuantity, validateQuantityString, type ValidationResult } from '@/lib/validators'
import { getQuantityErrorMessage } from '@/lib/validation-messages'

export interface QuantityValidationState {
  isValid: boolean
  error: string | null
  quantity: number | null
}

export interface UseQuantityValidationReturn {
  validate: (value: string | number) => ValidationResult
  validateAndParse: (value: string) => { isValid: boolean; quantity?: number; error?: string }
  getErrorMessage: (error: string | undefined) => string
  hasError: boolean
  errorState: string | null
  validationState: QuantityValidationState
  resetValidation: () => void
  setError: (error: string | null) => void
}

export function useQuantityValidation(maxDisplayLength: number = 6): UseQuantityValidationReturn {
  const [errorState, setErrorState] = React.useState<string | null>(null)
  const [validationState, setValidationState] = React.useState<QuantityValidationState>({
    isValid: true,
    error: null,
    quantity: null,
  })

  const validate = React.useCallback((value: string | number): ValidationResult => {
    let result: ValidationResult

    if (typeof value === 'string') {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        setValidationState({ isValid: true, error: null, quantity: null })
        setErrorState(null)
        return { isValid: true }
      }

      result = validateQuantityString(trimmed, maxDisplayLength)
    } else {
      result = validateQuantity(value)
    }

    if (result.isValid) {
      const quantity = typeof value === 'string' ? parseInt(value.trim(), 10) : value
      setValidationState({ isValid: true, error: null, quantity })
      setErrorState(null)
    } else {
      setValidationState({ isValid: false, error: result.error || 'Invalid input', quantity: null })
      setErrorState(result.error || 'Invalid input')
    }

    return result
  }, [maxDisplayLength])

  const validateAndParse = React.useCallback((value: string): { isValid: boolean; quantity?: number; error?: string } => {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      setValidationState({ isValid: true, error: null, quantity: 0 })
      setErrorState(null)
      return { isValid: true, quantity: 0 }
    }

    const result = validateQuantityString(trimmed, maxDisplayLength)

    if (result.isValid) {
      const quantity = parseInt(trimmed, 10)
      setValidationState({ isValid: true, error: null, quantity })
      setErrorState(null)
      return { isValid: true, quantity }
    }

    setValidationState({ isValid: false, error: result.error || 'Invalid input', quantity: null })
    setErrorState(result.error || 'Invalid input')
    return { isValid: false, error: result.error }
  }, [maxDisplayLength])

  const getErrorMessage = React.useCallback((error: string | undefined): string => {
    if (!error) return ''
    return getQuantityErrorMessage(error as any) || error
  }, [])

  const resetValidation = React.useCallback(() => {
    setValidationState({ isValid: true, error: null, quantity: null })
    setErrorState(null)
  }, [])

  const setError = React.useCallback((error: string | null) => {
    setErrorState(error)
    setValidationState(prev => ({
      ...prev,
      isValid: error === null,
      error,
    }))
  }, [])

  return {
    validate,
    validateAndParse,
    getErrorMessage,
    hasError: errorState !== null,
    errorState,
    validationState,
    resetValidation,
    setError,
  }
}
