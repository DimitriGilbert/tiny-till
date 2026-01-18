import type { Product } from '../entities/product'
import { isValidUUID } from '../utils/uuid'

/**
 * Validates timestamp consistency for a product.
 *
 * Ensures that updatedAt is not earlier than createdAt, which would indicate
 * a data integrity issue. Updated products should always have an updatedAt
 * timestamp greater than or equal to their creation timestamp.
 *
 * @param {Product} product - Product to validate
 *
 * @example
 * const product = { createdAt: 1640995200000, updatedAt: 1640995300000 }
 * checkTimestampConsistency(product) // true
 *
 * @returns {boolean} true if timestamps are consistent, false otherwise
 */
export function checkTimestampConsistency(product: Product): boolean {
  return (
    product.updatedAt >= product.createdAt &&
    product.createdAt > 0 &&
    product.updatedAt > 0
  )
}

/**
 * Performs comprehensive integrity checks on a product.
 *
 * Validates all aspects of product data:
 * - Valid UUID v4 format
 * - Non-empty name within length limits
 * - Positive integer price
 * - Valid image data (if present)
 * - Timestamp consistency
 *
 * @param {Product} product - Product to validate
 *
 * @example
 * const product = createProduct({ name: 'Bread', price: 250 })
 * const result = checkProductIntegrity(product)
 * if (!result.isValid) {
 *   console.error(result.errors)
 * }
 *
 * @returns {{ isValid: boolean; errors: string[] }} Validation result with error messages
 */
export function checkProductIntegrity(product: Product): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!isValidUUID(product.id)) {
    errors.push('Invalid UUID v4 format')
  }

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required')
  } else if (product.name.length > 50) {
    errors.push('Product name exceeds 50 character limit')
  }

  if (typeof product.price !== 'number' || !Number.isInteger(product.price)) {
    errors.push('Price must be an integer number of cents')
  } else if (product.price <= 0) {
    errors.push('Price must be greater than 0')
  }

  if (product.imageData !== undefined && typeof product.imageData === 'string') {
    if (
      !product.imageData.startsWith('data:image/') &&
      !product.imageData.startsWith('blob:')
    ) {
      errors.push('Image data must be a valid data URL or blob URL')
    }
  }

  if (!checkTimestampConsistency(product)) {
    errors.push('Timestamp consistency check failed')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates a list of products for data integrity and uniqueness.
 *
 * Performs individual integrity checks on each product and also validates:
 * - Unique product IDs (no duplicates)
 * - Unique product names (optional, based on requirements)
 *
 * @param {Product[]} products - Array of products to validate
 * @param {{ checkUniqueNames?: boolean }} [options] - Validation options
 *
 * @example
 * const products = [product1, product2, product3]
 * const result = validateProductList(products)
 * if (!result.isValid) {
 *   console.error(result.errors)
 *   console.error('Invalid products:', result.invalidIndices)
 * }
 *
 * @returns {{ isValid: boolean; errors: string[]; invalidIndices: number[] }} Validation result
 */
export function validateProductList(
  products: Product[],
  options?: { checkUniqueNames?: boolean }
): {
  isValid: boolean
  errors: string[]
  invalidIndices: number[]
} {
  const errors: string[] = []
  const invalidIndices: number[] = []

  const idSet = new Set<string>()
  const nameSet = new Set<string>()

  products.forEach((product, index) => {
    const integrityResult = checkProductIntegrity(product)
    if (!integrityResult.isValid) {
      invalidIndices.push(index)
      errors.push(`Product at index ${index}: ${integrityResult.errors.join(', ')}`)
      return
    }

    if (idSet.has(product.id)) {
      invalidIndices.push(index)
      errors.push(`Product at index ${index}: Duplicate ID ${product.id}`)
    } else {
      idSet.add(product.id)
    }

    if (options?.checkUniqueNames) {
      if (nameSet.has(product.name)) {
        invalidIndices.push(index)
        errors.push(`Product at index ${index}: Duplicate name "${product.name}"`)
      } else {
        nameSet.add(product.name)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    invalidIndices,
  }
}

/**
 * Generates a simple checksum for product data integrity verification.
 *
 * Creates a hash of the product's core fields (excluding timestamps) to
 * detect accidental data modification. This is a simple checksum, not a
 * cryptographic hash, suitable for detecting gross changes but not
 * tampering detection.
 *
 * @param {Product} product - Product to generate checksum for
 *
 * @example
 * const checksum = generateProductChecksum(product)
 * // Later, verify data hasn't changed:
 * if (generateProductChecksum(product) !== checksum) {
 *   console.warn('Product data may have been modified')
 * }
 *
 * @returns {string} Hexadecimal checksum string
 */
export function generateProductChecksum(product: Product): string {
  const data = `${product.id}|${product.name}|${product.price}|${product.imageData || ''}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

/**
 * Detects and reports potential data anomalies in a product list.
 *
 * Analyzes products for common data quality issues:
 * - Products with unusually high prices
 * - Products with very old creation dates
 * - Products with missing common fields (image, etc.)
 *
 * @param {Product[]} products - Array of products to analyze
 *
 * @example
 * const anomalies = detectDataAnomalies(products)
 * if (anomalies.length > 0) {
 *   console.warn('Found data anomalies:', anomalies)
 * }
 *
 * @returns {{ productId: string; type: string; message: string }[]} Array of anomaly reports
 */
export function detectDataAnomalies(
  products: Product[]
): { productId: string; type: string; message: string }[] {
  const anomalies: { productId: string; type: string; message: string }[] = []
  const now = Date.now()
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000
  const expensiveThreshold = 10000

  products.forEach((product) => {
    if (product.price > expensiveThreshold * 100) {
      anomalies.push({
        productId: product.id,
        type: 'high_price',
        message: `Price exceeds $${expensiveThreshold}`,
      })
    }

    if (product.createdAt < oneYearAgo) {
      anomalies.push({
        productId: product.id,
        type: 'old_product',
        message: `Product created more than a year ago`,
      })
    }

    if (!product.imageData) {
      anomalies.push({
        productId: product.id,
        type: 'missing_image',
        message: `Product has no image data`,
      })
    }
  })

  return anomalies
}
