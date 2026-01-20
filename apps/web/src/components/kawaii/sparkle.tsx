import * as React from 'react'
import { cn } from '@/lib/utils'

interface KawaiiSparkleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  delay?: number
  color?: 'pink' | 'lavender' | 'mint' | 'acid-green' | 'acid-yellow'
}

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
}

const colorMap = {
  pink: 'text-primary',
  lavender: 'text-kawaii-lavender',
  mint: 'text-kawaii-mint',
  'acid-green': 'text-kawaii-acid-green',
  'acid-yellow': 'text-kawaii-acid-yellow',
}

export const KawaiiSparkle = React.memo(function KawaiiSparkle({
  className,
  size = 'md',
  delay = 0,
  color = 'pink',
}: KawaiiSparkleProps) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <svg
      className={cn(
        'animate-sparkle-fade',
        sizeMap[size],
        colorMap[color],
        visible ? 'opacity-100' : 'opacity-0',
        className
      )}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0L14.5 8.5L23 11L14.5 13.5L12 22L9.5 13.5L1 11L9.5 8.5L12 0Z" />
    </svg>
  )
})
