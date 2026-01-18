const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Generates a UUID v4 using the Web Crypto API.
 *
 * This function uses `crypto.randomUUID()` which is available in modern browsers
 * and Node.js. The UUID v4 format guarantees 122 random bits plus 6 version bits,
 * making collisions extremely unlikely (1 in 2^122).
 *
 * @throws {TypeError} If `crypto.randomUUID()` is not available (unlikely in modern browsers)
 *
 * @example
 * const id = generateUUID()
 * console.log(id) // '550e8400-e29b-41d4-a716-446655440000'
 *
 * @returns {string} UUID v4 string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}

/**
 * Validates whether a value is a properly formatted UUID v4 string.
 *
 * Uses a strict regex pattern to verify the UUID structure:
 * - 8-4-4-4-12 hex digit groups separated by hyphens
 * - Version 4 indicator in position 13 (the character '4')
 * - Variant bits in position 16 (must be 8, 9, a, or b)
 *
 * @param {unknown} value - Value to validate
 *
 * @example
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000') // true
 * isValidUUID('not-a-uuid') // false
 * isValidUUID(12345) // false
 * isValidUUID('00000000-0000-0000-0000-000000000000') // true
 *
 * @returns {value is string} Type guard that narrows type to string if valid UUID
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }
  return UUID_V4_REGEX.test(value)
}
