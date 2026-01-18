import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ErrorLog, ErrorStats, ErrorSeverity } from '@/lib/error-types'
import { errorLogger } from '@/lib/error-logger'

export type ErrorType = 'validation' | 'storage' | 'network' | 'business' | 'unknown'
export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface RecoveryAction {
  id: string
  label: string
  description: string
  severity: 'suggested' | 'required'
  execute: () => Promise<boolean>
}

export interface ErrorEntry {
  id: string
  type: ErrorType
  severity: Severity
  code?: string
  message: string
  details?: Record<string, unknown>
  timestamp: number
  acknowledged: boolean
  recoverable: boolean
  recoveryActions?: RecoveryAction[]
}

interface ErrorInput {
  type: ErrorType
  severity: Severity
  code?: string
  message: string
  details?: Record<string, unknown>
  recoverable?: boolean
  recoveryActions?: RecoveryAction[]
  errorId?: string
}

interface ErrorState {
  errors: Map<string, ErrorEntry>
  lastError: ErrorEntry | null
  hasUnacknowledgedErrors: boolean
}

interface ErrorActions {
  addError: (error: ErrorInput) => void
  acknowledgeError: (id: string) => void
  clearError: (id: string) => void
  clearAllErrors: () => void
  getErrorsByType: (type: ErrorType) => ErrorEntry[]
  getErrorsBySeverity: (severity: Severity) => ErrorEntry[]
  executeRecovery: (errorId: string, actionId: string) => Promise<boolean>
  getErrorLogs: () => ErrorLog[]
  getErrorStats: () => ErrorStats
  markErrorAsResolved: (id: string) => void
  trackRecoveryAttempt: (errorId: string, success: boolean) => void
  exportErrorLog: () => string
}

type ErrorStore = ErrorState & ErrorActions

const initialState: ErrorState = {
  errors: new Map(),
  lastError: null,
  hasUnacknowledgedErrors: false,
}

export const useErrorStore = create<ErrorStore>()(
  devtools((set, get) => ({
    ...initialState,

    addError: (error: ErrorInput) => {
      const id = error.errorId || `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const errorEntry: ErrorEntry = {
        id,
        ...error,
        timestamp: Date.now(),
        acknowledged: false,
        recoverable: error.recoverable ?? false,
      }

      set((state) => {
        const newErrors = new Map(state.errors)
        newErrors.set(id, errorEntry)
        const hasUnacknowledged = Array.from(newErrors.values()).some((e) => !e.acknowledged)

        console.error('[ErrorStore] Error added:', errorEntry)
        return {
          errors: newErrors,
          lastError: errorEntry,
          hasUnacknowledgedErrors: hasUnacknowledged,
        }
      })

      errorLogger.logError(new Error(error.message), {
        operation: error.type,
        timestamp: Date.now(),
        errorId: id,
        additionalData: error.details,
      } as any)
    },

    acknowledgeError: (id: string) => {
      set((state) => {
        const newErrors = new Map(state.errors)
        const error = newErrors.get(id)
        if (error) {
          newErrors.set(id, { ...error, acknowledged: true })
        }
        const hasUnacknowledged = Array.from(newErrors.values()).some((e) => !e.acknowledged)

        console.log('[ErrorStore] Error acknowledged:', id)
        return {
          errors: newErrors,
          hasUnacknowledgedErrors: hasUnacknowledged,
        }
      })
    },

    clearError: (id: string) => {
      set((state) => {
        const newErrors = new Map(state.errors)
        newErrors.delete(id)
        const hasUnacknowledged = Array.from(newErrors.values()).some((e) => !e.acknowledged)
        const lastError = newErrors.size > 0 ? Array.from(newErrors.values()).at(-1)! : null

        console.log('[ErrorStore] Error cleared:', id)
        return {
          errors: newErrors,
          lastError,
          hasUnacknowledgedErrors: hasUnacknowledged,
        }
      })
    },

    clearAllErrors: () => {
      console.log('[ErrorStore] All errors cleared')
      set({
        errors: new Map(),
        lastError: null,
        hasUnacknowledgedErrors: false,
      })
    },

    getErrorsByType: (type: ErrorType) => {
      return Array.from(get().errors.values()).filter((e) => e.type === type)
    },

    getErrorsBySeverity: (severity: Severity) => {
      return Array.from(get().errors.values()).filter((e) => e.severity === severity)
    },

    executeRecovery: async (errorId: string, actionId: string) => {
      const error = get().errors.get(errorId)
      if (!error || !error.recoveryActions) {
        console.warn('[ErrorStore] Recovery failed: Error or actions not found')
        return false
      }

      const action = error.recoveryActions.find((a) => a.id === actionId)
      if (!action) {
        console.warn('[ErrorStore] Recovery failed: Action not found')
        return false
      }

      try {
        console.log('[ErrorStore] Executing recovery action:', actionId)
        const success = await action.execute()
        get().trackRecoveryAttempt(errorId, success)
        if (success) {
          get().acknowledgeError(errorId)
          get().markErrorAsResolved(errorId)
          console.log('[ErrorStore] Recovery successful:', actionId)
        } else {
          console.warn('[ErrorStore] Recovery failed:', actionId)
        }
        return success
      } catch (error) {
        console.error('[ErrorStore] Recovery error:', error)
        get().trackRecoveryAttempt(errorId, false)
        return false
      }
    },

    getErrorLogs: () => {
      return errorLogger.getRecentLogs(500)
    },

    getErrorStats: () => {
      return errorLogger.getStats()
    },

    markErrorAsResolved: (id: string) => {
      set((state) => {
        const newErrors = new Map(state.errors)
        const error = newErrors.get(id)
        if (error) {
          newErrors.set(id, { ...error, acknowledged: true })
        }
        const hasUnacknowledged = Array.from(newErrors.values()).some((e) => !e.acknowledged)

        console.log('[ErrorStore] Error marked as resolved:', id)
        return {
          errors: newErrors,
          hasUnacknowledgedErrors: hasUnacknowledged,
        }
      })

      errorLogger.markAsResolved(id)
    },

    trackRecoveryAttempt: (errorId: string, success: boolean) => {
      errorLogger.trackRetry(errorId, success)
      console.log('[ErrorStore] Recovery attempt tracked:', errorId, success)
    },

    exportErrorLog: () => {
      return errorLogger.exportLogs()
    },
  }))
)
