import type { ErrorContext } from './error-context'
import type { Severity } from '@/stores/error-store'

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

export interface ErrorLog {
  id: string
  timestamp: number
  severity: ErrorSeverity
  type: string
  code: string
  message: string
  context: ErrorContext
  stackTrace?: string
  recoveryAttempted: boolean
  resolved: boolean
  resolvedAt?: number
  retryCount: number
  lastRetryAt?: number
  additionalData?: Record<string, unknown>
}

export interface ErrorStats {
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  byCode: Record<string, number>
  resolved: number
  unresolved: number
  recoverable: number
  nonRecoverable: number
  oldestTimestamp?: number
  newestTimestamp?: number
}

export interface ErrorFilterOptions {
  severity?: ErrorSeverity | ErrorSeverity[]
  type?: string | string[]
  code?: string | string[]
  resolved?: boolean
  startDate?: number
  endDate?: number
  searchQuery?: string
}

export interface ErrorExportFormat {
  version: string
  exportDate: string
  applicationVersion: string
  totalErrors: number
  errors: ErrorLog[]
}

export interface ErrorRecoveryAttempt {
  attemptNumber: number
  timestamp: number
  action: string
  success: boolean
  duration: number
  error?: string
}

export interface ErrorTimeline {
  date: string
  count: number
  bySeverity: Record<string, number>
}
