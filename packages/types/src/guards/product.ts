import type { Product, ProductInput } from '../entities/product'
import { isTimestampedEntity } from './base'

const MAX_NAME_LENGTH = 50
const MAX_IMAGE_SIZE_BYTES = 128 * 128 * 4

export function isProduct(obj: unknown): obj is Product {
  if (!isTimestampedEntity(obj)) {
    return false
  }

  const product = obj as Product
  return (
    typeof product.name === 'string' &&
    product.name.length > 0 &&
    product.name.length <= MAX_NAME_LENGTH &&
    typeof product.price === 'number' &&
    Number.isInteger(product.price) &&
    product.price > 0 &&
    (product.imageData === undefined ||
      (typeof product.imageData === 'string' &&
        (product.imageData.startsWith('data:image/') ||
          product.imageData.startsWith('blob:'))))
  )
}

export function isProductInput(obj: unknown): obj is ProductInput {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const input = obj as ProductInput
  return (
    typeof input.name === 'string' &&
    input.name.length > 0 &&
    input.name.length <= MAX_NAME_LENGTH &&
    typeof input.price === 'number' &&
    Number.isInteger(input.price) &&
    input.price > 0 &&
    (input.imageData === undefined ||
      (typeof input.imageData === 'string' &&
        (input.imageData.startsWith('data:image/') ||
          input.imageData.startsWith('blob:'))))
  )
}

export function isValidPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

export function isValidProductName(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_NAME_LENGTH
}

export function isValidImageData(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  if (value.startsWith('data:image/')) {
    return value.length <= MAX_IMAGE_SIZE_BYTES
  }

  if (value.startsWith('blob:')) {
    return true
  }

  return false
}
