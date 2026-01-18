import type { ValidationResult } from './validators'

export interface MockValidationError {
  code: string
  message: string
}

export function mockValidationError(errorType: 'INVALID_NUMBER' | 'DECIMAL_REJECTED' | 'NEGATIVE' | 'EXCEEDS_MAX'): MockValidationError {
  const errorMap: Record<string, MockValidationError> = {
    INVALID_NUMBER: { code: 'INVALID_NUMBER', message: 'Please enter a valid number' },
    DECIMAL_REJECTED: { code: 'DECIMAL_REJECTED', message: 'Quantity must be a whole number (no decimals)' },
    NEGATIVE: { code: 'NEGATIVE', message: 'Quantity cannot be negative' },
    EXCEEDS_MAX: { code: 'EXCEEDS_MAX', message: 'Quantity cannot exceed 9,999' },
  }

  return errorMap[errorType]
}

export function assertValidationResult(result: ValidationResult, expectedValid: boolean, expectedError?: string): void {
  if (expectedValid) {
    if (!result.isValid) {
      throw new Error(`Expected valid result, but got error: ${result.error}`)
    }
  } else {
    if (result.isValid) {
      throw new Error('Expected invalid result, but got valid')
    }
    if (expectedError && result.error !== expectedError) {
      throw new Error(`Expected error "${expectedError}", but got "${result.error}"`)
    }
  }
}

export async function waitForValidationComplete(delay: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export function simulateInvalidInput(input: string): boolean {
  const hasInvalidChars = /[^\d]/.test(input)
  const hasDecimal = /\./.test(input)
  const hasNegative = /-/.test(input)
  const isEmpty = input.trim().length === 0
  const exceedsLength = input.length > 6

  return hasInvalidChars || hasDecimal || hasNegative || exceedsLength
}

export function createMockValidationState(isValid: boolean, error: string | null = null) {
  return {
    isValid,
    error,
    quantity: isValid ? (error ? null : 1) : null,
  }
}
