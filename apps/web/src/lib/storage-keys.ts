export const STORAGE_KEYS = {
  CATALOG: 'tiny-till-catalog',
  TALLY: 'tiny-till-tally',
  SETTINGS: 'tiny-till-settings',
  VERSION: 'tiny-till-version',
  LAST_BACKUP_TIMESTAMP: 'tiny-till-last-backup-timestamp',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
