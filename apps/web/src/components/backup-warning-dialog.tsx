import * as React from 'react'
import { AlertTriangle, Download, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

export interface BackupWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  onCreateBackup: () => void
  daysSinceBackup: number | null
  lastBackupDate: string | null
  isOverdue: boolean
  isCreatingBackup?: boolean
}

export function BackupWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  onCreateBackup,
  daysSinceBackup,
  lastBackupDate,
  isOverdue,
  isCreatingBackup = false,
}: BackupWarningDialogProps) {
  const [showConfirmProceed, setShowConfirmProceed] = React.useState(false)

  const handleProceedAnyway = () => {
    setShowConfirmProceed(true)
  }

  const handleConfirmProceed = () => {
    setShowConfirmProceed(false)
    onConfirm()
  }

  const handleCancelProceed = () => {
    setShowConfirmProceed(false)
  }

  return (
    <>
      <Dialog open={open && !showConfirmProceed} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Recent Backup Found</DialogTitle>
            <DialogDescription>
              {lastBackupDate
                ? `Your last backup was ${
                    daysSinceBackup ?? 0
                  } day${(daysSinceBackup ?? 0) !== 1 ? 's' : ''} ago. It's recommended to create a fresh backup before importing.`
                : 'No backup has been created yet. It\'s strongly recommended to create a backup before importing data to prevent data loss.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Importing will update your catalog
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Products with matching IDs will be overwritten. New products
                will be added. Local products not in the import will be
                preserved.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isCreatingBackup}
            >
              Cancel Import
            </Button>
            <Button
              variant="destructive"
              onClick={handleProceedAnyway}
              disabled={isCreatingBackup}
            >
              Proceed Anyway
            </Button>
            <Button
              onClick={onCreateBackup}
              disabled={isCreatingBackup}
            >
              {isCreatingBackup ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Create Backup First
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showConfirmProceed}
        onOpenChange={handleCancelProceed}
        title="Proceed Without Backup?"
        description="Are you sure you want to proceed without creating a backup? This could result in data loss if something goes wrong during the import."
        confirmLabel="Yes, Proceed Anyway"
        cancelLabel="Cancel"
        onConfirm={handleConfirmProceed}
        isDestructive
      />
    </>
  )
}
