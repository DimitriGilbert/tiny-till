import * as React from 'react'
import { AlertTriangle, RefreshCw, Trash2, Clock } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export interface TallySummary {
  itemCount: number
  total: number
  timestamp: number
}

export interface UnsavedTallyData {
  items: [string, any][]
  timestamp: number
  itemCount: number
  total: number
}

export interface UnsavedTallyRecoveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestore: (data: UnsavedTallyData) => void
  onDiscard: () => void
  tallyData: TallySummary | null
  recoveryTime: number | null
}

export function UnsavedTallyRecoveryDialog({
  open,
  onOpenChange,
  onRestore,
  onDiscard,
  tallyData,
  recoveryTime,
}: UnsavedTallyRecoveryDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleRestore = React.useCallback(async () => {
    if (!tallyData) {
      return
    }

    setIsProcessing(true)
    try {
      const savedData = sessionStorage.getItem('unsaved-tally')
      if (!savedData) {
        toast.error('No saved tally data found')
        return
      }

      const parsedData: UnsavedTallyData = JSON.parse(savedData)
      await onRestore(parsedData)

      sessionStorage.removeItem('unsaved-tally')
      onOpenChange(false)
      toast.success('Tally restored successfully')
    } catch (error) {
      console.error('Failed to restore tally:', error)
      toast.error('Failed to restore tally', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [onRestore, onOpenChange])

  const handleDiscard = React.useCallback(() => {
    try {
      sessionStorage.removeItem('unsaved-tally')
      toast.success('Saved tally discarded')
      onDiscard()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to discard tally:', error)
      toast.error('Failed to discard tally')
    }
  }, [onDiscard, onOpenChange])

  const getTimeSinceRecovery = (): string => {
    if (!recoveryTime) {
      return 'Unknown'
    }

    const minutes = Math.floor((Date.now() - recoveryTime) / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours % 24} hour${(hours % 24) > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes % 60} minute${(minutes % 60) > 1 ? 's' : ''} ago`
    }
    return 'Just now'
  }

  const formattedTotal = tallyData
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        tallyData.total / 100
      )
    : '$0.00'

  const timeAgo = getTimeSinceRecovery()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <DialogTitle>Recover Unsaved Tally</DialogTitle>
              <DialogDescription>
                We found an unsaved tally from a previous session. Would you like to restore it?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {tallyData && (
          <div className="py-4">
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Saved {timeAgo}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Items</p>
                    <p className="text-2xl font-bold text-foreground">
                      {tallyData.itemCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formattedTotal}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Warning:</strong> Your current tally will be completely replaced with this restored
                    tally. Any unsaved work will be lost.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={isProcessing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Discard
          </Button>
          <Button
            onClick={handleRestore}
            disabled={isProcessing || !tallyData}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore Tally
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}