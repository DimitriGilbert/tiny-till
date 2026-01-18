import * as React from 'react'

import { cn } from '@/lib/utils'

export interface RippleProps {
  x: number
  y: number
  size?: number
  className?: string
}

export function RippleEffect({ x, y, size = 100, className }: RippleProps) {
  return (
    <span
      className={cn(
        'absolute rounded-full bg-current opacity-30 pointer-events-none animate-ripple',
        className
      )}
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
      aria-hidden="true"
    />
  )
}

export function useRipple() {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const idRef = React.useRef(0)

  const addRipple = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const size = Math.max(rect.width, rect.height) * 2

    const id = idRef.current++
    setRipples((prev) => [...prev, { id, x, y, size }])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 500)
  }, [])

  return { ripples, addRipple }
}
