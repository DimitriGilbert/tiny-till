export type Theme = 'light' | 'dark' | 'system'
export type GridDensity = 'normal' | 'compact'
export type ColumnCount = 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Settings {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride?: ColumnCount
  backupReminder?: number
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
