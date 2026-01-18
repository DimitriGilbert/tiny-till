import * as React from 'react'

import { VirtualRow } from '@/components/virtual-row'
import type { Product } from '@tiny-till/types'
import type { UseVirtualGridReturn, VirtualItem } from '@/types/virtual-grid'

interface VirtualGridContainerProps {
  items: Product[]
  columnCount: number
  gridGap: string
  estimatedItemHeight: number
  renderProduct: (product: Product, index: number) => React.ReactNode
  virtualGrid: UseVirtualGridReturn
  isLoading?: boolean
}

export function VirtualGridContainer({
  items,
  columnCount,
  gridGap,
  estimatedItemHeight,
  renderProduct,
  virtualGrid,
  isLoading = false,
}: VirtualGridContainerProps) {
  const { containerRef, rowVirtualizer, totalRows, getRowProducts } = virtualGrid

  const virtualRows = React.useMemo(() => rowVirtualizer.getVirtualItems(), [rowVirtualizer])

  const renderVirtualRow = React.useCallback(
    (row: VirtualItem) => {
      const rowProducts = getRowProducts(row.index)
      return (
        <VirtualRow
          key={row.key}
          row={row}
          products={rowProducts}
          columnCount={columnCount}
          gridGap={gridGap}
          renderProduct={renderProduct}
        />
      )
    },
    [columnCount, gridGap, getRowProducts, renderProduct]
  )

  if (isLoading) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      style={{
        height: 'calc(100vh - 300px)',
        minHeight: '400px',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getVirtualItems().reduce((acc, row) => acc + row.size, 0)}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map(renderVirtualRow)}
      </div>
    </div>
  )
}
