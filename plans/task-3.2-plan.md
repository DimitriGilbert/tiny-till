# Task 3.2 Implementation Plan: JSON Schema Validation Engine with Detailed Error Reporting

## Overview
Enhance the existing validation engine with comprehensive error reporting that includes line-level error tracking, recovery suggestions, version compatibility checking, and corrupt file detection. Build on the foundation laid in task 3.1 to provide actionable, user-friendly error messages for schema violations, version mismatches, and data integrity issues.

## Current State Analysis
- **Existing**: Basic Zod schema validation with `validateCatalogImport()`
- **Existing**: Simple error reporting with `ImportValidationError` type
- **Existing**: Checksum verification in export utilities
- **Existing**: Error store with recovery action infrastructure
- **Missing**: Line-level error tracking
- **Missing**: Recovery suggestion engine
- **Missing**: Version compatibility checks
- **Missing**: Detailed corrupt file detection
- **Missing**: User-friendly error formatting

## Implementation Steps

### Step 1: Enhanced Error Type Definitions
**File: `packages/types/src/entities/import.ts`**

#### Add New Error Types
- `ValidationErrorSeverity`: 'error' | 'warning' | 'info' | 'critical'
- `RecoverySuggestion`: Interface for recovery action suggestions
- `ValidationIssue`: Enhanced error detail with line numbers and context
- `DetailedValidationResult`: Comprehensive validation result with structured issues
- `VersionCompatibilityResult`: Version check result
- `IntegrityCheckResult`: Data integrity check result

```typescript
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
```

### Step 2: Line-Level JSON Error Parsing
**File: `packages/types/src/validation/import.ts`**

#### Enhanced JSON Syntax Validation
- Add line number extraction from JSON parse errors
- Create JSON error location parser
- Extract problematic value context

```typescript
export function parseJSONErrorLocation(errorString: string): {
  line?: number
  column?: number
  position?: number
} {
  const match = errorString.match(/position (\d+)/)
  if (match) {
    return { position: parseInt(match[1], 10) }
  }
  const lineMatch = errorString.match(/line (\d+)/)
  if (lineMatch) {
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
      const context = extractJSONContext(jsonString, location.line, location.column)

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

  const startLine = Math.max(0, line - 2)
  const endLine = Math.min(lines.length, line + 3)

  for (let i = startLine; i < endLine; i++) {
    const prefix = i === line ? '> ' : '  '
    const lineNum = String(i + 1).padStart(3, ' ')
    contextLines.push(`${prefix}${lineNum} | ${lines[i]}`)

    if (i === line && column) {
      const spaces = ' '.repeat(column + 6)
      contextLines.push(`${spaces}^`)
    }
  }

  return contextLines.join('\n')
}
```

### Step 3: Version Compatibility Checker
**File: `packages/types/src/validation/import.ts`**

#### Version Validation
- Import current version from export entities
- Create semver comparison utilities
- Generate compatibility messages
- Provide upgrade/downgrade suggestions

```typescript
import { EXPORT_VERSION } from '../entities/export'

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

  const [major, minor, patch] = current.split('.').map(Number)
  const [impMajor, impMinor, impPatch] = importVersion.split('.').map(Number)

  let message = ''
  let isCompatible = true
  let upgradeRequired = false
  let downgradeRequired = false

  if (impMajor < major) {
    isCompatible = false
    upgradeRequired = true
    message = `Major version mismatch. Import file is ${importVersion}, current version is ${current}. Upgrade required.`
  } else if (impMajor > major) {
    isCompatible = false
    downgradeRequired = true
    message = `Major version mismatch. Import file is ${importVersion}, current version is ${current}. Downgrade required.`
  } else if (impMinor < minor) {
    isCompatible = true
    upgradeRequired = true
    message = `Minor version mismatch. Import file is ${importVersion}, current version is ${current}. Upgrade recommended.`
  } else if (impMinor > minor) {
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
```

### Step 4: Enhanced Zod Error Parsing
**File: `packages/types/src/validation/import.ts`**

#### Detailed Error Extraction
- Parse Zod error issues into detailed ValidationIssue objects
- Map Zod error codes to actionable messages
- Add recovery suggestions for common errors
- Extract field context and values

