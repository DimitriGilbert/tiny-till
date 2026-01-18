import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type { Theme, GridDensity, ColumnCount } from '@tiny-till/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { withHydrationTracking } from '@/lib/persist-middleware'

interface SettingsState {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride: ColumnCount | undefined
  backupReminder: number | undefined
  hasHydrated: boolean
}

interface SettingsActions {
  setTheme: (theme: Theme) => void
  setGridDensity: (density: GridDensity) => void
  setColumnCountOverride: (count: ColumnCount | undefined) => void
  setBackupReminder: (days: number | undefined) => void
  resetSettings: () => void
}

type SettingsStore = SettingsState & SettingsActions

const initialState: Omit<SettingsState, 'hasHydrated'> = {
  theme: 'system',
  gridDensity: 'normal',
  columnCountOverride: undefined,
  backupReminder: undefined,
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        hasHydrated: false,

        setTheme: (theme: Theme) => {
          set({ theme })
          console.log('[SettingsStore] setTheme', { theme })
        },

        setGridDensity: (density: GridDensity) => {
          set({ gridDensity: density })
          console.log('[SettingsStore] setGridDensity', { gridDensity: density })
        },

        setColumnCountOverride: (count: ColumnCount | undefined) => {
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

        resetSettings: () => {
          set({
            ...initialState,
          })
          console.log('[SettingsStore] resetSettings', initialState)
        },
      }),
      {
        name: STORAGE_KEYS.SETTINGS,
        onRehydrateStorage: () => (state: SettingsStore | undefined, error?: unknown) => {
          if (error) {
            console.error('[SettingsStore] Rehydration failed:', error)
            return
          }
          if (state) {
            state.hasHydrated = true
            console.log('[SettingsStore] Hydration complete')
          }
        },
      }
    )
  )
)
