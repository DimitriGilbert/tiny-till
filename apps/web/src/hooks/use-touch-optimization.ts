import * as React from 'react'

export function useTouchOptimization() {
  const isTouch = React.useMemo(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])

  const isCoarsePointer = React.useMemo(() => {
    return window.matchMedia('(pointer: coarse)').matches
  }, [])

  return {
    isTouch,
    isCoarsePointer,
    minTouchSize: isCoarsePointer ? 48 : 44,
    longPressDelay: isTouch ? 400 : 500,
  }
}
