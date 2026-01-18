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
import { ValidatedQuantityInput } from '@/components/ui/validated-quantity-input'
import { ValidationErrorMessage } from '@/components/ui/validation-error-message'
import { useQuantityValidation } from '@/hooks/use-quantity-validation'
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
  const [showError, setShowError] = React.useState(false)

  const {
    validateAndParse,
    hasError,
    errorState,
    validationState,
    setError,
    resetValidation,
  } = useQuantityValidation()

  React.useEffect(() => {
    if (open) {
      setInputValue(currentQuantity.toString())
      setShowError(false)
      resetValidation()
    }
  }, [open, currentQuantity, resetValidation])

  const handleConfirm = () => {
    const result = validateAndParse(inputValue)

    if (!result.isValid || result.error) {
      setShowError(true)
      setError(result.error || 'Invalid input')
      return
    }

    onConfirm(result.quantity || 0)
    onOpenChange(false)
  }

  const handleRemove = () => {
    onConfirm(0)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    }
  }

  const canConfirm = !hasError && inputValue.length > 0

  const displayValue = inputValue || '0'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto p-6" onKeyDown={handleKeyDown}>
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

        <div className="mb-4">
          <ValidatedQuantityInput
            value={displayValue}
            error={errorState}
            isValid={validationState.isValid}
            hasError={hasError}
            placeholder="0"
          />
        </div>

        {showError && errorState && (
          <div className="mb-4">
            <ValidationErrorMessage
              message={errorState}
              visible={showError}
              type="error"
              onDismiss={() => setShowError(false)}
            />
          </div>
        )}

        <NumericKeypad
          value={inputValue}
          onChange={setInputValue}
          maxLength={6}
          validateOnChange={true}
          onError={setError}
          onValidChange={(isValid) => {
            if (!isValid) {
              setShowError(true)
            }
          }}
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
            disabled={!canConfirm}
            className={cn(
              'flex-1 sm:flex-none',
              !canConfirm && 'opacity-50 cursor-not-allowed'
            )}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
