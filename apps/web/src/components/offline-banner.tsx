import { useEffect, useState } from "react"
import { Wifi, WifiOff, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface OfflineBannerProps {
  isOffline: boolean
  className?: string
}

export function OfflineBanner({ isOffline, className }: OfflineBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (isOffline && !isDismissed) {
      setIsVisible(true)
    } else if (!isOffline) {
      setIsVisible(false)
      setIsDismissed(false)
    }
  }, [isOffline, isDismissed])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 flex items-center justify-between shadow-lg",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <WifiOff className="h-5 w-5 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">You're offline</span>
          <span className="text-xs opacity-90">Using cached data</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="p-1 hover:bg-amber-600 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface OnlineBannerProps {
  isOnline: boolean
  className?: string
}

export function OnlineBanner({ isOnline, className }: OnlineBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (isOnline && !isDismissed) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else if (!isOnline) {
      setIsVisible(false)
      setIsDismissed(false)
    }
  }, [isOnline, isDismissed])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 flex items-center justify-between shadow-lg",
        className
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <Wifi className="h-5 w-5 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">You're back online</span>
          <span className="text-xs opacity-90">Syncing your changes...</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="p-1 hover:bg-green-600 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
