import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown'

export type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'

export interface NetworkState {
  isOnline: boolean
  connectionType: ConnectionType
  effectiveType: EffectiveType
  downlink: number
  rtt: number
  saveData: boolean
  lastChangedAt: number
}

interface NetworkActions {
  setOnline: () => void
  setOffline: () => void
  updateNetworkInfo: (info: Partial<NetworkState>) => void
  clearPendingOperations: () => void
}

export interface QueueItem {
  id: string
  operation: () => Promise<unknown>
  timestamp: number
  retryCount: number
  maxRetries: number
}

interface NetworkQueueActions {
  queue: QueueItem[]
  addToQueue: (operation: () => Promise<unknown>, options?: { maxRetries?: number }) => void
  retryQueue: () => Promise<void>
  clearQueue: () => void
}

type NetworkStore = NetworkState & NetworkActions & NetworkQueueActions

const initialState: NetworkState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  connectionType: 'unknown',
  effectiveType: 'unknown',
  downlink: 0,
  rtt: 0,
  saveData: false,
  lastChangedAt: Date.now(),
}

const initialQueue: NetworkQueueActions = {
  queue: [],
  addToQueue: () => {},
  retryQueue: async () => {},
  clearQueue: () => {},
}

export const useNetworkStore = create<NetworkStore>()(
  devtools((set, get) => ({
    ...initialState,
    ...initialQueue,

    setOnline: () => {
      set((state) => ({
        ...state,
        isOnline: true,
        lastChangedAt: Date.now(),
      }))
      console.log('[NetworkStore] Network is online')
      get().retryQueue()
    },

    setOffline: () => {
      set((state) => ({
        ...state,
        isOnline: false,
        lastChangedAt: Date.now(),
      }))
      console.log('[NetworkStore] Network is offline')
    },

    updateNetworkInfo: (info) => {
      set((state) => ({
        ...state,
        ...info,
        lastChangedAt: Date.now(),
      }))
      console.log('[NetworkStore] Network info updated:', info)
    },

    clearPendingOperations: () => {
      console.log('[NetworkStore] Clearing pending operations')
    },

    queue: [],

    addToQueue: (operation, options = {}) => {
      const item: QueueItem = {
        id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        operation,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
      }

      set((state) => ({
        ...state,
        queue: [...state.queue, item],
      }))

      console.log('[NetworkStore] Added to queue:', item.id)

      if (get().isOnline) {
        get().retryQueue()
      }
    },

    retryQueue: async () => {
      const queue = get().queue
      if (queue.length === 0) return

      console.log(`[NetworkStore] Retrying ${queue.length} queued operations`)

      for (const item of queue) {
        try {
          await item.operation()

          set((state) => ({
            ...state,
            queue: state.queue.filter((i) => i.id !== item.id),
          }))

          console.log('[NetworkStore] Queue item succeeded:', item.id)
        } catch (error) {
          item.retryCount++

          if (item.retryCount >= item.maxRetries) {
            set((state) => ({
              ...state,
              queue: state.queue.filter((i) => i.id !== item.id),
            }))

            console.error('[NetworkStore] Queue item failed after max retries:', item.id, error)
          } else {
            console.warn('[NetworkStore] Queue item failed, will retry:', item.id, item.retryCount)
          }
        }
      }
    },

    clearQueue: () => {
      set((state) => ({
        ...state,
        queue: [],
      }))
      console.log('[NetworkStore] Queue cleared')
    },
  }))
)

export function initializeNetworkMonitoring() {
  if (typeof window === 'undefined') return

  const updateNetworkState = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (connection) {
      useNetworkStore.getState().updateNetworkInfo({
        connectionType: connection.type as ConnectionType || 'unknown',
        effectiveType: (connection.effectiveType as EffectiveType) || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      })
    }
  }

  const handleOnline = () => {
    useNetworkStore.getState().setOnline()
  }

  const handleOffline = () => {
    useNetworkStore.getState().setOffline()
  }

  const handleConnectionChange = () => {
    updateNetworkState()
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  window.addEventListener('load', updateNetworkState)

  if ((navigator as any).connection) {
    (navigator as any).connection.addEventListener('change', handleConnectionChange)
    (navigator as any).connection.addEventListener('typechange', handleConnectionChange)
  }

  updateNetworkState()
}

export function getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
  const { downlink, rtt } = useNetworkStore.getState()

  if (downlink >= 10 && rtt < 100) {
    return 'excellent'
  } else if (downlink >= 4 && rtt < 200) {
    return 'good'
  } else if (downlink >= 1.5 && rtt < 300) {
    return 'fair'
  } else {
    return 'poor'
  }
}

export function shouldQueueOperations(): boolean {
  const { isOnline, saveData } = useNetworkStore.getState()
  return !isOnline || saveData
}

export function getEstimatedQueueTime(): number {
  const queue = useNetworkStore.getState().queue as unknown as QueueItem[]
  if (queue.length === 0) return 0

  return queue.length * 1000
}
