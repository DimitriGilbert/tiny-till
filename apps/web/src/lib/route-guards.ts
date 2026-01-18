import { useCallback, useState } from "react"
import { useNavigate, useLocation } from "@tanstack/react-router"
import type { NavigateOptions } from "@tanstack/react-router"

interface NavigationGuardReturn {
  isModalOpen: boolean
  navigateWithCheck: (to: string, options?: NavigateOptions) => void
  handleConfirm: () => void
  handleCancel: () => void
}

export function useTallyNavigationGuard(
  hasActiveTally: () => boolean,
  clearTally: () => void
): NavigationGuardReturn {
  const navigate = useNavigate()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<{
    to: string
    options?: NavigateOptions
  } | null>(null)

  const navigateWithCheck = useCallback(
    (to: string, options?: NavigateOptions) => {
      if (location.pathname === "/" && hasActiveTally()) {
        setPendingNavigation({ to, options })
        setIsModalOpen(true)
        return
      }
      navigate({ to: to as never, ...options })
    },
    [navigate, location.pathname, hasActiveTally]
  )

  const handleConfirm = useCallback(() => {
    clearTally()
    setIsModalOpen(false)
    if (pendingNavigation) {
      navigate({ to: pendingNavigation.to as never, ...pendingNavigation.options })
      setPendingNavigation(null)
    }
  }, [clearTally, navigate, pendingNavigation])

  const handleCancel = useCallback(() => {
    setIsModalOpen(false)
    setPendingNavigation(null)
  }, [])

  return {
    isModalOpen,
    navigateWithCheck,
    handleConfirm,
    handleCancel,
  }
}
