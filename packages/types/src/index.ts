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
