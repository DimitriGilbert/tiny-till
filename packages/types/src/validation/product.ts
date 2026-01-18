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

export const productUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Product name is required' })
    .max(50, { message: 'Product name cannot exceed 50 characters' })
    .trim()
    .optional(),
  price: z
    .number()
    .int({ message: 'Price must be a whole number of cents' })
    .min(1, { message: 'Price must be at least 1 cent' })
    .max(MAX_PRICE_CENTS, {
      message: `Price cannot exceed $${(MAX_PRICE_CENTS / 100).toLocaleString()}`,
    })
    .optional(),
  imageData: z
    .string()
    .refine(imageDataRefine, {
      message:
        'Image must be a valid data URL (PNG, JPEG, or WebP) or blob URL, and cannot exceed 128×128 pixels',
    })
    .optional(),
})

export const productListSchema: z.ZodType<Product[]> = z.array(productSchema)

export const productBusinessLogicSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(50)
      .refine((name) => /^[a-zA-Z0-9\s\-_.,'"()/&]+$/.test(name), {
        message: 'Product name contains invalid characters',
      })
      .refine((name) => !/^\s+$/.test(name), {
        message: 'Product name cannot be only whitespace',
      })
      .refine((name) => name.trim() === name, {
        message: 'Product name should not have leading/trailing whitespace',
      }),
    price: z
      .number()
      .int()
      .positive()
      .max(MAX_PRICE_CENTS)
      .refine((price) => price % 100 !== 0 || price < 10000, {
        message: 'Prices above $100 should include cents',
      }),
  })
  .strict()

export const imageValidationSchema = z
  .object({
    imageData: z
      .string()
      .refine((data) => data.length === 0 || data.startsWith('data:image/'), {
        message: 'Image must be a valid data URL',
      })
      .refine((data) => data.length === 0 || data.length <= MAX_IMAGE_SIZE_BYTES, {
        message: 'Image exceeds 128×128 pixel limit',
      })
      .refine(
        (data) => {
          if (data.length === 0) return true
          const mimeType = data.match(/^data:image\/([^;]+)/)?.[1]
          return ['png', 'jpeg', 'jpg', 'webp'].includes(mimeType ?? '')
        },
        {
          message: 'Image must be PNG, JPEG, or WebP format',
        }
      )
      .optional(),
  })
  .strict()

export const priceValidationSchema = z
  .object({
    price: z
      .number()
      .int({ message: 'Price must be a whole number of cents' })
      .min(1, { message: 'Price must be at least 1 cent' })
      .max(MAX_PRICE_CENTS, {
        message: `Price cannot exceed $${(MAX_PRICE_CENTS / 100).toLocaleString()}`,
      })
      .refine((price) => price > 0, {
        message: 'Price cannot be zero',
      })
      .refine((price) => {
        const dollars = price / 100
        return dollars < 1000 || (dollars >= 1000 && price % 100 === 0)
      }, {
        message: 'Prices above $1000 must be whole dollar amounts',
      }),
  })
  .strict()

export const crossFieldValidationSchema = z
  .object({
    name: z.string().min(1).max(50),
    price: z.number().int().positive().max(MAX_PRICE_CENTS),
    imageData: z.string().optional(),
  })
  .strict()
  .refine((data) => !(data.price > 10000 && !data.imageData), {
    message: 'Products above $100 should include an image',
    path: ['price'],
  })
  .refine((data) => {
    if (data.price > 100000 && data.name.length < 10) {
      return false
    }
    return true
  }, {
    message: 'Expensive products ($1000+) should have descriptive names (10+ characters)',
    path: ['name'],
  })
