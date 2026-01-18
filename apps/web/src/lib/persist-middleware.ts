import { persist, createJSONStorage } from 'zustand/middleware'
import type { StateStorage, PersistStorage } from 'zustand/middleware'
import { safeGet, safeSet, safeDelete, checkQuotaExceeded } from './storage'
import { showQuotaExceeded } from './storage-toasts'

export function mapSerializer<T>() {
  return {
    serialize: (state: Map<string, T>): string => {
      return JSON.stringify(Array.from(state.entries()))
    },
    deserialize: (str: string): Map<string, T> => {
      const entries = JSON.parse(str)
      return new Map<string, T>(entries)
    },
  }
}

function indexedDBStorageImpl(): StateStorage {
  return {
    getItem: async (name: string): Promise<string | null> => {
      const value = await safeGet<string>(name)
      return value ?? null
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        const success = await safeSet(name, value)
        if (!success) {
          throw new Error(`Failed to persist state for ${name}`)
        }
      } catch (error) {
        if (checkQuotaExceeded(error)) {
          showQuotaExceeded()
        }
        throw error
      }
    },
    removeItem: async (name: string): Promise<void> => {
      await safeDelete(name)
    },
  }
}

export function createIndexedDBStorage<T = unknown>(): PersistStorage<T> {
  return createJSONStorage(() => indexedDBStorageImpl()) as PersistStorage<T>
}

export interface PersistConfig<T> {
  name: string
  partialize?: (state: T) => Partial<T>
  onRehydrateStorage?: (
    state: T
  ) => ((state: T, error: Error | undefined) => void) | void
}

export function withHydrationTracking<T extends { hasHydrated: boolean }>(
  onRehydrate?: () => void
) {
  return {
    onRehydrateStorage: () => (state: T | undefined, error: Error | undefined) => {
      if (error) {
        console.error('[Persist] Rehydration failed:', error)
        return
      }
      if (state) {
        state.hasHydrated = true
        console.log('[Persist] Hydration complete for store')
        onRehydrate?.()
      }
    },
  }
}