```typescript
export function parseZodErrorToValidationIssue(
  issue: z.ZodIssue,
  data?: unknown
): ValidationIssue {
  const field = issue.path.join('.')

  const errorMap: Record<string, { message: string; suggestions: RecoverySuggestion[] }> = {
    invalid_type: {
      message: `Invalid type for ${field || 'field'}. Expected: ${issue.expected}, Received: ${issue.received}`,
      suggestions: [],
    },
    too_small: {
      message: `${field || 'Field'} ${issue.type === 'string' ? 'is too short' : 'is too small'}`,
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
      message: `${field || 'Field'} ${issue.type === 'string' ? 'is too long' : 'is too large'}`,
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

  if (issue.code === 'too_big' && issue.type === 'string') {
    severity = {
      level: 'warning',
      impact: 'requires_review',
    }
  }

  const fieldValue = getFieldValueByPath(data, issue.path)

  return {
    code: issue.code.toUpperCase(),
    field,
    message: errorInfo.message,
    severity,
    value: fieldValue,
    recoverySuggestions: errorInfo.suggestions,
  }
}

function getFieldValueByPath(data: unknown, path: (string | number)[]): unknown {
  if (!data || path.length === 0) return undefined

  let current = data as Record<string, unknown>

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!current || !(key in current)) return undefined
    current = current[key] as Record<string, unknown>
  }

  const lastKey = path[path.length - 1]
  return current[lastKey]
}
```

### Step 5: Data Integrity Checker
**File: `packages/types/src/validation/import.ts`**

#### Comprehensive Integrity Validation
- Verify checksums
- Check for corrupt product data
- Validate timestamp consistency
- Detect duplicate IDs
- Validate image data integrity

```typescript
export async function checkDataIntegrity(
  importData: CatalogImport
): Promise<IntegrityCheckResult> {
  const corruptFields: string[] = []
  const checksumValid = await verifyImportChecksum(importData)

  const products = importData.products
  const idSet = new Set<string>()

  for (let i = 0; i < products.length; i++) {
    const product = products[i]

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
  if (!match) return false

  const mimeType = match[1]
  return ['png', 'jpeg', 'jpg', 'webp'].includes(mimeType)
}
```

### Step 6: Main Validation Engine
**File: `packages/types/src/validation/import.ts`**

#### Comprehensive Validation Function
- Combine all validation checks
- Generate detailed validation result
- Create error summaries
- Provide recovery suggestions

```typescript
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
```

### Step 7: Error Formatter Utility
**File: `packages/types/src/utils/validation-formatter.ts`**

#### Create New File for Error Formatting
- Format validation issues for display
- Create user-friendly error messages
- Generate recovery suggestion text
- Create HTML/markdown formatted error reports

