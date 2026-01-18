import type { Settings, Theme, GridDensity, ColumnCount } from '../entities/settings'

export function isSettings(obj: unknown): obj is Settings {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const settings = obj as Settings
  return (
    isValidTheme(settings.theme) &&
    isValidGridDensity(settings.gridDensity) &&
    (settings.columnCountOverride === undefined ||
      isValidColumnCount(settings.columnCountOverride)) &&
    (settings.backupReminder === undefined ||
      (typeof settings.backupReminder === 'number' &&
        Number.isInteger(settings.backupReminder)))
  )
}

export function isValidTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function isValidGridDensity(value: unknown): value is GridDensity {
  return value === 'normal' || value === 'compact'
}

export function isValidColumnCount(value: unknown): value is ColumnCount {
  return (
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7 ||
    value === 8
  )
}
