import { ZodError } from 'zod'

export interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

export function validateProductName(value: string): ValidationResult {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Product name is required' }
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Product name cannot exceed 50 characters' }
  }

  return { isValid: true }
}

export function validatePrice(value: string | number): ValidationResult {
  let numValue: number

  if (typeof value === 'string') {
    numValue = parseFloat(value)
  } else {
    numValue = value
  }

  if (isNaN(numValue)) {
    return { isValid: false, error: 'Price must be a valid number' }
  }

  if (numValue <= 0) {
    return { isValid: false, error: 'Price must be greater than 0' }
  }

  if (numValue > 999_999.99) {
    return { isValid: false, error: 'Price cannot exceed $999,999.99' }
  }

  const cents = Math.round(numValue * 100)
  if (cents > 99_999_999) {
    return { isValid: false, error: 'Price is too high' }
  }

  return { isValid: true }
}

export function validateQuantity(value: number): ValidationResult {
  if (!Number.isInteger(value)) {
    return { isValid: false, error: 'Quantity must be a whole number' }
  }

  if (value < 0) {
    return { isValid: false, error: 'Quantity cannot be negative' }
  }

  if (value > 9_999) {
    return { isValid: false, error: 'Quantity cannot exceed 9,999' }
  }

  return { isValid: true }
}

export function validateImageFile(file: File): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file provided' }
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Image must be PNG, JPEG, or WebP format' }
  }

  return { isValid: true }
}

export async function validateImageDataURL(dataUrl: string): Promise<ValidationResult> {
  const MAX_IMAGE_SIZE_BYTES = 128 * 128 * 4

  if (!dataUrl.startsWith('data:image/')) {
    return { isValid: false, error: 'Invalid image data URL' }
  }

  if (dataUrl.length > MAX_IMAGE_SIZE_BYTES) {
    return { isValid: false, error: 'Image exceeds 128×128 pixel limit' }
  }

  const mimeType = dataUrl.match(/^data:image\/([^;]+)/)?.[1]
  const validTypes = ['png', 'jpeg', 'jpg', 'webp']

  if (!mimeType || !validTypes.includes(mimeType)) {
    return { isValid: false, error: 'Image must be PNG, JPEG, or WebP format' }
  }

  return { isValid: true }
}

export function validateUUID(uuid: string): ValidationResult {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(uuid)) {
    return { isValid: false, error: 'Invalid UUID v4 format' }
  }

  return { isValid: true }
}

export function validateTimestamp(ts: number): ValidationResult {
  if (typeof ts !== 'number' || !Number.isInteger(ts)) {
    return { isValid: false, error: 'Timestamp must be an integer' }
  }

  if (ts <= 0) {
    return { isValid: false, error: 'Timestamp must be positive' }
  }

  const now = Date.now()
  const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000

  if (ts > oneYearFromNow) {
    return { isValid: false, warning: 'Timestamp is in the future' }
  }

  return { isValid: true }
}

export function formatValidationErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'field'
    return `${path}: ${issue.message}`
  })
}
