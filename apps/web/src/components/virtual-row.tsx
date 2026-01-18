import * as React from 'react'

import type { Product } from '@tiny-till/types'
import type { VirtualItem } from '@/types/virtual-grid'

interface VirtualRowProps {
  row: VirtualItem
  products: Product[]
  columnCount: number
  gridGap: string
  renderProduct: (product: Product, index: number) => React.ReactNode
}

export const VirtualRow = React.memo(function VirtualRow({
  row,
  products,
  columnCount,
  gridGap,
  renderProduct,
}: VirtualRowProps) {
  const rowRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (rowRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height
          if (Math.abs(height - row.size) > 1) {
            rowRef.current?.style.setProperty('--height', `${height}px`)
          }
        }
      })

      observer.observe(rowRef.current)

      return () => observer.disconnect()
    }
  }, [row.size])

  return (
    <div
      ref={rowRef}
      className="absolute left-0 right-0 top-0 grid w-full"
      style={{
        transform: `translateY(${row.start}px)`,
        height: row.size,
      }}
    >
      <div className={gridGap} style={{ display: 'grid', gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {products.map((product, index) => (
          <React.Fragment key={product.id}>{renderProduct(product, index)}</React.Fragment>
        ))}
      </div>
    </div>
  )
})
