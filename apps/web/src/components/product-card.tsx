import * as React from 'react'

import { formatPrice } from '@tiny-till/types'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
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

  const hasActions = onEdit || onDelete

  return (
    <button
      ref={cardRef}
      type="button"
      className={cn(
        'group relative flex flex-col text-left touch-manipulation no-select w-full h-full',
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
      <Card size={density === 'compact' ? 'sm' : 'default'} className="w-full h-full transition-colors group-hover:border-primary/20">
        <CardHeader className={cn('flex flex-col items-center', density === 'compact' ? 'p-2 pb-1' : 'p-4 pb-2')}>
          {product.imageData ? (
            <div className={cn('flex justify-center overflow-hidden rounded-lg', density === 'compact' ? 'mb-1 w-16 h-16' : 'mb-3 w-20 h-20')}>
              <img
                src={product.imageData}
                alt=""
                className={cn('w-full h-full rounded-lg object-cover', animationPresets.hoverLift)}
                loading="lazy"
              />
            </div>
          ) : (
            <div className={cn('flex items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-muted/80', density === 'compact' ? 'mb-1 w-16 h-16' : 'mb-3 w-20 h-20')} aria-hidden="true">
              <span className={cn('transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', density === 'compact' ? 'text-2xl' : 'text-3xl')}>📦</span>
            </div>
          )}
          <CardTitle className={cn(
            'text-center break-words w-full leading-tight',
            density === 'compact' ? 'text-xs' : 'text-sm',
            product.name.length > 20 ? 'text-xs' : ''
          )}>
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn('flex flex-col items-center', density === 'compact' ? 'px-2 pt-0 pb-1' : 'px-4 pt-0 pb-2')}>
          <div className={cn(
            'text-center font-semibold text-foreground transition-colors group-hover:text-primary',
            density === 'compact' ? 'text-sm' : 'text-base'
          )}>
            <span className="sr-only">Price: </span>
            {formatPrice(product.price)}
          </div>
        </CardContent>
        {hasActions && (
          <CardFooter className={cn(
            'flex justify-center gap-2 border-t border-border/50',
            density === 'compact' ? 'px-2 py-1.5' : 'px-4 py-2'
          )}>
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
                className={cn(
                  'touch-manipulation no-select shrink-0',
                  animationPresets.touchFeedback,
                  animationPresets.rippleEffect,
                  density === 'compact' ? 'h-8 w-8' : 'h-9 w-9'
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={density === 'compact' ? 14 : 16}
                  height={density === 'compact' ? 14 : 16}
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
                className={cn(
                  'touch-manipulation text-destructive hover:bg-destructive/10 no-select shrink-0',
                  animationPresets.touchFeedback,
                  animationPresets.rippleEffect,
                  density === 'compact' ? 'h-8 w-8' : 'h-9 w-9'
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={density === 'compact' ? 14 : 16}
                  height={density === 'compact' ? 14 : 16}
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
          </CardFooter>
        )}
      </Card>
    </button>
  )
})
