import * as React from 'react'

import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'

interface ClearCartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  itemCount: number
  totalCents: number
}

export function ClearCartDialog({
  open,
  onOpenChange,
  onConfirm,
  itemCount,
  totalCents,
}: ClearCartDialogProps) {
  const formatPrice = useCurrencyFormat()

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Clear Cart"
      description="Are you sure you want to remove all items from your cart? This action cannot be undone."
      confirmLabel="Clear Cart"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isDestructive
    >
      <div className="rounded-md bg-muted/50 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items:</span>
            <span className="font-medium tabular-nums">{itemCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium tabular-nums text-destructive">
              {formatPrice(totalCents)}
            </span>
          </div>
        </div>
      </div>
    </ConfirmationDialog>
  )
}
