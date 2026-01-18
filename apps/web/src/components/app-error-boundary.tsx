import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home, Trash2, Settings, Copy } from 'lucide-react'

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
  errorInfo: ErrorInfo | null
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AppErrorBoundary] Error caught:', error)
    console.error('[AppErrorBoundary] Error info:', errorInfo)

    const errorContext = {
      route: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    useErrorStore.getState().addError({
      type: 'unknown',
      severity: 'critical',
      message: 'Application Error',
      details: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        ...errorContext,
      },
      recoverable: true,
      recoveryActions: [
        {
          id: 'reload-page',
          label: 'Reload Page',
          description: 'Reload page to recover from this error',
          severity: 'suggested',
          execute: async () => {
            window.location.reload()
            return true
          },
        },
        {
          id: 'go-home',
          label: 'Go to Home',
          description: 'Navigate to the home page',
          severity: 'suggested',
          execute: async () => {
            window.location.href = '/'
            return true
          },
        },
        {
          id: 'clear-data',
          label: 'Clear All Data',
          description: 'Clear all local data and start fresh',
          severity: 'required',
          execute: async () => {
            try {
              localStorage.clear()
              sessionStorage.clear()
              const indexedDBRequest = indexedDB.deleteDatabase('tiny-till-catalog')
              await new Promise<void>((resolve, reject) => {
                indexedDBRequest.onsuccess = () => resolve()
                indexedDBRequest.onerror = reject
              })
              window.location.reload()
              return true
            } catch (e) {
              console.error('[AppErrorBoundary] Failed to clear data:', e)
              return false
            }
          },
        },
        {
          id: 'export-error',
          label: 'Export Error Log',
          description: 'Copy error details to clipboard for debugging',
          severity: 'suggested',
          execute: async () => {
            try {
              const errorLog = {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                context: errorContext,
              }
              await navigator.clipboard.writeText(JSON.stringify(errorLog, null, 2))
              toast.success('Error log copied to clipboard')
              return true
            } catch (e) {
              console.error('[AppErrorBoundary] Failed to copy error:', e)
              toast.error('Failed to copy error log')
              return false
            }
          },
        },
      ],
    })

    toast.error('Application Error', {
      description: 'An unexpected error occurred. Please try reloading the page.',
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultAppErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

function DefaultAppErrorFallback({ error }: { error: Error | null }) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleExportError = async () => {
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }
      await navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
      toast.success('Error details copied to clipboard')
    } catch (e) {
      console.error('Failed to copy error details:', e)
      toast.error('Failed to copy error details')
    }
  }

  const handleClearData = async () => {
    try {
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear()
        sessionStorage.clear()
        const indexedDBRequest = indexedDB.deleteDatabase('tiny-till-catalog')
        await new Promise<void>((resolve, reject) => {
          indexedDBRequest.onsuccess = () => resolve()
          indexedDBRequest.onerror = reject
        })
        window.location.reload()
      }
    } catch (e) {
      console.error('Failed to clear data:', e)
      toast.error('Failed to clear data')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 dark:from-red-950/50 dark:via-orange-950/50 dark:to-yellow-950/50">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/20 dark:bg-gray-900">
          <div className="mb-6 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20 dark:bg-red-600" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 shadow-lg shadow-red-500/30 dark:from-red-600 dark:via-orange-600 dark:to-yellow-600">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              An unexpected error occurred. Please try one of the recovery options below.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-950">
              <div className="mb-2 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Error Details
                  </p>
                  <p className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-400">
                    {error.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleReload}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 dark:from-red-600 dark:to-orange-600 dark:hover:from-red-700 dark:hover:to-orange-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleExportError}
                variant="outline"
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Error
              </Button>
              <Button
                onClick={handleClearData}
                variant="outline"
                className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/settings'}
                >
                  <Settings className="mr-1.5 h-4 w-4" />
                  Settings
                </Button>
                <span>
                  Need more help?{' '}
                  <a
                    href="https://github.com/anomalyco/opencode/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Report an issue
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}