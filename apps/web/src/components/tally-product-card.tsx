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
import { HighlightRing } from '@/components/ui/spring-indicator'
import { useGestures } from '@/hooks/use-gestures'
import { animationClasses, animationPresets } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { getFocusVisibleClassName } from '@/lib/focus-styles'
import type { Product } from '@tiny-till/types'

interface TallyProductCardProps {
  product: Product
  quantity: number
  density?: 'normal' | 'compact'
  onIncrement: (productId: string, price: number) => void
  onDecrement: (productId: string) => void
  onEditQuantity?: (productId: string) => void
  className?: string
  dataOnboarding?: string
}

export const TallyProductCard = React.memo(function TallyProductCard({
  product,
  quantity,
  density = 'normal',
  onIncrement,
  onDecrement,
  onEditQuantity,
  className,
  dataOnboarding,
}: TallyProductCardProps) {
  const [isPulsing, setIsPulsing] = React.useState(false)
  const [isShaking, setIsShaking] = React.useState(false)
  const [prevQuantity, setPrevQuantity] = React.useState(quantity)
  const [showHighlight, setShowHighlight] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isPressed, setIsPressed] = React.useState(false)
  const cardRef = React.useRef<HTMLButtonElement>(null)

  const { isLongPressing, shouldPreventClick, eventHandlers } = useGestures({
    onLongPress: () => onEditQuantity?.(product.id),
    onDoubleTap: () => onEditQuantity?.(product.id),
  })

  React.useEffect(() => {
    if (quantity !== prevQuantity && quantity > 0) {
      setIsPulsing(true)
      setShowHighlight(true)
      const timer = setTimeout(() => {
        setIsPulsing(false)
        setShowHighlight(false)
      }, 400)
      return () => clearTimeout(timer)
    }
    setPrevQuantity(quantity)
  }, [quantity, prevQuantity])

  const handleIncrement = () => {
    if (!shouldPreventClick) {
      try {
        onIncrement(product.id, product.price)
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

  const touchTargetSize = density === 'normal' ? 'w-full' : 'w-full'
  const decrementSize = density === 'normal' ? 'h-11 w-11' : 'h-11 w-11'
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
        'group relative flex flex-col text-left touch-manipulation no-select',
        animationPresets.cardActive,
        'gpu-accelerated',
        isHovered && '-translate-y-1 shadow-lg shadow-primary/10',
        isPressed && 'scale-[0.98]',
        isLongPressing && 'opacity-80 scale-[0.97]',
        isShaking && 'animate-shake',
        touchTargetSize,
        className
      )}
      aria-label={`${product.name}, ${formatPrice(product.price)}, quantity: ${quantity}`}
      onKeyDown={handleKeyDown}
      onClick={handleIncrement}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...eventHandlers}
      data-onboarding={dataOnboarding}
    >
      <HighlightRing show={showHighlight} />
      <Card size={density === 'compact' ? 'sm' : 'sm'} className="w-full h-full rounded-3xl transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/20">
        {quantity > 0 && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge
              variant="default"
              className={cn(
                'flex items-center justify-center font-bold shadow-lg cursor-pointer bg-kawaii-acid-green text-foreground rounded-full',
                animationPresets.touchFeedback,
                badgeSize,
                isPulsing && animationClasses.springPulse,
                'animate-acid-glow'
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
            <div className={cn('mb-3 flex justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted/30', density === 'compact' ? 'mb-2' : 'mb-3')}>
              <img
                src={product.imageData}
                alt=""
                className={cn('w-full aspect-square rounded-2xl object-cover', animationPresets.hoverLift, imageSize)}
                loading="lazy"
              />
            </div>
          ) : (
            <div className={cn('flex items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/60 border-2 border-dashed border-primary/20 transition-colors group-hover:from-primary/10 group-hover:to-primary/5', placeholderSize, density === 'compact' ? 'mb-2' : 'mb-3')} aria-hidden="true">
              <span className={cn('transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6', density === 'compact' ? 'text-3xl' : 'text-4xl')}>📦</span>
            </div>
          )}
          <CardTitle className={cn('line-clamp-2 transition-colors group-hover:text-primary font-medium text-foreground', titleHeight, textSize)}>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn('text-center font-bold text-primary transition-colors group-hover:text-primary font-display', textSize, 'tracking-wide')}>
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
            'absolute bottom-3 right-3 z-10 touch-manipulation shadow-lg shadow-destructive/30 no-select rounded-full hover:scale-110 active:scale-95 transition-all duration-200',
            animationPresets.touchFeedback,
            animationPresets.rippleEffect,
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
