import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RecoveryProgressProps {
  steps: RecoveryStep[]
  currentStepIndex: number
  isComplete: boolean
  hasError: boolean
  error?: string
  onCancel?: () => void
  className?: string
}

export interface RecoveryStep {
  id: string
  label: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  duration?: number
  error?: string
}

export function RecoveryProgress({
  steps,
  currentStepIndex,
  isComplete,
  hasError,
  error,
  onCancel,
  className,
}: RecoveryProgressProps) {
  const progress = ((currentStepIndex + 1) / steps.length) * 100
  const currentStep = steps[currentStepIndex]

  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : hasError ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          )}
          <h3 className="text-lg font-semibold">
            {hasError ? 'Recovery Failed' : isComplete ? 'Recovery Complete' : 'Recovering...'}
          </h3>
        </div>
        {onCancel && !isComplete && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {!isComplete && (
        <Progress value={progress} className="mb-4" />
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex items-start gap-3 rounded-md border p-3',
              step.status === 'completed' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
              step.status === 'failed' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
              step.status === 'in-progress' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
              step.status === 'pending' && 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
            )}
          >
            <div className="mt-0.5">
              {step.status === 'completed' && (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              )}
              {step.status === 'failed' && (
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              {step.status === 'in-progress' && (
                <Loader2 className="h-4 w-4 text-blue-500 flex-shrink-0 animate-spin" />
              )}
              {step.status === 'pending' && (
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{step.label}</span>
                {step.duration && step.status === 'completed' && (
                  <span className="text-xs text-muted-foreground">
                    {step.duration}ms
                  </span>
                )}
              </div>

              {step.error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {step.error}
                </p>
              )}

              {step.status === 'in-progress' && index === currentStepIndex && (
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                  Processing...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasError && error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-950">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      {isComplete && (
        <div className="mt-4 rounded-md bg-green-50 p-4 dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Recovery completed successfully. All operations have been restored.
          </p>
        </div>
      )}

      {!isComplete && !hasError && currentStep && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Estimated time remaining: {((steps.length - currentStepIndex - 1) * 1.5).toFixed(0)}s
          </p>
        </div>
      )}
    </div>
  )
}
