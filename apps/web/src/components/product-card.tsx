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

export function ProductCard({
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
        'flex flex-col text-left',
        getFocusVisibleClassName(isFocused),
        className
      )}
      aria-label={`${product.name}, ${formatPrice(product.price)}`}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onClick={() => onEdit?.(product.id)}
    >
      <Card size="sm">
      <CardHeader>
        {product.imageData ? (
          <div className="mb-2 flex justify-center">
            <img
              src={product.imageData}
              alt=""
              className="size-32 rounded-none object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mb-2 flex size-32 items-center justify-center rounded-none bg-muted" aria-hidden="true">
            <span className="text-4xl">📦</span>
          </div>
        )}
        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        <CardAction className="flex gap-1">
          {onEdit && (
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(product.id)
              }}
              disabled={isLoading || isDeleting}
              aria-label={`Edit ${product.name}`}
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
              size="icon-xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isLoading || isDeleting}
              aria-label={`Delete ${product.name}`}
              className="text-destructive hover:bg-destructive/10"
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
        <div className="text-center text-lg font-semibold text-foreground">
          <span className="sr-only">Price: </span>
          {formatPrice(product.price)}
        </div>
      </CardContent>
      </Card>
    </button>
  )
}
