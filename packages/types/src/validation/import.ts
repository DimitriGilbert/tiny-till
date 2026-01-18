import { z } from 'zod'
import type { CatalogImport } from '../entities/import'
import { catalogExportSchema } from './export'
import type {
  ImportValidationError,
  ImportValidationResult,
  ValidationIssue,
  ValidationErrorSeverity,
  RecoverySuggestion,
  VersionCompatibilityResult,
  IntegrityCheckResult,
  DetailedValidationResult,
} from '../entities/import'
import { EXPORT_VERSION } from '../entities/export'

export const catalogImportSchema: z.ZodType<CatalogImport> = catalogExportSchema

export function parseJSONErrorLocation(errorString: string): {
  line?: number
  column?: number
  position?: number
} {
  const match = errorString.match(/position (\d+)/)
  if (match && match[1]) {
    return { position: parseInt(match[1], 10) }
  }
  const lineMatch = errorString.match(/line (\d+)/)
  if (lineMatch && lineMatch[1]) {
    return { line: parseInt(lineMatch[1], 10) }
  }
  return {}
}

export function validateJSONSyntaxWithLocation(jsonString: string): {
  isValid: boolean
  error?: string
  line?: number
  column?: number
  context?: string
} {
  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    if (error instanceof SyntaxError) {
      const location = parseJSONErrorLocation(error.message)
      const context = extractJSONContext(jsonString, location.line ?? 1, location.column ?? 1)

      return {
        isValid: false,
        error: error.message,
        line: location.line,
        column: location.column,
        context,
      }
    }
    return {
      isValid: false,
      error: 'Unknown JSON syntax error',
    }
  }
}

function extractJSONContext(
  jsonString: string,
  line?: number,
  column?: number
): string | undefined {
  if (!line) return undefined

  const lines = jsonString.split('\n')
  const contextLines = []

  const startLine = Math.max(0, line - 3)
  const endLine = Math.min(lines.length, line + 2)

  for (let i = startLine; i < endLine; i++) {
    const prefix = i === line - 1 ? '> ' : '  '
    const lineNum = String(i + 1).padStart(3, ' ')
    contextLines.push(`${prefix}${lineNum} | ${lines[i]}`)

    if (i === line - 1 && column) {
      const spaces = ' '.repeat(column + 6)
      contextLines.push(`${spaces}^`)
    }
  }

  return contextLines.join('\n')
}

export function checkVersionCompatibility(importVersion: string): VersionCompatibilityResult {
  const current = EXPORT_VERSION

  if (importVersion === current) {
    return {
      isCompatible: true,
      currentVersion: current,
      importVersion,
      message: 'Version matches exactly',
      upgradeRequired: false,
      downgradeRequired: false,
    }
  }

  const [major, minor] = current.split('.').map(Number)
  const [impMajor, impMinor] = importVersion.split('.').map(Number)

  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(impMajor) || Number.isNaN(impMinor)) {
    return {
      isCompatible: false,
      currentVersion: current,
      importVersion,
      message: `Invalid version format. Current: ${current}, Import: ${importVersion}`,
      upgradeRequired: false,
      downgradeRequired: false,
    }
  }

  let message = ''
  let isCompatible = true
  let upgradeRequired = false
  let downgradeRequired = false

  if (impMajor! < major!) {
    isCompatible = false
    upgradeRequired = true
    message = `Major version mismatch. Import file is ${importVersion}, current version is ${current}. Upgrade required.`
  } else if (impMajor! > major!) {
    isCompatible = false
    downgradeRequired = true
    message = `Major version mismatch. Import file is ${importVersion}, current version is ${current}. Downgrade required.`
  } else if (impMinor! < minor!) {
    isCompatible = true
    upgradeRequired = true
    message = `Minor version mismatch. Import file is ${importVersion}, current version is ${current}. Upgrade recommended.`
  } else if (impMinor! > minor!) {
    isCompatible = true
    message = `Minor version mismatch. Import file is ${importVersion}, current version is ${current}. May have new features.`
  } else {
    isCompatible = true
    message = `Patch version difference. Import file is ${importVersion}, current version is ${current}.`
  }

  return {
    isCompatible,
    currentVersion: current,
    importVersion,
    message,
    upgradeRequired,
    downgradeRequired,
  }
}

