import * as React from 'react'
import { Upload, X, FileJson, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FilePicker } from '@/components/FilePicker'
import { ImportPreview } from '@/components/ImportPreview'
import { BackupWarningDialog } from '@/components/backup-warning-dialog'
import type { CatalogImport as CatalogImportType, ImportPreviewData, ProductChange } from '@tiny-till/types'
import { useCatalogImport } from '@/hooks/useCatalogImport'
import { useCatalogStore } from '@/stores/catalog-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useCatalogExport } from '@/hooks/useCatalogExport'
import { getBackupReminderConfig } from '@/lib/backup-reminder'
import { toast } from 'sonner'

export interface CatalogImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}

export function CatalogImport({
  open,
  onOpenChange,
  disabled = false,
}: CatalogImportProps) {
  const { isImporting, importError, validateImport, parseImportFile, analyzeImport, clearError } =
    useCatalogImport()
  const importAtomic = useCatalogStore((state) => state.importAtomic)
  const products = useCatalogStore((state) => state.products)

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [validationResult, setValidationResult] = React.useState<any>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [filePickerError, setFilePickerError] = React.useState<string>()
  const [previewData, setPreviewData] = React.useState<ImportPreviewData | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)
  const [isImportingPreview, setIsImportingPreview] = React.useState(false)

  const settings = useSettingsStore((state) => state)
  const { exportCatalog, isExporting } = useCatalogExport()
  const [showBackupWarning, setShowBackupWarning] = React.useState(false)

  const resetState = React.useCallback(() => {
    setSelectedFile(null)
    setValidationResult(null)
    setIsProcessing(false)
    setFilePickerError(undefined)
    setPreviewData(null)
    setShowPreview(false)
    setShowBackupWarning(false)
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

        const preview = await analyzeImport(file, products)
        if (preview) {
          setPreviewData(preview)
          setShowPreview(true)
        } else {
          setFilePickerError('Failed to analyze import file')
        }

        setIsProcessing(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to validate file'
        setFilePickerError(errorMessage)
        setIsProcessing(false)
      }
    },
    [validateImport, analyzeImport, products]
  )

  const handleConfirmImport = async (
    selectedChanges: ProductChange[],
    conflictResolutions: Map<string, any>,
    onProgress: (progress: any) => void
  ) => {
    if (!previewData) {
      return
    }

    try {
      setIsImportingPreview(true)
      const result = await importAtomic(selectedChanges, {
        conflictResolutions,
        batchSize: 50,
        onProgress,
      })

      if (result.success) {
        toast.success('Import Completed', {
          description: `Added ${result.added}, updated ${result.updated}, skipped ${result.skipped}`,
        })

        resetState()
        onOpenChange(false)
      } else {
        toast.error('Import Failed', {
          description: `${result.failed} products failed to import`,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import file'
      toast.error('Import Error', {
        description: errorMessage,
      })
    } finally {
      setIsImportingPreview(false)
    }
  }

  const handleCancel = React.useCallback(() => {
    resetState()
    onOpenChange(false)
  }, [resetState, onOpenChange])

  const handleClearFile = React.useCallback(() => {
    setSelectedFile(null)
    setValidationResult(null)
    setFilePickerError(undefined)
    setPreviewData(null)
    setShowPreview(false)
  }, [])

  const handlePreviewCancel = React.useCallback(() => {
    setShowPreview(false)
    setPreviewData(null)
  }, [])

  const handleReviewAndImport = React.useCallback(async () => {
    if (!previewData) return

    const backupConfig = await getBackupReminderConfig(
      settings.backupReminder ?? 168
    )

    if (
      backupConfig.isBackupOverdue ||
      backupConfig.lastBackupTimestamp === null
    ) {
      setShowBackupWarning(true)
      return
    }

    setShowPreview(true)
  }, [previewData, settings.backupReminder])

  const handleCreateBackup = React.useCallback(async () => {
    setShowBackupWarning(false)
    await exportCatalog()
  }, [exportCatalog])

  const handleProceedAnyway = React.useCallback(() => {
    setShowBackupWarning(false)
    setShowPreview(true)
  }, [])

  const handleBackupWarningCancel = React.useCallback(() => {
    setShowBackupWarning(false)
  }, [])

  return (
    <>
      <Dialog open={open && !showPreview} onOpenChange={onOpenChange}>
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
                            Ready to review {previewData?.analysis.totalProducts || 0} products
                          </p>
                        </div>
                      </div>
                    ) : validationResult?.errors && validationResult.errors.length > 0 ? (
                      <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">Validation Errors</p>
                          <ul className="text-xs text-destructive/80 mt-1 list-disc list-inside space-y-0.5">
                            {validationResult.errors.map((error: any) => (
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
              onClick={handleReviewAndImport}
              disabled={disabled || !validationResult?.isValid || isProcessing || isImporting}
            >
              {isProcessing || isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Review & Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackupWarningDialog
        open={showBackupWarning}
        onOpenChange={setShowBackupWarning}
        onConfirm={handleProceedAnyway}
        onCancel={handleBackupWarningCancel}
        onCreateBackup={handleCreateBackup}
        daysSinceBackup={null}
        lastBackupDate={null}
        isOverdue={true}
        isCreatingBackup={isExporting}
      />

      {previewData && (
        <ImportPreview
          open={showPreview}
          onOpenChange={(open) => {
            if (!open) handlePreviewCancel()
          }}
          previewData={previewData}
          onConfirm={handleConfirmImport}
          onCancel={handlePreviewCancel}
          isLoading={isImportingPreview}
        />
      )}
    </>
  )
}
