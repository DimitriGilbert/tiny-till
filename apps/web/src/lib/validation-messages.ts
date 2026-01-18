export const QUANTITY_ERROR_MESSAGES = {
  INVALID_NUMBER: 'Please enter a valid number',
  DECIMAL_REJECTED: 'Quantity must be a whole number (no decimals)',
  NEGATIVE: 'Quantity cannot be negative',
  EXCEEDS_MAX: 'Quantity cannot exceed 9,999',
  EMPTY: 'Please enter a quantity',
  INVALID_INPUT: 'Invalid input. Use numbers only',
  ZERO_REMOVES_ITEM: 'Setting quantity to 0 will remove this item',
  INVALID_FORMAT: 'Invalid quantity format',
  CONTAINS_LETTERS: 'Quantity cannot contain letters',
  CONTAINS_SPECIAL_CHARS: 'Quantity cannot contain special characters',
  EXCEEDS_DISPLAY_LIMIT: 'Quantity is too long (max 6 digits)',
} as const

export const VALIDATION_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

export type ValidationErrorType = keyof typeof QUANTITY_ERROR_MESSAGES
export type ValidationMessageType = (typeof VALIDATION_TYPES)[keyof typeof VALIDATION_TYPES]

export function getQuantityErrorMessage(errorType: ValidationErrorType): string {
  return QUANTITY_ERROR_MESSAGES[errorType]
}

export function getValidationErrorTypeFromCode(code: string): ValidationErrorType {
  const upperCode = code.toUpperCase() as ValidationErrorType
  if (upperCode in QUANTITY_ERROR_MESSAGES) {
    return upperCode
  }
  return 'INVALID_INPUT'
}
