import * as React from 'react'

import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { GridDensity } from '@tiny-till/types'
import { getGridGap, getGridGapValue, getItemSize } from '@tiny-till/types'

interface GridDensityPreviewCardProps {
  density: GridDensity
  isActive: boolean
  onClick?: () => void
  className?: string
}

export function GridDensityPreviewCard({
  density,
  isActive,
  onClick,
  className,
}: GridDensityPreviewCardProps) {
  const [columnCount, setColumnCount] = React.useState(4)

  React.useEffect(() => {
    const updateColumns = () => {
      const screenWidth = window.innerWidth
      const gap = getGridGapValue(density)
      const itemSize = getItemSize(density)
      const containerWidth = Math.min(screenWidth - 32, 600)
      const itemWidth = itemSize + gap
      const columns = Math.floor(containerWidth / itemWidth)
      setColumnCount(Math.max(2, Math.min(8, columns)))
    }

    updateColumns()

    const resizeTimeoutRef: { current: ReturnType<typeof setTimeout> | null } = { current: null }

    const handleResize = () => {
      if (resizeTimeoutRef.current !== null) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(updateColumns)
      }, 150)
    }

    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current !== null) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [density])

  const gapClass = getGridGap(density)
  const itemSize = getItemSize(density)
  const itemsToShow = Math.min(12, columnCount * 2)

  const previewItems = React.useMemo(() => 
    Array.from({ length: itemsToShow }, (_, i) => ({
      id: `preview-item-${Date.now()}-${i}`,
      index: i,
    })),
  [itemsToShow])

  return (
    <Card
      size="sm"
      className={cn(
        'cursor-pointer transition-all hover:border-accent/50 hover:shadow-md',
        isActive ? 'border-accent bg-accent/5 shadow-md' : 'border-border',
        className,
      )}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{density === 'normal' ? 'Normal' : 'Compact'}</span>
          {isActive && (
            <span className="text-xs font-normal text-accent">
              Active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'grid',
            gapClass,
            `grid-cols-${Math.min(columnCount, 6)}`,
          )}
          style={{
            gridTemplateColumns: `repeat(${Math.min(columnCount, 6)}, minmax(0, 1fr))`,
          }}
        >
          {previewItems.map((item) => (
            <div
              key={item.id}
              className="rounded-sm bg-muted"
              style={{
                aspectRatio: '1',
                minHeight: `${Math.min(itemSize, 40)}px`,
                maxHeight: '40px',
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{columnCount} columns</span>
          <span>{itemSize}px items</span>
        </div>
      </CardContent>
    </Card>
  )
}
