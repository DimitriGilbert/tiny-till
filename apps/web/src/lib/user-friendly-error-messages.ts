export interface ErrorContext {
  action?: string
  productId?: string
  productName?: string
  fieldName?: string
  additionalContext?: string
}

export interface UserFriendlyMessage {
  title: string
  description: string
  actions: string[]
  severity: 'info' | 'warning' | 'error' | 'critical'
  canRecover: boolean
}

export type TechnicalError =
  | 'QuotaExceededError'
  | 'NetworkError'
  | 'TimeoutError'
  | 'StorageAccessError'
  | 'InvalidJSONError'
  | 'ValidationError'
  | 'VersionConflictError'
  | 'DataCorruptionError'

const userFriendlyMessages: Record<TechnicalError, (context: ErrorContext) => UserFriendlyMessage> = {
  QuotaExceededError: (context) => ({
    title: 'Storage Almost Full',
    description: context.action 
      ? `Unable to complete "${context.action}" because storage is nearly full.`
      : 'Your browser storage is almost full. This prevents saving new data.',
    actions: [
      'Remove old products you no longer sell',
      'Delete product images to free up space',
      'Export your catalog as a backup',
      'Clear browser data (this will delete all local data)',
    ],
    severity: 'critical',
    canRecover: true,
  }),

  NetworkError: (context) => ({
    title: 'Connection Issue',
    description: context.action
      ? `Unable to ${context.action} due to network problems.`
      : 'A network error occurred while performing this operation.',
    actions: [
      'Check your internet connection',
      'Wait for your connection to be more stable',
      'Try the operation again later',
      'Note: This app works offline for most features',
    ],
    severity: 'warning',
    canRecover: true,
  }),

  TimeoutError: (context) => ({
    title: 'Operation Timed Out',
    description: context.action
      ? `The "${context.action}" operation took too long to complete.`
      : 'This operation took longer than expected and timed out.',
    actions: [
      'Wait a moment and try again',
      'If importing a large catalog, be patient as it may take time',
      'Check if the file size is unusually large',
      'Try breaking large imports into smaller batches',
    ],
    severity: 'warning',
    canRecover: true,
  }),

  StorageAccessError: (context) => ({
    title: 'Storage Access Denied',
    description: 'The application cannot access browser storage. This may be due to browser settings or privacy restrictions.',
    actions: [
      'Check if your browser allows site data storage',
      'Try using a different browser',
      'Disable any privacy extensions that block storage',
      'Try using normal mode instead of incognito/private mode',
      'If the problem persists, contact support',
    ],
    severity: 'critical',
    canRecover: true,
  }),

  InvalidJSONError: (context) => ({
    title: 'Invalid File Format',
    description: context.action === 'import'
      ? 'The file you are trying to import is not a valid JSON file.'
      : 'The data contains invalid JSON format.',
    actions: [
      'Check that the file is a valid JSON file',
      'Use a JSON validator to check the file format',
      'Ensure the file was exported from this app',
      'Try re-exporting the catalog from the source',
    ],
    severity: 'error',
    canRecover: false,
  }),

  ValidationError: (context) => {
    const fieldInfo = context.fieldName ? ` field "${context.fieldName}"` : ''
    return {
      title: `Validation Error for ${fieldInfo}`,
      description: context.productName
        ? `The product "${context.productName}" has invalid data${fieldInfo}.`
        : `There is a validation error in the data${fieldInfo}.`,
      actions: [
        'Review the entered data for errors',
        'Ensure all required fields are filled',
        'Check that values are in the correct format',
        'See error details for specific issues',
      ],
      severity: 'error',
      canRecover: true,
    }
  },

  VersionConflictError: (context) => ({
    title: 'Version Incompatibility',
    description: 'The catalog file was created with a different version of this app. Some features may not work correctly.',
    actions: [
      'Update this app to the latest version',
      'If importing from an older version, the import should still work',
      'If importing from a newer version, you need to update first',
      'Contact support if you need help with version compatibility',
    ],
    severity: 'warning',
    canRecover: true,
  }),

  DataCorruptionError: (context) => ({
    title: 'Data Integrity Issue',
    description: context.productName
      ? `The data for "${context.productName}" appears to be corrupted or inconsistent.`
      : 'Data integrity issues were detected that could cause problems.',
    actions: [
      'Import a backup of your catalog if available',
      'Remove the affected product and recreate it',
      'Check if the issue affects multiple products',
      'If corruption persists, clear all data and re-import from backup',
    ],
    severity: 'critical',
    canRecover: true,
  }),
}

export function getUserFriendlyMessage(
  errorName: TechnicalError,
  context: ErrorContext = {}
): UserFriendlyMessage {
  const messageFactory = userFriendlyMessages[errorName]
  return messageFactory(context)
}

export function getAllUserFriendlyMessages(): Record<
  TechnicalError,
  (context: ErrorContext) => UserFriendlyMessage
> {
  return userFriendlyMessages
}

export function getRecoverySuggestion(
  errorName: TechnicalError,
  context: ErrorContext = {}
): string {
  const message = getUserFriendlyMessage(errorName, context)
  
  if (message.canRecover && message.actions.length > 0) {
    return `Suggested action: ${message.actions[0]}`
  }
  
  return 'This error requires manual intervention. See details above.'
}

export function getErrorMessageForDisplay(
  errorName: TechnicalError,
  context: ErrorContext = {}
): { title: string; description: string; actions: string[] } {
  const message = getUserFriendlyMessage(errorName, context)
  
  return {
    title: message.title,
    description: message.description,
    actions: message.actions,
  }
}

export function formatErrorMessage(error: Error, context: ErrorContext = {}): string {
  const errorName = error.name as TechnicalError
  
  if (userFriendlyMessages[errorName]) {
    const message = getUserFriendlyMessage(errorName, context)
    return `${message.title}: ${message.description}`
  }
  
  return error.message
}

export function getSeverityDisplay(severity: 'info' | 'warning' | 'error' | 'critical'): string {
  switch (severity) {
    case 'info':
      return 'Information'
    case 'warning':
      return 'Warning'
    case 'error':
      return 'Error'
    case 'critical':
      return 'Critical Issue'
  }
  return ''
}

export function canAutoRecover(errorName: TechnicalError): boolean {
  const autoRecoverable: TechnicalError[] = [
    'NetworkError',
    'TimeoutError',
  ]
  
  return autoRecoverable.includes(errorName)
}

export function requiresUserAction(errorName: TechnicalError): boolean {
  return !canAutoRecover(errorName)
}

export function getSeverityLevel(
  errorName: TechnicalError,
  context: ErrorContext = {}
): 'info' | 'warning' | 'error' | 'critical' {
  return getUserFriendlyMessage(errorName, context).severity
}
