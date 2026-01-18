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

export function formatPriceCompact(cents: number, locale: string = 'en-US'): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    throw new TypeError('Cents must be a finite number')
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDollars(cents))
}

export function formatPriceWithSymbol(
  cents: number,
  symbol: string,
  locale: string = 'en-US'
): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    throw new TypeError('Cents must be a finite number')
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDollars(cents))

  return `${symbol}${formatted}`
}

export function formatPriceRange(
  minCents: number,
  maxCents: number,
  locale: string = 'en-US'
): string {
  if (typeof minCents !== 'number' || !Number.isFinite(minCents)) {
    throw new TypeError('Min cents must be a finite number')
  }

  if (typeof maxCents !== 'number' || !Number.isFinite(maxCents)) {
    throw new TypeError('Max cents must be a finite number')
  }

  const minFormatted = formatPrice(minCents, locale)
  const maxFormatted = formatPrice(maxCents, locale)

  return `${minFormatted} - ${maxFormatted}`
}

export function formatPriceIntegerOnly(cents: number, locale: string = 'en-US'): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    throw new TypeError('Cents must be a finite number')
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toDollars(cents))
}

export function parsePriceStrict(input: string): {
  success: boolean
  cents?: number
  error?: string
} {
  if (typeof input !== 'string') {
    return {
      success: false,
      error: 'Input must be a string',
    }
  }

  const trimmed = input.trim()

  if (!trimmed) {
    return {
      success: false,
      error: 'Price is required',
    }
  }

  try {
    const cleaned = trimmed.replace(/[^0-9.-]/g, '')
    const dollars = parseFloat(cleaned)

    if (isNaN(dollars)) {
      return {
        success: false,
        error: `Invalid price format: "${input}"`,
      }
    }

    if (dollars < 0.01) {
      return {
        success: false,
        error: 'Price must be at least $0.01',
      }
    }

    const cents = Math.round(dollars * 100)

    if (cents > 99999999) {
      return {
        success: false,
        error: 'Price cannot exceed $999,999.99',
      }
    }

    return {
      success: true,
      cents,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing price',
    }
  }
}
