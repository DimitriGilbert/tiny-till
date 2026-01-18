import * as React from 'react'
import { Upload, X, FileJson, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FilePicker } from '@/components/FilePicker'
import type { CatalogImport as CatalogImportType, ImportValidationResult } from '@tiny-till/types'
import { useCatalogImport } from '@/hooks/useCatalogImport'
import { toast } from 'sonner'

export interface CatalogImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: CatalogImportType) => void
  disabled?: boolean
}

export function CatalogImport({
  open,
  onOpenChange,
  onImport,
  disabled = false,
}: CatalogImportProps) {
  const { isImporting, importError, validateImport, parseImportFile, clearError } =
    useCatalogImport()
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [validationResult, setValidationResult] = React.useState<ImportValidationResult | null>(
    null
  )
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [filePickerError, setFilePickerError] = React.useState<string>()

  const resetState = React.useCallback(() => {
    setSelectedFile(null)
    setValidationResult(null)
    setIsProcessing(false)
    setFilePickerError(undefined)
    clearError()
  }, [clearError])

  React.useEffect(() => {
    if (!open) {
      resetState()
    }
  }, [open, resetState])

  const handleFileSelect = React.useCallback(
    async (file: File) => {
      setSelectedFile(file)
      setFilePickerError(undefined)
      setValidationResult(null)

      try {
        setIsProcessing(true)
        const validation = await validateImport(file)

        if (!validation.isValid) {
          setFilePickerError(validation.errors[0]?.message || 'Validation failed')
          setValidationResult(validation)
          setIsProcessing(false)
          return
        }

        setValidationResult(validation)
        setIsProcessing(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to validate file'
        setFilePickerError(errorMessage)
        setIsProcessing(false)
      }
    },
    [validateImport]
  )

  const handleImport = React.useCallback(async () => {
    if (!selectedFile || !validationResult?.isValid) {
      return
    }

    try {
      setIsProcessing(true)
      const result = await parseImportFile(selectedFile)

      if (!result.success || !result.data) {
        setFilePickerError(result.error || 'Failed to parse file')
        setIsProcessing(false)
        return
      }

      onImport(result.data)
      toast.success('Import Successful', {
        description: `Imported ${result.data.meta.productCount} products`,
      })
      resetState()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import file'
      setFilePickerError(errorMessage)
      toast.error('Import Failed', {
        description: errorMessage,
      })
      setIsProcessing(false)
    }
  }, [selectedFile, validationResult, parseImportFile, onImport, resetState, onOpenChange])

  const handleCancel = React.useCallback(() => {
    resetState()
    onOpenChange(false)
  }, [resetState, onOpenChange])

  const handleClearFile = React.useCallback(() => {
    setSelectedFile(null)
    setValidationResult(null)
    setFilePickerError(undefined)
  }, [])

  const isValidFile = validationResult?.isValid && selectedFile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Catalog</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!selectedFile ? (
            <FilePicker
              onFileSelect={handleFileSelect}
              accept=".json"
              maxSize={10 * 1024 * 1024}
              allowedExtensions={['.json']}
              disabled={disabled || isProcessing || isImporting}
              label="Select Catalog File"
              helpText="Upload a JSON file exported from Tiny-Till. Maximum file size: 10MB"
              error={filePickerError || importError || undefined}
              processing={isProcessing || isImporting}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
                <FileJson className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleClearFile}
                  disabled={disabled || isProcessing || isImporting}
                  aria-label="Clear file selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isProcessing || isImporting ? (
                <div className="flex items-center justify-center p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Validating file...</span>
                  </div>
                </div>
              ) : (
                <>
                  {validationResult?.isValid ? (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          File Validated Successfully
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Ready to import {validationResult.data?.meta.productCount || 0} products
                        </p>
                      </div>
                    </div>
                  ) : validationResult?.errors && validationResult.errors.length > 0 ? (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Validation Errors</p>
                        <ul className="text-xs text-destructive/80 mt-1 list-disc list-inside space-y-0.5">
                          {validationResult.errors.map((error) => (
                            <li key={`${error.field}-${error.code}-${error.message}`}>
                              {error.field ? <span className="font-medium">{error.field}: </span> : ''}
                              {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={disabled || isProcessing || isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={disabled || !isValidFile || isProcessing || isImporting}
          >
            {isProcessing || isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
