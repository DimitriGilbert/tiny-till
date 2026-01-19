import * as React from 'react'
import { cn } from '@/lib/utils'

export interface OnboardingSpotlightProps {
  targetSelector?: string
  isActive: boolean
}

export function OnboardingSpotlight({ targetSelector, isActive }: OnboardingSpotlightProps) {
  const spotlightRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<React.CSSProperties>({})

  const updatePosition = React.useCallback(() => {
    if (!targetSelector || !isActive) {
      setPosition({})
      return
    }

    const targetElement = document.querySelector(targetSelector)
    if (!targetElement) {
      setPosition({})
      return
    }

    const rect = targetElement.getBoundingClientRect()
    const padding = 8

    setPosition({
      left: rect.left - padding,
      top: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    })
  }, [targetSelector, isActive])

  React.useEffect(() => {
    if (!isActive) return

    updatePosition()

    const handleResize = () => {
      requestAnimationFrame(updatePosition)
    }

    const handleScroll = () => {
      requestAnimationFrame(updatePosition)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isActive, updatePosition])

  if (!isActive || !targetSelector) return null

  const hasPosition = Object.keys(position).length > 0

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          isActive && hasPosition ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />
      {hasPosition && (
        <div
          ref={spotlightRef}
          className={cn(
            'fixed z-40 rounded-lg shadow-2xl transition-all duration-300 ease-out',
            isActive ? 'opacity-100' : 'opacity-0'
          )}
          style={position}
        >
          <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg" />
        </div>
      )}
    </>
  )
}
