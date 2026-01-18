import type { Severity } from '@/stores/error-store'

export type ErrorCode =
  | 'FILE_READ_ERROR'
  | 'FILE_ACCESS_DENIED'
  | 'FILE_ENCODING_ERROR'
  | 'INVALID_JSON'
  | 'JSON_PARSE_ERROR'
  | 'UNEXPECTED_TOKEN'
  | 'VALIDATION_FAILED'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_FIELD_TYPE'
  | 'DUPLICATE_PRODUCT_ID'
  | 'CONFLICT_DETECTED'
  | 'VERSION_CONFLICT'
  | 'DATA_CONFLICT'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'STORAGE_WRITE_ERROR'
  | 'STORAGE_READ_ERROR'
  | 'INDEXEDDB_ERROR'
  | 'NETWORK_ERROR'
  | 'REQUEST_TIMEOUT'
  | 'OFFLINE_MODE'

export interface ErrorMessage {
  code: ErrorCode
  title: string
  description: string
  affectedOperations: string[]
  recoverySteps: string[]
  severity: Severity
}

const errorMessages: Record<ErrorCode, ErrorMessage> = {
  FILE_READ_ERROR: {
    code: 'FILE_READ_ERROR',
    title: 'File Read Error',
    description: 'Unable to read the selected file. The file may be corrupted or inaccessible.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Check that the file is not open in another application',
      'Verify the file permissions allow reading',
      'Try selecting the file again',
      'If the problem persists, try exporting your catalog from another device and re-importing',
    ],
    severity: 'high',
  },

  FILE_ACCESS_DENIED: {
    code: 'FILE_ACCESS_DENIED',
    title: 'Access Denied',
    description: 'Permission denied when trying to access the file.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Check browser file access permissions',
      'Ensure the file is not in a protected folder',
      'Try moving the file to a different location',
      'Restart your browser and try again',
    ],
    severity: 'critical',
  },

  FILE_ENCODING_ERROR: {
    code: 'FILE_ENCODING_ERROR',
    title: 'File Encoding Error',
    description: 'The file uses an unsupported encoding format.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Ensure the file is saved as UTF-8 encoded text',
      'Open the file in a text editor and save with UTF-8 encoding',
      'Check that the file is a valid JSON file',
      'Try re-exporting the catalog from the source application',
    ],
    severity: 'high',
  },

  INVALID_JSON: {
    code: 'INVALID_JSON',
    title: 'Invalid JSON',
    description: 'The file contains invalid JSON syntax that cannot be parsed.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Validate the JSON file using an online JSON validator',
      'Check for missing commas, quotes, or brackets',
      'Ensure the file is complete and not truncated',
      'Try re-exporting the catalog from the source application',
    ],
    severity: 'critical',
  },

  JSON_PARSE_ERROR: {
    code: 'JSON_PARSE_ERROR',
    title: 'JSON Parse Error',
    description: 'Failed to parse the JSON file content.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Verify the file is a valid JSON format',
      'Check that the file structure matches the catalog schema',
      'Review any error details for the specific parsing issue',
      'Try importing a different export file',
    ],
    severity: 'critical',
  },

  UNEXPECTED_TOKEN: {
    code: 'UNEXPECTED_TOKEN',
    title: 'Unexpected Token',
    description: 'Found an unexpected token in the JSON file at an invalid position.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Check for typos or misplaced characters in the file',
      'Verify the file was not edited manually with incorrect syntax',
      'Use a JSON linter to identify syntax errors',
      'Re-export the catalog from the source application',
    ],
    severity: 'critical',
  },

  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    title: 'Validation Failed',
    description: 'The catalog data failed validation checks.',
    affectedOperations: ['Catalog Import', 'Product Management'],
    recoverySteps: [
      'Review the validation error details for specific issues',
      'Check that all required fields are present',
      'Ensure field values match the expected types',
      'Fix the issues and try importing again',
    ],
    severity: 'high',
  },

  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    title: 'Missing Required Field',
    description: 'One or more required fields are missing from the product data.',
    affectedOperations: ['Catalog Import', 'Product Management'],
    recoverySteps: [
      'Check that all products have an ID, name, and price',
      'Verify the field names match the expected schema',
      'Add missing required fields to the data',
      'Re-import the corrected file',
    ],
    severity: 'high',
  },

  INVALID_FIELD_TYPE: {
    code: 'INVALID_FIELD_TYPE',
    title: 'Invalid Field Type',
    description: 'A field contains data of an incorrect type.',
    affectedOperations: ['Catalog Import', 'Product Management'],
    recoverySteps: [
      'Verify price fields are numeric values',
      'Ensure name fields are text strings',
      'Check that image data is properly formatted as base64 or URL',
      'Correct the field types and re-import',
    ],
    severity: 'high',
  },

  DUPLICATE_PRODUCT_ID: {
    code: 'DUPLICATE_PRODUCT_ID',
    title: 'Duplicate Product ID',
    description: 'Multiple products have the same ID, which is not allowed.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Review the import file for duplicate product IDs',
      'Generate unique IDs for products that conflict',
      'Use the conflict resolution dialog to handle duplicates',
      'Re-import the file with unique IDs',
    ],
    severity: 'medium',
  },

  CONFLICT_DETECTED: {
    code: 'CONFLICT_DETECTED',
    title: 'Import Conflict Detected',
    description: 'The import contains products that conflict with existing catalog entries.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Use the preview to review conflicting products',
      'Choose a resolution strategy (merge, replace, or skip)',
      'Apply the resolution and continue with the import',
      'Export a backup before making changes',
    ],
    severity: 'medium',
  },

  VERSION_CONFLICT: {
    code: 'VERSION_CONFLICT',
    title: 'Version Conflict',
    description: 'The catalog file version is incompatible with the current application version.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Check if an application update is available',
      'If importing from a newer version, update the application first',
      'If importing from an older version, the import should still work',
      'Contact support if the issue persists',
    ],
    severity: 'medium',
  },

  DATA_CONFLICT: {
    code: 'DATA_CONFLICT',
    title: 'Data Conflict',
    description: 'Data integrity issues detected in the import file.',
    affectedOperations: ['Catalog Import'],
    recoverySteps: [
      'Review the specific data conflicts in the preview',
      'Use the conflict resolution dialog to choose how to handle them',
      'Consider re-exporting the catalog from the source',
      'Export a backup of your current catalog before proceeding',
    ],
    severity: 'high',
  },

  STORAGE_QUOTA_EXCEEDED: {
    code: 'STORAGE_QUOTA_EXCEEDED',
    title: 'Storage Quota Exceeded',
    description: 'Browser storage quota has been exceeded. Cannot save additional data.',
    affectedOperations: ['Catalog Import', 'Product Management', 'Image Upload'],
    recoverySteps: [
      'Remove unused products from the catalog',
      'Delete old images that are no longer needed',
      'Export your catalog as a backup',
      'Clear browser data (this will delete all local data)',
    ],
    severity: 'critical',
  },

  STORAGE_WRITE_ERROR: {
    code: 'STORAGE_WRITE_ERROR',
    title: 'Storage Write Error',
    description: 'Failed to write data to browser storage.',
    affectedOperations: ['Catalog Import', 'Product Management'],
    recoverySteps: [
      'Check if storage quota has been exceeded',
      'Try clearing some space by removing unused products',
      'Restart your browser and try again',
      'If using private/incognito mode, try normal mode',
    ],
    severity: 'critical',
  },

  STORAGE_READ_ERROR: {
    code: 'STORAGE_READ_ERROR',
    title: 'Storage Read Error',
    description: 'Failed to read data from browser storage.',
    affectedOperations: ['Catalog Import', 'Product Management'],
    recoverySteps: [
      'Restart your browser and try again',
      'Clear browser cache and retry',
      'Check that storage is accessible (not disabled)',
      'If the problem persists, consider reinstalling the application',
    ],
    severity: 'critical',
  },

  INDEXEDDB_ERROR: {
    code: 'INDEXEDDB_ERROR',
    title: 'IndexedDB Error',
    description: 'An error occurred with the IndexedDB database.',
    affectedOperations: ['Catalog Import', 'Product Management'],
    recoverySteps: [
      'Check browser console for specific IndexedDB error details',
      'Try closing and reopening the application',
      'Clear site data and re-import your catalog',
      'Ensure your browser supports IndexedDB',
    ],
    severity: 'high',
  },

  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Network Error',
    description: 'A network error occurred during the operation.',
    affectedOperations: ['Any operation requiring network access'],
    recoverySteps: [
      'Check your internet connection',
      'Try the operation again when your connection is stable',
      'If using WiFi, try a wired connection',
      'This application is designed to work offline - check if you need network access',
    ],
    severity: 'high',
  },

  REQUEST_TIMEOUT: {
    code: 'REQUEST_TIMEOUT',
    title: 'Request Timeout',
    description: 'The operation took too long and timed out.',
    affectedOperations: ['Any long-running operation'],
    recoverySteps: [
      'Try the operation again',
      'If importing a large catalog, it may take time - be patient',
      'Check if the file size is unusually large',
      'Break large imports into smaller batches if possible',
    ],
    severity: 'medium',
  },

  OFFLINE_MODE: {
    code: 'OFFLINE_MODE',
    title: 'Offline Mode',
    description: 'You are currently offline and the operation requires network access.',
    affectedOperations: ['Any operation requiring network access'],
    recoverySteps: [
      'Check your internet connection',
      'Connect to a network and try again',
      'Most features in this application work offline - check if you need network access',
      'Wait for your connection to be restored',
    ],
    severity: 'low',
  },
}

export function getErrorMessage(code: ErrorCode): ErrorMessage {
  return errorMessages[code]
}

export function getAllErrorMessages(): Record<ErrorCode, ErrorMessage> {
  return errorMessages
}

export function getErrorMessagesBySeverity(
  severity: Severity
): ErrorMessage[] {
  return Object.values(errorMessages).filter((msg) => msg.severity === severity)
}

export function getRecoverableErrorCodes(): ErrorCode[] {
  return Object.values(errorMessages)
    .filter((msg) => msg.severity !== 'critical')
    .map((msg) => msg.code)
}
