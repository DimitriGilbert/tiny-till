import type { Product, ConflictResolution } from '../entities'

export function applyConflictResolution(
  existing: Product,
  incoming: Product,
  resolution: ConflictResolution
): Product {
  const { strategy, fieldOverrides = {} } = resolution

  switch (strategy) {
    case 'merge':
      return applyMergeStrategy(existing, incoming, fieldOverrides)
    case 'replace':
      return applyReplaceStrategy(existing, incoming)
    case 'skip':
      return existing
    default:
      throw new Error(`Unknown strategy: ${strategy}`)
  }
}

function applyMergeStrategy(
  existing: Product,
  incoming: Product,
  fieldOverrides: Record<string, 'existing' | 'incoming'>
): Product {
  const merged: Product = { ...existing }

  if (fieldOverrides.name) {
    merged.name = fieldOverrides.name === 'existing' ? existing.name : incoming.name
  } else {
    merged.name = incoming.name
  }

  if (fieldOverrides.price) {
    merged.price = fieldOverrides.price === 'existing' ? existing.price : incoming.price
  } else {
    merged.price = incoming.price
  }

  if (fieldOverrides.imageData) {
    merged.imageData = fieldOverrides.imageData === 'existing' ? existing.imageData : incoming.imageData
  } else {
    merged.imageData = incoming.imageData
  }

  merged.updatedAt = Date.now()
  return merged
}

function applyReplaceStrategy(existing: Product, incoming: Product): Product {
  return {
    ...incoming,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  }
}

export function validateConflictResolution(
  _existing: Product,
  _incoming: Product,
  resolution: ConflictResolution
): { isValid: boolean; error?: string } {
  if (resolution.strategy === 'skip') {
    return { isValid: true }
  }

  if (resolution.fieldOverrides) {
    const validFields = ['name', 'price', 'imageData']
    for (const field of Object.keys(resolution.fieldOverrides)) {
      if (!validFields.includes(field)) {
        return { isValid: false, error: `Invalid field override: ${field}` }
      }
    }
  }

  return { isValid: true }
}
