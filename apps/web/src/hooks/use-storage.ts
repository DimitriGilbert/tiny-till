import { useEffect, useState, useCallback } from 'react'

import { getStorageInfo, clearAll, getAllKeys } from '@/lib/storage'
import type { StorageInfo } from '@/lib/storage'
import { useSettingsStore } from '@/stores/settings-store'
import { useCatalogStore } from '@/stores/catalog-store'

interface StorageHookReturn {
  storageInfo: StorageInfo | null
  isHydrated: boolean
  clearAllStorage: () => Promise<void>
  refreshStorageInfo: () => Promise<void>
}

export function useStorage(): StorageHookReturn {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const settingsHydrated = useSettingsStore((state) => state.hasHydrated)
  const catalogHydrated = useCatalogStore((state) => state.hasHydrated)

  const refreshStorageInfo = useCallback(async () => {
    const info = await getStorageInfo()
    setStorageInfo(info)
  }, [])

  const clearAllStorage = useCallback(async () => {
    const success = await clearAll()
    if (success) {
      await refreshStorageInfo()
    }
  }, [refreshStorageInfo])

  useEffect(() => {
    const checkHydration = () => {
      const hydrated = settingsHydrated && catalogHydrated
      setIsHydrated(hydrated)
    }

    checkHydration()
  }, [settingsHydrated, catalogHydrated])

  useEffect(() => {
    refreshStorageInfo()
  }, [refreshStorageInfo])

  return {
    storageInfo,
    isHydrated,
    clearAllStorage,
    refreshStorageInfo,
  }
}
