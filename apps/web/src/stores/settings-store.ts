import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type { Theme, GridDensity, ColumnCount, Currency, Locale } from '@tiny-till/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { withHydrationTracking } from '@/lib/persist-middleware'
import { checkSettingsIntegrity } from '@/lib/data-integrity'
import {
  validateSettingsUpdate,
  validateThemeChange,
  validateGridDensityChange,
  validateColumnCountChange,
} from '@/lib/validation-helpers'

interface SettingsState {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride: ColumnCount | undefined
  backupReminder: number | undefined
  currency: Currency
  locale: Locale
  hasHydrated: boolean
}

interface SettingsActions {
  setTheme: (theme: Theme) => void
  setGridDensity: (density: GridDensity) => void
  setColumnCountOverride: (count: ColumnCount | undefined) => void
  setBackupReminder: (days: number | undefined) => void
  setCurrency: (currency: Currency) => void
  setLocale: (locale: Locale) => void
  resetSettings: () => void
}

type SettingsStore = SettingsState & SettingsActions

const initialState: Omit<SettingsState, 'hasHydrated'> = {
  theme: 'system',
  gridDensity: 'normal',
  columnCountOverride: undefined,
  backupReminder: 168,
  currency: 'USD',
  locale: 'en-US',
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        hasHydrated: false,

        setTheme: async (theme: Theme) => {
          const validation = await validateThemeChange(theme)
          if (!validation.isValid) {
            console.warn('[SettingsStore] Validation failed:', validation.error)
            throw new Error(validation.error || 'Invalid theme')
          }
          set({ theme })
          console.log('[SettingsStore] setTheme', { theme })
        },

        setGridDensity: async (density: GridDensity) => {
          const validation = await validateGridDensityChange(density)
          if (!validation.isValid) {
            console.warn('[SettingsStore] Validation failed:', validation.error)
            throw new Error(validation.error || 'Invalid grid density')
          }
          set({ gridDensity: density })
          console.log('[SettingsStore] setGridDensity', { gridDensity: density })
        },

        setColumnCountOverride: async (count: ColumnCount | undefined) => {
          const validation = await validateColumnCountChange(count)
          if (!validation.isValid) {
            console.warn('[SettingsStore] Validation failed:', validation.error)
            throw new Error(validation.error || 'Invalid column count')
          }
          set({ columnCountOverride: count })
          console.log('[SettingsStore] setColumnCountOverride', { columnCountOverride: count })
        },

        setBackupReminder: (days: number | undefined) => {
          if (days !== undefined && days < 0) {
            throw new Error('Backup reminder days must be non-negative')
          }
          set({ backupReminder: days })
          console.log('[SettingsStore] setBackupReminder', { backupReminder: days })
        },

        setCurrency: (currency: Currency) => {
          set({ currency })
          console.log('[SettingsStore] setCurrency', { currency })
        },

        setLocale: (locale: Locale) => {
          set({ locale })
          console.log('[SettingsStore] setLocale', { locale })
        },

        resetSettings: () => {
          set({
            ...initialState,
          })
          console.log('[SettingsStore] resetSettings', initialState)
        },
      }),
      {
        name: STORAGE_KEYS.SETTINGS,
        onRehydrateStorage: () => async (state: SettingsStore | undefined, error?: unknown) => {
          if (error) {
            console.error('[SettingsStore] Rehydration failed:', error)
            return
          }
          if (state) {
            state.hasHydrated = true
            console.log('[SettingsStore] Hydration complete')

            try {
              const integrityReport = await checkSettingsIntegrity()
              if (!integrityReport.isValid) {
                console.warn('[SettingsStore] Integrity issues:', integrityReport.issues)
              }
            } catch (integrityError) {
              console.error('[SettingsStore] Integrity check failed:', integrityError)
            }
          }
        },
      }
    )
  )
)
