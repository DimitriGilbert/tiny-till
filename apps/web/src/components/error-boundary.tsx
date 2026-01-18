import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useErrorStore } from '@/stores/error-store'
import { toast } from 'sonner'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] React error:', error)
    console.error('[ErrorBoundary] Error info:', errorInfo)

    useErrorStore.getState().addError({
      type: 'unknown',
      severity: 'high',
      message: 'React component error',
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
          description: 'Reload the page to recover',
          severity: 'suggested',
          execute: async () => {
            window.location.reload()
            return true
          },
        },
      ],
    })

    toast.error('Application Error', {
      description: 'An unexpected error occurred. Please reload the page.',
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error }: { error: Error | null }) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 dark:from-red-950/50 dark:via-orange-950/50 dark:to-yellow-950/50">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/20 dark:bg-gray-900">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20 dark:bg-red-600" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 shadow-lg shadow-red-500/30 dark:from-red-600 dark:via-orange-600 dark:to-yellow-600">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
        </div>

        <div className="mb-8 space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-300">
            An unexpected error occurred while rendering this page. This error has been logged.
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
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 dark:from-red-600 dark:to-orange-600 dark:hover:from-red-700 dark:hover:to-orange-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
          <Button variant="outline" onClick={handleGoHome} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
