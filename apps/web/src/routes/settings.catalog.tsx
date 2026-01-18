import * as React from 'react'

import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { ProductForm } from '@/components/product-form'
import { ProductList } from '@/components/product-list'
import { useCatalogStore } from '@/stores/catalog-store'
import type { Product } from '@tiny-till/types'

export const Route = createFileRoute('/settings/catalog')({
  component: CatalogPage,
})

function CatalogPage() {
  const { products, getProduct } = useCatalogStore()

  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<string | null>(null)

  const editingProduct = editingProductId ? getProduct(editingProductId) : undefined

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
      const { deleteProduct } = useCatalogStore.getState()
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
    <main aria-label="Product catalog management" className="container mx-auto max-w-6xl px-4 py-2">
      <header>
        <nav className="mb-4" aria-label="Back navigation">
          <Link to="/settings" className="text-primary hover:underline">
            ← Back to Settings
          </Link>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="mb-6 text-2xl font-bold">Catalog Management</h1>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>
      </header>

      <ProductList
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
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
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {products.length} products in catalog
      </div>
    </main>
  )
}
