import { z } from 'zod'
import type { Product, ProductInput } from '../entities/product'
import { isValidUUID } from '../utils/uuid'

const MAX_PRICE_CENTS = 99_999_999
const MAX_IMAGE_SIZE_BYTES = 128 * 128 * 4

const imageDataRefine = (value: string) => {
  if (value.startsWith('data:image/')) {
    if (value.length > MAX_IMAGE_SIZE_BYTES) {
      return false
    }
    const mimeType = value.match(/^data:image\/([^;]+)/)?.[1]
    return ['png', 'jpeg', 'jpg', 'webp'].includes(mimeType ?? '')
  }
  if (value.startsWith('blob:')) {
    return true
  }
  return false
}

export const productSchema: z.ZodType<Product> = z.object({
  id: z.string().refine(isValidUUID, { message: 'Invalid UUID v4 format' }),
  name: z
    .string()
    .min(1, { message: 'Product name is required' })
    .max(50, { message: 'Product name cannot exceed 50 characters' })
    .trim(),
  price: z
    .number()
    .int({ message: 'Price must be a whole number of cents' })
    .min(1, { message: 'Price must be at least 1 cent' })
    .max(MAX_PRICE_CENTS, {
      message: `Price cannot exceed $${(MAX_PRICE_CENTS / 100).toLocaleString()}`,
    }),
  imageData: z
    .string()
    .refine(imageDataRefine, {
      message:
        'Image must be a valid data URL (PNG, JPEG, or WebP) or blob URL, and cannot exceed 128×128 pixels',
    })
    .optional(),
  createdAt: z
    .number()
    .int()
    .positive({ message: 'createdAt must be a positive timestamp' }),
  updatedAt: z
    .number()
    .int()
    .positive({ message: 'updatedAt must be a positive timestamp' }),
})

export const productInputSchema: z.ZodType<ProductInput> = z.object({
  name: z
    .string()
    .min(1, { message: 'Product name is required' })
    .max(50, { message: 'Product name cannot exceed 50 characters' })
    .trim(),
  price: z
    .number()
    .int({ message: 'Price must be a whole number of cents' })
    .min(1, { message: 'Price must be at least 1 cent' })
    .max(MAX_PRICE_CENTS, {
      message: `Price cannot exceed $${(MAX_PRICE_CENTS / 100).toLocaleString()}`,
    }),
  imageData: z
    .string()
    .refine(imageDataRefine, {
      message:
        'Image must be a valid data URL (PNG, JPEG, or WebP) or blob URL, and cannot exceed 128×128 pixels',
    })
    .optional(),
})

export const productListSchema: z.ZodType<Product[]> = z.array(productSchema)
