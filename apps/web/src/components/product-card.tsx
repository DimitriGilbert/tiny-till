import * as React from 'react'

import { formatPrice } from '@tiny-till/types'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardAction,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getFocusVisibleClassName } from '@/lib/focus-styles'
import type { Product } from '@tiny-till/types'

interface ProductCardProps {
  product: Product
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
  className?: string
  isFocused?: boolean
  onFocus?: () => void
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onEdit,
  onDelete,
  isLoading = false,
  className,
  isFocused = false,
  onFocus,
}: ProductCardProps) {
  const cardRef = React.useRef<HTMLButtonElement>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (onDelete && !isDeleting) {
      setIsDeleting(true)
      await onDelete(product.id)
      setIsDeleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEdit?.(product.id)
    }
    if (e.key === 'Delete') {
      e.preventDefault()
      handleDelete()
    }
  }

  const handleFocus = () => {
    onFocus?.()
  }

  return (
    <button
      ref={cardRef}
      type="button"
      className={cn(
        'group relative flex flex-col text-left transition-all duration-200',
        'hover:shadow-lg hover:shadow-primary/10',
        'active:scale-[0.98] hover:scale-[1.02] focus-visible:scale-[1.02]',
        getFocusVisibleClassName(isFocused),
        className
      )}
      aria-label={`${product.name}, ${formatPrice(product.price)}`}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onClick={() => onEdit?.(product.id)}
    >
      <Card size="sm" className="transition-colors group-hover:border-primary/20">
      <CardHeader>
        {product.imageData ? (
          <div className="mb-2 flex justify-center overflow-hidden rounded-none">
            <img
              src={product.imageData}
              alt=""
              className="w-full max-w-[128px] aspect-square rounded-none object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mb-2 flex size-32 items-center justify-center rounded-none bg-muted transition-colors group-hover:bg-muted/80" aria-hidden="true">
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">📦</span>
          </div>
        )}
        <CardTitle className="line-clamp-2 min-h-[2.5em] text-sm sm:text-base transition-colors group-hover:text-primary">{product.name}</CardTitle>
        <CardAction className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {onEdit && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(product.id)
              }}
              disabled={isLoading || isDeleting}
              aria-label={`Edit ${product.name}`}
              className="h-9 w-9 touch-manipulation transition-transform hover:scale-110 active:scale-95"
            >
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
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isLoading || isDeleting}
              aria-label={`Delete ${product.name}`}
              className="h-9 w-9 touch-manipulation text-destructive hover:bg-destructive/10 transition-transform hover:scale-110 active:scale-95"
            >
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
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-center text-base sm:text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          <span className="sr-only">Price: </span>
          {formatPrice(product.price)}
        </div>
      </CardContent>
      </Card>
    </button>
  )
})
