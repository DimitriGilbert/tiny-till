import type { TimestampedEntity } from './base'

/**
 * Represents a product in the catalog.
 *
 * @interface Product
 * @extends TimestampedEntity
 *
 * @property {string} id - UUID v4 identifier
 * @property {string} name - Product display name (1-50 chars)
 * @property {number} price - Price in integer cents (e.g., 1050 = $10.50)
 * @property {string} [imageData] - Base64 encoded image or blob URL
 * @property {number} createdAt - Unix timestamp in milliseconds
 * @property {number} updatedAt - Unix timestamp in milliseconds
 *
 * @example
 * const product: Product = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Coffee',
 *   price: 450,
 *   imageData: 'data:image/jpeg;base64,...',
 *   createdAt: 1640995200000,
 *   updatedAt: 1640995200000
 * }
 */
export interface Product extends TimestampedEntity {
  id: string
  name: string
  price: number
  imageData?: string
}

/**
 * Product input data for creating new products.
 * Excludes auto-generated fields (id, createdAt, updatedAt).
 *
 * @example
 * const input: ProductInput = {
 *   name: 'Bread',
 *   price: 250,
 *   imageData: 'data:image/png;base64,...'
 * }
 */
export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Partial update data for existing products.
 * All fields are optional for partial updates.
 */
export type ProductUpdate = Partial<ProductInput>

/**
 * Array of products for bulk operations.
 */
export type ProductList = Product[]
