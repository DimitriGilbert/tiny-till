import type { CatalogExport, CatalogExportMetadata } from '../entities/export'
import type { ProductList } from '../entities/product'
import { EXPORT_VERSION, EXPORT_FORMAT } from '../entities/export'

export function generateExportChecksum(products: ProductList): string {
  const data = JSON.stringify(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageData: p.imageData,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))
  )

  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash | 0
  }
  return Math.abs(hash).toString(16)
}

export function generateExportFilename(): string {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `catalog-${year}-${month}-${day}-${hours}${minutes}${seconds}.json`
}

export function createExportMetadata(productCount: number, checksum: string): CatalogExportMetadata {
  return {
    version: EXPORT_VERSION,
    format: EXPORT_FORMAT,
    exportedAt: Date.now(),
    productCount,
    checksum,
  }
}

export function serializeCatalogExport(products: ProductList): CatalogExport {
  const checksum = generateExportChecksum(products)
  const metadata = createExportMetadata(products.length, checksum)

  return {
    meta: metadata,
    products: products.map((product) => ({
      ...product,
    })),
  }
}

export function createExportData(products: ProductList): CatalogExport {
  return serializeCatalogExport(products)
}
