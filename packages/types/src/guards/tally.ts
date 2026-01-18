import type { TallyItem, TallyState } from '../entities/tally-item'
import { isValidUUID } from '../utils/uuid'

export function isTallyItem(obj: unknown): obj is TallyItem {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const item = obj as TallyItem
  return (
    isValidUUID(item.productId) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.price === 'number' &&
    Number.isInteger(item.price) &&
    item.price >= 0
  )
}

export function isValidQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

export function isValidProductId(value: unknown): value is string {
  return isValidUUID(value)
}

export function isTallyState(value: unknown): value is TallyState {
  if (!(value instanceof Map)) {
    return false
  }

  for (const [key, item] of value.entries()) {
    if (!isValidUUID(key) || !isTallyItem(item)) {
      return false
    }
  }

  return true
}
