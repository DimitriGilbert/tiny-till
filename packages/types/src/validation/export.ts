import { z } from 'zod'
import type { CatalogExport } from '../entities/export'
import { productListSchema } from './product'

const VERSION_REGEX = /^\d+\.\d+\.\d+$/
const CHECKSUM_REGEX = /^[a-f0-9]+$/
const FORMAT_IDENTIFIER = 'tiny-till-catalog'

export const catalogExportMetadataSchema = z.object({
  version: z
    .string()
    .regex(VERSION_REGEX, { message: 'Version must be in semver format (e.g., 1.0.0)' }),
  format: z.literal(FORMAT_IDENTIFIER, {
    message: `Format must be "${FORMAT_IDENTIFIER}"`,
  }),
  exportedAt: z
    .number()
    .int()
    .positive({ message: 'Export timestamp must be a positive integer' }),
  productCount: z
    .number()
    .int()
    .nonnegative({ message: 'Product count must be a non-negative integer' }),
  checksum: z
    .string()
    .regex(CHECKSUM_REGEX, { message: 'Checksum must be a hexadecimal string' }),
})

export const catalogExportSchema: z.ZodType<CatalogExport> = z.object({
  meta: catalogExportMetadataSchema,
  products: productListSchema,
})

export function validateCatalogExport(data: unknown): {
  isValid: boolean
  error?: string
} {
  const result = catalogExportSchema.safeParse(data)

  if (!result.success) {
    const errorMessages = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    )
    return {
      isValid: false,
      error: `Export validation failed: ${errorMessages.join('; ')}`,
    }
  }

  return { isValid: true }
}

export async function verifyExportChecksum(exportData: CatalogExport): Promise<boolean> {
  const { generateExportChecksum } = await import('../utils/export')
  const computedChecksum = generateExportChecksum(exportData.products)
  return computedChecksum === exportData.meta.checksum
}

export function validateExportFormat(data: unknown): {
  isValid: boolean
  isCatalogExport: boolean
  error?: string
} {
  if (typeof data !== 'object' || data === null) {
    return {
      isValid: false,
      isCatalogExport: false,
      error: 'Export data must be an object',
    }
  }

  const plainData = data as Record<string, unknown>

  if ('meta' in plainData && 'products' in plainData) {
    const validation = validateCatalogExport(plainData)
    return {
      isValid: validation.isValid,
      isCatalogExport: true,
      error: validation.error,
    }
  }

  return {
    isValid: false,
    isCatalogExport: false,
    error: 'Data does not match catalog export format',
  }
}
