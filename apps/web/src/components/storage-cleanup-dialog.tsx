import * as React from 'react'
import { Trash2, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { performFullCleanup, getCleanupPreview } from '@/lib/storage-cleanup'
import { showCleanupComplete, showCleanupProgress } from '@/lib/storage-toasts'
import { formatBytes } from '@tiny-till/types'

interface StorageCleanupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StorageCleanupDialog({ open, onOpenChange }: StorageCleanupDialogProps) {
  const [preview, setPreview] = React.useState<{
    oldImages: number
    unusedKeys: number
    potentialSavings: number
  } | null>(null)
  const [isCleaning, setIsCleaning] = React.useState(false)
  const [cleanupOldImages, setCleanupOldImages] = React.useState(true)
  const [cleanupUnusedKeys, setCleanupUnusedKeys] = React.useState(true)

  const loadPreview = React.useCallback(async () => {
    setPreview(null)
    const cleanupPreview = await getCleanupPreview()
    setPreview(cleanupPreview)
  }, [])

  React.useEffect(() => {
    if (open) {
      loadPreview()
    }
  }, [open, loadPreview])

  const handleCleanup = async () => {
    setIsCleaning(true)

    try {
      showCleanupProgress(0, 1)

      const result = await performFullCleanup()

      showCleanupComplete(
        result.removedImages + result.removedProducts,
        result.bytesFreed
      )

      onOpenChange(false)
    } catch (error) {
      console.error('[CleanupDialog] Cleanup failed:', error)
    } finally {
      setIsCleaning(false)
    }
  }

  if (!preview) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const hasItemsToClean =
    (cleanupOldImages && preview.oldImages > 0) ||
    (cleanupUnusedKeys && preview.unusedKeys > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cleanup Storage</DialogTitle>
          <DialogDescription>
            Review and select items to clean up from your storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {preview.oldImages > 0 && (
            <div className="flex items-start gap-3">
              <Checkbox
                id="old-images"
                checked={cleanupOldImages}
                onCheckedChange={setCleanupOldImages}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="old-images"
                  className="font-medium"
                >
                  Old Product Images ({preview.oldImages})
                </Label>
                <p className="text-sm text-muted-foreground">
                  Images from products removed more than 30 days ago
                </p>
              </div>
            </div>
          )}

          {preview.unusedKeys > 0 && (
            <div className="flex items-start gap-3">
              <Checkbox
                id="unused-keys"
                checked={cleanupUnusedKeys}
                onCheckedChange={setCleanupUnusedKeys}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="unused-keys"
                  className="font-medium"
                >
                  Unused Data ({preview.unusedKeys})
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cached or temporary data that's no longer needed
                </p>
              </div>
            </div>
          )}

          {preview.potentialSavings > 0 && (
            <div className="flex items-center gap-2 rounded-none bg-muted p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                Potential savings: <strong>{formatBytes(preview.potentialSavings)}</strong>
              </span>
            </div>
          )}

          {!hasItemsToClean && (
            <div className="flex items-center gap-2 rounded-none bg-muted p-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                Storage is clean. No cleanup needed at this time.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCleaning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCleanup}
            disabled={isCleaning || !hasItemsToClean}
            className="gap-2"
          >
            {isCleaning && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCleaning ? 'Cleaning...' : 'Cleanup Storage'}
            {!isCleaning && <Trash2 className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
