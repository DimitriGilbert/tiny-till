import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type { GridDensity, ColumnCount, Currency, Locale } from '@tiny-till/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { withHydrationTracking } from '@/lib/persist-middleware'
import { checkSettingsIntegrity } from '@/lib/data-integrity'
import {
  validateSettingsUpdate,
  validateGridDensityChange,
  validateColumnCountChange,
} from '@/lib/validation-helpers'

interface SettingsState {
  gridDensity: GridDensity
  columnCountOverride: ColumnCount | undefined
  backupReminder: number | undefined
  currency: Currency
  locale: Locale
  hasHydrated: boolean
  hasUnsavedChanges: boolean
  changedSettings: Array<keyof Omit<SettingsState, 'hasHydrated' | 'hasUnsavedChanges' | 'changedSettings'>>
}

interface SettingsActions {
  setGridDensity: (density: GridDensity) => void
  setColumnCountOverride: (count: ColumnCount | undefined) => void
  setBackupReminder: (days: number | undefined) => void
  setCurrency: (currency: Currency) => void
  setLocale: (locale: Locale) => void
  resetSettings: () => void
  markAsSaved: () => void
  getChangedSettings: () => Array<keyof Omit<SettingsState, 'hasHydrated' | 'hasUnsavedChanges' | 'changedSettings'>>
}

type SettingsStore = SettingsState & SettingsActions

const initialState: Omit<SettingsState, 'hasHydrated' | 'hasUnsavedChanges' | 'changedSettings'> = {
  gridDensity: 'normal',
  columnCountOverride: undefined,
  backupReminder: 168,
  currency: 'USD',
  locale: 'en-US',
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        hasHydrated: false,
        hasUnsavedChanges: false,
        changedSettings: [],

        setGridDensity: async (density: GridDensity) => {
          const validation = await validateGridDensityChange(density)
          if (!validation.isValid) {
            console.warn('[SettingsStore] Validation failed:', validation.error)
            throw new Error(validation.error || 'Invalid grid density')
          }
          const state = get()
          const changedSettings = [...state.changedSettings]
          if (!changedSettings.includes('gridDensity')) {
            changedSettings.push('gridDensity')
          }
          set({
            gridDensity: density,
            hasUnsavedChanges: true,
            changedSettings,
          })
          console.log('[SettingsStore] setGridDensity', { gridDensity: density })
        },

        setColumnCountOverride: async (count: ColumnCount | undefined) => {
          const validation = await validateColumnCountChange(count)
          if (!validation.isValid) {
            console.warn('[SettingsStore] Validation failed:', validation.error)
            throw new Error(validation.error || 'Invalid column count')
          }
          const state = get()
          const changedSettings = [...state.changedSettings]
          if (!changedSettings.includes('columnCountOverride')) {
            changedSettings.push('columnCountOverride')
          }
          set({
            columnCountOverride: count,
            hasUnsavedChanges: true,
            changedSettings,
          })
          console.log('[SettingsStore] setColumnCountOverride', { columnCountOverride: count })
        },

        setBackupReminder: (days: number | undefined) => {
          if (days !== undefined && days < 0) {
            throw new Error('Backup reminder days must be non-negative')
          }
          const state = get()
          const changedSettings = [...state.changedSettings]
          if (!changedSettings.includes('backupReminder')) {
            changedSettings.push('backupReminder')
          }
          set({
            backupReminder: days,
            hasUnsavedChanges: true,
            changedSettings,
          })
          console.log('[SettingsStore] setBackupReminder', { backupReminder: days })
        },

        setCurrency: (currency: Currency) => {
          const state = get()
          const changedSettings = [...state.changedSettings]
          if (!changedSettings.includes('currency')) {
            changedSettings.push('currency')
          }
          set({
            currency,
            hasUnsavedChanges: true,
            changedSettings,
          })
          console.log('[SettingsStore] setCurrency', { currency })
        },

        setLocale: (locale: Locale) => {
          const state = get()
          const changedSettings = [...state.changedSettings]
          if (!changedSettings.includes('locale')) {
            changedSettings.push('locale')
          }
          set({
            locale,
            hasUnsavedChanges: true,
            changedSettings,
          })
          console.log('[SettingsStore] setLocale', { locale })
        },

        resetSettings: () => {
          set({
            ...initialState,
            hasHydrated: true,
            hasUnsavedChanges: false,
            changedSettings: [],
          })
          console.log('[SettingsStore] resetSettings', initialState)
        },

        markAsSaved: () => {
          set({
            hasUnsavedChanges: false,
            changedSettings: [],
          })
          console.log('[SettingsStore] markAsSaved')
        },

        getChangedSettings: () => {
          const state = get()
          const changed: Array<keyof Omit<SettingsState, 'hasHydrated' | 'hasUnsavedChanges' | 'changedSettings'>> = []

          for (const key of Object.keys(initialState) as Array<keyof Omit<SettingsState, 'hasHydrated' | 'hasUnsavedChanges' | 'changedSettings'>>) {
            if (state[key] !== initialState[key]) {
              changed.push(key)
            }
          }

          return changed
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