export function parseZodErrorToValidationIssue(
  issue: z.ZodIssue,
  data?: unknown
): ValidationIssue {
  const field = issue.path.join('.')

  const errorMap: Record<string, { message: string; suggestions: RecoverySuggestion[] }> = {
    invalid_type: {
      message: `Invalid type for ${field || 'field'}`,
      suggestions: [],
    },
    too_small: {
      message: `${field || 'Field'} is too small`,
      suggestions: [
        {
          id: 'increase-value',
          action: 'Increase value',
          description: `Ensure ${field || 'field'} meets the minimum requirement`,
          autoFixable: false,
          severity: 'required',
        },
      ],
    },
    too_big: {
      message: `${field || 'Field'} is too large`,
      suggestions: [
        {
          id: 'decrease-value',
          action: 'Reduce value',
          description: `Ensure ${field || 'field'} meets the maximum requirement`,
          autoFixable: false,
          severity: 'required',
        },
      ],
    },
    invalid_string: {
      message: `${field || 'Field'} format is invalid`,
      suggestions: [
        {
          id: 'fix-format',
          action: 'Fix format',
          description: `Check ${field || 'field'} against required format`,
          autoFixable: false,
          severity: 'required',
        },
      ],
    },
  }

  const errorInfo = errorMap[issue.code] || {
    message: issue.message,
    suggestions: [],
  }

  let severity: ValidationErrorSeverity = {
    level: 'error',
    impact: 'blocks_import',
  }

  const fieldValue = getFieldValueByPath(data, issue.path as readonly (string | number)[])

  return {
    code: issue.code.toUpperCase(),
    field,
    message: errorInfo.message,
    severity,
    value: fieldValue,
    recoverySuggestions: errorInfo.suggestions,
  }
}

function getFieldValueByPath(data: unknown, path: readonly (string | number)[]): unknown {
  if (!data || path.length === 0) return undefined

  let current = data as Record<string, unknown>

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!key) return undefined
    if (!current || !(key in current)) return undefined
    current = current[key] as Record<string, unknown>
  }

  const lastKey = path[path.length - 1]
  if (!lastKey) return undefined
  return current[lastKey]
}

export async function checkDataIntegrity(
  importData: CatalogImport
): Promise<IntegrityCheckResult> {
  const corruptFields: string[] = []
  const checksumValid = await verifyImportChecksum(importData)

  const products = importData.products
  const idSet = new Set<string>()

  for (let i = 0; i < products.length; i++) {
    const product = products[i]

    if (!product) {
      corruptFields.push(`products[${i}].product`)
      continue
    }

    if (!product.id || typeof product.id !== 'string') {
      corruptFields.push(`products[${i}].id`)
      continue
    }

    if (idSet.has(product.id)) {
      corruptFields.push(`products[${i}].id (duplicate)`)
    }
    idSet.add(product.id)

    if (!product.name || product.name.trim() === '') {
      corruptFields.push(`products[${i}].name`)
    }

    if (typeof product.price !== 'number' || product.price <= 0) {
      corruptFields.push(`products[${i}].price`)
    }

    if (product.updatedAt < product.createdAt) {
      corruptFields.push(`products[${i}].timestamps`)
    }

    if (product.imageData && !isValidImageDataUrl(product.imageData)) {
      corruptFields.push(`products[${i}].imageData`)
    }
  }

  const dataIntegrityValid = corruptFields.length === 0

  let message = ''
  if (!checksumValid) {
    message = 'Checksum mismatch detected. File may be corrupted.'
  } else if (!dataIntegrityValid) {
    message = `Data integrity issues found in ${corruptFields.length} field(s).`
  } else {
    message = 'All integrity checks passed.'
  }

  return {
    checksumValid,
    dataIntegrityValid,
    corruptFields,
    message,
  }
}

