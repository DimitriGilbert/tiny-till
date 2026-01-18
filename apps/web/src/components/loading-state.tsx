import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { animationClasses } from '@/lib/animations'
import { cn } from '@/lib/utils'

export type LoadingVariant = 'spinner' | 'dots' | 'shimmer' | 'progress'

export interface LoadingStateProps {
  message?: string
  fullscreen?: boolean
  variant?: LoadingVariant
  progress?: number
  className?: string
}

export function LoadingState({
  message = 'Loading...',
  fullscreen = false,
  variant = 'spinner',
  progress = 0,
  className,
}: LoadingStateProps) {
  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-12'

  return (
    <div
      className={cn(containerClass, className)}
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner variant={variant} progress={progress} />
      <p className="text-muted-foreground text-sm mt-4">
        {message}
      </p>
    </div>
  )
}

export interface LoadingSpinnerProps {
  variant: LoadingVariant
  progress?: number
  className?: string
}

export function LoadingSpinner({ variant, progress = 0, className }: LoadingSpinnerProps) {
  switch (variant) {
    case 'dots':
      return <LoadingDots className={className} />
    case 'shimmer':
      return <ShimmerEffect className={className} />
    case 'progress':
      return <ProgressBar progress={progress} className={className} />
    default:
      return <SpringSpinner className={className} />
  }
}

export function SpringSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn(
        'h-12 w-12 text-primary',
        'gpu-accelerated',
        className
      )}
      aria-hidden="true"
    />
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-2', className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-3 w-3 rounded-full bg-primary animate-loading"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-12 w-12 rounded-full bg-muted animate-shimmer',
        'gpu-accelerated',
        className
      )}
      aria-hidden="true"
    />
  )
}

export interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div
      className={cn(
        'h-2 w-48 rounded-full bg-muted overflow-hidden',
        'gpu-accelerated',
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
          transform: `translateX(${Math.min(Math.max(progress - 100, 0), 0)}%)`,
        }}
      />
    </div>
  )
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-12 w-12 rounded-lg bg-muted animate-shimmer',
        'gpu-accelerated',
        className
      )}
      aria-hidden="true"
    />
  )
}
