import type { CatalogExport } from './export'

export type CatalogImport = CatalogExport

export interface ImportValidationError {
  field?: string
  message: string
  code:
    | 'INVALID_JSON'
    | 'INVALID_FORMAT'
    | 'INVALID_VERSION'
    | 'MISSING_REQUIRED_FIELD'
    | 'INVALID_PRODUCT'
    | 'INVALID_IMAGE_DATA'
    | 'DUPLICATE_PRODUCT_ID'
    | 'CHECKSUM_MISMATCH'
}

export interface ImportValidationResult {
  isValid: boolean
  data?: CatalogImport
  errors: ImportValidationError[]
  warnings: string[]
}

export interface ImportResult {
  success: boolean
  data?: CatalogImport
  error?: string
  errors?: ImportValidationError[]
}

export interface ImportMetadata {
  fileName: string
  fileSize: number
  lastModified: number
  isValidJson: boolean
  hasValidStructure: boolean
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_EXTENSIONS = ['.json']
export const ALLOWED_MIME_TYPES = ['application/json', 'text/plain']
