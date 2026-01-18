export function toCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function toDollars(cents: number): number {
  return cents / 100
}

export function formatPrice(cents: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDollars(cents))
}

export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.-]/g, '')
  const dollars = parseFloat(cleaned)
  if (isNaN(dollars)) {
    throw new Error('Invalid price format')
  }
  return toCents(dollars)
}
