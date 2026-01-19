import * as React from 'react'

import { Button } from '@/components/ui/button'
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
      role="contentinfo"
      aria-label="Cart summary with total and item count"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t bg-background shadow-lg animate-slide-up',
        'h-auto min-h-[80px]'
      )}
      data-onboarding="tally-footer"
    >
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Total
              </span>
              <span
                className={cn(
                  'text-2xl font-bold tabular-nums sm:text-3xl',
                  shouldAnimate && 'animate-pulse-once text-primary'
                )}
              >
                {formatPrice(totalCents)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Items
              </span>
              <span
                className={cn(
                  'text-xl font-semibold tabular-nums sm:text-2xl',
                  shouldAnimate && 'animate-pulse-once'
                )}
              >
                {itemCount}
              </span>
            </div>
          </div>
          <Button
            variant="destructive"
            size="lg"
            onClick={onClearCart}
            disabled={isCartEmpty}
            aria-label={isCartEmpty ? 'Cart is empty' : 'Clear all items from cart'}
            className={cn(
              'w-full sm:w-auto',
              isCartEmpty && 'cursor-not-allowed opacity-50'
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
