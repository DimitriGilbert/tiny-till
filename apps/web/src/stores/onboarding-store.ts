import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/storage-keys'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: string
  image?: string
}

export interface OnboardingAnalytics {
  startedAt: number | null
  completedAt: number | null
  stepsViewed: string[]
  stepsSkipped: string[]
  totalTimeSpent: number
  totalStepsCompleted: number
  lastActivity: number
}

interface OnboardingState {
  isActive: boolean
  currentStepIndex: number
  isCompleted: boolean
  isSkipped: boolean
  analytics: OnboardingAnalytics
  version: string
}

interface OnboardingActions {
  startOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  goToStep: (index: number) => void
  trackStepView: (stepId: string) => void
  trackStepSkip: (stepId: string) => void
  markStepCompleted: (stepId: string) => void
  updateLastActivity: () => void
}

type OnboardingStore = OnboardingState & OnboardingActions

const ONBOARDING_VERSION = '1.0.0'

const initialAnalytics: OnboardingAnalytics = {
  startedAt: null,
  completedAt: null,
  stepsViewed: [],
  stepsSkipped: [],
  totalTimeSpent: 0,
  totalStepsCompleted: 0,
  lastActivity: 0,
}

const initialState: OnboardingState = {
  isActive: false,
  currentStepIndex: 0,
  isCompleted: false,
  isSkipped: false,
  analytics: initialAnalytics,
  version: ONBOARDING_VERSION,
}

export const useOnboardingStore = create<OnboardingStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        startOnboarding: () => {
          const state = get()
          const now = Date.now()
          set({
            isActive: true,
            currentStepIndex: 0,
            isCompleted: false,
            isSkipped: false,
            analytics: {
              ...initialAnalytics,
              startedAt: now,
              lastActivity: now,
            },
          })
        },

        nextStep: () => {
          const state = get()
          const nextIndex = state.currentStepIndex + 1
          set({
            currentStepIndex: nextIndex,
            analytics: {
              ...state.analytics,
              lastActivity: Date.now(),
            },
          })
        },

        previousStep: () => {
          const state = get()
          const prevIndex = Math.max(0, state.currentStepIndex - 1)
          set({
            currentStepIndex: prevIndex,
            analytics: {
              ...state.analytics,
              lastActivity: Date.now(),
            },
          })
        },

        skipOnboarding: () => {
          const state = get()
          const now = Date.now()
          const totalTimeSpent = state.analytics.startedAt 
            ? now - state.analytics.startedAt 
            : 0
          
          set({
            isActive: false,
            isSkipped: true,
            isCompleted: false,
            analytics: {
              ...state.analytics,
              completedAt: now,
              totalTimeSpent,
              lastActivity: now,
            },
          })
        },

        completeOnboarding: () => {
          const state = get()
          const now = Date.now()
          const totalTimeSpent = state.analytics.startedAt 
            ? now - state.analytics.startedAt 
            : 0
          
          set({
            isActive: false,
            isCompleted: true,
            isSkipped: false,
            analytics: {
              ...state.analytics,
              completedAt: now,
              totalTimeSpent,
              lastActivity: now,
            },
          })
        },

        resetOnboarding: () => {
          set({
            ...initialState,
          })
        },

        goToStep: (index: number) => {
          set({
            currentStepIndex: index,
            analytics: {
              ...get().analytics,
              lastActivity: Date.now(),
            },
          })
        },

        trackStepView: (stepId: string) => {
          const state = get()
          const stepsViewed = [...state.analytics.stepsViewed]
          if (!stepsViewed.includes(stepId)) {
            stepsViewed.push(stepId)
          }
          set({
            analytics: {
              ...state.analytics,
              stepsViewed,
              lastActivity: Date.now(),
            },
          })
        },

        trackStepSkip: (stepId: string) => {
          const state = get()
          const stepsSkipped = [...state.analytics.stepsSkipped]
          if (!stepsSkipped.includes(stepId)) {
            stepsSkipped.push(stepId)
          }
          set({
            analytics: {
              ...state.analytics,
              stepsSkipped,
              lastActivity: Date.now(),
            },
          })
        },

        markStepCompleted: (stepId: string) => {
          const state = get()
          const stepsViewed = [...state.analytics.stepsViewed]
          if (!stepsViewed.includes(stepId)) {
            stepsViewed.push(stepId)
          }
          set({
            analytics: {
              ...state.analytics,
              stepsViewed,
              totalStepsCompleted: state.analytics.totalStepsCompleted + 1,
              lastActivity: Date.now(),
            },
          })
        },

        updateLastActivity: () => {
          set({
            analytics: {
              ...get().analytics,
              lastActivity: Date.now(),
            },
          })
        },
      }),
      {
        name: STORAGE_KEYS.ONBOARDING_COMPLETED,
      }
    )
  )
)
