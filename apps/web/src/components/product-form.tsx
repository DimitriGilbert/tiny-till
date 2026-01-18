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
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useProductForm } from '@/hooks/use-product-form'
import type { Product } from '@tiny-till/types'
import { formatPrice } from '@tiny-till/types'

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
  const { form, handleSubmit, handleCancel, validateImage } = useProductForm({
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

  const [imageError, setImageError] = React.useState<string>()
  const [imagePreview, setImagePreview] = React.useState<string>()

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (product?.imageData) {
      setImagePreview(product.imageData)
    } else {
      setImagePreview(undefined)
    }
  }, [product])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImagePreview(undefined)
      form.setFieldValue('image', null)
      setImageError(undefined)
      return
    }

    const validation = await validateImage(file)
    if (validation.valid) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
      form.setFieldValue('image', file as never)
      setImageError(undefined)
    } else {
      setImageError(validation.error)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(undefined)
    form.setFieldValue('image', null)
    setImageError(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isEditMode = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the product details below.'
              : 'Add a new product to your catalog.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name *</Label>
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
                    aria-describedby={field.state.meta.errors.length > 0 ? 'name-error' : undefined}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p id="name-error" className="text-destructive text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price ($) *</Label>
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
                  <Input
                    id="price"
                    value={field.state.value}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^\$?\s*\d*\.?\d{0,2}$/.test(value)) {
                        field.handleChange(value)
                      }
                    }}
                    onBlur={field.handleBlur}
                    placeholder="$0.00"
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={field.state.meta.errors.length > 0 ? 'price-error' : undefined}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p id="price-error" className="text-destructive text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Product Image (optional)</Label>
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
              aria-describedby="image-help"
            />
            <div className="flex items-start gap-4">
              <Card className="flex-1">
                <CardContent className="p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="size-32 object-cover rounded-none"
                      />
                      <Button
                        size="icon-xs"
                        variant="destructive"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2"
                        aria-label="Remove image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-32 flex-col items-center justify-center rounded-none border-2 border-dashed hover:bg-muted/50 transition-colors"
                      disabled={form.state.isSubmitting}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mb-2 text-muted-foreground"
                        aria-hidden="true"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <span className="text-sm text-muted-foreground">
                        Click to upload
                      </span>
                    </button>
                  )}
                </CardContent>
              </Card>
              <div className="flex flex-col gap-1 text-xs">
                <p id="image-help" className="text-muted-foreground">
                  Max size: 128×128 pixels
                </p>
                <p className="text-muted-foreground">
                  Formats: PNG, JPEG, WebP
                </p>
                {imageError && <p className="text-destructive">{imageError}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.state.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.state.isSubmitting || form.state.canSubmit === false}
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
