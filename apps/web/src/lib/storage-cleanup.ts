import { clear, entries, del } from 'idb-keyval'
import { getDetailedStorageInfo } from './storage'
import type { DetailedStorageInfo } from '@tiny-till/types'

interface CleanupResult {
  removedImages: number
  removedProducts: number
  bytesFreed: number
}

export async function clearOldImages(olderThanDays: number = 30): Promise<number> {
  let removedCount = 0
  const cutoffDate = Date.now() - olderThanDays * 24 * 60 * 60 * 1000

  try {
    const allEntries = await entries()
    const catalogEntry = allEntries.find(([key]) => key === 'tiny-till-catalog')

    if (!catalogEntry) {
      return 0
    }

    const catalog = catalogEntry[1] as { products?: Array<{ imageData?: string; updatedAt?: number }> }

    if (!catalog.products) {
      return 0
    }

    const productsToRemove = catalog.products.filter((product) => {
      const hasImage = !!product.imageData
      const isOld = product.updatedAt ? product.updatedAt < cutoffDate : false

      return hasImage && isOld
    })

    removedCount = productsToRemove.length

    if (removedCount === 0) {
      return 0
    }

    console.log(`[Cleanup] Found ${removedCount} old images to remove`)
  } catch (error) {
    console.error('[Cleanup] Error finding old images:', error)
  }

  return removedCount
}

export async function compressAllImages(): Promise<{ original: number; compressed: number }> {
  let originalSize = 0
  let compressedSize = 0

  try {
    const allEntries = await entries()
    const catalogEntry = allEntries.find(([key]) => key === 'tiny-till-catalog')

    if (!catalogEntry) {
      return { original: 0, compressed: 0 }
    }

    const catalog = catalogEntry[1] as { products?: Array<{ imageData?: string }> }

    if (!catalog.products) {
      return { original: 0, compressed: 0 }
    }

    for (const product of catalog.products) {
      if (product.imageData) {
        originalSize += product.imageData.length
        compressedSize += product.imageData.length
      }
    }

    console.log(`[Cleanup] Analyzed ${catalog.products.length} products`)
  } catch (error) {
    console.error('[Cleanup] Error analyzing images:', error)
  }

  return { original: originalSize, compressed: compressedSize }
}

export async function removeUnusedKeys(): Promise<number> {
  let removedCount = 0

  try {
    const allEntries = await entries()
    const validKeys = ['tiny-till-catalog', 'tiny-till-settings']

    for (const [key] of allEntries) {
      if (!validKeys.includes(String(key))) {
        await del(String(key))
        removedCount++
      }
    }

    console.log(`[Cleanup] Removed ${removedCount} unused keys`)
  } catch (error) {
    console.error('[Cleanup] Error removing unused keys:', error)
  }

  return removedCount
}

export async function calculatePotentialSavings(): Promise<number> {
  let potentialSavings = 0

  try {
    const allEntries = await entries()
    const catalogEntry = allEntries.find(([key]) => key === 'tiny-till-catalog')

    if (!catalogEntry) {
      return 0
    }

    const catalog = catalogEntry[1] as { products?: Array<{ imageData?: string }> }

    if (!catalog.products) {
      return 0
    }

    for (const product of catalog.products) {
      if (product.imageData) {
        potentialSavings += product.imageData.length
      }
    }

    console.log(`[Cleanup] Potential savings: ${potentialSavings} bytes`)
  } catch (error) {
    console.error('[Cleanup] Error calculating savings:', error)
  }

  return potentialSavings
}

export async function performFullCleanup(): Promise<CleanupResult> {
  const removedImages = await clearOldImages(30)
  const removedProducts = 0
  const removedKeys = await removeUnusedKeys()

  const storageBefore = await getDetailedStorageInfo()

  console.log('[Cleanup] Storage before:', storageBefore)

  const storageAfter = await getDetailedStorageInfo()

  console.log('[Cleanup] Storage after:', storageAfter)

  const bytesFreed = storageBefore && storageAfter
    ? storageBefore.quotaUsed - storageAfter.quotaUsed
    : 0

  return {
    removedImages,
    removedProducts,
    bytesFreed: Math.max(0, bytesFreed),
  }
}

export async function clearAllStorage(): Promise<boolean> {
  try {
    await clear()
    console.log('[Cleanup] Cleared all storage')
    return true
  } catch (error) {
    console.error('[Cleanup] Error clearing storage:', error)
    return false
  }
}

export async function getCleanupPreview(): Promise<{
  oldImages: number
  unusedKeys: number
  potentialSavings: number
}> {
  const [oldImages, unusedKeys, potentialSavings] = await Promise.all([
    clearOldImages(0),
    removeUnusedKeys(),
    calculatePotentialSavings(),
  ])

  return {
    oldImages,
    unusedKeys,
    potentialSavings,
  }
}
