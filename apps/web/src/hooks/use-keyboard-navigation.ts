import * as React from 'react'

interface UseKeyboardNavigationProps<T> {
  items: T[]
  itemId: (item: T) => string
  onItemSelect?: (item: T) => void
  getItemElement?: (id: string) => HTMLElement | null
  columnCount: number
  enabled?: boolean
}

export function useKeyboardNavigation<T>(props: UseKeyboardNavigationProps<T>) {
  const {
    items,
    itemId,
    onItemSelect,
    getItemElement,
    columnCount,
    enabled = true,
  } = props

  const [focusedItemId, setFocusedItemId] = React.useState<string | null>(null)

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || items.length === 0) return

      const currentIndex = items.findIndex((item) => itemId(item) === focusedItemId)

      let newIndex = currentIndex

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          newIndex = Math.min(currentIndex + columnCount, items.length - 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          newIndex = Math.max(currentIndex - columnCount, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          newIndex = Math.min(currentIndex + 1, items.length - 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          newIndex = Math.max(currentIndex - 1, 0)
          break
        case 'Home':
          e.preventDefault()
          newIndex = 0
          break
        case 'End':
          e.preventDefault()
          newIndex = items.length - 1
          break
        case 'Enter':
        case ' ':
          if (focusedItemId && currentIndex >= 0 && onItemSelect) {
            e.preventDefault()
            onItemSelect(items[currentIndex])
          }
          return
        default:
          return
      }

      if (newIndex >= 0 && newIndex !== currentIndex) {
        setFocusedItemId(itemId(items[newIndex]))

        const element = getItemElement?.(itemId(items[newIndex]))
        if (element) {
          element.focus()
        }
      }
    },
    [enabled, items, itemId, focusedItemId, columnCount, onItemSelect, getItemElement]
  )

  React.useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  return {
    focusedItemId,
    setFocusedItemId,
  }
}
