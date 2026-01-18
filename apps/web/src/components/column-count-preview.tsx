import * as React from 'react'

import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { GridDensity } from '@tiny-till/types'
import { calculateColumns, getGridGap, getGridGapValue, getItemSize } from '@tiny-till/types'

interface ColumnCountPreviewProps {
  columns: number
  density: GridDensity
  isOverridden: boolean
  className?: string
}

export function ColumnCountPreview({
  columns,
  density,
  isOverridden,
  className,
}: ColumnCountPreviewProps) {
  const gapClass = getGridGap(density)
  const itemSize = getItemSize(density)
  const gapValue = getGridGapValue(density)

  const [previewItems] = React.useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: `preview-${i}`,
      name: `Product ${i + 1}`,
      price: (Math.random() * 50 + 5).toFixed(2),
    }))
  )

  const visibleItems = React.useMemo(() => {
    return previewItems.slice(0, Math.min(columns * 2, previewItems.length))
  }, [columns, previewItems])

  return (
    <Card size="sm" className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Live Preview</span>
          {isOverridden && (
            <span className="flex items-center gap-1 text-xs font-normal text-accent">
              <span className="size-2 rounded-full bg-accent animate-pulse" />
              Override Active
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Showing {columns} columns ({itemSize}px items, {gapValue}px gap)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn('grid transition-all duration-300 ease-out', gapClass)}
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {visibleItems.map((item, index) => (
            <PreviewCard
              key={item.id}
              name={item.name}
              price={item.price}
              density={density}
              delay={index * 50}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface PreviewCardProps {
  name: string
  price: string
  density: GridDensity
  delay: number
}

function PreviewCard({ name, price, density, delay }: PreviewCardProps) {
  const itemSize = getItemSize(density)
  const isCompact = density === 'compact'

  return (
    <div
      className="group relative overflow-hidden rounded-sm border bg-card transition-all hover:border-accent/50 hover:shadow-sm"
      style={{
        minHeight: `${itemSize}px`,
        maxHeight: `${itemSize + 40}px`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="p-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton
            className={cn(
              'bg-muted/50 rounded-sm',
              isCompact ? 'h-2 w-3/4' : 'h-2.5 w-full'
            )}
          />
          <div
            className={cn(
              'bg-accent/10 rounded-sm',
              isCompact ? 'h-2 w-1/2' : 'h-2 w-2/3'
            )}
          />
        </div>
      </div>
      <div className="absolute bottom-1 right-1">
        <div
          className={cn(
            'flex items-center justify-center rounded-sm bg-accent text-accent-foreground font-bold text-xs',
            isCompact ? 'size-5' : 'size-6'
          )}
        >
          0
        </div>
      </div>
    </div>
  )
}
