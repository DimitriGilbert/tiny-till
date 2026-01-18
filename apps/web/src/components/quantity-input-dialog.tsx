import * as React from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { NumericKeypad } from '@/components/ui/numeric-keypad'
import { cn } from '@/lib/utils'

interface QuantityInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  productImage?: string
  productPrice?: number
  currentQuantity: number
  onConfirm: (quantity: number) => void
}

export const QuantityInputDialog = React.memo(function QuantityInputDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productImage,
  productPrice,
  currentQuantity,
  onConfirm,
}: QuantityInputDialogProps) {
  const [inputValue, setInputValue] = React.useState(currentQuantity.toString())

  React.useEffect(() => {
    if (open) {
      setInputValue(currentQuantity.toString())
    }
  }, [open, currentQuantity])

  const handleConfirm = () => {
    const quantity = inputValue === '' || inputValue === '0' ? 0 : parseInt(inputValue, 10)
    onConfirm(quantity)
  }

  const handleRemove = () => {
    onConfirm(0)
    onOpenChange(false)
  }

  const displayValue = inputValue || '0'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto p-6">
        <DialogHeader>
          <DialogTitle>Edit Quantity</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          {productImage ? (
            <div className="flex-shrink-0 w-16 h-16 rounded-none overflow-hidden bg-muted">
              <img
                src={productImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 rounded-none bg-muted flex items-center justify-center">
              <span className="text-2xl" aria-hidden="true">📦</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{productName}</div>
            <div className="text-muted-foreground text-sm">
              Current: {currentQuantity}
            </div>
          </div>
        </div>

        <output className="bg-muted rounded-none p-6 text-center mb-4">
          <div className="text-5xl font-mono font-bold tracking-wider">
            {displayValue}
          </div>
        </output>

        <NumericKeypad
          value={inputValue}
          onChange={setInputValue}
          maxLength={6}
        />

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleRemove}
            className="flex-1 sm:flex-none"
          >
            Remove
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
