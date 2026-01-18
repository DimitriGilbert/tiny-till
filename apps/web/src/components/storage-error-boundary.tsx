import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useStorage } from '@/hooks/use-storage'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class StorageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[StorageErrorBoundary] Storage error:', error)
    console.error('[StorageErrorBoundary] Error info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

function ErrorFallback({ error }: { error: Error | null }) {
  const { clearAllStorage } = useStorage()

  const handleClearAndReload = async () => {
    await clearAllStorage()
    window.location.reload()
  }

  const isQuotaError = error?.message.includes('quota') || error?.message.includes('QuotaExceeded')
  const isBlockedError = error?.message.includes('blocked') || error?.message.includes('access')

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 dark:from-red-950/50 dark:via-orange-950/50 dark:to-yellow-950/50">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-red-500/20 dark:bg-gray-900">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20 dark:bg-red-600" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 shadow-lg shadow-red-500/30 dark:from-red-600 dark:via-orange-600 dark:to-yellow-600">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Storage Oops!
          </h2>
        </div>

        <div className="mb-8 space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-300">
            {isQuotaError && (
              <>
                Your browser storage is full. Clear some data to continue using the
                app.
              </>
            )}
            {isBlockedError && (
              <>
                Storage access is blocked. This may happen in private browsing mode.
              </>
            )}
            {!isQuotaError && !isBlockedError && (
              <>
                Something went wrong with storage. Your data may not be saved
                correctly.
              </>
            )}
          </p>
          {error && (
            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleClearAndReload}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 dark:from-red-600 dark:to-orange-600 dark:hover:from-red-700 dark:hover:to-orange-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Storage & Reload
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
