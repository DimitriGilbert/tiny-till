import type { ZodError } from 'zod'
import { useErrorStore } from '@/stores/error-store'
import type { RecoveryAction } from '@/stores/error-store'

export async function recoverFromStorageError(error: Error): Promise<boolean> {
  const isQuotaError = error.message.includes('quota') || error.message.includes('QuotaExceeded')

  if (isQuotaError) {
    const recoveryAction: RecoveryAction = {
      id: 'clear-storage',
      label: 'Clear All Storage',
      description: 'This will delete all catalog data and settings',
      severity: 'required',
      execute: async () => {
        try {
          if (typeof indexedDB !== 'undefined') {
            const databases = await indexedDB.databases()
            for (const db of databases) {
              if (db.name) {
                indexedDB.deleteDatabase(db.name)
              }
            }
          }
          localStorage.clear()
          sessionStorage.clear()
          return true
        } catch {
          return false
        }
      },
    }

    useErrorStore.getState().addError({
      type: 'storage',
      severity: 'critical',
      message: 'Storage quota exceeded',
      details: { originalError: error.message },
      recoverable: true,
      recoveryActions: [recoveryAction],
    })

    return false
  }

  const recoveryAction: RecoveryAction = {
    id: 'reload-page',
    label: 'Reload Page',
    description: 'Reload the page to attempt recovery',
    severity: 'suggested',
    execute: async () => {
      window.location.reload()
      return true
    },
  }

  useErrorStore.getState().addError({
    type: 'storage',
    severity: 'high',
    message: 'Storage error occurred',
    details: { originalError: error.message },
    recoverable: true,
    recoveryActions: [recoveryAction],
  })

  return false
}

export async function recoverFromValidationError(error: ZodError): Promise<boolean> {
  const issues = error.issues

  const recoveryAction: RecoveryAction = {
    id: 'fix-validation',
    label: 'Review and Fix Inputs',
    description: 'Check the highlighted fields and correct the errors',
    severity: 'required',
    execute: async () => {
      return true
    },
  }

  useErrorStore.getState().addError({
    type: 'validation',
    severity: 'medium',
    message: 'Validation failed',
    details: { issues: issues.map((i) => i.message) },
    recoverable: true,
    recoveryActions: [recoveryAction],
  })

  return false
}

export async function recoverFromBusinessError(error: Error): Promise<boolean> {
  const recoveryAction: RecoveryAction = {
    id: 'retry-operation',
    label: 'Retry Operation',
    description: 'Try the operation again',
    severity: 'suggested',
    execute: async () => {
      return true
    },
  }

  useErrorStore.getState().addError({
    type: 'business',
    severity: 'medium',
    message: 'Business logic error',
    details: { originalError: error.message },
    recoverable: true,
    recoveryActions: [recoveryAction],
  })

  return false
}

export function suggestRecoveryAction(error: {
  type: string
  severity: string
  message: string
}): RecoveryAction | null {
  switch (error.type) {
    case 'storage': {
      if (error.severity === 'critical') {
        return {
          id: 'clear-storage',
          label: 'Clear Storage',
          description: 'Clear all storage to recover from quota error',
          severity: 'required',
          execute: async () => {
            try {
              localStorage.clear()
              sessionStorage.clear()
              return true
            } catch {
              return false
            }
          },
        }
      }
      return {
        id: 'reload-page',
        label: 'Reload Page',
        description: 'Reload to attempt recovery',
        severity: 'suggested',
        execute: async () => {
          window.location.reload()
          return true
        },
      }
    }
    case 'validation':
      return {
        id: 'fix-validation',
        label: 'Fix Validation Errors',
        description: 'Correct the highlighted fields',
        severity: 'required',
        execute: async () => true,
      }
    case 'business':
      return {
        id: 'retry-operation',
        label: 'Retry Operation',
        description: 'Try the operation again',
        severity: 'suggested',
        execute: async () => true,
      }
    default:
      return {
        id: 'report-error',
        label: 'Report Error',
        description: 'Report this error for investigation',
        severity: 'suggested',
        execute: async () => true,
      }
  }
}

export async function attemptDataRepair(corruptedData: unknown): Promise<boolean> {
  console.warn('[ErrorRecovery] Attempting data repair for:', corruptedData)

  if (Array.isArray(corruptedData)) {
    const repaired = corruptedData.filter((item) => {
      return item !== null && typeof item === 'object'
    })

    console.log('[ErrorRecovery] Repaired data:', repaired)
    return repaired.length > 0
  }

  if (corruptedData !== null && typeof corruptedData === 'object') {
    const repaired: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(corruptedData)) {
      if (value !== null && typeof value !== 'undefined') {
        repaired[key] = value
      }
    }

    console.log('[ErrorRecovery] Repaired data:', repaired)
    return Object.keys(repaired).length > 0
  }

  return false
}