```typescript
import type {
  ValidationIssue,
  DetailedValidationResult,
  RecoverySuggestion,
} from '../entities/import'

export function formatValidationResult(
  result: DetailedValidationResult
): {
  title: string
  message: string
  details: string[]
  canProceed: boolean
} {
  if (result.isValid) {
    return {
      title: 'Validation Successful',
      message: 'File passed all validation checks.',
      details: [
        `Products validated: ${result.data?.meta.productCount || 0}`,
        `Version: ${result.versionCompatibility?.importVersion}`,
        `Checksum: ${result.integrity?.checksumValid ? 'Valid' : 'Invalid'}`,
      ],
      canProceed: true,
    }
  }

  const blockingIssues = result.issues.filter(
    (i) => i.severity.impact === 'blocks_import'
  )
  const reviewIssues = result.issues.filter(
    (i) => i.severity.impact === 'requires_review'
  )

  let message = ''
  if (blockingIssues.length > 0) {
    message = `Found ${blockingIssues.length} critical issue${blockingIssues.length > 1 ? 's' : ''} blocking import.`
  } else if (reviewIssues.length > 0) {
    message = `Found ${reviewIssues.length} issue${reviewIssues.length > 1 ? 's' : ''} requiring review.`
  }

  const details = result.issues.map((issue) => formatValidationIssue(issue))

  return {
    title: 'Validation Issues Found',
    message,
    details,
    canProceed: blockingIssues.length === 0,
  }
}

export function formatValidationIssue(issue: ValidationIssue): string {
  const parts: string[] = []

  if (issue.field) {
    parts.push(`[${issue.field}]`)
  }

  if (issue.line) {
    parts.push(`Line ${issue.line}`)
    if (issue.column) {
      parts.push(`Column ${issue.column}`)
    }
  }

  parts.push(issue.message)

  if (issue.value !== undefined) {
    parts.push(`(Current value: ${JSON.stringify(issue.value)})`)
  }

  return parts.join(' ')
}

export function formatRecoverySuggestions(
  suggestions: RecoverySuggestion[]
): string[] {
  return suggestions.map((s) => {
    const prefix = s.autoFixable ? '✓' : '→'
    const severity = s.severity === 'required' ? ' [Required]' : ''
    return `${prefix} ${s.action}${severity}: ${s.description}`
  })
}

export function generateValidationReport(
  result: DetailedValidationResult,
  fileName?: string
): string {
  const lines: string[] = []

  lines.push('# Validation Report')
  lines.push('')

  if (fileName) {
    lines.push(`File: ${fileName}`)
    lines.push('')
  }

  lines.push(`## Summary`)
  lines.push(`- Total Issues: ${result.summary.total}`)
  lines.push(`- Errors: ${result.summary.errors}`)
  lines.push(`- Warnings: ${result.summary.warnings}`)
  lines.push(`- Critical: ${result.summary.critical}`)
  lines.push('')

  if (result.versionCompatibility) {
    lines.push(`## Version Compatibility`)
    lines.push(`- Import Version: ${result.versionCompatibility.importVersion}`)
    lines.push(`- Current Version: ${result.versionCompatibility.currentVersion}`)
    lines.push(`- Compatible: ${result.versionCompatibility.isCompatible}`)
    lines.push('')
  }

  if (result.integrity) {
    lines.push(`## Data Integrity`)
    lines.push(`- Checksum Valid: ${result.integrity.checksumValid}`)
    lines.push(`- Data Integrity: ${result.integrity.dataIntegrityValid}`)
    if (result.integrity.corruptFields.length > 0) {
      lines.push(`- Corrupt Fields: ${result.integrity.corruptFields.join(', ')}`)
    }
    lines.push('')
  }

  if (result.issues.length > 0) {
    lines.push(`## Issues`)

    result.issues.forEach((issue, index) => {
      lines.push(``)
      lines.push(`### ${index + 1}. ${issue.code}`)
      lines.push(`- Severity: ${issue.severity.level} (${issue.severity.impact})`)

      if (issue.field) {
        lines.push(`- Field: ${issue.field}`)
      }

      if (issue.line) {
        lines.push(`- Location: Line ${issue.line}${issue.column ? `, Column ${issue.column}` : ''}`)
      }

      lines.push(`- Message: ${issue.message}`)

      if (issue.recoverySuggestions && issue.recoverySuggestions.length > 0) {
        lines.push(`- Recovery Suggestions:`)
        issue.recoverySuggestions.forEach((s) => {
          lines.push(`  - ${s.action}: ${s.description}`)
        })
      }
    })
  }

  return lines.join('\n')
}
```

### Step 8: Update Import Utilities
**File: `packages/types/src/utils/import.ts`**

#### Add Detailed Validation Function
- Export new detailed validation function
- Update existing functions to use detailed results
- Add compatibility layer for existing code

```typescript
import {
  validateCatalogImportDetailed,
  validateJSONSyntaxWithLocation,
} from '../validation/import'
import type {
  DetailedValidationResult,
  ImportValidationResult,
} from '../entities/import'

export async function validateImportFileDetailed(
  data: unknown
): Promise<DetailedValidationResult> {
  return validateCatalogImportDetailed(data)
}

export async function validateJSONFileDetailed(
  file: File
): Promise<{
  isValid: boolean
  error?: string
  line?: number
  column?: number
  context?: string
}> {
  const fileContent = await file.text()
  return validateJSONSyntaxWithLocation(fileContent)
}

