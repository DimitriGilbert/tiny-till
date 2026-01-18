import type { Product, ProductChange, ImportExecutionOptions, ImportProgress } from '@tiny-till/types'
import type { ErrorContext } from './error-context'
import { retryWithBackoff, type RetryOptions, type RetryResult } from './retry-handler'
import { createImportErrorContext } from './error-context'

export interface ImportRetryOptions extends RetryOptions {
  retryOnValidationErrors?: boolean
  retryOnStorageErrors?: boolean
  retryOnNetworkErrors?: boolean
  maxProductRetries?: number
  onProductRetry?: (productId: string, productName: string, attempt: number) => void
}

export interface ImportRetryStats {
  totalRetries: number
  successfulRetries: number
  failedRetries: number
  retriedProducts: Map<string, number>
  totalDelay: number
}

export async function retryFileRead(
  fileReadFn: () => Promise<string>,
  fileName: string,
  options: RetryOptions = {}
): Promise<RetryResult<string>> {
  return retryWithBackoff(fileReadFn, {
    maxAttempts: 3,
    baseDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 2,
    ...options,
    onRetry: (attempt, error) => {
      console.log(`[ImportRetry] File read attempt ${attempt}/${options.maxAttempts || 3} failed for ${fileName}:`, error.message)
      options.onRetry?.(attempt, error)
    },
  })
}

export async function retryJsonParse<T>(
  jsonParseFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return retryWithBackoff(jsonParseFn, {
    maxAttempts: 2,
    baseDelay: 100,
    maxDelay: 500,
    backoffMultiplier: 1.5,
    ...options,
    onRetry: (attempt, error) => {
      console.log(`[ImportRetry] JSON parse attempt ${attempt}/${options.maxAttempts || 2} failed:`, error.message)
      options.onRetry?.(attempt, error)
    },
  })
}

export async function retryValidation(
  validationFn: () => Promise<boolean>,
  context: ErrorContext,
  options: RetryOptions = {}
): Promise<RetryResult<boolean>> {
  return retryWithBackoff(validationFn, {
    maxAttempts: 2,
    baseDelay: 200,
    maxDelay: 1000,
    backoffMultiplier: 2,
    ...options,
    onRetry: (attempt, error) => {
      console.log(`[ImportRetry] Validation attempt ${attempt}/${options.maxAttempts || 2} failed:`, error.message)
      options.onRetry?.(attempt, error)
    },
  })
}

export async function retryProductOperation<T>(
  productId: string,
  productName: string,
  operation: () => Promise<T>,
  options: ImportRetryOptions = {}
): Promise<RetryResult<T>> {
  return retryWithBackoff(operation, {
    maxAttempts: options.maxProductRetries ?? 3,
    baseDelay: 300,
    maxDelay: 3000,
    backoffMultiplier: 2,
    ...options,
    onRetry: (attempt, error) => {
      console.log(`[ImportRetry] Product "${productName}" attempt ${attempt} failed:`, error.message)
      if (options.onProductRetry) {
        options.onProductRetry(productId, productName, attempt)
      }
    },
  })
}

export async function retryBatchImport(
  products: Product[],
  batchFn: () => Promise<void>,
  options: ImportRetryOptions = {}
): Promise<RetryResult<void>> {
  return retryWithBackoff(batchFn, {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    ...options,
    onRetry: (attempt, error) => {
      console.log(`[ImportRetry] Batch import attempt ${attempt} for ${products.length} products failed:`, error.message)
      options.onRetry?.(attempt, error)
    },
  })
}

export async function retryFailedProducts<T>(
  failedProducts: Array<{ product: Product; error: Error }>,
  retryFn: (product: Product) => Promise<T>,
  options: ImportRetryOptions = {}
): Promise<{
  successful: Array<{ product: Product; result: T }>
  stillFailed: Array<{ product: Product; error: Error }>
  stats: ImportRetryStats
}> {
  const successful: Array<{ product: Product; result: T }> = []
  const stillFailed: Array<{ product: Product; error: Error }> = []
  const retriedProducts = new Map<string, number>()
  let totalRetries = 0
  let successfulRetries = 0
  let totalDelay = 0

  for (const { product, error } of failedProducts) {
    const retryCount = retriedProducts.get(product.id) || 0
    const maxRetries = options.maxProductRetries ?? 3

    if (retryCount >= maxRetries) {
      stillFailed.push({ product, error })
      continue
    }

    totalRetries++

    const result = await retryProductOperation(
      product.id,
      product.name,
      () => retryFn(product),
      options
    )

    retriedProducts.set(product.id, retryCount + 1)

    if (result.success && result.data) {
      successful.push({ product, result: result.data })
      successfulRetries++
    } else {
      stillFailed.push({ product, error: result.error || error })
    }

    totalDelay += result.totalDelay
  }

  return {
    successful,
    stillFailed,
    stats: {
      totalRetries,
      successfulRetries,
      failedRetries: totalRetries - successfulRetries,
      retriedProducts,
      totalDelay,
    },
  }
}

export function shouldRetryImportError(error: Error, attempt: number): boolean {
  const message = error.message.toLowerCase()

  const retryableErrors = [
    'quota',
    'locked',
    'busy',
    'timeout',
    'network',
    'temporary',
  ]

  const nonRetryableErrors = [
    'invalid json',
    'malformed',
    'corrupt',
    'access denied',
    'permission denied',
    'not found',
    'duplicate',
    'validation failed',
  ]

  if (nonRetryableErrors.some((pattern) => message.includes(pattern))) {
    return false
  }

  if (retryableErrors.some((pattern) => message.includes(pattern))) {
    return attempt < 3
  }

  return false
}

export async function executeImportWithRetry<T>(
  changes: ProductChange[],
  executeFn: (changes: ProductChange[], options: ImportExecutionOptions) => Promise<T>,
  importOptions: ImportExecutionOptions,
  retryOptions: ImportRetryOptions = {}
): Promise<{
  result: T | null
  retryStats: ImportRetryStats
  attempts: number
}> {
  let attempts = 0
  let lastError: Error | null = null
  const stats: ImportRetryStats = {
    totalRetries: 0,
    successfulRetries: 0,
    failedRetries: 0,
    retriedProducts: new Map(),
    totalDelay: 0,
  }

  const result = await retryWithBackoff(
    async () => {
      attempts++
      return await executeFn(changes, importOptions)
    },
    {
      maxAttempts: retryOptions.maxAttempts ?? 3,
      baseDelay: retryOptions.baseDelay ?? 1000,
      maxDelay: retryOptions.maxDelay ?? 10000,
      backoffMultiplier: retryOptions.backoffMultiplier ?? 2,
      jitter: retryOptions.jitter ?? true,
      shouldRetry: (error, attempt) => {
        const shouldRetry = shouldRetryImportError(error, attempt)
        if (!shouldRetry) {
          lastError = error
        }
        return shouldRetry
      },
      onRetry: (attempt, error) => {
        stats.totalRetries++
        console.log(`[ImportRetry] Import attempt ${attempt} failed:`, error.message)
        retryOptions.onRetry?.(attempt, error)
      },
    }
  )

  stats.totalDelay += result.totalDelay
  if (result.success) {
    stats.successfulRetries = result.attempts - 1
  } else {
    stats.failedRetries = result.attempts
  }

  return {
    result: result.success && result.data !== undefined ? result.data : null,
    retryStats: stats,
    attempts: result.attempts,
  }
}
