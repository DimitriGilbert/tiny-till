import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Theme, GridDensity, ColumnCount } from '@tiny-till/types'

interface SettingsState {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride: ColumnCount | undefined
  backupReminder: number | undefined
}

interface SettingsActions {
  setTheme: (theme: Theme) => void
  setGridDensity: (density: GridDensity) => void
  setColumnCountOverride: (count: ColumnCount | undefined) => void
  setBackupReminder: (days: number | undefined) => void
  resetSettings: () => void
}

type SettingsStore = SettingsState & SettingsActions

const initialState: SettingsState = {
  theme: 'system',
  gridDensity: 'normal',
  columnCountOverride: undefined,
  backupReminder: undefined,
}

export const useSettingsStore = create<SettingsStore>()(
  devtools((set) => ({
    ...initialState,

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
  }))
)
