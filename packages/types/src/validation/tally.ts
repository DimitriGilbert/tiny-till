import { z } from 'zod'
import type { TallyItem } from '../entities/tally-item'
import { isValidUUID } from '../utils/uuid'

export const tallyItemSchema: z.ZodType<TallyItem> = z.object({
  productId: z.string().refine(isValidUUID, { message: 'Invalid UUID v4 format' }),
  quantity: z.number().int().positive(),
  price: z.number().int().min(0),
})

export const quantitySchema = z.number().int().nonnegative()

export function validateQuantity(value: unknown): value is number {
  return quantitySchema.safeParse(value).success
}

export const tallyStateSchema = z
  .record(z.string().uuid(), tallyItemSchema)
  .refine((items) => {
    const totalItems = Object.values(items).reduce((sum, item) => sum + item.quantity, 0)
    return totalItems <= 99999
  }, {
    message: 'Total item count cannot exceed 99,999',
  })
  .refine((items) => {
    const total = Object.values(items).reduce((sum, item) => sum + item.price * item.quantity, 0)
    return total <= Number.MAX_SAFE_INTEGER
  }, {
    message: 'Tally total exceeds safe number limit',
  })

export const tallySummarySchema = z.object({
  total: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  itemCount: z.number().int().nonnegative().max(99999),
  productCount: z.number().int().nonnegative().max(1000),
})

export const tallyItemConsistencySchema = z
  .object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().int().min(0),
  })
  .strict()
  .refine((item) => {
    if (item.quantity > 0 && item.price < 0) {
      return false
    }
    return true
  }, {
    message: 'Price cannot be negative when quantity is positive',
  })
  .refine((item) => {
    const lineTotal = item.quantity * item.price
    return lineTotal <= Number.MAX_SAFE_INTEGER
  }, {
    message: 'Line item total exceeds safe number limit',
  })

