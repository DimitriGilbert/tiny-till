import { ArrowRight, BookOpen, Bug, Lightbulb, MessageSquare } from 'lucide-react'
import * as React from 'react'
import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

export interface HelpCenterTriggerProps {
  className?: string
  unreadCount?: number
}

export function HelpCenterTrigger({ className, unreadCount = 0 }: HelpCenterTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPulsing, setIsPulsing] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsPulsing(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const quickActions = [
    {
      icon: BookOpen,
      label: 'Browse Help',
      href: '/docs',
      color: 'from-pink-500 to-purple-500',
    },
    {
      icon: Bug,
      label: 'Report Bug',
      href: '/feedback?type=bug',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Lightbulb,
      label: 'Feature Request',
      href: '/feedback?type=feature',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageSquare,
      label: 'Contact Support',
      href: '/feedback?type=support',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2', className)}>
      {isOpen && (
        <div className="flex flex-col items-end gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              to={action.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg',
                'bg-white dark:bg-gray-800',
                'border-2 border-gray-200 dark:border-gray-700',
                'hover:scale-105 transition-all duration-200',
                'animate-in slide-in-from-bottom-2 fade-in',
                `delay-${index * 50}`
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both',
              }}
            >
              <div
                className={cn(
                  'p-2 rounded-lg',
                  'bg-gradient-to-br',
                  action.color
                )}
              >
                <action.icon className="size-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Help Center"
        aria-expanded={isOpen}
        className={cn(
          'relative size-14 rounded-full shadow-2xl',
          'flex items-center justify-center',
          'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500',
          'hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/50',
          'transition-all duration-300',
          'hover:scale-110 active:scale-95',
          isPulsing && 'animate-pulse-glow'
        )}
      >
        {isPulsing && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-ping opacity-75" />
        )}

        <div className="relative flex items-center justify-center size-full">
          <svg
            className="size-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <title>Help</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center size-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount}
              </div>
            </span>
          )}

          {isOpen && (
            <div className="absolute inset-0 bg-white/20 rounded-full animate-spin" />
          )}
        </div>
      </button>
    </div>
  )
}
