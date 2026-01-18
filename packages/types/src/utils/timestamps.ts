export type Timestamp = number

export function getCurrentTimestamp(): Timestamp {
  return Date.now()
}

export function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'number' && value > 0 && Number.isInteger(value)
}

export function formatTimestamp(ts: Timestamp): string {
  return new Date(ts).toISOString()
}

export function parseTimestamp(isoString: string): Timestamp {
  return new Date(isoString).getTime()
}
