import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import * as React from 'react'

import { TallyProductCard } from '@/components/tally-product-card'
import { QuantityInputDialog } from '@/components/quantity-input-dialog'
import { StickyTallyFooter } from '@/components/sticky-tally-footer'
import { ClearCartDialog } from '@/components/clear-cart-dialog'
import { useOnboarding } from '@/components/onboarding-provider'
import { PlayfulButton } from '@/components/kawaii'
import { useCatalogStore } from '@/stores/catalog-store'
import { useTallyStore } from '@/stores/tally-store'
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: TallyPage,
})

function TallyPage() {
  const router = useRouter()
  const { products, hasHydrated } = useCatalogStore()
  const { items, updateQuantity, incrementItem, clearTally, summary } = useTallyStore()
  const { columnCount, gridGap, isCompact } = useResponsiveGrid()
  const { isActive, startOnboarding, isCompleted } = useOnboarding()

  const [dialogState, setDialogState] = React.useState({
    open: false,
    productId: '',
    productName: '',
    productImage: '',
    productPrice: 0,
    currentQuantity: 0,
  })

  const [clearDialogOpen, setClearDialogOpen] = React.useState(false)
  const [showTourHint, setShowTourHint] = React.useState(false)

  const isCartEmpty = items.size === 0

  React.useEffect(() => {
    if (hasHydrated && !isCompleted && products.length > 0) {
      const hasSeenTour = localStorage.getItem('tiny-till-has-seen-tour')
      if (!hasSeenTour) {
        setShowTourHint(true)
      }
    }
  }, [hasHydrated, isCompleted, products.length])

  const handleClearCart = React.useCallback(() => {
    clearTally()
    setClearDialogOpen(false)
  }, [clearTally])

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
    updateQuantity(dialogState.productId, quantity, dialogState.productPrice)
    setDialogState((prev) => ({ ...prev, open: false }))
  }, [dialogState.productId, dialogState.productPrice, updateQuantity])

  const handleIncrement = React.useCallback((productId: string, price: number) => {
    incrementItem(productId, price)
  }, [incrementItem])

  const handleDecrement = React.useCallback((productId: string) => {
    const item = items.get(productId)
    if (item && item.quantity > 0) {
      updateQuantity(productId, item.quantity - 1)
    }
  }, [items, updateQuantity])

  const handleStartTour = React.useCallback(() => {
    setShowTourHint(false)
    localStorage.setItem('tiny-till-has-seen-tour', 'true')
    startOnboarding()
  }, [startOnboarding])

  const isLoading = !hasHydrated

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8" data-onboarding="tally-page">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-base font-medium">
              Tap products to add to your tally
            </p>
          </div>
          {showTourHint && products.length > 0 && !isActive && (
            <PlayfulButton
              type="button"
              onClick={handleStartTour}
              variant="pink"
              size="md"
              wiggle
            >
              Take a tour →
            </PlayfulButton>
          )}
        </div>
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
        <div 
          className={cn('grid touch-pan-y w-full', gridGap)}
          style={{ 
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
        >
          {products.map((product, index) => {
            const item = items.get(product.id)
            const quantity = item?.quantity || 0
            return (
              <TallyProductCard
                key={product.id}
                product={product}
                quantity={quantity}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onEditQuantity={handleEditQuantity}
                dataOnboarding={index === 0 ? 'product-card' : undefined}
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

      <StickyTallyFooter
        totalCents={summary.total}
        itemCount={summary.itemCount}
        onClearCart={() => setClearDialogOpen(true)}
        isCartEmpty={isCartEmpty}
      />

      <ClearCartDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        onConfirm={handleClearCart}
        itemCount={summary.itemCount}
        totalCents={summary.total}
      />
    </div>
  )
}

