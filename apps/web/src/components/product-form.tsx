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
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/ImageUpload'
import { PriceInput } from '@/components/price-input'
import { useProductForm } from '@/hooks/use-product-form'
import type { Product } from '@tiny-till/types'
import { formatPrice } from '@tiny-till/types'
import { focusVisibleStyles } from '@/lib/focus-styles'

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  product?: Product
  onSuccess?: (product: Product | null) => void
  onCancel?: () => void
}

export function ProductForm({
  open,
  onOpenChange,
  mode,
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const { form, handleSubmit, handleCancel } = useProductForm({
    mode,
    product,
    onSuccess: (result) => {
      if (result && onSuccess) {
        onSuccess(result)
        onOpenChange(false)
      }
    },
    onCancel: () => {
      handleCancel()
      if (onCancel) {
        onCancel()
      }
      onOpenChange(false)
    },
  })

  React.useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  React.useEffect(() => {
    if (open && formRef.current) {
      const firstInput = formRef.current.querySelector('input') as HTMLInputElement
      firstInput?.focus()
    }
  }, [open])

  const isEditMode = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle id="product-form-title">
            {isEditMode ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogDescription id="product-form-description">
            {isEditMode
              ? 'Update the product details below.'
              : 'Add a new product to your catalog.'}
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex flex-col gap-4"
          aria-labelledby="product-form-title"
          aria-describedby="product-form-description"
        >
          <div className="grid gap-2">
            <label htmlFor="name">Product Name *</label>
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  value.length > 50 ? 'Name cannot exceed 50 characters' : undefined,
                onChangeAsync: async ({ value }) => {
                  await new Promise((resolve) => setTimeout(resolve, 100))
                  return value.trim().length === 0 ? 'Product name is required' : undefined
                },
              }}
            >
               {(field) => (
                 <div className="space-y-1">
                   <Input
                     id="name"
                     value={field.state.value}
                     onChange={(e) => field.handleChange(e.target.value)}
                     onBlur={field.handleBlur}
                     placeholder="e.g., Chocolate Croissant"
                     maxLength={50}
                     aria-invalid={field.state.meta.errors.length > 0}
                     aria-describedby={
                       field.state.meta.errors.length > 0 ? 'name-error' : undefined
                     }
                     className={focusVisibleStyles}
                   />
                   {field.state.meta.errors.length > 0 && (
                     <p id="name-error" className="text-destructive text-xs" role="alert">
                       {field.state.meta.errors[0]}
                     </p>
                   )}
                 </div>
               )}
            </form.Field>
          </div>

          <div className="grid gap-2">
            <label htmlFor="price">Price ($) *</label>
            <form.Field
              name="price"
              validators={{
                onChange: ({ value }) => {
                  try {
                    if (!value) return 'Price is required'
                    const priceMatch = value.match(/^\$?\s*(\d+\.?\d{0,2})$/)
                    if (!priceMatch) return 'Invalid price format'
                    const cents = Math.round(parseFloat(priceMatch[1]) * 100)
                    if (cents < 1) return 'Price must be at least $0.01'
                    if (cents > 99999999) return 'Price is too high'
                    return undefined
                  } catch {
                    return 'Invalid price'
                  }
                },
              }}
            >
               {(field) => (
                 <div className="space-y-1">
                   <PriceInput
                     id="price"
                     value={
                       field.state.value
                         ? Math.round(parseFloat(field.state.value.replace(/[^0-9.]/g, '')) * 100)
                         : 0
                     }
                     onChange={(cents) => field.handleChange(`$${(cents / 100).toFixed(2)}`)}
                     placeholder="$0.00"
                     aria-invalid={field.state.meta.errors.length > 0}
                     aria-describedby={
                       field.state.meta.errors.length > 0 ? 'price-error' : undefined
                     }
                     className={focusVisibleStyles}
                   />
                   {field.state.meta.errors.length > 0 && (
                     <p id="price-error" className="text-destructive text-xs" role="alert">
                       {field.state.meta.errors[0]}
                     </p>
                   )}
                 </div>
               )}
            </form.Field>
          </div>

          <form.Field name="image">
            {(field) => (
              <ImageUpload
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                disabled={form.state.isSubmitting}
              />
            )}
          </form.Field>

           <DialogFooter>
             <Button
               type="button"
               variant="outline"
               onClick={() => onOpenChange(false)}
               disabled={form.state.isSubmitting}
               className={focusVisibleStyles}
             >
               Cancel
             </Button>
             <Button
               type="submit"
               disabled={form.state.isSubmitting || form.state.canSubmit === false}
               className={focusVisibleStyles}
             >
               {form.state.isSubmitting
                 ? 'Saving...'
                 : isEditMode
                   ? 'Update Product'
                   : 'Add Product'}
             </Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
