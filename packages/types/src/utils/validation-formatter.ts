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

  lines.push('## Summary')
  lines.push(`- Total Issues: ${result.summary.total}`)
  lines.push(`- Errors: ${result.summary.errors}`)
  lines.push(`- Warnings: ${result.summary.warnings}`)
  lines.push(`- Critical: ${result.summary.critical}`)
  lines.push('')

  if (result.versionCompatibility) {
    lines.push('## Version Compatibility')
    lines.push(`- Import Version: ${result.versionCompatibility.importVersion}`)
    lines.push(`- Current Version: ${result.versionCompatibility.currentVersion}`)
    lines.push(`- Compatible: ${result.versionCompatibility.isCompatible}`)
    lines.push('')
  }

  if (result.integrity) {
    lines.push('## Data Integrity')
    lines.push(`- Checksum Valid: ${result.integrity.checksumValid}`)
    lines.push(`- Data Integrity: ${result.integrity.dataIntegrityValid}`)
    if (result.integrity.corruptFields.length > 0) {
      lines.push(`- Corrupt Fields: ${result.integrity.corruptFields.join(', ')}`)
    }
    lines.push('')
  }

  if (result.issues.length > 0) {
    lines.push('## Issues')

    result.issues.forEach((issue, index) => {
      lines.push('')
      lines.push(`### ${index + 1}. ${issue.code}`)
      lines.push(`- Severity: ${issue.severity.level} (${issue.severity.impact})`)

      if (issue.field) {
        lines.push(`- Field: ${issue.field}`)
      }

      if (issue.line) {
        lines.push(
          `- Location: Line ${issue.line}${issue.column ? `, Column ${issue.column}` : ''}`
        )
      }

      lines.push(`- Message: ${issue.message}`)

      if (issue.recoverySuggestions && issue.recoverySuggestions.length > 0) {
        lines.push('- Recovery Suggestions:')
        issue.recoverySuggestions.forEach((s) => {
          lines.push(`  - ${s.action}: ${s.description}`)
        })
      }
    })
  }

  return lines.join('\n')
}
