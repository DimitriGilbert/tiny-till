import type { TimestampedEntity } from './base'

export interface Product extends TimestampedEntity {
  id: string
  name: string
  price: number
  imageData?: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export type ProductUpdate = Partial<ProductInput>

export type ProductList = Product[]