function mapDetailedToSimpleResult(
  detailed: DetailedValidationResult
): ImportValidationResult {
  return {
    isValid: detailed.isValid,
    data: detailed.data,
    errors: detailed.issues.map((issue) => ({
      code: issue.code as ImportValidationError['code'],
      field: issue.field,
      message: issue.message,
    })),
    warnings: detailed.issues
      .filter((i) => i.severity.level === 'warning')
      .map((i) => i.message),
  }
}

export async function validateImportFile(
  data: unknown
): Promise<ImportValidationResult> {
  const detailed = await validateImportFileDetailed(data)
  return mapDetailedToSimpleResult(detailed)
}
```

### Step 9: UI Component for Detailed Validation Errors
**File: `apps/web/src/components/ValidationIssueList.tsx`**

#### Create New Component
- Display validation issues with severity indicators
- Show recovery suggestions
- Provide expandable error details
- Include line number references with context

```typescript
import { AlertTriangle, Info, CheckCircle2, XCircle, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Badge } from './ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import type { ValidationIssue } from '@tiny-till/types'

interface ValidationIssueListProps {
  issues: ValidationIssue[]
  showContext?: boolean
  onApplySuggestion?: (suggestionId: string) => void
}

export function ValidationIssueList({
  issues,
  showContext = true,
  onApplySuggestion,
}: ValidationIssueListProps) {
  const groupedIssues = groupIssuesBySeverity(issues)

  return (
    <div className="space-y-4">
      {groupedIssues.critical.length > 0 && (
        <IssueGroup
          title="Critical Issues"
          issues={groupedIssues.critical}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          badgeColor="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}

      {groupedIssues.errors.length > 0 && (
        <IssueGroup
          title="Errors"
          issues={groupedIssues.errors}
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          badgeColor="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}

      {groupedIssues.warnings.length > 0 && (
        <IssueGroup
          title="Warnings"
          issues={groupedIssues.warnings}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
          badgeColor="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}

      {groupedIssues.info.length > 0 && (
        <IssueGroup
          title="Information"
          issues={groupedIssues.info}
          icon={<Info className="h-5 w-5 text-blue-500" />}
          badgeColor="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          showContext={showContext}
          onApplySuggestion={onApplySuggestion}
        />
      )}
    </div>
  )
}

interface IssueGroupProps {
  title: string
  issues: ValidationIssue[]
  icon: React.ReactNode
  badgeColor: string
  showContext: boolean
  onApplySuggestion?: (suggestionId: string) => void
}

function IssueGroup({
  title,
  issues,
  icon,
  badgeColor,
  showContext,
  onApplySuggestion,
}: IssueGroupProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
        <Badge className={badgeColor}>{issues.length}</Badge>
      </div>

      <div className="space-y-3">
        {issues.map((issue, index) => (
          <IssueCard
            key={`${issue.code}-${index}`}
            issue={issue}
            showContext={showContext}
            onApplySuggestion={onApplySuggestion}
          />
        ))}
      </div>
    </div>
  )
}

function IssueCard({
  issue,
  showContext,
  onApplySuggestion,
}: {
  issue: ValidationIssue
  showContext: boolean
  onApplySuggestion?: (suggestionId: string) => void
}) {
  return (
    <Collapsible className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <CollapsibleTrigger className="flex w-full items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {issue.field && (
              <code className="rounded bg-gray-100 px-2 py-0.5 text-sm dark:bg-gray-800">
                {issue.field}
              </code>
            )}
            {issue.line && (
              <span className="text-sm text-gray-500">Line {issue.line}</span>
            )}
          </div>
          <p className="mt-1 text-sm">{issue.message}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-500 transition-transform [&[data-state=open]]:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 space-y-3">
        {issue.value !== undefined && (
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-500">Current Value</p>
            <code className="block rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              {JSON.stringify(issue.value)}
            </code>
          </div>
        )}

        {issue.expectedValue !== undefined && (
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-500">Expected Value</p>
            <code className="block rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              {JSON.stringify(issue.expectedValue)}
            </code>
          </div>
        )}

        {issue.context && showContext && (
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-500">Context</p>
            <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              {issue.context}
            </pre>
          </div>
        )}

        {issue.recoverySuggestions && issue.recoverySuggestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">Recovery Suggestions</p>
            <div className="space-y-2">
              {issue.recoverySuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-start justify-between rounded border border-gray-200 p-3 dark:border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{suggestion.action}</p>
                      {suggestion.autoFixable && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Auto-fixable
                        </Badge>
                      )}
                      {suggestion.severity === 'required' && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                  </div>
                  {suggestion.autoFixable && onApplySuggestion && (
                    <Button size="sm" onClick={() => onApplySuggestion(suggestion.id)}>
                      Apply
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

function groupIssuesBySeverity(issues: ValidationIssue[]) {
  return {
    critical: issues.filter((i) => i.severity.level === 'critical'),
    errors: issues.filter((i) => i.severity.level === 'error'),
    warnings: issues.filter((i) => i.severity.level === 'warning'),
    info: issues.filter((i) => i.severity.level === 'info'),
  }
}
```

### Step 10: Validation Summary Component
**File: `apps/web/src/components/ValidationSummary.tsx`**

#### Create New Component
- Display validation summary with counts
- Show version compatibility status
- Display data integrity status
- Provide overall validation status

```typescript
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import type { DetailedValidationResult } from '@tiny-till/types'

interface ValidationSummaryProps {
  result: DetailedValidationResult
  fileName?: string
}

export function ValidationSummary({ result, fileName }: ValidationSummaryProps) {
  const statusIcon = result.isValid ? (
    <CheckCircle2 className="h-8 w-8 text-green-500" />
  ) : result.summary.critical > 0 ? (
    <XCircle className="h-8 w-8 text-red-500" />
  ) : (
    <AlertTriangle className="h-8 w-8 text-yellow-500" />
  )

  const statusText = result.isValid
    ? 'Valid'
    : result.summary.critical > 0
      ? 'Critical Errors'
      : 'Issues Found'

  const statusColor = result.isValid
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : result.summary.critical > 0
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-3">
            {statusIcon}
            <span>{statusText}</span>
          </CardTitle>
          <Badge className={statusColor}>{statusText}</Badge>
        </div>
        {fileName && <p className="text-sm text-gray-600 dark:text-gray-400">{fileName}</p>}
      </CardHeader>

      <CardContent className="space-y-4">
        <StatsRow
          label="Total Issues"
          value={result.summary.total}
          color={result.summary.total > 0 ? 'text-gray-600 dark:text-gray-400' : ''}
        />
        <StatsRow
          label="Critical"
          value={result.summary.critical}
          color="text-red-600 dark:text-red-400"
        />
        <StatsRow
          label="Errors"
          value={result.summary.errors}
          color="text-orange-600 dark:text-orange-400"
        />
        <StatsRow
          label="Warnings"
          value={result.summary.warnings}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatsRow
          label="Information"
          value={result.summary.info}
          color="text-blue-600 dark:text-blue-400"
        />

        {result.versionCompatibility && (
          <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
            <p className="mb-2 text-sm font-semibold">Version Compatibility</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Import: {result.versionCompatibility.importVersion}
              </span>
              <span>→</span>
              <span className="text-gray-600 dark:text-gray-400">
                Current: {result.versionCompatibility.currentVersion}
              </span>
              {result.versionCompatibility.isCompatible ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            {!result.versionCompatibility.isCompatible && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {result.versionCompatibility.message}
              </p>
            )}
          </div>
        )}

        {result.integrity && (
          <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
            <p className="mb-2 text-sm font-semibold">Data Integrity</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Checksum</span>
                {result.integrity.checksumValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Data Integrity</span>
                {result.integrity.dataIntegrityValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              {result.integrity.corruptFields.length > 0 && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Corrupt fields: {result.integrity.corruptFields.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {result.canAutoFix && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 dark:bg-green-950">
            <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200">
              Some issues can be automatically fixed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatsRow({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className={color}>{value}</span>
    </div>
  )
}
```

### Step 11: Update Hook for Detailed Validation
**File: `apps/web/src/hooks/useCatalogImport.ts`**

#### Enhance Hook
- Add detailed validation result handling
- Provide formatted validation messages
- Support recovery actions
- Return validation summary

```typescript
import type {
  CatalogImport,
  DetailedValidationResult,
  ImportValidationResult,
  ImportResult,
} from '@tiny-till/types'
import {
  validateImportFileDetailed,
  validateJSONFileDetailed,
} from '@tiny-till/types'
import { formatValidationResult } from '@tiny-till/types'

export interface UseCatalogImportReturn {
  isImporting: boolean
  importError: string | null
  validateImport: (file: File) => Promise<ImportValidationResult>
  validateImportDetailed: (file: File) => Promise<DetailedValidationResult>
  parseImportFile: (file: File) => Promise<ImportResult>
  clearError: () => void
}

export function useCatalogImport(): UseCatalogImportReturn {
  const [isImporting, setIsImporting] = React.useState(false)
  const [importError, setImportError] = React.useState<string | null>(null)

  const clearError = React.useCallback(() => {
    setImportError(null)
  }, [])

  const validateImportDetailed = React.useCallback(
    async (file: File): Promise<DetailedValidationResult> => {
      setIsImporting(true)
      setImportError(null)

      try {
        const extensionCheck = checkFileExtension(file)
        if (!extensionCheck.isValid) {
          setIsImporting(false)
          return {
            isValid: false,
            canAutoFix: false,
            issues: [
              {
                code: 'INVALID_FILE_EXTENSION',
                message: extensionCheck.error || 'Invalid file extension',
                severity: { level: 'critical', impact: 'blocks_import' },
              },
            ],
            summary: { total: 1, errors: 1, warnings: 0, info: 0, critical: 1 },
          }
        }

        const sizeCheck = checkFileSize(file)
        if (!sizeCheck.isValid) {
          setIsImporting(false)
          return {
            isValid: false,
            canAutoFix: false,
            issues: [
              {
                code: 'FILE_TOO_LARGE',
                message: sizeCheck.error || 'File too large',
                severity: { level: 'critical', impact: 'blocks_import' },
              },
            ],
            summary: { total: 1, errors: 1, warnings: 0, info: 0, critical: 1 },
          }
        }

        const jsonCheck = await validateJSONFileDetailed(file)
        if (!jsonCheck.isValid) {
          setIsImporting(false)
          return {
            isValid: false,
            canAutoFix: false,
            issues: [
              {
                code: 'INVALID_JSON',
                message: jsonCheck.error || 'Invalid JSON syntax',
                severity: { level: 'critical', impact: 'blocks_import' },
                line: jsonCheck.line,
                column: jsonCheck.column,
                context: jsonCheck.context,
                recoverySuggestions: [
                  {
                    id: 'fix-json',
                    action: 'Fix JSON syntax',
                    description: 'Review and correct the JSON syntax errors',
                    autoFixable: false,
                    severity: 'required',
                  },
                ],
              },
            ],
            summary: { total: 1, errors: 1, warnings: 0, info: 0, critical: 1 },
          }
        }

        const fileContent = await file.text()
        const data = JSON.parse(fileContent)

        const detailedResult = await validateImportFileDetailed(data)

        setIsImporting(false)
        return detailedResult
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setImportError(errorMessage)
        setIsImporting(false)
        return {
          isValid: false,
          canAutoFix: false,
          issues: [
            {
              code: 'VALIDATION_ERROR',
              message: errorMessage,
              severity: { level: 'critical', impact: 'blocks_import' },
            },
          ],
          summary: { total: 1, errors: 1, warnings: 0, info: 0, critical: 1 },
        }
      }
    },
    []
  )

  const validateImport = React.useCallback(
    async (file: File): Promise<ImportValidationResult> => {
      const detailed = await validateImportDetailed(file)

      const errors = detailed.issues.map((issue) => ({
        code: issue.code as ImportValidationError['code'],
        field: issue.field,
        message: issue.message,
      }))

      const warnings = detailed.issues
        .filter((i) => i.severity.level === 'warning')
        .map((i) => i.message)

      return {
        isValid: detailed.isValid,
        data: detailed.data,
        errors,
        warnings,
      }
    },
    [validateImportDetailed]
  )

  const parseImportFile = React.useCallback(
    async (file: File): Promise<ImportResult> => {
      setIsImporting(true)
      setImportError(null)

      try {
        const result = await processImportFile(file)

        if (!result.success) {
          setImportError(result.error || 'Failed to process file')
          setIsImporting(false)
          return result
        }

        setIsImporting(false)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setImportError(errorMessage)
        setIsImporting(false)
        return {
          success: false,
          error: errorMessage,
        }
      }
    },
    []
  )

  return {
    isImporting,
    importError,
    validateImport,
    validateImportDetailed,
    parseImportFile,
    clearError,
  }
}
```

### Step 12: Update Import UI Component
**File: `apps/web/src/components/CatalogImport.tsx`**

#### Enhance UI
- Display detailed validation results
- Show validation summary
- List all issues with severity
- Provide recovery action buttons
- Show line-level error context

```typescript
import { useState } from 'react'
import { FilePicker } from './FilePicker'
import { ValidationSummary } from './ValidationSummary'
import { ValidationIssueList } from './ValidationIssueList'
import { useCatalogImport } from '@/hooks/useCatalogImport'
import type { DetailedValidationResult } from '@tiny-till/types'

export function CatalogImport({ onImport }: { onImport: (data: CatalogImport) => void }) {
  const { isImporting, validateImportDetailed } = useCatalogImport()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<DetailedValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setIsValidating(true)

    const result = await validateImportDetailed(file)
    setValidationResult(result)
    setIsValidating(false)
  }

  const handleImport = () => {
    if (validationResult?.data) {
      onImport(validationResult.data)
    }
  }

  return (
    <div className="space-y-6">
      <FilePicker onFileSelect={handleFileSelect} disabled={isValidating || isImporting} />

      {isValidating && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Validating file...
        </div>
      )}

      {validationResult && (
        <>
          <ValidationSummary result={validationResult} fileName={selectedFile?.name} />

          {validationResult.issues.length > 0 && (
            <ValidationIssueList issues={validationResult.issues} />
          )}

          {validationResult.isValid && validationResult.data && (
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Import Catalog'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

### Step 13: Export All New Types and Functions
**File: `packages/types/src/index.ts`**

#### Update Exports
- Add new validation types
- Export detailed validation functions
- Export formatter utilities

```typescript
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
```

### Step 14: Update Validation Documentation
**File: `packages/types/src/validation/README.md`**

#### Add Detailed Validation Section
- Document new detailed validation functions
- Explain error severity levels
- Describe recovery suggestion system
- Provide usage examples

```markdown
## Detailed Validation

### Enhanced Validation Features

The validation engine now provides detailed error reporting with:

- **Line-level error tracking**: JSON syntax errors include line and column numbers
- **Contextual error messages**: Shows problematic code snippets
- **Severity levels**: Critical, error, warning, info
- **Recovery suggestions**: Actionable suggestions for fixing issues
- **Version compatibility**: Automatic version checking
- **Data integrity**: Checksum and data validation

### Usage Examples

#### Detailed Validation

```typescript
import { validateCatalogImportDetailed } from '@tiny-till/types'

const result = await validateCatalogImportDetailed(data)

console.log(result.isValid) // boolean
console.log(result.summary) // { total, errors, warnings, info, critical }
console.log(result.issues) // Array of ValidationIssue

result.issues.forEach(issue => {
  console.log(`${issue.code}: ${issue.message}`)
  console.log(`Severity: ${issue.severity.level}`)
  console.log(`Line: ${issue.line}`)

  issue.recoverySuggestions?.forEach(suggestion => {
    console.log(`Suggestion: ${suggestion.action}`)
    console.log(`Description: ${suggestion.description}`)
  })
})
```

#### Format Validation Report

```typescript
import { generateValidationReport } from '@tiny-till/types'

const report = generateValidationReport(result, 'catalog.json')
console.log(report) // Markdown-formatted report
```

#### Format Issues for Display

```typescript
import { formatValidationIssue } from '@tiny-till/types'

result.issues.forEach(issue => {
  const formatted = formatValidationIssue(issue)
  console.log(formatted)
})
```

### Error Severity Levels

- **Critical**: Blocks import entirely (version mismatch, corrupt data)
- **Error**: Must be fixed (missing required fields, invalid types)
- **Warning**: Should be reviewed (format inconsistencies, best practices)
- **Info**: Informational only (version notes, feature availability)

### Recovery Suggestions

Each validation issue may include recovery suggestions:

```typescript
interface RecoverySuggestion {
  id: string
  action: string
  description: string
  autoFixable: boolean
  severity: 'suggested' | 'required'
}
```

Auto-fixable suggestions can be applied programmatically to correct data.
```

## Testing Strategy

### Unit Tests
1. Test JSON error line number extraction
2. Test version compatibility checking (major/minor/patch)
3. Test data integrity checking (checksums, duplicates, timestamps)
4. Test Zod error parsing to ValidationIssue mapping
5. Test error formatter functions

### Integration Tests
1. Test full validation flow with valid files
2. Test validation with corrupt files
3. Test version mismatch scenarios
4. Test error reporting display
5. Test recovery suggestion application

### Manual Testing Checklist
- JSON syntax errors show line numbers and context
- Version incompatibility detected and reported
- Corrupt checksum detected
- Duplicate product IDs detected
- Timestamp inconsistencies detected
- Invalid image data detected
- Recovery suggestions displayed
- Auto-fixable issues marked
- Error severity correctly categorized
- Validation summary accurate
- Formatted error messages clear and actionable

## File Changes Summary

### New Files
1. `packages/types/src/utils/validation-formatter.ts` - Error formatting utilities
2. `apps/web/src/components/ValidationIssueList.tsx` - Detailed error display component
3. `apps/web/src/components/ValidationSummary.tsx` - Validation summary component

### Modified Files
1. `packages/types/src/entities/import.ts` - Add enhanced error type definitions
2. `packages/types/src/validation/import.ts` - Add detailed validation functions
3. `packages/types/src/utils/import.ts` - Add detailed validation wrappers
4. `apps/web/src/hooks/useCatalogImport.ts` - Add detailed validation support
5. `apps/web/src/components/CatalogImport.tsx` - Update UI for detailed errors
6. `packages/types/src/index.ts` - Export new types and functions
7. `packages/types/src/validation/README.md` - Update documentation

## Dependencies
- `zod` - Already installed, for schema validation
- `lucide-react` - Already installed, for icons
- Existing error store infrastructure
- Existing validation schemas

## Technical Considerations

### Error Severity Classification
- Critical: Version mismatch, corrupt data, missing required structure
- Error: Invalid types, required fields missing, format violations
- Warning: Length limits, best practices, minor format issues
- Info: Version notes, feature availability, informational messages

### Recovery Actions
- Auto-fixable: Trim whitespace, fix minor formatting
- Required: Must be fixed before import can proceed
- Suggested: Recommended but not blocking

### Performance
- Integrity checks use async for checksum verification
- Duplicate detection uses Set for O(n) performance
- Line number parsing uses regex for efficiency

### Compatibility
- Maintains backward compatibility with existing validation functions
- Simple result type for existing consumers
- Detailed result type for new consumers

## Success Criteria
1. JSON syntax errors include line numbers and code context
2. Version compatibility detected with clear messages
3. Data integrity checks detect corrupt fields
4. Checksum verification reports mismatch details
5. Validation issues include recovery suggestions
6. Error severity properly categorized (critical/error/warning/info)
7. UI components display detailed error information
8. Validation summary shows accurate issue counts
9. Error formatter produces user-friendly messages
10. All existing validation functionality maintained
11. TypeScript strict mode passes
12. No LSP errors
13. `npm run check-types` passes
14. `npm run build` passes

## Notes for Future Tasks
- This task focuses on validation and error reporting only
- Task 3.3 will add import preview modal
- Task 3.4 will implement actual import execution with conflict resolution
- Task 3.5 will add comprehensive error handling for import execution
- Task 3.6 will implement backup reminder system
