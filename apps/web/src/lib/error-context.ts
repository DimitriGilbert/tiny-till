export interface ErrorContext {
  operation: string
  fileName?: string
  fileSize?: number
  productCount?: number
  lineNumber?: number
  columnNumber?: number
  fieldName?: string
  productId?: string
  productName?: string
  currentAction?: string
  timestamp: number
  errorId: string
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  additionalData?: Record<string, unknown>
}

export function createErrorContext(
  operation: string,
  overrides: Partial<ErrorContext> = {}
): ErrorContext {
  return {
    operation,
    timestamp: Date.now(),
    errorId: `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    ...overrides,
  }
}

export function createFileReadErrorContext(
  fileName: string,
  fileSize?: number
): ErrorContext {
  return createErrorContext('File Read', {
    fileName,
    fileSize,
  })
}

export function createValidationErrorContext(
  fieldName?: string,
  productId?: string,
  productName?: string
): ErrorContext {
  return createErrorContext('Validation', {
    fieldName,
    productId,
    productName,
  })
}

export function createImportErrorContext(
  fileName: string,
  productCount: number,
  currentAction?: string
): ErrorContext {
  return createErrorContext('Catalog Import', {
    fileName,
    productCount,
    currentAction,
  })
}

export function createStorageErrorContext(
  operation: string,
  dataSize?: number
): ErrorContext {
  return createErrorContext(`Storage ${operation}`, {
    additionalData: { dataSize },
  })
}

export function createNetworkErrorContext(
  operation: string,
  url?: string
): ErrorContext {
  return createErrorContext(`Network ${operation}`, {
    url,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  })
}
