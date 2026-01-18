import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface LoadingEntry {
  id: string
  key: string
  state: LoadingState
  message?: string
  timestamp: number
  priority: 'low' | 'medium' | 'high'
}

interface LoadingInput {
  key: string
  message?: string
  priority?: LoadingEntry['priority']
}

interface LoadingStoreState {
  loadings: Map<string, LoadingEntry>
  activeLoadingKeys: Set<string>
  isLoading: boolean
  getLoadingByKey: (key: string) => LoadingEntry | undefined
}

interface LoadingActions {
  startLoading: (input: LoadingInput) => void
  stopLoading: (key: string, success?: boolean) => void
  setLoadingMessage: (key: string, message: string) => void
  clearLoading: (key: string) => void
  clearAllLoadings: () => void
  getLoadingsByPriority: (priority: LoadingEntry['priority']) => LoadingEntry[]
}

type LoadingStore = LoadingStoreState & LoadingActions

const initialState: LoadingStoreState = {
  loadings: new Map(),
  activeLoadingKeys: new Set(),
  isLoading: false,
  getLoadingByKey: () => undefined,
}

export const useLoadingStore = create<LoadingStore>()(
  devtools((set, get) => ({
    ...initialState,

    startLoading: (input) => {
      const { key, message, priority = 'medium' } = input
      const id = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const loadingEntry: LoadingEntry = {
        id,
        key,
        state: 'loading',
        message,
        timestamp: Date.now(),
        priority,
      }

      set((state) => {
        const newLoadings = new Map(state.loadings)
        const newActiveLoadingKeys = new Set(state.activeLoadingKeys)
        
        newLoadings.set(id, loadingEntry)
        newActiveLoadingKeys.add(key)

        console.log('[LoadingStore] Loading started:', key, message)
        return {
          loadings: newLoadings,
          activeLoadingKeys: newActiveLoadingKeys,
          isLoading: true,
        }
      })
    },

    stopLoading: (key, success = true) => {
      set((state) => {
        const newLoadings = new Map(state.loadings)
        const newActiveLoadingKeys = new Set(state.activeLoadingKeys)

        const loading = Array.from(newLoadings.values()).find((l) => l.key === key)
        if (loading) {
          newLoadings.set(loading.id, {
            ...loading,
            state: success ? 'success' : 'error',
          })
        }

        newActiveLoadingKeys.delete(key)

        console.log('[LoadingStore] Loading stopped:', key, success)
        return {
          loadings: newLoadings,
          activeLoadingKeys: newActiveLoadingKeys,
          isLoading: newActiveLoadingKeys.size > 0,
        }
      })
    },

    setLoadingMessage: (key, message) => {
      set((state) => {
        const newLoadings = new Map(state.loadings)
        const loading = Array.from(newLoadings.values()).find((l) => l.key === key)
        
        if (loading) {
          newLoadings.set(loading.id, {
            ...loading,
            message,
          })
        }

        return {
          loadings: newLoadings,
        }
      })
    },

    clearLoading: (key) => {
      set((state) => {
        const newLoadings = new Map(state.loadings)
        const newActiveLoadingKeys = new Set(state.activeLoadingKeys)

        const loading = Array.from(newLoadings.values()).find((l) => l.key === key)
        if (loading) {
          newLoadings.delete(loading.id)
        }

        newActiveLoadingKeys.delete(key)

        console.log('[LoadingStore] Loading cleared:', key)
        return {
          loadings: newLoadings,
          activeLoadingKeys: newActiveLoadingKeys,
          isLoading: newActiveLoadingKeys.size > 0,
        }
      })
    },

    clearAllLoadings: () => {
      console.log('[LoadingStore] All loadings cleared')
      set({
        loadings: new Map(),
        activeLoadingKeys: new Set(),
        isLoading: false,
      })
    },

    getLoadingByKey: (key) => {
      return Array.from(get().loadings.values()).find((l) => l.key === key)
    },

    getLoadingsByPriority: (priority) => {
      return Array.from(get().loadings.values()).filter((l) => l.priority === priority)
    },
  }))
)
