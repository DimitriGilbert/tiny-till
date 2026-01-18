import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export const animationDurations = {
  shake: 300,
  pulse: 300,
  fade: 200,
  slide: 250,
  spring: 350,
  touch: 150,
} as const

export const animationEasings = {
  shake: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
  pulse: 'ease-out',
  fade: 'ease-in-out',
  slide: 'ease-out',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  touch: 'ease-out',
} as const

export const animationClasses = {
  shake: 'animate-shake',
  pulse: 'animate-pulse-once',
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  springPulse: 'animate-spring-pulse',
  springEnter: 'animate-spring-enter',
  springExit: 'animate-spring-exit',
  highlight: 'animate-highlight',
  ripple: 'animate-ripple',
  loading: 'animate-loading',
  shimmer: 'animate-shimmer',
  successCheck: 'animate-success-check',
} as const

export const springConfig = {
  gentle: { mass: 0.8, stiffness: 150, damping: 15 },
  bouncy: { mass: 1, stiffness: 180, damping: 10 },
  snappy: { mass: 0.6, stiffness: 200, damping: 20 },
} as const

export const animationPresets = {
  touchFeedback: 'transition-transform duration-150 ease-out active:scale-95 hover:scale-105',
  cardActive: 'transition-all duration-300 ease-out',
  modalEnter: 'transition-all duration-350 ease-out',
  buttonPress: 'active:scale-95 transition-transform duration-100',
  hoverLift: 'transition-transform duration-200 ease-out hover:-translate-y-1',
  focusRing: 'transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
} as const

export type SpringIntensity = 'gentle' | 'bouncy' | 'snappy'

export function useAnimationClass(hasReducedMotion: boolean = false): (animationClass: string) => string {
  return (animationClass: string) => {
    if (hasReducedMotion) {
      return ''
    }
    return animationClass
  }
}

export function getSpringClasses(intensity: SpringIntensity = 'gentle'): string {
  const config = springConfig[intensity]
  return `transition-transform duration-${animationDurations.spring}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
}

export function useSpringAnimation(trigger: boolean, intensity: SpringIntensity = 'gentle'): CSSProperties {
  const config = springConfig[intensity]
  return {
    transition: `transform ${animationDurations.spring}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  }
}

export function composeAnimations(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getGPUIgnoredProperties(): string[] {
  return ['width', 'height', 'top', 'left', 'right', 'bottom']
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
    return animationClasses.springPulse
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

export function getGPUAcceleratedClasses(): string {
  return 'will-change:transform,opacity;transform:translateZ(0);backface-visibility:hidden'
}

export function getReducedMotionClasses(): string {
  return '@media (prefers-reduced-motion: reduce) { animation: none !important; transition: none !important; }'
}
