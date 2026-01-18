import type { Theme } from '@tiny-till/types'
import { STORAGE_KEYS } from './storage-keys'

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeToDOM(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const body = document.body

  if (theme === 'dark') {
    root.classList.add('dark')
    body.classList.add('dark')
  } else {
    root.classList.remove('dark')
    body.classList.remove('dark')
  }
}

export function removeThemeFromDOM(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const body = document.body

  root.classList.remove('dark')
  body.classList.remove('dark')
}

export function migrateLegacyTheme(): Theme | null {
  if (typeof window === 'undefined') return null

  try {
    const legacyTheme = localStorage.getItem(STORAGE_KEYS.LEGACY_THEME)
    if (!legacyTheme) return null

    const parsedTheme = JSON.parse(legacyTheme) as Theme
    if (parsedTheme === 'light' || parsedTheme === 'dark' || parsedTheme === 'system') {
      localStorage.removeItem(STORAGE_KEYS.LEGACY_THEME)
      return parsedTheme
    }

    return null
  } catch {
    return null
  }
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export function setupSystemThemeListener(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (event: MediaQueryListEvent) => {
    const isDark = event.matches
    callback(isDark ? 'dark' : 'light')
  }

  mediaQuery.addEventListener('change', handleChange)

  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
}
