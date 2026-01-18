import * as React from 'react'

import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { useCatalogStore } from '@/stores/catalog-store'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { cn } from '@/lib/utils'
import type { Product } from '@tiny-till/types'

interface ProductListProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
  onAddProduct?: () => void
}

export const ProductList = React.memo(function ProductList({
  onEdit,
  onDelete,
  isLoading: externalLoading = false,
  onAddProduct,
}: ProductListProps) {
  const { products, searchProducts, isLoading, hasHydrated } = useCatalogStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [columnCount, setColumnCount] = React.useState(6)

  const filteredProducts = React.useMemo(
    () => searchProducts(searchQuery),
    [searchQuery, searchProducts]
  )

  const productMap = React.useRef<Map<string, HTMLElement>>(new Map())

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleClearSearch = React.useCallback(() => {
    setSearchQuery('')
  }, [])

  const getItemElement = React.useCallback((id: string) => {
    return productMap.current.get(id) || null
  }, [])

  const onItemSelect = React.useCallback((item: Product) => {
    onEdit?.(item.id)
  }, [onEdit])

  const { focusedItemId, setFocusedItemId } = useKeyboardNavigation<Product>({
    items: filteredProducts,
    itemId: (item) => item.id,
    onItemSelect,
    getItemElement,
    columnCount,
    enabled: !searchQuery && filteredProducts.length > 0,
  })

  const updateColumnCount = React.useCallback(() => {
    const width = window.innerWidth
    if (width >= 1280) setColumnCount(6)
    else if (width >= 1024) setColumnCount(5)
    else if (width >= 768) setColumnCount(4)
    else if (width >= 640) setColumnCount(2)
    else setColumnCount(1)
  }, [])

  React.useEffect(() => {
    updateColumnCount()
    const handleResize = () => {
      requestAnimationFrame(updateColumnCount)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [updateColumnCount])

  const isLoadingState = !hasHydrated || externalLoading || isLoading

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
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
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors',
              searchQuery && 'text-foreground'
            )}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn('pl-9 pr-8', 'sm:pr-9')}
            aria-label="Search products"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors touch-manipulation"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <span
            className="text-sm text-muted-foreground text-center sm:text-left py-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {filteredProducts.length} of {products.length}
          </span>
        )}
      </div>

      {isLoadingState ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`skeleton-${Date.now()}-${i}`} className="flex flex-col gap-2">
              <Skeleton className="w-full aspect-square" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={searchQuery ? '🔍' : '📦'}
          title={searchQuery ? 'No products found' : 'Your catalog is empty'}
          description={
            searchQuery
              ? 'Try adjusting your search query'
              : 'Add your first product to get started'
          }
          actionLabel={!searchQuery ? 'Add Product' : undefined}
          onAction={!searchQuery ? onAddProduct : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredProducts.map((product: Product) => (
            <div
              key={product.id}
              ref={(el) => {
                if (el) {
                  productMap.current.set(product.id, el)
                } else {
                  productMap.current.delete(product.id)
                }
              }}
            >
              <ProductCard
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoading}
                isFocused={focusedItemId === product.id}
                onFocus={() => setFocusedItemId(product.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
