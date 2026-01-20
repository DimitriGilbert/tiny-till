import * as React from 'react'
import { cn } from '@/lib/utils'

interface FloatingHeartProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  delay?: number
  duration?: number
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

export const FloatingHeart = React.memo(function FloatingHeart({
  className,
  size = 'md',
  delay = 0,
  duration = 3,
}: FloatingHeartProps) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <svg
      className={cn(
        'absolute animate-float-gentle text-primary',
        sizeMap[size],
        visible ? 'opacity-50' : 'opacity-0',
        'transition-opacity duration-500',
        className
      )}
      style={{
        animationDuration: `${duration}s`,
      }}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
})
