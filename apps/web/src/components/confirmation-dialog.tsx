import * as React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { focusVisibleStyles } from '@/lib/focus-styles'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  isDestructive?: boolean
  isLoading?: boolean
  children?: React.ReactNode
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isDestructive = false,
  isLoading = false,
  children,
}: ConfirmationDialogProps) {
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('[ConfirmationDialog] Error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  React.useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isProcessing) {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange, isProcessing])

  return (
    <Dialog open={open} onOpenChange={isProcessing ? undefined : onOpenChange}>
      <DialogContent
        role={isDestructive ? 'alertdialog' : 'dialog'}
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        <DialogHeader>
          <DialogTitle id="dialog-title">{title}</DialogTitle>
          {description && (
            <DialogDescription id="dialog-description">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing || isLoading}
            className={focusVisibleStyles}
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className={focusVisibleStyles}
          >
            {isProcessing || isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
