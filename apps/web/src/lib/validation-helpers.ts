import type { Product, ProductInput, ProductUpdate } from '@tiny-till/types'
import {
  productInputSchema,
  productUpdateSchema,
  tallyItemConsistencySchema,
  settingsBusinessLogicSchema,
  settingsSchema,
} from '@tiny-till/types'
import type { ValidationResult } from './validators'
import { validatePrice, validateQuantity } from './validators'
import { useCatalogStore } from '@/stores/catalog-store'

export async function validateProductAdd(input: ProductInput): Promise<ValidationResult> {
  const validation = productInputSchema.safeParse(input)

  if (!validation.success) {
    const errors = validation.error.issues.map((issue) => issue.message)
    return { isValid: false, error: errors.join(', ') }
  }

  const nameResult = validateNameUniqueness(input.name)
  if (!nameResult.isValid) {
    return nameResult
  }

  const priceResult = validatePrice(input.price)
  if (!priceResult.isValid) {
    return priceResult
  }

  if (input.imageData) {
    const importResult = await import('./validators')
    const imageResult = await importResult.validateImageDataURL(input.imageData)
    if (!imageResult.isValid) {
      return imageResult
    }
  }

  return { isValid: true }
}

export async function validateProductUpdate(
  id: string,
  updates: ProductUpdate
): Promise<ValidationResult> {
  const existingProduct = useCatalogStore.getState().getProduct(id)

  if (!existingProduct) {
    return { isValid: false, error: 'Product not found' }
  }

  const validation = productUpdateSchema.safeParse(updates)

  if (!validation.success) {
    const errors = validation.error.issues.map((issue) => issue.message)
    return { isValid: false, error: errors.join(', ') }
  }

  if (updates.name && updates.name !== existingProduct.name) {
    const nameResult = validateNameUniqueness(updates.name, id)
    if (!nameResult.isValid) {
      return nameResult
    }
  }

  if (updates.price !== undefined) {
    const priceResult = validatePrice(updates.price)
    if (!priceResult.isValid) {
      return priceResult
    }
  }

  return { isValid: true }
}

export function validateProductDelete(id: string): ValidationResult {
  const existingProduct = useCatalogStore.getState().getProduct(id)

  if (!existingProduct) {
    return { isValid: false, error: 'Product not found' }
  }

  return { isValid: true }
}

function validateNameUniqueness(name: string, excludeId?: string): ValidationResult {
  const products = useCatalogStore.getState().products
  const normalizedInput = name.trim().toLowerCase()

  const duplicate = products.find(
    (product) =>
      product.name.trim().toLowerCase() === normalizedInput && product.id !== excludeId
  )

  if (duplicate) {
    return {
      isValid: false,
      error: `Product name "${name}" already exists`,
    }
  }

  return { isValid: true }
}

export async function validateTallyAddItem(
  productId: string,
  price: number,
  qty: number
): Promise<ValidationResult> {
  const product = useCatalogStore.getState().getProduct(productId)

  if (!product) {
    return {
      isValid: false,
      error: 'Product does not exist in catalog',
    }
  }

  const quantityResult = validateQuantity(qty)
  if (!quantityResult.isValid) {
    return quantityResult
  }

  const priceResult = validatePrice(price)
  if (!priceResult.isValid) {
    return priceResult
  }

  const validation = tallyItemConsistencySchema.safeParse({
    productId,
    quantity: qty,
    price,
  })

  if (!validation.success) {
    const errors = validation.error.issues.map((issue) => issue.message)
    return { isValid: false, error: errors.join(', ') }
  }

  return { isValid: true }
}

export async function validateTallyUpdateQuantity(
  productId: string,
  qty: number
): Promise<ValidationResult> {
  const quantityResult = validateQuantity(qty)
  if (!quantityResult.isValid) {
    return quantityResult
  }

  return { isValid: true }
}

export function validateTallyRemoveItem(productId: string): ValidationResult {
  return { isValid: true }
}

export function validateTallyClear(): ValidationResult {
  return { isValid: true }
}

export async function validateSettingsUpdate(
  updates: Partial<{ theme: string; gridDensity: string; columnCountOverride?: number }>
): Promise<ValidationResult> {
  const currentSettings = {
    theme: 'system' as const,
    gridDensity: 'normal' as const,
    columnCountOverride: undefined,
  }

  const mergedSettings = { ...currentSettings, ...updates }

  const validation = settingsSchema.safeParse(mergedSettings)

  if (!validation.success) {
    const errors = validation.error.issues.map((issue: { message: string }) => issue.message)
    return { isValid: false, error: errors.join(', ') }
  }

  const businessLogicValidation = settingsBusinessLogicSchema.safeParse(mergedSettings)

  if (!businessLogicValidation.success) {
    const errors = businessLogicValidation.error.issues.map((issue: { message: string }) => issue.message)
    return { isValid: false, error: errors.join(', ') }
  }

  return { isValid: true }
}

export async function validateThemeChange(theme: 'light' | 'dark' | 'system'): Promise<ValidationResult> {
  const validThemes = ['light', 'dark', 'system'] as const

  if (!validThemes.includes(theme as (typeof validThemes)[number])) {
    return { isValid: false, error: 'Invalid theme value' }
  }

  return { isValid: true }
}

export async function validateGridDensityChange(
  density: 'normal' | 'compact'
): Promise<ValidationResult> {
  const validDensities = ['normal', 'compact'] as const

  if (!validDensities.includes(density as (typeof validDensities)[number])) {
    return { isValid: false, error: 'Invalid grid density value' }
  }

  return { isValid: true }
}

export async function validateColumnCountChange(
  count: number | undefined
): Promise<ValidationResult> {
  if (count === undefined) {
    return { isValid: true }
  }

  const validCounts = [2, 3, 4, 5, 6, 7, 8] as const

  if (!validCounts.includes(count as (typeof validCounts)[number])) {
    return { isValid: false, error: 'Column count must be between 2 and 8' }
  }

  return { isValid: true }
}
