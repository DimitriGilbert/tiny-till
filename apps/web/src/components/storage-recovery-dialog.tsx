import * as React from 'react'
import { HardDrive, Download, Trash2, AlertTriangle, Info, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface StorageRecoveryDialogProps {
  isOpen: boolean
  onClose: () => void
  storageUsed: number
  storageTotal: number
  onExportData: () => Promise<void>
  onClearStorage: () => Promise<void>
  onRetry: () => void
}

export function StorageRecoveryDialog({
  isOpen,
  onClose,
  storageUsed,
  storageTotal,
  onExportData,
  onClearStorage,
  onRetry,
}: StorageRecoveryDialogProps) {
  const percentage = (storageUsed / storageTotal) * 100
  const [isExporting, setIsExporting] = React.useState(false)
  const [isClearing, setIsClearing] = React.useState(false)
  const [hasExported, setHasExported] = React.useState(false)
  const [step, setStep] = React.useState(1)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExportData()
      setHasExported(true)
      setStep(2)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClear = async () => {
    setIsClearing(true)
    try {
      await onClearStorage()
      setStep(3)
    } catch (error) {
      console.error('Clear failed:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const handleRetry = () => {
    onRetry()
    onClose()
  }

  const getStorageStatusColor = () => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getProgressBarColor = () => {
    if (percentage >= 90) return 'bg-red-600'
    if (percentage >= 75) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Storage Recovery</DialogTitle>
          <DialogDescription>
            Your browser storage is nearly full. Choose a recovery option.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <HardDrive className={cn('h-8 w-8', getStorageStatusColor())} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className={cn('text-sm font-bold', getStorageStatusColor())}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatBytes(storageUsed)} of {formatBytes(storageTotal)} used
                </p>
              </div>
            </div>

            {percentage >= 90 && (
              <div className="flex items-start gap-2 p-3 rounded bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Critical Warning</p>
                  <p className="text-destructive/80">
                    Storage is almost full. Export your data before attempting any
                    operation to prevent data loss.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recovery Steps</h4>
            <div className="space-y-3">
              <StepCard
                step={1}
                title="Export Data"
                description="Download your catalog as a backup file"
                icon={<Download className="h-4 w-4" />}
                isActive={step === 1}
                isComplete={step > 1}
                action={
                  <Button
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting || step > 1}
                  >
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                }
              />

              {step >= 2 && (
                <StepCard
                  step={2}
                  title="Clear Storage"
                  description="Remove all products and cached data"
                  icon={<Trash2 className="h-4 w-4" />}
                  isActive={step === 2}
                  isComplete={step > 2}
                  action={
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleClear}
                      disabled={isClearing || step > 2}
                    >
                      {isClearing ? 'Clearing...' : 'Clear'}
                    </Button>
                  }
                />
              )}

              {step >= 3 && (
                <StepCard
                  step={3}
                  title="Retry Operation"
                  description="Attempt the original operation again"
                  icon={<ArrowRight className="h-4 w-4" />}
                  isActive={step === 3}
                  isComplete={false}
                  action={
                    <Button size="sm" onClick={handleRetry}>
                      Retry
                    </Button>
                  }
                />
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-600 dark:text-blue-400">
                Best Practices
              </p>
              <p className="text-blue-600/80 dark:text-blue-400/80">
                Regularly export your catalog to avoid data loss. You can
                re-import it anytime.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {step === 3 && (
            <Button onClick={handleRetry}>Complete Recovery</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface StepCardProps {
  step: number
  title: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  isComplete: boolean
  action?: React.ReactNode
}

function StepCard({
  step,
  title,
  description,
  icon,
  isActive,
  isComplete,
  action,
}: StepCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border-2 transition-colors',
        isActive && 'border-primary bg-primary/5',
        isComplete && 'border-green-600 bg-green-50 dark:bg-green-950/20',
        !isActive && !isComplete && 'border-muted'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
          isActive && 'bg-primary text-primary-foreground',
          isComplete && 'bg-green-600 text-white',
          !isActive && !isComplete && 'bg-muted text-muted-foreground'
        )}
      >
        {isComplete ? '✓' : step}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="font-medium">{title}</h5>
            {icon}
          </div>
          {action}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
