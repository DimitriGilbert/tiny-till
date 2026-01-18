import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useErrorStore } from '@/stores/error-store'
import type { RecoveryAction } from '@/stores/error-store'
import { toast } from 'sonner'

interface ErrorRecoveryDialogProps {
  isOpen: boolean
  onClose: () => void
  errorId: string
}

export function ErrorRecoveryDialog({
  isOpen,
  onClose,
  errorId,
}: ErrorRecoveryDialogProps) {
  const errors = useErrorStore((state) => Array.from(state.errors.values()))
  const error = errors.find((e) => e.id === errorId)

  if (!error) {
    return null
  }

  const handleExecuteRecovery = async (action: RecoveryAction) => {
    try {
      toast.loading('Executing recovery action...')
      const success = await useErrorStore.getState().executeRecovery(errorId, action.id)

      if (success) {
        toast.success('Recovery successful')
        onClose()
      } else {
        toast.error('Recovery failed. Please try another action.')
      }
    } catch (error) {
      toast.error('Recovery failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getSeverityBadge = () => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[error.severity]}`}
      >
        {error.severity.charAt(0).toUpperCase() + error.severity.slice(1)}
      </span>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {getSeverityIcon()}
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {error.type.charAt(0).toUpperCase() + error.type.slice(1)} Error
              </DialogTitle>
              <div className="mt-2">{getSeverityBadge()}</div>
            </div>
          </div>
          <DialogDescription className="mt-4">{error.message}</DialogDescription>
        </DialogHeader>

        {error.details && Object.keys(error.details).length > 0 && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-900">
            <h4 className="mb-2 text-sm font-semibold">Error Details</h4>
            <pre className="overflow-x-auto text-xs text-gray-600 dark:text-gray-400">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </div>
        )}

        {error.recoverable && error.recoveryActions && error.recoveryActions.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-3 text-sm font-semibold">Recovery Actions</h4>
            <div className="space-y-2">
              {error.recoveryActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between rounded-md border border-gray-200 p-3 dark:border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold">{action.label}</h5>
                      {action.severity === 'required' && (
                        <span className="text-xs text-red-600 dark:text-red-400">(Required)</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleExecuteRecovery(action)}
                    variant={action.severity === 'required' ? 'default' : 'outline'}
                  >
                    Execute
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!error.acknowledged && (
            <Button
              variant="ghost"
              onClick={() => {
                useErrorStore.getState().acknowledgeError(errorId)
                onClose()
              }}
            >
              Acknowledge
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
