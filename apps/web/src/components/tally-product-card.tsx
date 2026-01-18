import * as React from 'react'

import { formatPrice } from '@tiny-till/types'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { useGestures } from '@/hooks/use-gestures'
import { cn } from '@/lib/utils'
import { getFocusVisibleClassName } from '@/lib/focus-styles'
import type { Product } from '@tiny-till/types'

interface TallyProductCardProps {
  product: Product
  quantity: number
  density?: 'normal' | 'compact'
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  onEditQuantity?: (productId: string) => void
  className?: string
}

export const TallyProductCard = React.memo(function TallyProductCard({
  product,
  quantity,
  density = 'normal',
  onIncrement,
  onDecrement,
  onEditQuantity,
  className,
}: TallyProductCardProps) {
  const [isPulsing, setIsPulsing] = React.useState(false)
  const [isShaking, setIsShaking] = React.useState(false)
  const [prevQuantity, setPrevQuantity] = React.useState(quantity)
  const cardRef = React.useRef<HTMLButtonElement>(null)

  const { isLongPressing, shouldPreventClick, eventHandlers } = useGestures({
    onLongPress: () => onEditQuantity?.(product.id),
    onDoubleTap: () => onEditQuantity?.(product.id),
  })

  React.useEffect(() => {
    if (quantity !== prevQuantity && quantity > 0) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 300)
      return () => clearTimeout(timer)
    }
    setPrevQuantity(quantity)
  }, [quantity, prevQuantity])

  const handleIncrement = () => {
    if (!shouldPreventClick) {
      try {
        onIncrement(product.id)
      } catch (error) {
        if (error instanceof Error) {
          console.warn('[TallyProductCard] Increment error:', error.message)
          setIsShaking(true)
          setTimeout(() => setIsShaking(false), 300)
        }
      }
    }
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      onDecrement(product.id)
    } catch (error) {
      if (error instanceof Error) {
        console.warn('[TallyProductCard] Decrement error:', error.message)
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 300)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleIncrement()
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onDecrement(product.id)
    }
  }

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEditQuantity?.(product.id)
  }

  const touchTargetSize = density === 'normal' ? 'min-w-[80px] min-h-[80px]' : 'min-w-[60px] min-h-[60px]'
  const decrementSize = density === 'normal' ? 'h-10 w-10' : 'h-8 w-8'
  const badgeSize = density === 'compact' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs'
  const imageSize = density === 'compact' ? 'max-w-[96px]' : 'max-w-[128px]'
  const placeholderSize = density === 'compact' ? 'size-24' : 'size-32'
  const textSize = density === 'compact' ? 'text-xs' : 'text-sm sm:text-base'
  const titleHeight = density === 'compact' ? 'min-h-[2em]' : 'min-h-[2.5em]'

  return (
    <button
      ref={cardRef}
      type="button"
      className={cn(
        'group relative flex flex-col text-left transition-all duration-200 touch-manipulation',
        'hover:shadow-lg hover:shadow-primary/10',
        'active:scale-[0.98] hover:scale-[1.02] focus-visible:scale-[1.02]',
        isLongPressing && 'opacity-80 scale-[0.97]',
        isShaking && 'animate-shake',
        touchTargetSize,
        className
      )}
      aria-label={`${product.name}, ${formatPrice(product.price)}, quantity: ${quantity}`}
      onKeyDown={handleKeyDown}
      onClick={handleIncrement}
      {...eventHandlers}
    >
      <Card size={density === 'compact' ? 'sm' : 'sm'} className="transition-colors group-hover:border-primary/20">
        {quantity > 0 && (
          <div className="absolute -top-1 -right-1 z-10">
            <Badge
              variant="default"
              className={cn(
                'flex items-center justify-center font-bold shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform',
                badgeSize,
                isPulsing && 'animate-pulse-once'
              )}
              onClick={handleBadgeClick}
              aria-live="polite"
              aria-label={`Quantity: ${quantity}, tap to edit`}
            >
              {quantity}
            </Badge>
          </div>
        )}
        <CardHeader>
          {product.imageData ? (
            <div className={cn('mb-2 flex justify-center overflow-hidden rounded-none', density === 'compact' ? 'mb-1' : 'mb-2')}>
              <img
                src={product.imageData}
                alt=""
                className={cn('w-full aspect-square rounded-none object-cover transition-transform duration-300 group-hover:scale-105', imageSize)}
                loading="lazy"
              />
            </div>
          ) : (
            <div className={cn('flex items-center justify-center rounded-none bg-muted transition-colors group-hover:bg-muted/80', placeholderSize, density === 'compact' ? 'mb-1' : 'mb-2')} aria-hidden="true">
              <span className={cn('transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', density === 'compact' ? 'text-3xl' : 'text-4xl')}>📦</span>
            </div>
          )}
          <CardTitle className={cn('line-clamp-2 transition-colors group-hover:text-primary', titleHeight, textSize)}>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn('text-center font-semibold text-foreground transition-colors group-hover:text-primary', textSize)}>
            <span className="sr-only">Price: </span>
            {formatPrice(product.price)}
          </div>
        </CardContent>
      </Card>
      {quantity > 0 && (
        <Button
          size="icon"
          variant="destructive"
          className={cn(
            'absolute bottom-2 right-2 z-10 touch-manipulation transition-transform hover:scale-110 active:scale-95 shadow-lg',
            decrementSize
          )}
          onClick={handleDecrement}
          aria-label={`Remove one ${product.name} from tally`}
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
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>
      )}
    </button>
  )
})
