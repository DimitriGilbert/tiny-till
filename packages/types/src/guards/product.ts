import type { Product, ProductInput } from '../entities/product'
import { isTimestampedEntity } from './base'

const MAX_NAME_LENGTH = 50
const MAX_PRICE_CENTS = 99_999_999
const MAX_IMAGE_SIZE_BYTES = 128 * 128 * 4

/**
 * Type guard to check if a value is a valid Product.
 *
 * Performs runtime validation of all Product fields including:
 * - Valid UUID v4 for id
 * - Non-empty name within length limit
 * - Positive integer price
 * - Optional valid image data URL or blob URL
 * - Valid timestamp fields via TimestampedEntity
 *
 * @param {unknown} obj - Value to check
 *
 * @example
 * const data = JSON.parse(jsonString)
 * if (isProduct(data)) {
 *   console.log(data.name) // TypeScript knows this is a Product
 * }
 *
 * @returns {obj is Product} Type guard that narrows type to Product if valid
 */
export function isProduct(obj: unknown): obj is Product {
  if (!isTimestampedEntity(obj)) {
    return false
  }

  const product = obj as Product
  return (
    typeof product.name === 'string' &&
    product.name.length > 0 &&
    product.name.length <= MAX_NAME_LENGTH &&
    typeof product.price === 'number' &&
    Number.isInteger(product.price) &&
    product.price > 0 &&
    product.price <= MAX_PRICE_CENTS &&
    isValidImageData(product.imageData)
  )
}

/**
 * Type guard to check if a value is a valid ProductInput.
 *
 * Validates ProductInput data without requiring id, createdAt, or updatedAt.
 * Used for validating new product creation data.
 *
 * @param {unknown} obj - Value to check
 *
 * @example
 * const input = { name: 'Bread', price: 250 }
 * if (isProductInput(input)) {
 *   catalogStore.addProduct(input)
 * }
 *
 * @returns {obj is ProductInput} Type guard that narrows type to ProductInput if valid
 */
export function isProductInput(obj: unknown): obj is ProductInput {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const input = obj as ProductInput
  return (
    typeof input.name === 'string' &&
    input.name.length > 0 &&
    input.name.length <= MAX_NAME_LENGTH &&
    typeof input.price === 'number' &&
    Number.isInteger(input.price) &&
    input.price > 0 &&
    input.price <= MAX_PRICE_CENTS &&
    isValidImageData(input.imageData)
  )
}

/**
 * Checks if a value is a valid positive integer price in cents.
 *
 * @param {unknown} value - Value to check
 *
 * @example
 * isValidPrice(1050) // true
 * isValidPrice(-50) // false
 * isValidPrice(10.50) // false (not integer)
 * isValidPrice('1050') // false (not number)
 *
 * @returns {value is number} Type guard that narrows type to number if valid price
 */
export function isValidPrice(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_PRICE_CENTS
  )
}

/**
 * Checks if a value is a valid product name.
 *
 * @param {unknown} value - Value to check
 *
 * @example
 * isValidProductName('Coffee') // true
 * isValidProductName('') // false (empty)
 * isValidProductName('A'.repeat(51)) // false (too long)
 * isValidProductName(123) // false (not string)
 *
 * @returns {value is string} Type guard that narrows type to string if valid name
 */
export function isValidProductName(value: unknown): value is string {
  return (
    typeof value === 'string' && value.length > 0 && value.length <= MAX_NAME_LENGTH
  )
}

/**
 * Checks if a value is valid image data.
 *
 * Accepts:
 * - Base64 data URLs starting with 'data:image/'
 * - Blob URLs starting with 'blob:'
 *
 * For data URLs, also validates:
 * - File size does not exceed 128×128 pixel limit
 * - MIME type is PNG, JPEG, or WebP
 *
 * @param {unknown} value - Value to check
 *
 * @example
 * isValidImageData('data:image/png;base64,...') // true (if within size limit)
 * isValidImageData('blob:http://...') // true
 * isValidImageData('http://example.com/image.png') // false (not data or blob)
 * isValidImageData('data:image/tiff;base64,...') // false (unsupported format)
 *
 * @returns {value is string} Type guard that narrows type to string if valid image data
 */
export function isValidImageData(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  if (value.startsWith('data:image/')) {
    if (value.length > MAX_IMAGE_SIZE_BYTES) {
      return false
    }
    const mimeType = value.match(/^data:image\/([^;]+)/)?.[1]
    return ['png', 'jpeg', 'jpg', 'webp'].includes(mimeType ?? '')
  }

  if (value.startsWith('blob:')) {
    return true
  }

  return false
}

/**
 * Validates a product object and returns detailed validation results.
 *
 * Provides comprehensive validation with specific error messages for each field.
 * Useful for form validation and user feedback.
 *
 * @param {unknown} product - Product object to validate
 *
 * @example
 * const result = validateProduct({ name: '', price: -50 })
 * if (!result.isValid) {
 *   console.log(result.errors) // ['Name is required', 'Price must be positive']
 * }
 *
 * @returns {{ isValid: boolean; errors: string[] }} Validation result with error messages
 */
export function validateProduct(product: unknown): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (typeof product !== 'object' || product === null) {
    return {
      isValid: false,
      errors: ['Product must be an object'],
    }
  }

  const p = product as Record<string, unknown>

  if (typeof p.id !== 'string' || !p.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    errors.push('Product must have a valid UUID v4 id')
  }

  if (!isValidProductName(p.name)) {
    if (p.name === '' || p.name === undefined) {
      errors.push('Product name is required')
    } else if (typeof p.name === 'string' && p.name.length > MAX_NAME_LENGTH) {
      errors.push(`Product name cannot exceed ${MAX_NAME_LENGTH} characters`)
    } else {
      errors.push('Product name must be a string')
    }
  }

  if (!isValidPrice(p.price)) {
    if (typeof p.price !== 'number') {
      errors.push('Price must be a number')
    } else if (!Number.isInteger(p.price)) {
      errors.push('Price must be a whole number of cents')
    } else if (p.price <= 0) {
      errors.push('Price must be greater than 0')
    } else if (p.price > MAX_PRICE_CENTS) {
      errors.push(`Price cannot exceed $${(MAX_PRICE_CENTS / 100).toLocaleString()}`)
    }
  }

  if (p.imageData !== undefined && !isValidImageData(p.imageData)) {
    errors.push('Image data must be a valid data URL or blob URL (PNG, JPEG, or WebP)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
