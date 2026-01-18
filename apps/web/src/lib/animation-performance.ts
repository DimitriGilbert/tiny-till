import * as React from 'react'

export function useAnimationFrame(callback: () => void, enabled: boolean = true) {
  const requestRef = React.useRef<number | undefined>(undefined)
  const previousTimeRef = React.useRef<number | undefined>(undefined)

  const animate = React.useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      callback()
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }, [callback])

  React.useEffect(() => {
    if (enabled) {
      requestRef.current = requestAnimationFrame(animate)
      return () => {
        if (requestRef.current !== undefined) {
          cancelAnimationFrame(requestRef.current)
        }
      }
    }
  }, [enabled, animate])
}

export function measureAnimationPerformance(animationName: string) {
  const startTime = performance.now()
  
  return {
    end: () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      if (duration > 16.67) {
        console.warn(`[Animation] ${animationName} took ${duration.toFixed(2)}ms (exceeded 16.67ms frame budget)`)
      }
      return duration
    },
  }
}

export function getReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export interface AnimationConfig {
  duration: number
  easing: string
  useGPU: boolean
  reducedMotionFallback: boolean
}

export function optimizeAnimationForDevice(): AnimationConfig {
  const prefersReducedMotion = getReducedMotionPreference()
  
  if (prefersReducedMotion) {
    return {
      duration: 0,
      easing: 'linear',
      useGPU: false,
      reducedMotionFallback: true,
    }
  }

  const isLowEndDevice = isLowPerformanceDevice()
  
  return {
    duration: isLowEndDevice ? 150 : 200,
    easing: isLowEndDevice ? 'ease-out' : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    useGPU: !isLowEndDevice,
    reducedMotionFallback: false,
  }
}

function isLowPerformanceDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const connection = (navigator as any).connection
  if (connection) {
    return connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
  }

  const cores = navigator.hardwareConcurrency
  if (cores && cores <= 2) {
    return true
  }

  return false
}

export function useAnimationPerformance() {
  const [fps, setFps] = React.useState<number | null>(null)
  const frameCountRef = React.useRef(0)
  const lastTimeRef = React.useRef<number>(performance.now())

  const measureFrame = React.useCallback(() => {
    frameCountRef.current++
    const now = performance.now()
    const delta = now - lastTimeRef.current

    if (delta >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / delta))
      frameCountRef.current = 0
      lastTimeRef.current = now
    }

    requestAnimationFrame(measureFrame)
  }, [])

  React.useEffect(() => {
    const raf = requestAnimationFrame(measureFrame)
    return () => cancelAnimationFrame(raf)
  }, [measureFrame])

  return { fps }
}

export function useAnimationState(enabled: boolean = true) {
  const [isAnimating, setIsAnimating] = React.useState(false)
  const animationRef = React.useRef<number | undefined>(undefined)

  const startAnimation = React.useCallback((duration: number) => {
    setIsAnimating(true)
    animationRef.current = window.setTimeout(() => {
      setIsAnimating(false)
    }, duration)
  }, [])

  const stopAnimation = React.useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      setIsAnimating(false)
    }
  }, [])

  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  return {
    isAnimating,
    startAnimation,
    stopAnimation,
    enabled: enabled && !getReducedMotionPreference(),
  }
}
