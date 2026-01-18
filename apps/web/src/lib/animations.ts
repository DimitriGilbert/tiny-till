import { cn } from '@/lib/utils'

export const animationDurations = {
  shake: 300,
  pulse: 300,
  fade: 200,
  slide: 250,
} as const

export const animationEasings = {
  shake: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
  pulse: 'ease-out',
  fade: 'ease-in-out',
  slide: 'ease-out',
} as const

export const animationClasses = {
  shake: 'animate-shake',
  pulse: 'animate-pulse-once',
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
} as const

export function useAnimationClass(hasReducedMotion: boolean = false): (animationClass: string) => string {
  return (animationClass: string) => {
    if (hasReducedMotion) {
      return ''
    }
    return animationClass
  }
}

export function getShakeAnimation(intensity: 'light' | 'medium' | 'strong' = 'medium'): string {
  const intensities = {
    light: '4px',
    medium: '8px',
    strong: '12px',
  }
  return `translateX(-${intensities[intensity]})`
}

export function getPulseAnimationState(isPulsing: boolean): string {
  if (isPulsing) {
    return animationClasses.pulse
  }
  return ''
}

export function getErrorStateClasses(hasError: boolean, isValid: boolean): string {
  if (hasError) {
    return cn(
      'border-destructive focus:ring-destructive',
      'transition-colors duration-200'
    )
  }
  if (isValid) {
    return cn(
      'border-green-500 focus:ring-green-500',
      'transition-colors duration-200'
    )
  }
  return cn(
    'border-input focus:ring-ring',
    'transition-colors duration-200'
  )
}

export function getValidationTransitionClasses(): string {
  return 'transition-all duration-200 ease-out'
}
