import { useForm } from '@tanstack/react-form'
import type { ProductInput, Product } from '@tiny-till/types'
import { productInputSchema, parsePrice } from '@tiny-till/types'
import { toast } from 'sonner'
import { useCatalogStore } from '@/stores/catalog-store'

interface UseProductFormProps {
  mode: 'add' | 'edit'
  product?: Product
  onSuccess?: (product: Product | null) => void
  onCancel?: () => void
}

interface FormValues {
  name: string
  price: string
  image?: string | null
}

export function useProductForm({ mode, product, onSuccess, onCancel }: UseProductFormProps) {
  const { addProduct, updateProduct } = useCatalogStore()

  const processImage = async (
    image: string | null | undefined
  ): Promise<string | undefined> => {
    if (!image) {
      return undefined
    }

    return image.startsWith('data:') || image.startsWith('blob:') ? image : undefined
  }

  const form = useForm<FormValues, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined>({
    defaultValues: {
      name: product?.name || '',
      price: product ? `$${(product.price / 100).toFixed(2)}` : '',
      image: product?.imageData || null,
    },
    onSubmit: async ({ value }) => {
      try {
        const priceCents = parsePrice(value.price)

        const imageData = await processImage(value.image)

        if (mode === 'add') {
          const input: ProductInput = {
            name: value.name,
            price: priceCents,
            ...(imageData && { imageData }),
          }

          const result = await addProduct(input, true)
          if (result && onSuccess) {
            onSuccess(result)
          }
        } else if (mode === 'edit' && product) {
          const updateData: Partial<ProductInput> = {
            name: value.name !== product.name ? value.name : undefined,
            price: priceCents !== product.price ? priceCents : undefined,
          }

          if (imageData !== product.imageData) {
            updateData.imageData = imageData
          }

          const result = await updateProduct(product.id, updateData, true)
          if (result && onSuccess) {
            onSuccess(result)
          }
        }
      } catch (error) {
        console.error('[useProductForm] Submit error:', error)
        toast.error('Error', { description: 'Failed to save product' })
      }
    },
  })

  const handleCancel = () => {
    form.reset()
    if (onCancel) {
      onCancel()
    }
  }

  return {
    form,
    handleSubmit: () => form.handleSubmit(),
    handleCancel,
  }
}
