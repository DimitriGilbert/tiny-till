import { useEffect } from 'react'

export type KeyboardShortcut = {
  keys: string[]
  description: string
  handler: (event: KeyboardEvent) => void
  preventDefault?: boolean
}

export const SHORTCUTS = {
  NAVIGATION: {
    HOME: ['1'],
    TALLY: ['1'],
    SETTINGS: ['2'],
  },
  ACTIONS: {
    CLEAR_CART: ['Delete', 'Backspace'],
    SEARCH_PRODUCTS: ['f'],
  },
  DIALOG: {
    CLOSE: ['Escape'],
    CONFIRM: ['Enter'],
  },
  GRID: {
    UP: ['ArrowUp'],
    DOWN: ['ArrowDown'],
    LEFT: ['ArrowLeft'],
    RIGHT: ['ArrowRight'],
    HOME: ['Home'],
    END: ['End'],
    PAGE_UP: ['PageUp'],
    PAGE_DOWN: ['PageDown'],
  },
} as const

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut.keys)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.handler(event)
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

function matchesShortcut(event: KeyboardEvent, keys: string[]): boolean {
  const isMetaOrCtrl = event.ctrlKey || event.metaKey

  const keyMatches = keys.some((key) => {
    switch (key) {
      case 'Delete':
      case 'Backspace':
      case 'Enter':
      case 'Escape':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        return event.key === key
      default:
        return event.key.toLowerCase() === key.toLowerCase()
    }
  })

  return keyMatches
}

export function getShortcutLabel(keys: string[]): string {
  return keys
    .map((key) => {
      if (key === 'Control' || key === 'Ctrl') return 'Ctrl'
      if (key === 'Meta') return '⌘'
      if (key === 'Delete') return 'Del'
      if (key === 'Escape') return 'Esc'
      if (key === 'ArrowUp') return '↑'
      if (key === 'ArrowDown') return '↓'
      if (key === 'ArrowLeft') return '←'
      if (key === 'ArrowRight') return '→'
      if (key === 'PageUp') return 'PgUp'
      if (key === 'PageDown') return 'PgDn'
      return key
    })
    .join(' + ')
}

export function isModifierKey(event: KeyboardEvent): boolean {
  return event.key === 'Control' || event.key === 'Meta' || event.key === 'Alt' || event.key === 'Shift'
}

export function isGridNavigationKey(event: KeyboardEvent): boolean {
  const key = event.key as string
  return SHORTCUTS.GRID.UP.includes(key as any) ||
    SHORTCUTS.GRID.DOWN.includes(key as any) ||
    SHORTCUTS.GRID.LEFT.includes(key as any) ||
    SHORTCUTS.GRID.RIGHT.includes(key as any) ||
    SHORTCUTS.GRID.HOME.includes(key as any) ||
    SHORTCUTS.GRID.END.includes(key as any) ||
    SHORTCUTS.GRID.PAGE_UP.includes(key as any) ||
    SHORTCUTS.GRID.PAGE_DOWN.includes(key as any)
}
