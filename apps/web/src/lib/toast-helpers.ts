import { toast } from 'sonner'

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
