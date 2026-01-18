import type { Product } from './product'

export const EXPORT_VERSION = '1.0.0'
export const EXPORT_FORMAT = 'tiny-till-catalog'

export interface CatalogExportMetadata {
  version: string
  format: string
  exportedAt: number
  productCount: number
  checksum: string
}

export interface CatalogExport {
  meta: CatalogExportMetadata
  products: Product[]
}
