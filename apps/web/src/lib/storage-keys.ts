export const STORAGE_KEYS = {
  CATALOG: 'tiny-till-catalog',
  TALLY: 'tiny-till-tally',
  SETTINGS: 'tiny-till-settings',
  THEME: 'tiny-till-theme',
  VERSION: 'tiny-till-version',
  LAST_BACKUP_TIMESTAMP: 'tiny-till-last-backup-timestamp',
  LEGACY_THEME: 'vite-ui-theme',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
