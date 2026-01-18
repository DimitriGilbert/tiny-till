import * as React from 'react'
import { AlertTriangle, Info, Copy, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ErrorEntry } from '@/stores/error-store'
import { getErrorMessage, type ErrorCode } from '@/lib/error-messages'

export interface ErrorDetailToastProps {
  error: ErrorEntry
  onRetry?: () => void
  onDismiss?: () => void
  onViewDetails?: () => void
  onCopyError?: () => void
}

export function ErrorDetailToast({
  error,
  onRetry,
  onDismiss,
  onViewDetails,
  onCopyError,
}: ErrorDetailToastProps) {
  const [expanded, setExpanded] = React.useState(false)
  const errorMsg = error.code ? getErrorMessage(error.code as ErrorCode) : null
  const isDev = import.meta.env.DEV

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[severity as keyof typeof colors] || colors.low
  }

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'low':
        return <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
  }

  const copyToClipboard = () => {
    const text = JSON.stringify(
      {
        code: error.code,
        type: error.type,
        severity: error.severity,
        message: error.message,
        details: error.details,
        timestamp: new Date(error.timestamp).toISOString(),
      },
      null,
      2
    )
    navigator.clipboard.writeText(text)
    onCopyError?.()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {getSeverityIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{errorMsg?.title || 'Error'}</span>
              <Badge className={getSeverityColor(error.severity)} variant="secondary">
                {error.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {error.recoverable && onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline">
          Retry
        </Button>
      )}

      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full justify-between px-2"
        >
          <span className="text-sm font-medium">Error Details</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {expanded && (
          <div className="space-y-3 rounded-lg border bg-muted/50 p-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Error Code</p>
              <code className="text-sm">{error.code}</code>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Type</p>
              <p className="text-sm capitalize">{error.type}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Timestamp</p>
              <p className="text-sm">
                {new Date(error.timestamp).toLocaleString()}
              </p>
            </div>

            {error.details && Object.keys(error.details).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Additional Details
                </p>
                <pre className="overflow-x-auto rounded bg-background p-2 text-xs">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </div>
            )}

            {isDev && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Stack Trace (Dev Mode)
                </p>
                <pre className="overflow-x-auto rounded bg-background p-2 text-xs text-muted-foreground">
                  {error.type === 'unknown' ? 'No stack trace available' : 'Stack trace not captured in toast'}
                </pre>
              </div>
            )}

            {errorMsg && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Recovery Steps
                </p>
                <ol className="list-inside list-decimal space-y-1 text-sm">
                  {errorMsg.recoverySteps.map((step) => (
                    <li key={step.substring(0, 20)} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Error
              </Button>
              {onViewDetails && (
                <Button variant="outline" size="sm" onClick={onViewDetails}>
                  View Full Details
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
