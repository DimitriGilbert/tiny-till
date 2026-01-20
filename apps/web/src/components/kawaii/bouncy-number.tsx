import * as React from 'react'
import { cn } from '@/lib/utils'

interface BouncyNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  formatFn?: (value: number) => string
}

export const BouncyNumber = React.memo(function BouncyNumber({
  value,
  formatFn = (v) => v.toString(),
  className,
  ...props
}: BouncyNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(value)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const prevValueRef = React.useRef(value)

  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true)
      setDisplayValue(value)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      prevValueRef.current = value
      return () => clearTimeout(timer)
    }
  }, [value])

  return (
    <span
      className={cn(
        'inline-block transition-transform',
        isAnimating && 'animate-bounce-in',
        className
      )}
      {...props}
    >
      {formatFn(displayValue)}
    </span>
  )
})
