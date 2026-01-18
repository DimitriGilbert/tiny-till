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
import { HighlightRing } from '@/components/ui/spring-indicator'
import { animationPresets } from '@/lib/animations'
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
  density?: 'normal' | 'compact'
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onEdit,
  onDelete,
  isLoading = false,
  className,
  isFocused = false,
  onFocus,
  density = 'normal',
}: ProductCardProps) {
  const cardRef = React.useRef<HTMLButtonElement>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showHighlight, setShowHighlight] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isPressed, setIsPressed] = React.useState(false)

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
      setShowHighlight(true)
      setTimeout(() => setShowHighlight(false), 400)
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

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
  }

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  return (
    <button
      ref={cardRef}
      type="button"
      className={cn(
        'group relative flex flex-col text-left touch-manipulation no-select',
        animationPresets.cardActive,
        'gpu-accelerated',
        isHovered && '-translate-y-1 shadow-lg shadow-primary/10',
        isPressed && 'scale-[0.98]',
        isFocused && 'scale-[1.02]',
        getFocusVisibleClassName(isFocused),
        className
      )}
      aria-label={`${product.name}, ${formatPrice(product.price)}`}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onClick={() => {
        setShowHighlight(true)
        setTimeout(() => setShowHighlight(false), 400)
        onEdit?.(product.id)
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <HighlightRing show={showHighlight} />
      <Card size={density === 'compact' ? 'sm' : 'sm'} className="transition-colors group-hover:border-primary/20">
      <CardHeader>
        {product.imageData ? (
          <div className={cn('mb-2 flex justify-center overflow-hidden rounded-none', density === 'compact' ? 'mb-1' : 'mb-2')}>
            <img
              src={product.imageData}
              alt=""
              className={cn('w-full aspect-square rounded-none object-cover', animationPresets.hoverLift, density === 'compact' ? 'max-w-[96px]' : 'max-w-[128px]')}
              loading="lazy"
            />
          </div>
        ) : (
          <div className={cn('flex items-center justify-center rounded-none bg-muted transition-colors group-hover:bg-muted/80', density === 'compact' ? 'size-24 mb-1' : 'size-32 mb-2')} aria-hidden="true">
            <span className={cn('transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', density === 'compact' ? 'text-3xl' : 'text-4xl')}>📦</span>
          </div>
        )}
        <CardTitle className={cn('line-clamp-2 transition-colors group-hover:text-primary', density === 'compact' ? 'min-h-[2em] text-xs' : 'min-h-[2.5em] text-sm sm:text-base')}>{product.name}</CardTitle>
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
              className={cn('touch-manipulation no-select', animationPresets.touchFeedback, animationPresets.rippleEffect, 'h-11 w-11 min-w-[44px] min-h-[44px]')}
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
              className={cn('touch-manipulation text-destructive hover:bg-destructive/10 no-select', animationPresets.touchFeedback, animationPresets.rippleEffect, 'h-11 w-11 min-w-[44px] min-h-[44px]')}
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
        <div className={cn('text-center font-semibold text-foreground transition-colors group-hover:text-primary', density === 'compact' ? 'text-sm' : 'text-base sm:text-lg')}>
          <span className="sr-only">Price: </span>
          {formatPrice(product.price)}
        </div>
      </CardContent>
      </Card>
    </button>
  )
})