function isValidImageDataUrl(data: string): boolean {
  if (!data) return true
  if (!data.startsWith('data:image/')) return false

  const match = data.match(/^data:image\/([^;]+);base64,/)
  if (!match || !match[1]) return false

  const mimeType = match[1]
  return ['png', 'jpeg', 'jpg', 'webp'].includes(mimeType)
}

async function verifyImportChecksum(importData: CatalogImport): Promise<boolean> {
  const expectedChecksum = importData.meta.checksum
  if (!expectedChecksum) return false

  const calculatedChecksum = calculateChecksumFromProducts(importData.products)

  return expectedChecksum === calculatedChecksum
}

function calculateChecksumFromProducts(products: CatalogImport['products']): string {
  const data = JSON.stringify(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageData: p.imageData,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))
  )

  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash | 0
  }
  return Math.abs(hash).toString(16)
}

export async function validateCatalogImportDetailed(
  data: unknown
): Promise<DetailedValidationResult> {
  const issues: ValidationIssue[] = []

  const structureCheck = checkFileStructure(data)
  if (!structureCheck.isValid) {
    return {
      isValid: false,
      canAutoFix: false,
      issues: [
        {
          code: 'INVALID_STRUCTURE',
          message: structureCheck.error || 'Invalid file structure',
          severity: { level: 'critical', impact: 'blocks_import' },
          recoverySuggestions: [
            {
              id: 'check-format',
              action: 'Verify file format',
              description: 'Ensure file is a valid TinyTill catalog export',
              autoFixable: false,
              severity: 'required',
            },
          ],
        },
      ],
      summary: { total: 1, errors: 1, warnings: 0, info: 0, critical: 1 },
    }
  }

  const importData = data as CatalogImport

  const versionCheck = checkVersionCompatibility(importData.meta.version)
  if (!versionCheck.isCompatible) {
    issues.push({
      code: 'VERSION_INCOMPATIBLE',
      message: versionCheck.message,
      severity: { level: 'critical', impact: 'blocks_import' },
      recoverySuggestions: versionCheck.upgradeRequired
        ? [
            {
              id: 'upgrade-app',
              action: 'Upgrade TinyTill',
              description: 'Update to latest version to import this file',
              autoFixable: false,
              severity: 'required',
            },
          ]
        : [
            {
              id: 'downgrade-app',
              action: 'Use compatible version',
              description: 'Use a version compatible with this export file',
              autoFixable: false,
              severity: 'required',
            },
          ],
    })
  }

  const schemaResult = catalogImportSchema.safeParse(importData)
  if (!schemaResult.success) {
    for (const issue of schemaResult.error.issues) {
      const validationIssue = parseZodErrorToValidationIssue(issue, importData)
      issues.push(validationIssue)
    }
  }

  const integrityCheck = await checkDataIntegrity(importData)
  if (!integrityCheck.dataIntegrityValid) {
    for (const field of integrityCheck.corruptFields) {
      issues.push({
        code: 'DATA_CORRUPTION',
        field,
        message: `Corrupt or invalid data detected in ${field}`,
        severity: { level: 'critical', impact: 'blocks_import' },
        recoverySuggestions: [
          {
            id: 'restore-backup',
            action: 'Restore from backup',
            description: 'Use a backup copy of the export file',
            autoFixable: false,
            severity: 'required',
          },
          {
            id: 're-export',
            action: 'Re-export from source',
            description: 'Generate a new export from the original data',
            autoFixable: false,
            severity: 'suggested',
          },
        ],
      })
    }
  }

  const summary = {
    total: issues.length,
    errors: issues.filter((i) => i.severity.level === 'error').length,
    warnings: issues.filter((i) => i.severity.level === 'warning').length,
    info: issues.filter((i) => i.severity.level === 'info').length,
    critical: issues.filter((i) => i.severity.level === 'critical').length,
  }

  const canAutoFix = issues.some((issue) =>
    issue.recoverySuggestions?.some((s) => s.autoFixable)
  )

  return {
    isValid: issues.filter((i) => i.severity.impact === 'blocks_import').length === 0,
    canAutoFix,
    data: schemaResult.success ? schemaResult.data : importData,
    issues,
    summary,
    versionCompatibility: versionCheck,
    integrity: integrityCheck,
  }
}

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
