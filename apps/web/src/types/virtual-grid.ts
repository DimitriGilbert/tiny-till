import type { Product } from '@tiny-till/types'

export interface VirtualGridRowData {
  index: number
  start: number
  size: number
  products: Product[]
}

export interface VirtualGridOptions {
  items: Product[]
  columnCount: number
  estimatedItemHeight: number
  overscan?: number
}

export interface VirtualItem {
  index: number
  start: number
  size: number
  end: number
  key: string | number | bigint
}

export interface UseVirtualGridReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  rowVirtualizer: {
    getVirtualItems: () => VirtualItem[]
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void
    measure: () => void
  }
  totalRows: number
  getRowProducts: (rowIndex: number) => Product[]
}
