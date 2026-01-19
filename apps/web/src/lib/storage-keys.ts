export const STORAGE_KEYS = {
  CATALOG: 'tiny-till-catalog',
  TALLY: 'tiny-till-tally',
  SETTINGS: 'tiny-till-settings',
  THEME: 'tiny-till-theme',
  VERSION: 'tiny-till-version',
  LAST_BACKUP_TIMESTAMP: 'tiny-till-last-backup-timestamp',
  LEGACY_THEME: 'vite-ui-theme',
  ONBOARDING_COMPLETED: 'tiny-till-onboarding-completed',
  ONBOARDING_CURRENT_STEP: 'tiny-till-onboarding-current-step',
  ONBOARDING_SKIPPED: 'tiny-till-onboarding-skipped',
  ONBOARDING_ANALYTICS: 'tiny-till-onboarding-analytics',
  ONBOARDING_VERSION: 'tiny-till-onboarding-version',
  HELP: 'tiny-till-help',
  FEEDBACK: 'tiny-till-feedback',
  FEATURE_VOTES: 'tiny-till-feature-votes',
  SUPPORT_TICKETS: 'tiny-till-support-tickets',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
