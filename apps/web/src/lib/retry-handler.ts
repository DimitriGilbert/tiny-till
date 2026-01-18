export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  jitter?: boolean
  shouldRetry?: (error: Error, attempt: number) => boolean
  onRetry?: (attempt: number, error: Error) => void
  onFinalFailure?: (error: Error) => void
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalDelay: number
}

const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry' | 'onFinalFailure'>> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts: Required<RetryOptions> = {
    maxAttempts: options.maxAttempts ?? DEFAULT_RETRY_OPTIONS.maxAttempts,
    baseDelay: options.baseDelay ?? DEFAULT_RETRY_OPTIONS.baseDelay,
    maxDelay: options.maxDelay ?? DEFAULT_RETRY_OPTIONS.maxDelay,
    backoffMultiplier: options.backoffMultiplier ?? DEFAULT_RETRY_OPTIONS.backoffMultiplier,
    jitter: options.jitter ?? DEFAULT_RETRY_OPTIONS.jitter,
    shouldRetry: options.shouldRetry ?? ((error: Error) => isRecoverableError(error)),
    onRetry: options.onRetry ?? (() => {}),
    onFinalFailure: options.onFinalFailure ?? (() => {}),
  }
  const startTime = Date.now()
  let lastError: Error | undefined
  let totalDelay = 0

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const data = await fn()
      const totalDuration = Date.now() - startTime

      return {
        success: true,
        data,
        attempts: attempt,
        totalDelay,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (!opts.shouldRetry(lastError, attempt)) {
        break
      }

      if (attempt < opts.maxAttempts) {
        const delay = calculateBackoffDelay(attempt, opts)
        totalDelay += delay

        opts.onRetry(attempt, lastError)

        await sleep(delay)
      }
    }
  }

  const totalDuration = Date.now() - startTime

  if (lastError) {
    opts.onFinalFailure(lastError)
  }

  return {
    success: false,
    error: lastError,
    attempts: opts.maxAttempts,
    totalDelay,
  }
}

export function calculateBackoffDelay(attempt: number, options: Required<RetryOptions>): number {
  let delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1)

  if (options.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5)
  }

  return Math.min(delay, options.maxDelay)
}

export function isRecoverableError(error: Error): boolean {
  const message = error.message.toLowerCase()

  const recoverablePatterns = [
    'timeout',
    'network',
    'temporary',
    'try again',
    'quota',
    'locked',
    'busy',
    'temporary failure',
    'rate limit',
  ]

  const nonRecoverablePatterns = [
    'access denied',
    'permission denied',
    'not found',
    'invalid',
    'malformed',
    'corrupt',
  ]

  if (nonRecoverablePatterns.some((pattern) => message.includes(pattern))) {
    return false
  }

  return recoverablePatterns.some((pattern) => message.includes(pattern))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createRetryableFunction<T extends Array<unknown>, R>(
  fn: (...args: T) => Promise<R>,
  defaultOptions: RetryOptions = {}
) {
  return async (...args: T): Promise<RetryResult<R>> => {
    return retryWithBackoff(() => fn(...args), defaultOptions)
  }
}

export async function retryOperationWithTracking<T>(
  operationName: string,
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const result = await retryWithBackoff(fn, {
    ...options,
    onRetry: (attempt, error) => {
      console.log(`[Retry] ${operationName} attempt ${attempt}/${options.maxAttempts || 3} failed:`, error.message)
      options.onRetry?.(attempt, error)
    },
    onFinalFailure: (error) => {
      console.error(`[Retry] ${operationName} failed after ${options.maxAttempts || 3} attempts:`, error)
      options.onFinalFailure?.(error)
    },
  })

  return result
}
