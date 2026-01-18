import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat'
import { cn } from '@/lib/utils'

interface TallyTotalsDisplayProps {
  totalCents: number
  itemCount: number
  className?: string
}

export const TallyTotalsDisplay = React.memo(function TallyTotalsDisplay({
  totalCents,
  itemCount,
  className,
}: TallyTotalsDisplayProps) {
  const formatPrice = useCurrencyFormat()

  const hasItems = itemCount > 0

  return (
    <section
      aria-label="Tally totals"
      className={cn(
        'border-2 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg shadow-sm transition-all duration-200',
        hasItems && 'shadow-md shadow-primary/10',
        className
      )}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Items
            </span>
            <span className="text-2xl font-bold tabular-nums">
              {itemCount}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Total
            </span>
            <span className="text-3xl font-bold tabular-nums text-primary">
              {formatPrice(totalCents)}
            </span>
          </div>
          <span className="sr-only">
            {itemCount} items, total {formatPrice(totalCents)}
          </span>
        </div>
      </div>
    </section>
  )
})
