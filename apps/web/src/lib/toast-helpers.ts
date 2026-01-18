import { toast } from 'sonner'
import type { ImportProgress, ImportExecutionResult, ValidationIssue } from '@tiny-till/types'

export function showSuccessToast(message: string, description?: string): void {
  toast.success(message, description ? { description } : undefined)
}

export function showOperationSuccess(operation: string, count?: number): void {
  if (count !== undefined) {
    toast.success(`${operation} successful`, { description: `${count} item${count !== 1 ? 's' : ''} affected` })
  } else {
    toast.success(`${operation} successful`)
  }
}

export function showErrorToast(message: string, description?: string): void {
  toast.error(message, description ? { description } : undefined)
}

export function showValidationError(errors: string[]): void {
  const message = errors.length === 1 ? 'Validation Error' : 'Validation Errors'
  const description = errors.slice(0, 3).join('\n')
  const remaining = errors.length - 3

  if (remaining > 0) {
    toast.error(message, { description: `${description}\n...and ${remaining} more` })
  } else {
    toast.error(message, { description })
  }
}

export function showStorageError(action: string, error: Error): void {
  console.error(`[Storage] ${action} failed:`, error)
  toast.error('Storage Error', { description: `Failed to ${action.toLowerCase()}. ${error.message}` })
}

export function showBusinessError(message: string): void {
  toast.error('Business Logic Error', { description: message })
}

export function showWarningToast(message: string, description?: string): void {
  toast.warning(message, description ? { description } : undefined)
}

export function showDataIntegrityWarning(count: number): void {
  toast.warning('Data Integrity Issue', { description: `Found ${count} data integrity issue${count !== 1 ? 's' : ''}. Some data may be corrupted.` })
}

export function showQuotaWarning(percentage: number): void {
  toast.warning('Storage Quota Warning', { description: `${percentage}% of storage used. Consider exporting your catalog.` })
}

export function showInfoToast(message: string, description?: string): void {
  toast.info(message, description ? { description } : undefined)
}

export function showLoadingToast(message: string, promise: Promise<unknown>): void {
  toast.promise(promise, {
    loading: message,
    success: (result: unknown) => {
      if (result === null || result === undefined) {
        return 'Operation completed'
      }
      if (typeof result === 'object' && 'message' in result) {
        return (result as { message: string }).message
      }
      return 'Operation completed successfully'
    },
    error: (error: Error) => {
      console.error('[LoadingToast] Error:', error)
      return error.message || 'Operation failed'
    },
  })
}

export function showErrorWithRetry(
  message: string,
  onRetry: () => void,
  context?: Record<string, unknown>
): void {
  toast.error(message, {
    description: context ? JSON.stringify(context, null, 2) : undefined,
    action: {
      label: 'Retry',
      onClick: onRetry,
    },
  })
}

export function showImportProgress(title: string, progress: ImportProgress): void {
  const percentage = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0
  const estimatedTime = progress.estimatedTimeRemaining
    ? `~${Math.round(progress.estimatedTimeRemaining / 1000)}s remaining`
    : ''

  toast.loading(title, {
    description: `${percentage}% (${progress.processed}/${progress.total}) - Added: ${progress.added}, Updated: ${progress.updated}, Failed: ${progress.failed}${estimatedTime ? ` - ${estimatedTime}` : ''}`,
    id: 'import-progress',
  })
}

export function showImportSuccess(result: ImportExecutionResult): void {
  const message = `Import completed successfully`
  const description = `Added: ${result.added}, Updated: ${result.updated}, Skipped: ${result.skipped}`

  toast.success(message, {
    description,
    id: 'import-progress',
  })
}

export function showImportFailure(
  result: ImportExecutionResult,
  onRetry?: () => void
): void {
  const message = `Import failed`
  const description = `Added: ${result.added}, Updated: ${result.updated}, Failed: ${result.failed}`

  toast.error(message, {
    description,
    action: onRetry
      ? {
          label: 'Retry',
          onClick: onRetry,
        }
      : undefined,
    id: 'import-progress',
  })
}

export function showValidationErrorWithFix(
  issue: ValidationIssue,
  onFix?: () => void
): void {
  const severityLabel = issue.severity.level.toUpperCase()
  const description = issue.field
    ? `Field: ${issue.field} - ${issue.message}`
    : issue.message

  if (issue.severity.level === 'error' || issue.severity.level === 'critical') {
    toast.error(`${severityLabel}: ${issue.code}`, {
      description,
      action: onFix
        ? {
            label: 'Fix',
            onClick: onFix,
          }
        : undefined,
    })
  } else if (issue.severity.level === 'warning') {
    toast.warning(`${severityLabel}: ${issue.code}`, {
      description,
      action: onFix
        ? {
            label: 'Fix',
            onClick: onFix,
          }
        : undefined,
    })
  } else {
    toast.info(`${severityLabel}: ${issue.code}`, {
      description,
    })
  }
}

export function showStorageErrorWithRecovery(
  message: string,
  actions: Array<{ label: string; onClick: () => void }>
): void {
  toast.error(message, {
    action: actions.length > 0
      ? {
          label: actions[0].label,
          onClick: actions[0].onClick,
        }
      : undefined,
  })
}

export function showPartialImportResult(
  total: number,
  successful: number,
  failed: number,
  onRetryFailed?: () => void
): void {
  const message = 'Import partially completed'
  const description = `Successfully imported ${successful} of ${total} products. ${failed} failed.`

  toast.warning(message, {
    description,
    action: onRetryFailed && failed > 0
      ? {
          label: 'Retry Failed',
          onClick: onRetryFailed,
        }
      : undefined,
  })
}

export function showRetryInProgress(attempt: number, maxAttempts: number): void {
  toast.loading(`Retrying... (Attempt ${attempt} of ${maxAttempts})`)
}

export function showRetrySuccess(attempts: number): void {
  toast.success(`Operation succeeded after ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`)
}

export function showRetryFailed(attempts: number): void {
  toast.error(`Operation failed after ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`)
}
