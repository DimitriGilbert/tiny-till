import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@/lib/storage-keys'

interface HelpState {
  dismissedBubbles: Set<string>
  viewedHelpPages: Set<string>
  lastHelpView: number | null
  bubbleAnalytics: Map<string, { views: number; dismissals: number; lastViewed: number }>
  onboardingComplete: boolean
}

interface HelpActions {
  dismissBubble: (id: string) => void
  markHelpViewed: (pageId: string) => void
  resetHelpProgress: () => void
  hasSeenBubble: (id: string) => boolean
  trackBubbleView: (id: string) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  getBubbleStats: (id: string) => { views: number; dismissals: number; lastViewed: number } | undefined
}

type HelpStore = HelpState & HelpActions

const initialState: Omit<HelpState, 'isHydrated'> = {
  dismissedBubbles: new Set(),
  viewedHelpPages: new Set(),
  lastHelpView: null,
  bubbleAnalytics: new Map(),
  onboardingComplete: false,
}

export const useHelpStore = create<HelpStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        dismissBubble: (id: string) => {
          const { bubbleAnalytics } = get()
          const currentStats = bubbleAnalytics.get(id) || { views: 0, dismissals: 0, lastViewed: 0 }
          const newAnalytics = new Map(bubbleAnalytics)
          newAnalytics.set(id, {
            ...currentStats,
            dismissals: currentStats.dismissals + 1,
            lastViewed: Date.now(),
          })
          set({ dismissedBubbles: new Set(get().dismissedBubbles).add(id), bubbleAnalytics: newAnalytics })
        },

        markHelpViewed: (pageId: string) => {
          set({
            viewedHelpPages: new Set(get().viewedHelpPages).add(pageId),
            lastHelpView: Date.now(),
          })
        },

        resetHelpProgress: () => {
          set({
            dismissedBubbles: new Set(),
            viewedHelpPages: new Set(),
            lastHelpView: null,
            bubbleAnalytics: new Map(),
          })
        },

        hasSeenBubble: (id: string) => {
          return get().dismissedBubbles.has(id)
        },

        trackBubbleView: (id: string) => {
          const { bubbleAnalytics } = get()
          const currentStats = bubbleAnalytics.get(id) || { views: 0, dismissals: 0, lastViewed: 0 }
          const newAnalytics = new Map(bubbleAnalytics)
          newAnalytics.set(id, {
            ...currentStats,
            views: currentStats.views + 1,
            lastViewed: Date.now(),
          })
          set({ bubbleAnalytics: newAnalytics })
        },

        completeOnboarding: () => {
          set({ onboardingComplete: true })
        },

        resetOnboarding: () => {
          set({ onboardingComplete: false })
        },

        getBubbleStats: (id: string) => {
          return get().bubbleAnalytics.get(id)
        },
      }),
      {
        name: STORAGE_KEYS.HELP,
        partialize: (state) => ({
          dismissedBubbles: Array.from(state.dismissedBubbles),
          viewedHelpPages: Array.from(state.viewedHelpPages),
          lastHelpView: state.lastHelpView,
          bubbleAnalytics: Array.from(state.bubbleAnalytics.entries()),
          onboardingComplete: state.onboardingComplete,
        }),
        onRehydrateStorage: () => (state: HelpStore | undefined) => {
          if (state) {
            state.dismissedBubbles = new Set(state.dismissedBubbles as unknown as string[])
            state.viewedHelpPages = new Set(state.viewedHelpPages as unknown as string[])
            state.bubbleAnalytics = new Map(state.bubbleAnalytics as unknown as [string, { views: number; dismissals: number; lastViewed: number }][])
          }
        },
      }
    )
  )
)
