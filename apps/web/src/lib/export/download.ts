import type { CatalogExport } from '@tiny-till/types'
import { toast } from 'sonner'

export async function downloadExportFile(exportData: CatalogExport): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const { generateExportFilename } = await import('@tiny-till/types')
    const filename = generateExportFilename()

    link.download = filename

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Export successful', {
      description: `Catalog exported to ${filename}`,
    })

    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to download export file'
    toast.error('Download failed', {
      description: errorMessage,
    })
    return false
  }
}
