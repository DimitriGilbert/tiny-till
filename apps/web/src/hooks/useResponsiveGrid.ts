import * as React from 'react'

import { useSettingsStore } from '@/stores/settings-store'
import { calculateColumns, getGridGap } from '@tiny-till/types'

export interface UseResponsiveGridReturn {
  columnCount: number
  gridGap: string
  containerClassName: string
  isCompact: boolean
}

export function useResponsiveGrid(): UseResponsiveGridReturn {
  const gridDensity = useSettingsStore((state) => state.gridDensity)
  const columnCountOverride = useSettingsStore((state) => state.columnCountOverride)

  const [columnCount, setColumnCount] = React.useState<number>(6)

  const isCompact = React.useMemo(() => gridDensity === 'compact', [gridDensity])

  const updateColumnCount = React.useCallback(() => {
    const screenWidth = window.innerWidth
    const calculatedColumns = calculateColumns(screenWidth, gridDensity, columnCountOverride)
    setColumnCount(calculatedColumns)
  }, [gridDensity, columnCountOverride])

  React.useEffect(() => {
    updateColumnCount()

    const resizeTimeoutRef: { current: ReturnType<typeof setTimeout> | null } = { current: null }

    const handleResize = () => {
      if (resizeTimeoutRef.current !== null) {
        clearTimeout(resizeTimeoutRef.current)
      }

      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(updateColumnCount)
      }, 150)
    }

    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current !== null) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [updateColumnCount])

  const gridGap = React.useMemo(() => getGridGap(gridDensity), [gridDensity])

  const containerClassName = React.useMemo(() => {
    return `grid-cols-${columnCount}`
  }, [columnCount])

  return React.useMemo(
    () => ({
      columnCount,
      gridGap,
      containerClassName,
      isCompact,
    }),
    [columnCount, gridGap, containerClassName, isCompact],
  )
}
