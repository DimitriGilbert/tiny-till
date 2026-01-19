import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@/lib/storage-keys'

export type FeedbackType = 'bug' | 'feature' | 'support' | 'general'

export type FeedbackSeverity = 'critical' | 'high' | 'medium' | 'low'

export type FeedbackPriority = 'critical' | 'important' | 'nice-to-have'

export type FeedbackCategory = 'ui-ux' | 'performance' | 'feature' | 'documentation' | 'other'

export interface FeedbackAttachment {
  id: string
  name: string
  type: string
  size: number
  data: string
}

export interface FeedbackSubmission {
  id: string
  type: FeedbackType
  subject: string
  description: string
  severity?: FeedbackSeverity
  priority?: FeedbackPriority
  category: FeedbackCategory
  attachments: FeedbackAttachment[]
  email?: string
  consent: boolean
  timestamp: number
  status: 'pending' | 'queued' | 'submitted' | 'failed'
  errorMessage?: string
  environment?: string
}

interface FeedbackState {
  recentFeedback: FeedbackSubmission[]
  draftFeedback: Partial<FeedbackSubmission>
  feedbackQueue: FeedbackSubmission[]
  isSubmitting: boolean
  lastSubmissionTime: number | null
  submissionHistory: FeedbackSubmission[]
}

interface FeedbackActions {
  setDraftFeedback: (draft: Partial<FeedbackSubmission>) => void
  updateDraftFeedback: (updates: Partial<FeedbackSubmission>) => void
  clearDraftFeedback: () => void
  submitFeedback: (feedback: Omit<FeedbackSubmission, 'id' | 'timestamp' | 'status'>) => Promise<void>
  addToQueue: (feedback: FeedbackSubmission) => void
  processQueue: () => Promise<void>
  clearQueue: () => void
  addAttachment: (attachment: FeedbackAttachment) => void
  removeAttachment: (attachmentId: string) => void
  getFeedbackById: (id: string) => FeedbackSubmission | undefined
  getFeedbackByType: (type: FeedbackType) => FeedbackSubmission[]
}

type FeedbackStore = FeedbackState & FeedbackActions

const initialState: Omit<FeedbackState, 'isHydrated'> = {
  recentFeedback: [],
  draftFeedback: {},
  feedbackQueue: [],
  isSubmitting: false,
  lastSubmissionTime: null,
  submissionHistory: [],
}

export const useFeedbackStore = create<FeedbackStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setDraftFeedback: (draft: Partial<FeedbackSubmission>) => {
          set({ draftFeedback: draft })
        },

        updateDraftFeedback: (updates: Partial<FeedbackSubmission>) => {
          set((state) => ({
            draftFeedback: { ...state.draftFeedback, ...updates },
          }))
        },

        clearDraftFeedback: () => {
          set({ draftFeedback: {} })
        },

        submitFeedback: async (feedback: Omit<FeedbackSubmission, 'id' | 'timestamp' | 'status'>) => {
          set({ isSubmitting: true })

          const newFeedback: FeedbackSubmission = {
            ...feedback,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            status: 'pending',
          }

          try {
            if (!navigator.onLine) {
              set((state) => ({
                feedbackQueue: [...state.feedbackQueue, newFeedback],
                recentFeedback: [newFeedback, ...state.recentFeedback].slice(0, 10),
                isSubmitting: false,
              }))
              return
            }

            await new Promise((resolve) => setTimeout(resolve, 1000))

            set((state) => ({
              recentFeedback: [newFeedback, ...state.recentFeedback].slice(0, 10),
              submissionHistory: [newFeedback, ...state.submissionHistory].slice(0, 50),
              lastSubmissionTime: Date.now(),
              isSubmitting: false,
            }))
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            set((state) => ({
              recentFeedback: [newFeedback, ...state.recentFeedback].slice(0, 10),
              feedbackQueue: [...state.feedbackQueue, newFeedback],
              isSubmitting: false,
            }))
            throw error
          }
        },

        addToQueue: (feedback: FeedbackSubmission) => {
          set((state) => ({
            feedbackQueue: [...state.feedbackQueue, feedback],
          }))
        },

        processQueue: async () => {
          if (!navigator.onLine) return

          const { feedbackQueue } = get()
          if (feedbackQueue.length === 0) return

          set({ isSubmitting: true })

          const processedFeedback: FeedbackSubmission[] = []

          for (const feedback of feedbackQueue) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 500))
              processedFeedback.push(feedback)
            } catch (error) {
              console.error('Failed to submit feedback:', error)
            }
          }

          set((state) => ({
            feedbackQueue: state.feedbackQueue.filter((f) => !processedFeedback.includes(f)),
            submissionHistory: [
              ...processedFeedback.map((f) => ({ ...f, status: 'submitted' as const })),
              ...state.submissionHistory,
            ].slice(0, 50),
            isSubmitting: false,
          }))
        },

        clearQueue: () => {
          set({ feedbackQueue: [] })
        },

        addAttachment: (attachment: FeedbackAttachment) => {
          set((state) => ({
            draftFeedback: {
              ...state.draftFeedback,
              attachments: [...(state.draftFeedback.attachments || []), attachment],
            },
          }))
        },

        removeAttachment: (attachmentId: string) => {
          set((state) => ({
            draftFeedback: {
              ...state.draftFeedback,
              attachments: state.draftFeedback.attachments?.filter((a) => a.id !== attachmentId),
            },
          }))
        },

        getFeedbackById: (id: string) => {
          return get().recentFeedback.find((f) => f.id === id)
        },

        getFeedbackByType: (type: FeedbackType) => {
          return get().recentFeedback.filter((f) => f.type === type)
        },
      }),
      {
        name: STORAGE_KEYS.FEEDBACK,
        partialize: (state) => ({
          recentFeedback: state.recentFeedback,
          feedbackQueue: state.feedbackQueue,
          submissionHistory: state.submissionHistory,
          lastSubmissionTime: state.lastSubmissionTime,
        }),
        onRehydrateStorage: () => (state: FeedbackStore | undefined) => {
          if (state) {
            state.draftFeedback = {}
            state.isSubmitting = false
          }
        },
      }
    )
  )
)
