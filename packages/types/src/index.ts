export * from './entities'
export * from './utils'
export * from './guards'
export * from './validation'

export type {
  ValidationErrorSeverity,
  RecoverySuggestion,
  ValidationIssue,
  DetailedValidationResult,
  VersionCompatibilityResult,
  IntegrityCheckResult,
  ProductChangeType,
  ProductChange,
  ImportAnalysis,
  ImportPreviewData,
} from './entities/import'

export {
  validateCatalogImportDetailed,
  validateJSONSyntaxWithLocation,
  parseJSONErrorLocation,
  checkVersionCompatibility,
  checkDataIntegrity,
  parseZodErrorToValidationIssue,
} from './validation/import'

export {
  formatValidationResult,
  formatValidationIssue,
  formatRecoverySuggestions,
  generateValidationReport,
} from './utils/validation-formatter'

export {
  validateImportFileDetailed,
  validateJSONFileDetailed,
  validateImportFileAsync,
} from './utils/import'

export {
  compareProductsForImport,
  detectProductChanges,
  categorizeProductChange,
  generateChangeSummary,
  filterChangesByType,
  hasChanges,
  isSafeToImport,
} from './utils/import-comparison'
