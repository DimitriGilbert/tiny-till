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

export const settingsBusinessLogicSchema = z
  .object({
    theme: themeSchema,
    gridDensity: gridDensitySchema,
    columnCountOverride: columnCountSchema.optional(),
    backupReminder: z
      .number()
      .int()
      .nonnegative()
      .max(365, { message: 'Backup reminder cannot exceed 365 days' })
      .optional(),
  })
  .strict()
  .refine((settings) => {
    if (settings.columnCountOverride && settings.gridDensity === 'compact') {
      return settings.columnCountOverride >= 3
    }
    return true
  }, {
    message: 'Compact view requires at least 3 columns',
    path: ['columnCountOverride'],
  })
  .refine((settings) => {
    if (settings.columnCountOverride && settings.gridDensity === 'normal') {
      return settings.columnCountOverride <= 6
    }
    return true
  }, {
    message: 'Normal view should not exceed 6 columns',
    path: ['columnCountOverride'],
  })

export const themeChangeValidationSchema = z.object({
  theme: themeSchema,
})

export const gridDensityChangeValidationSchema = z.object({
  gridDensity: gridDensitySchema,
  columnCountOverride: columnCountSchema.optional(),
})

export const columnCountValidationSchema = z.object({
  columnCountOverride: columnCountSchema.optional(),
})

