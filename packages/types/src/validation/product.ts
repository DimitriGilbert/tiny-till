import { z } from 'zod'
import type { Product, ProductInput } from '../entities/product'
import { isValidUUID } from '../utils/uuid'

export const productSchema: z.ZodType<Product> = z.object({
  id: z.string().refine(isValidUUID, { message: 'Invalid UUID v4 format' }),
  name: z.string().min(1).max(50),
  price: z.number().int().positive(),
  imageData: z
    .string()
    .refine(
      (value) =>
        value === undefined ||
        value.startsWith('data:image/') ||
        value.startsWith('blob:'),
      { message: 'Invalid image data URL format' },
    )
    .optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
})

export const productInputSchema: z.ZodType<ProductInput> = z.object({
  name: z.string().min(1).max(50),
  price: z.number().int().positive(),
  imageData: z
    .string()
    .refine(
      (value) =>
        value.startsWith('data:image/') || value.startsWith('blob:'),
      { message: 'Invalid image data URL format' },
    )
    .optional(),
})

export const productListSchema: z.ZodType<Product[]> = z.array(productSchema)
