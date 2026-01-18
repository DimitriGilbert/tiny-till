import { HeadContent, Outlet, createRootRouteWithContext, useNavigate, useLocation, useRouter } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useEffect } from "react"

import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationConfirmationDialog } from "@/components/navigation-confirmation-dialog"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Toaster } from "@/components/ui/sonner"
import { OfflineBanner, OnlineBanner } from "@/components/offline-banner"
import { StorageWarningAlert } from "@/components/storage-warning-alert"
import { AppErrorBoundary } from "@/components/app-error-boundary"
import { useServiceWorker } from "@/hooks/useServiceWorker"
import { useTallyStore } from "@/stores/tally-store"
import { useTallyNavigationGuard } from "@/lib/route-guards"
import { useStorageStore } from "@/stores/storage-store"

import "../index.css"

export type RouterAppContext = Record<string, unknown>

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "tiny-till",
      },
      {
        name: "description",
        content: "tiny-till is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
})

function RootComponent() {
  const navigate = useNavigate()
  const router = useRouter()
  const location = useLocation()
  const { hasActiveItems, clearTally } = useTallyStore()
  const { isModalOpen, navigateWithCheck, handleConfirm, handleCancel } = useTallyNavigationGuard(
    hasActiveItems,
    clearTally
  )
  const { isOffline } = useServiceWorker()
  const { checkStorage, checkImageSupport } = useStorageStore()

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("has-reloaded")
    if (!hasReloaded) {
      sessionStorage.setItem("has-reloaded", "true")
    } else {
      if (location.pathname !== "/") {
        navigate({ to: "/" })
      }
    }
  }, [navigate, location.pathname])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasActiveItems()) {
        const summary = useTallyStore.getState().getSummary()
        const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.total / 100)

        const message = `You have ${summary.itemCount} item${summary.itemCount !== 1 ? 's' : ''} (${formattedTotal}) in your tally. Are you sure you want to leave? Your changes will be lost.`

        try {
          sessionStorage.setItem('unsaved-tally', JSON.stringify({
            items: Array.from(useTallyStore.getState().items.entries()),
            timestamp: Date.now(),
            itemCount: summary.itemCount,
            total: summary.total,
          }))
        } catch (e) {
          console.error('[BeforeUnload] Failed to save tally:', e)
        }

        event.preventDefault()
        event.returnValue = message
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasActiveItems])

  useEffect(() => {
    checkStorage()
    checkImageSupport()

    const interval = setInterval(() => {
      checkStorage()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [checkStorage, checkImageSupport])

  return (
    <>
      <HeadContent />
      <AppErrorBoundary>
        <ThemeProvider>
          <OfflineBanner isOffline={isOffline} />
          <OnlineBanner isOnline={!isOffline} />
          <StorageWarningAlert />
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header navigateWithCheck={navigateWithCheck} />
            <main id="main-content" className="overflow-auto">
              <Outlet />
            </main>
          </div>
          <Toaster richColors />
          <LoadingOverlay />
          <NavigationConfirmationDialog
            open={isModalOpen}
            onOpenChange={handleCancel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </ThemeProvider>
      </AppErrorBoundary>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  )
}
