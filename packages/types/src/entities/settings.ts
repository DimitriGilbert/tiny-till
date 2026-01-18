export type Theme = 'light' | 'dark' | 'system'
export type GridDensity = 'normal' | 'compact'
export type ColumnCount = 2 | 3 | 4 | 5 | 6 | 7 | 8
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD'
export type Locale = string

export interface Settings {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride?: ColumnCount
  backupReminder?: number
  currency?: Currency
  locale?: Locale
}

export interface GridConfig {
  density: GridDensity
  columnOverride?: ColumnCount
  screenWidth: number
}

export interface GridResult {
  columns: number
  isOverridden: boolean
}
