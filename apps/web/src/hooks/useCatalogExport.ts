import * as React from 'react'
import { useCatalogStore } from '@/stores/catalog-store'
import {
  validateProductList,
  createExportData,
} from '@tiny-till/types'
import { downloadExportFile } from '@/lib/export/download'
import { toast } from 'sonner'

export interface UseCatalogExportReturn {
  exportCatalog: () => Promise<void>
  isExporting: boolean
  exportError: string | null
}

export function useCatalogExport(): UseCatalogExportReturn {
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportError, setExportError] = React.useState<string | null>(null)

  const exportCatalog = React.useCallback(async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      const { products } = useCatalogStore.getState()

      if (products.length === 0) {
        toast.warning('Empty catalog', {
          description: 'Add products to your catalog before exporting',
        })
        setIsExporting(false)
        return
      }

      const validationResult = validateProductList(products)
      if (!validationResult.isValid) {
        const errorMessage = `Catalog validation failed: ${validationResult.errors.join(', ')}`
        setExportError(errorMessage)
        toast.error('Validation failed', {
          description: errorMessage,
        })
        setIsExporting(false)
        return
      }

      const exportData = createExportData(products)

      const success = await downloadExportFile(exportData)

      if (!success) {
        setExportError('Failed to download export file')
        setIsExporting(false)
        return
      }

      setExportError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setExportError(errorMessage)
      toast.error('Export failed', {
        description: errorMessage,
      })
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    exportCatalog,
    isExporting,
    exportError,
  }
}
