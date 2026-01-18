import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useEffect } from 'react'

import type { Theme } from '@tiny-till/types'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import {
  getSystemTheme,
  applyThemeToDOM,
  migrateLegacyTheme,
  resolveTheme,
  setupSystemThemeListener,
} from '@/lib/theme-utils'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  isHydrated: boolean
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  resetToSystem: () => void
  _applyTheme: (theme: 'light' | 'dark') => void
  _syncSystemTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const initialState: Omit<ThemeState, 'isHydrated'> = {
  theme: 'system',
  resolvedTheme: 'light',
}

const calculateResolvedTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        isHydrated: false,

        setTheme: (theme: Theme) => {
          const resolvedTheme = calculateResolvedTheme(theme)
          set({ theme, resolvedTheme })
          applyThemeToDOM(resolvedTheme)
        },

        toggleTheme: () => {
          const { theme } = get()
          const nextTheme: Theme =
            theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
          get().setTheme(nextTheme)
        },

        resetToSystem: () => {
          const resolvedTheme = getSystemTheme()
          set({ theme: 'system', resolvedTheme })
          applyThemeToDOM(resolvedTheme)
        },

        _applyTheme: (theme: 'light' | 'dark') => {
          set({ resolvedTheme: theme })
          applyThemeToDOM(theme)
        },

        _syncSystemTheme: () => {
          const { theme } = get()
          if (theme === 'system') {
            const resolvedTheme = getSystemTheme()
            set({ resolvedTheme })
            applyThemeToDOM(resolvedTheme)
          }
        },
      }),
      {
        name: STORAGE_KEYS.THEME,
        partialize: (state) => ({
          theme: state.theme,
        }),
        onRehydrateStorage: () => async (state: ThemeStore | undefined, error?: unknown) => {
          if (error) {
            console.error('[ThemeStore] Rehydration failed:', error)
            return
          }

          if (state) {
            const migratedTheme = migrateLegacyTheme()
            if (migratedTheme) {
              state.theme = migratedTheme
            }

            const resolvedTheme = calculateResolvedTheme(state.theme)
            state.resolvedTheme = resolvedTheme
            state.isHydrated = true

            applyThemeToDOM(resolvedTheme)

            console.log('[ThemeStore] Hydration complete', {
              theme: state.theme,
              resolvedTheme,
            })
          }
        },
      }
    )
  )
)

export function useSystemThemeSync() {
  const theme = useThemeStore((state) => state.theme)
  const syncSystemTheme = useThemeStore((state) => state._syncSystemTheme)

  useEffect(() => {
    if (theme !== 'system') return

    const cleanup = setupSystemThemeListener(() => {
      syncSystemTheme()
    })

    return cleanup
  }, [theme, syncSystemTheme])
}

export function useTheme() {
  return {
    theme: useThemeStore((state) => state.theme),
    resolvedTheme: useThemeStore((state) => state.resolvedTheme),
    setTheme: useThemeStore((state) => state.setTheme),
    toggleTheme: useThemeStore((state) => state.toggleTheme),
    resetToSystem: useThemeStore((state) => state.resetToSystem),
    isHydrated: useThemeStore((state) => state.isHydrated),
  }
}
