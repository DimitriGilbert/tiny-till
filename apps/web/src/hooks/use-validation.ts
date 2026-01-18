import { useMemo } from 'react'
import type { z } from 'zod'
import type { ValidationResult } from '../lib/validators'

export function useFieldValidator<T>(
  validator: (value: T) => ValidationResult
): {
  validate: (value: T) => ValidationResult
  validateAsync: (value: T) => Promise<ValidationResult>
} {
  return useMemo(
    () => ({
      validate: (value: T) => validator(value),
      validateAsync: async (value: T) => validator(value),
    }),
    [validator]
  )
}

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (data: unknown): ValidationResult => {
    const result = schema.safeParse(data)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'field'
        return `${path}: ${issue.message}`
      })
      return {
        isValid: false,
        error: errors.join(', '),
      }
    }

    return { isValid: true }
  }

  const validateAsync = async (data: unknown): Promise<ValidationResult> => {
    return validate(data)
  }

  return {
    validate,
    validateAsync,
  }
}
