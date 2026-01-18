import type { CatalogExport } from './export'
import type { Product } from './product'

export type CatalogImport = CatalogExport

export type ProductChangeType = 'add' | 'update' | 'conflict' | 'unchanged'

export interface ProductChange {
  productId: string
  changeType: ProductChangeType
  existingProduct?: Product
  newProduct: Product
  changedFields?: string[]
  isConflict: boolean
  conflictType?: 'version' | 'data' | 'id'
}

export interface ImportAnalysis {
  totalProducts: number
  productsToAdd: Product[]
  productsToUpdate: Array<{
    existing: Product
    updated: Product
    changedFields: string[]
  }>
  productsInConflict: ProductChange[]
  unchangedProducts: number
}

export interface ImportPreviewData {
  file: File
  importData: CatalogImport
  analysis: ImportAnalysis
  allChanges: ProductChange[]
}

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

export interface ValidationErrorSeverity {
  level: 'error' | 'warning' | 'info' | 'critical'
  impact: 'blocks_import' | 'requires_review' | 'informational'
}

export interface RecoverySuggestion {
  id: string
  action: string
  description: string
  autoFixable: boolean
  severity: 'suggested' | 'required'
}

export interface ValidationIssue {
  code: string
  field?: string
  message: string
  severity: ValidationErrorSeverity
  line?: number
  column?: number
  value?: unknown
  expectedValue?: unknown
  recoverySuggestions?: RecoverySuggestion[]
  context?: string
}

export interface DetailedValidationResult {
  isValid: boolean
  canAutoFix: boolean
  data?: CatalogImport
  issues: ValidationIssue[]
  summary: {
    total: number
    errors: number
    warnings: number
    info: number
    critical: number
  }
  versionCompatibility?: VersionCompatibilityResult
  integrity?: IntegrityCheckResult
}

export interface VersionCompatibilityResult {
  isCompatible: boolean
  currentVersion: string
  importVersion: string
  message: string
  upgradeRequired: boolean
  downgradeRequired: boolean
}

export interface IntegrityCheckResult {
  checksumValid: boolean
  dataIntegrityValid: boolean
  corruptFields: string[]
  message: string
}

export type ConflictResolutionStrategy = 'merge' | 'replace' | 'skip'

export interface ConflictResolution {
  productId: string
  strategy: ConflictResolutionStrategy
  fieldOverrides?: Record<string, 'existing' | 'incoming'>
}

export interface ImportExecutionOptions {
  conflictResolutions: Map<string, ConflictResolution>
  batchSize?: number
  onProgress?: (progress: ImportProgress) => void
}

export interface ImportProgress {
  total: number
  processed: number
  added: number
  updated: number
  skipped: number
  failed: number
  currentProduct?: {
    id: string
    name: string
  }
  error?: string
  startTime: number
  estimatedTimeRemaining?: number
  retryAttempts: number
  currentBatch?: number
  totalBatches?: number
}

export interface ImportTransaction {
  id: string
  products: Product[]
  timestamp: number
  status: 'pending' | 'committing' | 'committed' | 'rolled-back'
}

export interface ImportExecutionResult {
  success: boolean
  transactionId: string
  added: number
  updated: number
  skipped: number
  failed: number
  errors: Array<{
    productId: string
    productName: string
    error: string
  }>
}
