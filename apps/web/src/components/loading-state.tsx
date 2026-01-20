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
  message = 'Getting things ready ✨',
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
      <p className="text-muted-foreground text-base mt-6 font-medium">
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
        'h-16 w-16 text-primary',
        'gpu-accelerated',
        className
      )}
      aria-hidden="true"
    />
  )
}

export function LoadingDots({ className }: { className?: string }) {
  const colors = ['bg-primary', 'bg-kawaii-lavender', 'bg-kawaii-acid-green']
  return (
    <div className={cn('flex gap-3', className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'h-5 w-5 rounded-full animate-loading',
            colors[i % colors.length]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-14 w-14 rounded-full bg-gradient-to-br from-primary to-kawaii-lavender animate-shimmer',
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
        'h-3 w-56 rounded-full bg-muted overflow-hidden',
        'gpu-accelerated',
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-primary to-kawaii-acid-green transition-all duration-300 ease-out"
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
        'h-14 w-14 rounded-full bg-gradient-to-br from-primary to-kawaii-lavender animate-shimmer',
        'gpu-accelerated',
        className
      )}
      aria-hidden="true"
    />
  )
}

