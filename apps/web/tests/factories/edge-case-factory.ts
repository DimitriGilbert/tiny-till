import type { Product } from '@tiny-till/types'

export type CorruptionType =
  | 'malformed-json'
  | 'truncated'
  | 'version-mismatch'
  | 'missing-fields'
  | 'invalid-types'
  | 'unicode'
  | 'empty-catalog'
  | 'duplicate-ids'
  | 'negative-price'
  | 'invalid-date'

export type NetworkScenario =
  | 'offline'
  | 'slow-3g'
  | 'slow-4g'
  | 'timeout'
  | 'intermittent'

export interface CorruptCatalogOptions {
  corruptionType: CorruptionType
  version?: string
  productCount?: number
}

export interface LargeCatalogOptions {
  productCount: number
  imageSizeKB?: number
  includeImages?: boolean
}

export interface NetworkConfig {
  scenario: NetworkScenario
  latency?: number
  throughput?: number
}

export function createCorruptedCatalog(options: CorruptCatalogOptions): { version: string; exportDate: string; products: Product[] } {
  const version = options.version || '1.0.0'
  const productCount = options.productCount || 1
  const products: Product[] = []

  switch (options.corruptionType) {
    case 'malformed-json':
      return {
        version,
        exportDate: new Date().toISOString(),
        products: [
          {
            id: '1',
            name: 'Malformed',
            price: 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      }

    case 'truncated': {
      const truncatedProduct: Product = {
        id: '1',
        name: 'Truncated',
        price: 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      products.push(truncatedProduct)
      break
    }

    case 'version-mismatch':
      return {
        version: '99.99.99',
        exportDate: new Date().toISOString(),
        products: [],
      }

    case 'missing-fields': {
      for (let i = 0; i < productCount; i++) {
        products.push({
          id: `missing-${i}`,
          price: (i + 1) * 1000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any)
      }
      break
    }

    case 'invalid-types': {
      for (let i = 0; i < productCount; i++) {
        products.push({
          id: `invalid-${i}`,
          name: 'Invalid Type',
          price: 'not-a-number' as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
      break
    }

    case 'unicode':
      products.push({
        id: 'unicode-1',
        name: '🎉🎊🎈✨ Test Product 中文 日本語 العربية',
        price: 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      break

    case 'empty-catalog':
      return {
        version,
        exportDate: new Date().toISOString(),
        products: [],
      }

    case 'duplicate-ids': {
      for (let i = 0; i < productCount; i++) {
        products.push({
          id: 'duplicate-id',
          name: `Duplicate Product ${i}`,
          price: (i + 1) * 1000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
      break
    }

    case 'negative-price': {
      for (let i = 0; i < productCount; i++) {
        products.push({
          id: `negative-${i}`,
          name: `Negative Price ${i}`,
          price: -100 * (i + 1),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
      break
    }

    case 'invalid-date': {
      for (let i = 0; i < productCount; i++) {
        products.push({
          id: `invalid-date-${i}`,
          name: `Invalid Date ${i}`,
          price: (i + 1) * 1000,
          createdAt: 'invalid-date' as any,
          updatedAt: Date.now(),
        })
      }
      break
    }
  }

  return {
    version,
    exportDate: new Date().toISOString(),
    products,
  }
}

export function createLargeCatalog(options: LargeCatalogOptions): { version: string; exportDate: string; products: Product[] } {
  const products: Product[] = []
  const imageSizeKB = options.imageSizeKB || 20
  const base64Image = 'x'.repeat(imageSizeKB * 1024)

  for (let i = 0; i < options.productCount; i++) {
    const product: Product = {
      id: `large-${i}`,
      name: `Product ${i + 1}`,
      price: (i + 1) * 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (options.includeImages) {
      product.imageData = `data:image/png;base64,${base64Image}`
    }

    products.push(product)
  }

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    products,
  }
}

export function createNetworkConfig(scenario: NetworkScenario): NetworkConfig {
  switch (scenario) {
    case 'offline':
      return { scenario: 'offline' }

    case 'slow-3g':
      return {
        scenario: 'slow-3g',
        throughput: 750 * 1024,
        latency: 100,
      }

    case 'slow-4g':
      return {
        scenario: 'slow-4g',
        throughput: 4000 * 1024,
        latency: 20,
      }

    case 'timeout':
      return {
        scenario: 'timeout',
        latency: 60000,
      }

    case 'intermittent':
      return {
        scenario: 'intermittent',
        throughput: 1000 * 1024,
        latency: 500,
      }

    default:
      return { scenario: 'offline' }
  }
}

export function createConcurrentOperations(count: number, types: ('add' | 'update' | 'delete' | 'import' | 'export')[]): Array<{
  type: 'add' | 'update' | 'delete' | 'import' | 'export'
  productId?: string
  data?: unknown
  delay?: number
}> {
  const operations = []

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length]
    const operation: {
      type: 'add' | 'update' | 'delete' | 'import' | 'export'
      productId?: string
      data?: unknown
      delay?: number
    } = {
      type,
      delay: i * 50,
    }

    if (type === 'update' || type === 'delete') {
      operation.productId = `product-${i}`
    }

    if (type === 'import') {
      operation.data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        products: [
          {
            id: crypto.randomUUID(),
            name: `Concurrent Import ${i}`,
            price: (i + 1) * 100,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      }
    }

    operations.push(operation)
  }

  return operations
}

export function createStorageQuotaConfig(quotaMB: number, usedPercentage: number): {
  limit: number
  used: number
  remaining: number
  warningThreshold: number
  criticalThreshold: number
} {
  const limit = quotaMB * 1024 * 1024
  const used = Math.floor(limit * usedPercentage)
  const remaining = limit - used

  return {
    limit,
    used,
    remaining,
    warningThreshold: Math.floor(limit * 0.8),
    criticalThreshold: Math.floor(limit * 0.95),
  }
}
