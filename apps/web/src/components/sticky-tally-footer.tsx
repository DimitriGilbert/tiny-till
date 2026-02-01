import * as React from 'react'

import { Button } from '@/components/ui/button'
import { BouncyNumber } from '@/components/kawaii'
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'
import { cn } from '@/lib/utils'

interface StickyTallyFooterProps {
  totalCents: number
  itemCount: number
  onClearCart: () => void
  isCartEmpty: boolean
}

export const StickyTallyFooter = React.memo(function StickyTallyFooter({
  totalCents,
  itemCount,
  onClearCart,
  isCartEmpty,
}: StickyTallyFooterProps) {
  const formatPrice = useCurrencyFormat()
  const prevTotalRef = React.useRef(totalCents)
  const prevItemCountRef = React.useRef(itemCount)
  const [shouldAnimate, setShouldAnimate] = React.useState(false)

  React.useEffect(() => {
    if (
      totalCents !== prevTotalRef.current ||
      itemCount !== prevItemCountRef.current
    ) {
      setShouldAnimate(true)
      const timer = setTimeout(() => setShouldAnimate(false), 300)
      prevTotalRef.current = totalCents
      prevItemCountRef.current = itemCount
      return () => clearTimeout(timer)
    }
  }, [totalCents, itemCount])

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 h-auto min-h-[90px] animate-slide-up',
        'bg-gradient-to-r from-primary via-kawaii-lavender to-primary',
        'shadow-lg shadow-primary/20 backdrop-blur-md'
      )}
      data-onboarding="tally-footer"
    >
      <div className="relative container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-primary-foreground/80 sm:text-sm">
                Total
              </span>
              <BouncyNumber
                value={totalCents}
                formatFn={formatPrice}
                className={cn(
                  'text-2xl font-bold tabular-nums sm:text-3xl font-display',
                  'text-primary-foreground',
                  shouldAnimate && 'animate-pulse-once'
                )}
              />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <span className="text-lg">📦</span>
              <BouncyNumber
                value={itemCount}
                className="text-xl font-bold tabular-nums sm:text-2xl font-display text-primary-foreground"
              />
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={onClearCart}
            disabled={isCartEmpty}
            aria-label={isCartEmpty ? 'Cart is empty' : 'Clear all items from cart'}
            className={cn(
              'w-full sm:w-auto bg-white text-destructive hover:bg-white/90',
              'hover:scale-105 hover:shadow-xl hover:shadow-black/20 active:scale-95',
              'transition-all duration-200 rounded-full font-semibold',
              'border-0 shadow-lg',
              isCartEmpty && 'cursor-not-allowed opacity-40'
            )}
          >
            Clear Cart
          </Button>
        </div>
      </div>
      <span className="sr-only">
        Cart contains {itemCount} items with a total of {formatPrice(totalCents)}
      </span>
    </footer>
  )
})
