import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import type { Product } from '@tiny-till/types'
import type { VirtualGridOptions, UseVirtualGridReturn } from '@/types/virtual-grid'

const SCROLL_POSITION_KEY = 'catalog-scroll-position'

function saveScrollPosition(scrollTop: number) {
  sessionStorage.setItem(SCROLL_POSITION_KEY, scrollTop.toString())
}

function restoreScrollPosition(): number | null {
  const saved = sessionStorage.getItem(SCROLL_POSITION_KEY)
  return saved ? parseInt(saved, 10) : null
}

export function useVirtualGrid(options: VirtualGridOptions): UseVirtualGridReturn {
  const { items, columnCount, estimatedItemHeight, overscan = 3 } = options

  const containerRef = React.useRef<HTMLDivElement>(null)

  const totalRows = React.useMemo(() => {
    return Math.ceil(items.length / columnCount)
  }, [items.length, columnCount])

  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan,
  })

  const getRowProducts = React.useCallback(
    (rowIndex: number): Product[] => {
      const startIndex = rowIndex * columnCount
      const endIndex = Math.min(startIndex + columnCount, items.length)
      return items.slice(startIndex, endIndex)
    },
    [items, columnCount]
  )

  React.useEffect(() => {
    if (containerRef.current) {
      const savedPosition = restoreScrollPosition()
      if (savedPosition !== null) {
        containerRef.current.scrollTop = savedPosition
        sessionStorage.removeItem(SCROLL_POSITION_KEY)
      }
    }
  }, [])

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    saveScrollPosition(event.currentTarget.scrollTop)
  }, [])

  React.useEffect(() => {
    const container = containerRef.current
    if (container) {
      const scrollHandler = (event: Event) => {
        handleScroll(event as unknown as React.UIEvent<HTMLDivElement>)
      }
      container.addEventListener('scroll', scrollHandler)
      return () => {
        container.removeEventListener('scroll', scrollHandler)
      }
    }
  }, [handleScroll])

  const resizeDeps = React.useMemo(
    () => `${columnCount}-${estimatedItemHeight}-${items.length}-${totalRows}`,
    [columnCount, estimatedItemHeight, items.length, totalRows]
  )

  React.useEffect(() => {
    rowVirtualizer.scrollToIndex(0)
  }, [resizeDeps, rowVirtualizer])  

  return {
    containerRef,
    rowVirtualizer: {
      getVirtualItems: rowVirtualizer.getVirtualItems,
      scrollToIndex: rowVirtualizer.scrollToIndex,
      measure: rowVirtualizer.measure,
    },
    totalRows,
    getRowProducts,
  }
}
