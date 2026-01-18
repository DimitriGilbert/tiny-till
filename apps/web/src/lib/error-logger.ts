import type {
  ErrorLog,
  ErrorStats,
  ErrorSeverity,
  ErrorFilterOptions,
  ErrorExportFormat,
  ErrorTimeline,
} from './error-types'
import type { ErrorContext } from './error-context'
import { getRecoverableErrorCodes } from './error-messages'

const ERROR_LOG_KEY = 'tiny-till-error-log'
const MAX_ERROR_LOGS = 500
const ERROR_LOG_VERSION = '1.0.0'

class ErrorLogger {
  private logs: ErrorLog[] = []
  private memoryCache: Map<string, ErrorLog> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  logError(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity = 'error'
  ): ErrorLog {
    const log: ErrorLog = {
      id: context.errorId || this.generateLogId(),
      timestamp: Date.now(),
      severity,
      type: this.categorizeError(error),
      code: this.extractErrorCode(error),
      message: error.message,
      context,
      stackTrace: error.stack,
      recoveryAttempted: false,
      resolved: false,
      retryCount: 0,
    }

    this.logs.unshift(log)
    this.memoryCache.set(log.id, log)

    if (this.logs.length > MAX_ERROR_LOGS) {
      const removed = this.logs.pop()
      if (removed) {
        this.memoryCache.delete(removed.id)
      }
    }

    this.saveToStorage()

    if (severity === 'critical' || severity === 'error') {
      console.error('[ErrorLogger]', log)
    } else if (severity === 'warning') {
      console.warn('[ErrorLogger]', log)
    } else {
      console.log('[ErrorLogger]', log)
    }

    return log
  }

  getRecentLogs(count: number = 50): ErrorLog[] {
    return this.logs.slice(0, count)
  }

  getLogsByType(type: string): ErrorLog[] {
    return this.logs.filter((log) => log.type === type)
  }

  getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter((log) => log.severity === severity)
  }

  getLogsByCode(code: string): ErrorLog[] {
    return this.logs.filter((log) => log.code === code)
  }

  getLogsByProductId(productId: string): ErrorLog[] {
    return this.logs.filter((log) => log.context.productId === productId)
  }

  filterLogs(options: ErrorFilterOptions): ErrorLog[] {
    return this.logs.filter((log) => {
      if (options.severity) {
        const severities = Array.isArray(options.severity)
          ? options.severity
          : [options.severity]
        if (!severities.includes(log.severity)) return false
      }

      if (options.type) {
        const types = Array.isArray(options.type) ? options.type : [options.type]
        if (!types.includes(log.type)) return false
      }

      if (options.code) {
        const codes = Array.isArray(options.code) ? options.code : [options.code]
        if (!codes.includes(log.code)) return false
      }

      if (options.resolved !== undefined && log.resolved !== options.resolved) {
        return false
      }

      if (options.startDate && log.timestamp < options.startDate) return false
      if (options.endDate && log.timestamp > options.endDate) return false

      if (options.searchQuery) {
        const query = options.searchQuery.toLowerCase()
        const searchableText = [
          log.message,
          log.code,
          log.context.fileName,
          log.context.productName,
          log.context.fieldName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      return true
    })
  }

  getStats(): ErrorStats {
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const byCode: Record<string, number> = {}
    const recoverableCodes = new Set(getRecoverableErrorCodes())

    let resolved = 0
    let unresolved = 0
    let recoverable = 0
    let nonRecoverable = 0
    let oldestTimestamp: number | undefined
    let newestTimestamp: number | undefined

    for (const log of this.logs) {
      byType[log.type] = (byType[log.type] || 0) + 1
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1
      byCode[log.code] = (byCode[log.code] || 0) + 1

      if (log.resolved) {
        resolved++
      } else {
        unresolved++
      }

      if (recoverableCodes.has(log.code as any)) {
        recoverable++
      } else {
        nonRecoverable++
      }

      if (!oldestTimestamp || log.timestamp < oldestTimestamp) {
        oldestTimestamp = log.timestamp
      }
      if (!newestTimestamp || log.timestamp > newestTimestamp) {
        newestTimestamp = log.timestamp
      }
    }

    return {
      total: this.logs.length,
      byType,
      bySeverity,
      byCode,
      resolved,
      unresolved,
      recoverable,
      nonRecoverable,
      oldestTimestamp,
      newestTimestamp,
    }
  }

  getTimeline(days: number = 7): ErrorTimeline[] {
    const timeline: Record<string, ErrorTimeline> = {}
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000
    const startDate = now - days * dayInMs

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + i * dayInMs)
      const dateStr = date.toISOString().split('T')[0]
      timeline[dateStr] = {
        date: dateStr,
        count: 0,
        bySeverity: {},
      }
    }

    for (const log of this.logs) {
      if (log.timestamp < startDate) continue

      const date = new Date(log.timestamp)
      const dateStr = date.toISOString().split('T')[0]

      if (timeline[dateStr]) {
        timeline[dateStr].count++
        timeline[dateStr].bySeverity[log.severity] =
          (timeline[dateStr].bySeverity[log.severity] || 0) + 1
      }
    }

    return Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date))
  }

  markAsResolved(id: string): void {
    const log = this.memoryCache.get(id)
    if (log) {
      log.resolved = true
      log.resolvedAt = Date.now()
      this.saveToStorage()
    }
  }

  markAsUnresolved(id: string): void {
    const log = this.memoryCache.get(id)
    if (log) {
      log.resolved = false
      delete log.resolvedAt
      this.saveToStorage()
    }
  }

  trackRetry(id: string, success: boolean): void {
    const log = this.memoryCache.get(id)
    if (log) {
      log.retryCount++
      log.lastRetryAt = Date.now()
      this.saveToStorage()
    }
  }

  clearLog(): void {
    this.logs = []
    this.memoryCache.clear()
    this.removeFromStorage()
  }

  exportLogs(): string {
    const exportData: ErrorExportFormat = {
      version: ERROR_LOG_VERSION,
      exportDate: new Date().toISOString(),
      applicationVersion: this.getApplicationVersion(),
      totalErrors: this.logs.length,
      errors: this.logs,
    }
    return JSON.stringify(exportData, null, 2)
  }

  private saveToStorage(): void {
    try {
      const data = JSON.stringify(this.logs)
      localStorage.setItem(ERROR_LOG_KEY, data)
    } catch (error) {
      console.error('[ErrorLogger] Failed to save logs to storage:', error)
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(ERROR_LOG_KEY)
      if (data) {
        this.logs = JSON.parse(data)
        this.logs.forEach((log) => {
          this.memoryCache.set(log.id, log)
        })
      }
    } catch (error) {
      console.error('[ErrorLogger] Failed to load logs from storage:', error)
      this.logs = []
      this.memoryCache.clear()
    }
  }

  private removeFromStorage(): void {
    try {
      localStorage.removeItem(ERROR_LOG_KEY)
    } catch (error) {
      console.error('[ErrorLogger] Failed to remove logs from storage:', error)
    }
  }

  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase()

    if (message.includes('storage') || message.includes('indexeddb')) {
      return 'storage'
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network'
    }
    if (message.includes('json') || message.includes('parse')) {
      return 'parse'
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation'
    }
    if (message.includes('conflict')) {
      return 'conflict'
    }
    if (message.includes('file') || message.includes('read')) {
      return 'file'
    }

    return 'unknown'
  }

  private extractErrorCode(error: Error): string {
    const message = error.message.toUpperCase()

    if (message.includes('STORAGE_QUOTA')) return 'STORAGE_QUOTA_EXCEEDED'
    if (message.includes('ACCESS_DENIED')) return 'FILE_ACCESS_DENIED'
    if (message.includes('INVALID_JSON')) return 'INVALID_JSON'
    if (message.includes('UNEXPECTED_TOKEN')) return 'UNEXPECTED_TOKEN'
    if (message.includes('VALIDATION')) return 'VALIDATION_FAILED'
    if (message.includes('DUPLICATE')) return 'DUPLICATE_PRODUCT_ID'
    if (message.includes('CONFLICT')) return 'CONFLICT_DETECTED'
    if (message.includes('VERSION')) return 'VERSION_CONFLICT'
    if (message.includes('NETWORK')) return 'NETWORK_ERROR'
    if (message.includes('TIMEOUT')) return 'REQUEST_TIMEOUT'
    if (message.includes('OFFLINE')) return 'OFFLINE_MODE'

    return 'UNKNOWN_ERROR'
  }

  private getApplicationVersion(): string {
    if (typeof import.meta !== 'undefined' && import.meta.env?.APP_VERSION) {
      return import.meta.env.APP_VERSION
    }
    return 'unknown'
  }
}

export const errorLogger = new ErrorLogger()
export default errorLogger
