import { HelpCircle, X } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface HelpBubbleProps {
  id: string
  content: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  variant?: 'icon' | 'badge' | 'inline'
  trigger?: 'hover' | 'click' | 'focus'
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
}

const variantStyles = {
  icon: 'size-8 rounded-full border-2',
  badge: 'size-6 rounded-full border-2 text-xs',
  inline: 'px-2 py-1 rounded-md border-2 text-xs',
}

export function HelpBubble({
  id,
  content,
  position = 'top',
  variant = 'icon',
  trigger = 'hover',
  dismissible = true,
  onDismiss,
  className,
}: HelpBubbleProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPulsing, setIsPulsing] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsPulsing(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const triggerEvents = {
    hover: {
      onMouseEnter: () => setIsOpen(true),
      onMouseLeave: () => setIsOpen(false),
      onFocus: () => setIsOpen(true),
      onBlur: () => setIsOpen(false),
    },
    click: {
      onClick: () => setIsOpen(!isOpen),
    },
    focus: {
      onFocus: () => setIsOpen(true),
      onBlur: () => setIsOpen(false),
    },
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    setIsPulsing(false)
    onDismiss?.()
  }

  const bubbleIcon = variant === 'icon' ? (
    <HelpCircle className="size-4" />
  ) : (
    <span className="font-bold">?</span>
  )

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <button
        type="button"
        aria-label="Help"
        aria-describedby={isOpen ? id : undefined}
        className={cn(
          'flex items-center justify-center transition-all duration-300',
          variantStyles[variant],
          'bg-pink-100 text-pink-500 border-pink-300',
          'hover:bg-pink-200 hover:border-pink-400 hover:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2',
          'dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
          'dark:hover:bg-pink-900/50 dark:hover:border-pink-600',
          isPulsing && 'animate-pulse-ring'
        )}
        {...triggerEvents[trigger]}
      >
        {bubbleIcon}
      </button>

      {isOpen && (
        <div
          id={id}
          role="tooltip"
          className={cn(
            'absolute z-50 w-64 p-4 rounded-xl shadow-lg',
            'bg-gradient-to-br from-pink-50 to-purple-50',
            'border-2 border-pink-200',
            'dark:from-pink-950/90 dark:to-purple-950/90 dark:border-pink-800',
            'backdrop-blur-sm',
            'transition-all duration-200',
            'animate-in fade-in-0 zoom-in-95',
            positionStyles[position]
          )}
        >
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors"
              aria-label="Dismiss help"
            >
              <X className="size-4 text-pink-500 dark:text-pink-300" />
            </button>
          )}

          <p className="text-sm text-gray-800 dark:text-gray-200 pr-6">
            {content}
          </p>

          <div className="mt-3 pt-3 border-t border-pink-200/50 dark:border-pink-800/50 flex items-center gap-2">
            <div className="flex-1">
              <span className="text-xs text-pink-500 dark:text-pink-400 font-medium">
                Helpful tip
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-pink-300 dark:bg-pink-700 animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
