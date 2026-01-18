import { z } from 'zod'
import type { CatalogImport } from '../entities/import'
import { catalogExportSchema } from './export'
import type { ImportValidationError, ImportValidationResult } from '../entities/import'

export const catalogImportSchema: z.ZodType<CatalogImport> = catalogExportSchema

export function validateCatalogImport(data: unknown): ImportValidationResult {
  const errors: ImportValidationError[] = []
  const warnings: string[] = []

  const result = catalogImportSchema.safeParse(data)

  if (!result.success) {
    const zodErrors = result.error.issues

    for (const issue of zodErrors) {
      const field = issue.path.join('.')
      const error: ImportValidationError = {
        field,
        message: issue.message,
        code: 'INVALID_FORMAT',
      }

      if (issue.code === z.ZodIssueCode.invalid_type) {
        error.code = 'MISSING_REQUIRED_FIELD'
      }

      errors.push(error)
    }

    return {
      isValid: false,
      errors,
      warnings,
    }
  }

  return {
    isValid: true,
    data: result.data,
    errors,
    warnings,
  }
}

export function validateJSONSyntax(jsonString: string): {
  isValid: boolean
  error?: string
} {
  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        isValid: false,
        error: `Invalid JSON: ${error.message}`,
      }
    }
    return {
      isValid: false,
      error: 'Unknown JSON syntax error',
    }
  }
}

export function checkFileStructure(data: unknown): {
  isValid: boolean
  isCatalogImport: boolean
  error?: string
} {
  if (typeof data !== 'object' || data === null) {
    return {
      isValid: false,
      isCatalogImport: false,
      error: 'Import data must be an object',
    }
  }

  const plainData = data as Record<string, unknown>

  if (!('meta' in plainData) || typeof plainData.meta !== 'object') {
    return {
      isValid: false,
      isCatalogImport: false,
      error: 'Missing or invalid "meta" field',
    }
  }

  if (!('products' in plainData) || !Array.isArray(plainData.products)) {
    return {
      isValid: false,
      isCatalogImport: false,
      error: 'Missing or invalid "products" array',
    }
  }

  const meta = plainData.meta as Record<string, unknown>

  if (!('version' in meta) || !('format' in meta)) {
    return {
      isValid: false,
      isCatalogImport: false,
      error: 'Missing required fields in metadata (version, format)',
    }
  }

  if (meta.format !== 'tiny-till-catalog') {
    return {
      isValid: false,
      isCatalogImport: false,
      error: `Invalid format. Expected "tiny-till-catalog", got "${meta.format}"`,
    }
  }

  return {
    isValid: true,
    isCatalogImport: true,
  }
}
