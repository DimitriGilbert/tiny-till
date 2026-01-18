import { createFileRoute, useRouter } from '@tanstack/react-router'
import * as React from 'react'

import { TallyProductCard } from '@/components/tally-product-card'
import { QuantityInputDialog } from '@/components/quantity-input-dialog'
import { useCatalogStore } from '@/stores/catalog-store'
import { useTallyStore } from '@/stores/tally-store'
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: TallyPage,
})

function TallyPage() {
  const router = useRouter()
  const { products, hasHydrated } = useCatalogStore()
  const { items, updateQuantity, incrementItem } = useTallyStore()
  const { columnCount, gridGap, isCompact } = useResponsiveGrid()

  const [dialogState, setDialogState] = React.useState({
    open: false,
    productId: '',
    productName: '',
    productImage: '',
    productPrice: 0,
    currentQuantity: 0,
  })

  const handleEditQuantity = React.useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId)
    const item = items.get(productId)
    if (product) {
      setDialogState({
        open: true,
        productId,
        productName: product.name,
        productImage: product.imageData || '',
        productPrice: product.price,
        currentQuantity: item?.quantity || 0,
      })
    }
  }, [products, items])

  const handleConfirmQuantity = React.useCallback((quantity: number) => {
    updateQuantity(dialogState.productId, quantity)
    setDialogState((prev) => ({ ...prev, open: false }))
  }, [dialogState.productId, updateQuantity])

  const handleIncrement = React.useCallback((productId: string) => {
    incrementItem(productId)
  }, [incrementItem])

  const handleDecrement = React.useCallback((productId: string) => {
    const item = items.get(productId)
    if (item && item.quantity > 0) {
      updateQuantity(productId, item.quantity - 1)
    }
  }, [items, updateQuantity])

  const isLoading = !hasHydrated

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tally</h1>
        <p className="text-muted-foreground mt-1">
          Select products to add to your tally
        </p>
      </header>

      {isLoading ? (
        <LoadingState message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Your catalog is empty"
          description="Add products to get started with tallying"
          actionLabel="Go to Settings"
          onAction={() => router.navigate({ to: '/settings' })}
        />
      ) : (
        <div className={cn('grid', gridGap, `grid-cols-${columnCount}`)}>
          {products.map((product) => {
            const item = items.get(product.id)
            const quantity = item?.quantity || 0
            return (
              <TallyProductCard
                key={product.id}
                product={product}
                quantity={quantity}
                density={isCompact ? 'compact' : 'normal'}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onEditQuantity={handleEditQuantity}
              />
            )
          })}
        </div>
      )}

      <QuantityInputDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        productId={dialogState.productId}
        productName={dialogState.productName}
        productImage={dialogState.productImage}
        productPrice={dialogState.productPrice}
        currentQuantity={dialogState.currentQuantity}
        onConfirm={handleConfirmQuantity}
      />
    </div>
  )
}

