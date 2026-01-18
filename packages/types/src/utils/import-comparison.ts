import type {
  CatalogImport,
  Product,
  ProductChange,
  ProductChangeType,
  ImportAnalysis,
} from '../entities'

export function compareProductsForImport(
  existingProducts: Product[],
  importData: CatalogImport
): ImportAnalysis {
  const allChanges: ProductChange[] = []
  const existingProductMap = new Map(existingProducts.map((p) => [p.id, p]))
  const productsToAdd: Product[] = []
  const productsToUpdate: Array<{
    existing: Product
    updated: Product
    changedFields: string[]
  }> = []
  let unchangedProducts = 0

  for (const importedProduct of importData.products) {
    const existingProduct = existingProductMap.get(importedProduct.id)
    const change = categorizeProductChange(existingProducts, importedProduct)
    allChanges.push(change)

    if (change.changeType === 'add') {
      productsToAdd.push(importedProduct)
    } else if (change.changeType === 'update' && existingProduct) {
      productsToUpdate.push({
        existing: existingProduct,
        updated: importedProduct,
        changedFields: change.changedFields || [],
      })
    } else if (change.changeType === 'unchanged') {
      unchangedProducts++
    }
  }

  const conflicts = allChanges.filter((c) => c.isConflict)

  return {
    totalProducts: importData.products.length,
    productsToAdd,
    productsToUpdate,
    productsInConflict: conflicts,
    unchangedProducts,
  }
}

export function detectProductChanges(
  existing: Product,
  incoming: Product
): string[] | null {
  const changedFields: string[] = []

  if (existing.name !== incoming.name) {
    changedFields.push('name')
  }

  if (existing.price !== incoming.price) {
    changedFields.push('price')
  }

  const existingImageData = existing.imageData || ''
  const incomingImageData = incoming.imageData || ''

  if (existingImageData !== incomingImageData) {
    changedFields.push('imageData')
  }

  if (existing.createdAt !== incoming.createdAt) {
    changedFields.push('createdAt')
  }

  if (existing.updatedAt !== incoming.updatedAt) {
    changedFields.push('updatedAt')
  }

  return changedFields.length > 0 ? changedFields : null
}

export function categorizeProductChange(
  existingProducts: Product[],
  incomingProduct: Product
): ProductChange {
  const existingProduct = existingProducts.find((p) => p.id === incomingProduct.id)

  if (!existingProduct) {
    return {
      productId: incomingProduct.id,
      changeType: 'add',
      newProduct: incomingProduct,
      isConflict: false,
    }
  }

  const changedFields = detectProductChanges(existingProduct, incomingProduct)

  if (!changedFields) {
    return {
      productId: incomingProduct.id,
      changeType: 'unchanged',
      existingProduct,
      newProduct: incomingProduct,
      changedFields: [],
      isConflict: false,
    }
  }

  const isConflict = changedFields.some((field) => {
    if (field === 'imageData') {
      const existingHasImage = Boolean(existingProduct.imageData)
      const incomingHasImage = Boolean(incomingProduct.imageData)
      return existingHasImage && incomingHasImage && existingProduct.imageData !== incomingProduct.imageData
    }
    return false
  })

  if (isConflict) {
    return {
      productId: incomingProduct.id,
      changeType: 'conflict',
      existingProduct,
      newProduct: incomingProduct,
      changedFields,
      isConflict: true,
      conflictType: 'data',
    }
  }

  return {
    productId: incomingProduct.id,
    changeType: 'update',
    existingProduct,
    newProduct: incomingProduct,
    changedFields,
    isConflict: false,
  }
}

export function generateChangeSummary(analysis: ImportAnalysis): {
  adds: number
  updates: number
  conflicts: number
  unchanged: number
} {
  return {
    adds: analysis.productsToAdd.length,
    updates: analysis.productsToUpdate.length,
    conflicts: analysis.productsInConflict.length,
    unchanged: analysis.unchangedProducts,
  }
}

export function filterChangesByType(
  changes: ProductChange[],
  changeType: ProductChangeType
): ProductChange[] {
  return changes.filter((c) => c.changeType === changeType)
}

export function hasChanges(analysis: ImportAnalysis): boolean {
  return (
    analysis.productsToAdd.length > 0 ||
    analysis.productsToUpdate.length > 0 ||
    analysis.productsInConflict.length > 0
  )
}

export function isSafeToImport(analysis: ImportAnalysis): boolean {
  return analysis.productsInConflict.length === 0 && hasChanges(analysis)
}
