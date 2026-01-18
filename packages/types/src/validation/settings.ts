import { z } from 'zod'
import type { Settings, Theme, GridDensity, ColumnCount } from '../entities/settings'

export const themeSchema: z.ZodType<Theme> = z.enum(['light', 'dark', 'system'])

export const gridDensitySchema: z.ZodType<GridDensity> = z.enum(['normal', 'compact'])

export const columnCountSchema: z.ZodType<ColumnCount> = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
])

export const settingsSchema: z.ZodType<Settings> = z.object({
  theme: themeSchema,
  gridDensity: gridDensitySchema,
  columnCountOverride: columnCountSchema.optional(),
  backupReminder: z.number().int().optional(),
})
