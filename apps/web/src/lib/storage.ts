import { createStore, get, set, del, clear, entries } from 'idb-keyval'

import type {
  DetailedStorageInfo,
  StorageBreakdown,
  StorageWarningLevel,
  StorageQuotaConfig,
} from '@tiny-till/types'
import {
  calculateWarningLevel,
  DEFAULT_STORAGE_QUOTA_CONFIG,
  formatBytes,
} from '@tiny-till/types'

const STORE_NAME = 'tiny-till-db'

const store = createStore(STORE_NAME, 'tiny-till-store')

export interface StorageInfo {
  quotaUsed: number
  quotaLimit: number
  percentage: number
  isNearLimit: boolean
}

export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null
}

export async function getStorageInfo(): Promise<StorageInfo | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    const quotaUsed = estimate.usage ?? 0
    const quotaLimit = estimate.quota ?? 0
    const percentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0
    const isNearLimit = percentage > 80

    return { quotaUsed, quotaLimit, percentage, isNearLimit }
  } catch (error) {
    console.error('[Storage] Failed to get storage info:', error)
    return null
  }
}

export async function safeGet<T>(key: string): Promise<T | undefined> {
  try {
    const value = await get<T>(key, store)
    return value
  } catch (error) {
    console.error(`[Storage] Failed to get key "${key}":`, error)
    return undefined
  }
}

export async function safeSet<T>(key: string, value: T): Promise<boolean> {
  try {
    const storageInfo = await getStorageInfo()
    if (storageInfo?.isNearLimit) {
      console.warn('[Storage] Approaching quota limit:', storageInfo.percentage)
    }

    await set(key, value, store)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[Storage] Quota exceeded for key:', key)
      throw new Error('Storage quota exceeded. Please clear some data.')
    }
    console.error(`[Storage] Failed to set key "${key}":`, error)
    return false
  }
}

export async function safeDelete(key: string): Promise<boolean> {
  try {
    await del(key, store)
    return true
  } catch (error) {
    console.error(`[Storage] Failed to delete key "${key}":`, error)
    return false
  }
}

export async function clearAll(): Promise<boolean> {
  try {
    await clear(store)
    console.log('[Storage] Cleared all data')
    return true
  } catch (error) {
    console.error('[Storage] Failed to clear all data:', error)
    return false
  }
}

export async function getAllKeys(): Promise<string[]> {
  try {
    const allEntries = await entries(store)
    return allEntries.map(([key]) => String(key))
  } catch (error) {
    console.error('[Storage] Failed to get all keys:', error)
    return []
  }
}

export async function hasKey(key: string): Promise<boolean> {
  try {
    const value = await get(key, store)
    return value !== undefined
  } catch (error) {
    console.error(`[Storage] Failed to check key "${key}":`, error)
    return false
  }
}

export async function getLocalStorageUsage(): Promise<{ used: number; items: number }> {
  let used = 0
  let items = 0

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          used += key.length + value.length
          items++
        }
      }
    }
  } catch (error) {
    console.error('[Storage] Failed to calculate localStorage usage:', error)
  }

  return { used, items }
}

export async function getIndexedDBUsage(): Promise<{ used: number; items: number }> {
  let used = 0
  let items = 0

  try {
    const allEntries = await entries(store)
    for (const [key, value] of allEntries) {
      const serialized = JSON.stringify({ key, value })
      used += serialized.length * 2
      items++
    }
  } catch (error) {
    console.error('[Storage] Failed to calculate IndexedDB usage:', error)
  }

  return { used, items }
}

export async function estimateStorageBreakdown(): Promise<StorageBreakdown> {
  const localStorageStats = await getLocalStorageUsage()
  const indexedDBStats = await getIndexedDBUsage()

  let imageUsed = 0
  let imageItems = 0

  try {
    const allEntries = await entries(store)
    for (const [key, value] of allEntries) {
      if (key === 'tiny-till-catalog') {
        const catalogData = value as { products?: Array<{ imageData?: string }> }
        if (catalogData.products) {
          for (const product of catalogData.products) {
            if (product.imageData) {
              imageUsed += product.imageData.length
              imageItems++
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[Storage] Failed to calculate image usage:', error)
  }

  return {
    localStorage: localStorageStats,
    indexedDB: indexedDBStats,
    cache: { used: 0, items: 0 },
    images: { used: imageUsed, items: imageItems },
  }
}

export async function getDetailedStorageInfo(
  config: StorageQuotaConfig = DEFAULT_STORAGE_QUOTA_CONFIG
): Promise<DetailedStorageInfo | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    const quotaUsed = estimate.usage ?? 0
    const quotaLimit = estimate.quota ?? 0
    const percentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0
    const breakdown = await estimateStorageBreakdown()
    const warningLevel = calculateWarningLevel(percentage, config)

    return {
      quotaUsed,
      quotaLimit,
      percentage,
      warningLevel,
      breakdown,
      lastUpdated: Date.now(),
    }
  } catch (error) {
    console.error('[Storage] Failed to get detailed storage info:', error)
    return null
  }
}

export function checkQuotaExceeded(error: unknown): boolean {
  if (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  ) {
    return true
  }

  if (error instanceof Error && error.message.includes('quota')) {
    return true
  }

  return false
}

export function detectStorageSupport(): {
  localStorage: boolean
  indexedDB: boolean
  storageEstimate: boolean
} {
  return {
    localStorage: typeof localStorage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    storageEstimate:
      typeof navigator !== 'undefined' && !!navigator.storage && !!navigator.storage.estimate,
  }
}
