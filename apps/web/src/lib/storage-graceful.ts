import { checkQuotaExceeded } from './storage'
import type { DetailedStorageInfo } from '@tiny-till/types'

export async function handleStorageQuotaExceeded<T>(
  operation: () => Promise<T>,
  onRetry?: () => void
): Promise<T> {
  const MAX_RETRIES = 3
  let retryCount = 0

  while (retryCount < MAX_RETRIES) {
    try {
      return await operation()
    } catch (error) {
      if (checkQuotaExceeded(error)) {
        console.warn(
          `[Storage] Quota exceeded (attempt ${retryCount + 1}/${MAX_RETRIES})`
        )

        if (onRetry && retryCount < MAX_RETRIES - 1) {
          retryCount++
          onRetry()
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount))
          continue
        }

        throw new Error('Storage quota exceeded. Please free up some space.')
      }

      throw error
    }
  }

  throw new Error('Failed after maximum retries due to quota')
}

export async function fallbackToLocalStorage<T>(
  key: string,
  value: T
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    if (checkQuotaExceeded(error)) {
      console.warn('[Storage] localStorage also full, cannot fallback')
      return false
    }
    throw error
  }
}

export async function compressDataForStorage(data: string): Promise<string> {
  const MAX_SIZE = 1024 * 1024

  if (data.length <= MAX_SIZE) {
    return data
  }

  try {
    return data.slice(0, MAX_SIZE)
  } catch {
    return data
  }
}

export function decompressDataFromStorage(data: string): string {
  return data
}

export function suggestCleanupActions(info: DetailedStorageInfo): string[] {
  const suggestions: string[] = []

  if (info.breakdown.images.items > 0) {
    suggestions.push(
      `${info.breakdown.images.items} product images using images`
    )
  }

  if (info.percentage > 70) {
    suggestions.push('Storage usage is above 70%')
  }

  if (info.percentage > 90) {
    suggestions.push('Storage is critically full - cleanup required')
  }

  if (info.breakdown.localStorage.items > 100) {
    suggestions.push('High number of localStorage items')
  }

  return suggestions
}
