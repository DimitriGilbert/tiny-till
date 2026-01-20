import * as React from 'react'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

const cuteBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-bold shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        'acid-green': 'bg-kawaii-acid-green text-foreground',
        'acid-yellow': 'bg-kawaii-acid-yellow text-foreground',
        pink: 'bg-primary text-primary-foreground',
        lavender: 'bg-kawaii-lavender text-primary-foreground',
        mint: 'bg-kawaii-mint text-foreground',
      },
      size: {
        sm: 'h-5 w-5 text-[10px]',
        md: 'h-6 w-6 text-xs',
        lg: 'h-8 w-8 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface CuteBadgeProps
  extends React.ButtonHTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof cuteBadgeVariants> {
  animate?: boolean
}

export const CuteBadge = React.memo(function CuteBadge({
  className,
  variant,
  size,
  animate,
  children,
  ...props
}: CuteBadgeProps) {
  const [prevChildren, setPrevChildren] = React.useState(children)
  const [shouldAnimate, setShouldAnimate] = React.useState(false)

  React.useEffect(() => {
    if (children !== prevChildren) {
      setShouldAnimate(true)
      const timer = setTimeout(() => setShouldAnimate(false), 300)
      setPrevChildren(children)
      return () => clearTimeout(timer)
    }
  }, [children, prevChildren])

  return (
    <span
      className={cn(
        cuteBadgeVariants({ variant, size }),
        animate && shouldAnimate && 'animate-spring-pulse',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
