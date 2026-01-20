import * as React from 'react'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

const playfulButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 touch-manipulation no-select',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95',
        secondary: 'bg-secondary text-secondary-foreground hover:scale-105 hover:shadow-lg hover:shadow-secondary/30 hover:-translate-y-0.5 active:scale-95',
        'acid-green': 'bg-kawaii-acid-green text-foreground hover:scale-105 hover:shadow-lg hover:shadow-kawaii-acid-green/30 hover:-translate-y-0.5 active:scale-95',
        'acid-yellow': 'bg-kawaii-acid-yellow text-foreground hover:scale-105 hover:shadow-lg hover:shadow-kawaii-acid-yellow/30 hover:-translate-y-0.5 active:scale-95',
        pink: 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95',
        lavender: 'bg-kawaii-lavender text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-kawaii-lavender/30 hover:-translate-y-0.5 active:scale-95',
        mint: 'bg-kawaii-mint text-foreground hover:scale-105 hover:shadow-lg hover:shadow-kawaii-mint/30 hover:-translate-y-0.5 active:scale-95',
        destructive: 'bg-destructive text-destructive-foreground hover:scale-105 hover:shadow-lg hover:shadow-destructive/30 hover:-translate-y-0.5 active:scale-95',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95',
        outline: 'border-2 border-input hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-2xl',
        md: 'h-10 px-4 text-base rounded-2xl',
        lg: 'h-12 px-6 text-lg rounded-2xl',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface PlayfulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof playfulButtonVariants> {
  wiggle?: boolean
}

export const PlayfulButton = React.memo(function PlayfulButton({
  className,
  variant,
  size,
  wiggle,
  children,
  ...props
}: PlayfulButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        playfulButtonVariants({ variant, size }),
        wiggle && 'hover:animate-wiggle-more',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
