import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useErrorStore } from '@/stores/error-store'
import { toast } from 'sonner'

interface ValidationErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ValidationErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ValidationErrorBoundary extends Component<
  ValidationErrorBoundaryProps,
  ValidationErrorBoundaryState
> {
  constructor(props: ValidationErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ValidationErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ValidationErrorBoundary] Validation error:', error)
    console.error('[ValidationErrorBoundary] Error info:', errorInfo)

    useErrorStore.getState().addError({
      type: 'validation',
      severity: 'medium',
      message: 'Validation component error',
      details: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
      recoverable: true,
      recoveryActions: [
        {
          id: 'reload-page',
          label: 'Reload Page',
          description: 'Reload to recover from validation error',
          severity: 'suggested',
          execute: async () => {
            window.location.reload()
            return true
          },
        },
      ],
    })

    toast.error('Validation Error', {
      description: 'A validation error occurred. Please reload the page.',
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultValidationFallback error={this.state.error} />
    }

    return this.props.children
  }
}

function DefaultValidationFallback({ error }: { error: Error | null }) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4 dark:from-yellow-950/50 dark:via-orange-950/50 dark:to-red-950/50">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-yellow-500/20 dark:bg-gray-900">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-20 dark:bg-yellow-600" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-lg shadow-yellow-500/30 dark:from-yellow-600 dark:via-orange-600 dark:to-red-600">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Validation Error
          </h2>
        </div>

        <div className="mb-8 space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-300">
            A validation error occurred while processing your data. Please check your
            inputs and try again.
          </p>
          {error && (
            <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-950">
              <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleReload}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 dark:from-yellow-600 dark:to-orange-600 dark:hover:from-yellow-700 dark:hover:to-orange-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  )
}
