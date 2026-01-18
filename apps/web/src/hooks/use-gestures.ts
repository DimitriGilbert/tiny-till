import * as React from 'react'

interface UseGesturesOptions {
  onLongPress?: (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => void
  onDoubleTap?: (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => void
  longPressDelay?: number
  doubleTapDelay?: number
}

interface UseGesturesReturn {
  isLongPressing: boolean
  shouldPreventClick: boolean
  eventHandlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerLeave: (e: React.PointerEvent) => void
  }
}

export function useGestures({
  onLongPress,
  onDoubleTap,
  longPressDelay = 500,
  doubleTapDelay = 300,
}: UseGesturesOptions): UseGesturesReturn {
  const [isLongPressing, setIsLongPressing] = React.useState(false)
  const [shouldPreventClick, setShouldPreventClick] = React.useState(false)
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTapTimeRef = React.useRef<number>(0)
  const pointerDownRef = React.useRef<boolean>(false)
  const pointerDownTimeRef = React.useRef<number>(0)

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    pointerDownRef.current = true
    pointerDownTimeRef.current = Date.now()
    setShouldPreventClick(false)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true)
      setShouldPreventClick(true)
      onLongPress?.(e)
    }, longPressDelay)
  }, [onLongPress, longPressDelay])

  const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (!pointerDownRef.current) {
      return
    }

    pointerDownRef.current = false
    setIsLongPressing(false)

    const now = Date.now()
    const pressDuration = now - pointerDownTimeRef.current

    if (pressDuration < longPressDelay && now - lastTapTimeRef.current < doubleTapDelay) {
      setShouldPreventClick(true)
      onDoubleTap?.(e)
    }
    lastTapTimeRef.current = now
  }, [onDoubleTap, doubleTapDelay, longPressDelay])

  const handlePointerLeave = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    pointerDownRef.current = false
    setIsLongPressing(false)
  }, [])

  return {
    isLongPressing,
    shouldPreventClick,
    eventHandlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    },
  }
}
