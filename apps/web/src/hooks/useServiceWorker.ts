import { useEffect, useState } from "react"
import { Workbox } from "workbox-window"

interface ServiceWorkerReturn {
  isOffline: boolean
  updateAvailable: boolean
  updateServiceWorker: () => Promise<void>
  skipWaiting: () => void
}

export function useServiceWorker(): ServiceWorkerReturn {
  const [isOffline, setIsOffline] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      const wb = new Workbox("/sw.js", { type: "classic" })

      wb.addEventListener("controlling", (event) => {
        if (event.isUpdate) {
          window.location.reload()
        }
      })

      wb.addEventListener("waiting", () => {
        setUpdateAvailable(true)
      })

      wb.register()
        .then((reg) => {
          if (reg) {
            setRegistration(reg)
            console.log("Service worker registered:", reg)
          }
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error)
        })

      return () => {
        wb.addEventListener("controlling", () => {
          window.location.reload()
        })
      }
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const updateServiceWorker = async () => {
    if (!registration) return

    try {
      await registration.update()
      const newWorker = registration.waiting
      if (newWorker) {
        newWorker.postMessage({ type: "SKIP_WAITING" })
      }
    } catch (error) {
      console.error("Failed to update service worker:", error)
    }
  }

  const skipWaiting = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
    }
  }

  return {
    isOffline,
    updateAvailable,
    updateServiceWorker,
    skipWaiting,
  }
}
