import * as React from 'react'
import { AlertTriangle, HardDrive, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStorageStore } from '@/stores/storage-store'
import { formatBytes } from '@tiny-till/types'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export function StorageWarningAlert() {
  const navigate = useNavigate()
  const {
    storageInfo,
    warningLevel,
    warningDismissed,
    isLoading,
    checkStorage,
    dismissWarning,
  } = useStorageStore()

  React.useEffect(() => {
    checkStorage()
  }, [checkStorage])

  if (isLoading || !storageInfo) {
    return null
  }

  if (warningLevel === 'normal') {
    return null
  }

  if (warningDismissed) {
    return null
  }

  const isCritical = warningLevel === 'critical'
  const isWarning = warningLevel === 'warning'

  const alertClass = isCritical
    ? 'border-destructive bg-destructive/10 text-destructive'
    : 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-200'

  const iconClass = isCritical ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-500'

  const title = isCritical
    ? 'Storage Almost Full!'
    : 'Storage Running Low'

  const message = isCritical
    ? `You're using ${storageInfo.percentage.toFixed(0)}% of your available storage. Please free up space soon.`
    : `You're using ${storageInfo.percentage.toFixed(0)}% of your available storage. Consider removing unused products.`

  const handleDismiss = () => {
    dismissWarning()
  }

  const handleRefresh = async () => {
    await checkStorage()
    toast.success('Storage info refreshed')
  }

  const handleManageStorage = () => {
    navigate({ to: '/settings' })
  }

  return (
    <Alert className={alertClass}>
      <AlertTriangle className={`h-4 w-4 ${iconClass}`} />
      <div className="flex-1">
        <AlertTitle className="flex items-center gap-2">
          {title}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleRefresh}
            className="ml-auto h-5 w-5"
            title="Refresh storage info"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-1">
          <div className="flex flex-col gap-2">
            <p>{message}</p>
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4" />
              <span className="font-medium">
                {formatBytes(storageInfo.quotaUsed)} of {formatBytes(storageInfo.quotaLimit)} used
              </span>
              <span className="text-xs opacity-70">
                ({storageInfo.breakdown.images.items} images)
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant={isCritical ? 'destructive' : 'outline'}
                onClick={handleManageStorage}
              >
                Manage Storage
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </AlertDescription>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDismiss}
        className="h-5 w-5"
        aria-label="Dismiss warning"
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  )
}
