import * as React from 'react'
import type {
  CatalogImport,
  ImportValidationResult,
  ImportResult,
  DetailedValidationResult,
  ImportPreviewData,
} from '@tiny-till/types'
import type { Product } from '@tiny-till/types'
import {
  checkFileExtension,
  checkFileSize,
  checkMimeType,
  validateImportFile,
  validateImportFileDetailed,
  validateJSONFileDetailed,
  processImportFile,
  compareProductsForImport,
  categorizeProductChange,
} from '@tiny-till/types'
import { toast } from 'sonner'

export interface UseCatalogImportReturn {
  isImporting: boolean
  importError: string | null
  validateImport: (file: File) => Promise<ImportValidationResult>
  validateImportDetailed: (file: File) => Promise<DetailedValidationResult>
  parseImportFile: (file: File) => Promise<ImportResult>
  analyzeImport: (file: File, existingProducts: Product[]) => Promise<ImportPreviewData | null>
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

  const analyzeImport = React.useCallback(
    async (file: File, existingProducts: Product[]): Promise<ImportPreviewData | null> => {
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
          return null
        }

        const sizeCheck = checkFileSize(file)
        if (!sizeCheck.isValid) {
          setImportError(sizeCheck.error || 'File too large')
          toast.error('File Too Large', {
            description: sizeCheck.error,
          })
          setIsImporting(false)
          return null
        }

        const jsonCheck = await validateJSONFileDetailed(file)
        if (!jsonCheck.isValid) {
          setImportError(jsonCheck.error || 'Invalid JSON syntax')
          toast.error('Invalid JSON', {
            description: jsonCheck.error,
          })
          setIsImporting(false)
          return null
        }

        const fileContent = await file.text()
        const data = JSON.parse(fileContent)

        const validationResult = await validateImportFileDetailed(data)
        if (!validationResult.isValid) {
          setImportError('Validation failed')
          toast.error('Validation Failed', {
            description: 'File does not match expected catalog format',
          })
          setIsImporting(false)
          return null
        }

        const analysis = compareProductsForImport(existingProducts, data)
        const allChanges = data.products.map((product: Product) =>
          categorizeProductChange(existingProducts, product)
        )

        const previewData: ImportPreviewData = {
          file,
          importData: data,
          analysis,
          allChanges,
        }

        setIsImporting(false)
        return previewData
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setImportError(errorMessage)
        toast.error('Analysis Error', {
          description: errorMessage,
        })
        setIsImporting(false)
        return null
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
    analyzeImport,
    clearError,
  }
}
