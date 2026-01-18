import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type {
  DetailedStorageInfo,
  ImageFormatSupport,
  StorageWarningLevel,
} from '@tiny-till/types'
import { getDetailedStorageInfo } from '@/lib/storage'

interface StorageState {
  storageInfo: DetailedStorageInfo | null
  imageSupport: ImageFormatSupport | null
  warningLevel: StorageWarningLevel
  warningDismissed: boolean
  lastChecked: number | null
  isLoading: boolean
  error: string | null
}

interface StorageActions {
  checkStorage: () => Promise<void>
  checkImageSupport: () => Promise<void>
  dismissWarning: () => void
  resetWarning: () => void
  forceRefresh: () => Promise<void>
  clearError: () => void
}

type StorageStore = StorageState & StorageActions

const initialState: StorageState = {
  storageInfo: null,
  imageSupport: null,
  warningLevel: 'normal',
  warningDismissed: false,
  lastChecked: null,
  isLoading: false,
  error: null,
}

export const useStorageStore = create<StorageStore>()(
  devtools((set, get) => ({
    ...initialState,

    checkStorage: async () => {
      set({ isLoading: true, error: null })

      try {
        const storageInfo = await getDetailedStorageInfo()

        if (storageInfo) {
          const warningDismissedKey = 'storage-warning-dismissed'
          const warningDismissed =
            sessionStorage.getItem(warningDismissedKey) === 'true'

          set({
            storageInfo,
            warningLevel: storageInfo.warningLevel,
            lastChecked: Date.now(),
            isLoading: false,
            warningDismissed,
          })

          console.log('[StorageStore] Storage info updated:', storageInfo)
        } else {
          set({
            isLoading: false,
            error: 'Unable to retrieve storage information',
          })
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to check storage'
        set({
          isLoading: false,
          error: errorMessage,
        })
        console.error('[StorageStore] Error checking storage:', error)
      }
    },

    checkImageSupport: async () => {
      set({ isLoading: true, error: null })

      try {
        const [webP, avif] = await Promise.all([
          supportsWebP(),
          supportsAVIF(),
        ])

        const imageSupport: ImageFormatSupport = {
          webP,
          avif,
          jpeg: supportsJPEG(),
          preferred: getPreferredFormat(webP, avif),
        }

        set({
          imageSupport,
          isLoading: false,
        })

        console.log('[StorageStore] Image support detected:', imageSupport)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to check image support'
        set({
          isLoading: false,
          error: errorMessage,
        })
        console.error('[StorageStore] Error checking image support:', error)
      }
    },

    dismissWarning: () => {
      sessionStorage.setItem('storage-warning-dismissed', 'true')
      set({ warningDismissed: true })
    },

    resetWarning: () => {
      sessionStorage.removeItem('storage-warning-dismissed')
      set({ warningDismissed: false })
    },

    forceRefresh: async () => {
      await get().checkStorage()
      await get().checkImageSupport()
    },

    clearError: () => {
      set({ error: null })
    },
  }))
)

async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  return canvas
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0
}

async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1

  return (
    canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0 ||
    new Promise<boolean>((resolve) => {
      const avif = new Image()
      avif.src =
        'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='

      avif.onload = avif.onerror = () => {
        resolve(avif.height === 1)
      }
    })
  )
}

function supportsJPEG(): boolean {
  return true
}

function getPreferredFormat(webP: boolean, avif: boolean): 'image/avif' | 'image/webp' | 'image/jpeg' | 'image/png' {
  if (avif) return 'image/avif'
  if (webP) return 'image/webp'
  return 'image/jpeg'
}
