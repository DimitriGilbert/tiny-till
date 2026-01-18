import * as React from 'react'

import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalogStore } from '@/stores/catalog-store'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import type { Product } from '@tiny-till/types'

interface ProductListProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export function ProductList({
  onEdit,
  onDelete,
  isLoading: externalLoading = false,
}: ProductListProps) {
  const { products, searchProducts, isLoading, hasHydrated } = useCatalogStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [columnCount, setColumnCount] = React.useState(6)

  const filteredProducts = React.useMemo(
    () => searchProducts(searchQuery),
    [searchQuery, searchProducts]
  )

  const productMap = React.useRef<Map<string, HTMLElement>>(new Map())

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const getItemElement = (id: string) => {
    return productMap.current.get(id) || null
  }

  const { focusedItemId, setFocusedItemId } = useKeyboardNavigation<Product>({
    items: filteredProducts,
    itemId: (item) => item.id,
    onItemSelect: (item) => {
      onEdit?.(item.id)
    },
    getItemElement,
    columnCount,
    enabled: !searchQuery && filteredProducts.length > 0,
  })

  const updateColumnCount = React.useCallback(() => {
    const width = window.innerWidth
    if (width >= 1280) setColumnCount(6)
    else if (width >= 1024) setColumnCount(5)
    else if (width >= 768) setColumnCount(4)
    else if (width >= 640) setColumnCount(3)
    else setColumnCount(2)
  }, [])

  React.useEffect(() => {
    updateColumnCount()
    window.addEventListener('resize', updateColumnCount)
    return () => window.removeEventListener('resize', updateColumnCount)
  }, [updateColumnCount])

  const isLoadingState = !hasHydrated || externalLoading || isLoading

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        {searchQuery && (
          <span
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filteredProducts.length} of {products.length} products
          </span>
        )}
      </div>

      {isLoadingState ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}-${Date.now()}`} className="flex flex-col gap-2">
              <Skeleton className="size-32" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4" role="img" aria-label="Empty catalog">
            📦
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Your catalog is empty. Add your first product to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
}
