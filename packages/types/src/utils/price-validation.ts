export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PriceValidationResult extends ValidationResult {
  value?: number
  originalInput?: string
}

export type FloatingPointIssue =
  | { type: 'precision_loss'; actual: number; expected: number }
  | { type: 'rounding_needed'; input: string; rounded: number }
  | { type: 'overflow'; value: number }

const DEFAULT_MIN_CENTS = 1
const DEFAULT_MAX_CENTS = 99_999_999

export function isValidPriceRange(
  cents: number,
  min: number = DEFAULT_MIN_CENTS,
  max: number = DEFAULT_MAX_CENTS
): boolean {
  return (
    typeof cents === 'number' &&
    Number.isInteger(cents) &&
    cents >= min &&
    cents <= max
  )
}

export function validatePriceRange(
  cents: number,
  min: number = DEFAULT_MIN_CENTS,
  max: number = DEFAULT_MAX_CENTS
): ValidationResult {
  const errors: string[] = []

  if (typeof cents !== 'number') {
    errors.push('Price must be a number')
    return { isValid: false, errors }
  }

  if (!Number.isInteger(cents)) {
    errors.push('Price must be a whole number of cents')
  }

  if (cents < min) {
    errors.push(`Price must be at least $${(min / 100).toFixed(2)}`)
  }

  if (cents > max) {
    errors.push(`Price cannot exceed $${(max / 100).toLocaleString()}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function isValidPriceFormat(input: string): boolean {
  if (typeof input !== 'string') {
    return false
  }

  const patterns = [
    /^\$?\s*\d+(\.\d{1,2})?$/,
    /^\$?\s*\d{1,3}(,\d{3})*(\.\d{1,2})?$/,
  ]

  return patterns.some((pattern) => pattern.test(input.trim()))
}

export function sanitizePriceInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  let sanitized = input.trim()

  sanitized = sanitized.replace(/[^\d.,-]/g, '')

  const decimalParts = sanitized.split(/[.,]/)
  if (decimalParts.length > 2) {
    sanitized = `${decimalParts.slice(0, -1).join('.')}.${decimalParts[decimalParts.length - 1]}`
  }

  const minusCount = (sanitized.match(/-/g) || []).length
  if (minusCount > 1) {
    sanitized = sanitized.replace(/-/g, '')
  } else if (minusCount === 1) {
    const minusIndex = sanitized.indexOf('-')
    if (minusIndex !== 0) {
      sanitized = sanitized.replace(/-/g, '')
    }
  }

  return sanitized
}

export function detectFloatingPointIssues(value: number): FloatingPointIssue | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { type: 'overflow', value }
  }

  const cents = value * 100
  const rounded = Math.round(cents)

  if (Math.abs(cents - rounded) > 0) {
    return {
      type: 'precision_loss',
      actual: cents,
      expected: rounded,
    }
  }

  return null
}

export function inPriceRange(
  cents: number,
  minCents: number,
  maxCents: number
): boolean {
  return cents >= minCents && cents <= maxCents
}

export function clampPrice(
  cents: number,
  minCents: number,
  maxCents: number
): number {
  return Math.min(Math.max(cents, minCents), maxCents)
}

export function getPriceRangePercent(
  priceCents: number,
  minCents: number,
  maxCents: number
): number {
  if (minCents === maxCents) {
    return priceCents >= maxCents ? 100 : 0
  }
  const percent = ((priceCents - minCents) / (maxCents - minCents)) * 100
  return Math.max(0, Math.min(100, percent))
}

export function interpolatePrice(
  percent: number,
  minCents: number,
  maxCents: number
): number {
  const clampedPercent = Math.max(0, Math.min(100, percent))
  return Math.round(minCents + (clampedPercent / 100) * (maxCents - minCents))
}

export function sanitizeCents(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value >= DEFAULT_MIN_CENTS && value <= DEFAULT_MAX_CENTS) {
      return value
    }
    return null
  }

  if (typeof value === 'string') {
    const sanitized = sanitizePriceInput(value)
    try {
      const parsed = parseFloat(sanitized)
      if (!isNaN(parsed)) {
        const cents = Math.round(parsed * 100)
        if (cents >= DEFAULT_MIN_CENTS && cents <= DEFAULT_MAX_CENTS) {
          return cents
        }
      }
    } catch {
      return null
    }
  }

  return null
}

export function sanitizePriceInputString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  let sanitized = input.trim()

  sanitized = sanitized.replace(/[^\d.,$€£¥]/g, '')

  const decimalParts = sanitized.split(/[.,]/)
  if (decimalParts.length > 2) {
    const integerPart = decimalParts.slice(0, -1).join('')
    const decimalPart = decimalParts[decimalParts.length - 1]
    sanitized = `${integerPart}.${decimalPart}`
  }

  if (decimalParts.length === 2) {
    const integerPart = decimalParts[0]?.replace(/[.,]/g, '') ?? ''
    const decimalPart = decimalParts[1]?.slice(0, 2) ?? ''
    sanitized = `${integerPart}.${decimalPart}`
  }

  return sanitized
}

export interface GuardOptions {
  allowNegative?: boolean
  allowZero?: boolean
  minCents?: number
  maxCents?: number
  defaultValue?: number
}

export interface GuardResult {
  isValid: boolean
  value: number | null
  error?: string
}

export function guardPriceValue(
  value: unknown,
  options: GuardOptions = {}
): GuardResult {
  const {
    allowNegative = false,
    allowZero = false,
    minCents = allowNegative ? -DEFAULT_MAX_CENTS : allowZero ? 0 : DEFAULT_MIN_CENTS,
    maxCents = DEFAULT_MAX_CENTS,
    defaultValue,
  } = options

  const sanitized = sanitizeCents(value)

  if (sanitized === null) {
    if (defaultValue !== undefined) {
      return {
        isValid: true,
        value: defaultValue,
      }
    }
    return {
      isValid: false,
      value: null,
      error: 'Invalid price format',
    }
  }

  if (sanitized < minCents) {
    if (defaultValue !== undefined) {
      return {
        isValid: true,
        value: defaultValue,
        error: `Price must be at least $${(minCents / 100).toFixed(2)}`,
      }
    }
    return {
      isValid: false,
      value: null,
      error: `Price must be at least $${(minCents / 100).toFixed(2)}`,
    }
  }

  if (sanitized > maxCents) {
    if (defaultValue !== undefined) {
      return {
        isValid: true,
        value: defaultValue,
        error: `Price cannot exceed $${(maxCents / 100).toLocaleString()}`,
      }
    }
    return {
      isValid: false,
      value: null,
      error: `Price cannot exceed $${(maxCents / 100).toLocaleString()}`,
    }
  }

  return {
    isValid: true,
    value: sanitized,
  }
}

export function safeToCents(dollars: number): number {
  if (typeof dollars !== 'number' || !Number.isFinite(dollars)) {
    throw new Error('Input must be a finite number')
  }

  const issue = detectFloatingPointIssues(dollars)
  if (issue && issue.type === 'precision_loss') {
    throw new Error(
      `Floating-point precision loss detected: ${dollars} → ${issue.actual} cents (expected ${issue.expected} cents)`
    )
  }

  if (issue && issue.type === 'overflow') {
    throw new Error(`Price value ${dollars} is too large to convert to cents`)
  }

  const cents = Math.round(dollars * 100)

  if (!Number.isSafeInteger(cents)) {
    throw new Error(`Converted cents value ${cents} is not a safe integer`)
  }

  return cents
}

export function safeMultiply(cents: number, quantity: number): number {
  if (typeof cents !== 'number' || !Number.isInteger(cents)) {
    throw new Error('Price in cents must be an integer')
  }

  if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
    throw new Error('Quantity must be a finite number')
  }

  const result = Math.round(cents * quantity)

  if (!Number.isSafeInteger(result)) {
    throw new Error(`Multiplication result ${result} is not a safe integer`)
  }

  return result
}

export function safeAddPrices(prices: number[]): number {
  if (!Array.isArray(prices)) {
    throw new Error('Prices must be an array')
  }

  for (const price of prices) {
    if (typeof price !== 'number' || !Number.isInteger(price)) {
      throw new Error('All prices must be integer cents')
    }
  }

  const sum = prices.reduce((acc, price) => acc + price, 0)

  if (!Number.isSafeInteger(sum)) {
    throw new Error(`Sum ${sum} is not a safe integer`)
  }

  return sum
}

export function detectPrecisionError(dollars: number): boolean {
  const issue = detectFloatingPointIssues(dollars)
  return issue !== null && issue.type === 'precision_loss'
}

export class PriceError extends Error {
  constructor(
    message: string,
    public code: PriceErrorCode,
    public originalValue?: unknown
  ) {
    super(message)
    this.name = 'PriceError'
  }
}

export type PriceErrorCode =
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'INVALID_TYPE'
  | 'PRECISION_LOSS'
  | 'NEGATIVE_VALUE'
  | 'ZERO_VALUE'
  | 'PARSE_ERROR'

export function createPriceError(
  code: PriceErrorCode,
  value: unknown,
  context?: string
): PriceError {
  const messages: Record<PriceErrorCode, string> = {
    INVALID_FORMAT: 'Invalid price format',
    OUT_OF_RANGE: 'Price is out of valid range',
    INVALID_TYPE: 'Price must be a number',
    PRECISION_LOSS: 'Floating-point precision loss detected',
    NEGATIVE_VALUE: 'Price cannot be negative',
    ZERO_VALUE: 'Price cannot be zero',
    PARSE_ERROR: 'Failed to parse price',
  }

  const message = context ? `${messages[code]}: ${context}` : messages[code]

  return new PriceError(message, code, value)
}

export function validatePriceStrict(input: string): PriceValidationResult {
  const errors: string[] = []

  if (typeof input !== 'string') {
    errors.push('Price must be a string')
    return { isValid: false, errors }
  }

  const trimmed = input.trim()

  if (!trimmed) {
    errors.push('Price is required')
    return { isValid: false, errors }
  }

  if (!isValidPriceFormat(trimmed)) {
    errors.push(
      'Invalid price format. Examples: $10.50, 10.50, $1,234.56, 10'
    )
    return { isValid: false, errors }
  }

  try {
    const sanitized = sanitizePriceInput(trimmed)
    const parsed = parseFloat(sanitized)

    if (isNaN(parsed)) {
      errors.push(`Could not parse price from: "${input}"`)
      return { isValid: false, errors, originalInput: input }
    }

    if (parsed < 0.01) {
      errors.push('Price must be at least $0.01')
      return { isValid: false, errors, originalInput: input }
    }

    const cents = Math.round(parsed * 100)

    if (cents > DEFAULT_MAX_CENTS) {
      errors.push(
        `Price cannot exceed $${(DEFAULT_MAX_CENTS / 100).toLocaleString()}`
      )
      return { isValid: false, errors, originalInput: input }
    }

    const issue = detectFloatingPointIssues(parsed)
    if (issue && issue.type === 'precision_loss') {
      const roundedCents = Math.round(parsed * 100)
      errors.push(
        `Price rounded from $${parsed.toFixed(4)} to $${(roundedCents / 100).toFixed(2)}`
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: cents,
      originalInput: input,
    }
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : 'Unknown error parsing price'
    )
    return { isValid: false, errors, originalInput: input }
  }
}
