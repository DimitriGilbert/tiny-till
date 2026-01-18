import { cn } from '@/lib/utils'

export const focusStyles = cn(
  'outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background'
)

export const focusVisibleStyles = cn(
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background'
)

export const focusRingStyles = cn(
  'ring-offset-background',
  'transition-shadow',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2'
)

export function getFocusVisibleClassName(isFocused: boolean): string {
  return cn(
    'outline-none',
    'transition-shadow',
    isFocused && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
  )
}
