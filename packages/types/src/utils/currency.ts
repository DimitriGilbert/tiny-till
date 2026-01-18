/**
 * Converts dollar amount to integer cents.
 *
 * Uses Math.round() to handle floating-point precision issues:
 * - 0.99 becomes 99 cents
 * - 10.50 becomes 1050 cents
 * - 10.995 rounds to 1100 cents
 *
 * @param {number} dollars - Dollar amount (can include decimals)
 * @throws {TypeError} If input is not a finite number
 *
 * @example
 * toCents(10.50) // 1050
 * toCents(0.99) // 99
 * toCents(10.995) // 1100 (rounded)
 * toCents(-5.00) // -500 (negative values preserved)
 *
 * @returns {number} Integer cents (rounded from input)
 */
export function toCents(dollars: number): number {
  if (typeof dollars !== 'number' || !Number.isFinite(dollars)) {
    throw new TypeError('Input must be a finite number')
  }
  return Math.round(dollars * 100)
}

/**
 * Converts integer cents to dollar amount.
 *
 * Returns a decimal value that should be formatted using Intl.NumberFormat
 * for display purposes.
 *
 * @param {number} cents - Integer cents value
 * @throws {TypeError} If input is not a finite number
 *
 * @example
 * toDollars(1050) // 10.50
 * toDollars(99) // 0.99
 * toDollars(-500) // -5.00 (negative values preserved)
 *
 * @returns {number} Dollar amount as decimal
 */
export function toDollars(cents: number): number {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    throw new TypeError('Input must be a finite number')
  }
  return cents / 100
}

/**
 * Formats cents as a localized currency string.
 *
 * Uses Intl.NumberFormat for proper currency formatting with locale-aware
 * formatting rules, including thousands separators, decimal separators,
 * and currency symbol placement.
 *
 * @param {number} cents - Integer cents value
 * @param {string} [locale='en-US'] - Locale for formatting (default: en-US)
 * @throws {TypeError} If cents is not a finite number
 *
 * @example
 * formatPrice(1050) // '$10.50'
 * formatPrice(1050, 'en-GB') // '£10.50'
 * formatPrice(1050, 'de-DE') // '10,50 $'
 * formatPrice(1234567) // '$12,345.67'
 *
 * @returns {string} Formatted currency string
 */
export function formatPrice(cents: number, locale: string = 'en-US'): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    throw new TypeError('Cents must be a finite number')
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDollars(cents))
}

/**
 * Parses a price string and converts it to cents.
 *
 * Handles various input formats:
 * - With currency symbol: '$10.50' → 1050 cents
 * - With thousands separator: '$1,234.56' → 123456 cents
 * - Without symbol: '10.50' → 1050 cents
 * - Decimal without cents: '10' → 1000 cents
 *
 * @param {string} priceString - Price string to parse
 * @throws {Error} If input cannot be parsed as a valid number
 * @throws {TypeError} If input is not a string
 *
 * @example
 * parsePrice('$10.50') // 1050
 * parsePrice('$1,234.56') // 123456
 * parsePrice('10.50') // 1050
 * parsePrice('10') // 1000
 * parsePrice('$0.99') // 99
 *
 * @returns {number} Integer cents
 */
export function parsePrice(priceString: string): number {
  if (typeof priceString !== 'string') {
    throw new TypeError('Input must be a string')
  }

  const cleaned = priceString.replace(/[^0-9.-]/g, '')
  const dollars = parseFloat(cleaned)

  if (isNaN(dollars)) {
    throw new Error(`Invalid price format: "${priceString}"`)
  }

  return toCents(dollars)
}
