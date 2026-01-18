import { useForm } from '@tanstack/react-form'
import type { ProductInput, Product } from '@tiny-till/types'
import { productInputSchema, parsePrice } from '@tiny-till/types'
import { toast } from 'sonner'
import { useCatalogStore } from '@/stores/catalog-store'

const MAX_IMAGE_SIZE_BYTES = 128 * 128 * 4
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

interface UseProductFormProps {
  mode: 'add' | 'edit'
  product?: Product
  onSuccess?: (product: Product | null) => void
  onCancel?: () => void
}

interface FormValues {
  name: string
  price: string
  image?: File | string | null
}

interface ImageValidationResult {
  valid: boolean
  error?: string
}

export function useProductForm({ mode, product, onSuccess, onCancel }: UseProductFormProps) {
  const { addProduct, updateProduct } = useCatalogStore()

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ width: 0, height: 0 })
      }

      img.src = url
    })
  }

  const validateImage = async (file: File | null): Promise<ImageValidationResult> => {
    if (!file) {
      return { valid: true }
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Image must be PNG, JPEG, or WebP format',
      }
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        valid: false,
        error: 'Image must be 128×128 pixels or smaller',
      }
    }

    const dimensions = await getImageDimensions(file)
    if (dimensions.width > 128 || dimensions.height > 128) {
      return {
        valid: false,
        error: 'Image dimensions must not exceed 128×128 pixels',
      }
    }

    return { valid: true }
  }

  const processImage = async (
    image: File | string | null | undefined
  ): Promise<string | undefined> => {
    if (!image) {
      return undefined
    }

    if (typeof image === 'string') {
      return image.startsWith('data:') || image.startsWith('blob:') ? image : undefined
    }

    const validation = await validateImage(image)
    if (!validation.valid) {
      toast.error('Invalid Image', { description: validation.error })
      return undefined
    }

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => {
        toast.error('Error', { description: 'Failed to process image' })
        resolve(undefined)
      }
      reader.readAsDataURL(image)
    })
  }

  const form = useForm({
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
    validateImage,
  }
}
