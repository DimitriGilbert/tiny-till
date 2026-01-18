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
