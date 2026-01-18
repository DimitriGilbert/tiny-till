import * as React from 'react'
import type {
  CatalogImport,
  ImportValidationResult,
  ImportResult,
} from '@tiny-till/types'
import {
  checkFileExtension,
  checkFileSize,
  checkMimeType,
  validateImportFile,
  processImportFile,
} from '@tiny-till/types'
import { toast } from 'sonner'

export interface UseCatalogImportReturn {
  isImporting: boolean
  importError: string | null
  validateImport: (file: File) => Promise<ImportValidationResult>
  parseImportFile: (file: File) => Promise<ImportResult>
  clearError: () => void
}

export function useCatalogImport(): UseCatalogImportReturn {
  const [isImporting, setIsImporting] = React.useState(false)
  const [importError, setImportError] = React.useState<string | null>(null)

  const clearError = React.useCallback(() => {
    setImportError(null)
  }, [])

  const validateImport = React.useCallback(
    async (file: File): Promise<ImportValidationResult> => {
      setIsImporting(true)
      setImportError(null)

      try {
        const extensionCheck = checkFileExtension(file)
        if (!extensionCheck.isValid) {
          setImportError(extensionCheck.error || 'Invalid file extension')
          toast.error('Invalid File', {
            description: extensionCheck.error,
          })
          setIsImporting(false)
          return {
            isValid: false,
            errors: [
              {
                message: extensionCheck.error || 'Invalid file extension',
                code: 'INVALID_FORMAT',
              },
            ],
            warnings: [],
          }
        }

        const sizeCheck = checkFileSize(file)
        if (!sizeCheck.isValid) {
          setImportError(sizeCheck.error || 'File too large')
          toast.error('File Too Large', {
            description: sizeCheck.error,
          })
          setIsImporting(false)
          return {
            isValid: false,
            errors: [
              {
                message: sizeCheck.error || 'File too large',
                code: 'INVALID_FORMAT',
              },
            ],
            warnings: [],
          }
        }

        const mimeCheck = checkMimeType(file)
        if (!mimeCheck.isValid) {
          setImportError(mimeCheck.error || 'Invalid file type')
          toast.error('Invalid File Type', {
            description: mimeCheck.error,
          })
          setIsImporting(false)
          return {
            isValid: false,
            errors: [
              {
                message: mimeCheck.error || 'Invalid file type',
                code: 'INVALID_FORMAT',
              },
            ],
            warnings: [],
          }
        }

        const fileContent = await file.text()
        try {
          JSON.parse(fileContent)
        } catch (error) {
          const errorMessage = 'Invalid JSON syntax. Please check the file format.'
          setImportError(errorMessage)
          toast.error('Invalid JSON', {
            description: errorMessage,
          })
          setIsImporting(false)
          return {
            isValid: false,
            errors: [
              {
                message: errorMessage,
                code: 'INVALID_JSON',
              },
            ],
            warnings: [],
          }
        }

        try {
          const data = JSON.parse(fileContent)
          const validation = validateImportFile(data)

          if (!validation.isValid) {
            const errorMessages = validation.errors
              .map((e) => `${e.field ? `${e.field}: ` : ''}${e.message}`)
              .join(', ')
            setImportError(errorMessages)
            toast.error('Validation Failed', {
              description: errorMessages,
            })
            setIsImporting(false)
            return validation
          }

          toast.success('File Validated', {
            description: `Successfully validated ${validation.data?.meta.productCount || 0} products`,
          })

          setIsImporting(false)
          return validation
        } catch (error) {
          const errorMessage = 'Failed to validate file structure'
          setImportError(errorMessage)
          toast.error('Validation Error', {
            description: errorMessage,
          })
          setIsImporting(false)
          return {
            isValid: false,
            errors: [
              {
                message: errorMessage,
                code: 'INVALID_FORMAT',
              },
            ],
            warnings: [],
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setImportError(errorMessage)
        toast.error('Validation Error', {
          description: errorMessage,
        })
        setIsImporting(false)
        return {
          isValid: false,
          errors: [
            {
              message: errorMessage,
              code: 'INVALID_FORMAT',
            },
          ],
          warnings: [],
        }
      }
    },
    []
  )

  const parseImportFile = React.useCallback(
    async (file: File): Promise<ImportResult> => {
      setIsImporting(true)
      setImportError(null)

      try {
        const result = await processImportFile(file)

        if (!result.success) {
          setImportError(result.error || 'Failed to process file')
          toast.error('Import Failed', {
            description: result.error,
          })
          setIsImporting(false)
          return result
        }

        toast.success('File Parsed', {
          description: `Successfully parsed ${result.data?.meta.productCount || 0} products`,
        })

        setIsImporting(false)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setImportError(errorMessage)
        toast.error('Parse Error', {
          description: errorMessage,
        })
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
    parseImportFile,
    clearError,
  }
}
