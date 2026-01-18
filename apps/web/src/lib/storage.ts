import { createStore, get, set, del, clear, entries } from 'idb-keyval'

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
