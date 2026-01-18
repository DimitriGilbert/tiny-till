import * as React from 'react'

import { animationClasses } from '@/lib/animations'
import { cn } from '@/lib/utils'

export interface SpringIndicatorProps {
  children: React.ReactNode
  trigger: boolean
  variant?: 'pulse' | 'enter' | 'exit'
  className?: string
}

export const SpringIndicator = React.memo(function SpringIndicator({
  children,
  trigger,
  variant = 'pulse',
  className,
}: SpringIndicatorProps) {
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true)
      const duration = variant === 'pulse' ? 400 : variant === 'enter' ? 350 : 250
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, variant, isAnimating])

  const animationClass = variant === 'pulse' 
    ? animationClasses.springPulse 
    : variant === 'enter' 
      ? animationClasses.springEnter 
      : animationClasses.springExit

  return (
    <div
      className={cn(
        trigger && animationClass,
        'gpu-accelerated',
        className
      )}
    >
      {children}
    </div>
  )
})

export interface HighlightRingProps {
  show: boolean
  className?: string
  color?: string
}

export function HighlightRing({ show, className, color = 'var(--primary)' }: HighlightRingProps) {
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    if (show && !isAnimating) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 600)
      return () => clearTimeout(timer)
    }
  }, [show, isAnimating])

  return (
    <div
      className={cn(
        'absolute inset-0 rounded-none pointer-events-none',
        'transition-all duration-600 ease-out',
        isAnimating && animationClasses.highlight,
        className
      )}
      style={{ 
        '--primary': color,
        opacity: isAnimating ? 1 : 0,
      } as React.CSSProperties}
      aria-hidden="true"
    />
  )
}
