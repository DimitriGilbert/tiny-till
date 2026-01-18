import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  targetId: string
  className?: string
  children?: React.ReactNode
}

export function SkipLink({ targetId, className, children }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'absolute left-4 top-4 z-[9999]',
        '-translate-y-full rounded-md bg-primary px-4 py-2 text-sm font-medium',
        'text-primary-foreground shadow-lg transition-transform',
        'focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'focus:ring-offset-background',
        className
      )}
    >
      {children || 'Skip to main content'}
    </a>
  )
}
