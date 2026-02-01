import * as React from 'react'

import { Link, createFileRoute } from '@tanstack/react-router'
import { Download, Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { ProductForm } from '@/components/product-form'
import { VirtualizedProductGrid } from '@/components/virtualized-product-grid'
import { CatalogImport } from '@/components/CatalogImport'
import { BackupReminderCard } from '@/components/backup-reminder-card'
import { useCatalogStore } from '@/stores/catalog-store'
import { useCatalogExport } from '@/hooks/useCatalogExport'
import type { CatalogImport as CatalogImportType } from '@tiny-till/types'

export const Route = createFileRoute('/catalog')({
  component: CatalogPage,
})

function CatalogPage() {
  const products = useCatalogStore((state) => state.products)
  const getProduct = useCatalogStore((state) => state.getProduct)
  const deleteProduct = useCatalogStore((state) => state.deleteProduct)
  const { exportCatalog, isExporting } = useCatalogExport()

  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<string | null>(null)
  const [showImportDialog, setShowImportDialog] = React.useState(false)

  const editingProduct = editingProductId ? getProduct(editingProductId) : undefined

  const handleExportCatalog = async () => {
    await exportCatalog()
  }

  const handleAddProduct = () => {
    setShowAddDialog(true)
  }

  const handleEditProduct = (id: string) => {
    setEditingProductId(id)
  }

  const handleDeleteProduct = (id: string) => {
    setShowDeleteDialog(id)
  }

  const handleConfirmDelete = async () => {
    if (showDeleteDialog) {
      await deleteProduct(showDeleteDialog, true)
      setShowDeleteDialog(null)
    }
  }

  const handleFormSuccess = () => {
    setEditingProductId(null)
    setShowAddDialog(false)
  }

  const handleFormCancel = () => {
    setEditingProductId(null)
    setShowAddDialog(false)
  }

  const deletingProduct = showDeleteDialog
    ? getProduct(showDeleteDialog)
    : undefined

  return (
    <main aria-label="Product catalog management" className="container mx-auto max-w-6xl px-4 py-2 sm:py-4">
      <header className="mb-4 sm:mb-6">
        <nav className="mb-4" aria-label="Back navigation">
          <Link to="/settings" className="text-primary hover:underline text-sm sm:text-base inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Settings
          </Link>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Catalog Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="w-full sm:w-auto touch-manipulation min-h-[44px]"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Catalog
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCatalog}
              disabled={isExporting}
              className="w-full sm:w-auto touch-manipulation min-h-[44px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Catalog
                </>
              )}
            </Button>
            <Button
              onClick={handleAddProduct}
              className="w-full sm:w-auto touch-manipulation min-h-[44px]"
            >
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <BackupReminderCard className="mb-6" />

      <VirtualizedProductGrid
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onAddProduct={handleAddProduct}
      />

      <ProductForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        mode="add"
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      <ProductForm
        open={!!editingProductId}
        onOpenChange={(open) => !open && setEditingProductId(null)}
        mode="edit"
        product={editingProduct}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      <ConfirmationDialog
        open={!!showDeleteDialog}
        onOpenChange={(open) => !open && setShowDeleteDialog(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        isDestructive
      />

      <CatalogImport
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {products.length} products in catalog
      </div>
    </main>
  )
}
